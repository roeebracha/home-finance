# הבית שלנו

דשבורד פרטי לכספים של רועי ואביב. עברית, ימין לשמאל, קודם כל לנייד. הנתונים יגיעו מגיליון Google ב-PR הבא. כאן יש את השלד: התחברות, ניווט, וטוקנים של מערכת העיצוב.

המבנה משקף את [fitness-tracker](https://github.com/roeebracha/fitness-tracker). ההחלטות רשומות ב-[docs/adr.md](docs/adr.md).

## הרצה מקומית

צריך Node 22.

```bash
npm ci
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

ממלאים ב-`backend/.env` את `GOOGLE_CLIENT_ID`, `JWT_SECRET` ו-`ALLOWED_EMAILS` (שתי הכתובות, מופרדות בפסיק). אותו client id נכנס ל-`frontend/.env` כ-`VITE_GOOGLE_CLIENT_ID`.

בלי `JWT_SECRET`, או כש-`ALLOWED_EMAILS` ריק, השרת נכשל סגור: אין טוקן, וכל נתיב שמור מחזיר שהשרת לא מוגדר. כתובת שלא ברשימה נדחית גם אחרי שהטוקן כבר הונפק.

לחיבור לגיליון מוסיפים `GOOGLE_SHEET_ID` ו-`GOOGLE_SERVICE_ACCOUNT_JSON` (ה-JSON של חשבון השירות, בשורה אחת). בלי שניהם `/api/household` לא ממציא מספרים. הקובץ לא נכנס לגיט.

שני תהליכים:

```bash
npm run dev:api
npm run dev
```

הממשק ב-[http://localhost:5173](http://localhost:5173). Vite מעביר את `/api` אל `http://localhost:3000`, אז בדפדפן אין CORS. `backend/request.http` פונה ישר לשרת.

קובץ `.env` לא נכנס לגיט. רק `.env.example`, גם בפרונט וגם בבק.

## בדיקות

```bash
npm test
npm run lint
npm run build
```

`frontend/src/lib/money.js` בודק הצגת אגורות. השרת בודק את רשימת הכתובות, את ה-JWT, את קריאת הטאבים עם zod (תנועות, הגדרות, `balance_final`, פעולות), את שכבת הפעולות הממתינות, ואת קיבוץ הקבלות לפי קידומת מזהה. סכום נשמר כאגורות שלמות. שורה עם סטטוס `מוזגה` לא מיושמת שוב.

## פריסה

הפרויקט ב-Vercel הוא שורש הריפו, לא התיקייה `frontend`. `vercel.json` בונה את Vite אל `frontend/dist` ומגיש אותו כאתר סטטי. `backend/app.js` מיוצא בלי `listen` כשמייבאים אותו, ו-`api/index.js` עוטף אותו כפונקציית Node. `api/[...slug].js` מגיש את אותו האפליקציה לכל נתיב שמתחיל ב-`/api`. מקומית מריצים `npm run dev:api`.

בפריסה משאירים את `VITE_API_URL` ריק. האתר וה-API על אותו דומיין.
