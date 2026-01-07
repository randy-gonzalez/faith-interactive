/**
 * Theme System
 *
 * Design tokens and CSS variable generation for the church CMS.
 *
 * @example
 * import {
 *   ThemeTokens,
 *   generateCssVariables,
 *   roleToBgVar,
 *   roleToTextVar
 * } from "@/lib/theme";
 */

// Types and constants
export {
  // Types
  type ColorRole,
  type SpacingDensity,
  type ContentWidth,
  type TypographyTokens,
  type ThemeTokens,
  // Type guards
  isColorRole,
  // Constants
  FIXED_NEUTRALS,
  BASE_SPACING_RAMP,
  DENSITY_MULTIPLIERS,
  CONTENT_WIDTH_VALUES,
  DEFAULT_THEME_TOKENS,
  EXAMPLE_THEME_TOKENS,
} from "./tokens";

// CSS generation
export {
  generateCssVariables,
  generateGlobalStyles,
  getLuminance,
  getOnColor,
  calculateSpacingRamp,
  calculateHeadingSizes,
  getButtonRadius,
  formatFontFamily,
} from "./generate-css";

// Role helpers
export {
  roleToBgVar,
  roleToTextVar,
  roleToMutedTextVar,
  roleToBorderVar,
  safeRoleToBgVar,
  safeRoleToTextVar,
  roleToTailwindClasses,
  spaceVar,
  spacingClass,
} from "./role-helpers";
