import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080", // Update if needed
});

export const getPortfolio = async () => {
  const response = await api.get("/portfolio");
  return response.data;
};

export const getStockData = async (symbol: string) => {
  const response = await api.get(`/stocks/${symbol}`);
  return response.data;
};

export const addToPortfolio = async (symbol: string) => {
  return await api.post("/portfolio", { stock_symbol: symbol });
};
