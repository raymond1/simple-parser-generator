# Development set up
This file contains information about the internal organization of this piece of software.

To develop, do the following:
1. Install php so that it is accessible from the command line.
2. Install composer.
3. Run `composer install`.

This will install the document-compiling-cms composer package from github (https://github.com/raymond1/document-compiling-cms).

4. The document compiling cms is able to cobble pieces of files together.

To use this tool, run the following command:

`php vendor/raymond1/document-compiling-cms/generate_website.php src/script.txt`

This will trigger the "compilation" process.

5. Set script permissions
Permissions:
In root, chmod u+x dev_script.sh.
In src/server, chmod u+x restart.sh.

6. Run:
```
npm run dev
```
from the root folder.

# Building the demo programs
From the root folder, type in Make to trigger the Makefile action.

# How to update the generate_website.php script
After making changes to the script, go into the document-compiling-cms folder, add and commit your changes and then use the command:
```
git push origin <new tag version>
```

Then, from the simple-parser-generator folder, perform a
```
composer update
```

# Launch checklist
1) package.json in demo folder should be updated to correct branch from "github:raymond1/simple-parser-generator"
2) demos should work
3) documentation generation should be updated
4) demo files should be present

# How to generate the JSDoc documentation
npx jsdoc -c jsdoc.json -d documentation/api
