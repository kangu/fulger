---
# Display h2 to h5 headings
toc_min_heading_level: 2
toc_max_heading_level: 5
---

# Installation

## Steps overview

The instructions in this article have been tested on CentOS 7.

You should be able to run an `install.sh` script and that will install the following dependencies:

* Caddy http server
* CouchDB
* NodeJS

The ZapPay system is based on the following components:

## HTTP server

The purpose of the server is to be the public facing element of the entire system. We use Caddy.

## CouchDB database

The sleek and performant NoSQL database does all the heavy lifting in terms of processing data.
[Installation instructions are on the official documentation page](https://docs.couchdb.org/en/stable/install/index.html)

## NodeJS

The choice was made for NodeJS as the server-side tool in order to have javascript running across the full
stack. Other options for doing server task handling can be used instead.

Currently in use is the [nvm](https://github.com/nvm-sh/nvm) version manager a LTS version > 16.
