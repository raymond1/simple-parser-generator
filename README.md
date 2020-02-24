# Simple Parser Generator

The Simple Parser Generator is a JavaScript program that has been designed to be an easy to use and understand tool for creating programming language parsers. It takes in a parsing specification written the Simple language and generates a parser that can analyze a string and produce from it a tree of tokens and the higher order expressions that the tokens taken together construct, based on the originally specified parsing specification. 

# Status

Currently, the core parser works, meaning that I have tested most of the constructs listed in the Simple Parser Definition Language and used it reliably several times. There are some known bugs related to translating a user's input grammar, written in Simple, into internal structures that make the parser generator function, but there workarounds are available, and the small size of the parser generator makes it possible to trace down the source of the problem. I've already debugged the main workflows, and the program has reached a state of reliability where it can be used to perform usefuly tasks, despite the bugs that it contains. See the Bugs section below for a list of known bugs.

The demos haven't been fully checked and some of the documentation might be have errors. I plan to finish the calculator demo, and then I will work on fixing the documentation. After that, I plan on putting in a feature freeze until the next release.

## Why Another Parser Generator?

The Simple Parser Generator was created to provide an alternative to the EBNF style syntax of most other parser generators. When I started making this parser generator, I thought that I would make something that was easier to learn and more intuitive than other generators. I wanted something that was easy to use, and had an easily-understandable code base. Unfortunately, as I added more features, my Simple language became more complex, until it became not as simple as I had originally envisioned.

Still, this parser generator is extremely portable and is written in an easily-extendable style. The main code for this program is only around 1000 lines. It can easily be ported to other languages, such as C or PHP. Small does not mean not powerful. Despite its small size, I feel that it has the potential to be extremely useful because of its extensibility.

I originally made the parser generator in order to make a programming language for an environment that I was building, but the parser generator ended up feeling more interesting than the end product I was working on and I felt that it should get its own project. 

## Demo programs
 
To see how to use the parser, look in the folder called demos/calculator and open the file 'calculator.html'. It shows an example of the parser in action.

To use the parser generator in your html file, simply put the parser.js file in the same directory as your html file and then refer to it in a script tag. After you have connected the script to your program, you will be able to use the parser in your JavaScript code by creating a new Parser object. The basic usage of this object is show below:

## Summary of typical usage:

