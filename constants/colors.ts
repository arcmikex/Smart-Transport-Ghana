/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#12211B',
    tint: '#114B3A',

    // Core surfaces
    background: '#F6F4EE',
    foreground: '#12211B',

    // Cards / elevated surfaces
    card: '#FFFFFF',
    cardForeground: '#12211B',

    // Primary action color (buttons, links, active states)
    primary: '#114B3A',
    primaryForeground: '#FFFDF6',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#E8F0EC',
    secondaryForeground: '#114B3A',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#EDF1EE',
    mutedForeground: '#65736C',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#F6B73C',
    accentForeground: '#12211B',

    // Destructive actions (delete, error states)
    destructive: '#B94A48',
    destructiveForeground: '#FFFFFF',

    // Borders and input outlines
    border: '#DDE5DF',
    input: '#DDE5DF',
    success: '#2D8A62',
    navy: '#172A37',
    sand: '#F0E9D8',
  },

  dark: {
    text: '#F6F4EE',
    tint: '#F6B73C',
    background: '#10211B',
    foreground: '#F6F4EE',
    card: '#17352A',
    cardForeground: '#F6F4EE',
    primary: '#F6B73C',
    primaryForeground: '#172A37',
    secondary: '#214437',
    secondaryForeground: '#F6F4EE',
    muted: '#214437',
    mutedForeground: '#B8C8BF',
    accent: '#F6B73C',
    accentForeground: '#172A37',
    destructive: '#E47A72',
    destructiveForeground: '#FFFFFF',
    border: '#2E5142',
    input: '#2E5142',
    success: '#67C79A',
    navy: '#0C1A24',
    sand: '#3B382A',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 18,
};

export default colors;
