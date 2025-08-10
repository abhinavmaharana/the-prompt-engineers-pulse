#!/usr/bin/env python3
"""
Test script for the live traffic scraper
Run this to verify the scraper works before starting the full backend
"""

import asyncio
import json
from live_scraper import LiveTrafficScraper

async def test_scraper():
    print("🧪 Testing Live Traffic Scraper...")
    print("=" * 50)
    
    # Create scraper instance
    scraper = LiveTrafficScraper()
    
    try:
        # Test single scrape
        print("📡 Testing single scrape...")
        data = await scraper.scrape_traffic_data()
        
        print(f"✅ Scrape successful!")
        print(f"📊 Alerts: {len(data.get('alerts', []))}")
        print(f"📅 Events: {len(data.get('events', []))}")
        print(f"📰 News: {len(data.get('news', []))}")
        print(f"🕒 Last Updated: {data.get('last_updated', 'N/A')}")
        print(f"📡 Status: {data.get('status', 'N/A')}")
        
        # Show sample data
        print("\n📋 Sample Data:")
        print("🚨 Alerts:")
        for i, alert in enumerate(data.get('alerts', [])[:3], 1):
            print(f"   {i}. {alert}")
        
        print("\n📅 Events:")
        for i, event in enumerate(data.get('events', [])[:3], 1):
            print(f"   {i}. {event}")
        
        print("\n📰 News:")
        for i, news in enumerate(data.get('news', [])[:3], 1):
            print(f"   {i}. {news}")
        
        return True
        
    except Exception as e:
        print(f"❌ Scrape failed: {e}")
        return False

def test_fallback():
    print("\n🔄 Testing fallback data...")
    scraper = LiveTrafficScraper()
    fallback = scraper.get_fallback_data()
    
    print(f"✅ Fallback data available:")
    print(f"📊 Alerts: {len(fallback.get('alerts', []))}")
    print(f"📅 Events: {len(fallback.get('events', []))}")
    print(f"📰 News: {len(fallback.get('news', []))}")
    
    return True

if __name__ == "__main__":
    print("🚀 CityPulse Live Scraper Test")
    print("=" * 50)
    
    # Test fallback data
    test_fallback()
    
    # Test live scraping
    success = asyncio.run(test_scraper())
    
    if success:
        print("\n🎉 All tests passed! The scraper is ready to use.")
        print("💡 You can now run: python3 main.py")
    else:
        print("\n⚠️  Some tests failed. Check the error messages above.")
        print("💡 Make sure all dependencies are installed and API keys are valid.")
