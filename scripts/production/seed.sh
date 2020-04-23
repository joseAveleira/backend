#!/bin/bash

eval $(egrep -v '^#' .env | xargs) npx knex seed:run --env production