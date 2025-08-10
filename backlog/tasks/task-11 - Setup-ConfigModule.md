---
id: task-11
title: Setup ConfigModule
status: Done
assignee:
  - Claude
created_date: '2025-07-09'
updated_date: '2025-07-09'
labels: []
dependencies: []
---

## Description

Create a new ConfigModule. 

* Its responsibility will be to retrieve and store the configuration settings set in a `config` directory
  * If `.config` does not exist, then look in `.config.example` instead.
* Determine which file type could best be used to store the configuration. My thoughts are that it could either be JSON or YAML.
* The first configuration type that you should store are about RSS Feeds. It should contain a list with each object having the following keys:
  * src: an href to a RSS feed
  * title: an optional field to store the title of the feed.
