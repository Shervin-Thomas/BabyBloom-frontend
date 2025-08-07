import { supabase } from './supabase';

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  isLiked?: boolean;
  user_profiles?: {
    full_name: string;
    email: string;
  };
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_profiles?: {
    full_name: string;
    email: string;
  };
}

export const postsService = {
  // Get all posts with user info and like status
  async getPosts(currentUserId?: string) {
    try {
      console.log('🔍 NEW POSTS SERVICE - Fetching all posts...');

      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ NEW POSTS SERVICE - Error fetching posts:', error);
        return [];
      }

      console.log('✅ NEW POSTS SERVICE - Posts fetched successfully:', posts?.length || 0, 'posts');

      if (!posts) return [];

      // Return posts with basic structure
      return posts.map(post => ({
        ...post,
        isLiked: false,
        user_profiles: { full_name: 'User', email: '' }
      }));
    } catch (error) {
      console.error('❌ NEW POSTS SERVICE - Error in getPosts:', error);
      return [];
    }
  },

  // Get posts by specific user
  async getUserPosts(userId: string, currentUserId?: string) {
    try {
      console.log('🔍 NEW POSTS SERVICE - Fetching posts for user:', userId);

      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ NEW POSTS SERVICE - Error fetching user posts:', error);
        return [];
      }

      console.log('✅ NEW POSTS SERVICE - Posts fetched successfully:', posts?.length || 0, 'posts');

      if (!posts) {
        console.log('📝 NEW POSTS SERVICE - No posts found for user');
        return [];
      }

      // Return posts with basic structure
      return posts.map(post => ({
        ...post,
        isLiked: false,
        user_profiles: { full_name: 'User', email: '' }
      }));
    } catch (error) {
      console.error('❌ NEW POSTS SERVICE - Error in getUserPosts:', error);
      return [];
    }
  },

  // Create a new post
  async createPost(userId: string, content: string, imageUrl?: string) {
    try {
      console.log('🔄 Creating post for user:', userId);

      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: userId,
          content,
          image_url: imageUrl || null,
          likes_count: 0,
          comments_count: 0
        })
        .select('id, user_id, content, image_url, likes_count, comments_count, created_at, updated_at')
        .single();

      if (error) {
        console.error('❌ Error creating post:', error);
        throw error;
      }

      console.log('✅ Post created successfully');

      return {
        ...data,
        isLiked: false,
        user_profiles: { full_name: 'User', email: '' }
      };
    } catch (error) {
      console.error('❌ Error creating post:', error);
      throw error;
    }
  },

  // Delete a post
  async deletePost(postId: string, userId: string) {
    try {
      // Try to delete related data first, but don't fail if tables don't exist
      try {
        await supabase.from('post_likes').delete().eq('post_id', postId);
        await supabase.from('post_comments').delete().eq('post_id', postId);
      } catch (relatedError) {
        console.log('Related tables not found, continuing with post deletion');
      }

      // Delete the post (only if user owns it)
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting post:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },

  // Toggle like on a post
  async toggleLike(postId: string, userId: string) {
    try {
      // For now, just return a random like status since likes table might not exist
      // This is a temporary solution until you create the likes table
      const isLiked = Math.random() > 0.5;
      console.log('Toggle like called - returning random status:', isLiked);
      return isLiked;
    } catch (error) {
      console.error('Error toggling like:', error);
      // Return false as fallback
      return false;
    }
  },

  // Get comments for a post
  async getPostComments(postId: string) {
    try {
      // Return empty array for now since comments table might not exist
      console.log('Getting comments for post:', postId);
      return [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  },

  // Add a comment to a post
  async addComment(postId: string, userId: string, content: string) {
    try {
      // For now, just log the comment since table might not exist
      console.log('Adding comment:', { postId, userId, content });
      return {
        id: 'temp-' + Date.now(),
        post_id: postId,
        user_id: userId,
        content,
        created_at: new Date().toISOString(),
        user_profiles: { full_name: 'User', email: '' }
      };
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }
};
