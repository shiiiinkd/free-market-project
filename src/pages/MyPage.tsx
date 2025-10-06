import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import ItemCard from "../components/ItemCard";
import type { Item } from "../types/item";

export default function MyPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [grade, setGrade] = useState<number | "">("");
  const [icon, setIcon] = useState("");
  const [bio, setBio] = useState("");
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user?.user_metadata) {
      setName(user.user_metadata.original_name || "");
      setSchoolName(user.user_metadata.school_name || "");
      setGrade(user.user_metadata.grade || "");
      setIcon(user.user_metadata.user_icon || "");
      setBio(user.user_metadata.bio || "");
    }
  }, [user]);

  useEffect(() => {
    const fetchMyItems = async () => {
      // userが存在しない場合は処理しない
      if (!user) {
        setLoading(false);
        return;
      }

      // ローディング開始
      setLoading(true);

      try {
        // Supabaseから自分の出品商品を取得
        const { data, error } = await supabase
          .from("items")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }); // 新しい順

        // エラーチェック
        if (error) {
          console.error("出品商品の取得に失敗:", error);
          alert("出品商品の取得に失敗しました");
          return;
        }

        // ステートに保存
        setMyItems(data || []);
      } catch (err) {
        console.error("予期しないエラー:", err);
        alert("予期しないエラーが発生しました");
      } finally {
        // ローディング終了
        setLoading(false);
      }
    };

    // userが存在する場合のみ実行
    if (user) {
      fetchMyItems();
    }
  }, [user]);

  const save = async () => {
    // user_metadataを更新
    await supabase.auth.updateUser({
      data: {
        original_name: name,
        school_name: schoolName,
        grade: grade === "" ? null : Number(grade),
        user_icon: icon,
        bio: bio,
      },
    });

    // profilesテーブルも更新
    if (user) {
      await supabase.from("profiles").upsert(
        {
          id: user.id,
          original_name: name,
          school_name: schoolName,
          grade: grade === "" ? null : Number(grade),
          user_icon: icon,
        },
        { onConflict: "id" }
      );
    }

    setEdit(false);
    alert("更新しました");
  };

  const handleDeleteItem = async (itemId: number, itemName: string) => {
    // 確認ダイアログを表示
    const confirmed = window.confirm(
      `「${itemName}」を削除しますか？\nこの操作は取り消せません。`
    );

    // キャンセルされた場合は何もしない
    if (!confirmed) {
      return;
    }

    try {
      // Supabaseから商品を削除
      const { error } = await supabase
        .from("items")
        .delete()
        .eq("item_id", itemId);

      // エラーチェック
      if (error) {
        console.error("削除エラー:", error);
        alert("商品の削除に失敗しました: " + error.message);
        return;
      }

      // 成功時：ローカルステートから削除
      setMyItems((prevItems) =>
        prevItems.filter((item) => item.item_id !== itemId)
      );

      // 成功メッセージ
      alert("商品を削除しました");
    } catch (err) {
      console.error("予期しないエラー:", err);
      alert("商品の削除中にエラーが発生しました");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl mb-4">マイページ</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex justify-between">
          <h2 className="font-medium">プロフィール</h2>
          {!edit && (
            <button
              onClick={() => setEdit(true)}
              className="px-2 py-1 text-xs border rounded"
            >
              編集
            </button>
          )}
        </div>

        {edit ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">名前</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded text-sm"
                placeholder="名前"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">学校名</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full p-2 border rounded text-sm"
                placeholder="学校名"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">学年</label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={grade}
                onChange={(e) =>
                  setGrade(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="w-full p-2 border rounded text-sm"
                placeholder="学年（数値）"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                自己紹介
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-2 border rounded text-sm"
                placeholder="自己紹介文"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={save}
                className="px-3 py-1 text-sm border rounded"
              >
                保存
              </button>
              <button
                onClick={() => setEdit(false)}
                className="px-3 py-1 text-sm border rounded"
              >
                キャンセル
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-1 text-sm">
            <p>
              <strong>名前:</strong>{" "}
              {user?.user_metadata?.original_name || "未設定"}
            </p>
            <p>
              <strong>学校:</strong>{" "}
              {user?.user_metadata?.school_name || "未設定"}
            </p>
            <p>
              <strong>学年:</strong>{" "}
              {user?.user_metadata?.grade
                ? `${user.user_metadata.grade}年生`
                : "未設定"}
            </p>
            <p>
              <strong>メール:</strong> {user?.email}
            </p>
            <p>
              <strong>自己紹介:</strong>
            </p>
            <p className="ml-2 text-gray-600">
              {user?.user_metadata?.bio || "未設定"}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => navigate("/")}
            className="px-3 py-1 text-sm border rounded flex-1"
          >
            ホーム
          </button>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="px-3 py-1 text-sm border rounded flex-1"
          >
            ログアウト
          </button>
        </div>
      </div>

      {/* 出品商品セクション */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4 mt-4">
        <h2 className="font-medium">出品商品</h2>

        {/* ローディング・空・商品一覧の条件分岐 */}
        {loading ? (
          <p className="text-gray-500 text-sm">読み込み中...</p>
        ) : myItems.length === 0 ? (
          <p className="text-gray-500 text-sm">出品商品がありません</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {myItems.map((item) => (
              <div key={item.item_id} className="relative">
                {/* 商品カード */}
                <ItemCard item={item} />

                {/* 削除ボタン（右下にオーバーレイ） */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // カードのクリックイベントを防ぐ
                    handleDeleteItem(item.item_id, item.item_name);
                  }}
                  className="absolute bottom-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600 transition-colors z-20"
                  aria-label="商品を削除"
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
