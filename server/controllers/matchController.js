const { GoogleGenAI } = require("@google/genai");
const Event = require("../models/Event");

const ai = new GoogleGenAI({});

// In-memory cache map to store matches per volunteer skill set
const cachedMatchesBySkills = new Map();

const getAiMatches = async (req, res) => {
  const skills = req.body.skills || "General Help, Teamwork";
  const normalizedSkills = skills.toLowerCase().trim().replace(/[^a-z0-9, ]/g, "");

  // 1. Check cache for this specific skill profile
  if (cachedMatchesBySkills.has(normalizedSkills)) {
    return res.status(200).json({ success: true, matches: cachedMatchesBySkills.get(normalizedSkills) });
  }

  try {
    const events = global.isOfflineMode ? global.mockEvents : await Event.find();
    if (!events || events.length === 0) {
      return res.status(200).json({ success: true, matches: [] });
    }

    const formattedEvents = events.map(e => ({
      id: e._id,
      title: e.title,
      category: e.category,
      description: e.description,
      requiredSkills: e.requiredSkills
    }));

    const prompt = `You are a Volunteer Recommendation Engine.
Volunteer's skills: "${skills}"
Available events: ${JSON.stringify(formattedEvents)}

Please match the volunteer's skills against the available events.
Return a raw JSON array of objects: [{"eventId": "string", "matchScore": number, "matchReason": "string"}].
Rate each event from 0 to 100 based on how well the volunteer's skills align with the event's requirements (e.g. required skills, title, category, and description).
Provide a clear, brief, professional match reason showing how the skills match (e.g. "Your skill in Public Speaking matches the event's need for a presenter").
Only return the JSON array. Do not include markdown formatting or backticks.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let text = response.text.trim().replace(/^```json|```$/g, "");
    const parsedMatches = JSON.parse(text);

    // Sort by match score descending
    parsedMatches.sort((a, b) => b.matchScore - a.matchScore);

    // Save to cache
    cachedMatchesBySkills.set(normalizedSkills, parsedMatches);

    return res.status(200).json({ success: true, matches: parsedMatches, source: "gemini" });

  } catch (error) {
    console.error("Gemini AI matching failed, initiating fallback matcher:", error.message);
    
    // 2. Local Fallback Matching Engine (Resilience Pattern)
    try {
      const events = global.isOfflineMode ? global.mockEvents : await Event.find();
      if (!events || events.length === 0) {
        return res.status(200).json({ success: true, matches: [] });
      }

      // Tokenize volunteer skills
      const volunteerTokens = skills
        .toLowerCase()
        .split(/[,\s]+/)
        .map(t => t.trim())
        .filter(t => t.length > 2);

      const fallbackMatches = events.map(event => {
        const eventText = `${event.title} ${event.category} ${event.requiredSkills} ${event.description}`.toLowerCase();
        
        // Find intersecting tokens
        const matchingSkills = volunteerTokens.filter(token => eventText.includes(token));
        
        let matchScore = 50; // default baseline score
        let matchReason = `General match: Great opportunity to gain experience in ${event.category} and support the community.`;

        if (matchingSkills.length > 0) {
          // Boost score based on keyword intersections
          matchScore = Math.min(95, 60 + (matchingSkills.length * 10));
          const uniqueMatched = [...new Set(matchingSkills)].map(s => s.charAt(0).toUpperCase() + s.slice(1));
          matchReason = `Direct alignment: Matches your skills in: ${uniqueMatched.join(", ")}.`;
        } else {
          // Category-based heuristics
          const categoryLower = event.category.toLowerCase();
          const hasTeachingSkill = volunteerTokens.some(t => ["teach", "tutor", "child", "speak", "patient"].includes(t));
          const hasGreenSkill = volunteerTokens.some(t => ["plant", "clean", "garden", "outdoor", "physical"].includes(t));
          const hasHealthSkill = volunteerTokens.some(t => ["first aid", "health", "medical", "care", "blood"].includes(t));

          if (categoryLower === "education" && hasTeachingSkill) {
            matchScore = 75;
            matchReason = `Role alignment: Your communication or teaching profile suits educational volunteering.`;
          } else if (categoryLower === "environment" && hasGreenSkill) {
            matchScore = 78;
            matchReason = `Role alignment: Your physical or gardening skills are highly valued for outdoor conservation.`;
          } else if (categoryLower === "healthcare" && hasHealthSkill) {
            matchScore = 80;
            matchReason = `Role alignment: Your care/first-aid background matches our healthcare drive criteria.`;
          } else if (categoryLower === "relief work" && volunteerTokens.some(t => ["team", "organize", "food", "help"].includes(t))) {
            matchScore = 70;
            matchReason = `Role alignment: Your support and teamwork profile fits disaster relief logistics.`;
          }
        }

        return {
          eventId: event._id,
          matchScore,
          matchReason
        };
      });

      // Sort by score
      fallbackMatches.sort((a, b) => b.matchScore - a.matchScore);

      // Cache the fallback matches as well so we are friendly to the server load
      cachedMatchesBySkills.set(normalizedSkills, fallbackMatches);

      return res.status(200).json({ 
        success: true, 
        matches: fallbackMatches, 
        source: "fallback",
        message: "AI service currently offline. Serving local recommendations." 
      });

    } catch (dbErr) {
      console.error("Local fallback matching db query failed:", dbErr);
      return res.status(500).json({ success: false, error: "Database query failed" });
    }
  }
};

module.exports = { getAiMatches };