import SearchBar from "./SearchBar";
import UserMenu from "./UserMenu";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* ロゴ */}
          <button
            onClick={() => navigate("/")}
            className="flex-shrink-0 text-primary-blue font-bold text-2xl hover:text-primary-blue-hover transition-colors"
          >
            Market
          </button>

          {/* 検索バー */}
          <div className="flex-1">
            <SearchBar />
          </div>

          {/* ユーザーメニュー */}
          <div className="flex-shrink-0">
            <UserMenu user={user} onLogin={login} onLogout={logout} />
          </div>
        </div>
      </div>
    </header>
  );
}
