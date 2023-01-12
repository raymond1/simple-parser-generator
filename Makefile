.PHONY: all documentation

all:
	php vendor/raymond1/document-compiling-cms/generate_website.php src/make_generator.script

documentation:
	npx jsdoc releases/generator.js
	rm -rf documentation/api
	mkdir documentation/api
	mv out/* documentation/api