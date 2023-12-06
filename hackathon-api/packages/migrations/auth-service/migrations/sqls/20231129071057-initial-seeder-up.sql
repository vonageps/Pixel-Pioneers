/* Replace with your SQL commands */
INSERT INTO main.auth_clients(
	 client_id, client_secret, access_token_expiration, refresh_token_expiration, auth_code_expiration,secret)
	VALUES ('patient_webapp', 'TrPbi0xJT','900','3600','300','dGVsZXNjb3BlLWhlYWx0aA==' ),
	('portal_admin_webapp', 'pK7ijn9T5','900','3600','300','dGVsZXNjb3BlLWhlYWx0aA=='),
	('doctor_webapp','Tz4Z0DcXx','900','3600','300','dGVsZXNjb3BlLWhlYWx0aA==');

INSERT INTO main.tenants(
	 id, name, status, key)
	VALUES ('bbbd6cf4-3191-7a55-59a9-2c9d995fb4a1','telehealth portal', 1,'telehealth_portal' );
INSERT INTO main.tenants(
	 id, name, status, key)
	VALUES ('4b75efdd-814d-f8d2-f271-e1857e5d11c2','Sourcefuse Health',1, 'sf_health');

INSERT INTO main.roles(
	id, name, permissions, role_type)
	VALUES ('f169f647-adf2-4f10-2ea1-79d0720e9f61','Portal Admin','{PortalAdmin}', 1);
INSERT INTO main.roles(
	id, name, permissions, role_type)
	VALUES ('287da788-8b78-25f5-8d49-9ba23903e992','Doctor','{Doctor}', 2);
INSERT INTO main.roles(
	id, name, permissions, role_type)
	VALUES ('2ab69712-3d4b-aa4d-97bf-d3584a55a355','Patient','{Patient}', 3);


INSERT INTO main.users(
	 first_name, last_name, username, email, phone, auth_client_ids,default_tenant_id)
	VALUES ('john', 'doe', 'admin_sf@yopmail.com','admin_sf@yopmail.com','918800145461',ARRAY(SELECT id from main.auth_clients where client_id = 'doctor_webapp' ),(SELECT id from main.tenants where key = 'sf_health'));
INSERT INTO main.users(
	 first_name, last_name, username, email, phone, auth_client_ids,default_tenant_id)
	VALUES ('Sam', 'victor', 'sam.victor@yopmail.com','sam.victor@yopmail.com','918800145461',ARRAY(SELECT id from main.auth_clients where client_id = 'portal_admin_webapp' ),(SELECT id from main.tenants where key = 'sf_health'));
INSERT INTO main.users(
	 first_name, last_name, username, email, phone, auth_client_ids,default_tenant_id)
	VALUES ('Johnathan', 'Willson', 'patient@yopmail.com','patient@yopmail.com','918800145461',ARRAY(SELECT id from main.auth_clients where client_id = 'patient_webapp' ),(SELECT id from main.tenants where key = 'sf_health'));


INSERT INTO main.user_tenants(
	user_id, tenant_id, role_id, status)
	VALUES ((select id from main.users where email = 'admin_sf@yopmail.com'), (select id from main.tenants where key = 'sf_health'),(SELECT id from main.roles where role_type = 2),1);
INSERT INTO main.user_tenants(
	user_id, tenant_id, role_id, status)
	VALUES ((select id from main.users where email = 'sam.victor@yopmail.com'), (select id from main.tenants where key = 'sf_health'),(SELECT id from main.roles where role_type = 1),1);
INSERT INTO main.user_tenants(
	user_id, tenant_id, role_id, status)
	VALUES ((select id from main.users where email = 'patient@yopmail.com'), (select id from main.tenants where key = 'sf_health'),(SELECT id from main.roles where role_type = 3),1);


INSERT INTO main.user_credentials(
	 user_id, auth_provider, password)
	VALUES ((select id from main.users where email = 'admin_sf@yopmail.com'),'internal', '$2b$10$t/WzM84dKTsR2WDjScY.Q.pRNNCMUYu4Hf7LR13.FDn9ApY4eG3wK');	
INSERT INTO main.user_credentials(
	 user_id, auth_provider, password)
	VALUES ((select id from main.users where email = 'sam.victor@yopmail.com'),'internal', '$2b$10$t/WzM84dKTsR2WDjScY.Q.pRNNCMUYu4Hf7LR13.FDn9ApY4eG3wK');	
INSERT INTO main.user_credentials(
	 user_id, auth_provider, password)
	VALUES ((select id from main.users where email = 'patient@yopmail.com'),'internal', '$2b$10$t/WzM84dKTsR2WDjScY.Q.pRNNCMUYu4Hf7LR13.FDn9ApY4eG3wK');	
