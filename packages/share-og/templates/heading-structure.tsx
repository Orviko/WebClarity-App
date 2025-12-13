import React from "react";
import type { ReactElement } from "react";

interface HeadingStructureShareOGProps {
	websiteUrl: string;
	totalHeadings: number;
	errors: number;
	warnings: number;
	checked: number;
}

export function HeadingStructureShareOGTemplate({
	websiteUrl,
	totalHeadings,
	errors,
	warnings,
	checked,
}: HeadingStructureShareOGProps): ReactElement {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				width: "1200px",
				height: "630px",
				backgroundColor: "#F9F9F9",
				padding: "42px 56px",
				fontFamily: "Inter, sans-serif",
				position: "relative",
			}}
		>
			{/* Header Section */}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					marginBottom: "50px",
				}}
			>
				<h1
					style={{
						fontSize: "64px",
						fontWeight: "700",
						color: "#0A0A0A",
						margin: "0 0 16px 0",
						letterSpacing: "-0.03em",
						lineHeight: "1.1",
					}}
				>
					Heading Structure Report
				</h1>
				<p
					style={{
						fontSize: "28px",
						fontWeight: "400",
						color: "#EA580D",
						margin: 0,
						letterSpacing: "-0.01em",
					}}
				>
					{websiteUrl}
				</p>
			</div>

			{/* Stats Grid */}
			<div
				style={{
					display: "flex",
					gap: "24px",
					marginTop: "auto",
					marginBottom: "80px",
				}}
			>
				{/* Total Card */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						backgroundColor: "#FFFFFF",
						borderRadius: "16px",
						padding: "32px",
						flex: 1,
						border: "1px solid #E4E4E7",
						boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
					}}
				>
					<span
						style={{
							fontSize: "22px",
							fontWeight: "500",
							color: "#71717A",
							marginBottom: "12px",
							letterSpacing: "-0.01em",
						}}
					>
						Total Headings
					</span>
					<span
						style={{
							fontSize: "101px",
							fontWeight: "700",
							color: "#18181B",
							letterSpacing: "-0.02em",
							lineHeight: "1",
						}}
					>
						{totalHeadings}
					</span>
				</div>

				{/* Errors Card */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						backgroundColor: "#FFFFFF",
						borderRadius: "16px",
						padding: "32px",
						flex: 1,
						border: "1px solid #FEE2E2",
						boxShadow: "0 1px 3px 0 rgba(239, 68, 68, 0.08)",
					}}
				>
					<span
						style={{
							fontSize: "22px",
							fontWeight: "500",
							color: "#DC2626",
							marginBottom: "12px",
							letterSpacing: "-0.01em",
						}}
					>
						Critical Issues
					</span>
					<span
						style={{
							fontSize: "101px",
							fontWeight: "700",
							color: "#DC2626",
							letterSpacing: "-0.02em",
							lineHeight: "1",
						}}
					>
						{errors}
					</span>
				</div>

				{/* Warnings Card */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						backgroundColor: "#FFFFFF",
						borderRadius: "16px",
						padding: "32px",
						flex: 1,
						border: "1px solid #FED7AA",
						boxShadow: "0 1px 3px 0 rgba(249, 115, 22, 0.08)",
					}}
				>
					<span
						style={{
							fontSize: "22px",
							fontWeight: "500",
							color: "#EA580C",
							marginBottom: "12px",
							letterSpacing: "-0.01em",
						}}
					>
						Warnings
					</span>
					<span
						style={{
							fontSize: "101px",
							fontWeight: "700",
							color: "#EA580C",
							letterSpacing: "-0.02em",
							lineHeight: "1",
						}}
					>
						{warnings}
					</span>
				</div>

				{/* Checked Card */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						backgroundColor: "#FFFFFF",
						borderRadius: "16px",
						padding: "32px",
						flex: 1,
						border: "1px solid #D1FAE5",
						boxShadow: "0 1px 3px 0 rgba(34, 197, 94, 0.08)",
					}}
				>
					<span
						style={{
							fontSize: "22px",
							fontWeight: "500",
							color: "#16A34A",
							marginBottom: "12px",
							letterSpacing: "-0.01em",
						}}
					>
						No Issues
					</span>
					<span
						style={{
							fontSize: "101px",
							fontWeight: "700",
							color: "#16A34A",
							letterSpacing: "-0.02em",
							lineHeight: "1",
						}}
					>
						{checked}
					</span>
				</div>
			</div>

			{/* Footer - Bottom Right */}
			<div
				style={{
					position: "absolute",
					bottom: "42px",
					right: "56px",
					display: "flex",
					alignItems: "center",
					gap: "8px",
					backgroundColor: "#EA580D",
					padding: "8px 16px",
					borderRadius: "12px",
				}}
			>
				<span
					style={{
						fontSize: "18px",
						fontWeight: "400",
						color: "#FFFFFF",
						letterSpacing: "-0.01em",
					}}
				>
					Created with
				</span>
				<span
					style={{
						fontSize: "18px",
						fontWeight: "700",
						color: "#FFFFFF",
						letterSpacing: "-0.01em",
					}}
				>
					webclarity.ai
				</span>
			</div>
		</div>
	);
}
