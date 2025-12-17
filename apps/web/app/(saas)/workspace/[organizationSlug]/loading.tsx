import { LoadingScreen } from "@shared/components/LoadingScreen";

/**
 * Loading state for /workspace/[organizationSlug] routes
 * Shows while validating organization access and loading workspace data
 */
export default function OrganizationLoading() {
	return <LoadingScreen message="Loading workspace..." fullScreen />;
}
