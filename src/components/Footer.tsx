import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-slate-300 py-10 mt-20">
      <div className="container-max text-center">
        <Link href="/about" className="text-sm text-slate-400 hover:text-white transition-colors">
          About Us
        </Link>
      </div>
    </footer>
  );
}