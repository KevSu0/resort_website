import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-white transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-lg before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
        destructive:
          "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-lg before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
        outline:
          "border-2 border-blue-600 bg-white text-blue-600 shadow-md hover:bg-blue-600 hover:text-white hover:shadow-lg hover:-translate-y-0.5 hover:border-blue-700 hover:scale-[1.02] active:translate-y-0 active:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800",
        secondary:
          "bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-lg before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
        ghost: "text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:scale-105 active:scale-95 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800",
        link: "text-blue-600 underline-offset-4 hover:underline hover:text-blue-700 dark:text-slate-400 dark:hover:text-slate-200",
        gradient: "bg-gradient-to-r from-blue-600 via-purple-600 to-gray-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:shadow-lg before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
        luxury: "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:shadow-purple-200/20 active:translate-y-0 active:shadow-lg before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
      },
      size: {
        default: "h-11 px-6 py-2.5 text-sm",
        sm: "h-9 px-4 py-2 text-xs",
        lg: "h-13 px-8 py-3 text-base",
        xl: "h-14 px-10 py-4 text-lg",
        icon: "h-11 w-11",
        "icon-sm": "h-9 w-9",
        "icon-lg": "h-13 w-13",
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      },
      loading: {
        true: "pointer-events-none opacity-75",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
      loading: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    fullWidth,
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    asChild = false,
    type,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading
    const classNames = cn(buttonVariants({ variant, size, fullWidth, loading, className }))

    const LoadingSpinner = (
      <svg
        className="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    )

    const renderContent = (content: React.ReactNode) => (
      <>
        {loading && LoadingSpinner}
        {!loading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {content && <span className={loading ? 'opacity-0' : 'opacity-100'}>{content}</span>}
        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </>
    )

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement
      const existingAriaDisabled = (child.props as Record<string, unknown>)['aria-disabled']
      return React.cloneElement(child, {
        ...props,
        className: cn(classNames, (child.props as { className?: string }).className),
        ...(isDisabled ? { 'aria-disabled': true } : existingAriaDisabled ? { 'aria-disabled': existingAriaDisabled } : {}),
        children: renderContent(child.props.children),
      })
    }

    return (
      <button
        className={classNames}
        ref={ref}
        disabled={isDisabled}
        type={type ?? 'button'}
        {...props}
      >
        {renderContent(children)}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }




