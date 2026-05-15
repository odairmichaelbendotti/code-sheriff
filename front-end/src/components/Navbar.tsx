import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { LuLogOut, LuUser, LuChevronDown } from "react-icons/lu";
import { signOut, useSession } from "@/lib/auth-client";

export default function Navbar() {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  async function handleLogout() {
    setDropdownOpen(false);
    await signOut();
    navigate("/");
  }

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 4);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [dropdownOpen]);

  const firstName = session?.user?.name?.split(" ")[0];
  const email = session?.user?.email;

  return (
    <header
      className={[
        "sticky top-0 z-50 flex items-center justify-between px-5 py-1",
        "bg-bg-primary/80 backdrop-blur-md transition-all duration-200",
        scrolled
          ? "border-b border-border-subtle shadow-sm"
          : "border-b border-transparent",
      ].join(" ")}
    >
      {/* Logo */}
      <NavLink
        to="/app/analyze"
        className="flex items-center gap-2 select-none group"
      >
        <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center transition-colors group-hover:bg-accent/15">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <span className="text-sm font-semibold tracking-tight text-text-primary">
          Code<span className="text-accent">Sheriff</span>
        </span>
      </NavLink>

      {/* Avatar */}
      <div className="flex items-center">
        {/* Avatar dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-lg hover:bg-bg-secondary transition-colors duration-150 cursor-pointer group"
          >
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt=""
                width={26}
                height={26}
                className="rounded-full ring-1 ring-border-subtle"
              />
            ) : (
              <div className="w-6.5 h-6.5 rounded-full bg-bg-tertiary flex items-center justify-center ring-1 ring-border-subtle">
                <LuUser size={13} className="text-text-tertiary" />
              </div>
            )}
            <LuChevronDown
              size={13}
              className={[
                "text-text-tertiary transition-transform duration-200",
                dropdownOpen ? "rotate-180" : "",
              ].join(" ")}
            />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-56 bg-bg-primary border border-border-subtle rounded-xl shadow-lg shadow-black/8 overflow-hidden">
              {/* User info */}
              <div className="px-3.5 py-3 border-b border-border-subtle">
                <div className="flex items-center gap-2.5">
                  {session?.user?.image ? (
                    <img
                      src={session.user.image}
                      alt=""
                      width={32}
                      height={32}
                      className="rounded-full shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center shrink-0">
                      <LuUser size={14} className="text-text-tertiary" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate leading-tight">
                      {firstName}
                    </p>
                    {email && (
                      <p className="text-xs text-text-tertiary truncate leading-tight mt-0.5">
                        {email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm text-text-secondary hover:text-red-500 hover:bg-red-500/6 transition-colors duration-150 cursor-pointer"
                >
                  <LuLogOut size={14} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
