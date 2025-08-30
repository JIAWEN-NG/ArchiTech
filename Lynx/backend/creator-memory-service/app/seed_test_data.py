
# Run with: python -m app.seed_data

import json
from datetime import datetime, timedelta, timezone
from .store import init_db, DB, MemoryORM  # ✅ keep a single import of MemoryORM

def clear_database():
    """Clear all existing data from the database"""
    print("🗑️ Clearing existing database data...")
    
    # Initialize database
    init_db()
    db = DB()
    
    try:
        # Clear all tables (assuming you have these ORM models)
        # Adjust table names based on your actual ORM models
        db.session.query(MemoryORM).delete()
        
        # If you have other tables, clear them too:
        # db.session.query(CreatorORM).delete()
        # db.session.query(PreferencesORM).delete()
        
        db.session.commit()
        print("✅ Database cleared successfully!")
        
    except Exception as e:
        print(f"❌ Error clearing database: {e}")
        db.session.rollback()
        raise
    finally:
        db.session.close()

def seed_test_data():
    """Add comprehensive test data to the database"""
    print("🧪 Seeding test data to database...")

    # Clear existing data first
    clear_database()

    # Initialize database
    init_db()
    db = DB()

    try:
        # 1. Create test creators
        print("👥 Creating test creators...")

        creators = [
            {
                'id': 'creator_001',
                'username': '@foodiebae',
                'locale': 'en',
                'timezone': 'Asia/Singapore'
            },
            {
                'id': 'creator_002',
                'username': '@fitlife_sg',
                'locale': 'en',
                'timezone': 'Asia/Singapore'
            },
            {
                'id': 'creator_003',
                'username': '@aestheticvibes',
                'locale': 'en',
                'timezone': 'Asia/Singapore'
            }
        ]

        for creator in creators:
            db.upsert_creator(
                creator['id'],
                creator['username'],
                creator['locale'],
                creator['timezone']
            )
            print(f"✅ Created creator: {creator['username']}")

        # 2. Set preferences for each creator
        print("⚙️ Setting creator preferences...")

        # Foodie preferences
        db.update_preferences('creator_001', {
            'tone': 'playful',
            'caption_length': 'short',
            'niche': 'food-review',
            'banned_words': ['diet', 'calories']
        })

        # Fitness preferences
        db.update_preferences('creator_002', {
            'tone': 'inspirational',
            'caption_length': 'medium',
            'niche': 'fitness',
            'banned_words': ['lazy', 'give up']
        })

        # Lifestyle preferences
        db.update_preferences('creator_003', {
            'tone': 'edgy',
            'caption_length': 'long',
            'niche': 'lifestyle',
            'banned_words': ['basic', 'boring']
        })

        print("✅ Preferences set for all creators")

        # 3. Add memories with realistic dates for trend score testing
        print("💭 Adding memories with realistic dates...")

        memories = [
            # Food creator memories (recent to older) - creator_001
            {
                'creator_id': 'creator_001',
                'caption': '🔥 This is absolutely incredible! Can\'t stop watching this amazing moment #viral #amazing #fyp #trending',
                'hashtags': ['#viral', '#amazing', '#fyp', '#trending'],
                'performance': {'views': 15000, 'likes': 12300, 'shares': 450, 'engagement': 89},
                'trend': '#viral trending +234%',
                'confidence': 95,
                'days_ago': 1
            },
            {
                'creator_id': 'creator_001',
                'caption': '💫 The way this turned out is just *chef\'s kiss* - who else is obsessed? #obsessed #perfect #viral #fyp',
                'hashtags': ['#obsessed', '#perfect', '#viral', '#fyp'],
                'performance': {'views': 18500, 'likes': 15100, 'shares': 650, 'engagement': 92},
                'trend': '#obsessed trending +89%',
                'confidence': 82,
                'days_ago': 2
            },
            {
                'creator_id': 'creator_001',
                'caption': 'Trying the viral Singapore laksa challenge! 🍜✨',
                'hashtags': ['#laksa', '#singapore', '#foodie', '#viral'],
                'performance': {'views': 15000, 'likes': 2300, 'shares': 450, 'engagement': 82},
                'days_ago': 3
            },
            {
                'creator_id': 'creator_001',
                'caption': 'Hidden hawker gem in Chinatown 🥟 Trust me on this one!',
                'hashtags': ['#hawker', '#chinatown', '#singapore', '#hidden'],
                'performance': {'views': 8200, 'likes': 1100, 'shares': 200, 'engagement': 76},
                'days_ago': 3
            },
            {
                'creator_id': 'creator_001',
                'caption': 'Making kaya toast at 3am hits different 🍞✨',
                'hashtags': ['#kayatoast', '#3am', '#singapore', '#comfort'],
                'performance': {'views': 5400, 'likes': 890, 'shares': 120, 'engagement': 72},
                'days_ago': 7
            },
            {
                'creator_id': 'creator_001',
                'caption': 'Bubble tea ranking: which one reigns supreme? 🧋👑',
                'hashtags': ['#bubbletea', '#ranking', '#singapore', '#drinks'],
                'performance': {'views': 12000, 'likes': 1800, 'shares': 300, 'engagement': 78},
                'days_ago': 15
            },

            # Fitness creator memories - creator_002
            {
                'creator_id': 'creator_002',
                'caption': '✨ POV: When everything goes perfectly and you can\'t believe your eyes #pov #perfect #satisfying #viral',
                'hashtags': ['#pov', '#perfect', '#satisfying', '#viral'],
                'performance': {'views': 12000, 'likes': 8700, 'shares': 350, 'engagement': 76},
                'trend': '#pov trending +156%',
                'confidence': 88,
                'days_ago': 1
            },
            {
                'creator_id': 'creator_002',
                'caption': "30-day transformation starting NOW! Who's joining? 💪🔥",
                'hashtags': ['#30daychallenge', '#transformation', '#fitness', '#motivation'],
                'performance': {'views': 25000, 'likes': 4200, 'shares': 800, 'engagement': 85},
                'days_ago': 2
            },
            {
                'creator_id': 'creator_002',
                'caption': 'Home workout using only a water bottle 💧 No excuses!',
                'hashtags': ['#homeworkout', '#noequipment', '#fitness', '#budget'],
                'performance': {'views': 12000, 'likes': 1800, 'shares': 350, 'engagement': 73},
                'days_ago': 5
            },
            {
                'creator_id': 'creator_002',
                'caption': 'Pre-workout breakfast that actually works ⚡🥗',
                'hashtags': ['#preworkout', '#breakfast', '#nutrition', '#energy'],
                'performance': {'views': 7800, 'likes': 920, 'shares': 180, 'engagement': 68},
                'days_ago': 10
            },
            {
                'creator_id': 'creator_002',
                'caption': 'Gym vs home workout: honest comparison 🏠🏋️',
                'hashtags': ['#gym', '#homeworkout', '#comparison', '#honest'],
                'performance': {'views': 9500, 'likes': 1200, 'shares': 250, 'engagement': 71},
                'days_ago': 20
            },

            # Lifestyle creator memories - creator_003
            {
                'creator_id': 'creator_003',
                'caption': '💫 The way this turned out is just *chef\'s kiss* - who else is obsessed? #obsessed #perfect #viral #fyp',
                'hashtags': ['#obsessed', '#perfect', '#viral', '#fyp'],
                'performance': {'views': 18500, 'likes': 15100, 'shares': 650, 'engagement': 92},
                'trend': '#obsessed trending +89%',
                'confidence': 82,
                'days_ago': 1
            },
            {
                'creator_id': 'creator_003',
                'caption': 'Aesthetic morning routine that changed my life (not clickbait) ☕✨',
                'hashtags': ['#morningroutine', '#aesthetic', '#selfcare', '#mindful'],
                'performance': {'views': 18500, 'likes': 3200, 'shares': 650, 'engagement': 88},
                'days_ago': 2
            },
            {
                'creator_id': 'creator_003',
                'caption': 'Thrifting in Singapore: luxury finds under $20 👗💎',
                'hashtags': ['#thrifting', '#singapore', '#sustainable', '#fashion'],
                'performance': {'views': 9300, 'likes': 1400, 'shares': 280, 'engagement': 79},
                'days_ago': 4
            },
            {
                'creator_id': 'creator_003',
                'caption': 'Room makeover with $50 budget challenge accepted 🏠🎨',
                'hashtags': ['#roommakeover', '#budget', '#diy', '#aesthetic'],
                'performance': {'views': 11200, 'likes': 1750, 'shares': 420, 'engagement': 83},
                'days_ago': 8
            },
            {
                'creator_id': 'creator_003',
                'caption': 'Night market adventures in Singapore 🌙🛍️',
                'hashtags': ['#nightmarket', '#singapore', '#adventure', '#local'],
                'performance': {'views': 6800, 'likes': 780, 'shares': 150, 'engagement': 65},
                'days_ago': 25
            }
        ]

        # Add memories with backdated timestamps
        # (Removed duplicate import of MemoryORM)

        # ✅ Batch add & commit for performance
        for memory in memories:
            # Use timezone-aware UTC datetime (optional but robust)
            created_at = datetime.now(timezone.utc) - timedelta(days=memory['days_ago'])

            memory_orm = MemoryORM(
                creator_id=memory['creator_id'],
                caption=memory['caption'],
                hashtags=json.dumps(memory['hashtags']),
                performance=json.dumps(memory['performance']),
                created_at=created_at
            )

            db.session.add(memory_orm)

            # Calculate what the trend score will be (purely informational)
            days_ago = memory['days_ago']
            trend_score = max(50, 100 - days_ago * 2)
            print(f"✅ Added memory: '{memory['caption'][:40]}...' ({days_ago}d ago, trend: {trend_score}%)")

        db.session.commit()  # single commit

        # 4. Show summary
        print("\n📊 Summary:")
        for creator in creators:
            creator_id = creator['id']
            memories_count = len(db.list_memories(creator_id))
            top_tags = db.top_hashtags(creator_id, limit=3) or []
            stats = db.inline_stats(creator_id)

            print(f"👤 {creator['username']}:")
            print(f"   📝 {memories_count} memories")
            print(f"   🏷️ Top hashtags: {', '.join(map(str, top_tags))}")
            print(f"   📈 Stats: {stats}")
            print()

        print("🎉 Test data seeded successfully!")
        print("\n💡 Use these creator IDs in your frontend:")
        for creator in creators:
            print(f"   - {creator['id']} ({creator['username']})")

        print("\n🔗 Test your endpoints:")
        print("   - Health: http://127.0.0.1:7002/healthz")
        print("   - Docs: http://127.0.0.1:7002/docs")
        print("   - Analytics: http://127.0.0.1:7002/analytics/inline?creator_id=creator_001")

    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        import traceback
        traceback.print_exc()

    finally:
        # Close session if it exists
        try:
            db.session.close()
        except Exception:
            pass

if __name__ == "__main__":
    seed_test_data()