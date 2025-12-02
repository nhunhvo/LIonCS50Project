# Step 3: Create Sample Data

## Adding Official Categories

1. Go to your Supabase dashboard at https://supabase.com
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Create a new query and paste this to add sample categories:

```sql
-- Insert official permanent categories
INSERT INTO categories (name, description, category_type, is_active, created_by) VALUES
('Night Out', 'Best moments from nights out with friends', 'official_permanent', true, NULL),
('Soft Launch', 'Subtle ways to show you''re with someone special', 'official_permanent', true, NULL),
('Photobooth', 'Fun photobooth moments', 'official_permanent', true, NULL),
('Hiking', 'Beautiful hiking adventures', 'official_permanent', true, NULL),
('Family', 'Precious family moments', 'official_permanent', true, NULL),
('Food', 'Delicious food and meals', 'official_permanent', true, NULL),
('Travel', 'Travel destinations and adventures', 'official_permanent', true, NULL),
('Beach', 'Beach and summer vibes', 'official_permanent', true, NULL);

-- Insert a weekly category (change this every week)
INSERT INTO categories (name, description, category_type, is_active, week_start_date, created_by) VALUES
('Best Selfie This Week', 'Show off your best selfie', 'official_weekly', true, NOW(), NULL);
```

5. Click **Run** to execute

## Adding Sample Users

Run this query to create test users:

```sql
INSERT INTO users (id, username, profile_picture_url) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'alex_photo', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex'),
('550e8400-e29b-41d4-a716-446655440002', 'jordan_lens', 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan'),
('550e8400-e29b-41d4-a716-446655440003', 'casey_captures', 'https://api.dicebear.com/7.x/avataaars/svg?seed=casey'),
('550e8400-e29b-41d4-a716-446655440004', 'taylor_clicks', 'https://api.dicebear.com/7.x/avataaars/svg?seed=taylor');
```

## Testing the App

1. Update `app/page.tsx` to use one of these test user IDs:
```tsx
const [userId, setUserId] = useState<string>('550e8400-e29b-41d4-a716-446655440001')
```

2. Run your app:
```bash
npm run dev
```

3. Visit http://localhost:3000
4. Click on a category to see the upload form
5. Upload a test photo

## Adding Sample Photos

After uploading via the UI, or manually insert test photos:

```sql
INSERT INTO photos (user_id, category_id, photo_url, caption, likes_count, dislikes_count, net_score) 
SELECT 
  '550e8400-e29b-41d4-a716-446655440001',
  c.id,
  'https://picsum.photos/600/400?random=' || random()::text,
  'Check out this photo!',
  FLOOR(RANDOM() * 50),
  FLOOR(RANDOM() * 10),
  FLOOR(RANDOM() * 50) - FLOOR(RANDOM() * 10)
FROM categories c
WHERE c.name = 'Night Out'
LIMIT 3;
```

That's it! You now have sample data to test with.
