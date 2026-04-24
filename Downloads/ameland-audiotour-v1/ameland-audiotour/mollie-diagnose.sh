#!/usr/bin/env bash

set -e

echo ""
echo "========================================"
echo " AMELAND AUDIOTOURS - MOLLIE DIAGNOSE"
echo "========================================"
echo ""

if [ ! -f "package.json" ]; then
  echo "❌ Geen package.json gevonden."
  echo "Huidige map:"
  pwd
  exit 1
fi

echo "✅ Projectmap gevonden:"
pwd
echo ""

echo "----------------------------------------"
echo "1. Package info"
echo "----------------------------------------"
node -e "
const p=require('./package.json');
console.log('name:', p.name || '(geen naam)');
console.log('scripts:', Object.keys(p.scripts||{}).join(', ') || '(geen scripts)');
console.log('dependencies with mollie/next/supabase/prisma/drizzle:');
const deps={...(p.dependencies||{}), ...(p.devDependencies||{})};
for (const [k,v] of Object.entries(deps)) {
  if (/mollie|next|supabase|prisma|drizzle|postgres/i.test(k)) console.log(' -', k, v);
}
"
echo ""

echo "----------------------------------------"
echo "2. Environment variabelen veilig gemaskeerd"
echo "----------------------------------------"
for envfile in .env .env.local .env.production; do
  if [ -f "$envfile" ]; then
    echo ""
    echo "### $envfile"
    grep -E "MOLLIE|APP_URL|NEXT_PUBLIC|SITE_URL|BASE_URL|URL|VERCEL" "$envfile" 2>/dev/null | sed -E \
      -e 's/(MOLLIE_API_KEY=).+/\1***MASKED***/g' \
      -e 's/(SUPABASE_SERVICE_ROLE_KEY=).+/\1***MASKED***/g' \
      -e 's/(SUPABASE_ANON_KEY=).+/\1***MASKED***/g' \
      -e 's/(DATABASE_URL=).+/\1***MASKED***/g' \
      -e 's/(DIRECT_URL=).+/\1***MASKED***/g' || true
  fi
done
echo ""

echo "----------------------------------------"
echo "3. Mollie-code zoeken"
echo "----------------------------------------"
grep -RIn \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  --exclude-dir=.git \
  --exclude-dir=dist \
  --exclude-dir=build \
  "mollie\|MOLLIE\|redirectUrl\|returnUrl\|webhookUrl\|payments.create\|payments.get" \
  . || true

echo ""
echo "----------------------------------------"
echo "4. Payment/API routes zoeken"
echo "----------------------------------------"
find . \
  -path "./node_modules" -prune -o \
  -path "./.next" -prune -o \
  -path "./.git" -prune -o \
  -type f \( \
    -path "*api*" -o \
    -path "*payment*" -o \
    -path "*checkout*" -o \
    -path "*mollie*" \
  \) \
  | sort

echo ""
echo "----------------------------------------"
echo "5. Relevante codebestanden tonen"
echo "----------------------------------------"

for file in $(find . \
  -path "./node_modules" -prune -o \
  -path "./.next" -prune -o \
  -path "./.git" -prune -o \
  -type f \( \
    -path "*mollie*" -o \
    -path "*checkout*" -o \
    -path "*payment*" \
  \) \
  | sort); do
  echo ""
  echo "######## FILE: $file ########"
  sed -n '1,240p' "$file"
done

echo ""
echo "========================================"
echo " DIAGNOSE KLAAR"
echo "========================================"
