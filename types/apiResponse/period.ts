import type { Objective } from "../models/Objective";
import type { Period } from "../models/Period";
import type { apiResponse } from "./apiResponse";

export interface GetKpiPeriodsResponse extends apiResponse<Period[]> { }

export interface GetSinglePeriodResponse extends apiResponse<Period> { }

export interface GetObjectivesForSpecificPeriodResponse extends apiResponse<Objective[]> { }
