import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useState, useEffect } from "react";
import type { Item } from "../types/item";
import ItemCard from "../components/ItemCard";

function Home() {
  const [searchParams] = useSearchParams();
  const q = (searchParams.get("q") || "").trim();
  const [items, setItems] = useState<Item[]>([]);
  //fetchItemsTable

  const fetchItemsTable = async (keyword: string) => {
    let query = supabase.from("items").select();
    if (keyword && keyword.trim().length > 0) {
      query = query.or(
        `item_name.ilike.%${keyword}%,item_detail.ilike.%${keyword}%`
      );
    }
    const { data, error } = await query;
    setItems(data || []);
    if (error) {
      alert("itemsテーブルの取得に失敗しました" + error.message);
    }
  };

  useEffect(() => {
    fetchItemsTable(q);
  }, [q]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {items.map((item) => (
        <ItemCard key={item.item_id} item={item} />
      ))}
    </div>
  );
}
export default Home;
