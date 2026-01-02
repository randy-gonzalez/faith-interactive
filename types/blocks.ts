/**
 * Block Type Definitions
 *
 * Type system for the page block editor.
 * Blocks are stored as JSON in the database.
 */

// Shared background configuration for all blocks
export interface BlockBackground {
  type: "color" | "gradient" | "image" | "video";
  color?: string;
  gradient?: string; // CSS gradient string
  imageUrl?: string;
  videoUrl?: string;
  overlay?: string; // Optional overlay color/opacity
}

// Advanced settings for all blocks
export interface BlockAdvanced {
  cssClasses?: string; // Custom CSS classes
  elementId?: string; // HTML id attribute
  ariaLabel?: string; // Accessibility label
  dataAttributes?: string; // Custom data-* attributes (key=value, one per line)
}

// Base block interface - all blocks extend this
export interface BaseBlock {
  id: string; // Unique block ID (cuid)
  type: string; // Block type identifier
  order: number; // Sort order within page
  background?: BlockBackground; // Shared background settings
  advanced?: BlockAdvanced; // Advanced settings (CSS classes, ID, etc.)
}

// Hero block - full-width banner with heading, CTA buttons
export interface HeroBlock extends BaseBlock {
  type: "hero";
  data: {
    heading: string;
    subheading?: string;
    alignment: "left" | "center" | "right";
    buttons: Array<{
      id: string;
      label: string;
      url: string;
      variant: "primary" | "secondary";
    }>;
  };
}

// Text block - rich text content
export interface TextBlock extends BaseBlock {
  type: "text";
  data: {
    content: string; // HTML from rich text editor
    alignment: "left" | "center" | "right";
    maxWidth: "narrow" | "medium" | "full";
  };
}

// Image block - single image with optional caption
export interface ImageBlock extends BaseBlock {
  type: "image";
  data: {
    imageUrl: string;
    alt: string;
    caption?: string;
    size: "small" | "medium" | "large" | "full";
    alignment: "left" | "center" | "right";
  };
}

// Video block - embedded video
export interface VideoBlock extends BaseBlock {
  type: "video";
  data: {
    videoUrl: string;
    aspectRatio: "16:9" | "4:3" | "1:1";
    autoplay: boolean;
  };
}

// Card Grid block - grid of cards
export interface CardGridBlock extends BaseBlock {
  type: "card-grid";
  data: {
    columns: 2 | 3 | 4;
    cards: Array<{
      id: string;
      imageUrl?: string;
      title: string;
      description?: string;
      linkUrl?: string;
      linkText?: string;
    }>;
  };
}

// Feature block - side-by-side image and text
export interface FeatureBlock extends BaseBlock {
  type: "feature";
  data: {
    imageUrl: string;
    imagePosition: "left" | "right";
    heading: string;
    content: string; // HTML
    buttonText?: string;
    buttonUrl?: string;
  };
}

// Service Times block - worship schedule
export interface ServiceTimesBlock extends BaseBlock {
  type: "service-times";
  data: {
    heading: string;
    services: Array<{
      id: string;
      name: string;
      time: string;
      location?: string;
      description?: string;
    }>;
  };
}

// Contact block - contact info and optional form
export interface ContactBlock extends BaseBlock {
  type: "contact";
  data: {
    heading: string;
    address?: string;
    phone?: string;
    email?: string;
    showMap: boolean;
    mapEmbedUrl?: string;
  };
}

// Sermon Feature block - display sermons from library
export interface SermonFeatureBlock extends BaseBlock {
  type: "sermon-feature";
  data: {
    heading: string;
    displayMode: "latest" | "featured";
    count: number;
    showDescription: boolean;
    buttonText: string;
    buttonUrl: string;
  };
}

// Events Feature block - display upcoming events
export interface EventsFeatureBlock extends BaseBlock {
  type: "events-feature";
  data: {
    heading: string;
    count: number;
    showDescription: boolean;
    buttonText: string;
    buttonUrl: string;
  };
}

// Accordion block - collapsible FAQ-style content
export interface AccordionBlock extends BaseBlock {
  type: "accordion";
  data: {
    heading?: string;
    items: Array<{
      id: string;
      title: string;
      content: string; // HTML
      defaultOpen: boolean;
    }>;
  };
}

// Divider block - visual separator
export interface DividerBlock extends BaseBlock {
  type: "divider";
  data: {
    style: "line" | "space" | "dots";
    height: "small" | "medium" | "large";
  };
}

// Button Group block - multiple CTAs
export interface ButtonGroupBlock extends BaseBlock {
  type: "button-group";
  data: {
    alignment: "left" | "center" | "right";
    buttons: Array<{
      id: string;
      text: string;
      url: string;
      variant: "primary" | "secondary" | "outline";
    }>;
  };
}

// Union type for all block types
export type Block =
  | HeroBlock
  | TextBlock
  | ImageBlock
  | VideoBlock
  | CardGridBlock
  | FeatureBlock
  | ServiceTimesBlock
  | ContactBlock
  | SermonFeatureBlock
  | EventsFeatureBlock
  | AccordionBlock
  | DividerBlock
  | ButtonGroupBlock;

// Page blocks array type
export type PageBlocks = Block[];

