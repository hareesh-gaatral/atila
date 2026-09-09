"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleSidebar, closeSidebar, initTheme } from "@/store/slices/uiSlice";
import {
  fetchGlobalContent,
  mergeGlobalContent,
} from "@/store/slices/contentSlice";
import {
  fetchServices,
  selectMenuServices,
} from "@/store/slices/servicesSlice";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { services } from "@/data/services";
import navbarContent from "@/data/json/navbar.json";

interface NavbarProps {
  settings: Record<string, string>;
}

export default function Navbar({ settings }: NavbarProps) {
  const dispatch = useAppDispatch();
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const { globalNavbar, globalLoaded, globalLoading } = useAppSelector(
    (state) => state.content,
  );
  const servicesLoaded = useAppSelector((state) => state.services.loaded);
  const servicesLoading = useAppSelector((state) => state.services.loading);
  const serviceItems = useAppSelector(selectMenuServices);

  // Lazy-load the DB-driven navbar (falling back to navbar.json). Guarded by
  // both `loaded` and `loading` so Navbar + Footer don't double-fetch.
  useEffect(() => {
    if (!globalLoaded && !globalLoading) {
      dispatch(fetchGlobalContent());
    }
  }, [dispatch, globalLoaded, globalLoading]);

  // Dynamic services dropdown: fetch the published service catalog once and use
  // the DB list afterwards; the static catalog keeps the SSR/first paint intact.
  useEffect(() => {
    if (!servicesLoaded && !servicesLoading) {
      dispatch(fetchServices());
    }
  }, [dispatch, servicesLoaded, servicesLoading]);

  // Merge DB content over the JSON default so menu labels/links/logos are
  // editable from the admin panel while the JSON stays as the offline default.
  const navContent = mergeGlobalContent(globalNavbar, navbarContent);
  const navItems = navContent.navItems;
  const scrollSpySections = navContent.scrollSpySections;

  // Services shown in the dropdown: DB services (showInMenu, published) when the
  // list has loaded, otherwise the static catalog as the default.
  const menuServices = servicesLoaded ? serviceItems : (services as any[]);

  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("home");
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    dispatch(initTheme());
  }, [dispatch]);

  // Scroll spy on the home page
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const scrollPosition = window.scrollY + 100; // Offset for navbar height
      let currentSection = "home";

      for (const sectionId of scrollSpySections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            currentSection = sectionId;
          }
        }
      }

      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the services dropdown on outside click or Escape
  useEffect(() => {
    const closeDropdown = () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      setServicesOpen(false);
    };
    const handleMouseDown = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDropdown();
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Clear any pending close timer on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  // Hover intent: opening the dropdown is instant, but closing is delayed briefly
  // so moving the cursor across the gap between the button and the panel doesn't
  // dismiss the menu before the pointer reaches it.
  const handleServicesEnter = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setServicesOpen(true);
  };
  const handleServicesLeave = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(
      () => setServicesOpen(false),
      navContent.dropdownCloseDelay,
    );
  };

  // Close mobile menu on route change
  useEffect(() => {
    setServicesOpen(false);
    setMobileServicesOpen(false);
  }, [pathname]);

  // Smooth-scroll to a home section when on the home page; otherwise navigate.
  const handleSectionClick = (e: React.MouseEvent, id: string) => {
    if (pathname === "/") {
      e.preventDefault();
      dispatch(closeSidebar());
      if (id === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      dispatch(closeSidebar());
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const isSectionActive = (section: string) => {
    // On the home page, use the scroll spy.
    if (pathname === "/") return activeSection === section;

    // On other pages, use the pathname.
    if (section === "services") {
      return pathname === "/services" || pathname.startsWith("/services/");
    }
    return pathname === `/${section}` || pathname.startsWith(`/${section}/`);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white dark:bg-[#0f172a] shadow-lg" : "bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-sm"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              href="https://www.aatraltechnologies.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center mr-3"
            >
              <img
                src="/png/aatrallogo.png"
                alt={navContent.logoAlt}
                className="h-9 w-auto"
              />
            </Link>
            <Link href="/" prefetch={true}>
              <img
                src={navContent.logo}
                alt={navContent.logoAlt}
                className="h-9 w-auto"
              />
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item: any) => {
              // Services renders as the dropdown (chevron opens service pages).
              if (item.id === "services") {
                return (
                  <div
                    key={item.id}
                    ref={dropdownRef}
                    className="relative"
                    onMouseEnter={handleServicesEnter}
                    onMouseLeave={handleServicesLeave}
                  >
                    <div
                      className={`flex items-center rounded-lg transition-all duration-200 ${
                        isSectionActive("services")
                          ? "bg-teal-600/10 dark:bg-teal-400/20"
                          : "hover:bg-slate-100 dark:hover:bg-slate-700/60"
                      }`}
                    >
                      {/* Clicking "Services" scrolls to the home services section ("Our Solutions" / "What We Offer"). */}
                      <Link
                        href={item.href}
                        onClick={(e) => {
                          handleSectionClick(e, "services");
                          if (closeTimerRef.current)
                            clearTimeout(closeTimerRef.current);
                          setServicesOpen(false);
                        }}
                        className={`relative py-2 pl-4 pr-1 text-sm font-medium transition-all duration-200 rounded-l-lg ${
                          isSectionActive("services")
                            ? "text-teal-700 dark:text-teal-400"
                            : "text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400"
                        }`}
                        prefetch={true}
                      >
                        {item.label}
                        {isSectionActive("services") && (
                          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-teal-600 dark:bg-teal-400 rounded-full" />
                        )}
                      </Link>
                      {/* Chevron still opens the service detail-page dropdown (hover works too). */}
                      <button
                        type="button"
                        aria-expanded={servicesOpen}
                        aria-label="Toggle services dropdown"
                        onClick={() => {
                          if (closeTimerRef.current)
                            clearTimeout(closeTimerRef.current);
                          setServicesOpen((open) => !open);
                        }}
                        className={`flex items-center py-2 pr-4 pl-1 text-sm font-medium transition-all duration-200 rounded-r-lg ${
                          isSectionActive("services")
                            ? "text-teal-700 dark:text-teal-400"
                            : "text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400"
                        }`}
                      >
                        <svg
                          className={`w-4 h-4 transition-transform ${servicesOpen ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    </div>

                    {servicesOpen && (
                      <div className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
                        {menuServices.map((service) => (
                          <Link
                            key={service.slug}
                            href={service.link || `/services/${service.slug}`}
                            className="block px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            prefetch={true}
                            onClick={() => {
                              if (closeTimerRef.current)
                                clearTimeout(closeTimerRef.current);
                              setServicesOpen(false);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{service.icon}</span>
                              <div>
                                <p className="font-medium text-slate-700 dark:text-slate-200 text-sm">
                                  {service.title}
                                </p>
                                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                                  {service.tagline}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              const section = item.id;
              const active =
                pathname === "/"
                  ? isSectionActive(section)
                  : isActive(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={(e) => handleSectionClick(e, item.id)}
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                    active
                      ? "text-teal-700 dark:text-teal-400"
                      : "text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400"
                  }`}
                  prefetch={true}
                >
                  {item.label}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-teal-600 dark:bg-teal-400 rounded-full" />
                  )}
                </Link>
              );
            })}
            <Link
              href="/demo"
              className="relative py-2 pl-4 pr-1 text-sm font-medium transition-all duration-200 rounded-l-lg"
              prefetch={true}
            >
              Demo
            </Link>
            <ThemeToggle />
          </div>

          {/* Mobile header controls */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              className="text-slate-600 dark:text-slate-300 p-2"
              onClick={() => dispatch(toggleSidebar())}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {sidebarOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {sidebarOpen && (
          <div className="md:hidden pb-4 space-y-1 border-t border-slate-200 dark:border-slate-700 mt-2 pt-3">
            {navItems.map((item: any) => {
              // Mobile Services renders as an accordion listing the service pages.
              if (item.id === "services") {
                return (
                  <div key={item.id}>
                    <button
                      type="button"
                      aria-expanded={mobileServicesOpen}
                      onClick={() => setMobileServicesOpen((open) => !open)}
                      className={`w-full flex items-center justify-between py-2.5 px-3 rounded transition ${
                        isSectionActive("services")
                          ? "bg-teal-600/10 dark:bg-teal-400/20 text-teal-700 dark:text-teal-400 font-medium"
                          : "text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {item.label}
                      <svg
                        className={`w-4 h-4 transition-transform ${mobileServicesOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {mobileServicesOpen && (
                      <div className="mt-1 ml-3 space-y-1 border-l border-slate-200 dark:border-slate-700 pl-3">
                        {menuServices.map((service) => (
                          <Link
                            key={service.slug}
                            href={service.link || `/services/${service.slug}`}
                            onClick={() => {
                              setServicesOpen(false);
                              setMobileServicesOpen(false);
                              dispatch(closeSidebar());
                            }}
                            className="block py-2 px-3 rounded text-sm text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 transition"
                            prefetch={true}
                          >
                            <span className="mr-2">{service.icon}</span>
                            {service.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              const active =
                pathname === "/"
                  ? isSectionActive(item.id)
                  : isActive(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={(e) => handleSectionClick(e, item.id)}
                  className={`block py-2.5 px-3 rounded transition ${
                    active
                      ? "bg-teal-600/10 dark:bg-teal-400/20 text-teal-700 dark:text-teal-400 font-medium"
                      : "text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400"
                  }`}
                  prefetch={true}
                >
                  {item.label}
                </Link>
              );
            })}

            <Link
              href="/demo"
              className="block py-2.5 px-3 text-teal-700 dark:text-teal-400 font-semibold hover:bg-teal-600/10 dark:hover:bg-teal-400/10 rounded transition"
              onClick={() => dispatch(closeSidebar())}
              prefetch={true}
            >
              Demo
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
