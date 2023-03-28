# Simple Parser Generator

## Introduction
This repository contains code and documentation for the Simple Parser Generator(SPG), which is a system for generating parsers.

### How it works
The Simple Parser Generator is a JavaScript object. It reads in a parser specification written in the H1 language as a string and converts the parser specification into an in-memory JavaScript object. This new JavaScript object has a method for parsing and can be used as the basis for generating other programming languages.

### Status
The Simple Parser Generator is in its second iteration, but it is still in an experimental phase. It has been tested and documented, and works, but has never been used to make a practical programming language.

Its architecture is well defined, and it is a very interesting and fairly well-documented system, but it may be better suited as a teaching tool for making compilers rather than for use as a production system.

## Installation

The SPG is contained a single JavaScript file, spg.js, that can be included using an import statement. spg.js contains several classes which can be imported using the import {class_1, class_2, class_3,...} syntax. The installation instructions for a NodeJS installation and for a browser installation is shown below.

### NodeJS
1. Make a new package.json. This can be done with the command npm init and pressing enter through all the prompts to use the default options.
2. Add or set the "type" attribute in the package.json file to the value module.
3. npm install git+https://github.com/raymond1/simple-parser-generator.git#v2

At this point, the simple parser generator should be installed. To use it, create a file called index.js and add the following line:
```
import {Generator} from 'simple-parser-generator'
```

### Browsers
1. Set up a web server that can serve HTML and JavaScript pages with the correct Content-Type headers.
2. Create a small website containing an index.html file and put it into the document root or public_html folder or other folder where your web server will be serving it from.
3. Clone the https://github.com/raymond1/simple-parser-generator#v2 repository.
4. Copy the file releases/spg.js into the folder that your web server is serving.
5. In your index.html file, add the following just before the end of your body tag:
```
    <script type="importmap">
      {
        "imports": {
          "simple-parser-generator":"./spg.js"
        }
      }
    </script>
    <script type="module">
import {Generator} from 'simple-parser-generator'
    </script>
```

## Tutorial

After going through the installation steps above, you will have access to a Generator object. The following tutorial sample program is a minimalistic JavaScript stub program that explains from a software development point of view how to generate a parser using the SPG on the NodeJS platform. Details on the conceptual model will be explained after describing the software workflow.

### Tutorial Sample Program
This sample program demonstrates the software workflow for making a simple parser and parsing an input string.
```
/* 1. Import the 'Generator' class used to convert a parser specification into an in-memory object capable of parsing.*/
import {Generator} from 'simple-parser-generator' 

/* 2. Instantiate a new Generator object. */
let generator = new Generator()

/* 3. Specify the specification for a parser. This is done using the H1 programming language, which is documented
in the file H1.md.*/
let specification = 
`string literal
 world`

/* 4. Generate a parser object by passing in the specification to the generator. This is done using the
generate parser method. */
let parser = generator.generateParser(specification)

/* 5. Create an input string to be fed into your parser. Conceptually, if your parser specification is for the 
CSV file format, then your input string would be a sample CSV file. If your parser specification describes what a valid
PDF file should be like, then your input string would be a possible PDF file. Here, the input string is 'world' because
the parser specification is simply to detect if a string starts with the text 'world'.*/
let inputString = 'world'

/* 6. Parse the input string and save the output in a variable(here, it is called 'output'). The 'parse' function is used to
start parsing the input. It will generate a stream of data tokens which can then be
interpreted to determine various attributes and features of the input string. The features that will be extracted will
depend on the specification initially passed into the generator in step 4.*/
let output = parser.parse(inputString)

/* 7. At this point, the output variable will contain some information. The exact format of this information is described in more detail later on, but it is basically an array of informational objects that can be inspected using a debugger. */
```

### Understanding the syntax of the H1 parser specification file format

The parser specification language used to describe a parser is called 'H1'. H1 is also called the "H1 file format", or the 'H1 language' and strings that are written in the H1 file format are called 'H1 files' or 'H1 strings'.

H1 files consists of lines of text. Each line of text can be either an instruction or a piece of data. Together, all of the lines in an H1 file create a description of an in-memory tree consisting of nodes which are connected to other nodes and sometimes have attributes associated with them. In other words, the H1 language is used to describe tree structures. These tree structures are passed into the V1 virtual machine to create a parser.

Here is a sample H1 file, which will be referred to as the F1 sample file or tutorial sample file:

```
sequence
 string literal
  adsfasdf
 multiple
  character class
   stvxa
```

