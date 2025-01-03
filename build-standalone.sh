#!/bin/bash

yarn build
cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/
cd .next/standalone
zip -r ../../acme-viewer.zip .
cd ../../