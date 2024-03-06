import type { Currency } from "../models/Currency";
import type { apiResponse } from "./apiResponse";

export interface GetAllCurrenciesResponse extends apiResponse<Currency[]> {}
