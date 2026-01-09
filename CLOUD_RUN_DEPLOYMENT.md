# 🚀 Google Cloud Run Deployment Guide

## Overview

This app is containerized and can be deployed to Google Cloud Run. The Dockerfile builds a static Vite app and serves it with nginx.

## ⚠️ Important: Build-Time Environment Variables

Since this is a **static site**, environment variables must be provided at **BUILD time**, not runtime. Vite bakes them into the JavaScript bundle during the build process.

## 🔧 Deployment Options

### Option 1: Using Cloud Build with Build Args (Recommended)

#### Build and Deploy with gcloud CLI

```bash
# Set your project and region
export PROJECT_ID="your-project-id"
export REGION="us-central1"
export SERVICE_NAME="todo-list"
export GA_ID="G-99W9E25V3C"

# Build with Cloud Build, passing the GA measurement ID
gcloud builds submit \
  --project=${PROJECT_ID} \
  --tag=gcr.io/${PROJECT_ID}/${SERVICE_NAME} \
  --build-arg=VITE_GA_MEASUREMENT_ID=${GA_ID}

# Deploy to Cloud Run
gcloud run deploy ${SERVICE_NAME} \
  --project=${PROJECT_ID} \
  --region=${REGION} \
  --image=gcr.io/${PROJECT_ID}/${SERVICE_NAME} \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080
```

#### Using cloudbuild.yaml (Recommended for CI/CD)

Create `cloudbuild.yaml`:

```yaml
steps:
  # Build the Docker image with build args
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '--build-arg'
      - 'VITE_GA_MEASUREMENT_ID=${_GA_MEASUREMENT_ID}'
      - '-t'
      - 'gcr.io/$PROJECT_ID/${_SERVICE_NAME}:$COMMIT_SHA'
      - '-t'
      - 'gcr.io/$PROJECT_ID/${_SERVICE_NAME}:latest'
      - '.'

  # Push the image
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'push'
      - 'gcr.io/$PROJECT_ID/${_SERVICE_NAME}:$COMMIT_SHA'

  # Deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - '${_SERVICE_NAME}'
      - '--image'
      - 'gcr.io/$PROJECT_ID/${_SERVICE_NAME}:$COMMIT_SHA'
      - '--region'
      - '${_REGION}'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
      - '--port'
      - '8080'

substitutions:
  _SERVICE_NAME: todo-list
  _REGION: us-central1
  _GA_MEASUREMENT_ID: G-99W9E25V3C

images:
  - 'gcr.io/$PROJECT_ID/${_SERVICE_NAME}:$COMMIT_SHA'
  - 'gcr.io/$PROJECT_ID/${_SERVICE_NAME}:latest'

options:
  logging: CLOUD_LOGGING_ONLY
```

Deploy with:

```bash
gcloud builds submit --config=cloudbuild.yaml
```

---

### Option 2: Local Docker Build + Push

```bash
# Build locally with the GA measurement ID
docker build \
  --build-arg VITE_GA_MEASUREMENT_ID=G-99W9E25V3C \
  -t gcr.io/YOUR_PROJECT_ID/todo-list:latest \
  .

# Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/todo-list:latest

# Deploy to Cloud Run
gcloud run deploy todo-list \
  --image=gcr.io/YOUR_PROJECT_ID/todo-list:latest \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --port=8080
```

---

### Option 3: Cloud Run Source Deployment

**⚠️ Note:** Source deployments might not support build args directly. Use Cloud Build instead.

---

## 🔐 Managing the GA Measurement ID

### For Development

Use `.env.local` (already set up):
```bash
VITE_GA_MEASUREMENT_ID=G-99W9E25V3C
```

### For Production (Cloud Run)

The measurement ID is baked into the build, so you have two options:

#### Option A: Hardcode in cloudbuild.yaml (Simple)
```yaml
substitutions:
  _GA_MEASUREMENT_ID: G-99W9E25V3C
```

#### Option B: Use Secret Manager (More Secure)

1. **Store the secret:**
```bash
echo -n "G-99W9E25V3C" | gcloud secrets create ga-measurement-id --data-file=-
```

2. **Update cloudbuild.yaml to use the secret:**
```yaml
availableSecrets:
  secretManager:
    - versionName: projects/$PROJECT_ID/secrets/ga-measurement-id/versions/latest
      env: 'GA_MEASUREMENT_ID'

steps:
  - name: 'gcr.io/cloud-builders/docker'
    secretEnv: ['GA_MEASUREMENT_ID']
    args:
      - 'build'
      - '--build-arg'
      - 'VITE_GA_MEASUREMENT_ID=$$GA_MEASUREMENT_ID'
      - '-t'
      - 'gcr.io/$PROJECT_ID/${_SERVICE_NAME}:$COMMIT_SHA'
      - '.'
```

---

## 🧪 Testing the Build Locally

```bash
# Build with GA
docker build \
  --build-arg VITE_GA_MEASUREMENT_ID=G-99W9E25V3C \
  -t todo-list:test \
  .

# Run locally
docker run -p 8080:8080 todo-list:test

# Open http://localhost:8080
# Check browser console to verify GA loads
```

---

## ✅ Verification Checklist

After deployment:

1. **Check the deployed app:**
   ```bash
   gcloud run services describe todo-list --region=us-central1
   ```

2. **Visit the URL** and open browser console

3. **Look for GA initialization:**
   - Check for `gtag` function: `typeof window.gtag`
   - Should see Google Analytics script loaded in Network tab

4. **Test tracking:**
   - Create a task
   - Go to Google Analytics → Realtime → Events
   - Should see `task_created` event

---

## 📊 What Happens in Production

With the Dockerfile changes:

1. **Build stage** receives `VITE_GA_MEASUREMENT_ID` as a build arg
2. **Vite build** replaces `import.meta.env.VITE_GA_MEASUREMENT_ID` with `"G-99W9E25V3C"`
3. **Static files** in `/dist` have the GA ID hardcoded in JavaScript
4. **Nginx** serves these static files
5. **Browser** loads the page, GA initializes automatically

---

## 🔄 Updating the GA Measurement ID

To change the GA ID:

1. Update the build arg value
2. Rebuild the Docker image
3. Redeploy to Cloud Run

**Note:** You'll need to rebuild and redeploy to change the GA ID since it's baked into the static files.

---

## 💡 Alternative: Runtime Configuration

If you need runtime configuration (without rebuilding), you'd need to:

1. Create a config endpoint that serves env vars
2. Fetch it on app load
3. Initialize GA dynamically

This is more complex and not recommended for a static site. The build-time approach is simpler and more performant.

---

## 🆘 Troubleshooting

### GA Not Loading

**Check 1:** Verify build arg was passed
```bash
# Inspect the built image
docker run --rm -it todo-list:test cat /usr/share/nginx/html/assets/*.js | grep "G-99W9E25V3C"
```

**Check 2:** Check browser console for errors

**Check 3:** Verify the env var is in the built files
```bash
# In your built container
docker run --rm todo-list:test sh -c "grep -r 'G-99W9E25V3C' /usr/share/nginx/html"
```

### Build Fails

- Ensure Docker supports `--build-arg`
- Check Cloud Build logs in GCP Console
- Verify the ARG/ENV syntax in Dockerfile

---

## 📚 Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Docker Build Arguments](https://docs.docker.com/engine/reference/commandline/build/#build-arg)


