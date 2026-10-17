import { useForm } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, redirect, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PRODUCT_CATEGORIES, type Product, type ProductCategory } from "@/lib/db";
import { getServerSession } from "@/lib/server/auth";
import { deleteProduct, getProducts, updateProduct } from "@/lib/server/products";
import { getDashboardUserSummary } from "@/lib/server/users";

type FormData = {
	name: string;
	description: string;
	price: string;
	stock: string;
	category: ProductCategory;
	sizes: string;
	careInstructions: string;
	imageUrl: string;
};

export const Route = createFileRoute("/products/$productId")({
	beforeLoad: async () => {
		const { session } = await getServerSession();
		if (!session) {
			return redirect({ to: "/demo/better-auth" }) as any;
		}
		const { canManageUsers } = await getDashboardUserSummary();
		if (!canManageUsers) {
			return redirect({ to: "/" }) as any;
		}
	},
	component: EditProduct,
});

function EditProduct() {
	const { productId } = useParams({
		from: "/products/$productId",
	});

	const productQuery = useQuery({
		queryKey: ["product", productId],
		queryFn: async () => {
			const products = await getProducts();
			return products.find((p) => p.id === productId);
		},
		enabled: !!productId,
	});
	const product = productQuery.data;

	if (productQuery.isPending) {
		return (
			<main className="page-wrap px-4 py-12">
				<p className="text-[var(--sea-ink-soft)]">Memuat produk kebaya...</p>
			</main>
		);
	}
	if (productQuery.isError) {
		return (
			<main className="page-wrap px-4 py-12">
				<p className="text-[var(--dashboard-danger)]" role="alert">
					Produk kebaya gagal dimuat: {productQuery.error.message}
				</p>
			</main>
		);
	}
	if (!product) {
		return (
			<main className="page-wrap px-4 py-12">
				<p className="text-[var(--sea-ink-soft)]">Produk kebaya tidak ditemukan.</p>
			</main>
		);
	}

	return <EditProductForm product={product} productId={productId} />;
}

