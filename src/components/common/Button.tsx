import { type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'logout' | 'keychain' | 'buy'
  fullWidth?: boolean
}

export default function Button({ variant = 'primary', fullWidth, children, className = '', style, ...rest }: ButtonProps) {
  const base = 'cursor-pointer border-none rounded-lg font-raleway font-medium transition-all duration-300 tracking-wide'

  const variants: Record<string, string> = {
    primary:  'bg-gradient-to-br from-blue-700 to-blue-400 text-white px-6 py-2.5 text-sm shadow-[0_0_20px_rgba(0,170,255,0.3)] hover:-translate-y-0.5 hover:shadow-[0_4px_30px_rgba(0,170,255,0.5)]',
    logout:   'bg-red-500/15 text-red-300 border border-red-500/30 px-4 py-2 text-sm hover:bg-red-500/25',
    keychain: 'bg-gradient-to-br from-blue-800 to-blue-500 text-white py-4 text-base rounded-xl shadow-[0_4px_30px_rgba(0,136,255,0.35)] hover:-translate-y-0.5 hover:shadow-[0_8px_40px_rgba(0,136,255,0.5)] flex items-center justify-center gap-2.5',
    buy:      'bg-gradient-to-br from-blue-900 to-blue-600 text-white py-2.5 text-sm rounded-lg hover:from-blue-800 hover:to-blue-500 hover:-translate-y-px disabled:from-blue-950 disabled:text-gray-500 disabled:cursor-not-allowed disabled:translate-y-0',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </button>
  )
}
