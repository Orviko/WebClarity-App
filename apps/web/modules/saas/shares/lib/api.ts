import { orpcClient } from "@shared/lib/orpc-client";

export const sharesApi = {
	listWorkspaceShares: async (
		organizationId: string, 
		filter: "all" | "my" = "all",
		type: "all" | "STYLE_GUIDE" | "HEADING_STRUCTURE" = "all"
	) => {
		return orpcClient.shares.listWorkspaceShares({
			organizationId,
			filter,
			type,
		});
	},

	getShareDetails: async (shareId: string) => {
		return orpcClient.shares.getShareDetails({ shareId });
	},

	updateShareTitle: async (shareId: string, title: string) => {
		return orpcClient.shares.updateShareTitle({ shareId, title });
	},

	deleteShare: async (shareId: string) => {
		return orpcClient.shares.deleteShare({ shareId });
	},

	renewShare: async (shareId: string) => {
		return orpcClient.shares.renewShare({ shareId });
	},

	checkShareLimit: async (organizationId: string) => {
		return orpcClient.shares.checkShareLimit({ organizationId });
	},

	searchShares: async (
		organizationId: string,
		query: string,
		type?: "all" | "STYLE_GUIDE" | "HEADING_STRUCTURE",
	) => {
		return orpcClient.shares.searchShares({
			organizationId,
			query,
			type: type ?? "all",
		});
	},
};

