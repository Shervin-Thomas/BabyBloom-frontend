import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Alert, ScrollView, Modal, RefreshControl, ActivityIndicator, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from 'lib/supabase';
import { profileService, Profile } from 'lib/profile';
import { postsService, Post } from 'lib/posts';
import { Session } from '@supabase/supabase-js';
import LoginForm from '@components/login';
import RegisterForm from '@components/register';
import GradientHeader from '@/components/GradientHeader';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface MealItem {
  day: string;
  meal: string;
  item: string;
}

interface DietPlanContent {
  [key: string]: MealItem[];
}

interface UserDietPlan {
  id: string;
  user_id: string;
  trimester: number;
  preferences: string[];
  allergies: string[];
  diet_plan_content: DietPlanContent;
  created_at: string;
}

interface UserNutritionLog {
  id: string;
  user_id: string;
  log_date: string;
  symptoms: string[] | null;
  custom_symptom: string | null;
  meal_input: string | null;
  symptom_results: {
    deficiencies: string[] | null;
    recommendations: string;
  } | null;
  diet_results: {
    deficiencies: string[] | null;
    recommendations: string;
  } | null;
  daily_nutrient_intake: { [key: string]: string } | null;
  created_at: string;
}

export default function ProfileTab() {
  const [session, setSession] = useState<Session | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<{[key: string]: any[]}>({});
  const [showComments, setShowComments] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [dietPlans, setDietPlans] = useState<UserDietPlan[]>([]);
  const [loadingDietPlans, setLoadingDietPlans] = useState(false);
  const [expandedDietPlanId, setExpandedDietPlanId] = useState<string | null>(null);
  const [nutritionLogs, setNutritionLogs] = useState<UserNutritionLog[]>([]);
  const [loadingNutritionLogs, setLoadingNutritionLogs] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [showAllPosts, setShowAllPosts] = useState(false); // New state for showing all posts
  const [showAllNutritionLogs, setShowAllNutritionLogs] = useState(false); // New state for showing all nutrition logs

  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session?.user) {
        setLoading(true);
        await loadProfile(session.user.id);
        await loadUserPosts(session.user.id);
        await loadUserDietPlans(session.user.id);
        await loadUserNutritionLogs(session.user.id);
        setLoading(false);
      } else {
        setLoading(false);
      }
    };
    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, 'Session:', !!session);
      console.log('User email confirmed:', session?.user?.email_confirmed_at);
      console.log('User email:', session?.user?.email);
      setSession(session);
      console.log('Session set in state, current session:', !!session, 'user ID:', session?.user?.id);

      if (session?.user) {
        // For Google OAuth users, email_confirmed_at might be null but they're still valid
        // Check if user has email (which means they're authenticated)
        if (session.user.email) {
          console.log('Authenticated user found, loading profile...');
          setLoading(true);
          await loadProfile(session.user.id);
          await loadUserPosts(session.user.id);
          await loadUserDietPlans(session.user.id);
          await loadUserNutritionLogs(session.user.id);
          setLoading(false);
        } else {
          console.log('Session user exists but no email, setting auth mode to login.');
          setProfile(null);
          setPosts([]);
          setDietPlans([]);
          setNutritionLogs([]);
          setAuthMode('login');
          setLoading(false);
        }
      } else {
        console.log('No session or user found, setting auth mode to login.');
        setProfile(null);
        setPosts([]);
        setDietPlans([]);
        setNutritionLogs([]);
        setAuthMode('login');
        setLoading(false);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Refresh posts when tab becomes active (to catch new posts from Community tab)
  useFocusEffect(
    useCallback(() => {
      const refreshPosts = async () => {
        if (session?.user?.id) {
          console.log('🔄 Profile tab focused - refreshing posts');
          await loadUserPosts(session.user.id);
          await loadUserDietPlans(session.user.id); // Also refresh diet plans
          await loadUserNutritionLogs(session.user.id); // Also refresh nutrition logs
        }
      };

      refreshPosts();
    }, [session?.user?.id])
  );

  const loadProfile = async (userId: string) => {
    setLoading(true);
    try {
      const profileData = await profileService.getProfile(userId);
      if (!profileData) {
        // Profile doesn't exist, create it
        const user = (await supabase.auth.getUser()).data.user;
        if (user) {
          await createMissingProfile(user);
        }
      } else {
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
    setLoading(false);
  };

  const createMissingProfile = async (user: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: user.user_metadata?.phone || '',
          date_of_birth: user.user_metadata?.date_of_birth || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (!error) {
        const profileData = await profileService.getProfile(user.id);
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error creating missing profile:', error);
    }
  };

  const loadUserPosts = async (userId: string) => {
    try {
      console.log('🔄 Loading posts for user:', userId);

      // Set loading to false immediately so UI shows
      setLoading(false);

      const userPosts = await postsService.getUserPosts(userId, userId);
      console.log('✅ Posts loaded:', userPosts.length);
      setPosts(userPosts);

      // Load preview comments for all posts
      if (userPosts.length > 0) {
        const postIds = userPosts.map(post => post.id);
        const commentsPromises = postIds.map(async (postId) => {
          const commentsData = await postsService.getPostComments(postId);
          return { postId, comments: commentsData.slice(0, 2) }; // Only first 2 comments for preview
        });

        const results = await Promise.all(commentsPromises);
        const commentsMap: {[key: string]: any[]} = {};
        results.forEach(({ postId, comments: postComments }) => {
          commentsMap[postId] = postComments;
        });

        setComments(commentsMap);
      }

      // If no posts from database, show sample posts
      if (userPosts.length === 0) {
        console.log('📝 No posts from database, showing sample posts');
        setPosts([]); // Set posts to empty array instead of sample posts
      }
    } catch (error) {
      console.error('❌ Error loading user posts:', error);
      // Set loading to false and ensure no sample posts are shown on error
      setLoading(false);
      setPosts([]); // Set posts to empty array instead of sample posts
    }
  };

  const loadUserDietPlans = async (userId: string) => {
    setLoadingDietPlans(true);
    try {
      const { data, error } = await supabase
        .from('user_diet_plans')
        .select('*')
        .eq('user_id', userId)
        .order('trimester', { ascending: true });

      if (error) {
        console.error('Error fetching user diet plans:', error);
        Alert.alert('Error', 'Failed to load diet plans.');
      } else {
        setDietPlans(data || []);
      }
    } catch (error) {
      console.error('Unexpected error loading diet plans:', error);
      Alert.alert('Error', 'An unexpected error occurred while loading diet plans.');
    }
    setLoadingDietPlans(false);
  };

  const toggleDietPlanExpansion = (planId: string) => {
    setExpandedDietPlanId(prevId => (prevId === planId ? null : planId));
  };

  const loadUserNutritionLogs = async (userId: string) => {
    setLoadingNutritionLogs(true);
    try {
      const { data, error } = await supabase
        .from('user_nutrition_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user nutrition logs:', error);
        Alert.alert('Error', 'Failed to load nutrition logs.');
      } else {
        setNutritionLogs(data || []);
      }
    } catch (error) {
      console.error('Unexpected error loading nutrition logs:', error);
      Alert.alert('Error', 'An unexpected error occurred while loading nutrition logs.');
    }
    setLoadingNutritionLogs(false);
  };

  const toggleLogExpansion = (logId: string) => {
    setExpandedLogId(prevId => (prevId === logId ? null : logId));
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Error', error.message);
  };

  const handleEditProfile = () => {
    setEditedProfile(profile);
    setShowEditProfile(true);
    setShowSettingsModal(false);
  };

  const handleSaveProfile = async () => {
    if (!editedProfile || !session?.user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editedProfile.full_name,
          phone: editedProfile.phone,
          date_of_birth: editedProfile.date_of_birth,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id);

      if (error) throw error;

      setProfile(editedProfile);
      setShowEditProfile(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.auth.admin.deleteUser(session?.user?.id || '');
              if (error) throw error;
              Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
            } catch (error: any) {
              Alert.alert('Error', 'Failed to delete account. Please contact support.');
            }
          }
        }
      ]
    );
  };

  const handleLikePost = async (postId: string) => {
    if (!session?.user) return;

    try {
      // Get current post state
      const currentPost = posts.find(post => post.id === postId);
      if (!currentPost) return;

      // Optimistically update UI first for better UX
      const optimisticIsLiked = !currentPost.isLiked;
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                isLiked: optimisticIsLiked,
                likes_count: optimisticIsLiked
                  ? post.likes_count + 1
                  : Math.max(0, post.likes_count - 1)
              }
            : post
        )
      );

      // Then call the service (which handles database updates)
      const actualIsLiked = await postsService.toggleLike(postId, session.user.id);

      // Refresh posts to get the actual database state
      await loadUserPosts(session.user.id);

      console.log('✅ Like toggled in Profile tab - optimistic:', optimisticIsLiked, 'actual:', actualIsLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update by refreshing from database
      await loadUserPosts(session.user.id);
      Alert.alert('Error', 'Failed to update like');
    }
  };

  const loadComments = async (postId: string) => {
    try {
      const commentsData = await postsService.getPostComments(postId);
      setComments(prev => ({
        ...prev,
        [postId]: commentsData
      }));
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleCreateComment = async (postId: string) => {
    if (!session?.user?.id) return;

    if (!newComment.trim()) return;

    try {
      const newCommentData = await postsService.addComment(postId, session.user.id, newComment.trim());
      setNewComment('');

      // Add the new comment to the comments state
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newCommentData]
      }));

      // Update comments count in posts (database trigger will handle the actual count)
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, comments_count: post.comments_count + 1 }
            : post
        )
      );

      console.log('✅ Comment added to UI');
    } catch (error) {
      console.error('Error creating comment:', error);
      Alert.alert('Error', 'Failed to create comment.');
    }
  };

  const handleCommentPress = (postId: string) => {
    if (showComments === postId) {
      setShowComments(null);
    } else {
      setShowComments(postId);
      loadComments(postId);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const handleDeletePost = async (postId: string) => {
    if (!session?.user) return;

    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await postsService.deletePost(postId, session.user.id);
              setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('Error', 'Failed to delete post');
            }
          }
        }
      ]
    );
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!session?.user?.id) return;

    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await postsService.deleteComment(commentId, session.user.id);
              // Update local state
              setComments(prev => {
                const newCommentsForPost = (prev[postId] || []).filter(c => c.id !== commentId);
                return { ...prev, [postId]: newCommentsForPost };
              });
              setPosts(prevPosts =>
                prevPosts.map(post =>
                  post.id === postId
                    ? { ...post, comments_count: Math.max(0, post.comments_count - 1) }
                    : post
                )
              );
              Alert.alert('Success', 'Comment deleted successfully!');
            } catch (error) {
              console.error('Error deleting comment:', error);
              Alert.alert('Error', 'Failed to delete comment.');
            }
          }
        }
      ]
    );
  };


  const handleDownloadPdf = async () => {
    if (nutritionLogs.length === 0) {
      Alert.alert('No Logs', 'There are no nutrition logs to generate a report.');
      return;
    }

    try {
      Alert.alert('Generating Report', 'Please wait while we create your nutrition report...');
      
      // Create a simple text-based report
      let reportContent = '🌸 BabyBloom Nutrition Log Report\n';
      reportContent += `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n\n`;
      
      nutritionLogs.forEach((log, index) => {
        reportContent += `=== Log Entry ${index + 1} ===\n`;
        reportContent += `Date: ${new Date(log.log_date).toLocaleDateString()}\n`;
        
        if (log.symptoms && log.symptoms.length > 0) {
          reportContent += `🩺 Symptoms: ${log.symptoms.join(', ')}\n`;
        }
        
        if (log.custom_symptom) {
          reportContent += `📝 Additional Symptom: ${log.custom_symptom}\n`;
        }
        
        if (log.meal_input) {
          reportContent += `🍽️ Dietary Intake: ${log.meal_input}\n`;
        }
        
        if (log.symptom_results?.deficiencies && log.symptom_results.deficiencies.length > 0) {
          reportContent += `🔍 Symptom-Based Detection:\n`;
          reportContent += `  Deficiencies: ${log.symptom_results.deficiencies.join(', ')}\n`;
          reportContent += `  Recommendations: ${log.symptom_results.recommendations}\n`;
        }
        
        if (log.diet_results?.deficiencies && log.diet_results.deficiencies.length > 0) {
          reportContent += `🥗 Dietary Intake Analysis:\n`;
          reportContent += `  Deficiencies: ${log.diet_results.deficiencies.join(', ')}\n`;
          reportContent += `  Recommendations: ${log.diet_results.recommendations}\n`;
        }
        
        if (log.daily_nutrient_intake && Object.keys(log.daily_nutrient_intake).length > 0) {
          reportContent += `📈 Daily Nutrient Intake:\n`;
          Object.entries(log.daily_nutrient_intake).forEach(([nutrient, amount]) => {
            reportContent += `  ${nutrient}: ${amount}\n`;
          });
        }
        
        reportContent += `📅 Logged at: ${new Date(log.created_at).toLocaleString()}\n\n`;
      });
      
      // Save as text file
      const fileName = `BabyBloom_Nutrition_Report_${new Date().toISOString().split('T')[0]}.txt`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, reportContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      // Show success message
      Alert.alert(
        '🎉 Report Generated Successfully!',
        `Your nutrition report has been saved to your device.\n\nFile: ${fileName}`,
        [
          {
            text: 'View Report',
            onPress: () => {
              Alert.alert('Nutrition Report', reportContent, [{ text: 'Close' }]);
            }
          },
          {
            text: 'OK',
            style: 'default'
          }
        ]
      );

    } catch (error) {
      console.error('Error generating report:', error);
      Alert.alert('Error', 'Failed to generate report. Please try again.');
    }
  };

  // Show login/register forms if not authenticated
  if (!session || !session.user?.email) {
    return (
      <ImageBackground 
        source={require('../../../assets/images/bg8.jpg')} 
        style={styles.container}
        resizeMode="cover"
      >
        <GradientHeader 
          title="Profile" 
          iconName="person"
        />
        <ScrollView style={styles.content}>
          {authMode === 'login' ? (
            <LoginForm onSwitchToRegister={() => setAuthMode('register')} setLoading={setLoading} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setAuthMode('login')} setLoading={setLoading} />
          )}
        </ScrollView>
      </ImageBackground>
    );
  }

  // Show loading state while profile loads
  if (loading) {
    return (
      <ImageBackground 
        source={require('../../../assets/images/bg8.jpg')} 
        style={styles.container}
        resizeMode="cover"
      >
        <GradientHeader 
          title="Profile" 
          iconName="person"
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </ImageBackground>
    );
  }

  // Show dashboard for authenticated users (with or without profile)
  return (
    <ImageBackground 
      source={require('../../../assets/images/bg8.jpg')} 
      style={styles.container}
      resizeMode="cover"
    >
      <GradientHeader 
        title="Profile" 
        iconName="person"
      />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading || loadingDietPlans || loadingNutritionLogs} // Add nutrition logs loading to refresh state
            onRefresh={async () => {
              if (session?.user?.id) {
                await loadProfile(session.user.id);
                await loadUserPosts(session.user.id);
                await loadUserDietPlans(session.user.id);
                await loadUserNutritionLogs(session.user.id);
              }
            }}
            colors={['#FC7596']}
            tintColor="#FC7596"
          />
        }
      >
        {/* Profile Header Section */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile?.full_name?.charAt(0)?.toUpperCase() || session.user.email?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          </View>
          <Text style={styles.userName}>{profile?.full_name || session.user.user_metadata?.full_name || 'User'}</Text>
          <Text style={styles.userEmail}>{profile?.email || session.user.email}</Text>
        </View>

        {/* User Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone:</Text>
            <Text style={styles.detailValue}>{profile?.phone || 'Not provided'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date of Birth:</Text>
            <Text style={styles.detailValue}>{profile?.date_of_birth || 'Not provided'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Member since:</Text>
            <Text style={styles.detailValue}>
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Recently'}
            </Text>
          </View>
        </View>

        {/* Community Stats Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Community Activity</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{posts.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{posts.reduce((total, post) => total + post.comments_count, 0)}</Text>
              <Text style={styles.statLabel}>Comments</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{posts.reduce((total, post) => total + post.likes_count, 0)}</Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>
          </View>
        </View>

        {/* My Posts Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>My Posts</Text>
          {posts.length === 0 ? (
            <Text style={styles.noPostsText}>No posts yet. Share your pregnancy journey!</Text>
          ) : (
            (showAllPosts ? posts : [posts[0]]).map((post) => (
              <View key={post.id} style={styles.postCard}>
                {/* Post Header */}
                <View style={styles.postHeader}>
                  <View style={styles.postAvatar}>
                    <Text style={styles.postAvatarText}>
                      {profile?.full_name?.charAt(0)?.toUpperCase() || session.user.email?.charAt(0)?.toUpperCase() || 'U'}
                    </Text>
                  </View>
                  <View style={styles.postUserInfo}>
                    <Text style={styles.postUserName}>{profile?.full_name || 'User'}</Text>
                    <Text style={styles.postTimestamp}>
                      {new Date(post.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeletePost(post.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#dc3545" />
                  </TouchableOpacity>
                </View>

                {/* Post Content */}
                <Text style={styles.postContent}>{post.content}</Text>

                {/* Post Image */}
                {post.image_url && (
                  <View style={styles.postImageContainer}>
                    <Text style={styles.postImagePlaceholder}>📸 Image attached</Text>
                  </View>
                )}

                {/* Post Actions */}
                <View style={styles.postActions}>
                  <TouchableOpacity
                    style={styles.postAction}
                    onPress={() => handleLikePost(post.id)}
                  >
                    <Ionicons
                      name={post.isLiked ? "heart" : "heart-outline"}
                      size={20}
                      color={post.isLiked ? "#FC7596" : "#6c757d"}
                    />
                    <Text style={[styles.postActionText, post.isLiked && styles.likedText]}>
                      {post.likes_count}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.postAction}
                    onPress={() => handleCommentPress(post.id)}
                  >
                    <Ionicons name="chatbubble-outline" size={20} color="#6c757d" />
                    <Text style={styles.postActionText}>{post.comments_count}</Text>
                  </TouchableOpacity>
                </View>

                {/* Comments Preview - Always show first 2 comments */}
                {comments[post.id] && comments[post.id].length > 0 && (
                  <View style={styles.commentsPreview}>
                    {comments[post.id].slice(showComments === post.id ? 0 : Math.max(0, comments[post.id].length - 1)).map(comment => (
                      <View key={comment.id} style={styles.comment}>
                        <View style={styles.commentAvatar}>
                          <Text style={styles.commentAvatarText}>
                            {comment.user_profiles?.full_name?.charAt(0) || 'U'}
                          </Text>
                        </View>
                        <View style={styles.commentContent}>
                          <Text style={styles.commentUser}>{comment.user_profiles?.full_name || 'User'}</Text>
                          <Text style={styles.commentText}>{comment.content}</Text>
                          <Text style={styles.commentTime}>{formatTimeAgo(comment.created_at)}</Text>
                        </View>
                        {session?.user?.id === comment.user_id && (
                          <TouchableOpacity
                            style={styles.deleteCommentButton}
                            onPress={() => handleDeleteComment(post.id, comment.id)}
                          >
                            <Ionicons name="trash-outline" size={16} color="#dc3545" />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}

                    {/* Show "View more comments" if there are more than 1 comment and not expanded */}
                    {comments[post.id].length > 1 && showComments !== post.id && (
                      <TouchableOpacity
                        style={styles.viewMoreComments}
                        onPress={() => {
                          setShowComments(post.id);
                          loadComments(post.id); // Load all comments when expanding
                        }}
                      >
                        <Text style={styles.viewMoreText}>
                          View {comments[post.id].length - 1} more comments
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Expanded Comments Section with Input */}
                {showComments === post.id && session?.user && (
                  <View style={styles.commentsSection}>
                    <View style={styles.commentInputContainer}>
                      <TextInput
                        style={styles.commentInput}
                        placeholder="Write a comment..."
                        value={newComment}
                        onChangeText={setNewComment}
                        multiline
                      />
                      <TouchableOpacity
                        style={styles.commentButton}
                        onPress={() => handleCreateComment(post.id)}
                      >
                        <Ionicons name="send" size={16} color="#FC7596" />
                      </TouchableOpacity>
                    </View>

                    {/* Show collapse button */}
                    <TouchableOpacity
                      style={styles.collapseComments}
                      onPress={() => setShowComments(null)}
                    >
                      <Text style={styles.collapseText}>Hide comments</Text>
                      <Ionicons name="chevron-up" size={16} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
          {posts.length > 1 && !showAllPosts && (
            <TouchableOpacity style={styles.showMoreButton} onPress={() => setShowAllPosts(true)}>
              <Text style={styles.showMoreButtonText}>Show More Posts ({posts.length - 1} more)</Text>
            </TouchableOpacity>
          )}
          {posts.length > 1 && showAllPosts && (
            <TouchableOpacity style={styles.showMoreButton} onPress={() => setShowAllPosts(false)}>
              <Text style={styles.showMoreButtonText}>Show Less Posts</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* My Diet Plans Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>My Diet Plans</Text>
          {loadingDietPlans ? (
            <ActivityIndicator size="small" color="#FC7596" />
          ) : dietPlans.length === 0 ? (
            <Text style={styles.noDietPlansText}>No diet plans generated yet. Go to Nutrition &gt; Diet Planner to create one!</Text>
          ) : (
            dietPlans.map(plan => {
              const isExpanded = expandedDietPlanId === plan.id;
              return (
                <TouchableOpacity key={plan.id} style={styles.dietPlanCard} onPress={() => toggleDietPlanExpansion(plan.id)}>
                  <View style={styles.dietPlanHeader}>
                    <Text style={styles.dietPlanCardTitle}>Trimester {plan.trimester} Diet Plan</Text>
                    <Ionicons
                      name={isExpanded ? "chevron-up-outline" : "chevron-down-outline"}
                      size={20}
                      color="#6c757d"
                    />
                  </View>
                  {isExpanded && (
                    <View>
                      {plan.preferences && plan.preferences.length > 0 && (
                        <Text style={styles.dietPlanDetail}>Preferences: {plan.preferences.join(', ')}</Text>
                      )}
                      {plan.allergies && plan.allergies.length > 0 && (
                        <Text style={styles.dietPlanDetail}>Allergies: {plan.allergies.join(', ')}</Text>
                      )}
                      <Text style={styles.dietPlanDetail}>Generated on: {new Date(plan.created_at).toLocaleDateString()}</Text>
                      <View style={styles.mealsContainer}>
                        {Object.entries(plan.diet_plan_content).map(([day, meals]: [string, MealItem[]]) => (
                          <View key={day} style={styles.mealDayContainer}>
                            <Text style={styles.mealDayTitle}>{day}</Text>
                            {meals.map((meal, index) => (
                              <Text key={index} style={styles.mealText}>• {meal.meal}: {meal.item}</Text>
                            ))}
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* My Nutrition Logs Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>My Nutrition Logs</Text>
          <View style={styles.nutritionLogButtonsContainer}>
            {/* Button to view all logs */}
            <TouchableOpacity
              style={styles.nutritionLogActionButton}
              onPress={() => setShowAllNutritionLogs(prev => !prev)}
            >
              <Text style={styles.nutritionLogActionButtonText}>
                {showAllNutritionLogs ? 'Hide Logs' : 'View All Logs'}
              </Text>
            </TouchableOpacity>

            {/* Button to download PDF report */}
            <TouchableOpacity
              style={styles.nutritionLogActionButton}
              onPress={() => handleDownloadPdf()}
            >
              <Text style={styles.nutritionLogActionButtonText}>Download PDF Report</Text>
            </TouchableOpacity>
          </View>

          {showAllNutritionLogs && (
            loadingNutritionLogs ? (
              <ActivityIndicator size="small" color="#FC7596" style={{ marginTop: 20 }} />
            ) : nutritionLogs.length === 0 ? (
              <Text style={styles.noNutritionLogsText}>No nutrition logs recorded yet. Go to Nutrition &gt; Nutrient Deficiency Detection to log your details!</Text>
            ) : (
              nutritionLogs.map(log => {
                const isExpanded = expandedLogId === log.id;
                return (
                  <TouchableOpacity key={log.id} style={styles.nutritionLogCard} onPress={() => toggleLogExpansion(log.id)}>
                    <View style={styles.nutritionLogHeader}>
                      <Text style={styles.nutritionLogTitle}>Log on {new Date(log.log_date).toLocaleDateString()}</Text>
                      <Ionicons
                        name={isExpanded ? "chevron-up-outline" : "chevron-down-outline"}
                        size={20}
                        color="#6c757d"
                      />
                    </View>
                    {isExpanded && (
                      <View style={styles.nutritionLogDetails}>
                        {log.symptoms && log.symptoms.length > 0 && (
                          <Text style={styles.logDetailText}>Symptoms: {log.symptoms.join(', ')}</Text>
                        )}
                        {log.custom_symptom && (
                          <Text style={styles.logDetailText}>Other Symptom: {log.custom_symptom}</Text>
                        )}
                        {log.meal_input && (
                          <Text style={styles.logDetailText}>Dietary Intake: {log.meal_input}</Text>
                        )}
                        {log.symptom_results?.deficiencies && log.symptom_results.deficiencies.length > 0 && (
                          <View style={styles.resultBlock}>
                            <Text style={styles.resultTitle}>Symptom-Based Detection:</Text>
                            <Text style={styles.resultText}>Deficiencies: {log.symptom_results.deficiencies.join(', ')}</Text>
                            <Text style={styles.resultText}>Recommendations: {log.symptom_results.recommendations}</Text>
                          </View>
                        )}
                        {log.diet_results?.deficiencies && log.diet_results.deficiencies.length > 0 && (
                          <View style={styles.resultBlock}>
                            <Text style={styles.resultTitle}>Dietary Intake-Based Detection:</Text>
                            <Text style={styles.resultText}>Deficiencies: {log.diet_results.deficiencies.join(', ')}</Text>
                            <Text style={styles.resultText}>Recommendations: {log.diet_results.recommendations}</Text>
                          </View>
                        )}
                        {log.daily_nutrient_intake && Object.keys(log.daily_nutrient_intake).length > 0 && (
                          <View style={styles.resultBlock}>
                            <Text style={styles.resultTitle}>Daily Nutrient Intake:</Text>
                            {Object.entries(log.daily_nutrient_intake).map(([nutrient, amount]) => (
                              <Text key={nutrient} style={styles.resultText}>{nutrient}: {amount}</Text>
                            ))}
                          </View>
                        )}
                        <Text style={styles.logTimestamp}>Logged at: {new Date(log.created_at).toLocaleString()}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
            )
          )}
        </View>

        {/* Settings Button */}
        <TouchableOpacity style={styles.settingsButton} onPress={() => setShowSettingsModal(true)}>
          <Ionicons name="settings-outline" size={20} color="#495057" style={{ marginRight: 8 }} />
          <Text style={styles.settingsButtonText}>Settings</Text>
        </TouchableOpacity>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

        {/* Settings Modal */}
        <Modal
          visible={showSettingsModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowSettingsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Settings</Text>
                <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                  <Ionicons name="close" size={24} color="#6c757d" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.settingsOption} onPress={handleEditProfile}>
                <Ionicons name="person-outline" size={20} color="#495057" />
                <Text style={styles.settingsOptionText}>Edit Profile</Text>
                <Ionicons name="chevron-forward" size={20} color="#6c757d" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingsOption}>
                <Ionicons name="notifications-outline" size={20} color="#495057" />
                <Text style={styles.settingsOptionText}>Notifications</Text>
                <Ionicons name="chevron-forward" size={20} color="#6c757d" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingsOption} onPress={() => {
                console.log('🔒 Privacy modal button clicked');
                setShowPrivacyModal(true);
                setShowSettingsModal(false);
                console.log('🔒 Privacy modal should be visible now');
              }}>
                <Ionicons name="shield-outline" size={20} color="#495057" />
                <Text style={styles.settingsOptionText}>Terms & Policies</Text>
                <Ionicons name="chevron-forward" size={20} color="#6c757d" />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.settingsOption, styles.dangerOption]} onPress={handleDeleteAccount}>
                <Ionicons name="trash-outline" size={20} color="#dc3545" />
                <Text style={[styles.settingsOptionText, styles.dangerText]}>Delete Account</Text>
                <Ionicons name="chevron-forward" size={20} color="#dc3545" />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Edit Profile Modal */}
        <Modal
          visible={showEditProfile}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowEditProfile(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={() => setShowEditProfile(false)}>
                  <Ionicons name="close" size={24} color="#6c757d" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={editedProfile?.full_name || ''}
                  onChangeText={(text) => setEditedProfile(prev => prev ? {...prev, full_name: text} : null)}
                  placeholder="Enter your full name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput
                  style={styles.textInput}
                  value={editedProfile?.phone || ''}
                  onChangeText={(text) => setEditedProfile(prev => prev ? {...prev, phone: text} : null)}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date of Birth</Text>
                <TextInput
                  style={styles.textInput}
                  value={editedProfile?.date_of_birth || ''}
                  onChangeText={(text) => setEditedProfile(prev => prev ? {...prev, date_of_birth: text} : null)}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Privacy & Terms Modal */}
        <Modal
          visible={showPrivacyModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowPrivacyModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.privacyModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Terms and Policies</Text>
                <TouchableOpacity onPress={() => setShowPrivacyModal(false)}>
                  <Ionicons name="close" size={24} color="#6c757d" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.privacyScrollView}
                contentContainerStyle={styles.privacyContentContainer}
                showsVerticalScrollIndicator={true}
              >
                <Text style={styles.privacyTitle}>BabyBloom Terms and Policies</Text>
                <Text style={styles.privacyDate}>Last Updated: January 15, 2025</Text>

                <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
                <Text style={styles.privacyText}>
                  By creating an account or using any part of the BabyBloom app, you agree to be bound by these Terms of Use and Privacy Policy. If you do not agree, please do not use the app.
                </Text>

                <Text style={styles.sectionTitle}>2. User Eligibility</Text>
                <Text style={styles.privacyText}>
                  BabyBloom is intended for users who are at least 18 years old. By using the app, you affirm that you are of legal age to enter into these terms and form a binding agreement.
                </Text>

                <Text style={styles.sectionTitle}>3. Description of Services</Text>
                <Text style={styles.privacyText}>
                  BabyBloom offers:
                </Text>
                <Text style={styles.privacyText}>
                  • AI-powered pregnancy and infant health guidance{'\n'}
                  • Personalized nutrition and wellness insights{'\n'}
                  • Mental health support and CBT exercises{'\n'}
                  • Smart growth and sleep tracking{'\n'}
                  • Community forums and chatbot assistance{'\n'}
                  • Secure storage of medical and vaccination records
                </Text>
                <Text style={styles.privacyText}>
                  These services are provided for informational and support purposes only and do not replace professional medical advice or care.
                </Text>

                <Text style={styles.sectionTitle}>4. Privacy and Data Use</Text>
                <Text style={styles.privacyText}>
                  We are committed to protecting your data:
                </Text>
                <Text style={styles.privacyText}>
                  • All personal health data is stored securely using Supabase and PostgreSQL{'\n'}
                  • AI/ML features are handled by a secure Python Flask API{'\n'}
                  • Your medical records are protected using blockchain security{'\n'}
                  • We comply with HIPAA, GDPR, and relevant data protection laws{'\n'}
                  • We do not sell your personal data to third parties
                </Text>

                <Text style={styles.sectionTitle}>5. User Responsibilities</Text>
                <Text style={styles.privacyText}>
                  You agree to:
                </Text>
                <Text style={styles.privacyText}>
                  • Provide accurate and up-to-date information{'\n'}
                  • Use the app only for lawful, non-commercial purposes{'\n'}
                  • Maintain confidentiality of your login credentials{'\n'}
                  • Immediately report any unauthorized use of your account
                </Text>

                <Text style={styles.sectionTitle}>6. AI and Health Disclaimer</Text>
                <Text style={styles.privacyText}>
                  BabyBloom uses AI to provide insights and recommendations. While we strive for accuracy:
                </Text>
                <Text style={styles.privacyText}>
                  • The AI chatbot, growth predictions, nutrition advice, and mental health tools are not substitutes for licensed medical professionals{'\n'}
                  • Always consult a pediatrician, OB/GYN, or mental health professional for medical decisions
                </Text>

                <Text style={styles.sectionTitle}>7. Community Guidelines</Text>
                <Text style={styles.privacyText}>
                  By participating in our support forums or posting reviews, you agree to:
                </Text>
                <Text style={styles.privacyText}>
                  • Use respectful language{'\n'}
                  • Avoid sharing false, harmful, or misleading content{'\n'}
                  • Refrain from posting medical advice if you are not a certified professional{'\n'}
                  • Accept moderation by AI and human admins to ensure a safe environment
                </Text>

                <Text style={styles.sectionTitle}>8. Payments</Text>
                <Text style={styles.privacyText}>
                  Payments made for premium features (e.g., advanced analytics, therapy matching) are processed securely via Razorpay. All transactions are subject to Razorpay's terms and conditions.
                </Text>

                <Text style={styles.sectionTitle}>9. Intellectual Property</Text>
                <Text style={styles.privacyText}>
                  All content, branding, algorithms, and user interface designs are the intellectual property of BabyBloom. You may not copy, reproduce, or distribute any part of the app without written permission.
                </Text>

                <Text style={styles.sectionTitle}>10. Limitation of Liability</Text>
                <Text style={styles.privacyText}>
                  We are not liable for:
                </Text>
                <Text style={styles.privacyText}>
                  • Any decisions you make based on AI suggestions{'\n'}
                  • Medical outcomes from actions taken using app content{'\n'}
                  • Service interruptions or data loss due to external factors{'\n'}
                  • Your use of the app is at your own risk
                </Text>

                <Text style={styles.sectionTitle}>11. Changes to Terms</Text>
                <Text style={styles.privacyText}>
                  We may update these Terms and Policies from time to time. Continued use of BabyBloom after changes indicates your acceptance of the revised terms.
                </Text>

                <Text style={styles.sectionTitle}>12. Contact Us</Text>
                <Text style={styles.privacyText}>
                  If you have questions about these terms, please contact us at:
                </Text>
                <Text style={styles.privacyText}>
                  📧 babybloom333@gmail.com
                </Text>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 100, // Extra padding at bottom for tab bar
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FC7596',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#6c757d',
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  detailLabel: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FC7596',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  settingsButton: {
    backgroundColor: '#e9ecef',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },
  signOutButton: {
    backgroundColor: '#dc3545',
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  settingsOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  settingsOptionText: {
    fontSize: 16,
    color: '#495057',
    marginLeft: 12,
    flex: 1,
  },
  dangerOption: {
    backgroundColor: '#fff5f5',
  },
  dangerText: {
    color: '#dc3545',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  saveButton: {
    backgroundColor: '#FC7596',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  // Privacy modal styles
  privacyModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    height: '90%',
    width: '100%',
  },
  privacyScrollView: {
    flex: 1,
    backgroundColor: 'white',
  },
  privacyContent: {
    flex: 1,
  },
  privacyContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  privacyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  privacyDate: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FC7596',
    marginTop: 20,
    marginBottom: 10,
  },
  privacyText: {
    fontSize: 15,
    color: '#495057',
    lineHeight: 22,
    marginBottom: 15,
    textAlign: 'justify',
  },
  // Posts styles
  noPostsText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  postCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#fff5f5',
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FC7596',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  postAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  postUserInfo: {
    flex: 1,
  },
  postUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  postTimestamp: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  postContent: {
    fontSize: 15,
    color: '#2c3e50',
    lineHeight: 22,
    marginBottom: 12,
  },
  postImageContainer: {
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
  },
  postImagePlaceholder: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  postActionText: {
    fontSize: 14,
    color: '#6c757d',
    marginLeft: 6,
    fontWeight: '500',
  },
  likedText: {
    color: '#FC7596',
    fontWeight: 'bold',
  },
  // Comments styles
  commentsPreview: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  comment: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FC7596',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  commentAvatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  commentContent: {
    flex: 1,
  },
  commentUser: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 13,
    color: '#495057',
    lineHeight: 18,
    marginBottom: 2,
  },
  commentTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  deleteCommentButton: {
    marginLeft: 10,
    padding: 5,
  },
  viewMoreComments: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  viewMoreText: {
    fontSize: 13,
    color: '#FC7596',
    fontWeight: '500',
  },
  commentsSection: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
    maxHeight: 80,
    paddingVertical: 4,
  },
  commentButton: {
    marginLeft: 8,
    padding: 6,
  },
  collapseComments: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  collapseText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginRight: 4,
  },
  // New styles for Diet Plans
  noDietPlansText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  dietPlanCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dietPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  dietPlanCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FC7596',
    marginBottom: 10,
  },
  dietPlanDetail: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
  },
  mealsContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  mealDayContainer: {
    marginBottom: 10,
  },
  mealDayTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 5,
  },
  mealText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    lineHeight: 20,
  },
  // New styles for Nutrition Logs
  noNutritionLogsText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  nutritionLogCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  nutritionLogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  nutritionLogTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  nutritionLogDetails: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  logDetailText: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
  },
  resultBlock: {
    backgroundColor: '#e9f7ef',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#28a745',
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 5,
  },
  resultText: {
    fontSize: 13,
    color: '#333',
    marginBottom: 2,
  },
  logTimestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'right',
  },
  showMoreButton: {
    alignSelf: 'center',
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
  },
  showMoreButtonText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '600',
  },
  nutritionLogButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  nutritionLogActionButton: {
    backgroundColor: '#FC7596',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  nutritionLogActionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});




