import {ParserGenerator, TreeViewer, Tree} from '../spg.js'

let generator = new ParserGenerator ()

let parserDefinition


parserDefinition =
`
calculatable expression
 entire
  term expression

term expression
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

let testProgram = '(1+2*3)+4'

let output = parser.parse(testProgram)
let outputTree = new Tree(output)
let outputTree2 = outputTree.returnFilteredTree(
	(treeNode)=>{
		if (treeNode.type == 'name'){
			//Filter out these nodes
			if (['positive number','negative number','number','calculatable expression'].includes(treeNode.name)){
console.log(treeNode.name + ' was filtered out')
				return false
			}

			if (treeNode.matchFound){
				return true
			}
		}
		return false
	}
)

let treeViewer = new TreeViewer()
treeViewer.display('text', outputTree2.root)

function evaluate(treeNode){
debugger
	switch (treeNode.name){
		case 'term expression':
			return 0
		case 'parenthetical expression':
			return 0
		case 'term':
			return 0
		case 'integer':
			return Number(treeNode.matchString)
		default:
			return 0
			//throw new Error('Error: Match node type not implemented.')
	}
}

console.log(evaluate(outputTree2.root))
console.log(outputTree2.size())
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
