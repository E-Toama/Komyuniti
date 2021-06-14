import { ITaskManagement, IEvent, ITask } from "../types/types";
import TaskManagement from "../models/taskMgmt";
import Task from "../models/task";
import Event from "../models/event";
import mongoose from "mongoose";

export const resolver = {
  event: async (taskMgmt: ITaskManagement): Promise<IEvent> => {
    return (await Event.findById(taskMgmt.eventId)) as IEvent;
  },
  tasks: async (taskMgmt: ITaskManagement): Promise<ITask[]> => {
    // gather tasks from db by taskMgmtId
    const tasks = await Task.find({ taskMgmtId: { $eq: taskMgmt.id } });
    return tasks;
  },
};

export async function getTaskMgmt(parent, args, context, info): Promise<ITaskManagement> {
  // check authorization if user member of event for task mgmt
  const taskMgmt = (await TaskManagement.findById(args.id)) as ITaskManagement;
  const event = (await Event.findById(taskMgmt.eventId)) as IEvent;

  // check authorization
  if (!event.acceptedUsers.includes(context.req?.user?.id)) {
    throw new Error("User is not member of event");
  }

  return taskMgmt;
}

export async function getTaskMgmts(parent, args, context, info): Promise<ITaskManagement[]> {
  // find by given optional ids
  if (args.ids !== undefined) {
    const ids = args.ids.map((id: string) => mongoose.Types.ObjectId(id));
    return (await TaskManagement.find({ _id: { $in: ids } })) as ITaskManagement[];
  } else {
    return (await TaskManagement.find()) as ITaskManagement[];
  }
}

export async function createTaskMgmt(parent, args, context, info): Promise<ITaskManagement> {
  // check authorization
  const event = (await Event.findById(args.eventId)) as IEvent;
  if (!event.acceptedUsers.includes(context.req?.user?.id)) {
    throw new Error("User is not member of event");
  }

  const taskMgmtModel = new TaskManagement({
    eventId: args.eventId,
    createdAt: Date.now(),
  });
  return taskMgmtModel
    .save()
    .then((doc: ITaskManagement) => {
      return doc;
    })
    .catch((err) => {
      throw new Error(err);
    });
}

export async function deleteTaskMgmt(parent, args, context, info): Promise<string> {
  // check authorization
  const event = (await Event.findById(args.eventId)) as IEvent;
  if (!event.admins.includes(context.req?.user?.id)) {
    throw new Error("User is not admin of event");
  }

  // delete task management
  await TaskManagement.findByIdAndRemove(args.id)
    .then(() => `Deleted task management ${args.id}`)
    .catch((err) => {
      throw new Error(err);
    });

  // delete all related tasks
  return Task.remove({ taskMgmtId: { $eq: args.id } })
    .then(() => `Deleted task management ${args.id} and related tasks`)
    .catch((err) => {
      throw new Error(err);
    });
}