START TRANSACTION;
INSERT INTO airlines (name, country_id, user_name, password) VALUES
('American Airlines', 1, 'aa_user', 'aa_pass'),
('Air Canada', 2, 'ac_user', 'ac_pass'),
('Aeromexico', 3, 'am_user', 'am_pass'),
('LATAM Airlines', 4, 'latam_user', 'latam_pass'),
('British Airways', 5, 'ba_user', 'ba_pass'),
('Lufthansa', 6, 'lh_user', 'lh_pass'),
('Air France', 7, 'af_user', 'af_pass'),
('Alitalia', 8, 'al_user', 'al_pass'),
('Iberia', 9, 'ib_user', 'ib_pass'),
('Qantas', 10, 'qf_user', 'qf_pass');
COMMIT;