export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-surface-950 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-brand animate-pulse-brand" />
        <p className="text-surface-500 text-sm font-mono">loading…</p>
      </div>
    </div>
  );
}
