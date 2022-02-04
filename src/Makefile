all:
	cat parser_fragment.js > ../releases/parser.js
	cat tree.js >> ../releases/parser.js
	cat strings.js >> ../releases/parser.js
	cat tree_viewer.js >> ../releases/parser.js

	cp -f ../releases/parser.js ../releases/parser_commonjs.js
	cat commonjs_ending.txt >> ../releases/parser_commonjs.js
	cp -f ../releases/parser.js ../releases/parser_module.js
	cat module_ending.txt >> ../releases/parser_module.js

