# Fulger

> Software stack for handling lightning payments

### Why Bitcoin? Because it's inclusive

Bitcoin is just math and technology put together. It practically works for everyone, independent
of gender, race, age, anything. It's a tool for empowering people with economic freedom and
trade across all physical barriers, allowing for secure value transfer and storage across
the globe.

### Tools for a self-sovereign stack

Owning and working with bitcoin is all about self-sovereignty at its core. Although running
the tools can be sometimes hard, the end goal and initial vision is to be a full participant in the
system. No matter how much benefits and ease of use a third party can provide, in the end
it's just yet another third party, a dependency in a sense. The true wonder of the bitcoin
system is that it was designed to run literally *anywhere* and by anyone, which is one of the core unique
propositions that bitcoin has over any other projects that appeared downstream from it.

It's become increasingly easier to run nodes and infrastructure with projects like umbrel
where it's practically plug and play. And then operating it brings indeed some challenges,
but it's not really that impossibly hard. If some of us managed to get a hang of it we can
teach it as well to other around us.

This documentation repository acts as a guide to handling a set of tools that will
allow you to claim your self-sovereignty in the digital space.

The stack is composed of:

* Bitcoin server
* Lightning Network server
* CouchDB database
* NodeJS

### Installation

You could have all services running on a single machine, but for practical reasons things
should be separated like so:
* Bitcoin + Lightning nodes running on their own dedicated machine, over Tor for increased security.
* CouchDB + NodeJS running on a publicly available host

The bitcoin node is only available on the local network where it's running, the only connection
to a public website is through a connection to the CouchDB system that acts as a message and
data transmission engine.

Follow the [full installation guide](https://fulger.kangu.ro/docs/install) for more details.

## Why should I care or use this?

It's about owning your stack, having control over its components and moving parts.
Yes there are BTC Pay Server, ZapRite, LitePay, ldk, etc..., but with them you have yet another
dependency.

The direction is which this project is going is to provide developers with a minimal
functioning btc+lightning bridge, and besides that stay out of the way and never crash.

## Target audience

For a better bitcoin adoption curve we should aim to target specific
niches of people and crafts. This particular set of tools is aimed at software developer professionals
(and amateurs alike) who can manage a web server for them or for clients and want to have an
easy to use and reliable toolset for handling payments in the lightning
ecosystem.

Small economic actors can be a good target as they have a lot to benefit from the improved
productivity with transactions, and they have a direct incentive to acquire skills and
put them to actual use to be able to fully sustain themselves and their business.

## Features coming up

* support for micro-transactions
* templates for small shops and entrepreneur small services
* themed qr code
* backend for products
* many more hopefully...

## Support us

We believe it making something great for yourself and them giving it away for free to people
to make use of and even build upon. We hope to reach a point where we're able to fully commit
to working on bitcoin and putting our skills to use in this space, but we're not quite
there yet.

We only accept transactions in sats and we'll be forever greatful for anyone supporting us in this journey.

We have setup a demo site for donations at [support-fulger.kangu.ro](https://support-fulger.kangu.ro/) that is
one of our design visions for a minimalist personal donation or tipping website. Fork it
from the repository, update the settings then use it for yourself.

## Feedback is welcomed

See the CONTRIBUTIONS document for details on how to actively participate.

## Demo implementation

A demo system for simple tipping is running on [support-fulger.kangu.ro](https://support-fulger.kangu.ro/), with the corresponding
[repository source here](https://github.com/kangu/demo-personal-site).

A professional's booking system for meetings and mentorship is running on [radustanciu.ro](https://radustanciu.ro#contact)
where you can schedule a meeting with someone by paying some sats straight away.

Further demos are planned for micro-transactions more traditional shops. You can
support development by [tipping us some sats through the demo implementation](https://support-fulger.kangu.ro/).
