import { InputHTMLAttributes } from 'react';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-app bg-white px-4 py-3 text-app outline-none transition placeholder:text-app-muted/70 focus:border-[#bfae8a] focus:ring-2 focus:ring-[#e9dfbf] ${props.className ?? ''}`}
    />
  );
}