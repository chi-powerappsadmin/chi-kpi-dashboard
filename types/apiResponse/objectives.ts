import type { Objective, ObjectiveMeasurement } from "../models/Objective";
import type { apiResponse } from "./apiResponse";

export interface GetPerformanceObjectives extends apiResponse<Objective[]> {}
export interface GetPerformanceObjectiveByIdResponse extends apiResponse<Objective> {}
export interface GetObjectiveMeasurementTypesResponse extends apiResponse<ObjectiveMeasurement[]> {}
export type CreateNewObjectiveResponse = apiResponse<string>;
