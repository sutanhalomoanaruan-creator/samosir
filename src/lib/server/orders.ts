import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { type Order, type OrderItem, db } from "@/lib/db";
import { ensureKebayaCatalogSeeded } from "@/lib/server/kebaya-catalog";
import { requireAdmin, requireAuth } from "@/lib/session";

export const checkoutSchema = z.object({
	customerName: z.string().trim().min(2).max(100),
	phone: z.string().trim().min(8).max(30),
	address: z.string().trim().min(10).max(500),
	city: z.string().trim().min(2).max(100),
	postalCode: z.string().trim().min(4).max(12),
	paymentMethod: z.enum(["bank_transfer", "cash_on_delivery"]),
	items: z
		.array(
			z.object({
				productId: z.string().min(1),
				size: z.string().trim().min(1).max(30),
				quantity: z.coerce.number().int().min(1).max(20),
			}),
		)
		.min(1)
		.max(30),
});

export const createOrder = createServerFn({ method: "POST" })
	.validator(checkoutSchema)
	.handler(async ({ data }) => {
		const { user } = await requireAuth();
		ensureKebayaCatalogSeeded();

		const quantities = new Map<string, number>();
		for (const item of data.items) {
			const key = `${item.productId}\u0000${item.size}`;
			quantities.set(key, (quantities.get(key) ?? 0) + item.quantity);
		}

		const orderItems: OrderItem[] = [];
		for (const [key, quantity] of quantities) {
			const [productId, size] = key.split("\u0000");
			const product = db.product.find((entry) => entry.id === productId);
			if (!product) {
				throw new Error("Salah satu produk sudah tidak tersedia.");
			}
			if (!product.sizes.includes(size)) {
				throw new Error(`Ukuran ${size} tidak tersedia untuk ${product.name}.`);
			}
			if (product.stock < quantity) {
				throw new Error(`Stok ${product.name} tidak mencukupi.`);
			}
			orderItems.push({
				productId: product.id,
				productName: product.name,
				category: product.category,
				size,
				quantity,
				unitPrice: product.price,
			});
		}

		const quantityByProduct = new Map<string, number>();
		for (const item of orderItems) {
			quantityByProduct.set(
				item.productId,
				(quantityByProduct.get(item.productId) ?? 0) + item.quantity,
			);
		}
		for (const [productId, quantity] of quantityByProduct) {
			const product = db.product.find((entry) => entry.id === productId);
			if (product && product.stock < quantity) {
				throw new Error(`Stok ${product.name} tidak mencukupi.`);
			}
		}

		for (const item of orderItems) {
			const product = db.product.find((entry) => entry.id === item.productId);
			if (!product) {
				throw new Error("Produk berubah saat pesanan dibuat. Silakan coba kembali.");
			}
			product.stock -= item.quantity;
			product.updatedAt = new Date().toISOString();
		}

		const order: Order = {
			id: crypto.randomUUID(),
			customerId: user.id,
			customerEmail: user.email,
			customerName: data.customerName,
			phone: data.phone,
			address: data.address,
			city: data.city,
			postalCode: data.postalCode,
			items: orderItems,
			total: orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
			paymentMethod: data.paymentMethod,
			status: "pending",
			createdAt: new Date().toISOString(),
		};
		db.order.unshift(order);
		return { id: order.id, total: order.total };
	});

export const getCustomerOrders = createServerFn({ method: "GET" }).handler(async () => {
	const { user } = await requireAuth();
	return db.order.filter((order) => order.customerId === user.id);
});

export const getAdminOrders = createServerFn({ method: "GET" }).handler(async () => {
	await requireAdmin();
	return [...db.order];
});
