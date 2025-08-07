// Simple test script to check if posts can be fetched
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://your-project.supabase.co'; // Replace with your URL
const supabaseKey = 'your-anon-key'; // Replace with your key

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPosts() {
  try {
    console.log('🔍 Testing posts fetch...');
    
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, user_id, content, image_url, likes_count, comments_count, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching posts:', error);
      return;
    }

    console.log('✅ Posts fetched successfully:', posts?.length || 0, 'posts');
    
    if (posts && posts.length > 0) {
      console.log('📝 Sample post:', posts[0]);
    }
    
  } catch (error) {
    console.error('❌ Error in test:', error);
  }
}

testPosts();
