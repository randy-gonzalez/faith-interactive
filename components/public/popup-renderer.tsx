/**
 * Popup Renderer
 *
 * Client-side component that handles popup display on the public site.
 * Manages triggers (scroll, time delay, exit intent, button click),
 * display rules (frequency, session storage), and popup lifecycle.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import type { PopupBlock } from "@/types/blocks";
import { sanitizeHtml } from "@/lib/security/html-sanitizer";

interface PopupRendererProps {
  popups: PopupBlock[];
}

const STORAGE_PREFIX = "fi_popup_";

function getStorageKey(popupId: string): string {
  return `${STORAGE_PREFIX}${popupId}`;
}

function shouldShowPopup(popup: PopupBlock): boolean {
  if (typeof window === "undefined") return false;

  const { display } = popup.data;
  const storageKey = getStorageKey(popup.id);

  // Check "once ever" rule (localStorage)
  if (display.onceEver) {
    const shown = localStorage.getItem(storageKey);
    if (shown === "true") return false;
  }

  // Check "once per session" rule (sessionStorage)
  if (display.oncePerSession) {
    const shown = sessionStorage.getItem(storageKey);
    if (shown === "true") return false;
  }

  // Check frequency limit
  if (display.frequencyDays) {
    const lastShown = localStorage.getItem(`${storageKey}_last`);
    if (lastShown) {
      const daysSinceShown = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24);
      if (daysSinceShown < display.frequencyDays) return false;
    }
  }

  return true;
}

function markPopupShown(popup: PopupBlock): void {
  if (typeof window === "undefined") return;

  const { display } = popup.data;
  const storageKey = getStorageKey(popup.id);

  if (display.onceEver) {
    localStorage.setItem(storageKey, "true");
  }

  if (display.oncePerSession) {
    sessionStorage.setItem(storageKey, "true");
  }

  if (display.frequencyDays) {
    localStorage.setItem(`${storageKey}_last`, Date.now().toString());
  }
}

interface SinglePopupProps {
  popup: PopupBlock;
  onClose: () => void;
}

function SinglePopup({ popup, onClose }: SinglePopupProps) {
  const { data, background } = popup;

  const sizeClasses = {
    small: "max-w-sm",
    medium: "max-w-lg",
    large: "max-w-2xl",
    full: "max-w-4xl w-full mx-4",
  };

  const positionClasses = {
    center: "items-center justify-center",
    bottom: "items-end justify-center pb-4",
    "slide-in-right": "items-center justify-end pr-4",
  };

  // Build background styles
  const backgroundStyles: React.CSSProperties = {};
  if (background) {
    switch (background.type) {
      case "color":
        if (background.color) backgroundStyles.backgroundColor = background.color;
        break;
      case "gradient":
        if (background.gradient) backgroundStyles.background = background.gradient;
        break;
      case "image":
        if (background.imageUrl) {
          backgroundStyles.backgroundImage = `url(${background.imageUrl})`;
          backgroundStyles.backgroundSize = "cover";
          backgroundStyles.backgroundPosition = "center";
        }
        break;
    }
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (data.closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleButtonClick(button: PopupBlock["data"]["buttons"][0]) {
    if (button.action === "close") {
      onClose();
    } else if (button.action === "link" && button.url) {
      window.location.href = button.url;
    }
  }

  const sanitizedContent = sanitizeHtml(data.content);

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex ${positionClasses[data.position]} bg-black/50 animate-in fade-in duration-200`}
      onClick={handleOverlayClick}
    >
      <div
        className={`${sizeClasses[data.size]} bg-white rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200`}
        style={backgroundStyles}
      >
        {/* Close Button */}
        {data.showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Close popup"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Image */}
        {data.imageUrl && (
          <div className="w-full h-48 overflow-hidden">
            <img
              src={data.imageUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {data.heading && (
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {data.heading}
            </h2>
          )}

          {sanitizedContent && (
            <div
              className="prose prose-sm max-w-none text-gray-600 mb-6"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          )}

          {/* Buttons */}
          {data.buttons.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {data.buttons.map((button) => (
                <button
                  key={button.id}
                  onClick={() => handleButtonClick(button)}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    button.variant === "primary"
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {button.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export function PopupRenderer({ popups }: PopupRendererProps) {
  const [activePopup, setActivePopup] = useState<PopupBlock | null>(null);
  const [triggeredPopups, setTriggeredPopups] = useState<Set<string>>(new Set());

  const triggerPopup = useCallback((popup: PopupBlock) => {
    if (triggeredPopups.has(popup.id)) return;
    if (!shouldShowPopup(popup)) return;

    setTriggeredPopups((prev) => new Set([...prev, popup.id]));
    setActivePopup(popup);
    markPopupShown(popup);
  }, [triggeredPopups]);

  const closePopup = useCallback(() => {
    setActivePopup(null);
  }, []);

  // Set up triggers
  useEffect(() => {
    const cleanupFns: (() => void)[] = [];

    popups.forEach((popup) => {
      const { trigger } = popup.data;

      switch (trigger.type) {
        case "time-delay": {
          const timeoutId = setTimeout(() => {
            triggerPopup(popup);
          }, trigger.delayMs || 5000);
          cleanupFns.push(() => clearTimeout(timeoutId));
          break;
        }

        case "scroll": {
          const handleScroll = () => {
            const scrollPercentage =
              (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            if (scrollPercentage >= (trigger.scrollPercentage || 50)) {
              triggerPopup(popup);
            }
          };
          window.addEventListener("scroll", handleScroll, { passive: true });
          cleanupFns.push(() => window.removeEventListener("scroll", handleScroll));
          break;
        }

        case "exit-intent": {
          const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY <= 0) {
              triggerPopup(popup);
            }
          };
          document.addEventListener("mouseleave", handleMouseLeave);
          cleanupFns.push(() => document.removeEventListener("mouseleave", handleMouseLeave));
          break;
        }

        // Button click triggers are handled separately via the button rendered on the page
      }
    });

    return () => {
      cleanupFns.forEach((fn) => fn());
    };
  }, [popups, triggerPopup]);

  // Render button-click trigger buttons
  const buttonTriggerPopups = popups.filter(
    (p) => p.data.trigger.type === "button-click" && p.data.trigger.buttonText
  );

  return (
    <>
      {/* Render trigger buttons for button-click popups */}
      {buttonTriggerPopups.length > 0 && (
        <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2">
          {buttonTriggerPopups.map((popup) => (
            <button
              key={popup.id}
              onClick={() => triggerPopup(popup)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {popup.data.trigger.buttonText}
            </button>
          ))}
        </div>
      )}

      {/* Render active popup */}
      {activePopup && <SinglePopup popup={activePopup} onClose={closePopup} />}
    </>
  );
}
