#Limbic Worklog Server

This is a server instance that accumulates data from Toggl on a regular basis, throws it in a database, and allows the client app to connect and generate reports.

**Technologies**: Kue (Redis), MongoDB, Toggl API

## Requirements

* Redis instance (for Kue)
* MongoDB instance (Toggl data storage)
* User-specified `config.js` (clone config-sample.js and edit to fit your settings)

##Installation

```
$ git clone https://github.com/emcniece/lm-worklog.git; cd lm-worklog/server
$ cp config-sample.js config.js
$ npm install
$ npm run start
```

## How To Use

The app exposes various interfaces for ease of use:

* **Job Queue**
  * /active/ - Kue GUI, through Express
  * /clear/:state - Clears any queued jobs with an optional status parameter
    * [**active**|inactive|failed|complete|delayed|all]
* **Users**
  * /users/ - Lists users
  * /users/add/:key - Adds a new user and job for a given Toggl API key
  * /users/delete/:id - Deletes a user by `ObjectId`
* **Jobs**
  * /jobs/ - Lists jobs
  * /jobs/delete/:id - Deletes a job by `ObjectId`
* **Worklogs**
  * /logs/ - Lists most recent logs
  * /logs/:project - Lists logs by project name
* **Projects**
  * /projects/ - Lists projects
  * /projects/add/:name
  * /projects/delete/:name



##MongoDB Structure

The database structure is organized as such:

* users
* jobs
* worklogs

When establishing a new mongod instance, there are some useful schema setup steps:

```
db.users.ensureIndex({id:1},{unique:true, sparse:true});
db.jobs.ensureIndex({user:1},{unique:true, sparse:true});
```