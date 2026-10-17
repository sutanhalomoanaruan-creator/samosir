import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { db, getUserRole, removeUserRole, setUserRole } from "@/lib/db";
import { requireAdmin, requireAuth } from "@/lib/session";

export const userRoleSchema = z.object({
	userId: z.string(),
	role: z.enum(["admin", "customer"]),
});

export const getUsers = createServerFn({ method: "GET" }).handler(async () => {
	await requireAdmin();
	return db.user.map((u) => ({
		id: u.id,
		email: u.email,
		name: u.name,
		role: getUserRole(u.id),
		emailVerified: !!u.emailVerified,
		createdAt: u.createdAt.toISOString(),
	}));
});

export const getDashboardUserSummary = createServerFn({ method: "GET" }).handler(async () => {
	const { user } = await requireAuth();
	if (getUserRole(user.id) !== "admin") {
		return { canManageUsers: false, userCount: null, adminCount: null };
	}

	return {
		canManageUsers: true,
		userCount: db.user.length,
		adminCount: db.userRole.filter((role) => role.role === "admin").length,
	};
});

export const updateUserRole = createServerFn({ method: "POST" })
	.validator(userRoleSchema)
	.handler(async ({ data }) => {
		await requireAdmin();
		const currentRole = getUserRole(data.userId);
		if (currentRole === "admin" && data.role === "customer") {
			const adminCount = db.userRole.filter((role) => role.role === "admin").length;
			if (adminCount <= 1) {
				const err = new Error("Cannot demote the last administrator") as Error & {
					status?: number;
				};
				err.status = 400;
				throw err;
			}
		}
		setUserRole(data.userId, data.role);
		return { ok: true };
	});

export const deleteUser = createServerFn({ method: "POST" })
	.validator(z.object({ userId: z.string() }))
	.handler(async ({ data }) => {
		await requireAdmin();
		// Prevent removing the last administrator so the app never locks itself out.
		const role = getUserRole(data.userId);
		if (role === "admin") {
			const adminCount = db.userRole.filter((r) => r.role === "admin").length;
			if (adminCount <= 1) {
				const err = new Error("Cannot delete the last administrator") as Error & {
					status?: number;
				};
				err.status = 400;
				throw err;
			}
		}
		db.user = db.user.filter((u) => u.id !== data.userId);
		removeUserRole(data.userId);
		return { ok: true };
	});
