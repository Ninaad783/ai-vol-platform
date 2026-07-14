require("dotenv").config();
const mongoose = require("mongoose");
const { GoogleGenAI } = require("@google/genai");

// Helper to encode password in MONGO_URI if it contains unencoded special characters
function getSanitizedMongoUri(uri) {
  if (!uri) return uri;
  
  const prefix = "mongodb://";
  if (!uri.startsWith(prefix)) return uri;

  const body = uri.slice(prefix.length);
  const lastAtIdx = body.lastIndexOf("@");
  
  if (lastAtIdx === -1) return uri;

  const credentials = body.slice(0, lastAtIdx);
  const hostsAndOptions = body.slice(lastAtIdx); // Includes the '@' separating credentials from hosts
  
  const colonIdx = credentials.indexOf(":");
  if (colonIdx === -1) return uri;

  const username = credentials.slice(0, colonIdx);
  const password = credentials.slice(colonIdx + 1);

  // Safely URL-encode the username and password
  const encodedUser = encodeURIComponent(decodeURIComponent(username));
  const encodedPass = encodeURIComponent(decodeURIComponent(password));

  return `${prefix}${encodedUser}:${encodedPass}${hostsAndOptions}`;
}

async function runTest() {
  console.log("=== CONNECTION DIAGNOSTIC UTILITY ===");
  console.log("Checking environment configurations...");
  console.log("Loaded MONGO_URI:", process.env.MONGO_URI ? "YES" : "NO");
  console.log("Loaded GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "YES" : "NO");

  // Test 1: MongoDB Connection
  if (process.env.MONGO_URI) {
    try {
      console.log("\n[1/2] Connecting to MongoDB Atlas...");
      const sanitizedUri = getSanitizedMongoUri(process.env.MONGO_URI);
      console.log("Sanitized MONGO_URI:", sanitizedUri.replace(/:([^@]+)@/, ":****@")); // Hide password in logs

      await mongoose.connect(sanitizedUri, { serverSelectionTimeoutMS: 5000 });
      console.log("✅ MongoDB Connected Successfully!");
      await mongoose.disconnect();
    } catch (err) {
      console.error("❌ MongoDB Connection Failed:", err.message);
    }
  } else {
    console.log("\n[1/2] ❌ MongoDB Test Skipped: No MONGO_URI in .env");
  }

  // Test 2: Gemini API Key
  if (process.env.GEMINI_API_KEY) {
    try {
      console.log("\n[2/2] Connecting to Google Gemini API...");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Respond with the word 'OK' only.",
      });
      console.log("✅ Gemini API Verified Successfully!");
      console.log("Response text:", response.text.trim());
    } catch (err) {
      console.error("❌ Gemini API Call Failed:", err.message);
    }
  } else {
    console.log("\n[2/2] ❌ Gemini Test Skipped: No GEMINI_API_KEY in .env");
  }
  console.log("\n=== DIAGNOSTICS COMPLETED ===");
}

runTest().then(() => process.exit(0));
