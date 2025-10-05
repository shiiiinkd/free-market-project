import { User as UserIcon } from "lucide-react";

interface UserButtonProps {
  isLoggedIn: boolean;
  onClick: () => void;
  ariaExpanded: boolean;
}

export default function UserButton({
  isLoggedIn,
  onClick,
  ariaExpanded,
}: UserButtonProps) {
  return (
    <button
      type="button"
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
      onClick={onClick}
      aria-haspopup="menu"
      aria-expanded={ariaExpanded}
    >
      <UserIcon size={20} />
      <span>{isLoggedIn ? "マイページ" : "ログイン"}</span>
    </button>
  );
}
