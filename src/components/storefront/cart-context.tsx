import { createContext, useContext, useMemo, useState } from "react";

import type { Product } from "@/lib/db";

export type CartLine = {
	productId: string;
	name: string;
	category: Product["category"];
	price: number;
	stock: number;
	size: string;
	quantity: number;
	imageUrl: string;
};

type CartContextValue = {
	items: CartLine[];
	isOpen: boolean;
	openCart: () => void;
	closeCart: () => void;
	addItem: (product: Product, size: string, quantity?: number) => void;
	setQuantity: (productId: string, size: string, quantity: number) => void;
	removeItem: (productId: string, size: string) => void;
	clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [items, setItems] = useState<CartLine[]>([]);
	const [isOpen, setIsOpen] = useState(false);

	const value = useMemo<CartContextValue>(
		() => ({
			items,
			isOpen,
			openCart: () => setIsOpen(true),
			closeCart: () => setIsOpen(false),
			addItem: (product, size, quantity = 1) => {
				setItems((current) => {
					const existing = current.find(
						(item) => item.productId === product.id && item.size === size,
					);
					if (existing) {
						return current.map((item) =>
							item.productId === product.id && item.size === size
								? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
								: item,
						);
					}
					return [
						...current,
						{
							productId: product.id,
							name: product.name,
							category: product.category,
							price: product.price,
							stock: product.stock,
							size,
							quantity: Math.min(quantity, product.stock),
							imageUrl: product.imageUrl,
						},
					];
				});
			},
			setQuantity: (productId, size, quantity) =>
				setItems((current) =>
					current.map((item) =>
						item.productId === productId && item.size === size
							? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) }
							: item,
					),
				),
			removeItem: (productId, size) =>
				setItems((current) =>
					current.filter((item) => item.productId !== productId || item.size !== size),
				),
			clearCart: () => setItems([]),
		}),
		[items, isOpen],
	);

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
	const context = useContext(CartContext);
	if (!context) {
		throw new Error("useCart must be used inside CartProvider");
	}
	return context;
}
