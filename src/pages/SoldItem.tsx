import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

function SoldItem() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    item_name: "",
    item_detail: "",
    item_price: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setError("ログインしてください");
    } else {
      setError("");
    }
  }, [isAuthenticated, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nextValue = name === "item_price" ? Number(value) : value;
    setFormData((prev) => ({
      ...prev,
      [name]: nextValue as never,
    }));
    if (error) {
      setError("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("画像ファイルを選択してください");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("画像サイズは5MB以下にしてください");
        return;
      }
    }
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : "");
  };

  const validateForm = () => {
    if (!formData.item_name.trim()) {
      setError("商品名を入力してください");
      return false;
    }
    if (!formData.item_detail.trim()) {
      setError("商品説明を入力してください");
      return false;
    }
    if (
      !formData.item_price ||
      parseFloat(formData.item_price.toString()) <= 0
    ) {
      setError("正しい価格を入力してください");
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setFormData({
      item_name: "",
      item_detail: "",
      item_price: 0,
    });
    setImageFile(null);
    setImagePreview("");
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!user) {
      setError("ログインしてください");
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl: string | null = null;

      // 画像が選択されている場合のみアップロード
      if (imageFile) {
        const bucket =
          import.meta.env.VITE_SUPABASE_BUCKET_ITEM_IMAGES || "item-images";
        const ext = imageFile.name.split(".").pop();
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(path, imageFile, { upsert: false });

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from(bucket)
          .getPublicUrl(path);
        imageUrl = publicData.publicUrl;
      }

      const { data, error } = await supabase.from("items").insert({
        item_name: formData.item_name,
        item_detail: formData.item_detail,
        item_price: formData.item_price,
        user_id: user.id,
        item_img: imageUrl || "",
      });

      if (error) throw error;

      console.log("商品を追加しました", data);
      alert("商品を追加しました");
      resetForm();
      setError("");
    } catch (e) {
      console.error("商品の追加に失敗しました", e);
      const errorMessage = e instanceof Error ? e.message : "不明なエラー";

      if (errorMessage.includes("Bucket not found")) {
        setError(
          `Storage バケットが見つかりません。ダッシュボードでバケット "${
            import.meta.env.VITE_SUPABASE_BUCKET_ITEM_IMAGES || "item-images"
          }" を作成し、公開設定/アップロード権限を確認してください。`
        );
      } else {
        setError("商品の追加に失敗しました: " + errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>出品一覧</h1>
      <div>
        <input
          type="text"
          name="item_name"
          value={formData.item_name}
          onChange={handleInputChange}
          placeholder="商品名"
        />
        <input
          type="text"
          name="item_detail"
          value={formData.item_detail}
          onChange={handleInputChange}
          placeholder="商品説明"
        />
        <input
          type="number"
          name="item_price"
          value={formData.item_price}
          onChange={handleInputChange}
          placeholder="価格"
        />

        {/* 画像アップロード */}
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {imagePreview && (
          <img
            src={imagePreview}
            alt="preview"
            className="w-40 h-40 object-cover mt-2"
          />
        )}
      </div>

      {error && <div className="text-red-500 mt-2 mb-2">{error}</div>}

      <button
        className="bg-green-500 text-white p-2 mr-2 disabled:opacity-50"
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting ? "出品中..." : "出品する"}
      </button>
      <button
        className="bg-blue-500 text-white p-2 mr-2"
        onClick={() => navigate("/")}
      >
        Homeページ
      </button>
    </div>
  );
}

export default SoldItem;
