import Generator from './spg.js'
let generator = new Generator()

let grammar =
`character class
 ab`
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
let testProgram = 'aaaaaaaaaaaa'
console.log(parser)

let output = parser.parse(testProgram)
let treeViewer = new TreeViewer()
treeViewer.root = output
treeViewer.display()



