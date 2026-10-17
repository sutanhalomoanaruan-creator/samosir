import { memoryAdapter } from "better-auth/adapters/memory";

export type Role = "admin" | "customer";
export const PRODUCT_CATEGORIES = [
	"Kebaya Modern",
	"Kain Tenun",
	"Kain Ulos",
	"Songket",
	"Kain Batik",
] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export interface Product {
	id: string;
	name: string;
	description: string;
	category: ProductCategory;
	price: number;
	stock: number;
	sizes: string[];
	careInstructions: string;
	imageUrl: string;
	createdAt: string;
	updatedAt: string;
}

export interface OrderItem {
	productId: string;
	productName: string;
	category: ProductCategory;
	size: string;
	quantity: number;
	unitPrice: number;
}

export interface Order {
	id: string;
	customerId: string;
	customerEmail: string;
	customerName: string;
	phone: string;
	address: string;
	city: string;
	postalCode: string;
	items: OrderItem[];
	total: number;
	paymentMethod: "bank_transfer" | "cash_on_delivery";
	status: "pending" | "processing" | "shipped" | "completed" | "cancelled";
	createdAt: string;
}

export interface UserRole {
	userId: string;
	role: Role;
}

/**
 * In-memory development database.
 *
 * better-auth owns the `user`, `session`, `account` and `verification` tables
 * (managed through `memoryAdapter`). This app adds product, role, and order state.
 *
 * NOTE: this is memory only. Data survives within a single running server
 * process (local dev, or one warmed Vercel serverless instance) but is reset
 * on every redeploy / cold start. There is no persistent database by design.
 * See AGENTS.md for how to seed an admin account and sample data.
 */
const memoryDb = {
	user: [] as Array<{
		id: string;
		email: string;
		name: string | null;
		image: string | null;
		emailVerified: boolean;
		emailVerifiedAt: Date | null;
		createdAt: Date;
		updatedAt: Date;
		lastSignInAt: Date | null;
	}>,
	session: [] as unknown[],
	account: [] as unknown[],
	verification: [] as unknown[],
	product: [] as Product[],
	order: [] as Order[],
	userRole: [] as UserRole[],
};

export const adapter = memoryAdapter(memoryDb);
export const db = memoryDb;

export const SEED_ADMIN_EMAIL = "admin@example.com";
export const SEED_ADMIN_PASSWORD = "admin12345";

export function getUserRole(userId: string): Role {
	return db.userRole.find((r) => r.userId === userId)?.role ?? "customer";
}

export function setUserRole(userId: string, role: Role) {
	const existing = db.userRole.find((r) => r.userId === userId);
	if (existing) {
		existing.role = role;
	} else {
		db.userRole.push({ userId, role });
	}
}

export function removeUserRole(userId: string) {
	db.userRole = db.userRole.filter((r) => r.userId !== userId);
}
