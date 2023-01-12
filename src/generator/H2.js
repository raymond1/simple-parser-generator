class H2{
    //If string starts with a fixed string X, followed by optional empty space and then [ and then a matching right square bracket ] then return the string
  //Otherwise, return the empty string
  //There is a bug when there is a [ followed by ']'. Even so, life goes on.
  static headMatchXWithBrackets(string, X){
    var location_of_first_left_bracket = string.indexOf('[')
    if (location_of_first_left_bracket < 0) return ''

    var left_of_first_left_bracket = string.substring(0,location_of_first_left_bracket).trim()
    if (left_of_first_left_bracket == X){
      let indexOfRightMatchingSquareBracket = Generator.getMatchingRightSquareBracket(string,location_of_first_left_bracket)

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
    for (let nodeType of Generator.nodeTypes){
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
      let nextPatternString = Generator.headMatchPattern(tempString)
      if (nextPatternString == ''){
        break
      }
      else{
        let singlePattern = Generator.grammarize_PATTERN(nextPatternString)
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
    for (let i = 0; i < Generator.nodeTypes.length; i++){
      let headMatchResult = Generator.nodeTypes[i].headMatch(string)
      if (headMatchResult){
        return Generator.nodeTypes[i].type
      }
    }
    return ''
  }

  //Given a type of a pattern to match and a string, this function emits a node tree of the type specified by typeOfPattern if string matches
  //the pattern specified by typeOfPattern
  static grammarize(typeOfPattern, string, parser){
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
      case 'string literal':
        return StringLiteralNode.grammarize(string,parser)
        break
      case 'entire':
        return EntireNode.grammarize(string,parser)
        break
      case 'rule name':
        return RuleNameNode.grammarize(string,parser)
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
    let typeOfPattern = Generator.getTypeOfPattern(trimmed_string)
    return parser.grammarize(typeOfPattern, trimmed_string, parser)
  }

  //Takes in a string representation of a grammar, and returns a parser
  //The parser is an in-memory tree structure representation of the grammar
  static H2Import(string, parser){
    var return_node = RuleListNode.grammarize(string, parser)

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

}