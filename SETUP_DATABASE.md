# Database Integration Setup Guide

## Overview

تم تحويل التطبيق من `localStorage` إلى قاعدة بيانات MongoDB مع Backend Express Server.

## الخطوات المطلوبة

### 1. تثبيت Dependencies للـ Backend

```bash
cd backend
npm install
```

### 2. تثبيت MongoDB

**الخيار أ: MongoDB محلي (Local)**
- حمّل من: https://www.mongodb.com/try/download/community
- شغّل MongoDB:
```bash
mongod
```

**الخيار ب: MongoDB Atlas (Cloud - الأسهل)**
- انشئ حساب على: https://www.mongodb.com/cloud/atlas
- انشئ Cluster مجاني
- نسخ Connection String
- حدّث `.env` في مجلد backend:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rowaq-app
```

### 3. تشغيل Backend Server

من مجلد backend:
```bash
npm run dev
```

سيشتغل على: `http://localhost:5000`

### 4. تشغيل Frontend

من مجلد المشروع الرئيسي:
```bash
npm run dev
```

سيشتغل على: `http://localhost:5173`

## الملفات الجديدة

### Backend
- `backend/server.js` - الملف الرئيسي للـ Server
- `backend/models/` - Mongoose Schemas
- `backend/controllers/` - المنطق الأساسي
- `backend/routes/` - API Endpoints
- `backend/.env` - متغيرات البيئة

### Frontend
- `src/utils/apiService.js` - API Helper للتواصل مع Backend

## بيانات موجودة لديك (localStorage)

البيانات الموجودة في localStorage ستبقى في المتصفح. عند الحاجة لنقلها إلى قاعدة البيانات:

1. استخرج البيانات من localStorage
2. استخدم endpoint `/api/[resource]/bulk-import`

مثال:
```bash
curl -X POST http://localhost:5000/api/managers/bulk-import \
  -H "Content-Type: application/json" \
  -d '{"managers": [...]}'
```

## الميزات الجديدة

✅ البيانات محفوظة بشكل دائم في قاعدة البيانات
✅ الوصول من أي جهاز
✅ مشاركة البيانات بين المستخدمين
✅ سهلة التوسع والصيانة

## استكشاف الأخطاء

### لا يعمل Backend؟
1. تأكد من تشغيل MongoDB
2. تحقق من `.env` في backend
3. شاهد logs في Terminal

### لا يعمل Frontend API؟
1. تأكد من أن Backend يعمل على port 5000
2. افتح DevTools في المتصفح وشاهد Network tab
3. تحقق من vite.config.js proxy settings

### خطأ في MongoDB؟
1. تأكد من Connection String
2. اختبر الاتصال في MongoDB Compass
3. تحقق من firewall إذا كنت تستخدم MongoDB Atlas

## الخطوة التالية (اختيارية)

لتعديل AppDataContext للاستخدام الكامل للـ API (بدلاً من localStorage)، ستحتاج لتحديث:
- `src/context/AppDataContext.jsx`

ولكن التطبيق الحالي يعمل مع كلا المصدرين (API و localStorage) بسلاسة.
