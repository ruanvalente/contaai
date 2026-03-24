import Image from "next/image";

type AvatarProps = {
  name?: string;
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Avatar({
  name,
  src,
  size = "md",
  className = "",
}: AvatarProps) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(name);

  if (src) {
    const isExternal = src.startsWith("http") || src.startsWith("//");
    
    return (
      <div
        className={`${sizes[size]} rounded-full overflow-hidden ${className}`}
      >
        {isExternal ? (
          <Image
            priority
            src={src}
            alt={name || "Avatar"}
            width={96}
            height={96}
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={src}
            alt={name || "Avatar"}
            className="w-full h-full object-cover"
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-accent-500 flex items-center justify-center text-white font-medium ${className}`}
    >
      {initials}
    </div>
  );
}
