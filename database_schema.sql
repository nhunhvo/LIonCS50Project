-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  profile_picture_url TEXT,
  is_leaderboard_leader BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category_type TEXT NOT NULL, -- 'official_permanent', 'official_weekly', 'custom'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  week_start_date TIMESTAMP, -- for weekly categories
  created_by UUID REFERENCES users(id) ON DELETE CASCADE -- NULL for official categories
);

-- Category Members (for custom private categories)
CREATE TABLE category_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category_id, user_id)
);

-- Photos table
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  likes_count INT DEFAULT 0,
  dislikes_count INT DEFAULT 0,
  net_score INT DEFAULT 0, -- likes - dislikes
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Votes/Reactions table
CREATE TABLE photo_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL, -- 'like', 'dislike'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(photo_id, user_id) -- user can only vote once per photo
);

-- Weekly Leaderboard table
CREATE TABLE weekly_leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rank INT NOT NULL,
  points INT NOT NULL,
  week_start_date TIMESTAMP NOT NULL,
  week_end_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category_id, user_id, week_start_date)
);

-- Hall of Fame table
CREATE TABLE hall_of_fame (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL, -- 'YYYY-MM'
  rank INT NOT NULL,
  likes_count INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category_id, user_id, month_year, rank)
);

-- User Badges table
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL, -- 'leaderboard', 'hall_of_fame'
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  rank INT NOT NULL,
  period TEXT NOT NULL, -- 'week_YYYY-MM-DD', 'month_YYYY-MM', 'overall'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Badge Display (up to 5 badges shown)
CREATE TABLE displayed_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES user_badges(id) ON DELETE CASCADE,
  display_order INT NOT NULL,
  UNIQUE(user_id, badge_id)
);

-- Create indexes for common queries
CREATE INDEX idx_photos_user_id ON photos(user_id);
CREATE INDEX idx_photos_category_id ON photos(category_id);
CREATE INDEX idx_photos_created_at ON photos(created_at DESC);
CREATE INDEX idx_photos_net_score ON photos(net_score DESC);
CREATE INDEX idx_photo_votes_photo_id ON photo_votes(photo_id);
CREATE INDEX idx_photo_votes_user_id ON photo_votes(user_id);
CREATE INDEX idx_weekly_leaderboards_category ON weekly_leaderboards(category_id);
CREATE INDEX idx_weekly_leaderboards_week ON weekly_leaderboards(week_start_date);
CREATE INDEX idx_hall_of_fame_category ON hall_of_fame(category_id);
CREATE INDEX idx_hall_of_fame_month ON hall_of_fame(month_year);
CREATE INDEX idx_category_members_user ON category_members(user_id);

-- Enable real-time for tables
ALTER TABLE photos REPLICA IDENTITY FULL;
ALTER TABLE photo_votes REPLICA IDENTITY FULL;
ALTER TABLE weekly_leaderboards REPLICA IDENTITY FULL;