1. First, create the generic parser object. At this point, the parser is dumb and doesn't do anything.
```
let parser = new Parser()
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
```
//At this point, you will see something like the following
*****************************
type:rule list
id:11
depth:0
matchFound:true
matchLength:35
matchString:aababbaaaababaababaaabaabaababababa
  *****************************
  type:rule
  id:4
  depth:1
  matchFound:true
  matchLength:35
  matchString:aababbaaaababaababaaabaabaababababa
  name:A_OR_B_STRING
    *****************************
    type:multiple
    id:3
    depth:2
    matchFound:true
    matchLength:35
    matchString:aababbaaaababaababaaabaabaababababa
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:true
      matchLength:1
      matchString:a
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:true
        matchLength:1
        matchString:a
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:true
          matchLength:1
          matchString:a
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:true
            matchLength:1
            matchString:a
            string:a
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:true
      matchLength:1
      matchString:a
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:true
        matchLength:1
        matchString:a
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:true
          matchLength:1
          matchString:a
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:true
            matchLength:1
            matchString:a
            string:a
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:true
      matchLength:1
      matchString:b
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:true
        matchLength:1
        matchString:b
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:true
          matchLength:1
          matchString:b
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:false
            matchLength:0
            matchString:
            string:a
            *****************************
            type:quoted string
            id:8
            depth:6
            matchFound:true
            matchLength:1
            matchString:b
            string:b
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:true
      matchLength:1
      matchString:a
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:true
        matchLength:1
        matchString:a
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:true
          matchLength:1
          matchString:a
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:true
            matchLength:1
            matchString:a
            string:a
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:true
      matchLength:1
      matchString:b
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:true
        matchLength:1
        matchString:b
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:true
          matchLength:1
          matchString:b
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:false
            matchLength:0
            matchString:
            string:a
            *****************************
            type:quoted string
            id:8
            depth:6
            matchFound:true
            matchLength:1
            matchString:b
            string:b
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:true
      matchLength:1
      matchString:b
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:true
        matchLength:1
        matchString:b
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:true
          matchLength:1
          matchString:b
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:false
            matchLength:0
            matchString:
            string:a
            *****************************
            type:quoted string
            id:8
            depth:6
            matchFound:true
            matchLength:1
            matchString:b
            string:b
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:true
      matchLength:1
      matchString:a
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:true
        matchLength:1
        matchString:a
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:true
          matchLength:1
          matchString:a
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:true
            matchLength:1
            matchString:a
            string:a
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:true
      matchLength:1
      matchString:a
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:true
        matchLength:1
        matchString:a
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:true
          matchLength:1
          matchString:a
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:true
            matchLength:1
            matchString:a
            string:a
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:true
      matchLength:1
      matchString:a
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:true
        matchLength:1
        matchString:a
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:true
          matchLength:1
          matchString:a
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:true
            matchLength:1
            matchString:a
            string:a
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:true
      matchLength:1
      matchString:a
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:true
        matchLength:1
        matchString:a
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:true
          matchLength:1
          matchString:a
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:true
            matchLength:1
            matchString:a
            string:a
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:true
      matchLength:1
      matchString:b
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:true
        matchLength:1
        matchString:b
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:true
          matchLength:1
          matchString:b
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:false
            matchLength:0
            matchString:
            string:a
            *****************************
            type:quoted string
            id:8
            depth:6
            matchFound:true
            matchLength:1
            matchString:b
            string:b
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:true
      matchLength:1
      matchString:a
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:true
        matchLength:1
        matchString:a
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:true
          matchLength:1
          matchString:a
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:true
            matchLength:1
            matchString:a
            string:a
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:true
      matchLength:1
      matchString:b
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:true
        matchLength:1
        matchString:b
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:true
          matchLength:1
          matchString:b
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:false
            matchLength:0
            matchString:
            string:a
            *****************************
            type:quoted string
            id:8
            depth:6
            matchFound:true
            matchLength:1
            matchString:b
            string:b
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:true
      matchLength:1
      matchString:a
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:true
        matchLength:1
        matchString:a
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:true
          matchLength:1
          matchString:a
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:true
            matchLength:1
            matchString:a
            string:a
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:true
      matchLength:1
      matchString:a
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:true
        matchLength:1
        matchString:a
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:true
          matchLength:1
          matchString:a
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:true
            matchLength:1
            matchString:a
            string:a
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:true
      matchLength:1
      matchString:b
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:true
        matchLength:1
        matchString:b
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:true
          matchLength:1
          matchString:b
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:false
            matchLength:0
            matchString:
            string:a
            *****************************
            type:quoted string
            id:8
            depth:6
            matchFound:true
            matchLength:1
            matchString:b
            string:b
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:true
      matchLength:1
      matchString:a
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:true
        matchLength:1
        matchString:a
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:true
          matchLength:1
          matchString:a
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:true
            matchLength:1
            matchString:a
            string:a
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:true
      matchLength:1
      matchString:b
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:true
        matchLength:1
        matchString:b
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:true
          matchLength:1
          matchString:b
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:false
            matchLength:0
            matchString:
            string:a
            *****************************
            type:quoted string
            id:8
            depth:6
            matchFound:true
            matchLength:1
            matchString:b
            string:b
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:true
      matchLength:1
      matchString:a
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:true
        matchLength:1
        matchString:a
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:true
          matchLength:1
          matchString:a
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:true
            matchLength:1
            matchString:a
            string:a
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:true
      matchLength:1
      matchString:a
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:true
        matchLength:1
        matchString:a
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:true
          matchLength:1
          matchString:a
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:true
            matchLength:1
            matchString:a
            string:a
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:true
      matchLength:1
      matchString:a
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:true
        matchLength:1
        matchString:a
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:true
          matchLength:1
          matchString:a
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:true
            matchLength:1
            matchString:a
            string:a
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:true
      matchLength:1
      matchString:b
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:true
        matchLength:1
        matchString:b
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:true
          matchLength:1
          matchString:b
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:false
            matchLength:0
            matchString:
            string:a
            *****************************
            type:quoted string
            id:8
            depth:6
            matchFound:true
            matchLength:1
            matchString:b
            string:b
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:true
      matchLength:1
      matchString:a
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:true
        matchLength:1
        matchString:a
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:true
          matchLength:1
          matchString:a
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:true
            matchLength:1
            matchString:a
            string:a
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:true
      matchLength:1
      matchString:a
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:true
        matchLength:1
        matchString:a
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:true
          matchLength:1
          matchString:a
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:true
            matchLength:1
            matchString:a
            string:a
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:true
      matchLength:1
      matchString:b
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:true
        matchLength:1
        matchString:b
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:true
          matchLength:1
          matchString:b
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:false
            matchLength:0
            matchString:
            string:a
            *****************************
            type:quoted string
            id:8
            depth:6
            matchFound:true
            matchLength:1
            matchString:b
            string:b
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:true
      matchLength:1
      matchString:a
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:true
        matchLength:1
        matchString:a
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:true
          matchLength:1
          matchString:a
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:true
            matchLength:1
            matchString:a
            string:a
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:true
      matchLength:1
      matchString:a
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:true
        matchLength:1
        matchString:a
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:true
          matchLength:1
          matchString:a
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:true
            matchLength:1
            matchString:a
            string:a
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:true
      matchLength:1
      matchString:b
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:true
        matchLength:1
        matchString:b
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:true
          matchLength:1
          matchString:b
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:false
            matchLength:0
            matchString:
            string:a
            *****************************
            type:quoted string
            id:8
            depth:6
            matchFound:true
            matchLength:1
            matchString:b
            string:b
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:true
      matchLength:1
      matchString:a
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:true
        matchLength:1
        matchString:a
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:true
          matchLength:1
          matchString:a
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:true
            matchLength:1
            matchString:a
            string:a
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:true
      matchLength:1
      matchString:b
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:true
        matchLength:1
        matchString:b
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:true
          matchLength:1
          matchString:b
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:false
            matchLength:0
            matchString:
            string:a
            *****************************
            type:quoted string
            id:8
            depth:6
            matchFound:true
            matchLength:1
            matchString:b
            string:b
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:true
      matchLength:1
      matchString:a
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:true
        matchLength:1
        matchString:a
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:true
          matchLength:1
          matchString:a
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:true
            matchLength:1
            matchString:a
            string:a
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:true
      matchLength:1
      matchString:b
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:true
        matchLength:1
        matchString:b
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:true
          matchLength:1
          matchString:b
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:false
            matchLength:0
            matchString:
            string:a
            *****************************
            type:quoted string
            id:8
            depth:6
            matchFound:true
            matchLength:1
            matchString:b
            string:b
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:true
      matchLength:1
      matchString:a
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:true
        matchLength:1
        matchString:a
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:true
          matchLength:1
          matchString:a
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:true
            matchLength:1
            matchString:a
            string:a
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:true
      matchLength:1
      matchString:b
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:true
        matchLength:1
        matchString:b
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:true
          matchLength:1
          matchString:b
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:false
            matchLength:0
            matchString:
            string:a
            *****************************
            type:quoted string
            id:8
            depth:6
            matchFound:true
            matchLength:1
            matchString:b
            string:b
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:true
      matchLength:1
      matchString:a
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:true
        matchLength:1
        matchString:a
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:true
          matchLength:1
          matchString:a
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:true
            matchLength:1
            matchString:a
            string:a
      *****************************
      type:rule name
      id:2
      depth:3
      matchFound:false
      matchLength:0
      matchString:
      value:A_OR_B_CHARACTERS
        *****************************
        type:rule
        id:10
        depth:4
        matchFound:false
        matchLength:0
        matchString:
        name:A_OR_B_CHARACTERS
          *****************************
          type:or
          id:9
          depth:5
          matchFound:false
          matchLength:0
          matchString:
            *****************************
            type:quoted string
            id:7
            depth:6
            matchFound:false
            matchLength:0
            matchString:
            string:a
            *****************************
            type:quoted string
            id:8
            depth:6
            matchFound:false
            matchLength:0
            matchString:
            string:b
