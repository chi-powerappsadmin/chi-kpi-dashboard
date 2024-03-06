import type { Priority } from "../models/Priority";
import type { apiResponse } from "./apiResponse";

export interface GetAllPriorities extends apiResponse<Priority[]> {}
