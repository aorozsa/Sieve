#!/bin/sh
ng build --prod
npm run package
build --pd dist/package/*
