import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="medical-gradient text-white py-28">
      <div className="container-max text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Secure Patient Record Management
        </h1>

        <p className="text-lg md:text-xl mb-8 opacity-90">
          A trusted healthcare platform ensuring safe, reliable and controlled access to medical records.
        </p>

        <div className="flex justify-center gap-4">
          <Link href="/register" className="btn-primary">
            Register
          </Link>

          <Link href="/login" className="btn-outline bg-white text-blue-600">
            Login
          </Link>

          <Link href="/donor" className="btn-secondary">
            Register as Donor
          </Link>
        </div>
      </div>
    </section>
  );
}