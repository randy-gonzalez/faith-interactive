/**
 * Themed Button Component
 *
 * A button component for the public church site that uses CSS variables exclusively.
 * All colors, spacing, and radius are derived from the church's theme tokens.
 *
 * IMPORTANT: This component MUST use CSS variables only - no hardcoded colors.
 *
 * CSS Variables Used:
 * - --btn-primary-bg, --btn-primary-text
 * - --btn-secondary-bg, --btn-secondary-text
 * - --btn-accent-bg, --btn-accent-text
 * - --btn-outline-border, --btn-outline-text
 * - --btn-radius
 * - --space-* for padding
 * - --color-surface, --color-text for ghost variant
 */

import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes } from "react";

// =============================================================================
// TYPES
// =============================================================================

export type ThemedButtonVariant = "primary" | "secondary" | "accent" | "outline" | "ghost";
export type ThemedButtonSize = "sm" | "md" | "lg";

interface BaseProps {
  variant?: ThemedButtonVariant;
  size?: ThemedButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
}

export interface ThemedButtonProps
  extends BaseProps,
    ButtonHTMLAttributes<HTMLButtonElement> {
  as?: "button";
}

export interface ThemedLinkButtonProps
  extends BaseProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  as: "a";
  href: string;
}

// =============================================================================
// STYLES
// =============================================================================

/**
 * Variant styles using CSS variables.
 * Each variant uses the corresponding --btn-* variables.
 */
const variantClasses: Record<ThemedButtonVariant, string> = {
  primary: `
    bg-[var(--btn-primary-bg)]
    text-[var(--btn-primary-text)]
    hover:opacity-90
    focus:ring-[var(--btn-primary-bg)]
  `,
  secondary: `
    bg-[var(--btn-secondary-bg)]
    text-[var(--btn-secondary-text)]
    hover:opacity-90
    focus:ring-[var(--btn-secondary-bg)]
  `,
  accent: `
    bg-[var(--btn-accent-bg)]
    text-[var(--btn-accent-text)]
    hover:opacity-90
    focus:ring-[var(--btn-accent-bg)]
  `,
  outline: `
    bg-transparent
    text-[var(--btn-outline-text)]
    border-2
    border-[var(--btn-outline-border)]
    hover:bg-[var(--btn-outline-border)]
    hover:text-[var(--btn-primary-text)]
    focus:ring-[var(--btn-outline-border)]
  `,
  ghost: `
    bg-transparent
    text-[var(--color-text)]
    hover:bg-[var(--color-surface-muted)]
    focus:ring-[var(--color-border)]
  `,
};

/**
 * Size styles using CSS spacing variables.
 */
const sizeClasses: Record<ThemedButtonSize, string> = {
  sm: "px-[var(--space-3)] py-[var(--space-2)] text-sm",
  md: "px-[var(--space-4)] py-[var(--space-3)] text-base",
  lg: "px-[var(--space-6)] py-[var(--space-4)] text-lg",
};

/**
 * Shared base classes for all buttons.
 */
const baseClasses = `
  inline-flex
  items-center
  justify-center
  font-semibold
  rounded-[var(--btn-radius)]
  transition-all
  duration-150
  focus:outline-none
  focus:ring-2
  focus:ring-offset-2
  disabled:opacity-50
  disabled:cursor-not-allowed
`;

// =============================================================================
// LOADING SPINNER
// =============================================================================

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4"
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
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Themed Button Component
 *
 * Can render as either a <button> or an <a> element.
 *
 * @example
 * // As a button
 * <ThemedButton variant="primary" size="md" onClick={handleClick}>
 *   Click Me
 * </ThemedButton>
 *
 * @example
 * // As a link
 * <ThemedButton as="a" href="/about" variant="outline">
 *   Learn More
 * </ThemedButton>
 */
export const ThemedButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ThemedButtonProps | ThemedLinkButtonProps
>((props, ref) => {
  const {
    as = "button",
    variant = "primary",
    size = "md",
    isLoading = false,
    fullWidth = false,
    className = "",
    children,
    ...rest
  } = props;

  const combinedClassName = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? "w-full" : ""}
    ${className}
  `
    .replace(/\s+/g, " ")
    .trim();

  if (as === "a") {
    const linkProps = rest as Omit<ThemedLinkButtonProps, keyof BaseProps | "as">;
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={combinedClassName}
        {...linkProps}
      >
        {isLoading && <LoadingSpinner />}
        {children}
      </a>
    );
  }

  const buttonProps = rest as Omit<ThemedButtonProps, keyof BaseProps | "as">;
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={combinedClassName}
      disabled={buttonProps.disabled || isLoading}
      {...buttonProps}
    >
      {isLoading && <LoadingSpinner />}
      {isLoading ? "Loading..." : children}
    </button>
  );
});

ThemedButton.displayName = "ThemedButton";

// =============================================================================
// CONVENIENCE EXPORTS
// =============================================================================

/**
 * Primary button shorthand.
 */
export function PrimaryButton(
  props: Omit<ThemedButtonProps, "variant"> | Omit<ThemedLinkButtonProps, "variant">
) {
  return <ThemedButton {...props} variant="primary" />;
}

/**
 * Secondary button shorthand.
 */
export function SecondaryButton(
  props: Omit<ThemedButtonProps, "variant"> | Omit<ThemedLinkButtonProps, "variant">
) {
  return <ThemedButton {...props} variant="secondary" />;
}

/**
 * Outline button shorthand.
 */
export function OutlineButton(
  props: Omit<ThemedButtonProps, "variant"> | Omit<ThemedLinkButtonProps, "variant">
) {
  return <ThemedButton {...props} variant="outline" />;
}
