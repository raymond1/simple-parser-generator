.PHONY: all documentation

all:
	php vendor/raymond1/document-compiling-cms/generate_website.php src/make_generator.script
	#Do not add extra commands to this Makefile. Instead, modify make_generator.script to execute a command file

documentation:
	npx jsdoc -c jsdoc.json
	rm -rf documentation/api
	mkdir documentation/api
	mv out/* documentation/api