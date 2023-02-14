//The Generator object is used to generate parsers. The TreeViewer object is a tool
//meant to help analyze the output tree generated when parsers are fed with an input string.
import {Generator, TreeViewer} from './spg.js'

//Instantiate the generator object
let generator = new Generator()

//Set a parser definition for your language in the H1 file format(see H1.md for details)
let parserDefinition = 
`entire
 split
  sequence
   character class
    aaa
   jump
    test
   string literal
    xxx
  name
   test
   string literal
    ccc
  string literal
   ddd`

//Generate an in-memory parser based off of the parser definition you specified.
let parser = generator.generateParser(parserDefinition)

//Specify an input test program as a string
let testProgram = 'aaacccxxx'

//Feed the parser you generated with the test program string
let output = parser.parse(testProgram)

//To analyze the output, instantiate a TreeViewer object and run the display function.
//The first parameter of the display function should be 'text', and the second parameter
//should be the output tree you generated during parsing.
let treeViewer = new TreeViewer()
treeViewer.display('text', output)

//Running this program should produce text output detailing how the parser interpreted your input program.

