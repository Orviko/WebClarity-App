import { ORPCError } from "@orpc/server";
import { domainConfig } from "@repo/config/domains";
import { getOrganizationById } from "@repo/database";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../organizations/lib/membership";
import { checkPlanLimit } from "../../organizations/lib/plan-limits";
import { getCustomDomainStatusSchema } from "../schema";
import { VercelDomainService } from "../services/vercel-domain.service";

export const getCustomDomainStatus = protectedProcedure
	.route({
		method: "GET",
		path: "/domains/status",
		tags: ["Domains"],
		summary: "Get custom domain status",
		description: "Get the current custom domain configuration and status",
	})
	.input(getCustomDomainStatusSchema)
	.handler(async ({ context: { user }, input: { organizationId } }) => {
		// Verify organization exists
		const organization = await getOrganizationById(organizationId);

		if (!organization) {
			throw new ORPCError("BAD_REQUEST");
		}

		// Verify user is member
		const membership = await verifyOrganizationMembership(
			organizationId,
			user.id,
		);

		if (!membership) {
			throw new ORPCError("FORBIDDEN");
		}

		// Check plan access
		const hasAccess = await checkPlanLimit(organizationId, "customDomain");

		if (!organization.customDomain) {
			return {
				domain: null,
				enabled: false,
				verified: false,
				hasAccess,
				cnameTarget: domainConfig.cnameTarget,
			};
		}

		// Get verification status from Vercel
		let verified = false;
		let configuration = null;

		if (organization.customDomain) {
			const vercelService = new VercelDomainService({
				projectId: process.env.VERCEL_PROJECT_ID || "",
				authToken: process.env.VERCEL_AUTH_TOKEN || "",
				teamId: process.env.VERCEL_TEAM_ID,
			});

			try {
				const verification = await vercelService.verifyDomain(
					organization.customDomain,
				);
				verified = verification.verified;

				const config = await vercelService.checkConfiguration(
					organization.customDomain,
				);
				configuration = {
					configured: config.configured,
					cnameRecord: config.cnameRecord,
					txtRecords: config.txtRecords,
					verification: config.verification,
				};
			} catch (error) {
				// If verification fails, domain is not verified
				verified = false;
			}
		}

		return {
			domain: organization.customDomain,
			enabled: organization.customDomainEnabled,
			verified,
			hasAccess,
			cnameTarget: domainConfig.cnameTarget,
			configuration,
			domainConfiguredAt: organization.domainConfiguredAt,
			domainVerifiedAt: organization.domainVerifiedAt,
		};
	});

