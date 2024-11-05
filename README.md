# Simple Parser Generator

## Introduction
The Simple Parser Generator(SPG) is a system for generating parsers. Usually, people use parsers to answer questions such as: 'Is the following string valid?', 'Is the string S a valid program?', 'Inside of a program, where are the functions? Where the classes? Where are the statements?', 'If the syntax for a valid string requires that it includes components A, B and C, then where do the components A,B and C begin and end if I pass in the string S?' The answers to these questions allows people to build programming languages and file formats for expressing algorithms to a computer or to express structured data.

This README is meant to be a tutorial to provide enough information for someone to start using the SPG. It includes details about installation, concepts, the internal language H1 for describing parsers, examples, and details on the overall operation. 

## Installation

The executable portion of the code is located in the file releases/spg.js, which can be obtained by cloning the github repository located at https://github.com/raymond1/simple-parser-generator/. The installation instructions for a NodeJS installation and for a browser installation are shown below.

### NodeJS installation instructions using NPM
1. Make a new package.json file. This can be done with the command ```npm init``` and pressing enter through all the prompts to use the default options.
2. Add or set the "type" attribute in the package.json file to the value "module".
3. In a terminal, run the command

```
npm install git+https://github.com/raymond1/simple-parser-generator.git
```

4. At this point, the simple parser generator should be installed. To use it, create a file called index.js and use an import statement. For example:

```
import {ParserGenerator} from 'simple-parser-generator'
```

### Browser based installation instructions
1. Set up a web server that can serve HTML and JavaScript pages with the correct Content-Type headers.
2. Create a small website containing an index.html file and put it into the document root or public_html folder or other folder where your web server will be serving.
3. Clone the https://github.com/raymond1/simple-parser-generator repository.
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
import {ParserGenerator} from 'simple-parser-generator'
    </script>
```

## Basic usage
The typical usage of the SPG looks as follows:

```
import {ParserGenerator, TreeViewer} from 'simple-parser-generator'
let parserGenerator = new ParserGenerator()
let parserSpecification = 
`string literal
 Hello, world.`

let parser = parserGenerator.generateParser(parserSpecification)

let inputString = 'Hello, world.'
let output = parser.parse(inputString)
console.log(output)
```

Explanation:

1. The line

```import {ParserGenerator, TreeViewer} from 'simple-parser-generator'```

imports the ParserGenerator and TreeViewer classes. The ParserGenerator class is used to generate parsers. The TreeViewer class is sometimes helpful for viewing the output 
2. The line 

```let parserGenerator = new ParserGenerator()```

instantiates an instance of the ParserGenerator()

3. The statement

```let parserSpecification = 
`string literal
 world`
