const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    volunteersNeeded: {
      type: Number,
      required: true,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    organizerName: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    thingsToBring: {
      type: String,
      default: "",
    },
    minAge: {
      type: Number,
      default: 0,
    },
    requiredSkills: {
      type: String,
      default: "None",
    },
    perks: {
      type: String,
      default: "",
    },
    createdBy: {
      type: String,
      default: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Event", eventSchema);