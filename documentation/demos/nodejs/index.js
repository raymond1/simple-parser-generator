import {Generator, TreeViewer} from './spg.js'
let generator = new Generator()
let grammar =
`sequence
 string literal
  a
 string literal
  ce`
/*
'character class'
'string literal'
'not'
'optional'
'entire'
'or'
'and'

'sequence'
'multiple'
 */
//Singles are not,optional,entire,
//terminals character class, string literal
//Problem with or disabiguation
//or [JUMP x,p2,p3]

//x
//if(x is)

//multiif/switch
//switch

//sort[p1-then-X,p2-then-y,p3-then-z]

//algorithm-then[algorithm]
let parser = generator.generateParser(grammar, 'h1')
let testProgram = 'ace'

let output = parser.parse(testProgram)
let treeViewer = new TreeViewer()
treeViewer.display('text', output)