function EditProductForm({ product, productId }: { product: Product; productId: string }) {
	const queryClient = useQueryClient();
	const updateFn = useServerFn(updateProduct);
	const deleteFn = useServerFn(deleteProduct);
	const [message, setMessage] = useState("");
	const [messageType, setMessageType] = useState<"success" | "error">("success");

	const form = useForm({
		defaultValues: {
			name: product.name,
			description: product.description,
			price: String(product.price),
			stock: String(product.stock),
			category: product.category,
			sizes: product.sizes.join(", "),
			careInstructions: product.careInstructions,
			imageUrl: product.imageUrl,
		} as FormData,
		onSubmit: async ({ value }) => {
			setMessage("");
			if (!value.name.trim() || !value.description.trim()) {
				setMessageType("error");
				setMessage("Nama dan deskripsi wajib diisi.");
				return;
			}
			if (value.price.trim() === "" || value.stock.trim() === "") {
				setMessageType("error");
				setMessage("Harga dan persediaan wajib diisi.");
				return;
			}
			const price = Number(value.price);
			const stock = Number(value.stock);
			if (!Number.isFinite(price) || price <= 0) {
				setMessageType("error");
				setMessage("Harga harus lebih besar dari nol.");
				return;
			}
			if (!Number.isInteger(stock) || stock < 0) {
				setMessageType("error");
				setMessage("Stok harus berupa bilangan bulat nol atau lebih.");
				return;
			}
			try {
				await updateFn({
					data: {
						id: productId,
						name: value.name,
						description: value.description,
						category: value.category,
						price,
						stock,
						sizes: value.sizes
							.split(",")
							.map((size) => size.trim())
							.filter(Boolean),
						careInstructions: value.careInstructions,
						imageUrl: value.imageUrl.trim(),
					},
				});
				setMessageType("success");
				setMessage("Perubahan produk berhasil disimpan.");
				await Promise.all([
					queryClient.invalidateQueries({ queryKey: ["products"] }),
					queryClient.invalidateQueries({ queryKey: ["storefront", "products"] }),
					queryClient.invalidateQueries({ queryKey: ["storefront", "product", productId] }),
				]);
			} catch (err) {
				setMessageType("error");
				setMessage(err instanceof Error ? err.message : "Produk kebaya gagal diperbarui.");
			}
		},
	});

	const errorsFor = (name: keyof FormData) => form.getFieldMeta(name)?.errors ?? [];

	const handleDelete = async () => {
		if (!window.confirm("Hapus produk kebaya ini dari katalog?")) {
			return;
		}
		try {
			await deleteFn({ data: { id: productId } });
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["products"] }),
				queryClient.invalidateQueries({ queryKey: ["storefront", "products"] }),
				queryClient.invalidateQueries({ queryKey: ["storefront", "product", productId] }),
			]);
			window.location.href = "/products";
		} catch (err) {
			setMessageType("error");
			setMessage(err instanceof Error ? err.message : "Produk gagal dihapus.");
		}
	};

	return (
		<main className="page-wrap px-4 py-12">
			<section className="island-shell rounded-2xl p-6 sm:p-8">
				<div className="flex items-center gap-3 mb-6">
					<Link
						to="/products"
						className="text-xs text-[var(--sea-ink-soft)] underline underline-offset-4 hover:text-[var(--sea-ink)]"
					>
						&larr; Kembali ke katalog
					</Link>
					<h1 className="display-title text-3xl font-bold text-[var(--sea-ink)] sm:text-4xl">
						Edit produk
					</h1>
				</div>

				<>
					{message && (
						<div
							role={messageType === "error" ? "alert" : "status"}
							className={`form-message-${messageType} mb-5 rounded-xl border p-4 text-sm font-medium`}
						>
							{message}
						</div>
					)}

					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
						className="space-y-5"
					>
						<div className="space-y-2">
							<Label htmlFor="name">Nama produk</Label>
							<Input
								id="name"
								required
								value={form.getFieldValue("name")}
								onChange={(e) => form.setFieldValue("name", e.target.value)}
								className="w-full"
							/>
							{errorsFor("name").length > 0 && (
								<p className="text-xs text-[var(--dashboard-danger)]">
									{errorsFor("name").join(", ")}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Deskripsi, bahan, dan ukuran</Label>
							<Textarea
								id="description"
								required
								rows={3}
								value={form.getFieldValue("description")}
								onChange={(e) => form.setFieldValue("description", e.target.value)}
								className="w-full"
							/>
							{errorsFor("description").length > 0 && (
								<p className="text-xs text-[var(--dashboard-danger)]">
									{errorsFor("description").join(", ")}
								</p>
							)}
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="category">Kategori</Label>
								<select
									id="category"
									value={form.getFieldValue("category")}
									onChange={(event) =>
										form.setFieldValue("category", event.target.value as ProductCategory)
									}
									className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
								>
									{PRODUCT_CATEGORIES.map((category) => (
										<option key={category} value={category}>
											{category}
										</option>
									))}
								</select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="sizes">Variasi ukuran</Label>
								<Input
									id="sizes"
									required
									value={form.getFieldValue("sizes")}
									onChange={(event) => form.setFieldValue("sizes", event.target.value)}
									placeholder="S, M, L, XL atau All Size"
									className="w-full"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="careInstructions">Panduan perawatan</Label>
							<Textarea
								id="careInstructions"
								required
								rows={2}
								value={form.getFieldValue("careInstructions")}
								onChange={(event) => form.setFieldValue("careInstructions", event.target.value)}
								className="w-full"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="imageUrl">URL gambar produk (opsional)</Label>
							<Input
								id="imageUrl"
								type="url"
								value={form.getFieldValue("imageUrl")}
								onChange={(event) => form.setFieldValue("imageUrl", event.target.value)}
								placeholder="https://..."
								className="w-full"
							/>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="price">Harga jual (Rp)</Label>
								<Input
									id="price"
									type="number"
									min="1"
									step="500"
									required
									value={form.getFieldValue("price")}
									onChange={(e) => form.setFieldValue("price", e.target.value)}
									className="w-full"
								/>
								{errorsFor("price").length > 0 && (
									<p className="text-xs text-[var(--dashboard-danger)]">
										{errorsFor("price").join(", ")}
									</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="stock">Stok (unit)</Label>
								<Input
									id="stock"
									type="number"
									min="0"
									step="1"
									required
									value={form.getFieldValue("stock")}
									onChange={(e) => form.setFieldValue("stock", e.target.value)}
									className="w-full"
								/>
								{errorsFor("stock").length > 0 && (
									<p className="text-xs text-[var(--dashboard-danger)]">
										{errorsFor("stock").join(", ")}
									</p>
								)}
							</div>
						</div>

						<div className="flex gap-3 pt-6">
							<Button
								type="submit"
								disabled={form.state.isSubmitting}
								className="brand-button w-full sm:w-auto"
							>
								{form.state.isSubmitting ? "Menyimpan..." : "Simpan perubahan"}
							</Button>
							<button
								type="button"
								onClick={handleDelete}
								className="w-full rounded-xl border border-[var(--dashboard-danger-soft)] bg-[var(--dashboard-danger-soft)] px-5 py-3 text-sm font-semibold text-[var(--dashboard-danger)] transition-colors hover:opacity-80 disabled:opacity-50 sm:w-auto"
								disabled={form.state.isSubmitting}
							>
								Hapus produk
							</button>
						</div>
					</form>
				</>
			</section>
		</main>
	);
}
