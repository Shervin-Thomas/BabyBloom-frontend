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
      console.log('Posts data:', posts);

      if (!posts) return [];

      // Fetch user profiles for all posts
      const userIds = [...new Set(posts.map(post => post.user_id))];
      console.log('User IDs for posts:', userIds);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      // Create a map of user profiles
      const profileMap = new Map();
      profiles?.forEach(profile => {
        profileMap.set(profile.id, profile);
      });
      console.log('Profile map for posts:', profileMap);

      // Check which posts the current user has liked (if user is provided)
      let likedPostIds = new Set();
      if (currentUserId) {
        const { data: likes } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', currentUserId)
          .in('post_id', posts.map(post => post.id));

        likedPostIds = new Set(likes?.map(like => like.post_id) || []);
      }

      // Return posts with user profile data and like status
      return posts.map(post => ({
        ...post,
        isLiked: likedPostIds.has(post.id),
        user_profiles: profileMap.get(post.user_id) || undefined
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

      // Fetch user profile for this specific user
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', userId)
        .single();

      // Check which posts the current user has liked (if currentUserId is provided)
      let likedPostIds = new Set();
      if (currentUserId) {
        const { data: likes } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', currentUserId)
          .in('post_id', posts.map(post => post.id));

        likedPostIds = new Set(likes?.map(like => like.post_id) || []);
      }

      // Return posts with user profile data and like status
      return posts.map(post => ({
        ...post,
        isLiked: likedPostIds.has(post.id),
        user_profiles: profile || undefined
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

      // Fetch user profile for the created post
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', userId)
        .single();

      return {
        ...data,
        isLiked: false,
        user_profiles: profile || undefined
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
      console.log('🔄 Toggling like for post:', postId, 'user:', userId);

      // Check if user has already liked this post
      const { data: existingLike, error: checkError } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected if no like exists
        console.error('❌ Error checking existing like:', checkError);
        throw checkError;
      }

      let isLiked = false;

      if (existingLike) {
        // User has liked this post, so unlike it
        const { error: deleteError } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);

        if (deleteError) {
          console.error('❌ Error removing like:', deleteError);
          throw deleteError;
        }

        // Likes count will be automatically decremented by database trigger

        isLiked = false;
        console.log('✅ Post unliked successfully');
      } else {
        // User hasn't liked this post, so like it
        const { error: insertError } = await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: userId
          });

        if (insertError) {
          console.error('❌ Error adding like:', insertError);
          throw insertError;
        }

        // Likes count will be automatically incremented by database trigger

        isLiked = true;
        console.log('✅ Post liked successfully');
      }

      return isLiked;
    } catch (error) {
      console.error('❌ Error toggling like:', error);
      // Return false as fallback to prevent UI issues
      return false;
    }
  },

  // Get comments for a post
  async getPostComments(postId: string) {
    try {
      console.log('🔍 Fetching comments for post:', postId);

      // Simple query - just get comments first
      const { data: comments, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error fetching comments:', error);
        return [];
      }

      console.log('📝 Raw comments from database:', comments?.length || 0, 'comments');
      console.log('Raw comments data:', comments);

      if (!comments || comments.length === 0) {
        console.log('✅ No comments found for post');
        return [];
      }

      // Get user profiles separately for all comment authors
      const userIds = [...new Set(comments.map(comment => comment.user_id))];
      let profiles: any[] = [];

      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        if (profilesError) {
          console.error('❌ Error fetching comment user profiles:', profilesError);
          // Continue without profiles if they fail
          profiles = [];
        } else {
          profiles = profilesData || [];
          console.log('Fetched comment user profiles:', profiles);
        }
      }

      // Create a map of user profiles
      const profileMap = new Map();
      profiles.forEach(profile => {
        profileMap.set(profile.id, profile);
      });
      console.log('Profile map for comments:', profileMap);

      // Transform the data to match expected format
      const transformedComments = comments.map((comment: any) => ({
        id: comment.id,
        post_id: postId,
        user_id: comment.user_id,
        content: comment.content,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        user_profiles: {
          full_name: profileMap.get(comment.user_id)?.full_name || undefined,
          email: profileMap.get(comment.user_id)?.email || ''
        }
      }));

      console.log('✅ Comments fetched successfully:', transformedComments.length, 'comments');
      console.log('Transformed comments data:', transformedComments);
      return transformedComments;
    } catch (error) {
      console.error('❌ Error in getPostComments:', error);
      return [];
    }
  },

  // Add a comment to a post
  async addComment(postId: string, userId: string, content: string) {
    try {
      console.log('🔄 Adding comment to post:', postId, 'by user:', userId);

      // Insert the comment
      const { data: comment, error: insertError } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: userId,
          content: content.trim()
        })
        .select('id, content, created_at, updated_at, user_id')
        .single();

      if (insertError) {
        console.error('❌ Error inserting comment:', insertError);
        throw insertError;
      }

      // Get user profile for the comment author
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', userId)
        .single();
      console.log('Profile data for new comment author:', profile);

      if (profileError) {
        console.error('❌ Error fetching comment author profile:', profileError);
      }

      // Transform the data to match expected format
      const transformedComment = {
        id: comment.id,
        post_id: postId,
        user_id: comment.user_id,
        content: comment.content,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        user_profiles: {
          full_name: profile?.full_name || undefined,
          email: profile?.email || ''
        }
      };

      console.log('✅ Comment added successfully');
      return transformedComment;
    } catch (error) {
      console.error('❌ Error adding comment:', error);
      throw error;
    }
  },

  // Delete a comment
  async deleteComment(commentId: string, userId: string) {
    try {
      console.log('🔄 Deleting comment:', commentId, 'by user:', userId);

      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId); // Ensure user can only delete their own comments

      if (error) {
        console.error('❌ Error deleting comment:', error);
        throw error;
      }

      console.log('✅ Comment deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting comment:', error);
      throw error;
    }
  }
};
