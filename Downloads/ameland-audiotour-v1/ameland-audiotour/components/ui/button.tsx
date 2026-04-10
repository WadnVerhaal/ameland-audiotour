import { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

export function Button({ variant = 'primary', className = '', ...props }: Props) {
  const base =
    'inline-flex items-center justify-center rounded-2xl px-4 py-3 font-medium transition disabled:cursor-not-allowed disabled:opacity-60';

  const styles = {
    primary:
      'bg-app-accent text-white hover:opacity-90 shadow-card',
    secondary:
      'border border-app bg-white text-app-accent hover:bg-app-card shadow-card',
    ghost:
      'bg-transparent text-app-muted hover:bg-white/70',
  }[variant];

  return <button className={`${base} ${styles} ${className}`} {...props} />;
}