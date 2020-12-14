FROM postgres:12.5-alpine

ADD ./scripts/createtables.sql /docker-entrypoint-initdb.d/
ADD ./scripts/preloaduser.sql /docker-entrypoint-initdb.d/