import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);

export const generateTransactionDescription = async (type, category, amount) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Generate a brief transaction description for a ${type} of $${amount} in the ${category} category. 
    Keep it exactly 10 words or less. Make it realistic and specific. 
    Examples: "Grocery shopping at Walmart for weekly essentials" or "Monthly salary deposit from employer"
    Just return the description, nothing else.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    const words = text.split(' ');
    return words.slice(0, 10).join(' ');
    
  } catch (error) {
    console.error('Gemini AI Error:', error);
    
    const fallbackDescriptions = {
      'Food': `${type === 'expense' ? 'Meal purchase' : 'Food income'} $${amount}`,
      'Transportation': `${type === 'expense' ? 'Transport expense' : 'Transport income'} $${amount}`,
      'Entertainment': `${type === 'expense' ? 'Entertainment purchase' : 'Entertainment income'} $${amount}`,
      'Shopping': `${type === 'expense' ? 'Shopping expense' : 'Shopping income'} $${amount}`,
      'Bills': `${type === 'expense' ? 'Bill payment' : 'Bill refund'} $${amount}`,
      'Healthcare': `${type === 'expense' ? 'Healthcare expense' : 'Healthcare income'} $${amount}`,
      'Salary': `Monthly salary payment $${amount}`,
      'Freelance': `Freelance work payment $${amount}`,
      'Investment': `Investment return $${amount}`,
      'Gift': `Gift money $${amount}`,
      'Other': `${type} transaction $${amount}`
    };
    
    return fallbackDescriptions[category] || fallbackDescriptions['Other'];
  }
};