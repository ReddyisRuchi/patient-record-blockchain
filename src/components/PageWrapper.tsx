export default function PageWrapper({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="card w-full max-w-md">
          <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">
            {title}
          </h2>
          {children}
        </div>
      </div>
    </div>
  );
}