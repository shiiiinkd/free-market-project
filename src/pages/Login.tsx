import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

type Mode = "login" | "register";
function Login() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // 共通
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 登録用
  const [name, setName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schoolGrade, setSchoolGrade] = useState<number | "">("");

  // ログイン済みユーザーを自動的にホームにリダイレクト
  useEffect(() => {
    if (user && !authLoading) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  const toggleMode = () => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setMsg(null);
    setErr(null);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setErr(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            original_name: name,
            school_name: schoolName,
            grade: schoolGrade === "" ? null : Number(schoolGrade),
            user_icon: "",
          },
        },
      });
      if (error) throw error;

      console.debug("[signUp] data:", data);
      setMsg("登録成功! 確認メールを送信しました。");
      setMode("login");
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErr("登録エラー: " + e.message);
      } else {
        setErr("登録エラー: 不明なエラーが発生しました");
      }
    } finally {
      setLoading(false);
    }
  };

  const ensureProfileAfterLogin = async () => {
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes?.user;
    if (!user) return;

    const meta = user.user_metadata ?? {};
    const payload = {
      id: user.id,
      original_name: meta.original_name ?? name ?? "",
      school_name: meta.school_name ?? schoolName ?? "",
      grade:
        meta.grade !== undefined
          ? Number(meta.grade)
          : schoolGrade === ""
          ? null
          : Number(schoolGrade),
      user_icon: meta.user_icon ?? "",
    };

    const { error: upsertErr } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "id" });

    if (upsertErr) {
      setErr(`プロフィール保存でエラー: ${upsertErr.message}`);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setErr(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      console.debug("[signIn] data:", data);

      // ログインできたら profiles を確定反映
      await ensureProfileAfterLogin();

      setMsg("ログイン成功！ホームへ移動するよ。");
      navigate("/");
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErr(e.message);
      } else {
        setErr("ログインでエラー");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Loginページ</h1>
      {msg && (
        <p className="rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm">
          {msg}
        </p>
      )}
      {err && (
        <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm">
          {err}
        </p>
      )}

      {mode === "login" ? (
        <form
          onSubmit={handleLogin}
          className="space-y-4"
          aria-label="ログインフォーム"
        >
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-md border px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-md border px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 text-white py-2 font-medium disabled:opacity-60"
          >
            {loading ? "処理中…" : "ログイン"}
          </button>

          <p className="text-sm">
            アカウントをお持ちでない方は{" "}
            <button
              type="button"
              className="text-blue-600 underline"
              onClick={toggleMode}
              disabled={loading}
            >
              こちら
            </button>
          </p>
        </form>
      ) : (
        <form
          onSubmit={handleRegister}
          className="space-y-4"
          aria-label="新規登録フォーム"
        >
          <div className="space-y-1">
            <label htmlFor="new-email" className="block text-sm font-medium">
              メールアドレス
            </label>
            <input
              id="new-email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-md border px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="new-password" className="block text-sm font-medium">
              パスワード
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              className="w-full rounded-md border px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="new-name" className="block text-sm font-medium">
              名前
            </label>
            <input
              id="new-name"
              type="text"
              required
              className="w-full rounded-md border px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="new-school-name"
              className="block text-sm font-medium"
            >
              学校名
            </label>
            <input
              id="new-school-name"
              type="text"
              required
              className="w-full rounded-md border px-3 py-2"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="new-school-grade"
              className="block text-sm font-medium"
            >
              学年（数値）
            </label>
            <input
              id="new-school-grade"
              type="number"
              inputMode="numeric"
              min={0}
              className="w-full rounded-md border px-3 py-2"
              value={schoolGrade}
              onChange={(e) =>
                setSchoolGrade(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 text-white py-2 font-medium disabled:opacity-60"
          >
            {loading ? "処理中…" : "新規登録"}
          </button>

          <p className="text-sm">
            アカウントをお持ちの方は{" "}
            <button
              type="button"
              className="text-blue-600 underline"
              onClick={toggleMode}
              disabled={loading}
            >
              こちら
            </button>
          </p>
        </form>
      )}
    </div>
  );
}
export default Login;
