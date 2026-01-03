/**
 * Hostname Parser Tests
 *
 * Run with: npx vitest run lib/hostname/parser.test.ts
 */

import { describe, it, expect } from "vitest";
import {
  normalizeHostname,
  isLocalHostname,
  isProductionHostname,
  isCustomDomain,
  extractSubdomain,
  parseHostname,
  buildSurfaceUrl,
  getSurfaceRoutePrefix,
  DEFAULT_HOSTNAME_CONFIG,
} from "./parser";

describe("normalizeHostname", () => {
  it("removes port from hostname", () => {
    expect(normalizeHostname("localhost:3000")).toBe("localhost");
    expect(normalizeHostname("faith-interactive.local:3000")).toBe(
      "faith-interactive.local"
    );
  });

  it("converts to lowercase", () => {
    expect(normalizeHostname("Faith-Interactive.COM")).toBe(
      "faith-interactive.com"
    );
  });

  it("handles hostnames without port", () => {
    expect(normalizeHostname("faith-interactive.com")).toBe(
      "faith-interactive.com"
    );
  });
});

describe("isLocalHostname", () => {
  it("returns true for local domain", () => {
    expect(isLocalHostname("faith-interactive.local")).toBe(true);
    expect(isLocalHostname("faith-interactive.local:3000")).toBe(true);
  });

  it("returns true for local subdomains", () => {
    expect(isLocalHostname("platform.faith-interactive.local")).toBe(true);
    expect(isLocalHostname("admin.faith-interactive.local")).toBe(true);
    expect(isLocalHostname("demo.faith-interactive.local:3000")).toBe(true);
  });

  it("returns false for production domain", () => {
    expect(isLocalHostname("faith-interactive.com")).toBe(false);
    expect(isLocalHostname("platform.faith-interactive.com")).toBe(false);
  });
});

describe("isProductionHostname", () => {
  it("returns true for production domain", () => {
    expect(isProductionHostname("faith-interactive.com")).toBe(true);
    expect(isProductionHostname("www.faith-interactive.com")).toBe(true);
  });

  it("returns true for production subdomains", () => {
    expect(isProductionHostname("platform.faith-interactive.com")).toBe(true);
    expect(isProductionHostname("admin.faith-interactive.com")).toBe(true);
    expect(isProductionHostname("demo.faith-interactive.com")).toBe(true);
  });

  it("returns false for local domain", () => {
    expect(isProductionHostname("faith-interactive.local")).toBe(false);
  });
});

describe("isCustomDomain", () => {
  it("returns true for custom domains", () => {
    expect(isCustomDomain("gracechurch.org")).toBe(true);
    expect(isCustomDomain("www.gracechurch.org")).toBe(true);
    expect(isCustomDomain("my-church.com")).toBe(true);
  });

  it("returns false for production domains", () => {
    expect(isCustomDomain("faith-interactive.com")).toBe(false);
    expect(isCustomDomain("demo.faith-interactive.com")).toBe(false);
  });

  it("returns false for local domains", () => {
    expect(isCustomDomain("faith-interactive.local")).toBe(false);
    expect(isCustomDomain("demo.faith-interactive.local")).toBe(false);
  });
});

describe("extractSubdomain", () => {
  describe("production hostnames", () => {
    it("returns null for apex domain", () => {
      expect(extractSubdomain("faith-interactive.com")).toBe(null);
    });

    it("returns null for www", () => {
      expect(extractSubdomain("www.faith-interactive.com")).toBe(null);
    });

    it("extracts subdomain", () => {
      expect(extractSubdomain("platform.faith-interactive.com")).toBe(
        "platform"
      );
      expect(extractSubdomain("admin.faith-interactive.com")).toBe("admin");
      expect(extractSubdomain("demo.faith-interactive.com")).toBe("demo");
      expect(extractSubdomain("grace-church.faith-interactive.com")).toBe(
        "grace-church"
      );
    });
  });

  describe("local hostnames", () => {
    it("returns null for apex domain", () => {
      expect(extractSubdomain("faith-interactive.local")).toBe(null);
      expect(extractSubdomain("faith-interactive.local:3000")).toBe(null);
    });

    it("extracts subdomain", () => {
      expect(extractSubdomain("platform.faith-interactive.local")).toBe(
        "platform"
      );
      expect(extractSubdomain("admin.faith-interactive.local:3000")).toBe(
        "admin"
      );
      expect(extractSubdomain("demo.faith-interactive.local")).toBe("demo");
    });
  });
});

