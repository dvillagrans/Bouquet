"use client";

import {
  Network,
  Map,
  LayoutTemplate,
  Users,
  ShieldAlert,
  Building2,
  Settings2,
  Shield,
  Building,
  CreditCard,
  Wrench,
  Store,
  LayoutGrid,
  BookOpen,
  ChefHat,
  UserRound,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Network,
  Map,
  LayoutTemplate,
  Users,
  ShieldAlert,
  Building2,
  Settings2,
  Shield,
  Building,
  CreditCard,
  Wrench,
  Store,
  LayoutGrid,
  BookOpen,
  ChefHat,
  UserRound,
  BarChart3,
};

export function getNavIcon(name: string): LucideIcon {
  return iconMap[name] ?? Store;
}
