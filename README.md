# Simple Parser Generator

The Simple Parser Generator is a JavaScript parser generator that allows the use of several input languages to describe a parser. The parsers generated are serializable and can be ported to any platform that implements the V1 virtual machine. This portability is accomplished by using a micro-parser architecture where multiple small and simple parsers are connected together to generate a larger, more complex parser.

# How it works

The Simple Parser Generator takes in a parser specification in either the M1, H1, or H2 languages(the M1, H1 and H2 languages are specified in the documentation folder, in the files [H1.md](documentation/H1.md), [M1.md](documentation/M1.md), and [H2.md](documentation/H2.md)). These files are read into memory, parsed, and converted into a collection of micro-parsers that are put into memory, ready to take an input string and convert it into tokens.

Because these micro-parsers are portable and can be implemented in basically any sufficiently powerful programming language, they are essentially a type of virtual machine. This means that any programming language that implements all the micro-parsers could potentially operate the same parser loaded into memory from a different language. The M1 file format is meant to be a portable machine format still readable by humans that can serialize parsers written in one language and allow them to be deserialized and loaded into memory using another programming language that implements all the micro-parsers used in the first language.

The collection of micro-parsers that need to be implemented are collectively called the V1 virtual machine.

# Installation and testing

## NodeJS
1. Make a new package.json file.
2. Set the type attribute in the package.json file to module.
3. npm install git+https://github.com/raymond1/simple-parser-generator.git
4. Create a file called index.js and add the following line
```
import Generator from 'simple-parser-generator'
```
5. Testing (Optional)
After the import line , add the lines
```
let parser = new Generator()
parser.installCheck()
```
6. Activate the index.js file from NodeJS with the command:
```
node index.js
```

If the software was successfully installed, you should see the message: 'Simple Generator Generator is installed.' 

## Browsers
1. Set up a web server that can serve HTML and JS pages with the correct Content-Type headers.
2. Create a small website containing an index.html file and put it into the document root or public_html folder or other folder where your web server will be serving it from.
3. Clone the https://github.com/raymond1/simple-parser-generator repository.
4. Copy the file releases/parser.js into the folder that your web server is serving.
5. In your index.html file, add the following just before the end of your body tag:
```
    <script type="importmap">
      {
        "imports": {
          "simple-parser-generator":"./parser.js"
        }
      }
    </script>
    <script type="module">
import Generator from 'simple-parser-generator'
let parser = new Generator()
parser.installCheck()
    </script>
```
6. Testing (Optional)
Access the index.html url to activate the script it references.

If the software was successfully installed, you should see the following message: 'Simple Generator Generator is installed.' This message should show up in Dev Tools or another similar console-enabled debugging browser-based tool.

## Tutorial

After going through the installation steps above, you will have access to a Generator object. The following short tutorial demonstrates how a parser is generated using the Generator object.

### 1. Creating the parser generator.
After the import line, the parser generator is instantiated with the line 
```
let parser = new Generator()
```

### 2. Setting the input grammar.

The Generator Generator(PG) object requires a parsing specification, or input grammar in order to differentiate between valid and invalid programs. There are three input languages that can currently be used: H2, H1 and M1.


....





After installation has been complete from the installation steps above, you will see the following line:
```
let parser = new Generator()
```

After this line, you can add JavaScript code
line in the install
Imagine that you have an extremely simple web page set up on a web server. 

Imagine that you have NodeJS and NPM installed on your computer. Create a new folder and call it A. Then, enter into the A directory. Then, copy the file releases/parser.js into that directory. Then, create the file index.js.

In

## API

The API documentation for pubicly available GeneratorGenerator methods is available in the [API documentation](documentation/api/index.html file).
let parser = GeneratorGenerator.setGrammar(s)
let parser = GeneratorGenerator.H1Import(s)
GeneratorGenerator.H2Import(s)
GeneratorGenerator.M1Import(s)

let parser = H1Import(s)

export {H1Import}
parser.parse(s)




# Details on the different file formats

H1 is meant to be a human-readable format, similar to JSON, that has a relatively simple parser. M1 is meant to be a machine-readable text format used for serializing parsers generated by the Simple Generator Generator. H2 is a human-friendly file format meant to be easier to use than H1, but because it is more complicated, it is also buggier and less portable, although it is more powerful and expressive than either H1 or M2.

# Description of the V1 virtual machine and its micro-parsers

## Sequence

A 'sequence' micro-parser is associated with one or more child micro-parsers. When fed with an input string, it produces a true result if each of its child micro-parsers produces a true result when the micro-parsers are tested in sequence.

