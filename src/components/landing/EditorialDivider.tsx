export const EditorialDivider = ({ className }: { className?: string }) => (
  <div className={`flex items-center justify-center gap-4 ${className} opacity-30`}>
    <div className="h-[1px] w-24 bg-gradient-to-r from-transparent to-current" />
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M12 2L15 12H9L12 2Z" fill="currentColor" opacity="0.5" />
      <circle cx="12" cy="18" r="2" />
    </svg>
    <div className="h-[1px] w-24 bg-gradient-to-l from-transparent to-current" />
  </div>
);