describe("parseHostname", () => {
  describe("marketing surface", () => {
    it("parses production apex domain", () => {
      const result = parseHostname("faith-interactive.com");
      expect(result.surface).toBe("marketing");
      expect(result.churchSlug).toBe(null);
      expect(result.isLocal).toBe(false);
    });

    it("parses production www domain", () => {
      const result = parseHostname("www.faith-interactive.com");
      expect(result.surface).toBe("marketing");
      expect(result.churchSlug).toBe(null);
      expect(result.isLocal).toBe(false);
    });

    it("parses local apex domain", () => {
      const result = parseHostname("faith-interactive.local");
      expect(result.surface).toBe("marketing");
      expect(result.churchSlug).toBe(null);
      expect(result.isLocal).toBe(true);
    });

    it("parses local apex domain with port", () => {
      const result = parseHostname("faith-interactive.local:3000");
      expect(result.surface).toBe("marketing");
      expect(result.churchSlug).toBe(null);
      expect(result.isLocal).toBe(true);
    });
  });

  describe("platform surface", () => {
    it("parses production platform subdomain", () => {
      const result = parseHostname("platform.faith-interactive.com");
      expect(result.surface).toBe("platform");
      expect(result.churchSlug).toBe(null);
      expect(result.isLocal).toBe(false);
    });

    it("parses local platform subdomain", () => {
      const result = parseHostname("platform.faith-interactive.local:3000");
      expect(result.surface).toBe("platform");
      expect(result.churchSlug).toBe(null);
      expect(result.isLocal).toBe(true);
    });
  });

  describe("admin surface", () => {
    it("parses production admin subdomain", () => {
      const result = parseHostname("admin.faith-interactive.com");
      expect(result.surface).toBe("admin");
      expect(result.churchSlug).toBe(null);
      expect(result.isLocal).toBe(false);
    });

    it("parses local admin subdomain", () => {
      const result = parseHostname("admin.faith-interactive.local:3000");
      expect(result.surface).toBe("admin");
      expect(result.churchSlug).toBe(null);
      expect(result.isLocal).toBe(true);
    });
  });

  describe("tenant surface", () => {
    it("parses production church subdomain", () => {
      const result = parseHostname("demo.faith-interactive.com");
      expect(result.surface).toBe("tenant");
      expect(result.churchSlug).toBe("demo");
      expect(result.isLocal).toBe(false);
    });

    it("parses local church subdomain", () => {
      const result = parseHostname("grace-church.faith-interactive.local:3000");
      expect(result.surface).toBe("tenant");
      expect(result.churchSlug).toBe("grace-church");
      expect(result.isLocal).toBe(true);
    });

    it("parses custom domain as tenant with null slug", () => {
      const result = parseHostname("gracechurch.org");
      expect(result.surface).toBe("tenant");
      expect(result.churchSlug).toBe(null); // Must be resolved via DB
      expect(result.isLocal).toBe(false);
    });
  });
});

describe("buildSurfaceUrl", () => {
  describe("local URLs", () => {
    it("builds marketing URL", () => {
      expect(buildSurfaceUrl("marketing", "/", { isLocal: true })).toBe(
        "http://faith-interactive.local:3000/"
      );
    });

    it("builds platform URL", () => {
      expect(buildSurfaceUrl("platform", "/churches", { isLocal: true })).toBe(
        "http://platform.faith-interactive.local:3000/churches"
      );
    });

    it("builds admin URL", () => {
      expect(
        buildSurfaceUrl("admin", "/pages", { isLocal: true })
      ).toBe("http://admin.faith-interactive.local:3000/pages");
    });

    it("builds tenant URL", () => {
      expect(
        buildSurfaceUrl("tenant", "/sermons", {
          isLocal: true,
          churchSlug: "demo",
        })
      ).toBe("http://demo.faith-interactive.local:3000/sermons");
    });
  });

  describe("production URLs", () => {
    it("builds marketing URL", () => {
      expect(buildSurfaceUrl("marketing", "/")).toBe(
        "https://faith-interactive.com/"
      );
    });

    it("builds platform URL", () => {
      expect(buildSurfaceUrl("platform", "/churches")).toBe(
        "https://platform.faith-interactive.com/churches"
      );
    });

    it("builds admin URL", () => {
      expect(buildSurfaceUrl("admin", "/pages")).toBe(
        "https://admin.faith-interactive.com/pages"
      );
    });

    it("builds tenant URL", () => {
      expect(
        buildSurfaceUrl("tenant", "/sermons", { churchSlug: "grace" })
      ).toBe("https://grace.faith-interactive.com/sermons");
    });
  });

  it("throws for tenant without churchSlug", () => {
    expect(() => buildSurfaceUrl("tenant", "/")).toThrow(
      "churchSlug is required"
    );
  });
});

describe("getSurfaceRoutePrefix", () => {
  it("returns correct prefixes", () => {
    expect(getSurfaceRoutePrefix("marketing")).toBe("/m");
    expect(getSurfaceRoutePrefix("platform")).toBe("/p");
    expect(getSurfaceRoutePrefix("admin")).toBe("/a");
    expect(getSurfaceRoutePrefix("tenant")).toBe("/t");
  });
});
