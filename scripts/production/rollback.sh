#!/bin/bash

eval $(egrep -v '^#' .env | xargs) npx knex migrate:rollback --env production