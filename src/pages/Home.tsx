import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useState, useEffect, useCallback } from "react";
import type { Item } from "../types/item";
import ItemCard from "../components/ItemCard";
import { useAuth } from "../hooks/useAuth";

type TabType = "all" | "campus";

function Home() {
  const [searchParams] = useSearchParams();
  const q = (searchParams.get("q") || "").trim();
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const fetchItemsTable = useCallback(
    async (keyword: string, campusOnly: boolean) => {
      try {
        setLoading(true);
        setError(null);

        console.log("[Home] データ取得開始:", new Date().toLocaleTimeString());
        const startTime = performance.now();

        let query = supabase
          .from("items")
          .select(
            `
          *,
          profiles:user_id (
            original_name,
            school_name,
            grade
          )
        `
          )
          .order("created_at", { ascending: false });

        if (keyword && keyword.trim().length > 0) {
          query = query.or(
            `item_name.ilike.%${keyword}%,item_detail.ilike.%${keyword}%`
          );
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          console.error("[Home] エラー:", fetchError);
          throw fetchError;
        }

        let filteredData = data || [];
        if (campusOnly && user?.user_metadata?.school_name) {
          const schoolName = user.user_metadata.school_name;
          filteredData = (data || []).filter(
            (item) => item.profiles?.school_name === schoolName
          );
          console.log(
            `[Home] 学内フィルター: ${filteredData.length}/${data?.length}件`
          );
        }

        const duration = Math.round(performance.now() - startTime);
        console.log(
          `[Home] 取得完了: ${filteredData.length}件 (${duration}ms)`
        );

        setItems(filteredData);
      } catch (err) {
        console.error("[Home] 予期しないエラー:", err);
        const errorMessage =
          err instanceof Error ? err.message : "商品の取得に失敗しました";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (!authLoading) {
      fetchItemsTable(q, activeTab === "campus");
    }
  }, [q, activeTab, authLoading, fetchItemsTable]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-gray-500">認証情報を確認中...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 bg-red-50 border border-red-200 rounded p-4">
        <p className="text-red-800 font-medium mb-2">エラーが発生しました</p>
        <p className="text-red-600 text-sm mb-3">{error}</p>
        <button
          onClick={() => fetchItemsTable(q, activeTab === "campus")}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          再試行
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 font-medium ${
            activeTab === "all"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          すべて
        </button>
        <button
          onClick={() => setActiveTab("campus")}
          className={`px-4 py-2 font-medium ${
            activeTab === "campus"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          学内
          {user?.user_metadata?.school_name && (
            <span className="ml-1 text-xs text-gray-500">
              ({user.user_metadata.school_name})
            </span>
          )}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          {activeTab === "campus" ? (
            <div>
              <p className="mb-2">学内の商品がまだありません</p>
              {user?.user_metadata?.school_name && (
                <p className="text-sm">
                  {user.user_metadata.school_name}
                  の学生が出品するまでお待ちください
                </p>
              )}
            </div>
          ) : (
            <p>商品が見つかりませんでした</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item) => (
            <ItemCard key={item.item_id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
