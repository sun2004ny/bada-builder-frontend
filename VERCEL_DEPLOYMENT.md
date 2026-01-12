# Vercel Deployment Guide

## Backend Connection

Your frontend is now configured to connect to the backend at:
- **Production Backend**: `https://bada-builder-backend.onrender.com/api`
- **Frontend**: `https://bada-builder-frontend.vercel.app`

## Configuration

The API URL is configured in two files:
- `src/config/api.js`
- `src/services/api.js`

Both use the environment variable `VITE_API_URL` with a fallback to the production backend URL.

## Vercel Environment Variables (Optional)

If you want to override the backend URL or use a different one for specific environments, you can set environment variables in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://bada-builder-backend.onrender.com/api`
   - **Environment**: Production, Preview, Development (as needed)

## Local Development

For local development, create a `.env` file in the root directory:

```
VITE_API_URL=http://localhost:5000/api
```

This will override the production URL when running `npm run dev` locally.

## Verification

After deployment, verify the connection:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Perform an action that calls the API (e.g., login, fetch properties)
4. Check that requests are going to `https://bada-builder-backend.onrender.com/api`

## Troubleshooting

### CORS Errors
If you see CORS errors, ensure your backend has CORS configured to allow requests from:
- `https://bada-builder-frontend.vercel.app`
- `http://localhost:5173` (for local development)

### API Not Responding
- Check that the backend is running on Render
- Verify the backend URL is correct
- Check Render logs for any errors

### Environment Variables Not Working
- Ensure variable name starts with `VITE_` (required for Vite)
- Redeploy after adding environment variables
- Check Vercel build logs for any issues
