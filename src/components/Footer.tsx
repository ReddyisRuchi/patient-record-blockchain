export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-10 mt-20">
      <div className="container-max text-center">
      

       

        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()}  All rights reserved.
        </p>
      </div>
    </footer>
  );
}