basic_usage.html:37:9
```



Build instructions:
Go into the code directory and type in "make" from the terminal. This will copy parser.js into the releases folder and create the parser_commonjs.js files(for CommonJS require('simple-parser-generator') type usage) as well as parser_module.js for the newer "import Parser from './simple-parser-generator'" type import statements.

Simple Language:

A program specified using the Simple program specification language consists of a series of rules. Each rule takes on the following form of a rule name followed by the '=' sign, followed by a matching pattern:

RULE_NAME = PATTERN[...pattern parameters...]

Here is an example rule:

BINARY_STRING = CHARACTER_CLASS['01']

This rule specifies that a BINARY_STRING consists of strings that contain only the characters '0' and '1'. If you pass in the above specification to the simple parser generator, you will get a parser, which is an object that understands whether a given input string is a valid program, according to the Simple program specification you used to create the parser. Then, you can pass in strings to the parser, and it will tell you whether or not the string that was passed in is a valid program or an invalid program.

There are some examples of programs inside the demos folder. The patterns that can be used for the Simple program specification are described below:

List of Simple program specification language patterns and their description:

OR[] pattern:
-------------

Usage example:

DIGIT = OR['1','2','3', '4','5', '6','7', '8', '9', '0']

Here, the DIGIT rule would match any one of the strings '1', '2', '3', ... etc. Strings in the Simple language consist of a single quote followed by one or more letters, followed by an end quote. If you happen to need the single quote as a character, you can use the symbol S_QUOTE. For example:

QUOTES = OR['"', S_QUOTE]

The input to OR can be either a rule name or another pattern.

SEQUENCE[] pattern:
-------------------

Usage example:

WORD_CAT = SEQUENCE['ca', 't']

Here, the rule WORD_CAT matches the string 'cat' because the SEQUENCE construct matches anything that specifies all of the patterns inside of it. Each pattern inside the square brackets of the sequence construct is separated by a comma.

You can combine OR and SEQUENCE constructs to make up rules. For example:

SUPERPERSON = SEQUENCE['SUPER', OR['MAN','WOMAN']]

The above rule would match either the string 'SUPERMAN' or 'SUPERWOMAN'.

NOT[] pattern:
--------------
Usage example:

NOT_SIDNEY = NOT['Sidney']

This rule would match any string except for the string 'Sidney'. Note that the string 'Sidneys' would match because although it starts with the string 'Sidney', it is different from it due to the extra trailing s.

MULTIPLE[]:
-----------
Usage example:

BINARY_STRING = MULTIPLE[OR['0', '1']]

This would match strings that start with 1 or more characters which are either 0 or 1. For example, '01001001' would match. 'a0000' would not match.

MULTIPLE indicates that for a string to match, the inner pattern must be matched 1 or more times. In the above example, the inner pattern is OR['0','1']. Any string consisting of multiple consecutive inner patterns will be matched by the MULTIPLE pattern.


OPTIONAL[]:
-----------
Usage example:

JUDGEMENT = SEQUENCE['JUDG', OPTIONAL['E'], 'MENT']

This would match either the strings 'JUDGMENT' or 'JUDGEMENT'.

CHARACTER_CLASS[]:
------------------
Usage example:
```
ALPHABET = CHARACTER_CLASS['abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ']
```

This matches any string that starts with  magiscule or miniscule letters of the alphabet. For example, 'dfasfasdfa' would match. 'dsfads1' would also  match everything up to but not including the '1'.

rule name pattern:
------------------
Usage example:

RULE_1 = 'SOCKET'

RULE_2 = 'WRENCH'

RULE_3 = SEQUENCE[RULE_1,RULE_2]

RULE_4 = RULE_3

RULE_3 above would match the string 'SOCKETWRENCH'. RULE_4, because it is defined to be equal to RULE_3, would also match 'SOCKETWRENCH'. In other words, you can refer to the names of the rules you have defined by name.

quoted string pattern:
----------------------
Usage example:

CLING_WORD = 'cling'

The above rule would match strings that start with 'cling'. For example, 'clingon' would be a match.

By combining multiple rules and patterns together, you can end up with some really useful expressions.

This software is still in its early phases, and I am aware of some bugs and problems in the documentation but it has been released into the wild because I feel it has reached a point where it could be very useful. Be free, my software, and go where you need to go! I'll support you! Grow! Grow!

If you have trouble using my software, you can send me an email at

raymondleon@raymondleon.ca

# Escape Sequences
You can use S_QUOTE, L_SQUARE_BRACKET, R_SQUARE_BRACKET and COMMA to match the following characters, respectively: ' [ ] ,

# Bugs
Escape sequences probably don't work very well and haven't been tested thoroughly. For example:

OR[']'] might be incorrectly detected as OR['] followed by ']. You can try writing OR[R_SQUARE_BRACKET] to match a right bracket in this situation.
