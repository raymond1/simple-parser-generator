import {ParserGenerator, TreeViewer} from '../spg.js'

let generator = new ParserGenerator ()

let parserDefinition = 
`split
 jump
  expression
 name
  expression
  or
   jump
    parentheses expression
   jump
    numerical expression
 name
  parentheses expression
  or
   sequence
    string literal
     (
    jump
     expression
    string literal
     )
 name
  addition expression
  sequence
   jump
    integer
   string literal
    +
   jump
    integer
 name
  integer
  multiple
   character class
    0123456789

  1+2
 name
  numerical expression
   optional
    jump whitespace
   multiple
    character class
     0123456789
  jump
   whitespace
 name
  whitespace
   or
    `

parserDefinition =
`split
 jump
  integer
 name
  integer
  or
   jump
    positive number
   string literal
    0
   jump
    negative number
 name
  positive number
  jump
   number
 name
  number
  and
   multiple
    character class
     0123456789
   not
    string literal
     0
 name
  negative number
  sequence
   string literal
    -
   jump
    positive number
`


let parser = generator.generateParser(parserDefinition)
//let x = ParserGenerator.H1.Export(parser)

let testProgram = '100FIXED_STRING_2FIXED_STRING_1'

let output = parser.parse(testProgram)

let treeViewer = new TreeViewer()
treeViewer.display('text', output)
