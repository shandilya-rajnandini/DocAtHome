import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {isVisible && (
        <button
          className="fixed w-[50px] h-[50px] bg-[#FDE68A] dark:bg-[#202735] shadow-md rounded-full flex justify-center items-center right-6 bottom-24 cursor-pointer transition-opacity duration-1000 focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue focus:outline-none"
          onClick={handleBackToTop}
          aria-label="Back to top"
        >
          <ArrowUp className="text-black dark:text-white " />
        </button>
      )}
    </>
  );
};

export default BackToTopButton;
