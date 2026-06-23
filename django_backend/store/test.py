import requests

# তোর ক্লাউডফ্লেয়ার URL
url = "https://providing-house-incl-handy.trycloudflare.com/api/generate"

data = {
    "model": "qwen2.5:7b", # তোর মডেলের নাম
    "prompt": "তুমি কে? বাংলায় উত্তর দাও।",
    "stream": False
}

try:
    print("অপেক্ষা কর, মডেল উত্তর দিচ্ছে...")
    response = requests.post(url, json=data)
    result = response.json()
    print("\n🤖 AI Response:\n", result["response"])
except Exception as e:
    print("❌ Error:", e)