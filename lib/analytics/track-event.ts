declare global {
  interface Window {
    gtag?: (
      command: "event" | "config" | "js",
      targetId: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

type LeadEventParams = {
  event_category: string;
  event_label: string;
  value?: number;
};

export function trackLeadConversion(label: string) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "generate_lead", {
      event_category: "form",
      event_label: label,
      value: 1,
    } satisfies LeadEventParams);

    // Google Ads conversion
    window.gtag("event", "conversion", {
      send_to: "AW-17832451728/sKFjCOnlv-AbEJC9lrdC",
    });
  }
}

export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
}
