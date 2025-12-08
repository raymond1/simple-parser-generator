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

5. Alternatively, you can type in Make.

6.
# IMPORTANT: copydemofilestowebroot.sh
You will need to update the copydemofilestowebroot.sh file to copy files to your webroot.

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

# Directory structure

The documentation folder contains demos in it. If you type in make, you will put a copy of the latest compiled spg.js into demos.

# Coding style

External functions start with a capital. Internal functions, such as helper functions, start with a lowercase letter. (See tree.js for examples)