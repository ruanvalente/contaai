import { forwardRef, type ComponentPropsWithoutRef } from "react";
import Image from "next/image";
import { cn } from "@/utils/cn";

type BookCoverProps = ComponentPropsWithoutRef<"div"> & {
  title: string;
  coverUrl?: string;
  coverColor: string;
  size?: "sm" | "md" | "lg" | "xl";
};

export const BookCover = forwardRef<HTMLDivElement, BookCoverProps>(
  ({ title, coverUrl, coverColor, size = "md", className = "", ...props }, ref) => {
    const sizes = {
      sm: { container: "w-20 h-30 sm:w-24 sm:h-36", text: "text-[10px] sm:text-xs" },
      md: { container: "w-28 h-42 sm:w-32 sm:h-48", text: "text-xs sm:text-sm" },
      lg: { container: "w-36 h-54 sm:w-40 sm:h-60", text: "text-sm sm:text-base" },
      xl: { container: "w-44 h-66 sm:w-48 sm:h-72", text: "text-base sm:text-lg" },
    };

    const { container, text } = sizes[size];

    if (coverUrl) {
      return (
        <div ref={ref} className={cn(container, "rounded-lg overflow-hidden shadow-md", className)} {...props}>
          <Image
            src={coverUrl}
            alt={title}
            width={192}
            height={288}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(container, "rounded-lg shadow-md flex flex-col items-center justify-center p-2 sm:p-3", className)}
        style={{ backgroundColor: coverColor }}
        {...props}
      >
        <div className="flex-1 flex items-center justify-center w-full">
          <span
            className={cn("text-white/90 font-display leading-tight text-center line-clamp-3 sm:line-clamp-4", text)}
          >
            {title}
          </span>
        </div>
        <div className="w-full border-t border-white/20 pt-1 sm:pt-2 mt-1 sm:mt-2">
          <div className="w-6 sm:w-8 h-0.5 sm:h-1 bg-white/30 rounded mx-auto" />
        </div>
      </div>
    );
  }
);

BookCover.displayName = "BookCover";