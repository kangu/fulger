# Contributing

We welcome everyone to contribute to Plausible. This document is to help you on setting up your environment, finding a task, and opening pull requests.

## Key Technical Skills
* Node.js as a basic level
* CouchDB - can be technically replaced with a different persistence layer, but it's currently
the preferred option
* Basic networking skills and operation of web servers like nginx or caddy. Caddy is preferred due
to its simplicity and ease of configuration + it's a solid option as a Go application
* Basic bitcoin skills, ability to install a bitcoin node through something simple like Umbrel

## Development setup

## Tools

- Node.js >= 16
- CouchDB >= 2
- Git

### CouchDB configuration

Install CouchDB and afterwards run the two scripts from the couchapps folder:

```bash
# default configuration
node couchapps/default_docs.js
# lightning invoice plugin
node couchapps/ln_invoice.js
```

The way you start the Hapi development server is thourgh `npm run dev` after installing all
dependencies with `npm install`.

### .env configuration

The `.env` file is where all sensitive information like hashed passwords, api keys and internal
paths are stored.

## Code organisation

The order processing system is supposed to be fully modular. There is a core `order` object
that gets instantiated then it's passed through a set of plugins that transform the final
output by adding their relevant bits.
The database layer picks up on the corresponding module data and processes that in an isolated
manner.

## Recommended Pull Request Guideline

Before deep into coding, discussion first is preferred. Creating an empty pull request for discussion would be recommended.

1. Fork the project
1. Clone your fork repo to local
1. Create a new branch
1. Create an empty commit
   `git commit -m "[empty commit] pull request for <YOUR TASK NAME>" --allow-empty`
1. Push to your fork repo
1. Create a pull request: https://github.com/kangu/fulger/compare
1. Write a proper description
1. Click "Change to draft"
1. Discussion

