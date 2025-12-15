import { listWorkspaceShares } from "./procedures/list-workspace-shares";
import { getShareDetails } from "./procedures/get-share-details";
import { updateShareTitle } from "./procedures/update-share-title";
import { deleteShare } from "./procedures/delete-share";
import { renewShare } from "./procedures/renew-share";
import { checkShareLimitProcedure } from "./procedures/check-share-limit";
import { searchShares } from "./procedures/search-shares";

export const sharesRouter = {
	listWorkspaceShares,
	getShareDetails,
	updateShareTitle,
	deleteShare,
	renewShare,
	checkShareLimit: checkShareLimitProcedure,
	searchShares,
};
