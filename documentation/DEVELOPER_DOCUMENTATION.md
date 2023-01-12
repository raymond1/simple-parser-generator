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

4)Set script permissions
Permissions:
In root, chmod u+x dev_script.sh.
In src/server, chmod u+x restart.sh.

5)Run:
```
npm run dev
```
from the root folder or the src/server folder.

# How to initialize hot loading
From the src/server directory, configure the permissions for restart.sh.
```
chmod a+x restart.sh
```

(also from within the src/server directory).


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
npm run dev
```

# M1 file format
[node name,adasfdasdf,adsfad,[adff ], [jump,asdfsf]]

Nodes are described by a left bracket [ and a matching right bracket ]. After the left bracket and before the right bracket, there is a node name.

Special characters: [ is encoded as ENC(L)
] is encoded as ENC(R)
, is encoded as ENC(C)

# H1 file format
rule list
 rule
  NUMBER
  multiple
   character class
    0123456789
   jump rule name

Reading of a file starts from top to bottom. The first line is the name of a node type. The valid node types are listed in the section titled "List of node types". Following a node type will be a comma, followed by one or more comma-separated pieces of information. The information in between the commas will be called nodes or properties. Nodes or properties are called nuggets.

# List of node types:
  'or',
  'and',
  'sequence',
  'not'
  'optional',
  'multiple'
  'character class'
  'string literal'
  'rule name',
  'rule'

# Launch checklist
1) package.json in demo folder should be updated to correct branch from "github:raymond1/simple-parser-generator#v2"
2) demos should work
3) documentation generation should be updated
4) demo files should be present and checked in despite being ignored in github