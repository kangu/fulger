# Fulger

> Software stack for handling lightning payments - https://fulger.kangu.ro

### Why Bitcoin?

Primarily because it works well and it's inclusive.

Bitcoin at is core is just math and computational technology put together. This means that out of the box it works for everyone, independent
of gender, race, age, anything. It's software eating into the world of finance. It's a tool for empowering people with economic freedom and
trade across all physical barriers, allowing for secure value transfer and storage across
the globe.

### Tools for a self-sovereign stack

Owning and working with bitcoin is all about self-sovereignty at its [core](https://bitcoin.org/bitcoin.pdf). Although running
the tools can be challenging, the end goal of the initial vision is to be a full participant in the
system.

No matter how much benefits and ease of use a third party can provide (LSP providers like [Voltage](https://voltage.cloud/) popping up all around), in the end
it's just yet another third party, a dependency in a sense. The true wonder of the bitcoin
system is that it was designed to run literally *anywhere* and by anyone, on your own hardware, which is one of the core unique
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

Rationale for picking the tools:

* CouchDB is based on the rock-solid Erlang VM and provides great performance and uptime,
plus it's natively over HTTP and has a built-in replication system and protocol which could
open up many interesting use cases for people syncing data between their devices completely
peer to peer.
* NodeJS is solid and well proven for over a while now in production systems. The main appeal
of using it is to have a common language for the backend, database, and also obviously on
the frontend itself, that being Javascript. Sure the backend can be built in something
more powerful and modern so to say like Rust, Elixir, GO, any kind of indeed real solid foundations,
but that one-language advantage in terms of code maintenance is lost. The js code is running
under different engines and runtimes, so you can't always run the same code identical everywhere,
but the core of the logic can be all incapsulated through javascript. Like it was foretold
by [Jeff Atwood in 2007](https://jayaprabhakar.medium.com/rethinking-atwoods-law-64a894b54aa4) :)

### Installation

You could have all services running on a single machine, but for practical reasons things
should be separated like so:
* Bitcoin + Lightning nodes running on their own dedicated machine, most conveniently through tools like [Umbrel](https://umbrel.com)
* CouchDB + NodeJS running on a publicly available host

The bitcoin node is only available on the local network where it's running, the only connection
to a public website is through a connection to the CouchDB system that acts as a message and
data transmission engine.

Follow the [full installation guide](./install) for more details.

## Why should I use any of this stuff?

It's about owning your stack, having control over its components and moving parts.
Yes there are some projects like [BTC Pay Server](https://btcpayserver.org/) or [OpenNode](https://www.opennode.com/),
which abstract away more or less things but they tend to get heavy and be an ever-changing
thing not really under your control. There's also a growing market for lightning as a service
which abstract away the need for channel management and balancing, which is great
but we feel there's value in sticking to the core stack and providing minimal yet good
functional value on top of it.

The direction is which this project is going is to provide developers with a functioning
btc+lightning bridge on various scenarios, but besides that stay out of the way, plus never crash.

## Target audience

For a better bitcoin adoption rate we should target tools, products and services to specific
niches of people. This particular set of tools is aimed at software developer professionals
(and amateurs alike) who can manage a website for them and/or for clients/friends and want to have an
easy to use, understandable and reliable toolset for navigating the lightning ecosystem.

## Features coming up

* backend UI
* support for micro-transactions vision of how you can monetize your own content
  completely on your own terms and infrastructure. it feels like 402 functional vision is
  more possible than ever with tools like [Alby](https://getalby.com)
* templates for small shops and entrepreneur small services like online consulting and
  mentoring
* themed qr codes would be eye catchy
* many more hopefully...

## Support us

We could use some extra sats you are willing to share with us, is helps pay the bills and
keep things going. We have setup a demo site for donations at [support-fulger.kangu.ro](https://support-fulger.kangu.ro/) will
all the sources published on this repository that you can grab and run of modify as your own.

## Feedback is welcomed

See the CONTRIBUTIONS document for details on how to actively participate.

## Demo implementation

A demo system for simple tipping is running on [my own personal website](https://radustanciu.ro#contact), with the corresponding
[repository source here](https://github.com/kangu/demo-personal-site). It's pretty rough at the
moment and more like a proof of concept, but it's being improved upon

Further demos are planned for micro-transactions and a more commerce-oriented shop. You can
support development by [tipping us some sats through the demo implementation](https://radustanciu.ro#contact) or directly at radu@getalby.com.
