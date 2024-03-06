import type { apiResponse } from "./apiResponse";

export type GetEmployeeBoardResponse = apiResponse<
	[
		{
			employeeName: string;
			team: string;
			totalProgressScore: number;
			totalTargetScore: number;
			totalActualScore: number;
			totalWeightScore: number;
			totalCount: number;
			performance: {
				status: "InProgress" | "NotStarted" | "Completed" | "Delayed" | "Overdue";
				progressScore: number;
				targetScore: number;
				actualScore: number;
				weightScore: number;
				count: number;
			}[];
		},
	]
>;

export type GetTeamManagerDashboardData = apiResponse<
	[
		{
			employeeName: string;
			team: string;
			totalProgressScore: number;
			totalTargetScore: number;
			totalActualScore: number;
			totalWeightScore: number;
			totalCount: number;
			performance: {
				status: "InProgress" | "NotStarted" | "Completed" | "Delayed" | "Overdue";
				progressScore: number;
				targetScore: number;
				actualScore: number;
				weightScore: number;
				count: number;
			}[];
		},
	]
>;

export interface DashboardPerformanceData {
	actualScore: number;
	count: number;
	progressScore: number;
	status: "InProgress" | "NotStarted" | "Completed" | "Delayed" | "Overdue";
	targetScore: number;
	weightScore: number;
}

export interface LeadershipData {
	team: string;
	totalActualScore: number;
	totalCount: number;
	totalProgressScore: number;
	totalTargetScore: number;
	totalWeightScore: number;
	performance: DashboardPerformanceData[];
}

export interface LeadershipTableItem {
	completedObjectives: number;
	completedTasks: number;
	employeeName: string;
	percentatgeCompleted: number;
	rank: number;
	team: string;
	totalObjectives: number;
	totalTasks: number;
}

export interface MissionStatementData {
	id:string;
	missionStatement: string;
	period: {
		id: string;
		name: string;
	},
	owner: {
		id: string;
		name: string;
	},
	label: string;
}

export interface GetLeadershipDashboardChartData extends apiResponse<LeadershipData[]> {}

export interface GetLeadershipDashboardTableData extends apiResponse<LeadershipTableItem[]> {}

export interface GetMissionStatementData extends apiResponse<MissionStatementData[]> {}
