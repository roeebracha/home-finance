# תשתיות

טרהפורם לחשבון Google אישי ול-Vercel. הוא יוצר פרויקט בלי ארגון, מדליק את Sheets ואת IAM, פותח חשבון שירות `home-finance-sheets` עם מפתח, ומכניס ל-Vercel את `GOOGLE_SERVICE_ACCOUNT_JSON` ואת `GOOGLE_SHEET_ID`.

ה-state מקומי: הקובץ `infra/terraform.tfstate`. אין backend מרוחק.

## מה מכינים פעם אחת

1. חשבון Google אישי, עם חשבון חיוב. בלי ארגון. מזהים את חשבון החיוב:

   ```bash
   gcloud billing accounts list
   ```

   המזהה נראה כמו `012345-6789AB-CDEF01`.

2. מתחברים מהמחשב הזה. הפקודה פותחת דפדפן ושומרת credentials ל-Terraform:

   ```bash
   gcloud auth application-default login
   ```

3. ב-Vercel: Account Settings → Tokens. יוצרים טוקן ומכניסים אותו רק לסביבה, לא לקובץ:

   ```bash
   export VERCEL_API_TOKEN="הטוקן"
   ```

   לחשבון אישי לא מגדירים `vercel_team_id`.

4. מעתיקים את קובץ הדוגמה וממלאים ערכים אמיתיים. `terraform.tfvars` לא נכנס לגיט.

   ```bash
   cd infra
   cp terraform.tfvars.example terraform.tfvars
   ```

   `project_id` חייב להיות פנוי בכל Google Cloud. `google_sheet_id` הוא החלק שבכתובת הגיליון בין `/d/` ל-`/edit`. אם הפרויקט `home-finance` כבר קיים ב-Vercel, שמים `vercel_project_exists = true` ואז טרהפורם רק קורא אותו.

## הרצה

מתוך `infra/`:

```bash
terraform init
terraform plan
terraform apply
```

`plan` מראה פרויקט, שני APIs, חשבון שירות, מפתח, פרויקט Vercel (או קריאה של פרויקט קיים), ושני משתני סביבה. `apply` מבצע את זה.

בסוף:

```bash
terraform output service_account_email
```

## אחרי ה-apply, ביד

טרהפורם לא נוגע בגיליון עצמו ולא יוצר לקוח OAuth. בחשבון אישי לקוח OAuth לא נפתח מטרהפורם.

1. בגיליון Google: שיתוף. מדביקים את המייל מה-output, הרשאה **Editor**. החשבון הזה הוא היחיד שהשרת ישתמש בו כדי לקרוא ולכתוב.

2. ב-[Google Cloud Console](https://console.cloud.google.com/), בפרויקט שנוצר:
   - APIs & Services → OAuth consent screen. External, מצב Testing, ומוסיפים את שני חשבונות Google של הבית כמשתמשי בדיקה.
   - Credentials → Create credentials → OAuth client ID → **Web application**.
   - Authorized JavaScript origins: `http://localhost:5173` וכתובת האתר ב-Vercel.
   - מעתיקים את ה-Client ID.

3. ב-Vercel, בהגדרות הפרויקט, מוסיפים `GOOGLE_CLIENT_ID` עם הערך הזה (production, preview, development). את אותו הערך שמים גם כ-`VITE_GOOGLE_CLIENT_ID`: Vite מעביר לדפדפן רק משתנים שמתחילים ב-`VITE_`, והשרת קורא את `GOOGLE_CLIENT_ID`. את שני אלה לא שמים בטרהפורם.

## המפתח נשאר ב-state

המפתח של חשבון השירות נשמר ב-`terraform.tfstate` על הדיסק, וגם נשלח ל-Vercel כמשתנה רגיש. "רגיש" ב-Vercel אומר שאי אפשר לקרוא אותו אחר כך מהדשבורד. זה לא מוציא אותו מקובץ ה-state.

מי שקורא את ה-state יכול להתחזות לחשבון השירות ולגשת לגיליון. לכן:

- לא מעלים `terraform.tfstate`, גיבוי שלו, או `terraform.tfvars` לגיט. `.gitignore` כאן כבר מכסה `*.tfstate*`, `.terraform/` ו-`*.tfvars`.
- לא מדביקים את ה-state לצ'אט ולא שמים אותו ב-Drive משותף.
- `terraform destroy` לא מוחק את העותק שכבר נשמר בגיבוי ישן של ה-state. אם המפתח דלף, מוחקים את המפתח בקונסול של Google ויוצרים חדש.

פרויקט Google שנוצר כאן מוגן מברירת המחדל של הספק: `deletion_policy` הוא `PREVENT`, אז `terraform destroy` לא ימחק את הפרויקט עד שמשנים את זה במפורש.
