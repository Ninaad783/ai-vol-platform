const { GoogleGenAI } = require("@google/genai");
const Event = require("../models/Event");

const ai = new GoogleGenAI({});

// Helper for cleaning Gemini output
const cleanJsonOutput = (text) => {
  return text.trim().replace(/^```json|```$/g, "").trim();
};

/**
 * 1. AI Assist Event Details Generator
 * Generates Description, Required Skills, and Things to Bring from the event Title.
 */
const generateEventDetails = async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, error: "Event Title is required" });
  }

  try {
    const prompt = `You are an expert event manager for a volunteer platform.
We are organizing a volunteer event titled: "${title}".
Based on this title, generate:
1. An engaging description (2-3 sentences) detailing the purpose and impact of the event.
2. Required skills (comma-separated list of 3-4 skills, e.g., "Patience, Child Communication, Basic English").
3. Things to bring (comma-separated list of 3-4 items, e.g., "Water bottle, Notebook, Cap").

Return ONLY a raw JSON object with precisely these keys:
{
  "description": "string",
  "requiredSkills": "string",
  "thingsToBring": "string"
}
Do not write any markdown, backticks, or other text.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const cleanedText = cleanJsonOutput(response.text);
    const parsedData = JSON.parse(cleanedText);

    return res.status(200).json({
      success: true,
      description: parsedData.description,
      requiredSkills: parsedData.requiredSkills,
      thingsToBring: parsedData.thingsToBring,
      source: "gemini"
    });

  } catch (error) {
    console.error("Gemini event details generator failed. Using local resilience fallback:", error.message);

    // Local heuristic fallback generator
    const titleLower = title.toLowerCase();
    let description = "";
    let requiredSkills = "";
    let thingsToBring = "";

    if (titleLower.includes("clean") || titleLower.includes("beach") || titleLower.includes("lake") || titleLower.includes("tree") || titleLower.includes("green") || titleLower.includes("nature") || titleLower.includes("garden")) {
      description = `Join our community-driven environmental restoration drive for "${title}". Volunteers will work together to remove litter, plant native saplings, and restore the local ecosystem to promote sustainability and green spaces.`;
      requiredSkills = "Physical Fitness, Teamwork, Environmental Awareness, Basic Gardening";
      thingsToBring = "Water bottle, Protective cap, Gardening gloves, Sports shoes";
    } else if (titleLower.includes("teach") || titleLower.includes("school") || titleLower.includes("child") || titleLower.includes("slum") || titleLower.includes("education") || titleLower.includes("tutor") || titleLower.includes("study")) {
      description = `Empower local youths by volunteering in our education session: "${title}". Volunteers will tutor children in elementary mathematics, English grammar, and coordinate interactive learning activities to boost confidence.`;
      requiredSkills = "Basic Teaching, Patience, Child Communication, Empathy";
      thingsToBring = "Notebook, Pens, Water bottle, Friendly smile";
    } else if (titleLower.includes("food") || titleLower.includes("feed") || titleLower.includes("hunger") || titleLower.includes("soup") || titleLower.includes("meal") || titleLower.includes("ration")) {
      description = `Support families in need in our distribution drive: "${title}". Volunteers will assist in sorting, packaging, and distributing meals or emergency dry rations to underprivileged communities, ensuring food security.`;
      requiredSkills = "Organization, Teamwork, Active Listening, Physical Stamina";
      thingsToBring = "Face mask, Hand sanitizer, Comfortable clothing, Water bottle";
    } else if (titleLower.includes("health") || titleLower.includes("medical") || titleLower.includes("blood") || titleLower.includes("clinic") || titleLower.includes("camp")) {
      description = `Assist healthcare workers and organizers at "${title}". Volunteers will manage registrations, help guide patients through checkups, manage logistics, and distribute basic health leaflets.`;
      requiredSkills = "Organization, Customer Service, Basic First Aid, Empathy";
      thingsToBring = "ID card, Face mask, Pocket diary, Water bottle";
    } else {
      // General fallbacks
      description = `Help make a difference in our upcoming community event: "${title}". Work alongside passionate volunteers to coordinate operations, assist attendees, and support the NGO's mission on site.`;
      requiredSkills = "Teamwork, Effective Communication, Reliability, Quick Learning";
      thingsToBring = "Water bottle, Comfortable shoes, Positive attitude";
    }

    return res.status(200).json({
      success: true,
      description,
      requiredSkills,
      thingsToBring,
      source: "fallback",
      message: "AI quota limits reached. Generated details using offline matching."
    });
  }
};