```

sets a string value for the variable 'parserSpecification'. This string variable is actually a program written using the H1 syntax for the SPG API. Understanding the details of H1 syntax and how to use it to control the SPG using the SPG API is a core part of using the SPG.

4. The statement

```let parser = parserGenerator.generateParser(specification)```

use the parser generator to create a new parser pased off of the 'parserSpecification' variable that was passed in and saves it into the 'parser' variable.

5. The statement

```let inputString = 'world'```

sets the input string that will be sent to the parser.

6. The statement

```let output = parser.parse(inputString)```

uses the parser to parse the input string. Its output is a tree structure filled with information about the parsing process. Further processing can be done at this point to extract parsing details about the input string. The exact structure and nature of this output tree structure will be explained later on in this tutorial, but the SPG's work has essentially been completed at this point in the program's execution.


The best way to view the structure of the output object,



## Understanding How the Simple Parser Generator operates
The Simple Parser Generator has two stages of operation. In stage 1, the SPG will take in a string input in the form of an H1 specification describing a parser. The generated parser will then be used in stage 2, which is the runtime operation stage.

### Stage 1 - Parser Generation
To initiate the parser generation stage, the ParserGenerator class's 'generateParser' method needs to be called with an H1 specification as the input. The return value of the ParserGenerator.generateParser method will be a parser that can be used in stage 2.

### Stage 2 - Runtime Operation
The parser generated in stage 1 has a 'parse' function which takes in an input string, which is the string for which parsing is required. The return value from the parse function will be a series of parsing output objects which will hold information on where different syntactical components are located in the input string.

## How to specify a parser


## Mini-parsers

A mini-parser is a function that takes in a string as input and outputs a string and parsed information as output. There is a fixed set of mini-parsers provided by the SPG, and they function as lego-blocks. Complex parsers are all built from these simpler mini-parsers by connecting them into a tree hierarchy. When a root mini-parser is invoked, it can invoke its children mini-parsers in order to leverage their abilities to perform the parsing operations that it requires to do its own task. Parsing information generated by child parsers are passed on to the parent, and this collection of parsing information ultimately forms the output of the parser.

The behaviour of all of the available mini-parsers is explained in the API section below, but it is useful to first consider an example before reading the API section because there is some terminology that makes understanding these parsers simpler to explain. 

### Example parser formed from mini-parsers.

Let's say you have an input string that comes from a human being, and you want to determine whether or not it starts with the string 'A' followed by the string 'B'. There are multiple ways to do this, but the method illustrated below will give a good idea of how the SPG works.

Using H1 notation, you could accomplish the task like this:

```
sequence
 string literal
  A
 string literal
  B
```

Here, this H1 specification is specifying that the root mini-parser is of type 'sequence'. The sequence mini-parser in turn has two children which are both 'string literal' mini-parsers. The first child mini-parser has a child text 'A', meaning that it has been configured to detect the string literal 'A'. The second child mini-parser of the sequence node has child text 'B', which configures it to detect the string literal 'B'.

Mini-parsers are sometimes called 'nodes' because of the tree-like structure they get arranged in. The above H1 file gets turned into the following tree of mini-parsers:

```
sequence
|
|--string literal
|
|--string literal
```

The first string literal child is configured to detect 'A'. The second is configured to detect 'B', but that is not shown here because those pieces of text are not mini-parsers. Those pieces of text are only used during the parser generation stage to configure a mini-parser for its run-time operation.

## Terminology

'matching function':

Conceptually, each mini-parser has a matching function which is executed when an input string is passed in. This matching function determines takes in the input string and produces and object containing syntactical information. Internally, the matching function is implemented in JavaScript by implementing a mini-parser's 'parse' function. Note: there is no mini-parser class in the code. Instead, there is a Node class.

'match string'/'output string':

When a mini-parser applies its matching function to the input string and an output object is produced, the property of the output object with the key 'matchString' refers to the concept of a so-called 'match string', which is the portion of the input string that matches the criteria of the mini-parser. A 'match string' is sometimes called an 'output string'.

'match'/'matched'/'return a match'/'input string will match' and other similar terms:

If a mini-parser is said to 'match' or 'return a match' with an input string, it means that when the input string is sent to the mini-parser, the output object it produces contains a property called matchFound which is equal to true. The term 'unmatched string' refers to the string that remains after skipping the first n characters of the input string, where n is equal to the matchLength property of the output object.

## How to write a parsing specification using the H1 string format

An H1 specification will describe a tree of mini-parsers. Each mini-parser and the tree itself will be specified using Space Tree notation, which you can learn about here: [https://github.com/raymond1/space-tree](https://github.com/raymond1/space-tree).

The list of available mini-parsers includes:

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

These mini-parsers will be described below, along with examples of how to specify them using Space Tree notation. Sometimes, a mini-parser will require additional descendent nodes in order to make sense. These requirements will be listed in the section called 'Structure' in the mini-parser descriptions in the API section.

## API
### 'character class' mini-parser
Description:

This mini-parser will determine how many and which characters from the front of the input string match with a set of characters.

Structure:
```
character class
 <a set of characters of a character class>
