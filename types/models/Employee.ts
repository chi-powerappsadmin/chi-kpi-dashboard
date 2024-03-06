import type { Objective } from "./Objective";

export interface Employee {
	id: string;
	firstName: string;
	lastName: string;
	fullName: string;
	email: string;
	mobilePhone: string;
	isAdmin: boolean;
	userType: {
		value: number;
		name: "Team Member" | "Team Manager" | "Admin";
	};
	department: {
		id: string;
		name: string;
	};
	manager: {
		id: string;
		name: string;
	};
	objectives: Objective[];
}
