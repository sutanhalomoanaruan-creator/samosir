import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Flower2, Sparkles, Truck } from "lucide-react";

import { ProductArtwork } from "@/components/storefront/product-artwork";
import { PRODUCT_CATEGORIES } from "@/lib/db";
import { getPublicProducts } from "@/lib/server/products";
import { formatRupiah } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	const productsQuery = useQuery({
		queryKey: ["storefront", "products"],
		queryFn: () => getPublicProducts(),
	});
	const products = productsQuery.data ?? [];

	return (
		<main>
			<section className="relative overflow-hidden bg-stone-950 text-white">
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_25%,rgba(180,120,45,0.25),transparent_45%)]" />
				<div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
					<div>
						<p className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-amber-300">
							<Flower2 size={16} />
							Kain &amp; Kebaya · Busana Nusantara
						</p>
						<h1 className="m-0 max-w-2xl font-serif text-5xl leading-[1.08] sm:text-6xl lg:text-7xl">
							Warisan indah,
							<br />
							<span className="text-amber-300">cerita yang dikenakan.</span>
						</h1>
						<p className="mb-0 mt-6 max-w-xl text-base leading-8 text-stone-300">
							Temukan kebaya modern dan kain tradisional pilihan. Setiap helai merayakan keahlian,
							warna, dan cerita dari berbagai penjuru Nusantara.
						</p>
						<div className="mt-8 flex flex-wrap gap-3">
							<Link
								to="/products"
								className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3.5 text-sm font-bold text-stone-950 no-underline transition hover:bg-amber-300"
							>
								Jelajahi katalog <ArrowRight size={17} />
							</Link>
							<a
								href="#kategori"
								className="rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold text-white no-underline hover:bg-white/10"
							>
								Lihat kategori
							</a>
						</div>
					</div>
					<div className="relative mx-auto w-full max-w-lg">
						<div className="absolute -inset-5 rounded-[3rem] border border-amber-300/20" />
						<ProductArtwork
							category="Kebaya Modern"
							imageUrl=""
							name="Kebaya Nusantara"
							className="min-h-[22rem] rounded-[2.5rem] sm:min-h-[29rem]"
						/>
						<div className="absolute -bottom-5 left-4 rounded-2xl border border-white/10 bg-stone-900/90 p-4 shadow-xl backdrop-blur sm:left-[-2rem]">
							<div className="flex items-center gap-3">
								<span className="grid h-10 w-10 place-items-center rounded-full bg-amber-400 text-stone-950">
									<Sparkles size={19} />
								</span>
								<span>
									<strong className="block text-sm">Dibuat dengan cerita</strong>
									<span className="text-xs text-stone-400">Warisan budaya Indonesia</span>
								</span>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
				<div className="grid gap-3 rounded-2xl bg-amber-50 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:px-7">
					<div>
						<p className="m-0 text-xs font-bold uppercase tracking-[0.18em] text-amber-800">
							Koleksi baru
						</p>
						<p className="mb-0 mt-1 font-serif text-xl text-stone-900">
							Jelajahi busana dan wastra dari beragam tradisi daerah.
						</p>
					</div>
					<Link
						to="/products"
						className="inline-flex items-center gap-2 text-sm font-bold text-amber-900 no-underline"
					>
						Temukan pilihanmu <ArrowRight size={16} />
					</Link>
				</div>
			</section>

			<section className="mx-auto grid max-w-7xl gap-3 px-4 py-5 sm:grid-cols-3 sm:px-6">
				<Stat
					value={productsQuery.isPending ? "—" : `${products.length}`}
					label="Koleksi tersedia"
				/>
				<Stat value={`${PRODUCT_CATEGORIES.length}`} label="Kategori pilihan" />
				<div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-5">
					<span className="grid h-11 w-11 place-items-center rounded-full bg-amber-100 text-amber-900">
						<Truck size={20} />
					</span>
					<span>
						<strong className="block text-sm text-stone-900">Pengiriman nasional</strong>
						<span className="text-xs text-stone-500">Detail ongkir saat konfirmasi</span>
					</span>
				</div>
			</section>

			<section id="kategori" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
				<SectionHeading eyebrow="Jelajahi pilihan" title="Kategori pilihan" />
				<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{PRODUCT_CATEGORIES.map((category, index) => (
						<Link
							key={category}
							to="/products"
							search={{ category }}
							className="group flex min-h-44 flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 text-stone-900 no-underline transition hover:-translate-y-1 hover:border-amber-400 hover:shadow-lg"
						>
							<span className="text-xs font-bold tracking-[0.18em] text-amber-800">
								0{index + 1} / WAStra
							</span>
							<span className="flex items-end justify-between gap-3">
								<strong className="font-serif text-2xl">{category}</strong>
								<ArrowRight className="transition group-hover:translate-x-1" size={19} />
							</span>
						</Link>
					))}
				</div>
			</section>

			<section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
				<div className="flex flex-wrap items-end justify-between gap-4">
					<SectionHeading eyebrow="Pilihan untukmu" title="Produk unggulan" />
					<Link
						to="/products"
						className="text-sm font-bold text-amber-900 underline underline-offset-4"
					>
						Lihat semua produk
					</Link>
				</div>
				{productsQuery.isError ? (
					<p role="alert" className="mt-6 text-sm text-rose-800">
						Produk unggulan gagal dimuat: {productsQuery.error.message}
					</p>
				) : (
					<div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
						{products.slice(0, 4).map((product) => (
							<Link
								key={product.id}
								to="/product/$productId"
								params={{ productId: product.id }}
								className="overflow-hidden rounded-2xl border border-stone-200 bg-white text-stone-900 no-underline transition hover:-translate-y-1 hover:shadow-xl"
							>
								<ProductArtwork
									category={product.category}
									imageUrl={product.imageUrl}
									name={product.name}
									className="h-52"
								/>
								<div className="p-4">
									<p className="m-0 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-amber-800">
										{product.category}
									</p>
									<h3 className="mb-2 mt-1 truncate font-serif text-lg">{product.name}</h3>
									<strong>{formatRupiah(product.price)}</strong>
								</div>
							</Link>
						))}
					</div>
				)}
			</section>
		</main>
	);
}

function Stat({ value, label }: { value: string; label: string }) {
	return (
		<div className="rounded-2xl border border-stone-200 bg-white p-5">
			<strong className="block font-serif text-3xl text-stone-950">{value}</strong>
			<span className="mt-1 block text-sm text-stone-600">{label}</span>
		</div>
	);
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
	return (
		<div>
			<p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-800">{eyebrow}</p>
			<h2 className="m-0 font-serif text-3xl text-stone-950 sm:text-4xl">{title}</h2>
		</div>
	);
}
