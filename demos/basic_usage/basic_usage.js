//1) First, create the generic parser object. At this point, the parser is dumb and doesn't do anything.
let parser = new Parser()

//2)Create a parsing specification consisting of rules that teach the parser what is a valid program and what is an invalid program
let parsingSpecification = 
`
A_OR_B_STRING = MULTIPLE[A_OR_B_CHARACTERS]

A_OR_B_CHARACTERS = ['a','b']
`

//3)Pass the teaching grammar into your parser
parser.setGrammar(parsingSpecification)

//4)Specify a string containing a program written in the language defined by the parsing specification.
let programString = 'aababbaaaababaababaaabaabaababababa'

//5)Feed the program that you have written into your parser to see if it is a valid program or not
let outputFromParsing = parser.parse(programString)

//6)outputFromParsing will be a tree. To see the contents of the tree, you can instantiate a new instance of the TreeViewer helper class that outputs the contents of trees.
//To instantiate the class, pass in the output from the parser to the constructor
let treeviewer = new TreeViewer(outputFromParsing)

//7)Once the TreeViewer has been instantiated, you will be able to obtain a string that details the output from the parse tree by using the getOutputString function
let outputString = treeviewer.getOutputString()

//8)Display the contents of the output string in your console
console.log(outputString)

//At this point, you will see something like the following: