BEGIN TRANSACTION;

INSERT INTO users (fullname, email, joined, verified) VALUES ('Demo User', 'demo@briciole.demo', '2020-12-14 07:39:17.635', true);
INSERT INTO login (hash, email, lastlogin) VALUES ('$2a$10$JVinO5aTPN9HguT2Rsfp9OMF0A0ROfbkPvRp63LVJmuiVwWR/drJK', 'demo@briciole.demo', '2020-12-14 07:40:53.546');

COMMIT;