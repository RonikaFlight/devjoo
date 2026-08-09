#!/bin/bash
set -e

BASE=http://localhost:3000/api/v1
COOKIE=/tmp/dj_a.txt

# 1. Auth
echo '=== 1. Auth ==='
curl -s -c $COOKIE -X POST $BASE/auth/otp/request -H 'Content-Type: application/json' -d '{"phone":"09123456789"}'
echo 'ok'
curl -s -c $COOKIE -X POST $BASE/auth/otp/verify -H 'Content-Type: application/json' -d '{"phone":"09123456789","code":"12345"}'
echo 'ok'
curl -s -c $COOKIE -X POST $BASE/auth/register -H 'Content-Type: application/json' -d '{"displayName":"شرکت فناوری","role":"EMPLOYER"}'
echo 'ok'

# 2. Create project
echo '=== 2. Create Project ==='
SLUG=$(curl -s -b $COOKIE -X POST $BASE/projects -H 'Content-Type: application/json' -d '{"title":"Test Project","description":"A test project description that meets the minimum thirty character requirement for validation.","categoryId":"cmslbv58v0000lu0ocpi3ghgn","skills":["cmslbv58w0002lu0o8d988k8i"],"budgetType":"FIXED","fixedPriceRial":30000000,"experienceLevel":"SENIOR","workType":"REMOTE","proposalLimit":10}' 2>/dev/null)
SLUG=$(echo $SLUG)
echo "Slug: $SLUG"
echo "Status: $(curl -s -b $COOKIE $BASE/projects/$SLUG | tail -1)

# 3. Publish project
echo '=== 3. Publish ==='
curl -s -b $COOKIE -X POST $BASE/projects/$SLUG/publish 2>/dev/null

# 4. List projects
echo '=== 4. List ==='
curl -s $BASE/projects 2>/dev/null

# 5. Create second project
echo '=== 5. Create Project 2 ==='
SLUG2=$(curl -s -b $COOKIE -X POST $BASE/projects -H 'Content-Type: application/json' -d '{"title":"Project Two For Listing","description":"Another test project that meets the minimum thirty character requirement for validation.","categoryId":"cmslbv58v0000lu0ocpi3ghgn","skills":["cmslbv58w0002lu0o8d988k8i"],"budgetType":"HOURLY","budgetMinRial":1000000,"budgetMaxRial":5000000,"experienceLevel":"MID_LEVEL","workType":"REMOTE","proposalLimit":8}' 2>/dev/null)
SLUG2=$(echo $SLUG2)
echo "Slug: $SLUG2"

# 6. Verify list
echo '=== 6. List ==='
curl -s $BASE/projects 2>/dev/null

# 7. Test GET project detail
echo '=== 7. Project Detail ==='
curl -s $BASE/projects/$SLUG 2>/dev/null