To determine the conceptual tree structure that this represents, the overall procedure is as follows:

1. Use the H1 file to construct a tree called A1.
2. Extract a second tree from A1 whose nodes consist of only instruction nodes which each have 0 or more attributes. Call this tree the A2 tree.

For step 1, the leading spaces on each line stores the parent-child relationship information of the tree. The number of leading spaces before the first character on a line represents its depth in the tree. If a line has a depth of n, then it will be the child node of the first line that has a lower line number that has a depth of n-1.

Lines with n leading spaces will be children of the first line above it that have n-1 leading spaces. If a line has a greater depth than the line immediately above it, then it is a child of that line.

As an example, here is a table showing the relationship between the line number, depth and parent line for the sample H1 file from above:

Line number | Depth | Parent line number
----------------------------------------
1           | 0     | None
2           | 1     | 1
3           | 2     | 2
4           | 1     | 1
5           | 2     | 4
6           | 3     | 5

By convention, all nodes with a depth 0 are considered to be children of a theoretical node of depth -1, called the root node. This is just a convention so that you can say that all H1 files describe a single tree.

One the A1 tree has been constructed, the tree's nodes are divided into 'data nodes' and 'instruction nodes'. The A2 tree will absorb all data nodes, which have no children, into their parent nodes as attributes.This A2 tree is the conceptual model of the list of instructions that lie in memory.

Whether a node is a data node or an instruction node is context-sensitive and is determined using the algorithm described in the section [How to determine if a node is a data node or an instruction node](how-to-determine-if-a-node-is-a-data-node-or-an-instuction-node).

### How to determine if a node is a data node or an instuction node

If a node in the A1 tree has a depth of 0, then it should be an instruction node. For a node to be an instruction node means that the portion of the line in the H1 file that the A1 tree was derived that when stripped of leading spaces must contain an instruction node name. An instruction node name can be any one of the following:

1. character class
2. string literal
3. not
4. entire
5. sequence
6. or
7. and
8. multiple
9. optional
10. split
11. name
12. jump

The above list acts like keywords in other languages. Each instruction node, also called an instruction type, has a schema rule associated with it, meaning that the number of children it has is specified, and the order of its children has a specific meaning. The schema rule for each instruction type is given in the following table, called the V1 schema rule table:

Type of node    | number of children | Type of child node or nodes
-----------------------------------------------------
character class | 1                  | data
string literal  | 1                  | data
not             | 1                  | instruction
entire          | 1                  | instruction
sequence        | 1 or more          | instruction
or              | 2 or more          | instruction 
and             | 2 or more          | instruction
multiple        | 1                  | instruction
optional        | 1                  | instruction
split           | 1 or more          | instruction
name            | 2                  | First child is a data node. Second child is an instruction.
jump            | 1                  | data (must match with data from a name node)

Assuming that the A1 tree starts with an instruction node and follows the schema rules, it is possible to start from the first node in an A1 tree, and, using the above table, proceed to determine whether each node in the A1 tree is an instruction or a data node.

For example, in the tutorial sample file, line 1 is a sequence node. In the schema rule table, sequences have one or more children. The type of these children is 'instruction'. Therefore, all of the children of the sequence node will be interpreted to be instructions. That means lines 2 and 4 are instructions.

Line 2 is a string literal node. According to the schema rule table, string literal nodes have one data type child. Therefore, line 3, which is the child of line 2 must be a data line.

Line 4 is a 'multiple' type node. According to the schema rule table, 'multiple' type nodes have one instruction child. Therefore, line 4's child line, which is line 5, is also an instruction.

Line 5 is a 'character class' node. According to the schema rule table, 'character class' nodes have one child, which is a data type node. Therefore, line 6, which is the child of line 5, must be a data line.

Any correctly formatted H1 file that obeys the V1 schema rules can thus be divided into data and instruction nodes/lines.

### Constructing the A2 tree from the A1 tree
The A2 tree consists of all the instruction nodes of the A1 tree with any data nodes absorbed as attributes of their parent instruction node. For example, in the tutorial sample H1 file, line 3, which is a data node, is interpreted to be a property of line 2, which is its parent instruction node, and line 6, which is a data node, is also interpreted to be a property of the node created from line 5.

### Execution of the V1 virtual machine

After the H1 file has been transformed into an A2 tree in memory and designated as the program that the V1 virtual machine will run and the input string has been associated with the V1 virtual machine, the V1 virtual machine is ready to run.

Processing starts from the first A2 node, which is the first instruction node from the A1 tree. Depending on the type of node and the contents of the input string starting at the caret position, different actions will result.

