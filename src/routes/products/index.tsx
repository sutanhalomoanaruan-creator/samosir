import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";

import { AddToCartButton } from "@/components/storefront/cart-controls";
import { ProductArtwork } from "@/components/storefront/product-artwork";
import { PRODUCT_CATEGORIES, type ProductCategory } from "@/lib/db";
import { getPublicProducts } from "@/lib/server/products";
import { formatRupiah } from "@/lib/utils";

export const Route = createFileRoute("/products/")({
	validateSearch: z.object({ category: z.enum(PRODUCT_CATEGORIES).optional() }),
	component: Catalog,
});

function Catalog() {
	const searchParams = Route.useSearch();
	const [category, setCategory] = useState<ProductCategory | "Semua">(
		searchParams.category ?? "Semua",
	);
	const [search, setSearch] = useState("");
	const productsQuery = useQuery({
		queryKey: ["storefront", "products"],
		queryFn: () => getPublicProducts(),
	});
	const products = productsQuery.data ?? [];
	const visibleProducts = useMemo(() => {
		const normalizedSearch = search.trim().toLocaleLowerCase();
		return products.filter((product) => {
			const matchesCategory = category === "Semua" || product.category === category;
			const matchesName = `${product.name} ${product.description}`
				.toLocaleLowerCase()
				.includes(normalizedSearch);
			return matchesCategory && matchesName;
		});
	}, [category, products, search]);

	return (
		<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
			<section className="relative overflow-hidden rounded-[2rem] bg-stone-950 px-6 py-10 text-white sm:px-10 sm:py-14">
				<div className="absolute -right-12 -top-24 h-72 w-72 rounded-full border border-amber-200/15" />
				<div className="absolute -right-2 -top-14 h-52 w-52 rounded-full border border-amber-200/20" />
				<div className="relative max-w-2xl">
					<p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-amber-300">
						<Sparkles size={15} aria-hidden="true" />
						Koleksi wastra pilihan
					</p>
					<h1 className="m-0 font-serif text-4xl leading-tight sm:text-6xl">
						Warisan Nusantara,
						<br />
						<span className="text-amber-300">dikenakan dengan bangga.</span>
					</h1>
					<p className="mb-0 mt-5 max-w-xl text-sm leading-7 text-stone-300 sm:text-base">
						Jelajahi kebaya, kain tenun, songket, dan batik pilihan yang merayakan cerita di setiap
						helaian.
					</p>
				</div>
			</section>

			<section className="py-8 sm:py-10" aria-labelledby="catalog-heading">
				<div className="mb-5 flex flex-wrap items-end justify-between gap-4">
					<div>
						<p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-800">
							Kain &amp; Kebaya
						</p>
						<h2 id="catalog-heading" className="m-0 font-serif text-3xl text-stone-900">
							Jelajahi koleksi
						</h2>
						<p className="mb-0 mt-2 text-sm text-stone-600">
							{productsQuery.isPending
								? "Memuat produk..."
								: `${visibleProducts.length} produk ditemukan`}
						</p>
					</div>
					<label className="flex w-full items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-3 text-stone-500 shadow-sm sm:max-w-sm">
						<Search size={17} aria-hidden="true" />
						<span className="sr-only">Cari nama produk</span>
						<input
							type="search"
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder="Cari kebaya, kain, songket..."
							className="min-w-0 flex-1 border-0 bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400"
						/>
					</label>
				</div>

				<div className="mb-6 flex gap-2 overflow-x-auto pb-2">
					<CategoryButton active={category === "Semua"} onClick={() => setCategory("Semua")}>
						Semua koleksi
					</CategoryButton>
					{PRODUCT_CATEGORIES.map((item) => (
						<CategoryButton key={item} active={category === item} onClick={() => setCategory(item)}>
							{item}
						</CategoryButton>
					))}
				</div>

				{productsQuery.isError ? (
					<div
						className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800"
						role="alert"
					>
						Katalog gagal dimuat: {productsQuery.error.message}
					</div>
				) : productsQuery.isPending ? (
					<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{Array.from({ length: 8 }, (_, index) => (
							<div
								key={`catalog-placeholder-${index + 1}`}
								className="h-80 animate-pulse rounded-2xl bg-stone-100"
							/>
						))}
					</div>
				) : visibleProducts.length > 0 ? (
					<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{visibleProducts.map((product) => (
							<article
								key={product.id}
								className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
							>
								<Link
									to="/product/$productId"
									params={{ productId: product.id }}
									className="block text-inherit no-underline"
								>
									<ProductArtwork
										category={product.category}
										imageUrl={product.imageUrl}
										name={product.name}
										className="h-56"
									/>
								</Link>
								<div className="p-4">
									<div className="mb-2 flex items-center justify-between gap-2">
										<span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-amber-800">
											{product.category}
										</span>
										<span
											className={`rounded-full px-2.5 py-1 text-[0.65rem] font-bold ${
												product.stock > 5
													? "bg-emerald-50 text-emerald-800"
													: product.stock > 0
														? "bg-amber-50 text-amber-800"
														: "bg-rose-50 text-rose-800"
											}`}
										>
											{product.stock > 5
												? "Tersedia"
												: product.stock > 0
													? `Sisa ${product.stock}`
													: "Habis"}
										</span>
									</div>
									<Link
										to="/product/$productId"
										params={{ productId: product.id }}
										className="text-inherit no-underline"
									>
										<h3 className="m-0 truncate font-serif text-lg text-stone-900">
											{product.name}
										</h3>
									</Link>
									<p className="mb-3 mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-stone-600">
										{product.description}
									</p>
									<p className="mb-3 mt-0 text-lg font-extrabold text-stone-950">
										{formatRupiah(product.price)}
									</p>
									<div className="flex items-center justify-between gap-2">
										<Link
											to="/product/$productId"
											params={{ productId: product.id }}
											className="text-xs font-semibold text-stone-700 underline underline-offset-4"
										>
											Lihat detail
										</Link>
										<AddToCartButton product={product} size={product.sizes[0] ?? "All Size"} />
									</div>
								</div>
							</article>
						))}
					</div>
				) : (
					<div className="rounded-2xl border border-dashed border-stone-300 px-5 py-16 text-center">
						<p className="m-0 font-serif text-xl text-stone-800">Produk tidak ditemukan</p>
						<p className="mb-0 mt-2 text-sm text-stone-500">Coba kategori atau kata kunci lain.</p>
					</div>
				)}
			</section>
		</main>
	);
}

function CategoryButton({
	active,
	onClick,
	children,
}: {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={active}
			className={`whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-semibold transition ${
				active
					? "bg-stone-950 text-white"
					: "border border-stone-200 bg-white text-stone-700 hover:border-amber-500"
			}`}
		>
			{children}
		</button>
	);
}
