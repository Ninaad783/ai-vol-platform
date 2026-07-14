const Event = require("../models/Event");

// 1. Create a New Event
const createEvent = async (req, res) => {
  try {
    if (global.isOfflineMode) {
      const newEvent = { 
        ...req.body, 
        _id: "mock-" + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      global.mockEvents.push(newEvent);
      return res.status(201).json(newEvent);
    }

    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Fetch All Events
const getEvents = async (req, res) => {
  try {
    if (global.isOfflineMode) {
      return res.status(200).json(global.mockEvents);
    }

    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Fetch Event by ID
const getEventById = async (req, res) => {
  try {
    if (global.isOfflineMode) {
      const event = global.mockEvents.find(e => e._id === req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      return res.status(200).json(event);
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Update Event by ID
const updateEvent = async (req, res) => {
  try {
    if (global.isOfflineMode) {
      const index = global.mockEvents.findIndex(e => e._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ message: "Event not found" });
      }
      global.mockEvents[index] = { 
        ...global.mockEvents[index], 
        ...req.body,
        updatedAt: new Date().toISOString()
      };
      return res.status(200).json(global.mockEvents[index]);
    }

    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Delete Event by ID
const deleteEvent = async (req, res) => {
  try {
    if (global.isOfflineMode) {
      const index = global.mockEvents.findIndex(e => e._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ message: "Event not found" });
      }
      global.mockEvents.splice(index, 1);
      return res.status(200).json({ message: "Event deleted successfully" });
    }

    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. Join Event (Vacancy count decrementer)
const joinEvent = async (req, res) => {
  try {
    if (global.isOfflineMode) {
      const event = global.mockEvents.find(e => e._id === req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      if (event.volunteersNeeded <= 0) {
        return res.status(400).json({ message: "This event is completely full! No slots left." });
      }

      event.volunteersNeeded -= 1;
      return res.status(200).json({ message: "Successfully joined the event! 🚀", updatedEvent: event });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.volunteersNeeded <= 0) {
      return res.status(400).json({ message: "This event is completely full! No slots left." });
    }

    event.volunteersNeeded -= 1;
    await event.save();

    res.status(200).json({ message: "Successfully joined the event! 🚀", updatedEvent: event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  joinEvent,
};