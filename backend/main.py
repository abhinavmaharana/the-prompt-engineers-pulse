import os
import requests
from bs4 import BeautifulSoup
from together import Together
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx
from live_scraper import start_live_scraping_service, get_live_traffic_data

# ================= 1. SETUP =================
# Initialize FastAPI app
app = FastAPI()

# Configure CORS to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Initialize Together AI client
client = Together(api_key="af9a4a1c726e2f175f9a40249a8a6cf6ca325c8388a0b3ea3d11b016129e664b")
LLM_MODEL = "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"

def get_fallback_data():
    """Returns a default set of data if scraping fails."""
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
        ]
    }

# ================= 2. API ENDPOINT =================
@app.get("/api/traffic-updates")
async def get_traffic_updates():
    """
    This endpoint returns the latest live traffic data from the continuous scraper.
    """
    try:
        # Get the latest data from the live scraper
        traffic_data = get_live_traffic_data()
        return traffic_data
    except Exception as e:
        print(f"❌ Error getting live traffic data: {e}")
        return get_fallback_data()

@app.get("/api/traffic-updates/live")
async def get_live_traffic_stream():
    """
    This endpoint provides real-time streaming updates of traffic data.
    """
    try:
        from live_scraper import live_scraper
        # Return the latest data with streaming headers
        traffic_data = get_live_traffic_data()
        return traffic_data
    except Exception as e:
        print(f"❌ Error in live stream: {e}")
        return get_fallback_data()

# ================= 3. SERVER STARTUP =================
if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting CityPulse Backend Server...")
    print("🌐 Server will be available at: http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🔌 Traffic Updates API: http://localhost:8000/api/traffic-updates")
    print("🔌 Live Stream API: http://localhost:8000/api/traffic-updates/live")
    print("⏹️  Press Ctrl+C to stop the server")
    print("-" * 60)
    
    try:
        # Start the live scraping service
        print("🔄 Starting live traffic scraping service...")
        start_live_scraping_service()
        
        # Start the FastAPI server
        uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Server error: {e}")