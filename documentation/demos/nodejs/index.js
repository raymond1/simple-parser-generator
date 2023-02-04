import {Generator, TreeViewer} from './spg.js'
let generator = new Generator()
let grammar = 
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
let parser = generator.generateParser(grammar, 'h1')
let testProgram = 'aaacccxxx'

let output = parser.parse(testProgram)
let treeViewer = new TreeViewer()
treeViewer.display('text', output)



