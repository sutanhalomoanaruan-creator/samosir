import { createServerFn } from "@tanstack/react-start";

import { auth } from "@/lib/auth";
import { SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, db } from "@/lib/db";
import { seedKebayaCatalog } from "@/lib/server/kebaya-catalog";
import { getCurrentSession } from "@/lib/session";

/**
 * Server-only session lookup. Safe to call from TanStack Router `beforeLoad`
 * (which runs on the client during client navigation) because server
 * functions always execute on the server.
 */
export const getServerSession = createServerFn({ method: "GET" }).handler(async () => {
	return getCurrentSession();
});

/**
 * One-time development seed: creates the administrator account (password
 * hashed by Better Auth) and seeds sample products. Idempotent.
 *
 * Called from the client via `useServerFn(seedAdmin)` on the /setup page.
 */
export const seedAdmin = createServerFn({ method: "POST" }).handler(async () => {
	const hasAdmin = db.user.some((u) => {
		const role = db.userRole.find((r) => r.userId === u.id)?.role;
		return role === "admin";
	});

	if (!hasAdmin) {
		await auth.api.signUpEmail({
			body: {
				email: SEED_ADMIN_EMAIL,
				password: SEED_ADMIN_PASSWORD,
				name: "Administrator",
			},
			headers: new Headers(),
		});

		const adminUser = db.user.find((u) => u.email === SEED_ADMIN_EMAIL);
		if (adminUser) {
			const existing = db.userRole.find((r) => r.userId === adminUser.id);
			if (existing) {
				existing.role = "admin";
			} else {
				db.userRole.push({ userId: adminUser.id, role: "admin" });
			}
		}
	}

	const productsAdded = seedKebayaCatalog();

	return {
		ok: true,
		alreadySeeded: hasAdmin && productsAdded === 0,
		admin: SEED_ADMIN_EMAIL,
		productsAdded,
	};
});
