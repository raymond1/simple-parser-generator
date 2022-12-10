//Usage: let parser = new Parser()
//parser.setGrammar(grammarDefinitionString)
//parser.parse(string)
//In other words, the grammar that the parser needs to parse is passed into the constructor during the creation on the Parser object
//Then, the parse function is run, taking in an string representing a small set of data given in the language specified by the language loaded by the Parser object during its construction
class Parser{
  constructor(){
    this.idCounter = 0
    this.matchCount = 0 //enumerates the matches
  }

  static registerNodeTypes(){
    Parser.nodeTypes = []
    Parser.nodeTypes.push(OrNode)
    Parser.nodeTypes.push(AndNode)
    Parser.nodeTypes.push(SequenceNode)
    Parser.nodeTypes.push(NotNode)
    Parser.nodeTypes.push(OptionalNode)
    Parser.nodeTypes.push(MultipleNode)
    Parser.nodeTypes.push(CharacterClassNode)
    Parser.nodeTypes.push(QuotedStringNode)
    Parser.nodeTypes.push(RuleNameNode)
    Parser.nodeTypes.push(RuleNode)

    //irregular head matching rules
    //Quoted string needs to be put in first because of S_QUOTE and similar things.
    // this.LinearParsingRows.push(new LinearParsingRow('quoted string', this.headMatchQuotedString, this.grammarize_QUOTED_STRING))
    // this.LinearParsingRows.push(new LinearParsingRow('rule name', this.headMatchRuleName, this.grammarize_RULE_NAME))
    // this.LinearParsingRows.push(new LinearParsingRow('rule', this.headMatchRule, this.grammarize_RULE))

    //Note that the rule for the rule list does not have to be in this list because no reference to it will can be made within one of its rules
    //and so it will never get triggered during parsing of the input grammar
  }


  getMatchCount(){
    let matchCount = this.matchCount
    this.matchCount = this.matchCount + 1
    return matchCount
  }

  setGrammar(grammarString){
    this.grammar = this.generateParser(grammarString)
    if(!this.grammar){
      throw "Error: invalid grammar specification."
    }
    this.rules = this.getRules(this.grammar)
  }

  //Returns n spaces
  encodeDepth(n){
    return ' '.repeat(n)
  }
  //Given an object o of the form {name:value} returns a string 
  encodeProperty(o){
    let property = Object.keys(o)[0]
    return property + ":" + o[property] + "\n"
  }

  //Given a node, coverts it into a string form
//   exportNode(node, depth = 0){
//     let outputString = node['type'] + "\n"
//     switch (node['type']){
//       case 'rule list':
//         for (let i = 0; i < node['rules'].length; i++){
//           outputString += this.encodeDepth(depth + 1) + this.exportNode(node['rules'][i], depth + 1)
//         }
//         break
//       case 'rule':
//         outputString += this.encodeDepth(depth + 1) + this.encodeProperty({name: node.name})
//         outputString += this.encodeDepth(depth + 1) + this.exportNode(node['pattern'], depth + 1)
//         //rule
//         // name:dfsdf
//         break
//       case 'or':
//         break
//         case 'and':
//         break
//       case 'sequence':
//         break
//       case 'not':
//         break
//       case 'optional':
//         break
//       case 'multiple':
//         break;
//       case 'quoted string':
//         break;
// //'OR','AND', 'SEQUENCE', 'NOT', 'OPTIONAL', 'MULTIPLE', 'CHARACTER_CLASS', 'WS_ALLOW_BOTH']
//       default:
//         throw new Exception('Error while exporting grammar' + node['type'])
//     }

//     return outputString
//   }

  //Converts in memory representation of grammar into string form that can be saved to disk
  exportGrammar(){
    let depth = 0
    let node = this.grammar
    let outputString = ''
    outputString += this.exportNode(node)
    return outputString
  }

  importGrammar(){

  }

  getGrammarAST(){
    return this.grammar
  }

  getId(){
    let currentCounter = this.idCounter
    this.idCounter = this.idCounter + 1
    return currentCounter
  }

  //If string starts with a fixed string X, followed by optional empty space and then [ and then a matching right square bracket ] then return the string
  //Otherwise, return the empty string
  //There is a bug when there is a [ followed by ']'. Even so, life goes on.
  static headMatchXWithBrackets(string, X){
    var location_of_first_left_bracket = string.indexOf('[')
    if (location_of_first_left_bracket < 0) return ''

    var left_of_first_left_bracket = string.substring(0,location_of_first_left_bracket).trim()
    if (left_of_first_left_bracket == X){
      let indexOfRightMatchingSquareBracket = Parser.getMatchingRightSquareBracket(string,location_of_first_left_bracket)

      if (indexOfRightMatchingSquareBracket > -1){
        return string.substring(0,indexOfRightMatchingSquareBracket+1)
      }
    }

    return false
  }

  
  //If the string starts with one of the pattern strings for or, sequence, string literal, or rule name,
  //return the string containing up to the first pattern string
  //Returns '' if no valid next pattern string is found
  static headMatchPattern(string){
    for (let nodeType of Parser.nodeTypes){
      let patternString = nodeType.headMatch(string)//headMatchFunction.call(this, string)
      if (patternString) return patternString
    }
    return ''
  }
  
