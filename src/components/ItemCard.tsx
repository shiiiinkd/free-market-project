import { useState } from "react";
import { Heart } from "lucide-react";
import type { Item } from "../types/item";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
export default function ItemCard({ item }: { item: Item }) {
  const [isFavorite, setIsFavorite] = useState<number[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  const isMyItem = user?.id === item.user_id;

  const handleHeartClick = (e: React.MouseEvent, itemId: number) => {
    e.stopPropagation(); // お気に入り追加と画像クリックイベントの両方が発火しないようにする
    setIsFavorite((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <div
      className="relative bg-white rounded-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-200"
      onClick={() => navigate("/item/" + item.item_id)}
    >
      {/* 自分の商品マーク */}
      {isMyItem && (
        <div className="absolute top-2 left-2 z-10 px-2 py-1 rounded bg-primary-blue text-white text-xs font-bold">
          出品中
        </div>
      )}

      {/* 商品画像 */}
      <div className="relative aspect-square bg-gray-100">
        <img
          src={item.item_img}
          alt={item.item_name}
          className="w-full h-full object-cover"
        />

        {/* お気に入りボタン */}
        <button
          onClick={(e) => handleHeartClick(e, item.item_id)}
          className="absolute bottom-2 right-2 z-10 p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-md"
          aria-label={
            isFavorite.includes(item.item_id)
              ? "お気に入りから削除"
              : "お気に入りに追加"
          }
        >
          <Heart
            size={20}
            className={`${
              isFavorite.includes(item.item_id)
                ? "text-primary-blue fill-primary-blue"
                : "text-gray-400"
            } transition-colors`}
          />
        </button>
      </div>

      {/* 商品情報 */}
      <div className="p-3">
        <h3 className="text-sm font-normal line-clamp-2 min-h-[2.5rem] text-gray-800 mb-1">
          {item.item_name}
        </h3>
        <p className="text-lg font-bold text-gray-900">
          ¥{item.item_price.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
