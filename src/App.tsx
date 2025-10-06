import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import ItemPage from "./pages/ItemDetail";
import ChatPage from "./pages/Chat";
import Chats from "./pages/Chats";
import SoldItem from "./pages/SoldItem";
import Home from "./pages/Home";
import MyPage from "./pages/MyPage";

function App() {
  const { user, loading } = useAuth();

  // 認証の読み込み中
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* 認証が必要なページ */}
        <Route
          index
          element={user ? <Home /> : <Navigate to="/login" replace />}
        />
        <Route
          path="chats"
          element={user ? <Chats /> : <Navigate to="/login" replace />}
        />
        <Route
          path="sold-items"
          element={user ? <SoldItem /> : <Navigate to="/login" replace />}
        />
        <Route
          path="item/:item_id"
          element={user ? <ItemPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="chat/:item_id"
          element={user ? <ChatPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="mypage"
          element={user ? <MyPage /> : <Navigate to="/login" replace />}
        />

        {/* ログインページ：ログイン済みの場合はホームにリダイレクト */}
        <Route
          path="login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />
      </Route>
    </Routes>
  );
}

export default App;
