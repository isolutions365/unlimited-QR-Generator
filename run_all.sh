#!/bin/bash

# Target list of files to migrate
files=(
  "src/pages/CompanyPages.tsx"
  "src/pages/TrustCenterHub.tsx"
  "src/pages/EmbedPage.tsx"
  "src/pages/EnterpriseAIGateway.tsx"
  "src/pages/FaqSection.tsx"
  "src/pages/GrowthSuite.tsx"
  "src/pages/I18nDashboard.tsx"
  "src/pages/KnowledgeHub.tsx"
  "src/pages/PlatformHub.tsx"
  "src/pages/ProgrammaticHub.tsx"
  "src/pages/TemplatesHub.tsx"
  "src/pages/landing/SEOPage.tsx"
  "src/pages/landing/URLQRContent.tsx"
)

echo "Starting pages migration..."
echo "=================================================="

for file in "${files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "SKIP: $file - File does not exist."
    continue
  fi

  echo "RUNNING: node migrate_one.cjs \"$file\""
  node migrate_one.cjs "$file" 2>&1
  status=$?

  if [ $status -eq 0 ]; then
    echo "SUCCESS: $file"
  else
    echo "FAILED: $file"
  fi

  echo "--------------------------------------------------"
  # Delay to respect Gemini API limits / model availability
  sleep 6
done

echo "All listed pages processed."
