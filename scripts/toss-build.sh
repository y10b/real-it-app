#!/bin/bash
mv src/app/api src/app/_api_backup
BUILD_TARGET=toss npx next build
status=$?
mv src/app/_api_backup src/app/api
exit $status