```

The 'character class' mini-parser should have one child node. The node text for that child node is a configuration parameter called the 'character class set', which a non-empty set of characters used for comparing with the input text to determine if the input text begins with characters from it.

Example Space Tree notation:
```
character class
 0123456789abcdefg
```

Input:
A string.

Output object:

{
  matchString,
  matchFound
}

matchFound will be true if the number of characters in matchString is greater than 0. It will be false otherwise. 

matchString will be the string equal to the the first n characters of the input string, where n is equal to the maximum number of consecutive characters starting from index 0 of the input string which can be found inside the character class set. If n is 0, matchString will be the empty string.

For example, if the input string is 'aaazzz', and the character class set is 'abc', then the output object will be {matchFound: true, matchString: 'aaa'}. If the input string is 'def', the output object will be {matchFound: false, matchString: ''}.

### 'string literal' mini-parser

Description:

This mini-parser will determine whether the input string starts with the specified substring.

Structure:

```
string literal
 <a string>
```

The 'string literal' mini-parser should have one child node referred to as the 'target text'. The target text will be compared with the input string to determine if the input string starts with the target text.

Example Space Tree notation:
```
string literal
 Hello world
```

Input:
A string.

Output object:

{
  matchString,
  matchFound
}

matchFound will be true if the the input text starts with the target text.

matchString will be equal to the target text if the input string starts with the target text. Otherwise, matchString will be the empty string.

### 'not' mini-parser

Description:

During the parsing phase, this mini-parser will return an output object with a matchFound property which negates the matchFound property of the output of its child mini-parser.

Structure:

```
not
 <child mini-parser>
```

The 'not' mini-parser should have one child node that is also a mini-parser.

Example Space Tree notation:
```
not
 string literal
  xyz
```

Input:
A string.

Output object:

{
  matchString,
  matchFound
}

matchFound will be a boolean equal to the negation of the child node's output object's matchFound property. 

matchString will be equal to the empty string if the child node's output objects matchFound property is equal to true. It will equal the entire input string otherwise.

### 'entire' mini-parser

Description:

This mini-parser will determine whether the child node's input string and the matchString property from the child node's output object are the same.

Structure:

```
entire
 <child mini-parser>
```

The 'entire' mini-parser should have one child node that is also a mini-parser.

Example Space Tree notation:
```
entire
 string literal
  xyz
```

Input:
A string.

Output object:

{
  matchString,
  matchFound
}

matchFound will be true if the input string is the same as the child node's output object's matchString property. It will be false otherwise.

matchString will be equal to the input string if matchFound is true. It will be the empty string otherwise.

### 'sequence' mini-parser

Description:

This mini-parser will have one or more children and will send the input string to each of its children, one by one, starting from the first child node and proceeding downwards. If any of its child nodes fail to match with the input string, this mini-parser itself will fail to match. If all of its child nodes match successfully, then this mini-parser also matches successfully.

Structure:

```
sequence
 <child mini-parser 1>
 <child mini-parser 2>
 <child mini-parser 3>
 ...
 <child mini-parser n>
```

The 'sequence' mini-parser should have one or more child node mini-parsers.

Example Space Tree notation:
```
sequence
 string literal
  xyz
 character class
  ab
