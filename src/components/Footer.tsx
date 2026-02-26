export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-10 mt-20">
      <div className="container-max text-center">
        <h3 className="text-lg font-semibold text-white mb-2">
          HealthChain PRMS
        </h3>

        <p className="text-sm text-slate-400 mb-4">
          Secure and reliable patient record management system.
        </p>

        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} HealthChain. All rights reserved.
        </p>
      </div>
    </footer>
  );
}