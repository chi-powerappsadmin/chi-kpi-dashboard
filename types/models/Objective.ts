import type { Task } from "~/types/models/Task";

export interface Status {
	value: number;
	name: string;
}

export enum ObjectiveApprovalStatus {
	Draft = 0,
	"Pending Approval" = 10,
	Approved = 20,
	Rejected = 30,
}

export interface OwningEmployee {
	id: string;
	name: null | string;
}
export interface Note {
	id: string;
	subject: string;
	body: string;
	regardingEntity: OwningEmployee;
	modifiedOn: string;
	attachment: {
		fileName: null | string;
		fileData: null | string;
	};
}
export interface Contributor {
	id: string;
	fullName: string;
	email: string;
	phoneNumber: string;
	dateAdded: Date;
}

export interface Permissions {
	canDelete: boolean;
	canUpdate: boolean;
	canApprove: boolean;
	canRevise: boolean;
	canSubmit: boolean;
	canReject: boolean;
	canRecall: boolean;
}
export interface ObjectiveMeasurement {
	value: number;
	name: string;
}

export interface Objective {
	id: string;
	name: string;
	description: string;
	weight: number;
	measurement: ObjectiveMeasurement;
	currency: string;
	target: number;
	actual: null | number;
	progress: null | number | string;
	owningEmployee: OwningEmployee;
	owningManager: OwningEmployee;
	period: {
		id: string;
		name: null | string;
	};
	priority:{
		value: number;
		name: string | null;
	},
	dueDate: null;
	approvalStatus: {
		name: string;
		value: ObjectiveApprovalStatus;
	};
	objectiveStatus: { name: "NotStarted" | "InProgress" | "Completed"; value: number };
	statusReason: Status;
	createdOn: Date;
	permissions: Permissions;
	notes: Note[] | null;
	tasks: Task[] | null;
}
