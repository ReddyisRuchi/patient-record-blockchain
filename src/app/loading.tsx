export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-slate-200 dark:border-neutral-800" />
          <div className="absolute inset-0 rounded-full border-2 border-t-slate-900 dark:border-t-white animate-spin" />
        </div>
        <p className="text-sm text-slate-400 dark:text-neutral-500 tracking-widest uppercase">Loading</p>
      </div>
    </div>
  );
}
