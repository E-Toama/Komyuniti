import mongoose from "mongoose";
import { IEvent } from "../types/types";

const eventSchema = new mongoose.Schema<IEvent>({
  name: {
    type: String,
    required: true,
  },
  description: { type: String },
  date: { type: String, required: true },
  invitedUsers: { type: [String], required: true },
  acceptedUsers: { type: [String], required: true },
  locationId: { type: String },
});

export default mongoose.model<IEvent>("Event", eventSchema);