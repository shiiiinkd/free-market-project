import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

type Suggestion = {
  item_id: number;
  item_name: string;
};

export default function SearchBar() {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length === 0) {
      setSuggestions([]);
      return;
    }

    const t = setTimeout(async () => {
      const { data, error } = await supabase
        .from("items")
        .select("item_id, item_name")
        .or(`item_name.ilike.%${q}%,item_detail.ilike.%${q}%`)
        .limit(5);

      if (!error) setSuggestions(data || []);
    }, 250);

    return () => clearTimeout(t);
  }, [query]);

  const goSearch = (text: string) => {
    const q = text.trim();
    setOpen(false);
    if (!q) {
      navigate("/");
      return;
    }
    navigate(`/?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="flex-1 relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              goSearch(query);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder="なにをお探しですか？"
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue focus:bg-white transition-colors"
        />
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-10 bg-white border border-gray-200 rounded-md shadow-lg w-full mt-1">
          {suggestions.map((s) => (
            <li
              key={s.item_id}
              className="px-4 py-3 hover:bg-primary-blue-light cursor-pointer text-sm border-b last:border-b-0"
              onMouseDown={() => goSearch(s.item_name)}
            >
              {s.item_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
