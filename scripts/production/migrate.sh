#!/bin/bash

eval $(egrep -v '^#' .env | xargs) npx knex migrate:latest --env production