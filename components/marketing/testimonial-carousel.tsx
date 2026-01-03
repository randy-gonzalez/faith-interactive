"use client";

/**
 * Testimonial Carousel Component
 *
 * Displays rotating testimonials from the database.
 */

import { useState, useEffect, useCallback } from "react";

interface Testimonial {
  id: string;
  name: string;
  title: string | null;
  company: string | null;
  quote: string;
  image: string | null;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  autoRotate?: boolean;
  rotateInterval?: number;
}

export function TestimonialCarousel({
  testimonials,
  autoRotate = true,
  rotateInterval = 6000,
}: TestimonialCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setActiveIndex((current) => (current + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevSlide = useCallback(() => {
    setActiveIndex((current) =>
      current === 0 ? testimonials.length - 1 : current - 1
    );
  }, [testimonials.length]);

  useEffect(() => {
    if (!autoRotate || testimonials.length <= 1) return;

    const interval = setInterval(nextSlide, rotateInterval);
    return () => clearInterval(interval);
  }, [autoRotate, rotateInterval, nextSlide, testimonials.length]);

  if (testimonials.length === 0) {
    return null;
  }

  const currentTestimonial = testimonials[activeIndex];

  return (
    <div className="relative">
      <div className="max-w-4xl mx-auto text-center">
        {/* Quote Icon */}
        <div className="mb-8">
          <svg
            className="w-12 h-12 mx-auto text-[#00d4aa] opacity-50"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
        </div>

        {/* Quote */}
        <blockquote className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-8">
          &ldquo;{currentTestimonial.quote}&rdquo;
        </blockquote>

        {/* Author */}
        <div className="flex items-center justify-center gap-4">
          {currentTestimonial.image ? (
            <img
              src={currentTestimonial.image}
              alt={currentTestimonial.name}
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#77f2a1] to-[#00ffce] flex items-center justify-center">
              <span className="text-[#000646] font-semibold text-lg">
                {currentTestimonial.name.charAt(0)}
              </span>
            </div>
          )}
          <div className="text-left">
            <p className="font-semibold text-[#000646]">{currentTestimonial.name}</p>
            {(currentTestimonial.title || currentTestimonial.company) && (
              <p className="text-gray-500 text-sm">
                {[currentTestimonial.title, currentTestimonial.company]
                  .filter(Boolean)
                  .join(" at ")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      {testimonials.length > 1 && (
        <>
          {/* Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-[#000646] transition-colors"
            aria-label="Previous testimonial"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-[#000646] transition-colors"
            aria-label="Next testimonial"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === activeIndex
                    ? "w-8 bg-gradient-to-r from-[#77f2a1] to-[#00ffce]"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function TestimonialGrid({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {testimonials.map((testimonial) => (
        <div
          key={testimonial.id}
          className="marketing-card p-6"
        >
          <blockquote className="text-gray-700 mb-6">
            &ldquo;{testimonial.quote}&rdquo;
          </blockquote>
          <div className="flex items-center gap-3">
            {testimonial.image ? (
              <img
                src={testimonial.image}
                alt={testimonial.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#77f2a1] to-[#00ffce] flex items-center justify-center">
                <span className="text-[#000646] font-medium">
                  {testimonial.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <p className="font-semibold text-[#000646] text-sm">{testimonial.name}</p>
              {(testimonial.title || testimonial.company) && (
                <p className="text-gray-500 text-xs">
                  {[testimonial.title, testimonial.company].filter(Boolean).join(" at ")}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
