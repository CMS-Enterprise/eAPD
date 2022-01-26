#!/usr/bin/env sh

rm ./endpoint-tests/endpoint-data.json

export NODE_ENV=test
export API_URL=http://localhost:8081
export CYPRESS_TESTS=false

unset DEV_DB_NAME

echo "[]" > endpoint-data.json

docker-compose --net api_default -f docker-compose.endpoint-tests.yml up -d
sleep 3
docker-compose --net api_default -f docker-compose.endpoint-tests.yml exec api-for-testing npm run migrate
docker-compose --net api_default -f docker-compose.endpoint-tests.yml exec api-for-testing npm run seed
docker-compose --net api_default -f docker-compose.endpoint-tests.yml exec api-for-testing npm run test-endpoints $@
EXIT_CODE=$?
docker-compose --net api_default -f docker-compose.endpoint-tests.yml down

mv endpoint-data.json ./endpoint-tests

node endpoint-tests/endpoint-coverage.js
exit $EXIT_CODE
