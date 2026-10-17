import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { PRODUCT_CATEGORIES, type Product, db } from "@/lib/db";
import { ensureKebayaCatalogSeeded, seedKebayaCatalog } from "@/lib/server/kebaya-catalog";
import { requireAdmin } from "@/lib/session";

const productFields = {
	name: z.string().trim().min(2, "Nama produk minimal 2 karakter"),
	description: z.string().trim().min(10, "Deskripsi minimal 10 karakter"),
	category: z.enum(PRODUCT_CATEGORIES),
	price: z.coerce.number().positive("Harga harus lebih besar dari nol"),
	stock: z.coerce
		.number()
		.int("Stok harus berupa bilangan bulat")
		.min(0, "Stok tidak boleh negatif"),
	sizes: z.array(z.string().trim().min(1)).min(1, "Pilih setidaknya satu ukuran"),
	careInstructions: z.string().trim().min(5, "Panduan perawatan minimal 5 karakter"),
	imageUrl: z.union([z.literal(""), z.string().url("URL gambar tidak valid")]),
};

export const productSchema = z.object({
	...productFields,
});

export type ProductInput = z.infer<typeof productSchema>;

// TanStack Start server functions support GET and POST only. Mutations use
// POST and encode the intended action in the validator/body.
export const getProducts = createServerFn({ method: "GET" }).handler(async () => {
	await requireAdmin();
	ensureKebayaCatalogSeeded();
	return [...db.product].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) as Product[];
});

export const getPublicProducts = createServerFn({ method: "GET" }).handler(async () => {
	ensureKebayaCatalogSeeded();
	return [...db.product].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) as Product[];
});

export const getPublicProduct = createServerFn({ method: "GET" })
	.validator(z.object({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		ensureKebayaCatalogSeeded();
		return db.product.find((product) => product.id === data.id) ?? null;
	});

export const seedProductCatalog = createServerFn({ method: "POST" }).handler(async () => {
	await requireAdmin();
	return { added: seedKebayaCatalog() };
});

export const createProduct = createServerFn({ method: "POST" })
	.validator(productSchema)
	.handler(async ({ data }) => {
		await requireAdmin();
		const now = new Date().toISOString();
		const product = {
			id: crypto.randomUUID(),
			...data,
			sizes: [...data.sizes],
			createdAt: now,
			updatedAt: now,
		};
		db.product.push(product);
		return product;
	});

export const updateProduct = createServerFn({ method: "POST" })
	.validator(
		z.object({
			id: z.string(),
			...productSchema.shape,
		}),
	)
	.handler(async ({ data }) => {
		await requireAdmin();
		const index = db.product.findIndex((p) => p.id === data.id);
		if (index === -1) {
			const err = new Error("Product not found") as Error & { status?: number };
			err.status = 404;
			throw err;
		}
		const now = new Date().toISOString();
		const updated = {
			...db.product[index],
			name: data.name,
			description: data.description,
			price: data.price,
			stock: data.stock,
			category: data.category,
			sizes: [...data.sizes],
			careInstructions: data.careInstructions,
			imageUrl: data.imageUrl,
			updatedAt: now,
		};
		db.product[index] = updated;
		return updated;
	});

export const deleteProduct = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ({ data }) => {
		await requireAdmin();
		const index = db.product.findIndex((p) => p.id === data.id);
		if (index === -1) {
			const err = new Error("Product not found") as Error & { status?: number };
			err.status = 404;
			throw err;
		}
		db.product.splice(index, 1);
		return { ok: true };
	});
