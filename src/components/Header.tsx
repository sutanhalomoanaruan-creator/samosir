import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Flower2 } from "lucide-react";

import { CartButton } from "@/components/storefront/cart-controls";
import { authClient } from "@/lib/auth-client";
import { getDashboardUserSummary } from "@/lib/server/users";
import BetterAuthHeader from "../integrations/better-auth/header-user.tsx";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
	const { data: session } = authClient.useSession();
	const dashboardAccess = useQuery({
		queryKey: ["navigation", "admin-access"],
		queryFn: () => getDashboardUserSummary(),
		enabled: !!session?.user,
	});

	return (
		<header className="site-header sticky top-0 z-50 border-b border-blue-800 bg-blue-700 px-4 text-white shadow-sm">
			<nav className="page-wrap flex flex-wrap items-center gap-x-4 gap-y-2 py-3 sm:py-4">
				<h2 className="m-0 flex-shrink-0 text-base font-semibold tracking-tight">
					<Link
						to="/"
						className="inline-flex items-center gap-2.5 rounded-full border border-blue-500 bg-blue-700 px-3 py-1.5 text-white no-underline transition hover:bg-blue-600 sm:px-4 sm:py-2"
					>
						<span className="brand-mark">
							<Flower2 size={17} aria-hidden="true" />
						</span>
						<span>
							<span className="block text-sm font-extrabold tracking-[0.12em]">
								KAIN &amp; KEBAYA
							</span>
							<span className="block text-[0.55rem] font-semibold tracking-[0.12em] text-blue-200">
								BUSANA NUSANTARA
							</span>
						</span>
					</Link>
				</h2>

				<div className="order-3 flex w-full flex-wrap items-center gap-x-4 gap-y-1 pb-1 text-sm font-semibold sm:order-none sm:w-auto sm:flex-nowrap sm:pb-0">
					<Link
						to="/"
						activeOptions={{ exact: true }}
						className="nav-link"
						activeProps={{ className: "nav-link is-active" }}
					>
						Beranda
					</Link>
					<Link
						to="/products"
						className="nav-link"
						activeProps={{ className: "nav-link is-active" }}
					>
						Katalog
					</Link>
					{dashboardAccess.data?.canManageUsers && (
						<Link
							to="/dashboard"
							className="nav-link"
							activeProps={{ className: "nav-link is-active" }}
						>
							Dashboard Admin
						</Link>
					)}
				</div>

				<div className="ml-auto flex items-center gap-1.5 sm:gap-2">
					<BetterAuthHeader />
					<CartButton />
					<ThemeToggle />
				</div>
			</nav>
		</header>
	);
}
