import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";

import { useCart } from "@/components/storefront/cart-context";
import { ProductArtwork } from "@/components/storefront/product-artwork";
import { formatRupiah } from "@/lib/utils";

export function CartButton() {
	const { items, openCart } = useCart();
	const count = items.reduce((sum, item) => sum + item.quantity, 0);
	return (
		<button
			type="button"
			onClick={openCart}
			className="relative inline-flex h-10 items-center gap-2 rounded-full border border-blue-100 bg-white px-3 text-sm font-semibold text-blue-800 shadow-sm transition hover:bg-blue-50"
			aria-label={`Buka keranjang, ${count} barang`}
		>
			<ShoppingBag size={18} aria-hidden="true" />
			<span className="hidden sm:inline">Keranjang</span>
			<span className="grid min-w-5 place-items-center rounded-full bg-amber-500 px-1 text-xs font-bold text-blue-950">
				{count}
			</span>
		</button>
	);
}

export function AddToCartButton({
	product,
	size,
	quantity = 1,
}: {
	product: Parameters<ReturnType<typeof useCart>["addItem"]>[0];
	size: string;
	quantity?: number;
}) {
	const { addItem, openCart } = useCart();
	return (
		<button
			type="button"
			disabled={product.stock < 1}
			onClick={() => {
				addItem(product, size, quantity);
				openCart();
			}}
			className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50"
		>
			<ShoppingBag size={16} aria-hidden="true" />
			{product.stock > 0 ? "Tambah ke keranjang" : "Stok habis"}
		</button>
	);
}

export function CartDrawer() {
	const { items, isOpen, closeCart, setQuantity, removeItem } = useCart();
	const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
	if (!isOpen) return null;

	return (
		<dialog
			open
			aria-label="Keranjang belanja"
			onKeyDown={(event) => {
				if (event.key === "Escape") closeCart();
			}}
			className="fixed inset-0 z-[100] m-0 flex h-full w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-transparent"
		>
			<button
				type="button"
				aria-label="Tutup keranjang"
				onClick={closeCart}
				className="absolute inset-0 cursor-default bg-stone-950/45"
			/>
			<div className="relative z-10 ml-auto flex h-full w-full max-w-md flex-col bg-[var(--surface)] p-5 shadow-2xl sm:p-6">
				<div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
					<div>
						<p className="m-0 text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
							Belanja
						</p>
						<h2 className="m-0 mt-1 text-xl font-bold text-[var(--sea-ink)]">Keranjang</h2>
					</div>
					<button
						type="button"
						onClick={closeCart}
						className="grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] text-[var(--sea-ink)]"
						aria-label="Tutup keranjang"
					>
						<X size={18} />
					</button>
				</div>

				{items.length === 0 ? (
					<div className="grid flex-1 place-items-center text-center">
						<div>
							<ShoppingBag size={40} className="mx-auto mb-3 text-amber-700" />
							<p className="m-0 font-semibold text-[var(--sea-ink)]">Keranjang masih kosong</p>
							<p className="mb-4 mt-1 text-sm text-[var(--sea-ink-soft)]">
								Pilih busana Nusantara untuk memulai.
							</p>
							<Link
								to="/products"
								onClick={closeCart}
								className="font-semibold text-amber-800 underline"
							>
								Jelajahi katalog
							</Link>
						</div>
					</div>
				) : (
					<>
						<ul className="m-0 flex-1 list-none space-y-4 overflow-y-auto py-5 pl-0">
							{items.map((item) => (
								<li
									key={`${item.productId}-${item.size}`}
									className="flex gap-3 border-b border-[var(--line)] pb-4"
								>
									<ProductArtwork
										category={item.category}
										imageUrl={item.imageUrl}
										name={item.name}
										className="h-24 w-20 shrink-0 rounded-xl"
									/>
									<div className="min-w-0 flex-1">
										<p className="m-0 truncate text-sm font-bold text-[var(--sea-ink)]">
											{item.name}
										</p>
										<p className="mb-2 mt-1 text-xs text-[var(--sea-ink-soft)]">
											Ukuran {item.size}
										</p>
										<p className="m-0 text-sm font-bold text-[var(--sea-ink)]">
											{formatRupiah(item.price)}
										</p>
										<div className="mt-2 flex items-center gap-2">
											<button
												type="button"
												onClick={() => setQuantity(item.productId, item.size, item.quantity - 1)}
												className="grid h-7 w-7 place-items-center rounded-full border border-[var(--line)]"
												aria-label={`Kurangi ${item.name}`}
											>
												<Minus size={13} />
											</button>
											<span className="min-w-4 text-center text-xs">{item.quantity}</span>
											<button
												type="button"
												onClick={() => setQuantity(item.productId, item.size, item.quantity + 1)}
												disabled={item.quantity >= item.stock}
												className="grid h-7 w-7 place-items-center rounded-full border border-[var(--line)] disabled:opacity-40"
												aria-label={`Tambah ${item.name}`}
											>
												<Plus size={13} />
											</button>
											<button
												type="button"
												onClick={() => removeItem(item.productId, item.size)}
												className="ml-auto text-rose-700"
												aria-label={`Hapus ${item.name} dari keranjang`}
											>
												<Trash2 size={16} />
											</button>
										</div>
									</div>
								</li>
							))}
						</ul>
						<div className="border-t border-[var(--line)] pt-4">
							<div className="mb-4 flex justify-between text-sm font-bold text-[var(--sea-ink)]">
								<span>Subtotal</span>
								<span>{formatRupiah(total)}</span>
							</div>
							<Link
								to="/checkout"
								onClick={closeCart}
								className="flex w-full items-center justify-center rounded-full bg-amber-700 px-5 py-3 text-sm font-bold text-white no-underline hover:bg-amber-800"
							>
								Lanjut ke checkout
							</Link>
							<button
								type="button"
								onClick={closeCart}
								className="mt-3 w-full py-2 text-sm font-semibold text-[var(--sea-ink-soft)]"
							>
								Lanjut belanja
							</button>
						</div>
					</>
				)}
			</div>
		</dialog>
	);
}
