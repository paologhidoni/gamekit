import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show button after one screen height
    const onScroll = () => {
      const shouldShow = window.scrollY > window.innerHeight;
      setIsVisible((prev) => (prev === shouldShow ? prev : shouldShow));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Clean up listener on unmount
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Smooth scroll back to page top
  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      className="fixed right-4 bottom-4 z-50 rounded-full p-2 transition-colors hover:opacity-80 md:right-6 md:bottom-6 cursor-pointer"
      style={{
        backgroundColor: "var(--color-accent-primary)",
        color: "var(--color-text-on-accent)",
      }}
      aria-label="Scroll to top"
    >
      <ChevronUp size={20} />
    </button>
  );
}
