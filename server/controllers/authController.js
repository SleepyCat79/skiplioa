import jwt from "jsonwebtoken";
import { db } from "../config/firebase.js";
import { sendVerificationEmail } from "../services/emailService.js";
import { githubConfig } from "../config/github.js";

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function signToken(userId, email) {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

export async function sendCode(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.collection("verificationCodes").doc(email).set({
      code,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
    });

    await sendVerificationEmail(email, code);
    res.json({ message: "Verification code sent" });
  } catch (err) {
    console.error("sendCode error:", err);
    res.status(500).json({ error: "Failed to send verification code" });
  }
}

export async function signup(req, res) {
  try {
    const { email, verificationCode } = req.body;
    if (!email || !verificationCode) {
      return res
        .status(400)
        .json({ error: "Email and verification code are required" });
    }

    const codeDoc = await db.collection("verificationCodes").doc(email).get();
    if (!codeDoc.exists) {
      return res
        .status(401)
        .json({ error: "No verification code found. Request a new one." });
    }

    const codeData = codeDoc.data();
    if (codeData.code !== verificationCode) {
      return res.status(401).json({ error: "Invalid verification code" });
    }

    if (new Date(codeData.expiresAt) < new Date()) {
      return res.status(401).json({ error: "Verification code expired" });
    }

    const existingUser = await db
      .collection("users")
      .where("email", "==", email)
      .get();
    if (!existingUser.empty) {
      return res
        .status(409)
        .json({ error: "Account already exists. Please sign in." });
    }

    const userRef = db.collection("users").doc();
    const user = {
      id: userRef.id,
      email,
      displayName: "",
      avatarUrl: "",
      githubUsername: "",
      createdAt: new Date().toISOString(),
    };

    await userRef.set(user);
    await db.collection("verificationCodes").doc(email).delete();

    const accessToken = signToken(userRef.id, email);
    res.status(201).json({ accessToken, user });
  } catch (err) {
    console.error("signup error:", err);
    res.status(500).json({ error: "Signup failed" });
  }
}

export async function signin(req, res) {
  try {
    const { email, verificationCode } = req.body;
    if (!email || !verificationCode) {
      return res
        .status(400)
        .json({ error: "Email and verification code are required" });
    }

    const codeDoc = await db.collection("verificationCodes").doc(email).get();
    if (!codeDoc.exists) {
      return res.status(401).json({ error: "No verification code found" });
    }

    const codeData = codeDoc.data();
    if (codeData.code !== verificationCode) {
      return res.status(401).json({ error: "Invalid verification code" });
    }

    if (new Date(codeData.expiresAt) < new Date()) {
      return res.status(401).json({ error: "Verification code expired" });
    }

    const usersSnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .get();
    if (usersSnapshot.empty) {
      return res
        .status(404)
        .json({ error: "Account not found. Please sign up first." });
    }

    const userDoc = usersSnapshot.docs[0];
    const user = userDoc.data();
    await db.collection("verificationCodes").doc(email).delete();

    const accessToken = signToken(userDoc.id, email);
    res.json({ accessToken, user: { ...user, id: userDoc.id } });
  } catch (err) {
    console.error("signin error:", err);
    res.status(500).json({ error: "Sign in failed" });
  }
}

export async function githubCallback(req, res) {
  try {
    const { code } = req.body;
    if (!code) {
      console.error("GitHub callback: Missing authorization code");
      return res.status(400).json({ error: "Authorization code required" });
    }

    console.log("GitHub callback: Exchanging code for access token");
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: githubConfig.clientId,
          client_secret: githubConfig.clientSecret,
          code,
        }),
      },
    );

    if (!tokenResponse.ok) {
      console.error(
        "GitHub callback: Token exchange failed",
        tokenResponse.status,
      );
      return res.status(401).json({ error: "GitHub authorization failed" });
    }

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      console.error("GitHub callback: No access token in response", tokenData);
      return res.status(401).json({ error: "GitHub authorization failed" });
    }

    console.log("GitHub callback: Fetching user profile");
    const userResponse = await fetch("https://api.github.com/user", {
      headers: { Authorization: `token ${tokenData.access_token}` },
    });

    if (!userResponse.ok) {
      console.error(
        "GitHub callback: Failed to fetch user",
        userResponse.status,
      );
      return res.status(401).json({ error: "Failed to fetch GitHub user" });
    }

    const ghUser = await userResponse.json();

    let primaryEmail = ghUser.email || `${ghUser.login}@github.com`;
    try {
      const emailsResponse = await fetch("https://api.github.com/user/emails", {
        headers: { Authorization: `token ${tokenData.access_token}` },
      });
      const emailsData = await emailsResponse.json();
      if (Array.isArray(emailsData)) {
        const found = emailsData.find((e) => e.primary);
        if (found?.email) primaryEmail = found.email;
      }
    } catch {
      // fallback to ghUser.email
    }

    let userDoc;
    const existingUsers = await db
      .collection("users")
      .where("email", "==", primaryEmail)
      .get();

    if (existingUsers.empty) {
      const userRef = db.collection("users").doc();
      const newUser = {
        id: userRef.id,
        email: primaryEmail,
        displayName: ghUser.name || ghUser.login,
        avatarUrl: ghUser.avatar_url || "",
        githubUsername: ghUser.login,
        createdAt: new Date().toISOString(),
      };
      await userRef.set(newUser);
      userDoc = { id: userRef.id, ...newUser };
    } else {
      const doc = existingUsers.docs[0];
      await doc.ref.update({
        githubUsername: ghUser.login,
        avatarUrl: ghUser.avatar_url || doc.data().avatarUrl,
        displayName: doc.data().displayName || ghUser.name || ghUser.login,
      });
      userDoc = { id: doc.id, ...doc.data(), githubUsername: ghUser.login };
    }

    const accessToken = signToken(userDoc.id, primaryEmail);
    res.json({ accessToken, user: userDoc });
  } catch (err) {
    console.error("githubCallback error:", err);
    res.status(500).json({ error: "GitHub login failed" });
  }
}

export async function getMe(req, res) {
  try {
    const userDoc = await db.collection("users").doc(req.user.userId).get();
    if (!userDoc.exists)
      return res.status(404).json({ error: "User not found" });
    res.json({ id: userDoc.id, ...userDoc.data() });
  } catch (err) {
    console.error("getMe error:", err);
    res.status(500).json({ error: "Failed to get profile" });
  }
}
