# Development set up
This file contains information about the internal organization of this piece of software.

To develop, do the following:
1)Install php, with the command line executable.
2)Install composer.
3)composer install

This will install the document-compiling-cms composer package from github (https://github.com/raymond1/document-compiling-cms).

This tool is able to cobble pieces of files together.

To use this tool, do the following:

php vendor/raymond1/document-compiling-cms/generate_website.php src/script.txt

This will trigger the "compilation" process.

# How to configure and run Nodemon
```
chmod a+x src/server/restart.sh
```

# Concepts
Regular nodes(class name Node) are the in-memory nodes that govern how parsing is performed.
Match nodes(class name MatchNode) are the nodes that are emitted by the parser when it is parsing.
Linear parsing rows are a mapping from a construct type to a string match function and a function that emits regular nodes.


Step 1: string representation of grammar is fed and transformed into an in-memory format.

Memory                             
[Tree representation of parsing algorithm. Uses regular nodes]


Step 2:
The in-memory format of the parser executes with a string parameter. The output is a series of match nodes.

Disk
[test program]

# How to update the generate_webite.php script
After making changes to the script, go into the document-compiling-cms folder, add and commit your changes and then use the command:
```
git push origin 1.0.10
```
(replace 1.0.10 with your new tag version.)

Then, from the simple-parser-generator folder, perform a
```
composer update
```.

# How to start the server
Go into the src/server directory.
```
npm start
```