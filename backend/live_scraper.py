import asyncio
import json
import time
from datetime import datetime
from bs4 import BeautifulSoup
import httpx
from together import Together
import threading
import queue

class LiveTrafficScraper:
    def __init__(self):
        self.client = Together(api_key="af9a4a1c726e2f175f9a40249a8a6cf6ca325c8388a0b3ea3d11b016129e664b")
        self.LLM_MODEL = "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"
        self.data_queue = queue.Queue()
        self.latest_data = None
        self.is_running = False
        self.scrape_interval = 300  # 5 minutes
        
    def get_fallback_data(self):
        """Returns fallback data if scraping fails."""
        return {
            "alerts": [
                "Heavy traffic on Outer Ring Road due to construction.",
                "Accident near Electronic City causing lane closure.",
                "Signal maintenance on Brigade Road causing delays.",
                "Water logging at Silk Board junction causing delays.",
                "Road closure on MG Road for metro construction work.",
                "Diversion at Hebbal flyover for emergency repairs."
            ],
            "events": [
                "VIP movement on MG Road, expect diversions.",
                "Exhibition at BELR Center causing increased traffic.",
                "Marathon route affecting Cubbon Park Road.",
                "Cricket match at Chinnaswamy Stadium, expect traffic.",
                "Cultural event at Palace Grounds affecting Sankey Road."
            ],
            "news": [
                "Metro extension work to begin on Bannerghatta Road.",
                "New traffic signals installed at 20 junctions.",
                "BMTC introduces 10 new bus routes to reduce congestion.",
                "Traffic police deployment increased during peak hours.",
                "Digital advisory boards installed on major highways."
            ],
            "last_updated": datetime.now().isoformat(),
            "status": "fallback"
        }
    
    async def scrape_traffic_data(self):
        """Scrape live traffic data from Bengaluru Traffic Police website."""
        try:
            print(f"🔍 [{datetime.now().strftime('%H:%M:%S')}] Scraping live traffic data...")
            
            url = "https://btp.karnataka.gov.in/en"
            async with httpx.AsyncClient() as client_http:
                response = await client_http.get(url, timeout=20)
                response.raise_for_status()

            soup = BeautifulSoup(response.text, "html.parser")
            texts = [tag.strip() for tag in soup.find_all(string=True) 
                    if tag.parent.name not in ['style', 'script', 'head', 'meta', '[document]'] and tag.strip()]
            joined_text = "\n".join(texts)

            # Process with LLM
            prompt = f"""
            You are analyzing content from Bengaluru Traffic Police website. 
            Return ONLY a valid JSON object with this exact structure:
            {{
              "alerts": ["alert1", "alert2", "alert3", "alert4", "alert5"],
              "events": ["event1", "event2", "event3", "event4", "event5"], 
              "news": ["news1", "news2", "news3", "news4", "news5"]
            }}
            Rules:
            - Each array must have at least 5 items.
            - Each item must be a clear, detailed sentence (60-120 chars).
            - Focus on REAL-TIME updates, current events, and live traffic conditions.
            - Return ONLY the JSON object, no other text.
            Website content:
            {joined_text[:8000]}
            """
            
            response_llm = self.client.chat.completions.create(
                model=self.LLM_MODEL,
                messages=[{"role": "user", "content": prompt}],
                stream=False,
                timeout=45,
            )
            llm_output = response_llm.choices[0].message.content.strip()
            
            if llm_output.startswith("```json"):
                llm_output = llm_output.split("```json")[1].split("```")[0]
            
            traffic_data = json.loads(llm_output)
            
            if not all(key in traffic_data for key in ['alerts', 'events', 'news']):
                raise ValueError("Missing required keys in LLM response")
            
            # Add metadata
            traffic_data["last_updated"] = datetime.now().isoformat()
            traffic_data["status"] = "live"
            traffic_data["scrape_timestamp"] = time.time()
            
            print(f"✅ [{datetime.now().strftime('%H:%M:%S')}] Successfully scraped {len(traffic_data['alerts'])} alerts, {len(traffic_data['events'])} events, {len(traffic_data['news'])} news")
            
            return traffic_data

        except Exception as e:
            print(f"❌ [{datetime.now().strftime('%H:%M:%S')}] Scraping error: {e}")
            return self.get_fallback_data()
    
    def start_live_scraping(self):
        """Start the live scraping service in a separate thread."""
        self.is_running = True
        
        def scraping_loop():
            while self.is_running:
                try:
                    # Run async scraping in the thread
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    data = loop.run_until_complete(self.scrape_traffic_data())
                    loop.close()
                    
                    # Update latest data
                    self.latest_data = data
                    
                    # Put in queue for real-time updates
                    self.data_queue.put(data)
                    
                    # Wait for next scrape
                    time.sleep(self.scrape_interval)
                    
                except Exception as e:
                    print(f"❌ Scraping loop error: {e}")
                    time.sleep(60)  # Wait 1 minute before retrying
        
        # Start scraping in background thread
        scraping_thread = threading.Thread(target=scraping_loop, daemon=True)
        scraping_thread.start()
        print(f"🚀 Live scraping service started. Scraping every {self.scrape_interval} seconds.")
    
    def stop_live_scraping(self):
        """Stop the live scraping service."""
        self.is_running = False
        print("🛑 Live scraping service stopped.")
    
    def get_latest_data(self):
        """Get the most recent scraped data."""
        return self.latest_data or self.get_fallback_data()
    
    def get_data_queue(self):
        """Get the queue for real-time updates."""
        return self.data_queue

# Global scraper instance
live_scraper = LiveTrafficScraper()

def start_live_scraping_service():
    """Start the live scraping service."""
    live_scraper.start_live_scraping()

def stop_live_scraping_service():
    """Stop the live scraping service."""
    live_scraper.stop_live_scraping()

def get_live_traffic_data():
    """Get the latest live traffic data."""
    return live_scraper.get_latest_data()

if __name__ == "__main__":
    # Test the live scraper
    print("🧪 Testing Live Traffic Scraper...")
    start_live_scraping_service()
    
    try:
        # Let it run for a few cycles
        time.sleep(20)
        print("📊 Latest data:", json.dumps(get_live_traffic_data(), indent=2))
    finally:
        stop_live_scraping_service()
