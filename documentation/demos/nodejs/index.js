import {Generator, TreeViewer} from './spg.js'
let generator = new Generator()
let grammar = `split
 character class
  aaa
 string literal
  ccc
 string literal
  ddd
`
/*`split
 multiple
  jump
   n1
 string literal
  character class
 string literal
  string literal
 string literal
  not
 string literal
  option
 string literal
  entire
 string literal
  or
 string literal
  and
 string literal
  sequence
 label
  n1
  string literal
   multiple

sequence[
  rule 1,
  name
   sdfasdfasdf,
]

no operation list
 name
  asdfasdf
 name
  afasdff

run_first_item
 a
 b
 c
 d

attach_attribute[asdfasdf]

name
 asdfasfasdf
 rule
  multiple
   string literal
    a
multiple
 jump
  rule

sequence
 if x
  jump s
 jump t

comment
 asdfasdfasdf sdf asdf a asdfs dend(n)asdfsadfsfdfdf
 <node>
`
*/
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
let testProgram = 'aaaaa'

let output = parser.parse(testProgram)
let treeViewer = new TreeViewer()
treeViewer.display('text', output)



