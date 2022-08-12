#!/usr/bin/env sh

rm ./endpoint-tests/endpoint-data.json

export NODE_ENV=test
export API_URL=http://localhost:8081

unset DEV_DB_NAME

echo "[]" > endpoint-data.json

docker-compose -f ../docker-compose.endpoint-tests.yml -p api up -d

docker-compose -f ../docker-compose.endpoint-tests.yml -p api exec -e LOG_LEVEL=verbose api-for-testing yarn run migrate
docker-compose -f ../docker-compose.endpoint-tests.yml -p api exec -e LOG_LEVEL=verbose api-for-testing yarn run seed
docker-compose -f ../docker-compose.endpoint-tests.yml -p api exec -e ENDPOINT_COVERAGE_CAPTURE=true api-for-testing yarn run test-endpoints $@
EXIT_CODE=$?
docker cp api-for-testing:/app/api/endpoint-data.json endpoint-data.json

docker-compose -f ../docker-compose.endpoint-tests.yml -p api down

mv endpoint-data.json ./endpoint-tests

node endpoint-tests/endpoint-coverage.js
exit $EXIT_CODE
