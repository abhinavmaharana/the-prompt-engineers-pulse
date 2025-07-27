import os
import requests
from bs4 import BeautifulSoup
from together import Together
import json
from datetime import datetime

# Initialize Together client
client = Together(api_key="af9a4a1c726e2f175f9a40249a8a6cf6ca325c8388a0b3ea3d11b016129e664b")
LLM_MODEL = "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"

def extract_visible_text(soup):
    """Extract all visible text from the page, skipping scripts/styles/etc."""
    texts = []
    for tag in soup.find_all(string=True):
        if tag.parent.name in ['style', 'script', 'head', 'meta', '[document]', 'footer', 'nav']:
            continue
        content = tag.strip()
        if content:
            texts.append(content)
    return texts

def fetch_live_traffic_updates():
    """Fetch and analyze traffic updates using LLM-based scraping"""
    try:
        print("🌐 Fetching traffic data from BTP website...")
        url = "https://btp.karnataka.gov.in/en"
        r = requests.get(url, timeout=15)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")
        
        # Extract all visible text from the page
        texts = extract_visible_text(soup)
        page_content = "\n".join(texts)

        # Use LLM to extract and categorize traffic info
        prompt = f"""
You are a Bengaluru Traffic Assistant analyzing the Bengaluru Traffic Police website.

Extract live traffic updates and categorize them into three types:
- "alert": Immediate traffic disruptions (accidents, road closures, diversions, congestion)
- "event": Planned events affecting traffic (VIP movements, processions, marathons, exhibitions)
- "news": General announcements (roadwork, metro construction, advisories)

Always include any mentions of "exhibition belr international center" or "hackathon" events.

Return ONLY a JSON array with objects containing:
- "type": "alert", "event", or "news"
- "content": A clear, concise description (max 100 characters)
- "priority": 1-5 (1=highest priority)

Website Content:
---
{page_content[:8000]}
---

Return only the JSON array, no other text.
"""
        
        print("🧠 Asking LLM to analyze traffic data...")
        resp = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[{"role": "user", "content": prompt}],
            stream=False,
            timeout=45,
        )
        
        # Parse LLM response
        llm_response = resp.choices[0].message.content.strip()
        
        # Try to extract JSON from response
        try:
            # Remove any markdown formatting
            if "```json" in llm_response:
                llm_response = llm_response.split("```json")[1].split("```")[0]
            elif "```" in llm_response:
                llm_response = llm_response.split("```")[1].split("```")[0]
            
            updates = json.loads(llm_response)
            
            # Validate and format updates
            formatted_updates = []
            for update in updates:
                if isinstance(update, dict) and 'type' in update and 'content' in update:
                    formatted_updates.append({
                        'type': update['type'],
                        'content': update['content'],
                        'timestamp': datetime.now().isoformat(),
                        'priority': update.get('priority', 3)
                    })
            
            return formatted_updates[:10]  # Limit to 10 updates
            
        except json.JSONDecodeError:
            print("❌ Failed to parse LLM JSON response")
            return []
            
    except Exception as e:
        print(f"❌ Error fetching traffic updates: {e}")
        return []

# FastAPI endpoint (if using FastAPI)
def traffic_updates_endpoint():
    """API endpoint for frontend to fetch traffic updates"""
    updates = fetch_live_traffic_updates()
    return {"updates": updates, "timestamp": datetime.now().isoformat()}
