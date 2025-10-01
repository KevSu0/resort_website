import * as React from "react"
import { type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"
import { buttonVariants } from "./button.utils"

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

export { Button }




