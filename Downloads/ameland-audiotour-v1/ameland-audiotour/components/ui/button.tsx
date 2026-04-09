import { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

export function Button({ variant = 'primary', className = '', ...props }: Props) {
  const base = 'inline-flex items-center justify-center rounded-2xl px-4 py-3 font-medium transition';
  const styles = {
    primary: 'bg-stone-900 text-white hover:bg-stone-800',
    secondary: 'bg-stone-100 text-stone-900 hover:bg-stone-200',
    ghost: 'bg-transparent text-stone-700 hover:bg-stone-100',
  }[variant];

  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
