import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { LogoService } from "@/services/logoService";

interface AppLogoProps {
  size?: "sm" | "md" | "lg";
  type?: "main" | "mobile" | "login" | "pwa";
}

const AppLogo: React.FC<AppLogoProps> = ({ size = "md", type = "main" }) => {
  const location = useLocation();
  const [logoUrl, setLogoUrl] = useState<string>("/icons/icon-192x192.png"); // Start with default fallback
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const isMountedRef = useRef(true);

  // Show logo on login-related pages and in dashboard menus
  const isLoginPage =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  const isDashboardPage =
    location.pathname.includes("/dashboard") ||
    location.pathname.includes("/admin");

  // Only hide logo on other pages that are not login or dashboard
  if (!isLoginPage && !isDashboardPage) {
    return null;
  }

  // Force login logo type on login pages to ensure global branding
  const effectiveType = isLoginPage ? "login" : type;

  // Default logo path - relative to public folder
  const defaultLogoPath = "/icons/icon-192x192.png";
  const fallbackLogoPath = "/icons/icon-152x152.png";

  // Preload the default logo to ensure it's available
  useEffect(() => {
    const img = new Image();
    img.src = defaultLogoPath;
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    const fetchLogo = async () => {
      try {
        console.log(`🔍 Fetching ${effectiveType} logo using LogoService...`);
        setIsLoading(true);
        setHasError(false);

        // For login pages, always use the hardcoded logo URL
        let logoUrl: string | null = null;

        if (isLoginPage) {
          // Use hardcoded login logo URL (temporary fix)
          logoUrl = await LogoService.getLoginLogoUrl();
          console.log(`🔍 Login logo (hardcoded):`, logoUrl);
        } else {
          // For non-login pages, use the unified logo fetching method
          logoUrl = await LogoService.getLogoUrl(effectiveType);
        }

        if (logoUrl && logoUrl.trim() !== "" && isMountedRef.current) {
          console.log(`✅ Found ${effectiveType} logo URL:`, logoUrl);

          // Test if the image URL is accessible before setting it
          const img = new Image();
          img.onload = () => {
            if (isMountedRef.current) {
              console.log(
                `🖼️ ${effectiveType} logo loaded successfully:`,
                logoUrl,
              );
              setLogoUrl(logoUrl);
              setHasError(false);
              setIsLoading(false);
            }
          };
          img.onerror = () => {
            if (isMountedRef.current) {
              console.warn(`⚠️ ${effectiveType} logo failed to load:`, logoUrl);
              // Fallback to default logo
              console.log(`🔄 Falling back to default logo:`, defaultLogoPath);
              setLogoUrl(defaultLogoPath);
              setHasError(false);
              setIsLoading(false);
            }
          };
          img.src = logoUrl;
        } else {
          console.log(
            `ℹ️ No ${effectiveType} logo found, using default:`,
            defaultLogoPath,
          );
          if (isMountedRef.current) {
            setLogoUrl(defaultLogoPath);
            setHasError(false);
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error(`❌ Error in fetchLogo:`, err);
        if (isMountedRef.current) {
          setLogoUrl(defaultLogoPath);
          setHasError(false);
          setIsLoading(false);
        }
      }
    };

    fetchLogo();

    return () => {
      isMountedRef.current = false;
    };
  }, [effectiveType, isLoginPage]);

  // Size classes
  const sizeClasses = {
    sm: "h-8 max-w-[120px]",
    md: "h-12 max-w-[160px]",
    lg: "h-14 max-w-[200px]",
  };

  // Show loading state briefly to prevent flickering
  if (isLoading) {
    return (
      <div
        className={`${sizeClasses[size]} bg-muted animate-pulse rounded flex items-center justify-center`}
      >
        <div className="w-8 h-8 bg-muted-foreground/20 rounded"></div>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} flex items-center justify-center`}>
      <img
        src={logoUrl}
        alt="Logo"
        className="h-full object-contain transition-opacity duration-200"
        onError={(e) => {
          console.error(`❌ Logo failed to load:`, e.currentTarget.src);
          e.currentTarget.onerror = null;

          // Try alternative default paths
          const currentSrc = e.currentTarget.src;

          if (currentSrc.includes("icon-192x192.png")) {
            e.currentTarget.src = "/icons/icon-152x152.png";
          } else if (currentSrc.includes("icon-152x152.png")) {
            e.currentTarget.src = "/icons/icon-128x128.png";
          } else if (currentSrc.includes("icon-128x128.png")) {
            e.currentTarget.src = "/icons/icon-96x96.png";
          } else {
            // If all icons fail, show a text fallback
            e.currentTarget.style.display = "none";
            const parent = e.currentTarget.parentElement;
            if (parent && !parent.querySelector(".logo-fallback")) {
              const fallback = document.createElement("div");
              fallback.className = `logo-fallback h-full w-full bg-primary text-primary-foreground rounded flex items-center justify-center font-bold text-lg`;
              fallback.textContent = "LOGO";
              parent.appendChild(fallback);
            }
          }
        }}
      />
    </div>
  );
};

export default AppLogo;
