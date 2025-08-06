import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, TextInput, Alert, RefreshControl } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from 'lib/supabase';
import { communityService, Post, Comment } from 'lib/community';
import GradientHeader from '@/components/GradientHeader';

export default function CommunityScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    loadInitialData();

    // Listen for authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Community - Auth state changed:', event, !!session);

      if (session?.user) {
        setCurrentUserId(session.user.id);
        setIsAuthenticated(true);
        await loadPosts(session.user.id);
      } else {
        setCurrentUserId(null);
        setIsAuthenticated(false);
        await loadPosts(); // Load posts without user context
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadInitialData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Community - Initial session check:', !!session);

      if (session?.user) {
        setCurrentUserId(session.user.id);
        setIsAuthenticated(true);
        await loadPosts(session.user.id);
      } else {
        setCurrentUserId(null);
        setIsAuthenticated(false);
        await loadPosts(); // Load posts without user context
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      setLoading(false);
    }
  };

  const loadPosts = async (userId?: string) => {
    try {
      const postsData = await communityService.getPosts(userId);
      setPosts(postsData);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error loading posts:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts(currentUserId || undefined);
  };

  const handleCreatePost = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please log in to create posts and interact with the community.');
      return;
    }

    if (!newPost.trim()) {
      Alert.alert('Error', 'Please write something to share!');
      return;
    }

    try {
      const result = await communityService.createPost({
        content: newPost.trim()
      });

      if (result.success) {
        Alert.alert('Success', 'Your post has been shared with the community!');
        setNewPost('');
        await loadPosts(currentUserId || undefined);
      } else {
        Alert.alert('Error', result.error || 'Failed to create post. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create post. Please try again.');
    }
  };

  const handleLike = async (postId: string) => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please log in to like posts and interact with the community.');
      return;
    }

    try {
      const result = await communityService.toggleLike(postId);
      if (result.success) {
        // Update the post in the local state
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId
              ? {
                  ...post,
                  is_liked: result.isLiked,
                  likes_count: result.isLiked
                    ? post.likes_count + 1
                    : post.likes_count - 1
                }
              : post
          )
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to like post.');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const loadComments = async (postId: string) => {
    try {
      const commentsData = await communityService.getComments(postId);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleCreateComment = async (postId: string) => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please log in to comment on posts.');
      return;
    }

    if (!newComment.trim()) return;

    try {
      const result = await communityService.createComment({
        post_id: postId,
        content: newComment.trim()
      });

      if (result.success) {
        setNewComment('');
        await loadComments(postId);
        // Update comments count in posts
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId
              ? { ...post, comments_count: post.comments_count + 1 }
              : post
          )
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to create comment.');
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const renderPost = (post: Post) => (
    <View key={post.id} style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {post.user_profile.full_name.charAt(0)}
            </Text>
          </View>
        </View>
        <View style={styles.postInfo}>
          <Text style={styles.userName}>{post.user_profile.full_name}</Text>
          <Text style={styles.postTime}>{formatTimeAgo(post.created_at)}</Text>
        </View>
      </View>

      {/* Post Content */}
      <Text style={styles.postContent}>{post.content}</Text>

      {/* Post Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLike(post.id)}
        >
          <Ionicons
            name={post.is_liked ? "heart" : "heart-outline"}
            size={20}
            color={post.is_liked ? "#FC7596" : "#FC7596"}
          />
          <Text style={[styles.actionText, post.is_liked && styles.likedText]}>
            {post.likes_count}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            if (showComments === post.id) {
              setShowComments(null);
            } else {
              setShowComments(post.id);
              loadComments(post.id);
            }
          }}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#FC7596" />
          <Text style={styles.actionText}>{post.comments_count}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={20} color="#FC7596" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Comments Section */}
      {showComments === post.id && (
        <View style={styles.commentsSection}>
          <View style={styles.commentInputContainer}>
            <TextInput
              style={[styles.commentInput, !isAuthenticated && styles.disabledInput]}
              placeholder={isAuthenticated ? "Write a comment..." : "Log in to comment..."}
              value={newComment}
              onChangeText={setNewComment}
              multiline
              editable={isAuthenticated}
            />
            <TouchableOpacity
              style={[styles.commentButton, !isAuthenticated && styles.disabledButton]}
              onPress={() => handleCreateComment(post.id)}
              disabled={!isAuthenticated}
            >
              <Ionicons name="send" size={16} color={isAuthenticated ? "#FC7596" : "#9CA3AF"} />
            </TouchableOpacity>
          </View>

          {/* Real comments */}
          {comments.map(comment => (
            <View key={comment.id} style={styles.comment}>
              <View style={styles.commentAvatar}>
                <Text style={styles.commentAvatarText}>
                  {comment.user_profile.full_name.charAt(0)}
                </Text>
              </View>
              <View style={styles.commentContent}>
                <Text style={styles.commentUser}>{comment.user_profile.full_name}</Text>
                <Text style={styles.commentText}>{comment.content}</Text>
                <Text style={styles.commentTime}>{formatTimeAgo(comment.created_at)}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <GradientHeader 
        title="👥 Community" 
        subtitle="Connect with other moms"
      />
      
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FC7596']}
            tintColor="#FC7596"
          />
        }
      >
        {/* Create Post Section - Only for authenticated users */}
        {isAuthenticated ? (
          <View style={styles.createPostCard}>
            <Text style={styles.createPostTitle}>Share with the community</Text>
            <TextInput
              style={styles.createPostInput}
              placeholder="What's on your mind? Share your pregnancy journey, ask questions, or offer support..."
              value={newPost}
              onChangeText={setNewPost}
              multiline
              numberOfLines={4}
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity style={styles.postButton} onPress={handleCreatePost}>
              <LinearGradient
                colors={['#FC7596', '#FF9A9E']}
                style={styles.postButtonGradient}
              >
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.postButtonText}>Share Post</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.loginPromptCard}>
            <Ionicons name="lock-closed" size={40} color="#FC7596" style={styles.lockIcon} />
            <Text style={styles.loginPromptTitle}>Join the Community</Text>
            <Text style={styles.loginPromptText}>
              Log in to share posts, like, comment, and connect with other moms in the BabyBloom community!
            </Text>
          </View>
        )}

        {/* Posts Feed */}
        <View style={styles.feedSection}>
          <Text style={styles.feedTitle}>Community Feed</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading posts...</Text>
            </View>
          ) : (
            posts.map(renderPost)
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  createPostCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  createPostTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  createPostInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#374151',
    textAlignVertical: 'top',
    marginBottom: 16,
    minHeight: 100,
  },
  postButton: {
    alignSelf: 'flex-end',
  },
  postButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  postButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  feedSection: {
    marginBottom: 20,
  },
  feedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FC7596',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  postInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  postTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  postContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  likedText: {
    color: '#FC7596',
    fontWeight: 'bold',
  },
  commentsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    marginRight: 8,
    maxHeight: 80,
  },
  commentButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledInput: {
    backgroundColor: '#F9FAFB',
    color: '#9CA3AF',
  },
  disabledButton: {
    backgroundColor: '#F3F4F6',
    opacity: 0.6,
  },
  comment: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FC7596',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  commentAvatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
    marginTop: 2,
  },
  commentTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  loginPromptCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 30,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lockIcon: {
    marginBottom: 16,
  },
  loginPromptTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  loginPromptText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});
