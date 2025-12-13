import React from "react";
import type { ReactElement } from "react";

interface StyleGuideShareOGProps {
	websiteUrl: string;
	topColors: Array<{ hex: string; usageCount: number }>; // Top 3 colors with usage
	primaryFont: string;
	fontUsageCount?: number;
}

export function StyleGuideShareOGTemplate({
	websiteUrl,
	topColors,
	primaryFont,
	fontUsageCount = 0,
}: StyleGuideShareOGProps): ReactElement {
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
					Style Guide Report
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

			{/* Content Section */}
			<div
				style={{
					display: "flex",
					gap: "32px",
					marginTop: "auto",
					marginBottom: "80px",
					alignItems: "stretch",
				}}
			>
				{/* Typography Card */}
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
						minWidth: 0,
						overflow: "hidden",
					}}
				>
					<span
						style={{
							fontSize: "18px",
							fontWeight: "500",
							color: "#71717A",
							marginBottom: "20px",
							letterSpacing: "-0.01em",
							textTransform: "uppercase",
						}}
					>
						Primary Font
					</span>
					<span
						style={{
							fontSize: "56px",
							fontWeight: "700",
							color: "#18181B",
							letterSpacing: "-0.02em",
							lineHeight: "1.2",
							marginBottom: "8px",
							display: "-webkit-box",
							WebkitLineClamp: 2,
							WebkitBoxOrient: "vertical",
							overflow: "hidden",
							textOverflow: "ellipsis",
						}}
					>
						{primaryFont}
					</span>
					<span
						style={{
							fontSize: "20px",
							fontWeight: "500",
							color: "#71717A",
							letterSpacing: "-0.01em",
						}}
					>
						Used {fontUsageCount} times
					</span>
				</div>

				{/* Colors Card */}
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
							fontSize: "18px",
							fontWeight: "500",
							color: "#71717A",
							marginBottom: "20px",
							letterSpacing: "-0.01em",
							textTransform: "uppercase",
						}}
					>
						Top Colors
					</span>
					<div
						style={{
							display: "flex",
							flexDirection: "row",
							gap: "20px",
						}}
					>
						{topColors.slice(0, 3).map((colorData, index) => (
							<div
								key={index}
								style={{
									display: "flex",
									flexDirection: "column",
									gap: "10px",
									flex: 1,
								}}
							>
								<div
									style={{
										width: "100%",
										height: "48px",
										backgroundColor: colorData.hex,
										borderRadius: "12px",
										border: "1px solid #E4E4E7",
										boxShadow:
											"0 1px 3px 0 rgba(0, 0, 0, 0.05)",
									}}
								/>
								<div
									style={{
										display: "flex",
										flexDirection: "column",
										gap: "4px",
									}}
								>
									<span
										style={{
											fontSize: "20px",
											fontWeight: "600",
											color: "#18181B",
											fontFamily: "monospace",
											letterSpacing: "-0.01em",
											lineHeight: "1",
										}}
									>
										{colorData.hex.toUpperCase()}
									</span>
									<span
										style={{
											fontSize: "16px",
											fontWeight: "500",
											color: "#71717A",
											letterSpacing: "-0.01em",
										}}
									>
										{colorData.usageCount} times
									</span>
								</div>
							</div>
						))}
					</div>
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
