BEGIN TRANSACTION;

-- DROP TABLE users;
CREATE TABLE users (
	id serial NOT NULL,
	fullname varchar(100) NOT NULL,
	email text NOT NULL,
	joined timestamp NOT NULL,
	verified bool NOT NULL DEFAULT false,
	CONSTRAINT users_email_un UNIQUE (email),
	CONSTRAINT users_pk PRIMARY KEY (id)
);

-- DROP TABLE login;
CREATE TABLE login (
	id serial NOT NULL,
	hash varchar(100) NOT NULL,
	email text NOT NULL,
	lastlogin timestamp NULL,
	CONSTRAINT login_email_un UNIQUE (email),
	CONSTRAINT login_pk PRIMARY KEY (id)
);
ALTER TABLE login ADD CONSTRAINT login_fk FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE;

-- DROP TABLE user_verification;
CREATE TABLE user_verification (
	userid int4 NOT NULL,
	hash varchar(40) NOT NULL
);
ALTER TABLE user_verification ADD CONSTRAINT user_verification_fk FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE;

COMMIT;
