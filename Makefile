.PHONY: build serve deploy clean

# Cloudflare creds for non-interactive wrangler (same pattern as roxabi-forge).
# Copy .env.example.cloudflare → .env and fill in. wrangler picks these up from
# the environment — no `wrangler login` needed at deploy time.
-include .env
export CLOUDFLARE_ACCOUNT_ID
export CLOUDFLARE_API_TOKEN

# Generate the static site → dist/ (zero-dependency, Python 3.11+ stdlib only)
build:
	python3 src/build.py

# Preview locally
serve: build
	@echo "→ http://localhost:8000"
	python3 -m http.server -d dist 8000

# Push to Cloudflare Pages (token-auth via .env, like forge). Refuses a dirty tree.
deploy: build
	@git diff --quiet || { echo "Error: dirty tree — commit changes before deploying"; exit 1; }
	@echo "Deploying to Cloudflare Pages…"
	npx wrangler pages deploy dist --project-name=roxabi-site --branch=main

clean:
	rm -rf dist
