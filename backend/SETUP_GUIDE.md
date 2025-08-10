# 🚀 CityPulse Backend Setup Guide

## 📋 Prerequisites
- Python 3.8+ installed
- pip (Python package manager)
- Git (to clone the repository)

## 🔧 Installation Steps

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Create Virtual Environment (Recommended)
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

### Step 3: Install Dependencies
```bash
# Install from requirements.txt
pip install -r requirements.txt
```

### Step 4: Test the Scraper (Optional but Recommended)
```bash
# Test if the live scraper works
python3 test_scraper.py
```

You should see output like:
```
🚀 CityPulse Live Scraper Test
==================================================
🔄 Testing fallback data...
✅ Fallback data available:
📊 Alerts: 6
📅 Events: 5
📰 News: 5

🧪 Testing Live Traffic Scraper...
==================================================
📡 Testing single scrape...
✅ Scrape successful!
📊 Alerts: 5
📅 Events: 5
📰 News: 5
🕒 Last Updated: 2024-01-XX...
📡 Status: live

🎉 All tests passed! The scraper is ready to use.
💡 You can now run: python3 main.py
```

### Step 5: Start the Backend Server
```bash
# Start the FastAPI server with live scraping
python3 main.py
```

You should see:
```
🚀 Starting CityPulse Backend Server...
🌐 Server will be available at: http://localhost:8000
📚 API Documentation: http://localhost:8000/docs
🔌 Traffic Updates API: http://localhost:8000/api/traffic-updates
🔌 Live Stream API: http://localhost:8000/api/traffic-updates/live
⏹️  Press Ctrl+C to stop the server
------------------------------------------------------------
🔄 Starting live traffic scraping service...
🚀 Live scraping service started. Scraping every 300 seconds.
INFO:     Started server process [xxxxx]
INFO:     Listening on http://0.0.0.0:8000
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

## 🌐 API Endpoints

### 1. Traffic Updates
- **URL**: `http://localhost:8000/api/traffic-updates`
- **Method**: GET
- **Description**: Returns the latest scraped traffic data
- **Response**: JSON with alerts, events, and news

### 2. Live Stream
- **URL**: `http://localhost:8000/api/traffic-updates/live`
- **Method**: GET
- **Description**: Real-time traffic data stream
- **Response**: JSON with live updates

### 3. API Documentation
- **URL**: `http://localhost:8000/docs`
- **Description**: Interactive API documentation (Swagger UI)

## 🔄 Live Scraping Features

### Automatic Updates
- **Scraping Interval**: Every 5 minutes (300 seconds)
- **Data Source**: Bengaluru Traffic Police website
- **AI Processing**: Uses Together AI LLM for data extraction
- **Fallback Data**: Always available if scraping fails

### Real-time Features
- **Background Threading**: Scraping runs in background
- **Queue System**: Real-time data updates
- **Status Tracking**: Live vs fallback data status
- **Error Handling**: Graceful fallback on failures

## 🧪 Testing

### Test API Endpoints
```bash
# Test traffic updates endpoint
curl http://localhost:8000/api/traffic-updates

# Test live stream endpoint
curl http://localhost:8000/api/traffic-updates/live
```

### Expected Response Format
```json
{
  "alerts": [
    "Heavy traffic on Outer Ring Road due to construction.",
    "Accident near Electronic City causing lane closure.",
    "Signal maintenance on Brigade Road causing delays."
  ],
  "events": [
    "VIP movement on MG Road, expect diversions.",
    "Exhibition at BELR Center causing increased traffic."
  ],
  "news": [
    "Metro extension work to begin on Bannerghatta Road.",
    "New traffic signals installed at 20 junctions."
  ],
  "last_updated": "2024-01-XX...",
  "status": "live"
}
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Import Errors
```bash
# Make sure you're in the virtual environment
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

#### 2. Port Already in Use
```bash
# Check what's using port 8000
lsof -i :8000

# Kill the process or change port in main.py
```

#### 3. API Key Issues
- Check if Together AI API key is valid
- Ensure you have sufficient credits
- Verify the API key format

#### 4. Scraping Failures
- Check internet connection
- Verify the target website is accessible
- Check if the website structure has changed

### Debug Mode
```bash
# Run with verbose logging
python3 main.py 2>&1 | tee backend.log

# Check logs for errors
tail -f backend.log
```

## 🔧 Configuration

### Scraping Interval
Edit `live_scraper.py` to change the scraping frequency:
```python
self.scrape_interval = 300  # 5 minutes (300 seconds)
```

### API Keys
Update the Together AI API key in `live_scraper.py`:
```python
self.client = Together(api_key="your-api-key-here")
```

## 📱 Frontend Integration

The backend is designed to work with the React frontend. The frontend will:
- Poll the API every 30 seconds
- Display real-time updates
- Show scrolling animations for new data
- Handle connection errors gracefully

## 🛑 Stopping the Server

Press `Ctrl+C` in the terminal where the server is running to stop both:
- The FastAPI server
- The live scraping service

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all dependencies are installed
3. Test the scraper individually with `test_scraper.py`
4. Check the console output for error messages
