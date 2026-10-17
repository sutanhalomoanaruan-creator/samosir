import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "#/lib/auth-client";

export const Route = createFileRoute("/demo/better-auth")({
	component: BetterAuthDemo,
});

function BetterAuthDemo() {
	const { data: session, isPending } = authClient.useSession();
	const [isSignUp, setIsSignUp] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	if (isPending) {
		return (
			<main className="demo-page demo-center">
				<div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-emerald-700" />
			</main>
		);
	}

	if (session?.user) {
		return (
			<main className="grid min-h-[70vh] place-items-center bg-white px-4 py-12">
				<section className="w-full max-w-md space-y-6 rounded-2xl border border-gray-200 bg-white p-7 shadow-md sm:p-9">
					<div className="space-y-1.5">
						<p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-800">
							Kain &amp; Kebaya
						</p>
						<h1 className="font-serif text-3xl text-stone-950">Anda sudah masuk</h1>
						<p className="text-sm text-stone-600">Sesi aktif: {session.user.email}</p>
					</div>

					<div className="flex items-center gap-3">
						{session.user.image ? (
							<img src={session.user.image} alt="" className="h-10 w-10" />
						) : (
							<div className="grid h-10 w-10 place-items-center rounded-full bg-amber-100">
								<span className="text-sm font-bold text-amber-900">
									{session.user.name?.charAt(0).toUpperCase() || "U"}
								</span>
							</div>
						)}
						<div className="flex-1 min-w-0">
							<p className="truncate text-sm font-medium text-stone-900">{session.user.name}</p>
							<p className="truncate text-xs text-stone-500">{session.user.email}</p>
						</div>
					</div>

					<button
						type="button"
						onClick={() => {
							void authClient.signOut();
						}}
						className="w-full rounded-full border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-50"
					>
						Keluar
					</button>
				</section>
			</main>
		);
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			if (isSignUp) {
				const result = await authClient.signUp.email({
					email,
					password,
					name,
				});
				if (result.error) {
					setError(result.error.message || "Sign up failed");
				}
			} else {
				const result = await authClient.signIn.email({
					email,
					password,
				});
				if (result.error) {
					setError(result.error.message || "Sign in failed");
				}
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Terjadi kesalahan saat autentikasi.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="grid min-h-[70vh] place-items-center bg-white px-4 py-12">
			<section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-7 shadow-md sm:p-9">
				<p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-800">
					Kain &amp; Kebaya
				</p>
				<h1 className="font-serif text-3xl text-stone-950">
					{isSignUp ? "Buat akun pelanggan" : "Selamat datang kembali"}
				</h1>
				<p className="mb-6 mt-2 text-sm leading-6 text-stone-600">
					{isSignUp
						? "Daftar untuk menyimpan keranjang dan membuat pesanan."
						: "Masuk untuk melanjutkan ke checkout dan melihat pesanan Anda."}
				</p>

				<form onSubmit={handleSubmit} className="grid gap-4">
					{isSignUp && (
						<div className="grid gap-2">
							<label htmlFor="name" className="text-sm font-semibold leading-none text-stone-800">
								Nama lengkap
							</label>
							<input
								id="name"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
								required
							/>
						</div>
					)}

					<div className="grid gap-2">
						<label htmlFor="email" className="text-sm font-semibold leading-none text-stone-800">
							Email
						</label>
						<input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
							required
						/>
					</div>

					<div className="grid gap-2">
						<label htmlFor="password" className="text-sm font-semibold leading-none text-stone-800">
							Kata sandi
						</label>
						<input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
							required
							minLength={8}
						/>
					</div>

					{error && (
						<div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3">
							<p className="m-0 text-sm text-rose-800">{error}</p>
						</div>
					)}

					<button
						type="submit"
						disabled={loading}
						className="w-full rounded-full bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:opacity-60"
					>
						{loading ? (
							<span className="flex items-center justify-center gap-2">
								<span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-300 border-t-white" />
								<span>Memproses...</span>
							</span>
						) : isSignUp ? (
							"Buat akun"
						) : (
							"Masuk"
						)}
					</button>
				</form>

				<div className="mt-4 text-center">
					<button
						type="button"
						onClick={() => {
							setIsSignUp(!isSignUp);
							setError("");
						}}
						className="text-sm font-medium text-stone-600 transition-colors hover:text-amber-900"
					>
						{isSignUp ? "Sudah punya akun? Masuk" : "Belum punya akun? Daftar"}
					</button>
				</div>
			</section>
		</main>
	);
}
