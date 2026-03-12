import { cn } from '@/services/utils'

export function Input({ className, ...props }) {
    return (
        <input
            className={cn(
                'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground disabled:opacity-50',
                className
            )}
            {...props}
        />
    )
}

export function Textarea({ className, ...props }) {
    return (
        <textarea
            className={cn(
                'flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground disabled:opacity-50 resize-y',
                className
            )}
            {...props}
        />
    )
}

export function Label({ className, ...props }) {
    return (
        <label
            className={cn('text-sm font-medium leading-none peer-disabled:opacity-70', className)}
            {...props}
        />
    )
}

export function FormField({ label, hint, children }) {
    return (
        <div className="space-y-1.5">
            {label && <Label>{label}</Label>}
            {children}
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
    )
}
