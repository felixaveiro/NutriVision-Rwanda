# NutriVision Rwanda

NutriVision Rwanda is a data-driven Next.js application built to analyze and predict district-level nutritional risk indicators in Rwanda. The project uses Groq-style AI calls to summarize and predict outcomes from survey data, and provides dashboards, interactive maps, and policy briefs.

This README documents the repository layout, local setup, API routes, AI integration details, troubleshooting tips, developer notes, API contracts, zod schemas, prompt strategy, and deployment/CI guidance.

## Table of contents

- [Project overview](#project-overview)
- [Repository structure](#repository-structure)
- [Requirements](#requirements)
- [Environment variables (.env.local example)](#environment-variables-envlocal-example)
- [Local development](#local-development)
- [Build & production](#build--production)
- [API routes](#api-routes)
- [AI integration details](#ai-integration-details)
- [Data model & types](#data-model--types)
- [Troubleshooting](#troubleshooting)
- [Developer notes & contributing](#developer-notes--contributing)
- [License](#license)

## Quick links

- Project root: `E:/Hackton project/nutrivision-rwanda`
- Node scripts: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`
- Main AI code: `app/api/ai-analysis/route.ts`
- Predictions API: `app/api/predictions/route.ts`
- Survey parsing: `lib/survey-data.ts`
- Types: `lib/types.ts`

## Project overview

NutriVision Rwanda collects survey data, examines risk factors, and uses an AI analysis pipeline to produce district-level predictions and policy recommendations. The UI shows maps, charts, and a set of pages for insights, interventions, predictions, and policy briefs.

Key features:
- Survey data ingestion and parsing
- District-level analytics and AI-generated predictions
- Interactive map and charts
- API routes for chat, predictions, AI analysis, and data export

## Repository structure

Top-level files and important folders:

- `app/` - Next.js App Router pages, layouts, and API route handlers (`app/api/...`).
  - `app/api/ai-analysis/route.ts` - AI analysis aggregator and validator
  - `app/api/predictions/route.ts` - Predictions endpoint (forwards district filters to AI analysis)
  - `app/api/chat/route.ts` - Chat endpoint (Groq/OpenAI-style chat wrapper)
  - other API routes: `interventions`, `policy-briefs`, `survey-data`, `data-sources`
- `components/` - React UI components (map, charts, overview cards, UI primitives under `ui/`)
- `lib/` - Shared libraries (types, survey-data parsing, utils)
- `public/` - Static assets
- `scripts/` - Python scripts used for offline analysis (optional)
- `package.json`, `tsconfig.json`, `eslint.config.mjs`, `next.config.ts` - repository configuration

## Requirements

- Node.js 18+ (recommended)
- npm or yarn
- A Groq-compatible API key (used as `GROQ_API_KEY` in env)
- Recommended developer tools
  - Node.js 18+ (LTS)
  - VS Code (recommendation) with these extensions:
    - ESLint
    - TypeScript and JavaScript Language Features
    - Prettier (optional)
    - GitLens

## Scripts (from `package.json`)

- `npm run dev` — start Next.js dev server
- `npm run build` — run production build (includes typechecking & linting)
- `npm run start` — start production server after build
- `npm run lint` — run ESLint checks

## Development environment setup (recommended)

1. Clone repository and install dependencies

```powershell
git clone <repo-url> "E:/Hackton project/nutrivision-rwanda"
cd "E:/Hackton project/nutrivision-rwanda"
npm ci
```

2. Create `.env.local` (see example below)

3. Start dev server

```powershell
npm run dev
```

4. Open http://localhost:3000

## Environment variables (.env.local example)

Create a file named `.env.local` in the project root (this file is not committed). At minimum you need the Groq API key.

```powershell
# .env.local (example)
GROQ_API_KEY=your_groq_api_key_here
# Optional overrides
# GROQ_API_URL=https://api.groq.ai/v1
# NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Notes:
- Keep the API key secret. Do not commit `.env.local` to source control.
- The app expects the Groq API key for AI endpoints under `app/api/*`.

## Local development

Install dependencies and run the dev server:

```powershell
# install
npm install

# run in development mode
npm run dev
```

Open http://localhost:3000 in your browser.

API routes are available under `http://localhost:3000/api/*`.

## API contracts (detailed)

All API endpoints are JSON-based and follow this general shape on success:

```json
{ "ok": true, "data": ... }
```

On error the endpoints return:

```json
{ "ok": false, "error": { "message": "...", "code": "..." } }
```

### POST /api/chat

Description: proxy to the Groq / chat endpoint used for interactive chat in the UI.

Request body (example):

```json
{ "messages": [{ "role": "user", "content": "..." }], "max_tokens": 2000 }
```

Success response (example):

```json
{
  "ok": true,
  "data": {
    "id": "chatresp_...",
    "message": "AI reply text"
  }
}
```

Errors:
- 400 — invalid request shape
- 502 — upstream Groq errors or network issues

### POST /api/ai-analysis

Description: Analyze one or more districts and return validated prediction objects. This endpoint runs batching when many districts are provided.

Request body (example):

```json
{
  "districts": ["Gasabo", "Kicukiro"],
  "mode": "predictions",
  "maxTokens": 2000
}
```

Response (example):

```json
{
  "ok": true,
  "data": {
    "districtAnalysis": [
      {
        "districtId": "gasabo",
        "districtName": "Gasabo",
        "predictedRisk": 0.35,
        "keyFactors": ["child_diet", "water_access"],
        "predictedAt": "2025-10-08T10:00:00Z"
      }
    ]
  }
}
```

Errors:
- 400 — invalid request
- 422 — AI returned invalid JSON or schema validation failed (includes `validationErrors` in the error message)

### GET /api/predictions

Query params: `?district=Gasabo&ai=true` — if `ai=true`, server forwards the district filter to `/api/ai-analysis`.

Success: returns a list of `PredictionResult` objects (see `lib/types.ts`).

### GET /api/survey-data

Returns the parsed CSV rows as an array of `SurveyRecord` objects.

## zod schema & TypeScript contract (developer reference)

The canonical zod schema used to validate AI output lives in `app/api/ai-analysis/route.ts` as `predictionSchema`. The TypeScript `PredictionResult` type is in `lib/types.ts`.

Here's an outline (pseudo-code) of the expected shape — update both zod and TypeScript when changing this.

```ts
// pseudo zod
const predictionSchema = z.object({
  districtId: z.string(),
  districtName: z.string(),
  predictedRisk: z.number().min(0).max(1),
  keyFactors: z.array(z.string()),
  predictedAt: z.string().optional(),
});

type PredictionResult = z.infer<typeof predictionSchema>;
```

If AI responses differ (e.g. contain markdown fences) the server strips fences, parses JSON, and runs zod validation. Any validation error becomes a 422 with details.

## AI prompt strategy & tuning

Where to change prompts: `app/api/ai-analysis/route.ts`.

Key knobs:
- `DEFAULT_MAX_TOKENS` — maximum tokens requested from Groq for each batch. Lower to reduce truncation but may reduce output detail.
- `BATCH_SIZE` — number of districts to include in a single AI prompt. Lowering reduces token usage per prompt.
- `prompt` template — the natural-language prompt instructing the AI to produce JSON matching `predictionSchema`.

Best practices:
- Keep prompts short and explicit about the exact JSON shape.
- Ask the model to ONLY respond with JSON and to avoid commentary. Still expect fences and strip them on the server.
- Use batching for many districts and validate each batch separately.

## CI/CD & Deployment guidance

Simple GitHub Actions example (high level):

- Steps:
  1. checkout
  2. setup Node (18)
  3. install dependencies (`npm ci`)
  4. run `npm run build`
  5. if build succeeds, deploy to your hosting (Vercel/Netlify/Azure)

Secrets:
- store `GROQ_API_KEY` using your platform's secrets management and avoid exposing it to the client.

## Debugging & troubleshooting (expanded)

- AI truncation / `finish_reason: "length"`
  - Symptom: truncated JSON from AI; server fails to parse.
  - Steps:
    1. Lower `DEFAULT_MAX_TOKENS` in `app/api/ai-analysis/route.ts`.
    2. Reduce `BATCH_SIZE` so fewer districts are asked per prompt.
    3. Shorten prompt context (remove non-essential instructions).

- 500 from `/api/chat`
  - Check `app/api/chat/route.ts` for correct `NextResponse.json(...)` usage and robust extraction of the AI message (some Groq responses use `choices[0].message.content`, others use `text`).

- 404 for `GET /api/predictions?district=...`
  - Check tolerant matching in `app/api/predictions/route.ts` (normalizes casing and trims punctuation). If you need stricter matching, update the normalization function.

## Security considerations

- Do not expose `GROQ_API_KEY` to the browser. Keep it server-side.
- Rate-limit AI requests if this service will be publicly accessible to prevent high costs or abuse.

## Editor & linting suggestions

- Recommended VS Code settings (settings.json snippet):

```json
{
  "editor.formatOnSave": true,
  "eslint.validate": ["javascript", "typescript", "typescriptreact"],
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

Prettier: optionally install `prettier` and configure `.prettierrc` to match project style.

## Developer & contributor information

Add your names, roles and contact info here so other developers know whom to reach out to.

- Repository owner: <OWNER NAME> (<owner@example.com>)
- Lead developer: <LEAD DEV> (<lead@example.com>)
- Reviewer: <REVIEWER NAME> (<reviewer@example.com>)

If you'd like, I can add a `CONTRIBUTING.md` and `CODEOWNERS` file to formalize review flow.

## Files you will likely edit frequently

- `app/api/ai-analysis/route.ts` — AI prompts, batching, zod validation
- `lib/types.ts` — shared TypeScript types for predictions and survey data
- `lib/survey-data.ts` — CSV parsing and survey helpers
- `components/` — UI components that render prediction results

## Example requests (PowerShell / curl)

PowerShell (Invoke-RestMethod):

```powershell
$body = @{ districts = @('Gasabo') } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/ai-analysis -Body $body -ContentType 'application/json'
```

curl:

```bash
curl -X POST http://localhost:3000/api/ai-analysis \
  -H "Content-Type: application/json" \
  -d '{"districts":["Gasabo"]}'
```

## Appendix: where to change behavior quickly

- To change token/batch defaults: `app/api/ai-analysis/route.ts` constants
- To change prediction shape: update zod schema in `app/api/ai-analysis/route.ts` and `lib/types.ts`
- To change district matching: `app/api/predictions/route.ts`

---

If you'd like, I will:
- add a `CONTRIBUTING.md` and `CODEOWNERS` file,
- patch the two React hook warnings now,
- add basic unit tests for `lib/survey-data.ts` parsing.

Which of the above should I do next?

## Build & production

To build the production artifacts:

```powershell
npm run build
npm run start
```

The project has been validated to build successfully (type checking + linting). If you see warnings about React hook dependencies, they are non-blocking but recommended to fix (see Troubleshooting).

## API routes

This section lists the main server API routes and their purpose. All endpoints return JSON.

- `POST /api/chat`
  - A wrapper around the Groq/OpenAI chat endpoint used by the UI. Accepts a JSON chat payload and proxies it to Groq.
  - Error modes to watch for: invalid AI responses or non-JSON payloads. The route uses robust parsing and returns helpful errors.

- `POST /api/ai-analysis`
  - The internal AI aggregator used to analyze survey data and produce prediction-like objects.
  - Accepts a JSON body with (example):
    ```json
    {
      "districts": ["Gasabo", "Kicukiro"],
      "mode": "predictions"
    }
    ```
  - The route implements batching/chunking when many districts are requested to avoid token limits and truncated responses. It validates the AI output using a zod schema and returns a merged result.

- `GET /api/predictions` and `POST /api/predictions`
  - Front-facing predictions API. When `?district=Gasabo&ai=true` or when a district is provided in the body, the route will forward the district selection to `/api/ai-analysis` so the AI only analyzes the requested district(s).
  - The route performs tolerant district name matching (normalization) to avoid 404s when AI returns slightly different casing or punctuation.

- `GET /api/survey-data`
  - Returns parsed survey CSV data used by the UI. See `lib/survey-data.ts` for parsing details.

- `GET /api/interventions` and `GET /api/policy-briefs`
  - Return curated interventions and policy brief content (some content may be generated or augmented by the AI).

If you add or modify API behavior, ensure you update the zod schemas in `app/api/ai-analysis/route.ts` and the TypeScript types in `lib/types.ts`.

## AI integration details

- Provider: Groq (OpenAI-chat-style API)
- Main concerns:
  - Token limits: AI responses that exceed token limits can end with `finish_reason: "length"` and produce truncated JSON. To mitigate this, the app uses batching/chunking of districts and sets conservative `max_tokens` values.
  - Parsing: AI often returns JSON wrapped in Markdown code fences. The server strips code fences and attempts to parse JSON safely. Invalid responses are validated with `zod` and rejected with helpful errors.
  - Configurable values: The default maximum token limit used by `app/api/ai-analysis/route.ts` is tuned down to avoid truncation; change with caution.

If you need to alter batching behavior or token limits, edit `app/api/ai-analysis/route.ts`. Look for constants like `DEFAULT_MAX_TOKENS` and `BATCH_SIZE`.

## Data model & types

Shared types live in `lib/types.ts`. Key shapes:

- `SurveyRecord` — typed shape for parsed CSV survey rows.
- `PredictionResult` — the AI-produced prediction object. The server includes compatibility fields to support legacy UI code (see `lib/types.ts` for current fields).

When modifying the prediction schema, update both the zod schema in `app/api/ai-analysis/route.ts` and the TypeScript types in `lib/types.ts`.

## Troubleshooting

Common issues and fixes:

- POST `/api/chat` returns 500
  - Cause: historically, the route used `Response.json(...)` incorrectly; it should use `NextResponse.json(...)` in the Next.js App Router API handlers.
  - Check `app/api/chat/route.ts` for correct response usage and robust Groq response parsing.

- AI truncation / JSON parse errors (finish_reason "length")
  - Symptoms: the AI returns truncated JSON or the server fails to parse AI output.
  - Fixes implemented in this repo: batching/chunking in `app/api/ai-analysis/route.ts`, reduced `max_tokens` default, and per-batch zod validation. If you still see truncation, reduce prompt size or lower `max_tokens` further.

- `GET /api/predictions?district=Gasabo&ai=true` returned 404 for district
  - Cause: strict exact matching of district names.
  - Fix: predictions route now normalizes names (trim, toLowerCase) and tolerates minor differences. Check the `predictions` route logic.

- TypeScript / ESLint / `no-explicit-any` warnings
  - Several files use dynamic AI responses that require runtime parsing. Where safe, the code uses `zod` validation; some files have temporary `eslint-disable` comments for `no-explicit-any`. Consider replacing these disables by tightening the parsing logic.

- React hook dependency warnings
  - You might see warnings about missing dependencies in `useEffect` (e.g., `fetchInterventions` or `fetchPredictions`). These are non-blocking. The recommended fix is to wrap the fetched functions in `useCallback` with an appropriate dependency array or move the function definition inside the `useEffect`.

## Developer notes & contributing

- Linting & types:
  - This repository uses TypeScript and ESLint. Run `npm run lint` to check style.
  - The build process runs type checking and linting during `npm run build`.

- Tests:
  - There are no automated unit tests included by default. If you add tests, prefer to use Jest or Vitest with TypeScript support.

- Changing AI behavior:
  - Edit `app/api/ai-analysis/route.ts` to adjust prompts, batching, or validation. Add or update the `predictionSchema` zod schema to match the expected AI output.

- Rebranding:
  - The app uses the public product name `NutriVision Rwanda`. If you need to change branding across files, search for previous names and update UI copy and metadata.

- Running in CI / Production:
  - Ensure that `GROQ_API_KEY` is set in the environment for your deployment target. Keep keys secret and use your platform's secret management.

## Next steps & suggestions

- Remove remaining `eslint-disable` comments by replacing `any` with validated `unknown` + zod checks.
- Fix React hook dependency warnings (wrap fetch functions in `useCallback`).
- Add lightweight integration tests for the AI routes that mock the Groq responses.
- Add server-side caching for `/api/ai-analysis` results (to avoid repeated AI calls for the same districts).

## License

This project does not include a license in the repository. Add an appropriate `LICENSE` file for your project.

---

If you'd like, I can:
- Patch the two files with React hook warnings to remove the warnings (useCallback or move the function into useEffect),
- Add examples of HTTP requests (curl/powershell Invoke-RestMethod) for the main endpoints,
- Or add basic unit tests for `lib/survey-data.ts` parsing.

Tell me which follow-up you prefer and I'll implement it next.


### **Getting Help**
- **Issues**: [GitHub Issues](https://github.com/felixaveiro/NutriVision-Rwanda/issues)
- **Discussions**: [GitHub Discussions](https://github.com/felixaveiro/NutriVision-Rwanda/discussions)

 - **Email**: [bikofelix2020@gmail.com](mailto:bikofelix2020@gmail.com)


## 📞 Contact

**Project Maintainer**: Felix Bikorimana  
**Portfolio**: [https://rugangazi.netlify.app/](https://rugangazi.netlify.app/)  
**Email**: [bikofelix2020@gmail.com](mailto:bikofelix2020@gmail.com)  
**LinkedIn**: [Felix Bikorimana](https://www.linkedin.com/in/felix-bikorimana-1972ba261/)  
**GitHub**: [@felixaveiro](https://github.com/felixaveiro)  
**Phone**: +250780941222

---