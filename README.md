# QuickGPT — Your Personal AI Companion 🤖✨

Welcome to **QuickGPT**, a full-stack MERN-based AI Chat application where users can **sign up, generate text & images with AI, and purchase credits online**.  
Powered by **Google Gemini AI** for smart conversations and **ImageKit** for prompt-based image generation, QuickGPT offers a seamless and interactive AI experience.  

This repository contains a complete **MERN (MongoDB, Express.js, React.js, Node.js)** application integrated with **Stripe payments** and deployed on **Vercel**.

---

<h1 align="center">
  <a href="https://quick-gpt-hazel-ten.vercel.app/"><strong> ➥ Live Demo</strong></a>
</h1>

---

## Screenshots 🖼️

### 🔐 Login Page  
<img width="1918" height="876" alt="image" src="https://github.com/user-attachments/assets/37d49f1c-9796-4fea-b8bc-8b22a02e2af1" />


---

### 🏠 Homepage  
<img width="1919" height="866" alt="image" src="https://github.com/user-attachments/assets/2baf2b50-1776-4ef9-9abe-5b7460a6b53a" />


---

### 💬 AI Chat Interface  
<img width="1919" height="872" alt="image" src="https://github.com/user-attachments/assets/33ac998c-9686-4c1e-a5ea-2364b35885c1" />


---

### 🎨 AI Image Generator  
<img width="1919" height="869" alt="image" src="https://github.com/user-attachments/assets/bd9b0045-d0e1-41ff-94b8-da3f9a2aefcf" />


---

### 💰 Credit Plans  

<img width="1919" height="868" alt="image" src="https://github.com/user-attachments/assets/31d04937-c173-4bc3-953d-674e01d3fa57" />

---
### 💳 Payment Gateway (Stripe Checkout)
<img width="1898" height="871" alt="image" src="https://github.com/user-attachments/assets/695d35a5-f20e-4851-b3e1-40f411cc9ab0" />


---

## 💻 Tech Stack

![MongoDB](https://img.shields.io/badge/MongoDB-%2347A248.svg?style=for-the-badge&logo=mongodb&logoColor=white) &nbsp;
![Express.js](https://img.shields.io/badge/Express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) &nbsp;
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) &nbsp;
![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) &nbsp;  
![Stripe](https://img.shields.io/badge/Stripe-626CD9.svg?style=for-the-badge&logo=stripe&logoColor=white) &nbsp;
![ImageKit](https://img.shields.io/badge/ImageKit-%230072ff.svg?style=for-the-badge&logoColor=white) &nbsp;
![Gemini AI](https://img.shields.io/badge/Gemini_AI-%23FF6A00.svg?style=for-the-badge&logoColor=white) &nbsp;  
![Vercel](https://img.shields.io/badge/Vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)

---

## Features ✨

- 👤 **User Authentication** (Signup & Login with JWT)
- 💬 **AI Chatbot** powered by **Google Gemini AI**
- 🎨 **AI Image Generation** via **ImageKit**
- 💳 **Stripe Payment Integration** (purchase credits securely online)
- 📊 **Credit Management System** (spend credits for chat & image requests)
- 🚀 **MERN Full-Stack Architecture**
- 🌐 **Deployed on Vercel** (frontend + backend APIs)
- 📱 Mobile-first, responsive, and optimized UI

---

## Getting Started — Quick Install

```bash
# 1. Clone the repo
git clone https://github.com/Kartikey24/QuickGPT.git
cd QuickGPT

# 2. Install dependencies for frontend & backend
cd client && npm install
cd ../server && npm install

# 3. Set up environment variables (.env)
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_key
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=your_url_endpoint
GEMINI_API_KEY=your_gemini_api_key

# 4. Run development servers
# In /server
npm run dev
# In /client
npm run dev
