.PHONY: all documentation

all:
	php vendor/raymond1/document-compiling-cms/generate_website.php src/make_generator.script
	cp -R documentation/demos ~/Desktop/programming/simple-https-server/public

documentation:
	npx jsdoc -c jsdoc.json
	rm -rf documentation/api
	mkdir documentation/api
	mv out/* documentation/api