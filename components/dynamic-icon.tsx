import {
    Apple,
    Award,
    Book,
    Box,
    Briefcase,
    Building,
    Camera,
    Chrome,
    Cloud,
    CreditCard,
    Flame,
    Gamepad2,
    Gift,
    Globe,
    Grid3x3,
    Headphones,
    Heart,
    Home,
    Laptop,
    MessageCircle,
    MessageSquare,
    Monitor,
    Moon,
    Music,
    Package,
    Phone,
    Play,
    Settings,
    Shield,
    ShoppingBag,
    ShoppingCart,
    Smartphone,
    Star,
    Store,
    Sun,
    Tablet,
    Tag,
    Tv,
    User,
    Users,
    Video,
    Wifi,
    Zap,
} from "lucide-react-native";
import type { ComponentType } from "react";

/**
 * Maps Lucide icon names (stored in DB) to their React Native components.
 * Matches the admin panel's ICON_LIST in category-form.tsx.
 */
const ICON_MAP: Record<
  string,
  ComponentType<{ size?: number; color?: string; strokeWidth?: number }>
> = {
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Tv,
  Wifi,
  Apple,
  Chrome,
  Globe,
  Play,
  Gamepad2,
  CreditCard,
  ShoppingCart,
  ShoppingBag,
  Gift,
  Tag,
  MessageCircle,
  MessageSquare,
  Phone,
  Music,
  Headphones,
  Camera,
  Video,
  Heart,
  Star,
  Zap,
  Flame,
  Award,
  Book,
  Briefcase,
  Home,
  Building,
  Store,
  User,
  Users,
  Settings,
  Shield,
  Cloud,
  Sun,
  Moon,
  Package,
  Box,
};

const DEFAULT_ICON = Grid3x3;

interface DynamicIconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Renders a Lucide icon by name from the database.
 * Falls back to Grid3x3 if the icon name is not found.
 */
export function DynamicIcon({
  name,
  size = 24,
  color,
  strokeWidth = 1.5,
}: DynamicIconProps) {
  const IconComponent = ICON_MAP[name] ?? DEFAULT_ICON;
  return <IconComponent size={size} color={color} strokeWidth={strokeWidth} />;
}

export { DEFAULT_ICON, ICON_MAP };
