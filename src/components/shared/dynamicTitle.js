"use client"
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function DynamicTitle() {
  const pathname = usePathname();

  useEffect(() => {
    let formattedTitle;

    if (pathname === "/") {
      formattedTitle = "JARA B2B";
    } else {
      const pathSegments = pathname.split("/").filter(Boolean);
      const lastSegment = pathSegments[pathSegments.length - 1] || "Dashboard";
      formattedTitle = lastSegment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

      formattedTitle += " | AppDevs";
    }

    document.title = formattedTitle;
  }, [pathname]);

  return null;
}