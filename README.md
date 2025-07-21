# 🎯 Bullseye!

**Tech Stack**: React · Python · FastAPI · Backtrader · PostgreSQL · NumPy · pandas  

**Bullseye!** is a smart trading bot that uses a Simple Moving Average (SMA) crossover strategy to automate buy and sell decisions on historical stock data. With an intuitive dashboard, AI-driven investment recommendations, and seamless backtesting, Bullseye! gives users a data-backed edge in navigating the markets.

---

## 🚀 Features

- 📈 **SMA Crossover Strategy**  
  Uses historical stock price data to compute SMA indicators and identify market trends.

- 🧠 **AI-Powered Recommendations**  
  Get smart investment ideas based on user portfolio performance and market analysis.

- 📊 **Strategy Backtesting**  
  Test your trading strategies on historical data using Backtrader before deploying.

- 💼 **Portfolio Dashboard**  
  View portfolio performance, track assets, and monitor trade history in real time.

- 🔗 **Brokerage Integration** *(optional)*  
  Connect your live trading accounts to automate trades directly from the platform.

---

## 📷 Preview


---

## 🛠️ Tech Stack

| Frontend  | Backend       | Data/Trading |
|-----------|---------------|--------------|
| React     | FastAPI       | Backtrader   |
| Tailwind (or CSS) | Python        | pandas, NumPy |
| Chart.js / D3.js | PostgreSQL    | Alpaca / Brokerage API (optional) |

---

## 🧠 SMA Strategy Overview

The SMA crossover strategy works by comparing:

- **Short-term SMA**: Average over a few days (e.g., 10-day)
- **Long-term SMA**: Average over a longer window (e.g., 50-day)

**Signal Logic:**

- 📈 **Buy Signal** when short-term SMA crosses **above** long-term SMA  
- 📉 **Sell Signal** when short-term SMA crosses **below** long-term SMA  

Backtrader runs simulations on historical data to validate this approach.

---

## 🤖 AI Recommendations

Bullseye uses historical price trends, sector performance, and user behavior to surface recommended stock picks and potential strategies.


## 🧪 Run Locally

### 1. Clone the repo

```bash
# === 1. Clone the Repository ===
git clone https://github.com/yourusername/bullseye.git
cd bullseye

# === 2. Start the Backend (FastAPI + Backtrader) ===
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# === 3. Start the Frontend (React) ===
cd ../frontend
npm install
npm run dev
