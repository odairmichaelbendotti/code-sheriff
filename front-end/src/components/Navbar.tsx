import { GoShieldCheck } from "react-icons/go";
import { LuLogOut } from "react-icons/lu";
import { useNavigate } from "react-router";
import { signOut, useSession } from "@/lib/auth-client";

export default function Navbar() {
  const navigate = useNavigate();
  const { data: session } = useSession();

  async function handleLogout() {
    await signOut();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-50 h-14 flex items-center justify-between px-6 bg-bg-primary border-b border-border-subtle">
      <div className="flex items-center gap-2">
        <GoShieldCheck className="text-accent text-xl" />
        <span className="font-medium text-text-primary">CodeSheriff</span>
      </div>

      <div className="flex items-center gap-3">
        {session?.user?.image && (
          <img
            src={session.user.image}
            alt=""
            width={32}
            height={32}
            className="rounded-full"
          />
        )}
        <span className="hidden sm:block text-sm text-text-secondary">
          {session?.user?.name.split(" ")[0]}
        </span>
        <button
          onClick={handleLogout}
          className="text-text-tertiary hover:text-text-primary transition-colors duration-150 cursor-pointer"
        >
          <LuLogOut size={18} />
        </button>
      </div>
    </header>
  );
}
