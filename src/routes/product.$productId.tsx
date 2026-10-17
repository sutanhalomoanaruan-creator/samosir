import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useParams } from "@tanstack/react-router";
import { Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import { useState } from "react";

import { AddToCartButton } from "@/components/storefront/cart-controls";
import { ProductArtwork } from "@/components/storefront/product-artwork";
import { getPublicProduct } from "@/lib/server/products";
import { formatRupiah } from "@/lib/utils";

export const Route = createFileRoute("/product/$productId")({ component: ProductDetail });

function ProductDetail() {
	const { productId } = useParams({ from: "/product/$productId" });
	const [quantity, setQuantity] = useState(1);
	const [size, setSize] = useState<string | null>(null);
	const productQuery = useQuery({
		queryKey: ["storefront", "product", productId],
		queryFn: () => getPublicProduct({ data: { id: productId } }),
	});
	const product = productQuery.data;

	if (productQuery.isPending) {
		return (
			<main className="mx-auto max-w-7xl px-4 py-12 text-stone-600">Memuat detail produk...</main>
		);
	}
	if (productQuery.isError) {
		return (
			<main className="mx-auto max-w-7xl px-4 py-12 text-rose-800" role="alert">
				Detail produk gagal dimuat: {productQuery.error.message}
			</main>
		);
	}
	if (!product) {
		return (
			<main className="mx-auto max-w-7xl px-4 py-12">
				<h1 className="font-serif text-3xl text-stone-900">Produk tidak ditemukan</h1>
				<Link to="/products" className="text-amber-800 underline">
					Kembali ke katalog
				</Link>
			</main>
		);
	}

	const selectedSize = size ?? product.sizes[0] ?? "All Size";

	return (
		<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
			<p className="mb-5 text-sm text-stone-500">
				<Link to="/products" className="text-stone-600 underline underline-offset-4">
					Katalog
				</Link>{" "}
				/ {product.category}
			</p>
			<div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
				<ProductArtwork
					category={product.category}
					imageUrl={product.imageUrl}
					name={product.name}
					className="min-h-[22rem] rounded-[2rem] sm:min-h-[36rem]"
				/>
				<section className="py-2 sm:py-6">
					<p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-amber-800">
						{product.category}
					</p>
					<h1 className="m-0 font-serif text-4xl leading-tight text-stone-950 sm:text-5xl">
						{product.name}
					</h1>
					<p className="mb-0 mt-4 text-2xl font-extrabold text-stone-900">
						{formatRupiah(product.price)}
					</p>
					<p className="mt-5 text-base leading-8 text-stone-600">{product.description}</p>

					<div className="my-7 grid gap-3 rounded-2xl bg-stone-50 p-4 text-sm text-stone-700 sm:grid-cols-2">
						<p className="m-0 flex items-center gap-2">
							<ShieldCheck size={17} className="text-emerald-700" />
							{product.stock > 0 ? `Stok tersedia: ${product.stock}` : "Stok sedang habis"}
						</p>
						<p className="m-0 flex items-center gap-2">
							<Truck size={17} className="text-amber-800" />
							Pengiriman ke seluruh Indonesia
						</p>
					</div>

					<div className="mb-5">
						<p className="mb-2 text-sm font-bold text-stone-900">Pilih ukuran</p>
						<div className="flex flex-wrap gap-2">
							{product.sizes.map((availableSize) => (
								<button
									key={availableSize}
									type="button"
									aria-pressed={selectedSize === availableSize}
									onClick={() => setSize(availableSize)}
									className={`min-w-14 rounded-xl border px-4 py-2.5 text-sm font-semibold ${
										selectedSize === availableSize
											? "border-stone-950 bg-stone-950 text-white"
											: "border-stone-200 bg-white text-stone-800"
									}`}
								>
									{availableSize}
								</button>
							))}
						</div>
					</div>

					<div className="mb-6">
						<p className="mb-2 text-sm font-bold text-stone-900">Jumlah</p>
						<div className="inline-flex items-center gap-4 rounded-full border border-stone-200 px-3 py-2">
							<button
								type="button"
								onClick={() => setQuantity((value) => Math.max(1, value - 1))}
								aria-label="Kurangi jumlah"
							>
								<Minus size={16} />
							</button>
							<span className="min-w-5 text-center text-sm font-bold">{quantity}</span>
							<button
								type="button"
								onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))}
								disabled={quantity >= product.stock}
								aria-label="Tambah jumlah"
								className="disabled:opacity-40"
							>
								<Plus size={16} />
							</button>
						</div>
					</div>

					<AddToCartButton product={product} size={selectedSize} quantity={quantity} />

					<div className="mt-8 border-t border-stone-200 pt-6">
						<h2 className="m-0 font-serif text-xl text-stone-900">Panduan perawatan</h2>
						<p className="mb-0 mt-2 text-sm leading-7 text-stone-600">{product.careInstructions}</p>
					</div>
				</section>
			</div>
		</main>
	);
}
