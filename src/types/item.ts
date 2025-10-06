interface Item {
  item_id: number;
  item_name: string;
  item_detail: string;
  item_img: string;
  sold_flag: boolean;
  created_at: string;
  updated_at: string;
  bought_at?: string;
  item_price: number;
  user_id: string;
  profiles?: {
    original_name: string;
    school_name: string;
    grade: number;
  };
}

export type { Item };
