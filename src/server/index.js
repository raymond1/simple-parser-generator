const https = require("https");
const express = require("express");
const app = express();

// Requiring file system to use local files
const fs = require("fs");
const port = 443


app.use(express.static('../../demos/'));


const options = {
key: fs.readFileSync("server_private_key.pem"),
cert: fs.readFileSync("server_bundle.crt"),
};

// Creating https server by passing
// options and app object
https.createServer(options, app)
.listen(port, function (req, res) {
console.log("Server started at port " + port);
});



//https://www.rfc-editor.org/rfc/rfc2585
//https://www.rfc-editor.org/rfc/rfc3986 (URI)
//https://www.rfc-editor.org/rfc/rfc5280#section-4.2.1.12 (CRLs)
//https://datatracker.ietf.org/doc/html/rfc6960(OCSP)
//https://datatracker.ietf.org/doc/html/rfc8954(OCSP nonce extension)
//https://datatracker.ietf.org/doc/html/rfc6961
//https://datatracker.ietf.org/doc/html/rfc6066
//Instructions
//RFC2560
//RFC 2560, X.509 Internet Public Key Infrastructure Online Certificate Status Protocol - OCSP
//

//List of files:
//root_private_key.pem --contains the private key of the root authority
//intermediate_certificate_authority_private_key.pem
//server_private_key.pem
//root_csr.config
//root.csr
//root_ca.conf
//root.crt
//root_certificates (directory)
//intermediate_csr.conf
//intermediate.csr
//intermediate.crt
//sign_intermediate_by_root.conf
//intermediate_authority_certs_dir (directory)
//server_to_intermediate.csr
//server_to_intermediate_csr.config
//server.crt
//sign_server_by_intermediate.conf
//server_certificates (directory)
//database.txt
//database.txt.attr

//OpenSSL requires all certificates to be inside one concatenated certificate in order to successfully verify...

//https://raymii.org/s/articles/OpenSSL_Manually_Verify_a_certificate_against_an_OCSP.html

// Error Loading extension section x509_extensions
// 4533081772:error:0EFFF06C:configuration file routines:CRYPTO_internal:no value:/AppleInternal/Library/BuildRoots/a0876c02-1788-11ed-b9c4-96898e02b808/Library/Caches/com.apple.xbs/Sources/libressl/libressl-2.8/crypto/conf/conf_lib.c:322:group= name=unique_subject
// 4533081772:error:0EFFF06C:configuration file routines:CRYPTO_internal:no value:/AppleInternal/Library/BuildRoots/a0876c02-1788-11ed-b9c4-96898e02b808/Library/Caches/com.apple.xbs/Sources/libressl/libressl-2.8/crypto/conf/conf_lib.c:322:group=Raymond Leon name=email_in_dn
// 4533081772:error:22FFF082:X509 V3 routines:func(4095):unknown extension name:/AppleInternal/Library/BuildRoots/a0876c02-1788-11ed-b9c4-96898e02b808/Library/Caches/com.apple.xbs/Sources/libressl/libressl-2.8/crypto/x509v3/v3_conf.c:133:
// 4533081772:error:22FFF080:X509 V3 routines:func(4095):error in extension:/AppleInternal/Library/BuildRoots/a0876c02-1788-11ed-b9c4-96898e02b808/Library/Caches/com.apple.xbs/Sources/libressl/libressl-2.8/crypto/x509v3/v3_conf.c:100:name=basicContraints, value=CA:TRUE


//openssl genpkey -outform pem -out root_private_key.pem -algorithm rsa
//openssl genpkey -outform pem -out intermediate_certificate_authority_private_key.pem -algorithm rsa
//openssl genpkey -outform pem -out server_private_key.pem -algorithm rsa

//Make root certificate signing request
//openssl req -key root_private_key.pem -out root.csr -days 3650 -new -config root_csr.config
//openssl ca -selfsign -keyfile root_private_key.pem -config root_ca.conf -out root.crt -in root.csr -outdir root_certificates -verbose

//request a certificate from the root authority for the intermediate certificate authority
//openssl req -key intermediate_certificate_authority_private_key.pem -in root.crt -days 3651 -new -config intermediate_csr.conf -out intermediate.csr

//Create a certificate for the intermediate authority by signing the request with the root authority.
//openssl ca -in intermediate.csr -out intermediate.crt -config sign_intermediate_by_root.conf -keyfile root_private_key.pem -cert root.crt -outdir intermediate_authority_certs_dir

//Create a new signing request from the server to the intermediate authority.
//openssl req -key server_private_key.pem -out server_to_intermediate.csr -days 3650 -new -config server_to_intermediate_csr.config

