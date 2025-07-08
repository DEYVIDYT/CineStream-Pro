# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`

   **Note on Nested Project:** This project includes a secondary video player located in the `player/` directory, which has its own dependencies. To ensure the secondary player functions correctly, you also need to install its dependencies:
   ```bash
   cd player
   npm install
   cd ..
   ```
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
