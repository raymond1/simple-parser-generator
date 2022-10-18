intermediate_and_root_bundle.crt: intermediate.crt root.crt
	cat intermediate.crt root.crt > intermediate_and_root_bundle.crt

server_bundle.crt: server.crt intermediate.crt root.crt
	cat server.crt intermediate.crt root.crt > server_bundle.crt

server.crt: server.csr sign_server_by_intermediate.conf intermediate_key.pem intermediate.crt
	openssl ca -in server.csr -out server.crt -config sign_server_by_intermediate.conf -keyfile intermediate_key.pem -outdir server_certificates -cert intermediate.crt -batch

server.csr: server_private_key.pem server_csr.conf
	openssl req -key server_private_key.pem -out server.csr -days 3650 -new -config server_csr.conf

ocsp_responder.crt: ocsp_responder.csr ocsp_responder_csr.conf root_key.pem root.crt
	openssl ca -in intermediate.csr -out intermediate.crt -config intermediate_csr.conf -keyfile root_key.pem -cert root.crt -outdir intermediate_authority_certs_dir -batch

ocsp_responder.csr: ocsp_responder.pem ocsp_responder_csr.conf root_key.pem root.crt
	openssl req -key ocsp_responder.pem -in root.crt -days 3651 -new -config ocsp_responder_csr.conf -out ocsp_responder.csr

intermediate.crt: intermediate.csr intermediate_csr.conf root_key.pem root.crt
	openssl ca -in intermediate.csr -out intermediate.crt -config intermediate_csr.conf -keyfile root_key.pem -cert root.crt -outdir intermediate_authority_certs_dir -batch

intermediate.csr: intermediate_key.pem root.crt intermediate_csr.conf
	openssl req -key intermediate_key.pem -in root.crt -days 3651 -new -config intermediate_csr.conf -out intermediate.csr

root.crt: root.csr root_ca.conf
	openssl ca -selfsign -keyfile root_key.pem -config root_ca.conf -out root.crt -in root.csr -outdir root_certificates -verbose -batch

root.csr: root_key.pem  root_csr.config
	openssl req -key root_key.pem -out root.csr -days 3650 -new -config root_csr.config

server_private_key.pem:
	openssl genpkey -outform pem -out server_private_key.pem -algorithm rsa

root_key.pem:
	openssl genpkey -outform pem -out root_key.pem -algorithm rsa

ocsp_responder.pem:
	openssl genpkey -outform pem -out ocsp_responder.pem -algorithm rsa

intermediate_key.pem:
	openssl genpkey -outform pem -out intermediate_key.pem -algorithm rsa

server_csr.conf:
	@echo "empty rule"

intermediate_csr.conf:
	@echo "empty rule"

clean_keys:
	rm *.pem

clean:
	rm database.txt*
	touch database.txt database.txt.attr
	rm -rf root_certificates
	mkdir root_certificates
	rm -f intermediate_database.txt
	touch intermediate_database.txt
	rm -rf intermediate_authority_certs_dir
	mkdir intermediate_authority_certs_dir
	rm -f root_key.pem intermediate_key.pem server_private_key.pem
	rm -f root.csr root.crt
	rm -f intermediate.csr
	rm -f intermediate.crt
	rm -f server.csr
	rm -f server.crt
	rm -f server_certificates/*.pem
	rm -f serial_numbers.txt*
	echo 01 > serial_numbers.txt
	rm -f intermediate_serial_numbers.txt
	echo 01 > intermediate_serial_numbers.txt

