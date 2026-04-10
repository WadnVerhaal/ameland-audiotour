export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-[1.75rem] border border-app bg-app-card p-4 shadow-card ${className}`}>
      {children}
    </div>
  );
}