import jwt from "jsonwebtoken";
import { db } from "../config/firebase.js";
import { sendVerificationEmail } from "../services/emailService.js";
import { githubConfig } from "../config/github.js";

const generateCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const signToken = (userId, email) =>
  jwt.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: "7d" });

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validateCode = (code) => /^\d{6}$/.test(code);

const verifyAuthCode = async (email, code) => {
  const codeDoc = await db.collection("verificationCodes").doc(email).get();

  if (!codeDoc.exists) {
    return {
      valid: false,
      code: "NO_CODE",
      message: "No verification code found for this email",
    };
  }

  const codeData = codeDoc.data();

  if (new Date(codeData.expiresAt) < new Date()) {
    return {
      valid: false,
      code: "EXPIRED_CODE",
      message: "Verification code has expired",
    };
  }

  if (codeData.code !== code) {
    return {
      valid: false,
      code: "INCORRECT_CODE",
      message: "Incorrect verification code",
    };
  }

  return { valid: true, doc: codeDoc };
};

export async function sendCode(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ code: "MISSING_EMAIL", message: "Email is required" });
    }

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ code: "INVALID_EMAIL", message: "Invalid email format" });
    }

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
    if (err.code === "EAUTH" || err.message?.includes("SMTP")) {
      return res
        .status(500)
        .json({ code: "SMTP_ERROR", message: "Email service unavailable" });
    }
    if (
      err.message?.includes("Firebase") ||
      err.message?.includes("firestore")
    ) {
      return res
        .status(500)
        .json({
          code: "DATABASE_ERROR",
          message: "Database service unavailable",
        });
    }
    res
      .status(500)
      .json({
        code: "SEND_CODE_ERROR",
        message: err.message || "Unable to send verification code",
      });
  }
}

export async function signup(req, res) {
  try {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      return res
        .status(400)
        .json({
          code: "MISSING_FIELDS",
          message: "Email and verification code are required",
        });
    }

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ code: "INVALID_EMAIL", message: "Invalid email format" });
    }

    if (!validateCode(verificationCode)) {
      return res
        .status(400)
        .json({
          code: "INVALID_CODE_FORMAT",
          message: "Verification code must be 6 digits",
        });
    }

    const verification = await verifyAuthCode(email, verificationCode);
    if (!verification.valid) {
      return res
        .status(401)
        .json({ code: verification.code, message: verification.message });
    }

    const existingUser = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();
    if (!existingUser.empty) {
      return res
        .status(409)
        .json({ code: "USER_EXISTS", message: "Account already exists" });
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

    const batch = db.batch();
    batch.set(userRef, user);
    batch.delete(db.collection("verificationCodes").doc(email));
    await batch.commit();

    const accessToken = signToken(userRef.id, email);
    res.status(201).json({ accessToken, user });
  } catch (err) {
    res
      .status(500)
      .json({
        code: "SIGNUP_ERROR",
        message: err.message || "Account creation failed",
      });
  }
}

export async function signin(req, res) {
  try {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      return res
        .status(400)
        .json({
          code: "MISSING_FIELDS",
          message: "Email and verification code are required",
        });
    }

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ code: "INVALID_EMAIL", message: "Invalid email format" });
    }

    if (!validateCode(verificationCode)) {
      return res
        .status(400)
        .json({
          code: "INVALID_CODE_FORMAT",
          message: "Verification code must be 6 digits",
        });
    }

    const usersSnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();
    if (usersSnapshot.empty) {
      return res
        .status(401)
        .json({
          code: "USER_NOT_FOUND",
          message: "No account found with this email",
        });
    }

    const verification = await verifyAuthCode(email, verificationCode);
    if (!verification.valid) {
      return res
        .status(401)
        .json({ code: verification.code, message: verification.message });
    }

    const userDoc = usersSnapshot.docs[0];
    const user = userDoc.data();

    const batch = db.batch();
    batch.delete(db.collection("verificationCodes").doc(email));
    await batch.commit();

    const accessToken = signToken(userDoc.id, email);
    res.json({ accessToken, user: { ...user, id: userDoc.id } });
  } catch (err) {
    res
      .status(500)
      .json({
        code: "SIGNIN_ERROR",
        message: err.message || "Authentication failed",
      });
  }
}

export async function githubCallback(req, res) {
  try {
    const { code } = req.body;
    if (!code) {
      return res
        .status(400)
        .json({ code: "MISSING_CODE", message: "Authorization code required" });
    }

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
      return res
        .status(401)
        .json({
          code: "GITHUB_AUTH_FAILED",
          message: "GitHub authorization failed",
        });
    }

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      return res
        .status(401)
        .json({
          code: "GITHUB_TOKEN_FAILED",
          message: "Failed to obtain GitHub access token",
        });
    }

    const userResponse = await fetch("https://api.github.com/user", {
      headers: { Authorization: `token ${tokenData.access_token}` },
    });

    if (!userResponse.ok) {
      return res
        .status(401)
        .json({
          code: "GITHUB_USER_FAILED",
          message: "Failed to fetch GitHub user data",
        });
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
    } catch {}

    let userDoc;
    const existingUsers = await db
      .collection("users")
      .where("email", "==", primaryEmail)
      .limit(1)
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
    res
      .status(500)
      .json({
        code: "GITHUB_LOGIN_ERROR",
        message: err.message || "GitHub authentication failed",
      });
  }
}

export async function getMe(req, res) {
  try {
    const userDoc = await db.collection("users").doc(req.user.userId).get();
    if (!userDoc.exists) {
      return res
        .status(404)
        .json({ code: "USER_NOT_FOUND", message: "User not found" });
    }
    res.json({ id: userDoc.id, ...userDoc.data() });
  } catch (err) {
    res
      .status(500)
      .json({
        code: "GET_PROFILE_ERROR",
        message: err.message || "Failed to retrieve profile",
      });
  }
}
