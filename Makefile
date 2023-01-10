all:
	php vendor/raymond1/document-compiling-cms/generate_website.php src/script.txt

documentation: src/parser_generator.js
	npx jsdoc releases/parser_generator.js
	mv -p out/* documentation/api