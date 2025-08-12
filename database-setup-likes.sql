-- Create likes table for post likes functionality
-- Run this in your Supabase SQL editor

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a user can only like a post once
  UNIQUE(post_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_user ON likes(post_id, user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view all likes
CREATE POLICY "Users can view all likes" ON likes
  FOR SELECT USING (true);

-- Users can insert their own likes
CREATE POLICY "Users can insert their own likes" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own likes
CREATE POLICY "Users can delete their own likes" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON likes TO authenticated;
GRANT SELECT ON likes TO anon;

-- Update posts table to ensure likes_count column exists and has default value
ALTER TABLE posts 
  ALTER COLUMN likes_count SET DEFAULT 0;

-- Update existing posts to have likes_count = 0 if NULL
UPDATE posts SET likes_count = 0 WHERE likes_count IS NULL;

-- Create a function to update likes count when likes are added/removed
-- This ensures the count stays in sync
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment likes count
    UPDATE posts 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement likes count
    UPDATE posts 
    SET likes_count = GREATEST(0, likes_count - 1) 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update likes count
DROP TRIGGER IF EXISTS trigger_update_likes_count_insert ON likes;
CREATE TRIGGER trigger_update_likes_count_insert
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_likes_count();

DROP TRIGGER IF EXISTS trigger_update_likes_count_delete ON likes;
CREATE TRIGGER trigger_update_likes_count_delete
  AFTER DELETE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_likes_count();

-- Test the setup with some sample data (optional)
-- You can uncomment these lines to test

-- Insert a test like (replace with actual post_id and user_id)
-- INSERT INTO likes (post_id, user_id) 
-- VALUES ('your-post-id-here', 'your-user-id-here');

-- Check if the likes count was updated
-- SELECT id, content, likes_count FROM posts WHERE id = 'your-post-id-here';

-- Remove the test like
-- DELETE FROM likes WHERE post_id = 'your-post-id-here' AND user_id = 'your-user-id-here';

-- Check if the likes count was decremented
-- SELECT id, content, likes_count FROM posts WHERE id = 'your-post-id-here';

COMMENT ON TABLE likes IS 'Stores user likes for posts with automatic likes_count synchronization';

-- =====================================================
-- COMMENTS TABLE SETUP
-- =====================================================

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for comments
-- Users can view all comments
CREATE POLICY "Users can view all comments" ON comments
  FOR SELECT USING (true);

-- Users can insert their own comments
CREATE POLICY "Users can insert their own comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON comments TO authenticated;
GRANT SELECT ON comments TO anon;

-- Update posts table to ensure comments_count column exists and has default value
ALTER TABLE posts
  ALTER COLUMN comments_count SET DEFAULT 0;

-- Update existing posts to have comments_count = 0 if NULL
UPDATE posts SET comments_count = 0 WHERE comments_count IS NULL;

-- Create a function to update comments count when comments are added/removed
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment comments count
    UPDATE posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement comments count
    UPDATE posts
    SET comments_count = GREATEST(0, comments_count - 1)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update comments count
DROP TRIGGER IF EXISTS trigger_update_comments_count_insert ON comments;
CREATE TRIGGER trigger_update_comments_count_insert
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comments_count();

DROP TRIGGER IF EXISTS trigger_update_comments_count_delete ON comments;
CREATE TRIGGER trigger_update_comments_count_delete
  AFTER DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comments_count();

-- Create updated_at trigger for comments
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_comments_updated_at ON comments;
CREATE TRIGGER trigger_update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE comments IS 'Stores user comments on posts with automatic comments_count synchronization';