//Sign the request and generate a new certificate
//openssl ca -in server_to_intermediate.csr -out server.crt -config sign_server_by_intermediate.conf -keyfile intermediate_certificate_authority_private_key.pem -outdir server_certificates -cert intermediate.crt

//https://www.ssl.com/blogs/398-day-browser-limit-for-ssl-tls-certificates-begins-september-1-2020/
//https://www.denetarik.com/2021/01/decoding-ocsp-get-requests.html
//openssl ocsp -reqin decoded_nginx_request.txt -req_text
//https://www.itu.int/rec/T-REC-X.690/
//In the appendix of https://www.rfc-editor.org/rfc/rfc6960#page-11, there is specified some information on how to 
//(for testing) openssl s_client -connect simple.dev:443 -tlsextdebug -status
//https://www.digicert.com/kb/ssl-support/nginx-enable-ocsp-stapling-on-server.htm
//https://www.rfc-editor.org/rfc/rfc5019
//https://www.rfc-editor.org/rfc/rfc3280
//https://stackoverflow.com/questions/41701860/why-do-i-get-verify-errorunable-to-get-local-issuer-certificate-when-i-run-open
//https://github.com/cossacklabs/blogposts-examples/tree/main/golang-ocsp-crl
//OK! openssl ocsp -issuer intermediate.crt -cert server.crt -url http://certificate.authority:81 -CAfile server_bundle.crt
//openssl ocsp -index 'intermediate_authority_certs_dir/index.txt' -CA intermediate_and_root_bundle.crt -rsigner intermediate.crt -rkey intermediate_certificate_authority_private_key.pem -port 81 -text -out ocsp_log.txt

//https://bobcares.com/blog/enable-ocsp-stapling-on-nginx/
//https://www.systutorials.com/docs/linux/man/5ssl-x509v3_config/
//https://access.redhat.com/documentation/en-us/red_hat_certificate_system/9/html/administration_guide/standard_x.509_v3_certificate_extensions
//https://www.openssl.org/docs/man3.0/man1/openssl-req.html (extensions are not copied)
//https://www.openssl.org/docs/man1.0.2/man5/x509v3_config.html
//x509_extensions = section_name

//Also need to add the root certificate to the keychain
//https://support.mozilla.org/en-US/kb/setting-certificate-authorities-firefox
//v3 information https://www.rfc-editor.org/rfc/rfc5280
//Error code: MOZILLA_PKIX_ERROR_V1_CERT_USED_AS_CA (in Firefox error)

//https://www.computerworld.com/article/3173616/the-sha1-hash-function-is-now-completely-unsafe.html
//md5 is also not secure...
//https://sslhow.com/x509-certificate-routines-x509_check_private_key-key-values-mismatch
//https://www.ibm.com/docs/en/ibm-mq/7.5?topic=ssl-overview-tls-handshake


//echo | openssl s_client -showcerts -servername google.com -connect google.com:443 2>/dev/null | openssl x509 -inform pem

//https://www.gnu.org/software/bash/manual/html_node/Process-Substitution.html
//https://gitlab.com/wireshark/wireshark/-/wikis/TLS
//wireshark filter tls.handshake.type eq 11
//Will first need to clear the saved SSL state: Go to "History" -> "Clear Recent History..." and then select "Active Logins" and click "Clear Now".
//https://community.fortinet.com/t5/FortiGate/Technical-Tip-Extracting-certificates-from-SSL-TLS-handshake/ta-p/221235

//
//https://www.comparitech.com/net-admin/decrypt-ssl-with-wireshark/

//OpenSSL Creating a Certificate Authority (CA) https://node-security.com/posts/openssl-creating-a-ca/
/*
From https://www.openssl.org/docs/man3.0/man1/openssl-ca.html:
Note that there are also very lean ways of generating certificates: the req and x509 commands can be used for directly creating certificates. See openssl-req(1) and openssl-x509(1) for details. */





//openssl x509

//https://www.openssl.org/docs/manmaster/man5/config.html




//https://datatracker.ietf.org/doc/rfc2986/
//https://www.oss.com/asn1/resources/asn1-made-simple/encoding-rules.html
//https://www.itu.int/rec/T-REC-X.690/
//https://access.redhat.com/documentation/en-us/red_hat_certificate_system/9/html/administration_guide/standard_x.509_v3_certificate_extensions
//https://learn.microsoft.com/en-us/azure/iot-hub/tutorial-x509-certificates (Lists available fields)

//PKCS10 = name of standard for making certificate signing requests
//x509 = name of standard for the certificates

/*
A certification request consists of a distinguished name, a public key,
   and optionally a set of attributes, collectively signed by the entity
   requesting certification.
 */


//https://www.openssl.org/docs/man1.0.2/man1/req.html (Includes information on the request section requirement)