import { Building2, Ellipsis, Home, Receipt, Settings, ShoppingCart, Sprout, Wallet } from "lucide-react";

const ICONS = {
  home: Home,
  expenses: Receipt,
  groceries: ShoppingCart,
  apartment: Building2,
  settings: Settings,
  garden: Sprout,
  finance: Wallet,
  more: Ellipsis,
};

export default function Icon({ name, size = 24, ...props }) {
  const Component = ICONS[name];
  if (!Component) return null;
  return <Component size={size} strokeWidth={1.75} aria-hidden="true" {...props} />;
}
