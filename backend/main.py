import os
import requests
from bs4 import BeautifulSoup
from together import Together
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx

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
    This single endpoint scrapes the web, processes with an LLM,
    and returns the structured data to the frontend.
    """
    try:
        # Step 1: Fetch Website Content
        url = "https://btp.karnataka.gov.in/en"
        async with httpx.AsyncClient() as client_http:
            response = await client_http.get(url, timeout=20)
            response.raise_for_status()

        # Step 2: Parse and Extract Text
        soup = BeautifulSoup(response.text, "html.parser")
        texts = [tag.strip() for tag in soup.find_all(string=True) if tag.parent.name not in ['style', 'script', 'head', 'meta', '[document]'] and tag.strip()]
        joined_text = "\n".join(texts)

        # Step 3: Process with LLM
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
        - Return ONLY the JSON object, no other text.
        Website content:
        {joined_text[:8000]}
        """
        
        response_llm = client.chat.completions.create(
            model=LLM_MODEL,
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
            
        return traffic_data

    except Exception as e:
        print(f"❌ An error occurred: {e}. Returning fallback data.")
        return get_fallback_data()
