import {ParserGenerator, TreeViewer, Tree} from '../spg.js'

let generator = new ParserGenerator ()

let parserDefinition

//1+2+3+4+5
//(1+2)+3
//((1+2)+3)+4
parserDefinition =
`
calculatable expression
 entire
  numerical expression

numerical expression
 or
  addition or subtraction expression
  term

//A term is something that is on either side of a plus or minus sign, or, if there is none, then it is a single
//evaluatable value
term
 or
  multiplication or division expression
  factor

factor
 or
  exponential expression
  integer

exponential expression
 or
  sequence
   integer
   exponential operator
   exponential expression
  sequence
   integer
   exponential operator
   integer

exponential operator
 string literal
  ^

multiplication or division expression
 sequence
  integer
  multiple
   multiplication or division operation

multiplication or division operation
 sequence
  multiplication or division symbol
  integer

multiplication or division symbol
 or
  string literal
   *
  string literal
   /

addition or subtraction expression
 sequence
  term
  multiple
   addition or subtraction operation

addition or subtraction operation
 sequence
  plus or minus
  term

plus or minus
 or
  string literal
   +
  string literal
   -


// multiplication expression
//  sequence
//   term expression
//   string literal
//    *
//   term expression

// multiplicative expression
//  or
//   multiplication expression
//   divisionExpression


// term expression
//  or
//   sequence
//    term
//    operator
//    term expression
//   term

// term
//  or
//   integer
//   parenthetical expression

// parenthetical expression
//  sequence
//   string literal
//    (
//   term expression
//   string literal
//    )

// operator
//  or
//   addition
//   subtraction
//   multiplication
//   division
//   exponent

// addition
//  string literal
//   +

// subtraction
//  string literal
//   -

// multiplication
//  string literal
//   *

// exponent
//  string literal
//   ^

// division
//  string literal
//   /


integer
 or
  positive number
  string literal
   0
  negative number

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

let testProgram = '1+2*3-2^2^2*2' //1,7, -25

let output = parser.parse(testProgram)
let outputTree = new Tree(output)
console.log('outputTree size:', outputTree.size())
console.log(ParserGenerator.H1.Export(outputTree))


let treeViewer = new TreeViewer()
console.log('outputTree after parsing but before filtering')
treeViewer.display('text', outputTree.root)


console.log('outputTree size:', outputTree.size())
//true is to filter in
//false is to filter out
let outputTree2 = outputTree.returnFilteredTree(
  (treeNode)=>{
    if (treeNode.type == 'name'){
      //Filter out these nodes
      if (['positive number','negative number','number'].includes(treeNode.name)){
        return false
      }

      if (treeNode.matchFound && Tree.isSuccessfullyDescendedFromRoot(treeNode)){
        return true
      }

      return false
    }
    return false
  }
)
console.log('outputTree2 size after filtering:', outputTree2.size())

treeViewer = new TreeViewer()
treeViewer.display('text', outputTree2.root)

outputTree2.resetDepth(outputTree2.root, 0)

treeViewer = new TreeViewer()
treeViewer.display('text', outputTree2.root)

function evaluate(treeNode){
  let returnValue

  if (!treeNode){
    throw new Error('Empty treeNode detected')
  }

  switch(treeNode.name){
    case 'calculatable expression':
      returnValue = evaluate(treeNode.subMatches[0])
      break
    case 'numerical expression':
      returnValue = evaluate(treeNode.subMatches[0])
      break
    case 'factor':
      returnValue = evaluate(treeNode.subMatches[0])
      break
    case 'exponential expression':
      {
        let leftValue = Number(treeNode.subMatches[0].matchString)
        let rightValue = evaluate(treeNode.subMatches[2])
        returnValue = Math.pow(leftValue, rightValue)
        break
      }
    case 'term':
      returnValue = evaluate(treeNode.subMatches[0])
      break
    case 'multiplication or division expression':
      {
        let firstNumber = Number(treeNode.subMatches[0].matchString)
        let accumulator = firstNumber
        for (let i = 1; i < treeNode.subMatches.length; i++){
          let operatorInfo = evaluate(treeNode.subMatches[i])
          if (operatorInfo.operator == '*'){
            accumulator = accumulator * operatorInfo.number
          }else if (operatorInfo.operator == '/'){
            accumulator = accumulator / operatorInfo.number
          }
        }
        returnValue = accumulator
        break
      }
    case 'multiplication or division operation':
      {
        let operator = treeNode.subMatches[0].matchString
        let number = Number(treeNode.subMatches[1].matchString)
        returnValue = {operator, number}
        break
      }
    case 'addition or subtraction expression':
      {
        let firstInteger = Number(treeNode.subMatches[0].matchString)
        let accumulator = 0
        for (let i = 1; i < treeNode.subMatches.length; i++){
          accumulator += evaluate(treeNode.subMatches[i])
        }
        returnValue = firstInteger + accumulator
        break
      }
    case 'addition or subtraction operation':
      {
        let operand = Number(evaluate(treeNode.subMatches[1]))
        if (treeNode.subMatches[0].matchString == '+'){
          returnValue = operand
        }else if (treeNode.subMatches[0].matchString =='-'){
          returnValue = -1 * operand
        }
        break
      }
    case 'integer':
      returnValue = Number(treeNode.matchString)
      break
    default:
      throw new Error('Unrecognized match node type.')

      //throw new Error('Error: Match node type not implemented.')
  }

  return returnValue
}

console.log('answer is:', evaluate(outputTree2.root))
// console.log(outputTree2.size())
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
