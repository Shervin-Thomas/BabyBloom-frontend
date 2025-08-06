import { supabase } from './supabase';

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  user_profile: {
    full_name: string;
    avatar_url?: string;
  };
  is_liked?: boolean; // Whether current user has liked this post
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_profile: {
    full_name: string;
    avatar_url?: string;
  };
}

export interface CreatePostData {
  content: string;
  image_url?: string;
}

export interface CreateCommentData {
  post_id: string;
  content: string;
}

export const communityService = {
  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return !!user;
    } catch (error) {
      return false;
    }
  },
  // Get all posts with user profiles and like status
  // This works for both authenticated and non-authenticated users
  async getPosts(userId?: string): Promise<Post[]> {
    try {
      // First get posts
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        return [];
      }

      if (!posts || posts.length === 0) return [];

      // Get user profiles for all posts
      const userIds = [...new Set(posts.map(post => post.user_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return [];
      }

      // Create a map of user profiles
      const profilesMap = new Map(profiles?.map(profile => [profile.id, profile]) || []);

      // If userId is provided (authenticated user), check which posts are liked by the user
      let likedPostIds = new Set<string>();
      if (userId) {
        const { data: likes } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', userId);

        likedPostIds = new Set(likes?.map(like => like.post_id) || []);
      }

      // Combine posts with profiles and like status
      return posts.map(post => ({
        ...post,
        user_profile: profilesMap.get(post.user_id) || { full_name: 'Unknown User', avatar_url: null },
        is_liked: userId ? likedPostIds.has(post.id) : false
      }));
    } catch (error) {
      console.error('Error in getPosts:', error);
      return [];
    }
  },

  // Create a new post - Only for authenticated users
  async createPost(postData: CreatePostData): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'You must be logged in to create posts' };
      }

      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: postData.content,
          image_url: postData.image_url
        });

      if (error) {
        console.error('Error creating post:', error);
        return { success: false, error: 'Failed to create post' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in createPost:', error);
      return { success: false, error: 'Failed to create post' };
    }
  },

  // Delete a post
  async deletePost(postId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) {
        console.error('Error deleting post:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deletePost:', error);
      return false;
    }
  },

  // Toggle like on a post - Only for authenticated users
  async toggleLike(postId: string): Promise<{ success: boolean; isLiked: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, isLiked: false, error: 'You must be logged in to like posts' };
      }

      // Check if user has already liked this post
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Unlike the post
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error removing like:', error);
          return { success: false, isLiked: false, error: 'Failed to unlike post' };
        }

        return { success: true, isLiked: false };
      } else {
        // Like the post
        const { error } = await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) {
          console.error('Error adding like:', error);
          return { success: false, isLiked: true, error: 'Failed to like post' };
        }

        return { success: true, isLiked: true };
      }
    } catch (error) {
      console.error('Error in toggleLike:', error);
      return { success: false, isLiked: false, error: 'Failed to like post' };
    }
  },

  // Get comments for a post - Available to everyone
  async getComments(postId: string): Promise<Comment[]> {
    try {
      // First get comments
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (commentsError) {
        console.error('Error fetching comments:', commentsError);
        return [];
      }

      if (!comments || comments.length === 0) return [];

      // Get user profiles for all comments
      const userIds = [...new Set(comments.map(comment => comment.user_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return [];
      }

      // Create a map of user profiles
      const profilesMap = new Map(profiles?.map(profile => [profile.id, profile]) || []);

      // Combine comments with profiles
      return comments.map(comment => ({
        ...comment,
        user_profile: profilesMap.get(comment.user_id) || { full_name: 'Unknown User', avatar_url: null }
      }));
    } catch (error) {
      console.error('Error in getComments:', error);
      return [];
    }
  },

  // Create a new comment - Only for authenticated users
  async createComment(commentData: CreateCommentData): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'You must be logged in to comment' };
      }

      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: commentData.post_id,
          user_id: user.id,
          content: commentData.content
        });

      if (error) {
        console.error('Error creating comment:', error);
        return { success: false, error: 'Failed to create comment' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in createComment:', error);
      return { success: false, error: 'Failed to create comment' };
    }
  },

  // Delete a comment
  async deleteComment(commentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        console.error('Error deleting comment:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteComment:', error);
      return false;
    }
  },

  // Get user's own posts
  async getUserPosts(userId: string): Promise<Post[]> {
    try {
      // First get posts
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching user posts:', postsError);
        return [];
      }

      if (!posts || posts.length === 0) return [];

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return [];
      }

      // Combine posts with profile
      return posts.map(post => ({
        ...post,
        user_profile: profile || { full_name: 'Unknown User', avatar_url: null }
      }));
    } catch (error) {
      console.error('Error in getUserPosts:', error);
      return [];
    }
  }
};
