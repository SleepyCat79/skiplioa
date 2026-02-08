import dotenv from "dotenv";
dotenv.config();

export const githubConfig = {
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  token: process.env.GITHUB_TOKEN,
};
