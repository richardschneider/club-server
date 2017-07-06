# club-server
A multi-tenant bridge club server.  Automatically deployed to [https://club-server.herokuapp.com](https://club-server.herokuapp.com/).

## Features

- access is via [GraphQL](http://graphql.org/)
- saves a session (event, competition) via PBN

## Configuration

You need to set the following environment variables.

Set `NODE_ENV` to 
- 'production' for a production system
- 'ci' for continuous integration
- 'dev' for develepment (the default)

Set `BASE_URL` to the URL of the server; for example `https://club-server.herokuapp.com/`.  In dev mode this defaults to localhost and the port.

Set `DATABASE_URL` to a postgres database; otherwise, defaults to sqlite; for example `postgresql://user:pswd@localhost/bridge`

To support Google logins, set
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
