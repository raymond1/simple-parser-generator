import {ParserGenerator, TreeViewer, Tree} from '../spg.js'

let generator = new ParserGenerator ()

let parserDefinition
// parserDefinition = 
// `split
//  jump
//   expression
//  name
//   expression
//   or
//    jump
//     parentheses expression
//    jump
//     numerical expression
//  name
//   parentheses expression
//   or
//    sequence
//     string literal
//      (
//     jump
//      expression
//     string literal
//      )
//  name
//   addition expression
//   sequence
//    jump
//     integer
//    string literal
//     +
//    jump
//     integer
//  name
//   integer
//   multiple
//    character class
//     0123456789

//   1+2
//  name
//   numerical expression
//    optional
//     jump whitespace
//    multiple
//     character class
//      0123456789
//   jump
//    whitespace
//  name
//   whitespace
//    or
//     `

// parserDefinition =
// `split
//  jump
//   integer
//  name
//   integer
//   entire
//    or
//     jump
//      positive number
//     string literal
//      0
//     jump
//      negative number
//  name
//   positive number
//   jump
//    number
//  name
//   number
//   and
//    multiple
//     character class
//      0123456789
//    not
//     string literal
//      0
//  name
//   negative number
//   sequence
//    string literal
//     -
//    jump
//     positive number
// `


parserDefinition =
`
term expression
 entire
  or
   sequence
    term
    operator
    term expression
   term

term
 or
  integer
  parenthetical expression

parenthetical expression
 sequence
  string literal
   (
  term expression
  string literal
   )

operator
 or
  addition
  subtraction
  multiplication
  division
  exponent

addition
 string literal
  +

subtraction
 string literal
  -

multiplication
 string literal
  *

exponent
 string literal
  ^

division
 string literal
  /

integer
 or
  positive number
  string literal
   0
  negative number

//comment
positive number
 number

number
 and
  multiple
   character class
    0123456789
  not
   string literal
    0

negative number
 sequence
  string literal
   -
  positive number
`

let parser = generator.generateParser(parserDefinition)

let testProgram = '(100+25+60*80)+5'

let output = parser.parse(testProgram)
let outputTree = new Tree(output)

let outputTree2 = outputTree.pruneNodes((node)=>{return node.type !== 'name'})
let treeViewer = new TreeViewer()

treeViewer.display('text', outputTree2.root)

/*

	function evaluateExpression(){
		debugger
		function evaluate(expressionTreeNode){
			let expressionValue
			switch(expressionTreeNode.name){
				case 'EXPRESSION':
					expressionValue = evaluate(expressionTreeNode.matches[0])
					return expressionValue
					break
				case 'ADDITIVE_EXPRESSION':
					expressionValue = evaluate(expressionTreeNode.matches[0])
					for (let i = 1; i < expressionTreeNode.matches.length; i++){
						let additive_operant_term = expressionTreeNode.matches[i]
						let operator = additive_operant_term.matches[0].matchString
	
						if (operator == '+'){
							expressionValue += evaluate(additive_operant_term.matches[1])
						}else if (operator == '-'){
							expressionValue -= evaluate(additive_operant_term.matches[1])
						}
					}
					return expressionValue
					break
				case 'TERM':
					expressionValue = evaluate(expressionTreeNode.matches[0])
						return expressionValue
						break
				case 'MULTIPLICATIVE_EXPRESSION':
					expressionValue = evaluate(expressionTreeNode.matches[0])
					for (let i = 1; i < expressionTreeNode.matches.length; i++){
						let multiplicative_operant_factor = expressionTreeNode.matches[i]
						let operator = multiplicative_operant_factor.matches[0].matchString
	
						if (operator == '*'){
							expressionValue *= evaluate(multiplicative_operant_factor.matches[1])
						}else if (operator == '/'){
							expressionValue /= evaluate(multiplicative_operant_factor.matches[1])
						}
					}
					return expressionValue
					break
				case 'EXPONENTIAL_EXPRESSION':
					expressionValue = Math.pow(evaluate(expressionTreeNode.matches[0]), evaluate(expressionTreeNode.matches[1]))
					return expressionValue
				  break
				case 'PARENTHETICAL_EXPRESSION':
					expressionValue = evaluate(expressionTreeNode.matches[1])
					return expressionValue
				  break
				case 'SUBEXPRESSION':
					expressionValue = evaluate(expressionTreeNode.matches[0])
					return expressionValue
				  break

				case 'FACTOR':
					expressionValue = evaluate(expressionTreeNode.matches[0])
						return expressionValue
						break
				case 'INTEGER':
					return parseInt(expressionTreeNode.matchString, 10)
					break
			}
		}
	
		let grammar = document.querySelector('#input_grammar').value
		let parser = new Parser()
	
		parser.setGrammar(grammar)
	
		let input = document.getElementById("expression").value
	
		let output = parser.parse(input)
		output.pruneNodes((treeNode)=>{return (treeNode['type'] == 'rule'&&treeNode['name']=='WHITESPACE')})
		output.pruneNodes((treeNode)=>{return (treeNode['type'] == 'rule'&&treeNode['name']=='POSITIVE_INTEGER'||treeNode['name']=='NEGATIVE_INTEGER')})	
		output.pruneNodes((treeNode)=>{return (treeNode['type'] == 'rule name')})
		document.getElementById('result').innerHTML = evaluate(output.root)
	
		let tree = new DOMTreeNode(parser.runningGrammar, document.querySelector('#test'))
	
		let treeViewer2 = new TreeViewer(output, document.querySelector('#test2'))
		treeViewer2.display()
	
		let treeViewer3 = new TreeViewer(parser.rawMatches, document.querySelector('#test3'))
		treeViewer3.display()
	}


*/
