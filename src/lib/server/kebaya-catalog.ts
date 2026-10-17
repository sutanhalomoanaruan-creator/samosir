import type { Product } from "@/lib/db";
import { PRODUCT_CATEGORIES, db } from "@/lib/db";

const initialProducts: Array<Omit<Product, "id" | "createdAt" | "updatedAt">> = [
	{
		name: "Kebaya Brokat Puspa",
		category: "Kebaya Modern",
		description: "Kebaya brokat bermotif bunga dengan furing lembut untuk acara istimewa.",
		price: 685000,
		stock: 8,
		sizes: ["S", "M", "L", "XL"],
		careInstructions:
			"Cuci kering atau cuci tangan dengan deterjen lembut. Simpan dalam kantong kain.",
		imageUrl: "",
	},
	{
		name: "Kebaya Kutubaru Sekar",
		category: "Kebaya Modern",
		description: "Kutubaru klasik dengan sentuhan modern, nyaman dipakai sepanjang hari.",
		price: 725000,
		stock: 5,
		sizes: ["S", "M", "L", "XL"],
		careInstructions: "Cuci tangan secara terpisah dan setrika suhu rendah dari sisi dalam.",
		imageUrl: "",
	},
	{
		name: "Kebaya Encim Melati",
		category: "Kebaya Modern",
		description: "Kebaya encim katun adem berhias bordir bunga khas pesisir.",
		price: 485000,
		stock: 12,
		sizes: ["S", "M", "L", "XL"],
		careInstructions: "Cuci dengan warna senada, hindari pemutih, dan jemur di tempat teduh.",
		imageUrl: "",
	},
	{
		name: "Kebaya Kartini Amara",
		category: "Kebaya Modern",
		description: "Potongan Kartini anggun dengan kerah tegak dan detail kancing depan.",
		price: 625000,
		stock: 4,
		sizes: ["S", "M", "L", "XL"],
		careInstructions: "Cuci kering dianjurkan. Setrika dengan pelapis kain pada suhu rendah.",
		imageUrl: "",
	},
	{
		name: "Ulos Sadum Toba",
		category: "Kain Ulos",
		description: "Tenun Ulos Sadum dengan warna cerah dan motif tradisional Toba.",
		price: 850000,
		stock: 7,
		sizes: ["All Size"],
		careInstructions: "Cuci tangan dengan air dingin, jangan diperas, keringkan mendatar.",
		imageUrl: "",
	},
	{
		name: "Ulos Ragi Hotang",
		category: "Kain Ulos",
		description: "Ulos Ragi Hotang tenun tangan dengan tekstur kuat dan motif bermakna.",
		price: 975000,
		stock: 3,
		sizes: ["All Size"],
		careInstructions: "Cuci kering untuk menjaga warna dan bentuk serat tenun.",
		imageUrl: "",
	},
	{
		name: "Tenun Ikat Sumba",
		category: "Kain Tenun",
		description: "Kain ikat Sumba dengan motif geometris khas, ditenun secara tradisional.",
		price: 1250000,
		stock: 6,
		sizes: ["All Size"],
		careInstructions:
			"Cuci tangan dengan sabun lembut dan keringkan tanpa paparan matahari langsung.",
		imageUrl: "",
	},
	{
		name: "Songket Palembang Seroja",
		category: "Songket",
		description: "Songket Palembang dengan benang emas dan motif bunga seroja yang anggun.",
		price: 1850000,
		stock: 5,
		sizes: ["All Size"],
		careInstructions: "Simpan kering dan terlipat rapi. Bersihkan secara profesional.",
		imageUrl: "",
	},
	{
		name: "Songket Minang Pucuak",
		category: "Songket",
		description: "Songket Minangkabau bermotif pucuak rabuang dengan kilau lembut.",
		price: 1650000,
		stock: 2,
		sizes: ["All Size"],
		careInstructions: "Hindari pencucian mesin. Simpan dengan silica gel di tempat kering.",
		imageUrl: "",
	},
	{
		name: "Songket Lombok Subahnale",
		category: "Songket",
		description: "Songket Lombok motif Subahnale dengan tenunan halus dan warna elegan.",
		price: 1450000,
		stock: 9,
		sizes: ["All Size"],
		careInstructions: "Cuci tangan menggunakan air dingin dan sabun khusus kain halus.",
		imageUrl: "",
	},
	{
		name: "Batik Tulis Parang Aruna",
		category: "Kain Batik",
		description: "Batik tulis motif parang klasik dengan palet warna bumi yang hangat.",
		price: 575000,
		stock: 10,
		sizes: ["All Size"],
		careInstructions: "Cuci pertama kali dengan lerak atau deterjen khusus batik.",
		imageUrl: "",
	},
	{
		name: "Batik Kawung Laras",
		category: "Kain Batik",
		description: "Batik motif kawung yang dibuat dengan teknik cap dan sentuhan tangan.",
		price: 425000,
		stock: 0,
		sizes: ["All Size"],
		careInstructions: "Cuci terpisah menggunakan air dingin dan hindari pemutih.",
		imageUrl: "",
	},
];

let hasEnsuredCatalog = false;

export function seedKebayaCatalog() {
	const legacyNames = new Set(["starter kit", "pro plan", "enterprise"]);
	db.product = db.product.filter(
		(product) =>
			!legacyNames.has(product.name.toLocaleLowerCase()) &&
			!product.name.toLocaleLowerCase().includes("pisang"),
	);
	for (const product of db.product) {
		if (!PRODUCT_CATEGORIES.includes(product.category)) {
			const name = product.name.toLocaleLowerCase();
			product.category = name.includes("ulos")
				? "Kain Ulos"
				: name.includes("songket")
					? "Songket"
					: name.includes("batik")
						? "Kain Batik"
						: name.includes("kebaya")
							? "Kebaya Modern"
							: "Kain Tenun";
		}
		if (!Array.isArray(product.sizes) || product.sizes.length === 0) {
			product.sizes = product.category === "Kebaya Modern" ? ["S", "M", "L", "XL"] : ["All Size"];
		}
		if (!product.careInstructions) {
			product.careInstructions = "Cuci dengan lembut dan simpan di tempat kering.";
		}
		if (typeof product.imageUrl !== "string") {
			product.imageUrl = "";
		}
	}
	const existingNames = new Set(db.product.map((product) => product.name.toLocaleLowerCase()));
	const now = new Date().toISOString();
	const products = initialProducts
		.filter((product) => !existingNames.has(product.name.toLocaleLowerCase()))
		.map((product) => ({
			id: crypto.randomUUID(),
			...product,
			createdAt: now,
			updatedAt: now,
		}));

	db.product.push(...products);
	hasEnsuredCatalog = true;
	return products.length;
}

export function ensureKebayaCatalogSeeded() {
	if (!hasEnsuredCatalog) {
		seedKebayaCatalog();
	}
}