  //A pattern list is a set of comma-separated patterns
  //RULE_NAME1,RULE_NAME2, OR[...], SEQUENCE[]
  //PATTERN
  //PATTERN, PATTERN_LIST
  //There are actually two types of pattern lists: or and sequence.
  //This is because it is necessary to know the context of a pattern list in order to know how to interpret it properly later on
  static grammarize_PATTERN_LIST(string){
    let patterns = []
    let tempString = string.trim()
    while(tempString != ''){
      let nextPatternString = Parser.headMatchPattern(tempString)
      if (nextPatternString == ''){
        break
      }
      else{
        let singlePattern = Parser.grammarize_PATTERN(nextPatternString)
        if (singlePattern){
          patterns.push(singlePattern)
        }else{
          //None of the patterns inside a pattern list can be invalid
          return null
        }
        tempString = tempString.substring(nextPatternString.length)
        tempString = tempString.trim()

        //Skip a comma with leading whitespace if necessary
        if (tempString.charAt(0) == ','){
          tempString = tempString.substring(1).trim()
        }
      }
    }

    if (patterns.length > 0){
      return patterns
    }
    return null
  }
  
  static getTypeOfPattern(string){
    for (let i = 0; i < Parser.nodeTypes.length; i++){
      if (!Parser.nodeTypes[i].headMatch){
        debugger
      }
      let headMatchResult = Parser.nodeTypes[i].headMatch(string)
      if (headMatchResult){
        return Parser.nodeTypes[i].type
      }
    }
    return ''
  }

  //Given a type of a pattern to match and a string, this function emits a node tree of the type specified by typeOfPattern if string matches
  //the pattern specified by typeOfPattern
  grammarize(typeOfPattern, string, parser){
    switch(typeOfPattern){
      case 'or':
        return OrNode.grammarize(string,parser)
        break
      case 'and':
        return AndNode.grammarize(string,parser)
        break
      case 'sequence':
        return SequenceNode.grammarize(string,parser)
        break
      case 'not':
        return NotNode.grammarize(string,parser)
        break
      case 'optional':
        return OptionalNode.grammarize(string,parser)
        break
      case 'multiple':
        return MultipleNode.grammarize(string,parser)
        break
      case 'character class':
        return CharacterClassNode.grammarize(string,parser)
        break
      case 'quoted string':
        return QuotedStringNode.grammarize(string,parser)
        break
      case 'rule name':
        return uleNameNode.grammarize(string,parser)
        break
      case 'rule':
        return RuleNode.grammarize(string,parser)
        break
      default:
        return null
        break;
    }
  }

  static grammarize_PATTERN(string, parser){
    var trimmed_string = string.trim()
    let typeOfPattern = Parser.getTypeOfPattern(trimmed_string)
    return parser.grammarize(typeOfPattern, trimmed_string, parser)
  }

  //Takes in a string representation of a grammar, and returns a parser
  //The parser is an in-memory tree structure representation of the grammar
  generateParser(string){
    var return_node = RuleListNode.grammarize(string, this)

    if (return_node == null){
      console.log('Grammar is empty or there was an error in your grammar. Or, there is an error in this parser.')
    }
    return return_node
  }

  //location_of_left_bracket is the bracket you want to match in string
  static getMatchingRightSquareBracket(string, location_of_left_bracket){
    //[dfgfgdsfasdfa['[']][][[]]] //How to deal with this case?

    let number_of_unmatched_left_square_brackets = 0
    for (var i = location_of_left_bracket; i < string.length; i++){
      if (string.charAt(i) == '['){
        number_of_unmatched_left_square_brackets++
      }

      if (string.charAt(i) == ']'){
        number_of_unmatched_left_square_brackets--
      }

      if (number_of_unmatched_left_square_brackets == 0) return i
    }
    return -1
  }

  //Gets all nodes of type rule that are descendants of the current node
  getRules(grammarNode){
    let rules = []
    if (grammarNode.constructor.type == 'rule'){
      rules.push(grammarNode)
      return rules
    }else if (grammarNode.constructor.type == 'rule list'){
      if (grammarNode.rules.length > 0){
        for (let i = 0; i < grammarNode.rules.length; i++){
          let childRules = this.getRules(grammarNode.rules[i])
          rules = rules.concat(childRules)
        }
      }
      return rules
    }else{
      //This is an error
      throw "Error getting rules."
    }
  }

  //Returns the rule with the rule name ruleName
  getRule(ruleName){
    for (let i = 0; i < this.rules.length; i++){
      if (this.rules[i].name == ruleName){
        return this.rules[i]
      }
    }
    throw 'Error: Unrecognized rule name:' + ruleName
  }

  //Below here lies the code for parsing using the running grammar
  
  //takes in a string and returns an abstract syntax tree, according to previously loaded grammar
  //Assumes there is only one top-level construct
  parse(inputString){
    let matchInformationNodes = this.grammar.match(inputString)
    let matchInformationTree = new Tree(matchInformationNodes)
    this.rawMatches = matchInformationTree
    let ruleMatchesTree = matchInformationTree.getRuleMatchesOnly()
    return ruleMatchesTree
  }

  get rawMatches(){
    return this._rawMatches
  }

  set rawMatches(value){
    this._rawMatches = value
  }
}

Parser.registerNodeTypes()
Parser.validRuleNameCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_'
Parser.keywords = ['OR','AND', 'SEQUENCE', 'NOT', 'OPTIONAL', 'MULTIPLE', 'CHARACTER_CLASS']
