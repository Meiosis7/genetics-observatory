import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface EditorialCardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export function EditorialCard({ children, className = '', ...props }: EditorialCardProps) {
  return <button className={`mode-card ${className}`.trim()} {...props}>{children}</button>
}