```

In this example, the sequence of the string literal 'xyz' must be followed by one of the letters from the set of 'a' and 'b'.

Input:
A string.

Output object:

{
  matchString,
  matchFound
}

matchFound will be determined as follows:
Step 1) Number the children of the sequence mini parser from 1 to n.
Step 2) Let a number m be equal to 1.
Step 3) Let the string s be equal to the input string.
Step 4) Check if the mth child node matches with s. If the answer is no, matchFound is false.
If the answer is yes, then proceed to step 5.
Step 5) Check if there are any remaining children. If the answer is no, then matchFound is true. If the answer is yes, then
set s to be the string that remains unmatched after the mth child node was checked for a match. (In other words, s is set to be the same as it was before, except with the first k characters dropped, where k is the value of the matchLength property from the output object of the mth child node.) Also, increment m by 1. Then, go to step 4.

matchString will be determined as follows:
Step 1) Number the children of the sequence mini parser from 1 to n.
Step 2) Let a number m be equal to 1.
Step 3) Let output_string be equal to the empty string.
Step 3) Let the string s be equal to the input string.
Step 4) Check if the mth child node matches with s. If the answer is no, matchString is set to the empty string.
If the answer is yes, concatenate output_string with the first matchLength characters of the mth output object and then proceed to step 5.
Step 5) Check if there are any remaining children. If the answer is no, then return outputString. If the answer is yes, then
set s to be the string that remains unmatched after the mth child node was checked for a match. (In other words, s is set to be the same as it was before, except with the first k characters dropped, where k is the value of the matchLength property from the output object of the mth child node.) Also, increment m by 1. Then, go to step 4.

### 'or' mini-parser

Description:

This mini-parser will have one or more children and will return a match if any of its children match with the input string.

Structure:

```
or
 <child mini-parser 1>
 <child mini-parser 2>
 <child mini-parser 3>
 ...
 <child mini-parser n>
```

The 'or' mini-parser should have one or more child node mini-parsers.

Example Space Tree notation:
```
or
 string literal
  a
 string literal
  b
```

In this example, if the input string starts with either a or b, then there will be a match.

Input:
A string.

Output object:

{
  matchString,
  matchFound
}

matchFound will be true if any of the mini-parser's children match with the input string. Otherwise, it will be false.

matchString will be equal to the empty string if matchFound is false. Otherwise, it will be equal to the first n characters of the input string, where n is equal to the maximum of all of the child node matchLength properties where a child node matched with the input string. 

### 'and' mini-parser

Description:

This mini-parser will have one or more children and will return a match if all of its children match with the input string. 

Structure:

```
and
 <child mini-parser 1>
 <child mini-parser 2>
 <child mini-parser 3>
 ...
 <child mini-parser n>
```

The 'and' mini-parser should have one or more child node mini-parsers.

Example Space Tree notation:
```
and
 string literal
  A
 character class
  A0123456789
```

In this example, if the input string starts with either 'A' and it is one of the characters 'A0123456789', then there will be a match. In other words, the first letter of the input string must be an 'A'.

Input:
A string.

Output object:

{
  matchString,
  matchFound
}

matchFound will be true if all of the mini-parser's children match with the input string. Otherwise, it will be false.

matchString will be equal to the empty string if matchFound is false. Otherwise, it will be equal to the length shortest match found out of all child nodes matched.

### 'multiple' mini-parser

Description:

The 'multiple' mini-parser will have one child node and will return a match if its child node matches with the input string. The child node of the 'multiple' mini-parser will continue to match against the unmatched part of the input string repeatedly until no more matches are found. Each time a match is found, it will be will be accumulated into the output string stored in the matchString property.

Structure:

```
multiple
 <child mini-parser>
```

The 'multiple' mini-parser should have one child node.

Example Space Tree notation:
```
multiple
 character class
  0123456789
```

In the above example, if the input string will match if it starts with one or more numerals from the following character class set: {'0','1','2','3','4','5','6','7','8','9'}. Examples of matching strings include: '0', '00', '1234567'. The following strings will not match: 'A', 'B', 'C'.

Input:
A string.

Output object:

{
  matchString,
  matchFound
}

matchFound is calculated in a method equivalent to the following way: Apply the child node's matching function to the input string. If there is a match, matchFound will be set to true. Otherwise, it is false.

matchString can be calculated in the following way:
1) Let matchWasFound be a boolean value set to false.
2) Let s be an empty string.
3) Apply the matching function of the child node with the input string. If there is a match, concatenate s with the contents of the child node's match string and repeat step 3. If no match is found, return the value of s as the output string.

### 'optional' mini-parser

Description:

The 'optional' mini-parser will always produce a match. It's purpose is to handle syntax that can be either present or absent. If a match is found, the output string will be equal to the matched portion of the input string. If a match is not found, the output string will be the empty string.

Structure:

```
optional
 <child mini-parser>
