# -*- coding: utf-8 -*-
# app/seed_data.py
# Run with: python -m app.seed_data

import json
from datetime import datetime, timedelta, timezone
from .store import init_db, DB, MemoryORM  # ✅ keep a single import of MemoryORM

def seed_test_data():
    """Add comprehensive test data to the database"""
    print("🧪 Seeding test data to database...")

    # Initialize database
    init_db()
    db = DB()

    try:
        # 1. Create test creators
        print("👥 Creating test creators...")

        creators = [
            {
                'id': 'creator_foodie',
                'username': '@foodiebae',
                'locale': 'en',
                'timezone': 'Asia/Singapore'
            },
            {
                'id': 'creator_fitness',
                'username': '@fitlife_sg',
                'locale': 'en',
                'timezone': 'Asia/Singapore'
            },
            {
                'id': 'creator_lifestyle',
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
        db.update_preferences('creator_foodie', {
            'tone': 'playful',
            'caption_length': 'short',
            'niche': 'food-review',
            'banned_words': ['diet', 'calories']
        })

        # Fitness preferences
        db.update_preferences('creator_fitness', {
            'tone': 'inspirational',
            'caption_length': 'medium',
            'niche': 'fitness',
            'banned_words': ['lazy', 'give up']
        })

        # Lifestyle preferences
        db.update_preferences('creator_lifestyle', {
            'tone': 'edgy',
            'caption_length': 'long',
            'niche': 'lifestyle',
            'banned_words': ['basic', 'boring']
        })

        print("✅ Preferences set for all creators")

        # 3. Add memories with realistic dates for trend score testing
        print("💭 Adding memories with realistic dates...")

        memories = [
            # Food creator memories (recent to older)
            {
                'creator_id': 'creator_foodie',
                'caption': 'Trying the viral Singapore laksa challenge! 🍜✨',
                'hashtags': ['#laksa', '#singapore', '#foodie', '#viral'],
                'performance': {'views': 15000, 'likes': 2300, 'shares': 450},
                'days_ago': 1
            },
            {
                'creator_id': 'creator_foodie',
                'caption': 'Hidden hawker gem in Chinatown 🥟 Trust me on this one!',
                'hashtags': ['#hawker', '#chinatown', '#singapore', '#hidden'],
                'performance': {'views': 8200, 'likes': 1100, 'shares': 200},
                'days_ago': 3
            },
            {
                'creator_id': 'creator_foodie',
                'caption': 'Making kaya toast at 3am hits different 🍞✨',
                'hashtags': ['#kayatoast', '#3am', '#singapore', '#comfort'],
                'performance': {'views': 5400, 'likes': 890, 'shares': 120},
                'days_ago': 7
            },
            {
                'creator_id': 'creator_foodie',
                'caption': 'Bubble tea ranking: which one reigns supreme? 🧋👑',
                'hashtags': ['#bubbletea', '#ranking', '#singapore', '#drinks'],
                'performance': {'views': 12000, 'likes': 1800, 'shares': 300},
                'days_ago': 15
            },

            # Fitness creator memories
            {
                'creator_id': 'creator_fitness',
                'caption': "30-day transformation starting NOW! Who's joining? 💪🔥",
                'hashtags': ['#30daychallenge', '#transformation', '#fitness', '#motivation'],
                'performance': {'views': 25000, 'likes': 4200, 'shares': 800},
                'days_ago': 2
            },
            {
                'creator_id': 'creator_fitness',
                'caption': 'Home workout using only a water bottle 💧 No excuses!',
                'hashtags': ['#homeworkout', '#noequipment', '#fitness', '#budget'],
                'performance': {'views': 12000, 'likes': 1800, 'shares': 350},
                'days_ago': 5
            },
            {
                'creator_id': 'creator_fitness',
                'caption': 'Pre-workout breakfast that actually works ⚡🥗',
                'hashtags': ['#preworkout', '#breakfast', '#nutrition', '#energy'],
                'performance': {'views': 7800, 'likes': 920, 'shares': 180},
                'days_ago': 10
            },
            {
                'creator_id': 'creator_fitness',
                'caption': 'Gym vs home workout: honest comparison 🏠🏋️',
                'hashtags': ['#gym', '#homeworkout', '#comparison', '#honest'],
                'performance': {'views': 9500, 'likes': 1200, 'shares': 250},
                'days_ago': 20
            },

            # Lifestyle creator memories
            {
                'creator_id': 'creator_lifestyle',
                'caption': 'Aesthetic morning routine that changed my life (not clickbait) ☕✨',
                'hashtags': ['#morningroutine', '#aesthetic', '#selfcare', '#mindful'],
                'performance': {'views': 18500, 'likes': 3200, 'shares': 650},
                'days_ago': 1
            },
            {
                'creator_id': 'creator_lifestyle',
                'caption': 'Thrifting in Singapore: luxury finds under $20 👗💎',
                'hashtags': ['#thrifting', '#singapore', '#sustainable', '#fashion'],
                'performance': {'views': 9300, 'likes': 1400, 'shares': 280},
                'days_ago': 4
            },
            {
                'creator_id': 'creator_lifestyle',
                'caption': 'Room makeover with $50 budget challenge accepted 🏠🎨',
                'hashtags': ['#roommakeover', '#budget', '#diy', '#aesthetic'],
                'performance': {'views': 11200, 'likes': 1750, 'shares': 420},
                'days_ago': 8
            },
            {
                'creator_id': 'creator_lifestyle',
                'caption': 'Night market adventures in Singapore 🌙🛍️',
                'hashtags': ['#nightmarket', '#singapore', '#adventure', '#local'],
                'performance': {'views': 6800, 'likes': 780, 'shares': 150},
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
        print("   - Analytics: http://127.0.0.1:7002/analytics/inline?creator_id=creator_foodie")

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
