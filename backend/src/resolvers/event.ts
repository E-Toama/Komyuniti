import { IEvent, ILocation, IUser } from "../types/types";
import Event from "../models/event";
import Location from "../models/location";
import User from "../models/user";
import mongoose from "mongoose";
import { createLocation, updateLocation } from "./location";

export const resolver = {
  location: async (event: IEvent): Promise<ILocation> => {
    return (await Location.findById(event.locationId)) as ILocation;
  },
  invitedUsers: async (event: IEvent): Promise<IUser[]> => {
    // gather users from db by userIds
    const ids = event.invitedUsers.map((userId: string) => mongoose.Types.ObjectId(userId));
    const users = await User.find({ _id: { $in: ids } });
    return users;
  },
  acceptedUsers: async (event: IEvent): Promise<IUser[]> => {
    // gather users from db by userIds
    const ids = event.invitedUsers.map((userId: string) => mongoose.Types.ObjectId(userId));
    const users = await User.find({ _id: { $in: ids } });
    return users;
  },
};

export async function getEvent(parent, args, context, info): Promise<IEvent> {
  return (await Event.findById(args.id)) as IEvent;
}

export async function getEvents(parent, args, context, info): Promise<IEvent[]> {
  // find by given optional ids
  if (args.ids !== undefined) {
    const ids = args.ids.map((id: string) => mongoose.Types.ObjectId(id));
    return (await Event.find({ _id: { $in: ids } })) as IEvent[];
  } else {
    return (await Event.find()) as IEvent[];
  }
}

export async function createEvent(parent, args, context, info): Promise<IEvent> {
  // args
  const name = args.name;
  const description = args.description ?? null;
  const date = args.date;
  const invitedUsers = args.invitedUsers ?? [];
  const acceptedUsers = args.acceptedUsers ?? [];

  // create location if given in args
  let location: ILocation | null = null;
  if (args.location) {
    try {
      location = await createLocation(args.location);
    } catch (err) {
      throw new Error(err);
    }
  }

  // create and save event
  const event = new Event({
    name,
    description,
    date,
    invitedUsers,
    acceptedUsers,
    locationId: location?.id,
  });
  return event
    .save()
    .then((doc: IEvent) => doc)
    .catch((err) => {
      throw new Error(err);
    });
}

export async function updateEvent(parent, args, context, info): Promise<IEvent | null> {
  const event = (await Event.findById(args.id)) as IEvent;
  // update given args
  if (args.name !== undefined) {
    event.name = args.name;
  }
  if (args.description !== undefined) {
    event.description = args.description;
  }
  if (args.date !== undefined) {
    event.date = args.date;
  }
  if (args.invitedUsers !== undefined) {
    event.invitedUsers = args.invitedUsers;
  }
  if (args.location !== undefined) {
    await updateLocation(event.locationId, args.location);
  }

  return Event.findOneAndUpdate({ _id: args.id }, event)
    .then((doc) => doc)
    .catch((err) => {
      throw new Error(err);
    });
}

export async function deleteEvent(parent, args, context, info): Promise<string> {
  return Event.findByIdAndRemove(args.id)
    .then(() => `Removed event ${args.id}`)
    .catch((err) => {
      throw new Error(err);
    });
}

export async function acceptEventInvitation(parent, args, context, info): Promise<IEvent | null> {
  const event = (await Event.findById(args.id)) as IEvent;

  // check if user is invited
  if (!event.invitedUsers.includes(context.req.user.id)) {
    // not invited, do nothing
    return event;
  }

  const user = context.req.user;
  if (!event.acceptedUsers.includes(user.id)) {
    // remove logged in user from invitation and add to accepted
    event.invitedUsers = event.invitedUsers.filter((userId) => userId !== user.id);

    return Event.findOneAndUpdate({ _id: args.id }, event)
      .then((doc) => doc)
      .catch((err) => {
        throw new Error(err);
      });
  }
  // user already accepted invitation, do nothing
  return event;
}

export async function declineEventInvitation(parent, args, context, info): Promise<IEvent | null> {
  const event = (await Event.findById(args.id)) as IEvent;

  // remove logged in user from invitation
  const user = context.req.user;
  event.invitedUsers = event.invitedUsers.filter((userId) => userId !== user.id);
  event.acceptedUsers = event.acceptedUsers.filter((userId) => userId !== user.id);

  return Event.findOneAndUpdate({ _id: args.id }, event)
    .then((doc) => doc)
    .catch((err) => {
      throw new Error(err);
    });
}