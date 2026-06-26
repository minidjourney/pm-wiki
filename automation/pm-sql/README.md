# PM SQL Automation

퍼모위키 블로그 앱과 분리된 GitHub Actions 자동화입니다.

이 폴더는 Supabase에 직접 업로드하지 않습니다. Supabase의 `public.pm_models`
목록을 읽어서 중복을 피하고, OpenAI 웹 검색으로 신규 PM 모델 15개를 조사한 뒤
루트 `sql/YYYYMMDD.sql` 파일을 생성합니다.

## GitHub Secrets

Repository Settings > Secrets and variables > Actions > Secrets:

```text
DATABASE_URL
OPENAI_API_KEY
```

Repository Variables:

```text
OPENAI_MODEL=gpt-4.1
```

## Local Test

```powershell
cd automation\pm-sql
npm install
npm run db:check
npm run generate:sql
```

