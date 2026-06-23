#### 

#### **# 🚀 প্রজেক্ট প্লান এবং ওয়ার্কফ্লো (Project plan and Workflow)**

##### 

##### \## 🛠️ টেক-স্ট্যাক (Tech-Stack)



আমাদের প্রজেক্টের জন্য আমরা নিচের টেকনোলজিগুলো

ব্যবহার করে কাজ করব:



\* \*\*Frontend:\*\* 

&#x20; HTML, CSS, Tailwind, 

&#x20; TypeScript,Javascript এবং react



\* \*\*Backend:\*\* 

&#x20; Node.js এবং Django.



\* \*\*Database:\*\* 

&#x20; PostgreSQL.



\---



###### \## 🚀 ডিপ্লয়মেন্ট (Deployment)



\* \*\*Hosting \& Domain:\*\* 

&#x20; Vercel-এ কোলাবোরেশন (Collaboration) সমস্যা হওয়ার কারণে 

&#x20; আমরা সাময়িকভাবে Netlify ব্যবহার করে প্রজেক্ট হোস্ট করব। 

&#x20; তবে প্রজেক্টের সব কাজ পুরোপুরি শেষ হয়ে গেলে, 

&#x20; আমরা আবার ফাইনালি Vercel-এ ডিপ্লয় করে দেব।

\---



#### \## 🛠️ ব্যাকএন্ড ডেভেলপার (Backend Developer)



###### \* \*\*API Naming:\*\* 

&#x20; আমরা যে API-গুলো তৈরি করব, সেগুলো অবশ্যই `api.md` ফাইল অনুযায়ী 

&#x20; হতে হবে। ফাইল অনুযায়ী API-এর নাম হুবহু এক হতে হবে।



###### \* \*\*Custom Authorization:\*\* 

&#x20; প্রতিটি API-তে Custom Authorization থাকতে হবে (যেমন: `profile completed check` 

&#x20; এবং `user ban check`)। এছাড়া কিছু নির্দিষ্ট API-তে `college/institute matching` 

&#x20; এবং `id verification check` করতে হবে, এই বিষয়টি খেয়াল রাখতে হবে।



###### \* \*\*Environment Variables:\*\* 

&#x20; Django এবং Node.js—উভয় ডেভেলপারকেই নিজেদের `.env` ফাইলে 

&#x20; একই `SECRET\_KEY="same key"` ব্যবহার করতে হবে।

###### 

###### \* \*\*Database Naming Convention:\*\* 

&#x20; ডেটাবেসের Table এবং Column তৈরির সময় `database\_structure.md` 

&#x20; ফাইলটি অনুসরণ করতে হবে। ফাইলে দেওয়া Table ও Column-এর নাম 

&#x20; হুবহু ব্যবহার করতে হবে।



###### \* \*\*Data Validation \& Security:\*\* 

&#x20; Column-এর Data Validation Rules (যেমন: `max\_length`, `null`, `blank`, `default`) 

&#x20; নিজেদের চিন্তাভাবনা করে লজিক্যালি দিতে হবে। তবে ডেটাবেস যেন 

&#x20; সম্পূর্ণ সিকিউরড থাকে, সেদিকে অবশ্যই লক্ষ্য রাখতে হবে।



###### \* \*\*DDL Update:\*\* 

&#x20; Table তৈরি করার পর VS Code-এর এক্সটেনশন থেকে DDL (Database structure 

&#x20; in SQL command) জেনারেট করে তা কপি করতে হবে এবং সাথে সাথে আমাদের 

&#x20; `database\_structure.md` ফাইলটি আপডেট করে দিতে হবে।



\---



#### \## 💻 ফ্রন্টএন্ড ডেভেলপার (Frontend Developer)



###### \* \*\*API Integration:\*\* 

&#x20; ফ্রন্টএন্ড ডেভেলপারকে `api.md` ফাইল থেকে API-এর নাম দেখে 

&#x20; সেই অনুযায়ী কাজ করতে হবে।

###### 

###### \* \*\*API Routing / Proxy:\*\* 

&#x20; কোন API রিকোয়েস্ট কোন সার্ভারে যাবে, তা নির্ধারণ করতে হবে:



&#x20; \* \*\*Local Development-এর জন্য:\*\*

&#x20;  `vite.config.js` ফাইলে

&#x20;   কনফিগারেশন সেট করতে হবে।



&#x20; \*\*Production-এর জন্য:\*\* 

&#x20;   `vercel.json` অথবা 'netlify.toml'

&#x20;   কনফিগারেশন সেট করতে হবে।



&#x20; \*\*



###### \* \*\*Security:\*\* 

&#x20; JWT token অবশ্যই `HttpOnly cookie`-এর মাধ্যমে 

&#x20; পাঠাতে হবে।



\---



#### \## ⚙️ Configuration Examples



##### \### ১. `vite.config.js` (Local Development):





import { defineConfig } from 'vite'

import react from '@vitejs/plugin-react'



export default defineConfig({

&#x20; plugins: \[react()],

&#x20; server: {

&#x20;   proxy: {

&#x20;     '/api/node': {

&#x20;       target: 'http://localhost:5000',

&#x20;       changeOrigin: true,

&#x20;     },

&#x20;     '/api/django': {

&#x20;       target: 'http://localhost:8000',

&#x20;       changeOrigin: true,

&#x20;     }

&#x20;   }

&#x20; }

})







##### vercel.json (Production):





{

&#x20;   "rewrites": \[

&#x20;       {

&#x20;           "source": "/api/node/(.\*)",

&#x20;           "destination": "https://YOUR\_NODE\_BACKEND\_URL/api/node/$1"

&#x20;       },

&#x20;       {

&#x20;           "source": "/api/django/(.\*)",

&#x20;           "destination": "https://YOUR\_DJANGO\_BACKEND\_URL/api/django/$1"

&#x20;       },

&#x20;       {

&#x20;           "source": "/(.\*)",

&#x20;           "destination": "/index.html"

&#x20;       }

&#x20;   ]

}







##### netlify.toml (Production):







\[\[redirects]]

&#x20; from = "/api/node/\*"

&#x20; to = "https://YOUR\_NODE\_BACKEND\_URL/api/node/:splat"

&#x20; status = 200

&#x20; force = true





\[\[redirects]]

&#x20; from = "/api/django/\*"

&#x20; to = "https://YOUR\_DJANGO\_BACKEND\_URL/api/django/:splat"

&#x20; status = 200

&#x20; force = true





\[\[redirects]]

&#x20; from = "/\*"

&#x20; to = "/index.html"

&#x20; status = 200









###### 🔗 Reference

সবকিছুর বিস্তারিত উদাহরণ দেখতে আমাদের এক্সাম্পল প্রজেক্ট রিপোজিটরি চেক করুন:



###### 👉 [E-commerce Dual Backend Example Repo](https://github.com/Maruf-MLE/E-commerce_backend)

