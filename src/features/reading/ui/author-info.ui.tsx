"use client";

import { Calendar } from "lucide-react";
import { Avatar } from "@/shared/ui/avatar.ui";
import { cn } from "@/utils/cn";

type AuthorInfoProps = {
  authorName: string;
  authorAvatar?: string;
  publishedDate?: Date;
  className?: string;
};

export function AuthorInfo({
  authorName,
  authorAvatar,
  publishedDate,
  className,
}: AuthorInfoProps) {
  const formattedDate = publishedDate
    ? new Intl.DateTimeFormat("pt-BR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(publishedDate)
    : null;

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 bg-primary-50 rounded-xl border border-primary-200",
        className
      )}
    >
      <Avatar
        name={authorName}
        src={authorAvatar}
        size="md"
      />

      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{authorName}</p>
        {formattedDate && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Publicado em {formattedDate}</span>
          </div>
        )}
      </div>
    </div>
  );
}
