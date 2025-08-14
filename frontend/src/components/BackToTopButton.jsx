import { ArrowUp } from "lucide-react";
import React, { useEffect, useState } from "react";

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
        <div
          className="fixed w-[50px] h-[50px] bg-white shadow-md rounded-full flex justify-center items-center right-6 bottom-6 cursor-pointer transition-opacity duration-1000 "
          onClick={handleBackToTop}
        >
          <ArrowUp className="text-black" />
        </div>
      )}
    </>
  );
};

export default BackToTopButton;
