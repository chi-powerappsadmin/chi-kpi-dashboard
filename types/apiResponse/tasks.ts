import type { Task } from "../models/Task";
import type { apiResponse } from "./apiResponse";

export interface GetTasksResponse extends apiResponse<Task[]> {}
export interface GetTaskResponse extends apiResponse<Task> {}
export interface CreateTaskResponse extends apiResponse<string> {}