// Type guard functions
export function isHeroBlock(block: Block): block is HeroBlock {
  return block.type === "hero";
}
export function isTextBlock(block: Block): block is TextBlock {
  return block.type === "text";
}
export function isImageBlock(block: Block): block is ImageBlock {
  return block.type === "image";
}
export function isVideoBlock(block: Block): block is VideoBlock {
  return block.type === "video";
}
export function isCardGridBlock(block: Block): block is CardGridBlock {
  return block.type === "card-grid";
}
export function isFeatureBlock(block: Block): block is FeatureBlock {
  return block.type === "feature";
}
export function isServiceTimesBlock(block: Block): block is ServiceTimesBlock {
  return block.type === "service-times";
}
export function isContactBlock(block: Block): block is ContactBlock {
  return block.type === "contact";
}
export function isSermonFeatureBlock(block: Block): block is SermonFeatureBlock {
  return block.type === "sermon-feature";
}
export function isEventsFeatureBlock(block: Block): block is EventsFeatureBlock {
  return block.type === "events-feature";
}
export function isAccordionBlock(block: Block): block is AccordionBlock {
  return block.type === "accordion";
}
export function isDividerBlock(block: Block): block is DividerBlock {
  return block.type === "divider";
}
export function isButtonGroupBlock(block: Block): block is ButtonGroupBlock {
  return block.type === "button-group";
}

// Default background
export function createDefaultBackground(): BlockBackground {
  return {
    type: "color",
    color: "#1e40af",
  };
}

// Default block data factories
export function createHeroBlock(id: string, order: number): HeroBlock {
  return {
    id,
    type: "hero",
    order,
    background: createDefaultBackground(),
    data: {
      heading: "",
      subheading: "",
      alignment: "center",
      buttons: [],
    },
  };
}

export function createTextBlock(id: string, order: number): TextBlock {
  return {
    id,
    type: "text",
    order,
    data: {
      content: "",
      alignment: "left",
      maxWidth: "medium",
    },
  };
}

export function createImageBlock(id: string, order: number): ImageBlock {
  return {
    id,
    type: "image",
    order,
    data: {
      imageUrl: "",
      alt: "",
      caption: "",
      size: "large",
      alignment: "center",
    },
  };
}

export function createVideoBlock(id: string, order: number): VideoBlock {
  return {
    id,
    type: "video",
    order,
    data: {
      videoUrl: "",
      aspectRatio: "16:9",
      autoplay: false,
    },
  };
}

export function createCardGridBlock(id: string, order: number): CardGridBlock {
  return {
    id,
    type: "card-grid",
    order,
    data: {
      columns: 3,
      cards: [],
    },
  };
}

export function createFeatureBlock(id: string, order: number): FeatureBlock {
  return {
    id,
    type: "feature",
    order,
    data: {
      imageUrl: "",
      imagePosition: "left",
      heading: "",
      content: "",
      buttonText: "",
      buttonUrl: "",
    },
  };
}

export function createServiceTimesBlock(id: string, order: number): ServiceTimesBlock {
  return {
    id,
    type: "service-times",
    order,
    data: {
      heading: "Service Times",
      services: [],
    },
  };
}

export function createContactBlock(id: string, order: number): ContactBlock {
  return {
    id,
    type: "contact",
    order,
    data: {
      heading: "Contact Us",
      address: "",
      phone: "",
      email: "",
      showMap: false,
      mapEmbedUrl: "",
    },
  };
}

export function createSermonFeatureBlock(id: string, order: number): SermonFeatureBlock {
  return {
    id,
    type: "sermon-feature",
    order,
    data: {
      heading: "Recent Sermons",
      displayMode: "latest",
      count: 3,
      showDescription: true,
      buttonText: "View All Sermons",
      buttonUrl: "/sermons",
    },
  };
}

export function createEventsFeatureBlock(id: string, order: number): EventsFeatureBlock {
  return {
    id,
    type: "events-feature",
    order,
    data: {
      heading: "Upcoming Events",
      count: 3,
      showDescription: true,
      buttonText: "View All Events",
      buttonUrl: "/events",
    },
  };
}

export function createAccordionBlock(id: string, order: number): AccordionBlock {
  return {
    id,
    type: "accordion",
    order,
    data: {
      heading: "",
      items: [],
    },
  };
}

export function createDividerBlock(id: string, order: number): DividerBlock {
  return {
    id,
    type: "divider",
    order,
    data: {
      style: "line",
      height: "medium",
    },
  };
}

export function createButtonGroupBlock(id: string, order: number): ButtonGroupBlock {
  return {
    id,
    type: "button-group",
    order,
    data: {
      alignment: "center",
      buttons: [],
    },
  };
}

// Block type metadata for UI
export const BLOCK_TYPES = {
  hero: {
    name: "Hero",
    description: "Full-width banner with heading and call-to-action buttons",
    icon: "layout",
  },
  text: {
    name: "Text",
    description: "Rich text content block",
    icon: "type",
  },
  image: {
    name: "Image",
    description: "Single image with optional caption",
    icon: "image",
  },
  video: {
    name: "Video",
    description: "Embedded video from YouTube or Vimeo",
    icon: "video",
  },
  "card-grid": {
    name: "Card Grid",
    description: "Grid of cards for staff, ministries, etc.",
    icon: "grid",
  },
  feature: {
    name: "Feature",
    description: "Side-by-side image and text layout",
    icon: "columns",
  },
  "service-times": {
    name: "Service Times",
    description: "Display worship service schedule",
    icon: "clock",
  },
  contact: {
    name: "Contact",
    description: "Contact information with optional map",
    icon: "mail",
  },
  "sermon-feature": {
    name: "Sermon Feature",
    description: "Display recent or featured sermons",
    icon: "book-open",
  },
  "events-feature": {
    name: "Events Feature",
    description: "Display upcoming events",
    icon: "calendar",
  },
  accordion: {
    name: "Accordion",
    description: "Collapsible FAQ-style content",
    icon: "chevrons-down",
  },
  divider: {
    name: "Divider",
    description: "Visual separator between sections",
    icon: "minus",
  },
  "button-group": {
    name: "Button Group",
    description: "Multiple call-to-action buttons",
    icon: "mouse-pointer",
  },
} as const;

export type BlockType = keyof typeof BLOCK_TYPES;
