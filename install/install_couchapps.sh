#!/bin/bash

# This requires the npm packages to be installed with npm install
# The .env file needs to be setup with a COUCH_PASS token

node ../couchapps/default_docs.js
node ../couchapps/ln_invoice.js
