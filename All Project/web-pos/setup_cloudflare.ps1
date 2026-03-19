# Cloudflare Pages Setup Script for Web-POS
# This script automates everything for PROJECT: secondhan-pos

$projectName = "secondhan-pos"
$dbName = "secondhan-pos"

Write-Host "--- Configuring Cloudflare Pages Project: $projectName ---" -ForegroundColor Cyan

# 0. Check/Create Pages Project
Write-Host "Creating/Verifying Pages Project: $projectName..." -ForegroundColor Yellow
npx wrangler pages project create $projectName --production-branch master

# 1. Create D1 Database
Write-Host "Creating D1 Database: $dbName..." -ForegroundColor Yellow
npx wrangler d1 create $dbName
$dbInfo = npx wrangler d1 info $dbName --json | ConvertFrom-Json
$dbId = $dbInfo[0].uuid # Get the first one in case it returns an array

Write-Host "Database ID found: $dbId" -ForegroundColor Green

# 2. Set Secrets from .env.local
$secrets = @{
    "GCP_CLIENT_EMAIL" = "thrift-pos@single-arcadia-422509-h0.iam.gserviceaccount.com"
    "GCP_PRIVATE_KEY" = @"
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCeRWYdTkFVdHjw
N2p+rY0L4bQGAs9gFy5HdKrPSr74fFPNYHnWTso83Vo1ks2WhZRjj5B7OetYq2xI
5rRmKJD2x7xWh/aDcvJYPeF4/gBtOGNdO9Xcz5lNOW6a6FlH/fDcbTDgO+Bb5HoL
Tsk9suhjmWzxY62OlwyQUIVsUOoSSuQjv+dIYwl5QHumlGeIeqrRUwRvkRvuBSKJ
atKfAeQKWopZDwhN87okhBywM0AJH91p1sqSN1Z6vvZ/IzB1zGQbhoZGDhUh7VdR
njycGpxbwDYCRAuzTTvMH2w2yARce5fKjnXZ3kCIMzpXggx5F+SCzKf7rt4NeZQUQ
nAlU/fI/AgMBAAECggEACif+6QOECsVKG3Qa590gL3KA2F/myc5DAH/alCnCPnTP
9d5qgxeUP7qeltCAU9fnkUn9pgKt+QcrEDSJwAJ7ZvKjQdRAu+es6H+0D80Q3vFe
4vU7gItr1XpJgDRHwmhnw+VX3RPKjmsHb+FS5Zws8HNAe+7/DKbhvgMExNIeayT8
TkPd9N9SNXkXhK7rFHX0UH763v2AZbDhYQbeD8RHK6ZSEkM+Ue637S0tjjTlJDQQ
hq2X0vmJe8IJNgE1qH7mukKar8bA4tdqM1oLWrjWBBvH8mQKqo12KlsK5N+4Rbql
IparJCP2wQhp1cvShILOge6RevMbJZ3WzhQyvU3NHQKBgQDOcKqWIuzmUFoQ0GrS
xyella2YUMky0b1l4oCNex+bBObn4V1rO5dA1QuAYVMuhgT0bnS43nvhPecDly7R
PDGM9xwNCTIhJ8An6lhmoS7FFRQ3V33cCj+6fz6hbydz+i2m/9mlcWKM2imzq6yI
htz/tFeypELb1QeOnE2PUxOaAwKBgQDERGA1EchfEi0fGB8vrvgXIfCjfFmV8lo8
6pcsau6do4IUFNFDJu8QV4fIwI7X1Ev1oPMRVSzOL2O24hXPxB3yT+Ok1G+PMl/E
jjAal+v+Zv5GM3ayNsZQAtxyHCicVCzYLjOIx6fKhcFpFmRt+fQ5yVcY1zODynBW
iBcIW6twFQKBgGtLZ33s3Q+/R3BhwoOWeua26qi1pDzDghrIJGRkT8L0Q0bVfQZU
zIInuHibHO6bPUwFdKj5CY3B7KWTGAQrst0/OdcUpndQ/7A/Pn7o2zQXhpBU6tdI
hGLb66Nf8DN5He0kIOy6B6yJXw9A9MVowsgr5UC12wICsJDQcAdD+HYdAoGAMFE8
9hOopm8NGKiRlOWYQemjGjxUuatuN6zxBohUsg48ycDOO5/sHrPNw8hT4iJriM7U
yCGV5DSacb167Sk0ziCIxF1gEXqvRO5UPVfFS14DnziwMfN2IuBxcM4p2UKHv7iw
Cy5LynnfQYW3t7NfQpKklIL2Na2ytjrOoMogjHkCgYEAwAj+Pi6dcVmA6bHdP/12
iRGdsFuiRukGa+08DRFEWZgs+ZvryTGKVN7Gxx4TJtiwXthB1+zczTWQOrSaWQov
nk0s+Ki8vjvoG9xbu3AvCm1R2jymf0rOPX31iAOdVfMaM4L1/ABLxLz6X6x/Cw0Km
jgml4UN1Sgi0ZR7xMKL7j+A=
-----END PRIVATE KEY-----
"@
    "GCP_SPREADSHEET_ID" = "1gYEmAlF85hH3TmhAXCGs1ilvpNtF2_CJmhIPKSAlwE0"
    "NEXT_PUBLIC_SHEET_NAME" = "Thrift Shop Inventory"
    "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME" = "domga8omv"
    "NEXT_PUBLIC_CLOUDINARY_API_KEY" = "114927425715714"
    "CLOUDINARY_UPLOAD_PRESET" = "rizan_pos_unsigned"
    "JWT_SECRET" = "rizan_thrift_pos_secret_senior_transformation_overnight"
}

foreach ($name in $secrets.Keys) {
    Write-Host "Setting secret: $name..." -ForegroundColor Yellow
    $val = $secrets[$name]
    echo $val | npx wrangler pages secret put $name --project-name $projectName
}

# 3. Set Compatibility Flags
Write-Host "Setting nodejs_compat flag..." -ForegroundColor Yellow
npx wrangler pages project edit $projectName --compatibility-flag nodejs_compat

# 4. Set D1 Binding
Write-Host "Binding D1 Database ($dbName)..." -ForegroundColor Yellow
npx wrangler pages project edit $projectName --d1 "DB=$dbId"

Write-Host "--- Done! All names updated to secondhan-pos ---" -ForegroundColor Green
Write-Host "Please check your Cloudflare Dashboard to confirm."
