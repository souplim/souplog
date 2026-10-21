import type { PostAttachment } from '~/lib/attachments';
import type { BookStatus } from '~/lib/book-shelf';
import type { PostImage } from '~/lib/images';

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
          // jsonb — shape is enforced on read by parsePostImages, not by the DB.
          images: unknown;
          // jsonb — shape is enforced on read by parsePostAttachments.
          attachments: unknown;
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
          images?: PostImage[];
          attachments?: PostAttachment[];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['posts']['Insert']>;
        Relationships: [];
      };
      profile: {
        Row: {
          id: boolean;
          name: string;
          tagline: string;
          content: string;
          // jsonb — shape is enforced on read by parsePostImage.
          avatar: unknown;
          updated_at: string;
        };
        Insert: {
          id?: boolean;
          name?: string;
          tagline?: string;
          content?: string;
          avatar?: PostImage | null;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profile']['Insert']>;
        Relationships: [];
      };
      books: {
        Row: {
          id: string;
          title: string;
          author: string;
          publisher: string;
          isbn: string | null;
          // jsonb — shape is enforced on read by parsePostImage.
          cover: unknown;
          status: BookStatus;
          total_pages: number | null;
          current_page: number;
          // date columns arrive as `YYYY-MM-DD`.
          started_at: string | null;
          finished_at: string | null;
          rating: number | null;
          note: string;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          author?: string;
          publisher?: string;
          isbn?: string | null;
          cover?: PostImage | null;
          status?: BookStatus;
          total_pages?: number | null;
          current_page?: number;
          started_at?: string | null;
          finished_at?: string | null;
          rating?: number | null;
          note?: string;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['books']['Insert']>;
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
      posts_list: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string;
          is_public: boolean;
          menu_id: string | null;
          created_at: string;
          updated_at: string;
          // Markdown source, cut to a fixed length — not yet safe to show as-is.
          content_preview: string;
          image_count: number;
          attachment_count: number;
          // jsonb — first entry of posts.images, or null. Validated on read.
          cover_image: unknown;
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
      search_posts: {
        Args: {
          p_query: string;
        };
        Returns: Database['public']['Views']['posts_list']['Row'][];
        SetofOptions: {
          from: '*';
          to: 'posts_list';
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Menu = Database['public']['Tables']['menus']['Row'];

export type PostRow = Database['public']['Tables']['posts']['Row'];

/**
 * What the app passes around: the raw row with its jsonb columns already
 * validated, so no component has to re-check their shape.
 */
export type Post = Omit<PostRow, 'images' | 'attachments'> & {
  images: PostImage[];
  attachments: PostAttachment[];
};
export type PostListRow = Database['public']['Views']['posts_list']['Row'];

/**
 * A post as the list cards need it: counts instead of the photo/attachment
 * arrays, and one plain-text preview line instead of the full body.
 */
export type PostSummary = Omit<PostListRow, 'content_preview' | 'cover_image'> & {
  /** The author's excerpt when written, otherwise the start of the body as plain text. */
  preview: string;
  coverImage: PostImage | null;
};
export type ProfileRow = Database['public']['Tables']['profile']['Row'];

/** The About page's content, with the avatar jsonb already validated. */
export type Profile = Omit<ProfileRow, 'id' | 'avatar'> & {
  avatar: PostImage | null;
};

export type BookRow = Database['public']['Tables']['books']['Row'];

/** A shelf entry with its cover jsonb already validated. */
export type Book = Omit<BookRow, 'cover'> & {
  cover: PostImage | null;
};

export type PublicComment =Database['public']['Views']['comments_public']['Row'];
