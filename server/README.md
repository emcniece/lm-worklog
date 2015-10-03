#Limbic Worklog Server

This is a server instance that accumulates data from Toggl on a regular basis, throws it in a database, and allows the client app to connect and generate reports.

**Technologies**: Kue (Redis), MongoDB, Toggl API

## Requirements

* Redis instance (for Kue)
* MongoDB instance (Toggl data storage)
* User-specified `config.js`

##Installation

```
$ git clone https://github.com/emcniece/lm-worklog.git; cd lm-worklog/server
$ cp config-sample.js config.js
$ npm install
$ npm run start
```

## How To Use

The app exposes various interfaces for ease of use:

* /active/ - Kue GUI, through Express
* /add/:id - Adds a new job for a given Toggl API key
* /clear/:state - Clears any queued jobs with an optional status parameter
  * [**active**|inactive|failed|complete|delayed|all]
