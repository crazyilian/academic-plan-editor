Remove-Item -LiteralPath "dist_electron" -Force -Recurse
npm run electron-build-32
Copy-Item -Path dist_electron\*.exe -Destination tmp -Force

Remove-Item -LiteralPath "dist_electron" -Force -Recurse
npm run electron-build-64
Copy-Item -Path dist_electron\*.exe -Destination tmp -Force
