import * as React from 'react'
import * as SheetPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/services/utils'

const Sheet = SheetPrimitive.Root
const SheetTrigger = SheetPrimitive.Trigger
const SheetClose = SheetPrimitive.Close

const SheetOverlay = React.forwardRef(({ className, ...props }, ref) => (
    <SheetPrimitive.Overlay
        className={cn('fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0', className)}
        {...props}
        ref={ref}
    />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const SheetContent = React.forwardRef(({ className, children, ...props }, ref) => (
    <SheetPrimitive.Portal>
        <SheetOverlay />
        <SheetPrimitive.Content
            ref={ref}
            className={cn(
                'fixed inset-y-0 right-0 z-50 h-full w-3/4 max-w-sm bg-background dark:bg-slate-950 border-l dark:border-slate-800 shadow-xl transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-300 text-foreground dark:text-slate-100',
                className
            )}
            {...props}
        >
            {children}
            <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </SheetPrimitive.Close>
        </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({ className, ...props }) => (
    <div className={cn('flex flex-col space-y-1 p-6 pb-0', className)} {...props} />
)

const SheetTitle = React.forwardRef(({ className, ...props }, ref) => (
    <SheetPrimitive.Title ref={ref} className={cn('text-base font-semibold', className)} {...props} />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetTitle }
