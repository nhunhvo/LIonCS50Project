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

**Option 1: Using Supabase Auth UI (Recommended)**

1. Go to your Supabase project → Authentication → Users
2. Click "Invite user" or "Create user"
3. Add test users with emails like:
   - alex@example.com (username: alex_photo)
   - jordan@example.com (username: jordan_lens)
   - casey@example.com (username: casey_captures)
   - taylor@example.com (username: taylor_clicks)

Then note the user IDs generated and use them below.

**Option 2: Direct SQL (if you have auth users already)**

If you already have users in `auth.users`, run this to add them to your `users` table:

```sql
INSERT INTO users (id, username, profile_picture_url) VALUES
('YOUR_USER_ID_HERE', 'alex_photo', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex'),
('YOUR_USER_ID_2', 'jordan_lens', 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan'),
('YOUR_USER_ID_3', 'casey_captures', 'https://api.dicebear.com/7.x/avataaars/svg?seed=casey'),
('YOUR_USER_ID_4', 'taylor_clicks', 'https://api.dicebear.com/7.x/avataaars/svg?seed=taylor');
```

Replace `YOUR_USER_ID_HERE` etc with actual user IDs from `auth.users` table.

**Option 3: Disable Foreign Key Temporarily (For Testing Only)**

If you just want test data:

```sql
-- Temporarily disable the foreign key constraint
ALTER TABLE users DISABLE TRIGGER ALL;

INSERT INTO users (id, username, profile_picture_url) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'alex_photo', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex'),
('550e8400-e29b-41d4-a716-446655440002', 'jordan_lens', 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan'),
('550e8400-e29b-41d4-a716-446655440003', 'casey_captures', 'https://api.dicebear.com/7.x/avataaars/svg?seed=casey'),
('550e8400-e29b-41d4-a716-446655440004', 'taylor_clicks', 'https://api.dicebear.com/7.x/avataaars/svg?seed=taylor');

-- Re-enable the constraint
ALTER TABLE users ENABLE TRIGGER ALL;
```

**⚠️ Warning**: Option 3 is only for testing. In production, always use real auth users.

## Testing the App

1. **Create a test user in Supabase** (if you haven't already):
   - Go to Authentication → Users
   - Click "Create user"
   - Email: `test@example.com`, Password: `TestPass123!`
   - Note the User ID (UUID) that gets generated

2. **Create the user profile in your app**:
   ```sql
   INSERT INTO users (id, username, profile_picture_url) VALUES
   ('PASTE_USER_ID_HERE', 'your_username', 'https://api.dicebear.com/7.x/avataaars/svg?seed=test');
   ```

3. Update `app/page.tsx` to use this user ID:
   ```tsx
   const [userId, setUserId] = useState<string>('PASTE_USER_ID_HERE')
   ```

4. Run your app:
   ```bash
   npm run dev
   ```

5. Visit http://localhost:3000
6. Click on a category to see the upload form
7. Upload a test photo

## Adding Sample Photos

After uploading via the UI, or manually insert test photos using your actual user ID:

```sql
INSERT INTO photos (user_id, category_id, photo_url, caption, likes_count, dislikes_count, net_score) 
SELECT 
  'YOUR_USER_ID_HERE',
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

Replace `YOUR_USER_ID_HERE` with your actual user ID from Supabase.

That's it! You now have sample data to test with.
