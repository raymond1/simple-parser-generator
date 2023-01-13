import {Generator, TreeViewer} from './spg.js'
let generator = new Generator()
let grammar =
`not
 character class
  abc`
/*
'character class'
'string literal'
'or'
'sequence'
'and'
'multiple'
'not'
'optional'
'entire'
 */
let parser = generator.generateParser(grammar, 'h1')
let testProgram = 'defg'

let output = parser.parse(testProgram)
let treeViewer = new TreeViewer()
treeViewer.display('text', output)



