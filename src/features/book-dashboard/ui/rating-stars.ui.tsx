interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

function StarIcon({
  size,
  filled,
  half,
}: {
  size: "sm" | "md" | "lg";
  filled: boolean;
  half?: boolean;
}) {
  const sizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  if (half) {
    return (
      <div className={`relative ${sizes[size]}`}>
        <svg
          className="absolute inset-0 w-full h-full text-gray-300"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <svg
          className="absolute inset-0 w-full h-full text-warning"
          viewBox="0 0 24 24"
          fill="currentColor"
          clipPath="inset(0 50% 0 0)"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </div>
    );
  }

  return (
    <svg
      className={`${sizes[size]} ${filled ? "text-warning" : "text-gray-300"}`}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = "md",
  showValue = true,
  className = "",
}: RatingStarsProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <StarIcon key={`full-${i}`} size={size} filled />
        ))}
        {hasHalfStar && <StarIcon size={size} filled half />}
        {[...Array(emptyStars)].map((_, i) => (
          <StarIcon key={`empty-${i}`} size={size} filled={false} />
        ))}
      </div>
      {showValue && (
        <span className="text-xs sm:text-sm text-gray-600 ml-1 font-medium">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
