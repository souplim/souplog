export interface Database {
  public: {
    Tables: {
      menus: {
        Row: {
          id: string;
          name: string;
          slug: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['menus']['Insert']>;
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          excerpt: string;
          is_public: boolean;
          menu_id: string | null;
          cover_image_path: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          content?: string;
          excerpt?: string;
          is_public?: boolean;
          menu_id?: string | null;
          cover_image_path?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['posts']['Insert']>;
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          author_name: string;
          password_hash: string;
          content: string;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: {
      comments_public: {
        Row: {
          id: string;
          post_id: string;
          author_name: string;
          content: string;
          created_at: string;
        };
        Relationships: [];
      };
    };
    Functions: {
      create_comment: {
        Args: {
          p_post_id: string;
          p_author_name: string;
          p_password: string;
          p_content: string;
        };
        Returns: {
          id: string;
          post_id: string;
          author_name: string;
          content: string;
          created_at: string;
        }[];
      };
      delete_comment: {
        Args: {
          p_comment_id: string;
          p_password: string;
        };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Menu = Database['public']['Tables']['menus']['Row'];
export type Post = Database['public']['Tables']['posts']['Row'];
export type PublicComment = Database['public']['Views']['comments_public']['Row'];
