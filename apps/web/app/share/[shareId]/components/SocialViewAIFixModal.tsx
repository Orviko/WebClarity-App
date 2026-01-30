import { SocialViewShareData } from "../share-social-view-page";

interface Props {
	onClose: () => void;
	data: SocialViewShareData;
}

export function SocialViewAIFixModal({ onClose, data }: Props) {
	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
				<h3 className="text-lg font-semibold mb-4">
					AI Fix Coming Soon
				</h3>
				<p className="text-gray-600 mb-4">
					This feature will allow you to automatically generate
					optimized Open Graph and Twitter Card meta tags using AI.
				</p>
				<button
					onClick={onClose}
					className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
				>
					Close
				</button>
			</div>
		</div>
	);
}