Matching starts at index 0 for the input string, and is incremented by the length of a successful match from a child node.

## Or
An 'or' micro-parser is associated with one or more child micro-parsers. It produces a true result if any of its child micro-parsers produces a true result.

## Multiple
## Not
## Optional
## Character Class
## String Literal
## Rule Name
## Rule
## Rule List

# Status

The Simple Generator Generator is currently in its second generation and is undergoing testing and bug fixes. 

## Demo programs
 
To see how to use the parser, look in the folder called demos/calculator and open the file 'calculator.html'. It shows an example of the parser in action. You may also look at a live demo <a href=https://raymondleon.ca/portfolio/simple-parser-generator/demos/calculator/step3/calculator.html>here</a>.

To use the parser generator in your html file, simply put the parser.js file in the same directory as your html file and then refer to it in a script tag. After you have connected the script to your program, you will be able to use the parser in your JavaScript code by creating a new Generator object.

There is a nodejs web server that is provided as part of this code that can be used to test the simple parser generator. To operate it, do the following:

1)Install nodejs
2)Go into the src/server directory and run node index. You may have to install a few dependencies first using npm install

The basic usage of this object is shown in the section "Summary of typical usage".

## Summary of typical usage:

1. First, create the generic parser object. At this point, the parser is dumb and doesn't do anything.
```
let parser = new Generator()
```

2. Create a parsing specification consisting of rules that teach the parser what is a valid program and what is an invalid program
```
let parsingSpecification = 

`
A_OR_B_STRING = MULTIPLE[A_OR_B_CHARACTERS]

A_OR_B_CHARACTERS = ['a','b']
`
```
3. Pass the teaching grammar into your parser
```
parser.setGrammar(parsingSpecification)
```
4. Specify a string containing a program written in the language defined by the parsing specification.
```
let programString = 'aababbaaaababaababaaabaabaababababa'
```
5. Feed the program that you have written into your parser to see if it is a valid program or not
```
let outputFromParsing = parser.parse(programString)
```
6. outputFromParsing will be a tree. To see the contents of the tree, you can instantiate a new instance of the TreeViewer helper class that outputs the contents of trees.

To instantiate the class, pass in the output from the parser to the constructor
```
let treeviewer = new TreeViewer(outputFromParsing)
```
7. Once the TreeViewer has been instantiated, you will be able to obtain a string that details the output from the parse tree by using the getOutputString function
let outputString = treeviewer.getOutputString(outputFromParsing)

8. Display the contents of the output string in your console
console.log(outputString)



Build instructions:
Go into the code directory and type in "make" from the terminal. This will copy parser.js into the releases folder and create the parser_commonjs.js files(for CommonJS require('simple-parser-generator') type usage) as well as parser_module.js for the newer "import Generator from './simple-parser-generator'" type import statements.

Simple Language:

A program specified using the Simple program specification language consists of a series of rules. Each rule takes on the following form of a rule name followed by the '=' sign, followed by a matching pattern:

RULE_NAME = PATTERN[...pattern parameters...]

Here is an example rule:

BINARY_STRING = CHARACTER_CLASS['01']

This rule specifies that a BINARY_STRING consists of strings that contain only the characters '0' and '1'. If you pass in the above specification to the simple parser generator, you will get a parser, which is an object that understands whether a given input string is a valid program, according to the Simple program specification you used to create the parser. Then, you can pass in strings to the parser, and it will tell you whether or not the string that was passed in is a valid program or an invalid program.

There are some examples of programs inside the demos folder. The patterns that can be used for the Simple program specification are described below:


This software is still in its early phases, and I am aware of some bugs and problems in the documentation but it has been released into the wild because I feel it has reached a point where it could be very useful. 

If you have trouble using my software, you can send me an email at

raymondleon@raymondleon.ca

# Escape Sequences
You can use S_QUOTE, L_SQUARE_BRACKET, R_SQUARE_BRACKET and COMMA to match the following characters, respectively: ' [ ] ,

# Output Tree and Manipulation Functions

After the output tree has been generated, the following functions inside tree.js are available to manipulate the tree: removeItemAndHeal, pruneNodes, cutNodes, getRuleMatchesOnly, resetDepth, treeInvert, clone.

You can also use the objects DOMTreeViewer to view how the parser interprets your grammar and TreeViewer to see the structure of your output nodes. See the calculated demo, step 3 for more information.

# Bugs
The damned thing doesn't currently work!
