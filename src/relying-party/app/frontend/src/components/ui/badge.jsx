import { cn } from '@/services/utils'

const badgeVariants = {
    default: 'border border-input bg-secondary text-muted-foreground',
    destructive: 'border-transparent bg-destructive text-white',
}

export function Badge({ className, variant = 'default', ...props }) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                badgeVariants[variant],
                className
            )}
            {...props}
        />
    )
}
