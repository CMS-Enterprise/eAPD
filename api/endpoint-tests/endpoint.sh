#!/usr/bin/env sh

rm ./endpoint-tests/endpoint-data.json

echo "[]" > endpoint-data.json

docker-compose -f docker-compose.endpoint-tests.yml up -d
docker-compose -f docker-compose.endpoint-tests.yml exec api-for-testing npm run migrate
docker-compose -f docker-compose.endpoint-tests.yml exec api-for-testing npm run seed
docker-compose -f docker-compose.endpoint-tests.yml exec api-for-testing npm run test-endpoints $@
EXIT_CODE=$?
docker-compose -f docker-compose.endpoint-tests.yml down

mv endpoint-data.json ./endpoint-tests

node endpoint-tests/endpoint-coverage.js
exit $EXIT_CODE