import { 
  BookOpen, 
  Menu, 
  X, 
  Users, 
  MessageCircle, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Star,
  UserPlus
} from "lucide-react";

export const BookOpenIcon = BookOpen;
export const MenuIcon = Menu;
export const CloseIcon = X;
export const UsersIcon = Users;
export const MessageIcon = MessageCircle;
export const SearchIcon = Search;
export const FilterIcon = Filter;
export const ChevronLeftIcon = ChevronLeft;
export const ChevronRightIcon = ChevronRight;
export const UserPlusIcon = UserPlus;

export function StarIcon({
  className,
  filled,
}: {
  className?: string;
  filled: boolean;
}) {
  return (
    <Star 
      className={className} 
      fill={filled ? "currentColor" : "none"} 
    />
  );
}
