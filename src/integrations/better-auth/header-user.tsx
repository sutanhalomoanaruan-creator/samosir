import { Link } from "@tanstack/react-router";
import { authClient } from "#/lib/auth-client";

export default function BetterAuthHeader() {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return <div className="h-8 w-8 animate-pulse rounded-full bg-blue-500" />;
	}

	if (session?.user) {
		return (
			<div className="flex items-center gap-2">
				{session.user.image ? (
					<img src={session.user.image} alt="" className="h-8 w-8" />
				) : (
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
						<span className="text-xs font-medium text-white">
							{session.user.name?.charAt(0).toUpperCase() || "U"}
						</span>
					</div>
				)}
				<button
					type="button"
					onClick={() => {
						void authClient.signOut();
					}}
					className="h-9 rounded-full border border-blue-100 bg-white px-4 text-sm font-semibold text-blue-800 transition-colors hover:bg-blue-50"
				>
					Keluar
				</button>
			</div>
		);
	}

	return (
		<Link
			to="/demo/better-auth"
			className="inline-flex h-9 items-center rounded-full bg-white px-4 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50"
		>
			Masuk
		</Link>
	);
}
