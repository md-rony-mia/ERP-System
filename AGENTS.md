# Custom Instructions for AI Coding Agent

This file contains persistent rules, coding conventions, and instructions that the AI Agent will read and follow first on every turn. Feel free to edit this file to add or modify rules.

## Core Rules & Persona
- Always respond in Bengali (unless requested otherwise).
- Maintain the current high-contrast dashboard aesthetic (Tailwind based).
- Double-check typescript compilation via `npm run lint` or `tsc --noEmit` before finishing any task.

## Project Guidelines
- **Framework & Libraries**: React 19, Tailwind CSS v4, Lucide React, and Framer Motion (`motion/react`).
- **Layout & Responsiveness**: Ensure that print layouts are safely contained and styled for paper sizing without overflowing, just like the custom media print style implemented for Sales/Invoice view.


প্রতিটা নতুন সেশন/কাজ শুরুর আগে বাধ্যতামূলক অডিট নিয়ম:
কোনো কোড পরিবর্তন, ফিচার ডেভেলপমেন্ট, বাগ ফিক্স বা সাজেশন দেওয়ার আগে, প্রতিবার নিচের ধাপগুলো অনুসরণ করো — চাই আগের সেশনের memory/context যাই বলুক না কেন, কারণ repo আমার অজান্তেই আপডেট হতে পারে:

Fresh clone নাও: git clone https://github.com/md-rony-mia/ERP-System.git দিয়ে সবসময় GitHub থেকে সরাসরি সর্বশেষ কোড নাও — কখনো পুরনো memory/summary কে সত্য ধরে নিয়ে কাজ শুরু কোরো না।
রিসেন্ট পরিবর্তন যাচাই করো:

git log --oneline -20 দিয়ে সাম্প্রতিক কমিট দেখো
git branch -a দিয়ে চেক করো কোন ব্রাঞ্চ আছে/merge হয়েছে/ডিলিট হয়েছে
package.json দেখো (নাম, ডিপেন্ডেন্সি বদলেছে কিনা — যেমন rebrand হয়েছে কিনা)


আমার memory-তে থাকা প্রতিটা "known issue" পুনরায় verify করো, বিশ্বাস কোরো না: যেমন — Firestore rules খোলা আছে কিনা, real Auth আছে কিনা, Gemini API সত্যিই wire হয়েছে কিনা, Balance Sheet এর calculation ঠিক আছে কিনা, placeholder submenu কতগুলো বাকি। প্রতিটা claim সরাসরি কোড grep করে/পড়ে যাচাই করো — কোনো README বা রিপোর্ট ফাইলের দাবি (যেমন "100% complete", "zero placeholders") কে সত্যি ধরে নিও না, নিজে কোড দেখে নিশ্চিত হও।
বিল্ড ও টাইপ-চেক চালাও: npm install, npx tsc --noEmit, npx vite build — যাতে বোঝা যায় repo বর্তমানে সুস্থ অবস্থায় আছে কিনা।
একটা সংক্ষিপ্ত "কী বদলেছে" সামারি দাও কাজ শুরুর আগে — নতুন কমিট, নতুন ফাইল/মডিউল, রিব্র্যান্ড, নতুন সিকিউরিটি সমস্যা (যেমন hardcoded token/key) থাকলে সেগুলো আলাদা করে উল্লেখ করো।

শুধু তখনই এই অডিটের ধাপ বাদ দেওয়া যাবে যখন ব্যবহারকারী স্পষ্টভাবে বলে যে সে শুধু conceptual/general প্রশ্ন করছে, রিপো-নির্দিষ্ট কাজ নয়।

GitHub push/write প্রক্রিয়া (token সংক্রান্ত নিয়ম):
যখনই repo তে কোনো commit push করার দরকার হয়:

ব্যবহারকারীকে জিজ্ঞেস করো একটা fresh GitHub fine-grained token আছে কিনা, অথবা নতুন বানাতে হবে কিনা। নতুন লাগলে গাইড দাও: Repository access = শুধু ERP-System, Permissions = শুধু Contents: Read and write, ছোট Expiration (যেমন ৭ দিন)।
Token টা কখনো memory, project instructions, ফাইল, বা কোনো persistent জায়গায় সংরক্ষণ কোরো না — শুধু সেই মুহূর্তের chat message থেকে নিয়ে সরাসরি ব্যবহার করো।
কাজ সবসময় একটা নতুন named branch এ করো (fix/...), সরাসরি main এ না। পরিবর্তনের পর npx tsc --noEmit এবং npx vite build দিয়ে verify করো commit করার আগে।
Push সফল হওয়ার সাথে সাথে remote URL থেকে token সরিয়ে ফেলো (git remote set-url origin https://github.com/md-rony-mia/ERP-System.git)।
ব্যবহারকারীকে মনে করিয়ে দাও GitHub Settings → Developer settings → Fine-grained tokens এ গিয়ে সেই token revoke করে দিতে, কাজ শেষ হলে।
PR তৈরির লিংক/গাইড দাও merge এর জন্য — নিজে merge কোরো না।

Incremental কাজ করবো — বড় বা একাধিক task দিলে সব একসাথে শেষ করার জন্য অপেক্ষা করবো না
Limit শেষ হওয়ার আগেই push করবো — যতটুকু কাজ সম্পূর্ণ এবং verified (build/type-check pass করেছে), সেটুকু commit করে push করে দেবো, যাতে কোনো কাজ হারিয়ে না যায়
প্রতিটা push/stopping point এ status জানাবো — স্পষ্টভাবে বলবো:

এখন পর্যন্ত কী কী সম্পূর্ণ হয়েছে (কোন ফাইল/ফিচার/ফাংশন)
কী কী এখনো বাকি আছে
পরের সেশনে কোথা থেকে শুরু করতে হবে