Type of node    | Effect | 
-----------------------------------------------------
character class | 1                  | data
string literal  | 1                  | data
not             | 1                  | instruction
entire          | 1                  | instruction
sequence        | 1 or more          | instruction
or              | 2 or more          | instruction 
and             | 2 or more          | instruction
multiple        | 1                  | instruction
optional        | 1                  | instruction
split           | 1 or more          | instruction
name            | 2                  | First child is a data node. Second child is an instruction.
jump            | 1                  | data (must match with data from a name node)


It is this A2 tree that forms the conceptual model of an H1 file that follows the V1 schema rule table.


After the A1 tree has been created, and the nodes of the A1 tree have been divided into data and instruction nodes, the A2



1. The character class node has only one child node, and that child node must be


To determine whether a node from the A1 tree is a data node or an instruction node, it is first necessary to enumerate all the possible types of instruction nodes.

The complete list of instruction nodes is:


These instruction nodes are essentially equivalent to keywords used in other languages.

If

------------------------



Besides the leading spaces, each line in the H1 file format contains only one piece of information. A line may contain either the name of an instruction or data encoded as an H1-encoded string string. If a line contains an instruction, it is called an 'instruction node' or simply an 'instruction'. Whether a line is an instruction or a piece of data is context sensitive.

Interpretation starts from line 1 and then proceeds downwards. If a line is a non-terminal node, it means that it is a node that is capable of having one or more nodes as children. If a line is a terminal node, then it means that its only children will be data nodes.







Each instruction from this list is called a 'node name', a 'node type', a 'node object' or a 'node'. If a line is not a node, then it contains a piece of data. Data lines store string information in an encoding called 'M1-escaped format'. Each piece of data is the child of exactly one node object.

A node's children are called 'child elements' and can be either data or nodes.

In M1-escaped format, special characters are replaced with a replacement string. The table of special characters and their replacements is shown below:

character | replacement
-----------------------
(         | ENC(L)
)         | ENC(R)
,         | ENC(C)
(space)   | ENC(S)
(newline) | ENC(N)

In addition, any unicode character can be encoded by the string ENC(X), where X is a non-negative base 10 number. In the H1 language, strings are encoded as unicode strings.

Each node type requires 0, 1, or more child elements and influences the V1 virtual machine in different ways. The different nodes and their effects on the V1 virtual machine's execution is described in section [Programming a parser using the nodes of the H1 language](#programming-a-parser-using-the-nodes-of-the-h1-language).

### Programming a parser using the nodes of the H1 language.
Conceptually, the V1 virtual machine can be thought of as a kind of computer that takes in strings and outputs data objects called 'match nodes', also called 'output objects' or 'match objects'. The V1 virtual machine consists of the following components:

1. An input string
2. A caret pointing to a location on the input string
3. A true or false flag called matchFound
4. A string value called matchString
5. A set of instructions consisting of an H1 file that has been converted into an in-memory representation of its nodes. When an H1 file has been converted into its in-memory representation, that in-memory representation is called the 'image' of the H1 file.
6. A pointer in memory, called the program pointer that points to the current instruction.
7. A storage area in memory that stores output objects

### Initialization of a V2 virtual machine
1. The input string is basically the input data that will be fed to the V1 virtual machine. It is programmed as in comment 6 of the tutorial sample program.

2. The caret points initially to the first character of the input string.

3. The matchFound flag of the V1 virtual machine is initially set to false.

4. The string called matchString of the V1 virtual machine is initially set to the empty string, ''.

5. The set of instructions loaded into a V1 virtual machine can be set as in comments 3 and 4 from the tutorial sample program.

6. Initially, the program pointer points to the image of the first line from the H1 program loaded into memory.

7. Initially, the storage location in memory that stores output objects is empty. This is basically a collection or an array or list that begins empty.

### Execution of a the V2 virtual machine

After the V2 virtual machine has been initialized, it can execute the instructions passed to it using the input string as its data set. Execution proceeds as follows:




## API

The API documentation for pubicly available GeneratorGenerator methods is available in the [API documentation](documentation/api/index.html file).
let parser = Generator.setGrammar(s)
parser.parse(s)

# Status

The Simple Generator Generator is currently in its second generation and is undergoing testing and bug fixes. 

## Demo programs
 
Demo programs are available in the documentation/demos folder. The demos will probably work if you can serve the demos folder with the correct MIME types.

The nodejs_installation demos should work on NodeJS.