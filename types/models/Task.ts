import type { Contributor, Objective, Status } from "./Objective";

export interface Task {
	id: string;
	subject: string;
	description: string;
	target: number;
	actual: number;
	startDate: string;
	endDate: string;
	objective: Pick<Objective, "id" | "name">;
	activityStatus: Status;
	statusReason: Status;
	priority: Status;
	contributors: Contributor[];
	canEdit: boolean;
	canEditAll: boolean;
	owningEmployee: {
		id: string;
		name: string;
	};
	createdOn: string;
	completionDate: string;
	permissions: {
		canUpdate: boolean;
		canUpdateAll: boolean;
		canDelete: boolean;
	}
}
