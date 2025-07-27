import requests
from bs4 import BeautifulSoup
import google.generativeai as genai
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os

# ================= STEP 1: Configure Gemini =================
genai.configure(api_key="AIzaSyBrhIdLNuLl2TnrdBcy2irHN41ohF_p9c8")
model = genai.GenerativeModel("models/gemini-1.5-pro-latest")

# ================= STEP 2: Fetch Website ====================
url = "https://btp.karnataka.gov.in/en"
print("🔍 Fetching content from:", url)

try:
    response = requests.get(url, timeout=20)
    response.raise_for_status()
except Exception as e:
    print("❌ Failed to fetch the page:", e)
    exit()

# ================= STEP 3: Parse and Extract Text ==============
soup = BeautifulSoup(response.text, "html.parser")

def extract_visible_text(soup):
    texts = []
    for tag in soup.find_all(string=True):
        if tag.parent.name in ['style', 'script', 'head', 'meta', '[document]']:
            continue
        content = tag.strip()
        if content:
            texts.append(content)
    return texts

raw_texts = extract_visible_text(soup)
joined_text = "\n".join(raw_texts)

print("\n📄 Sample Extracted Text:\n")
print("\n".join(raw_texts[:25]))

# ================= STEP 4: Prompt Gemini to Extract Content and Return JSON ===========
prompt = f"""
You are reading raw website text scraped from the Bengaluru Traffic Police website.

Your task:
- Analyze the content and extract three categories: alerts, events, news.
- For each category, return a JSON object with this exact structure:

{{
  "alerts": ["alert1", "alert2", ...],
  "events": ["event1", "event2", ...],
  "news": ["news1", "news2", ...]
}}

Rules:
- alerts: Real-time traffic jams, breakdowns, road blocks, diversions, etc. Include location and date/time if mentioned.
- events: Public/private events affecting traffic (parades, VIP visits, concerts, rallies). Include start/end time, location, and type.
- news: Official news (policy, metro updates, WFH suggestions, roadworks). Include date and source if shown.
- Each array should have 3-8 items, each item should be a clear, concise sentence (max 140 chars).
- Respond with ONLY the JSON object, no Markdown, no extra text.

RAW TEXT:
\"\"\"
{joined_text[:8000]}
\"\"\"
"""

print("\n🧠 Sending to Gemini for analysis...\n")

try:
    response = model.generate_content(prompt)
    gemini_output = response.text.strip()
    # Clean up Gemini's output to ensure it's valid JSON
    if gemini_output.startswith("```json"):
        gemini_output = gemini_output.split("```json")[1].split("```")[0]
    elif gemini_output.startswith("```"):
        gemini_output = gemini_output.split("```")[1].split("```")[0]
    # Try to parse as JSON
    try:
        traffic_data = json.loads(gemini_output)
        # Validate keys
        if not all(k in traffic_data for k in ["alerts", "events", "news"]):
            raise ValueError("Missing keys in Gemini output")
        # Write to file
        with open('traffic-data.json', 'w') as f:
            json.dump(traffic_data, f, indent=2)
        print("✅ Successfully wrote traffic-data.json")
        print(json.dumps(traffic_data, indent=2))
    except Exception as e:
        print("❌ Gemini output was not valid JSON or missing keys:", e)
        print("Gemini output was:\n", gemini_output)
except Exception as e:
    print("❌ Error from Gemini:", e)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/traffic-updates")
def get_traffic_updates():
    if os.path.exists("traffic-data.json"):
        with open("traffic-data.json", "r") as f:
            data = json.load(f)
        return JSONResponse(content=data)
    else:
        return JSONResponse(content={"alerts": [], "events": [], "news": []})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
