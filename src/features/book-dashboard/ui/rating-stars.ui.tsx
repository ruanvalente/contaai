import { Star } from "lucide-react";

type RatingStarsProps = {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = "md",
  showValue = true,
  className = "",
}: RatingStarsProps) {
  const sizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className={`${sizes[size]} text-warning fill-warning`} />
        ))}
        {hasHalfStar && <Star className={`${sizes[size]} text-gray-300`} />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className={`${sizes[size]} text-gray-300`} />
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
