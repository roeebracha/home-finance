import { useLocation } from "react-router-dom";
import { sectionForPath } from "@/sections";

export function useActiveSection() {
  const { pathname } = useLocation();
  return sectionForPath(pathname);
}
