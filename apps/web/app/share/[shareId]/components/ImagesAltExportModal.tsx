import { ImagesAltShareData } from "../share-images-alt-page";

interface Props {
	onClose: () => void;
	data: ImagesAltShareData;
}

export function ImagesAltExportModal({ onClose, data }: Props) {
	const handleExport = () => {
		const content = JSON.stringify(data, null, 2);
		const blob = new Blob([content], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `images-alt-report-${data.websiteUrl}.json`;
		a.click();
		URL.revokeObjectURL(url);
		onClose();
	};

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
				<h3 className="text-lg font-semibold mb-4">Export Report</h3>
				<p className="text-gray-600 mb-4">
					Download this report as a JSON file for your records.
				</p>
				<div className="flex gap-2">
					<button
						onClick={onClose}
						className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
					>
						Cancel
					</button>
					<button
						onClick={handleExport}
						className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
					>
						Export JSON
					</button>
				</div>
			</div>
		</div>
	);
}