```

The 'optional' mini-parser should have one child node.

Example Space Tree notation:
```
sequence
 string literal
  A
 optional
  character class
   0123456789
```

In the above example, the input string will match if it is equal to the string 'A'. It will also match if it starts with an 'A' and is followed by one numeral.

Input:
A string.

Output object:

{
  matchString,
  matchFound
}

matchFound is always true.

matchString is equal to the output string of the child node when its matching function is applied to the input string.

### 'split' mini-parser

Description:

The 'split' mini-parser will takes in one or more child nodes. It will execute only the first child node's matching function against the input string. If there is a match, the split mini-parser will return a match string equal to the match string from the child node. Although only the first child node will execute, the other child nodes could potentially have their matching functions invoked if they contain jump targets(see the section on the 'name' and 'jump' nodes for more details).

Structure:

```
split
 <child mini-parser 1>
 <child mini-parser 2>
 ...
 <child mini-parser n>
```

The 'split' mini-parser should have one or more child nodes. While two or more child nodes is expected, one chlid node is permitted.

Example Space Tree notation:
```
split
 string literal
  'A'
 string literal
  'This is ignored unless a name node is used.'
```

In the above example, the input string will match if it is equal to the string 'A'. The second string literal node will never get used.

Input:
A string.

Output object:

{
  matchString,
  matchFound
}

matchFound: To calculate the matchFound value, first execute the matching function of the first child node. matchFound will be set equal to the matchFound property of the output object of the first child node.

matchString: To caclulate the matchString value, execute the matching function of the first child node. Set the output string of the 'split' mini-parser to the output string of the child node.

### 'name' mini-parser

Description:

The 'name' mini-parser will provide a label for a child node. This label can be used in conjunction with the 'jump' node in order to create looping structures. In addition, it will return essentially the same output object as its second child node.

Structure:

```
name
 <string 1>
 <child mini-parser>
```

The 'name' mini-parser's first child node is a string. The second child node is a mini-parser. The first child node is interpreted to be the name of the 'name' node.

Example Space Tree notation:
```
name
 California
 string literal
  'A'
```

In the above example, the name of the 'name' node is 'California'. It will match against the input string 'A'.

Input:
A string.

Output object:

{
  matchString,
  matchFound
}

matchFound: To calculate the matchFound value, first execute the matching function of the second child node. matchFound will be set equal to the matchFound property of the output object of the first child node.

matchString: To caclulate the matchString value, execute the matching function of the second child node. Set the output string of the 'name' mini-parser to the output string of the child node.

### 'jump' mini-parser

Description:

The 'jump' mini-parser will cause matching to proceed to the name node with the child specified by the first child node.

Structure:

```
jump
 <string 1>
```

The 'jump' mini-parser has one child node, which is a string which represents the name of the name node that whose matching function will be invoked.

Example usage:
```
split
 jump
  California
 name
  California
  string literal
   'A'
```

In the above example, the jump node specifies a child node name of 'California'. During matching, execution will jump to the second child node of the split node because it has the name 'California'. The 'California' name node will then execute its second child node's matching function, which detects an 'A'. Thus, the above example essentially returns a match if the input is equal to the string literal 'A'.

Input:
A string.

Output object:

{
  matchString,
  matchFound
}

matchFound: To calculate the matchFound value, first execute the matching function of the second child node. matchFound will be set equal to the matchFound property of the output object of the first child node.

matchString: To caclulate the matchString value, execute the matching function of the second child node. Set the output string of the 'name' mini-parser to the output string of the child node.
