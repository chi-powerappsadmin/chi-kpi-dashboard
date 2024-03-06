import type { AccountInfo } from "@azure/msal-browser";
import type { Employee } from "./Employee";

export interface AuthUser extends AccountInfo {
	userData?: Employee;
	bearerToken?: string;
}
export interface UserInCookie {
	isAuthenticated: boolean;
	user: AccountInfo;
}
