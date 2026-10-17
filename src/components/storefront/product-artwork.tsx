import { Flower2, Shirt, Sparkles, Waves } from "lucide-react";

import type { ProductCategory } from "@/lib/db";

const categoryIcons = {
	"Kebaya Modern": Shirt,
	"Kain Tenun": Waves,
	"Kain Ulos": Waves,
	Songket: Sparkles,
	"Kain Batik": Flower2,
} satisfies Record<ProductCategory, typeof Shirt>;

const categoryStyles = {
	"Kebaya Modern": "from-rose-200 via-amber-100 to-orange-100 text-rose-900",
	"Kain Tenun": "from-teal-200 via-cyan-100 to-amber-100 text-teal-900",
	"Kain Ulos": "from-red-200 via-orange-100 to-amber-100 text-red-950",
	Songket: "from-amber-200 via-yellow-100 to-orange-100 text-amber-950",
	"Kain Batik": "from-indigo-200 via-rose-100 to-amber-100 text-indigo-950",
} satisfies Record<ProductCategory, string>;

export function ProductArtwork({
	category,
	imageUrl,
	name,
	className = "",
}: {
	category: ProductCategory;
	imageUrl: string;
	name: string;
	className?: string;
}) {
	const Icon = categoryIcons[category];
	return (
		<div
			className={`group relative isolate flex items-center justify-center overflow-hidden bg-gradient-to-br ${categoryStyles[category]} ${className}`}
			role="img"
			aria-label={`Gambar produk ${name}`}
		>
			<div className="absolute inset-4 rounded-[45%] border border-current/15" aria-hidden="true" />
			<div
				className="absolute -bottom-12 -left-10 h-36 w-36 rounded-full border border-current/20"
				aria-hidden="true"
			/>
			<div
				className="absolute -right-10 -top-12 h-40 w-40 rounded-full border border-current/20"
				aria-hidden="true"
			/>
			{imageUrl ? (
				<img
					src={imageUrl}
					alt=""
					className="absolute inset-0 h-full w-full object-cover"
					loading="lazy"
				/>
			) : (
				<div className="relative grid h-32 w-32 place-items-center rounded-[2rem] border border-white/50 bg-white/30 shadow-xl backdrop-blur-sm transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
					<Icon size={64} strokeWidth={1.2} aria-hidden="true" />
					<span className="absolute -bottom-2 -right-2 grid h-10 w-10 place-items-center rounded-2xl bg-white/75 text-amber-700 shadow">
						<Flower2 size={19} aria-hidden="true" />
					</span>
				</div>
			)}
			<span className="absolute bottom-3 left-3 rounded-full border border-white/50 bg-white/70 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-stone-800 backdrop-blur">
				{category}
			</span>
		</div>
	);
}
