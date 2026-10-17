import { Flower2 } from "lucide-react";

export default function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer className="site-footer mt-16 px-4 pb-8 pt-8 text-[var(--sea-ink-soft)] sm:mt-20 sm:pb-10">
			<div className="page-wrap flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
				<div className="flex items-center gap-3">
					<span className="brand-mark">
						<Flower2 size={17} aria-hidden="true" />
					</span>
					<div>
						<p className="m-0 text-sm font-extrabold tracking-[0.12em] text-[var(--sea-ink)]">
							KAIN &amp; KEBAYA
						</p>
						<p className="m-0 mt-0.5 text-xs">Keanggunan tradisi untuk setiap cerita.</p>
					</div>
				</div>
				<p className="m-0 text-xs">
					&copy; {year} Kain &amp; Kebaya. Warisan dalam setiap jahitan.
				</p>
			</div>
		</footer>
	);
}
