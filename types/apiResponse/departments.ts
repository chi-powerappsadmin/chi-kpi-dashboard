import type { Department } from "../models/Department";
import type { apiResponse } from "./apiResponse";

export interface GetDepartmentsResponse extends apiResponse<Department[]> {}
