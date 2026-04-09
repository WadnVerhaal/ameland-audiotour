import { InputHTMLAttributes } from 'react';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-stone-400 ${props.className ?? ''}`}
    />
  );
}
