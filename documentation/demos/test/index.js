import {ParserGenerator, TreeViewer} from '../spg.js'
let parserGenerator = new ParserGenerator()

let parserDefinition = 
`string literal
 Hello, world.`

let parser = parserGenerator.generateParser(parserDefinition)

let testProgram = 'Hello, world. Magic.'

let output = parser.parse(testProgram)

let treeViewer = new TreeViewer()
treeViewer.display('text', output)
