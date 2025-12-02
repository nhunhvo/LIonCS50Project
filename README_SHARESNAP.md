# ShareSnap - Social Media Photo Leaderboard App

A modern social media web app where users compete by uploading photos to different categories. Features real-time voting, weekly leaderboards, hall of fame rankings, and more!

## Features

✨ **Core Features**
- 📸 Upload photos to official or custom categories
- 🗳️ Like/dislike photos with real-time vote tracking
- 🏆 Weekly leaderboards with live rankings
- ⭐ Hall of Fame showcasing best monthly photos
- 👤 User profiles with badges and achievements
- 🔄 Real-time updates across all users

📂 **Category Types**
- **Official Permanent**: Basic categories available all the time (night out, soft launch, photobooth, hiking, family, etc.)
- **Official Weekly**: Themed categories that change every week with special leaderboards
- **Custom Private**: User-created categories shareable via phone number

🎖️ **Achievement System**
- Leaderboard badges for top rankings
- Hall of Fame badges for exceptional photos
- Halo indicator for current weekly leader
- Display up to 5 badges on profile

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Real-time Subscriptions
- **Storage**: Supabase Storage for photos

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (https://supabase.com)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/nhunhvo/LIonCS50Project.git
cd LIonCS50Project
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**
   - Create a new project at https://supabase.com
   - Go to SQL Editor and run the contents of `database_schema.sql`
   - Copy your project credentials from Settings → API

4. **Configure environment variables**
   - Copy `.env.local` and fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

5. **Enable Storage in Supabase**
   - Go to Storage and create a new bucket named `photos`
   - Set it to public
   - Configure CORS if needed

6. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app!

## Database Schema

The app uses the following tables:

- `users` - User profiles and leadership status
- `categories` - Photo categories (official/custom)
- `category_members` - Private category membership
- `photos` - Photo uploads with scoring
- `photo_votes` - User votes (like/dislike)
- `weekly_leaderboards` - Real-time weekly rankings
- `hall_of_fame` - Monthly best photos per category
- `user_badges` - Achievement tracking
- `displayed_badges` - Selected badges shown on profile

See `database_schema.sql` for full schema details.

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/photos` | GET/POST | Fetch/upload photos |
| `/api/votes` | POST | Vote on photos |
| `/api/leaderboard` | GET | Get weekly leaderboard |
| `/api/hall-of-fame` | GET | Get hall of fame |
| `/api/categories` | GET/POST | Fetch/create categories |
| `/api/categories/join` | POST | Join custom category |
| `/api/profile/[userId]` | GET | Get user profile |

## Components

- `PhotoGallery` - Display photos with sorting and voting
- `PhotoUpload` - Upload photos to categories
- `WeeklyLeaderboard` - Real-time leaderboard display
- `HallOfFame` - Monthly top photos showcase
- `UserProfile` - User profile with photos and badges
- `CategoryList` - Browse and select categories

## Next Steps / TODO

- [ ] Implement Supabase Authentication (email/OAuth)
- [ ] Add camera integration for photo capture
- [ ] Implement weekly cron job to archive expired categories
- [ ] Add monthly Hall of Fame calculation cron job
- [ ] Add push notifications for leaderboard changes
- [ ] Deploy to Vercel
- [ ] Add mobile app (React Native)
- [ ] Implement admin dashboard for category management

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT

## Support

For questions or issues, open a GitHub issue or contact the maintainers.