/**
 * 2. AI Chat Assistant
 * Responds to user queries using the database events as RAG context.
 */
const getChatResponse = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, error: "Message is required" });
  }

  try {
    const events = global.isOfflineMode ? global.mockEvents : await Event.find();
    
    const context = `You are 'VolunBot', the helpful AI Volunteer Assistant for our 'Volunteer Connect' platform.
Here is the live event database context: ${JSON.stringify(events)}.

Respond to the user's question. Use the database context above to suggest specific events, answer scheduling/location questions, or explain what skills are needed. 
Keep your response friendly, encouraging, and under 3-4 sentences.
User asked: "${message}"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: context,
    });

    return res.status(200).json({ reply: response.text, source: "gemini" });
  } catch (error) {
    console.error("Gemini AI chatbot failed, executing local fallback RAG:", error.message);

    // Local smart heuristic response generator (resiliency layer)
    try {
      const events = global.isOfflineMode ? global.mockEvents : await Event.find();
      const msgLower = message.toLowerCase();
      let reply = "";

      if (events.length === 0) {
        reply = "Hi! I'm VolunBot. Currently, we don't have any active volunteer events listed in our database. Please check back later or log in as an administrator to create one!";
      } else if (msgLower.includes("event") || msgLower.includes("list") || msgLower.includes("active") || msgLower.includes("what is there") || msgLower.includes("show")) {
        const list = events.slice(0, 3).map(e => `"${e.title}" (${e.category} in ${e.location})`).join(", ");
        reply = `Hi! I'm VolunBot. We currently have ${events.length} active event(s) including: ${list}. You can view the full details and sign up on the Events page!`;
      } else if (msgLower.includes("clean") || msgLower.includes("environ") || msgLower.includes("nature") || msgLower.includes("green")) {
        const ecoEvents = events.filter(e => e.category === "Environment" || e.title.toLowerCase().includes("clean"));
        if (ecoEvents.length > 0) {
          const list = ecoEvents.map(e => `"${e.title}" at ${e.location}`).join(", ");
          reply = `Yes! We have environmental drives available: ${list}. These events generally require gardening gloves and comfortable shoes. Would you like to check them out?`;
        } else {
          reply = "Currently, we don't have environmental or cleanup events in Pune. Let me know if you would be interested in education or health-related events instead!";
        }
      } else if (msgLower.includes("teach") || msgLower.includes("school") || msgLower.includes("education") || msgLower.includes("child") || msgLower.includes("tutor")) {
        const eduEvents = events.filter(e => e.category === "Education" || e.title.toLowerCase().includes("teach"));
        if (eduEvents.length > 0) {
          const list = eduEvents.map(e => `"${e.title}" at ${e.location}`).join(", ");
          reply = `We have tutoring opportunities available: ${list}. If you have patience and good communication skills, these are perfect for you!`;
        } else {
          reply = "We don't have education drives scheduled at the moment, but check our Events list to see other active campaigns!";
        }
      } else if (msgLower.includes("admin") || msgLower.includes("create") || msgLower.includes("post")) {
        reply = "To create a new volunteer event, switch your role to 'Admin' using the toggle in the Sidebar, then visit the Events page and click '+ Deploy New Event'.";
      } else if (msgLower.includes("skill") || msgLower.includes("profile") || msgLower.includes("match")) {
        reply = "You can view customized, AI-driven event recommendations on the Dashboard! We automatically map your profile skills to event needs using cognitive alignment.";
      } else {
        reply = "Hi there! I'm VolunBot. I can help you search for volunteer events, see what skills you need, or find out how to sign up. What kind of volunteering are you interested in today?";
      }

      return res.status(200).json({ 
        reply: `${reply} (Note: Running in resilient offline mode.)`, 
        source: "fallback" 
      });
    } catch (dbErr) {
      console.error("Local chat fallback database error:", dbErr);
      return res.status(500).json({ error: "Chatbot service database query failed." });
    }
  }
};

module.exports = { 
  getChatResponse, 
  generateEventDetails 
};