# Simple Parser Generator

This repository contains code for the Simple Parser Generator(SPG), which is a parser generator that generates parsers that can run on a virtual machine designed for simplicity and portability. Its small size makes it a possible tool for teaching programming language creation and is extremely extensible and inherently understandable in its behaviour.

The repository includes documentation for the V1 virtual machine that the SPG runs on, the very useful H1 file format for describing parsers, and the M1 file format, which is used internally in the workings of the machine. 

Currently, the Simple Parser Generator is in its second generation. It is smaller, more portable, and the H1 file format is an improvement over the original input language for the parser generator. It is hoped that this version may hint at some possibilities of even better parser generators that may be possible.

As a side note, the H1 language is based on a very interesting concept that in some ways is simpler than JSON and can be used as a potential alternative.

# How it works
The Simple Parser Generator is a JavaScript object. It reads in a parser specification written in the H1 language as a string and converts the parser specification into an in-memory JavaScript object. This new JavaScript object has a method for parsing, meaning that it can read in a string representing a programming language containing hierachical constructs, analyze it and generate a stream of output information objects describing the various components of the programming language.

The H1 language is described here: [H1.md](documentation/H1.md). The output The string content from an H1 file is read into memory, parsed, and converted into a collection of micro-parsers that are put into memory, configured and connected with each other, ready to take in input to produce output tokens.

# Installation
The instructions below are just one method of installation. The SPG is simply a JavaScript file you can include in your project. Thus, you can modify the instructions to suit your needs. The following instructions are simply meant as a guide.

## NodeJS
1. Make a new package.json. This can be done with the command npm init and pressing enter through all the prompts to use the default options.
2. Add or set the "type" attribute in the package.json file to the value module.
3. npm install git+https://github.com/raymond1/simple-parser-generator.git#v2

At this point, the simple parser generator should be installed. To use it, create a file called index.js and add the following line:
```
import {Generator} from 'simple-parser-generator'
```

## Installation for Browsers
1. Set up a web server that can serve HTML and JS pages with the correct Content-Type headers.
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

After going through the installation steps above, you will have access to a Generator object. The following short tutorial demonstrates how to generate a parser using the SPG on the NodeJS platform. The steps below assume you have already run the NodeJS installation steps from above.

### 0. Import the Generator class used to generate parsers
Create a new index.js file. Add the following line to it to bring the 'Generator' JavaScript class into your namespace:
```
import {Generator} from 'simple-parser-generator'
```

### 1. Create the parser generator.
After the import line, the parser generator is instantiated with the line 
```
let generator = new Generator()
```

### 2. Set the parser specification.

A parser specification is a string specified in the H1 file format that describes a parser. See the file H1.md in this repository for more information on the H1 file format.

For this tutorial, use the following parser specification:

```
let grammar = `sequence
 character class
  ehlo
 string literal
  world`
```
This specification that makes strings starting with any number of characters from the set {e,h,l,o} followed by the string 'world' a valid program. Example valid programs for this input grammar will Example matches will include 'hworld', 'heworldzzzzzz', 'helworld', 'hhhhhhhhhhhhhhhhworld' and 'helloworld'.

### 3. Generate a parser that translates your input specification from a string format into an in-memory format
```
let parser = generator.generateParser(grammar)
```

The generator.generateParser function takes in a string representation of a parser in H1 format and returns a working parser object.

### 4. Generate a test program for the parser you generated.

```
let testString = 'helloworld'
```

### 5. Feed the test program into your parser.
```
let output = parser.parse(testString)
```

This line will run the 'parse' function from the parser object, which takes in testString as input and generates a tree as the output. The variable 'output' will store the value of the tree produced from the 'parse' function, which will contain information on how the parser analyzed the input string at each step of parsing.

### 6. Display the output from the parser in a text format
A built-in tool for interpreting the output tree generated by a parser is provided in the TreeViewer class. To use it, first import the class. Do this by adding the following line to the top of your file:

```
import {TreeViewer} from 'simple-parser-generator'
```

Then, at the bottom of your file, instantiate a TreeViewer object and run the display function to display a text interpretaton of the output tree. The first parameter to the 'display' function should be 'text'. The second parameter should be the output object you generated from your parser, which should be the ```output``` variable from step 5.

```
let treeViewer = new TreeViewer()
treeViewer.display('text', output)
```

The completed program is shown below:
```
import {TreeViewer} from 'simple-parser-generator'
import {Generator} from 'simple-parser-generator'

let generator = new Generator()

let grammar = `sequence
 character class
  elho
 string literal
  world`

let parser = generator.generateParser(grammar)

let testString = 'helloworld'

let output = parser.parse(testString)

let treeViewer = new TreeViewer()
treeViewer.display('text', output)
```

### Analyzing the output

From the command prompt, run the index.js program you created:

```node index.js```

You will get an output that looks similar to the following:
```
*****BEGIN*sequence*0
 *****BEGIN*character class*1
 matchString:hello
 parent:2
 depth:1
 inputString:helloworld
 type:character class
 id:0
 serial:0
 *************END*************1
 *****BEGIN*string literal*1
 matchString:world
 parent:2
 depth:1
 inputString:world
 type:string literal
 id:1
 serial:1
 string:world
 *************END*************1
matchString:helloworld
parent:(null)
depth:0
inputString:helloworld
type:sequence
id:2
serial:2
*************END*************0
```

Each node starts with a number of asterisks followed by the string 'BEGIN', followed by another star, and then the node name and another star, and then the depth of the node. Each node ends with a series of asterisks followed by the string 'END' followed by some asterisks, followed by the node depth. The node depth is also represented by the number of leading spaces on a line.

In between the *****BEGIN**** and ********END******** lines, you will see some properties of each node. matchString is the string that is mached against the input string. inputString is the input string. type is the type of a node. Depth is the depth of the node. id is a unique number assigned to each node. Serial is the order that a node was detected in during parsing(the first node has a serial value of 1, the second node detected has a value of 2, et. cetera et. cetera). Parent is the parent of the node that was detected.

An alternative to using the TreeViewer is to use a debugger.

## API

The API documentation for pubicly available GeneratorGenerator methods is available in the [API documentation](documentation/api/index.html file).
let parser = Generator.setGrammar(s)
parser.parse(s)

# Status

The Simple Generator Generator is currently in its second generation and is undergoing testing and bug fixes. 

## Demo programs
 
Demo programs are available in the documentation/demos folder. The demos will probably work if you can serve the demos folder with the correct MIME types.

The nodejs_installation demos should work on NodeJS.