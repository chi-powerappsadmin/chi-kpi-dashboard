import type { Employee } from "../models/Employee";
import type { apiResponse } from "./apiResponse";

export interface CreateEmployeeResponse extends apiResponse<string> {}
export interface GetEmployeeResponse extends apiResponse<Employee> {}
export interface GetEmployeesResponse extends apiResponse<Employee[]> {}
