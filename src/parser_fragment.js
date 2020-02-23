//These nodes take in text and then emit Nodes which are then used by the user parser to emit match nodes
class LinearParsingNode{
  constructor(constructName, headMatchFunction, grammarizeFunction){
      this.constructName = constructName
      this.headMatchFunction = headMatchFunction
      this.grammarizeFunction = grammarizeFunction
  }
}

//This is the type of object that is emitted during the parsing operation by the parser
class MatchNode{
  constructor(){

  }

  setProperties(newAttributes){
    for (let newAttribute in newAttributes){
      this[newAttribute] = newAttributes[newAttribute]
    }
  }

  shallowDisplay(){
    console.log('begin node')
    for (let attribute in this){
      console.log(attribute + ':' + this[attribute])
    }
    console.log('end node')
  }
}

//This is the type of node emitted internally by the parser
class Node{
  constructor(attributesObject){
    this.attributes = []
    this.setAttributes(attributesObject)
  }

  //If attribute exists, overwrite it
  //If attribute does not exist, create it
  setAttribute(attributeName, value = null){
    //While it may seem like you can avoid using the setAttribute function, using it actually simplifies things when you are debugging because
    //you can iterate through the relevant details without handling the fact that some attributes, such as parser and id are not intended to be used in the abstracted concept of a node

    if (this.attributes.indexOf(attributeName) > -1){
      
    }else{
      this.attributes.push(attributeName)
    }

    this[attributeName] = value
  }

  //Takes in an object {attribute1: value1, attribute2: value2} and assigns them to an attribute of the node. Records the attribute in the attributes array
  setAttributes(newAttributes){
    for (let newAttribute in newAttributes){
      this.setAttribute(newAttribute, newAttributes[newAttribute])
    }
  }


  getAttributes(){
    return this.attributes
  }

  getChildren(){
    let children = []
    for (let attribute in this){
      let value = this[attribute]
      if (typeof value == 'object'){
        children.push(value)
      }else if (typeof value == 'array'){
        for (let j = 0; j < value.length; j++){
          children.push(value[j])
        }
      }
    }
    return children
  }

  //The way this works is if a pattern matches the input string, then the caret is incremented
  //quoted string and character class are the only two patterns that are incremented not by the length of the input, but by the length of the internal string or matched string.
  match(string, metadata = {depth: 0, parent: null}){
    var newMatchNode = new MatchNode()

    //matches, matchFound and matchLength need to be set in each case
    var matches = []
    var matchFound = false
    var matchLength = 0
    switch(this['friendly node type name']){
      case 'rule list':
        {
          //newMatchNode will be used as the parent node for all matches that are initiated by the current node
          //It is referred to at the end of the function
          let matchInfo = this.rules[0].match(string, {depth: 1, parent: newMatchNode})
          matchLength = matchInfo.matchLength
          matches = [matchInfo]
          matchFound = matchInfo.matchFound
        }
        break
      case 'rule':
        {
          let matchInfo = this.pattern.match(string,{depth: metadata.depth + 1, parent: newMatchNode})
          matchLength = matchInfo.matchLength
          matches = [matchInfo]
          matchFound = matchInfo.matchFound

          newMatchNode.setProperties({name: this.name})
        }
        break
      case 'rule name':
        {
          let rule = this.parser.getRule(this.value)
          let matchInfo = rule.match(string,{depth: metadata.depth + 1, parent: newMatchNode})
          matches = [matchInfo]
          matchFound = matchInfo.matchFound
          matchLength = matchInfo.matchLength
          newMatchNode.setProperties({value: this.value})
        }
        break
      case 'not':
        {
          let matchInfo = this['pattern'].match(string,{depth: metadata.depth + 1, parent: newMatchNode})
      
          matchFound = !matchInfo.matchFound
          if (matchFound){
            matchLength = string.length
          }
          matches = [matchInfo]
        }
        break
      case 'ws allow both':
        {
          let leadingWhitespace = Strings.headMatch(string, Strings.whitespace_characters)
      
          let remainderString = string.substring(leadingWhitespace.length)
          let matchInfo = this['inner pattern'].match(remainderString,{depth: metadata.depth + 1, parent: newMatchNode})
          if (matchInfo.matchFound){
            let afterInnerPattern = remainderString.substring(matchInfo.matchLength)
            let trailingWhitespace = Strings.headMatch(afterInnerPattern, Strings.whitespace_characters)
            matchLength = leadingWhitespace.length + matchInfo.matchLength + trailingWhitespace.length
          }
          matches = [matchInfo]
          matchFound = matchInfo.matchFound
        }
        break
      case 'sequence':
        {
          let tempString = string
          let totalMatchLength = 0
      
          let matchInfo
          for (let i = 0; i < this['patterns'].length; i++){
            matchInfo = this['patterns'][i].match(tempString,{depth: metadata.depth + 1, parent: newMatchNode})
            matches.push(matchInfo)
            if (!matchInfo.matchFound){
              break;
            }else{
              totalMatchLength = totalMatchLength + matchInfo.matchLength
              tempString = tempString.substring(matchInfo.matchLength)
            }
          }
          matchFound = matchInfo.matchFound
          matchLength = totalMatchLength
        }
        break
      case 'or':
        {
          let matchInfo
          for (let i = 0; i < this.patterns.length; i++){
            matchInfo = this['patterns'][i].match(string,{depth: metadata.depth + 1, parent: newMatchNode})
            matches.push(matchInfo)
            if (matchInfo.matchFound){
              break
            }
          }
          matchFound = matchInfo.matchFound
          matchLength = matchInfo.matchLength
        }
        break
      case 'and':
        {
          let matchInfo
          let andDetected = true
      
          for (let i = 0; i < this.patterns.length; i++){
            matchInfo = this['patterns'][i].match(string,{depth: metadata.depth + 1, parent: newMatchNode})
            matches.push(matchInfo)
            if (!matchInfo.matchFound){
              andDetected = false
              matchLength = 0
              break
            }else{
              matchLength = matchInfo.matchLength
            }
          }
      
          //matchLength will be equal to the shortest match, or 0 if there was no match
          matchLength = match.matchLength

          matchFound = andDetected
        }
        break
      case 'multiple':
        {
          let tempString = string
          let totalMatchLength = 0
      
          let matchInfo = this.pattern.match(tempString,{depth: metadata.depth + 1, parent: newMatchNode})
          if (matchInfo.matchFound){
            matches.push(matchInfo)
          }
          while(matchInfo.matchFound){
            totalMatchLength = totalMatchLength + matchInfo.matchLength
            tempString = tempString.substring(matchInfo.matchLength)
            matchInfo = this.pattern.match(tempString,{depth: metadata.depth + 1, parent: this})
            matches.push(matchInfo)
          }

          if (matches.length > 0){
            matchFound = true
          }
          matchLength = totalMatchLength
        }
        break
      case 'quoted string':
        {
          //matches if the string starts with the quoted string
          let internalString = this['string']
    
          if (string.substring(0, internalString.length) == internalString){
            matchFound = true
          }
      
          if (matchFound){
            matchLength = internalString.length
          }
          newMatchNode.setProperties({string: this.string})
        }
        break
      case 'character class':
        {
          //matches if the string starts with characters from the character class
          let matchingString = ''
          //i is the number of characters to take for comparison
          //i goes from 1, 2, 3, ... to the length of the string
          for (let i = 1; i <= string.length; i++){
            let headString = string.substring(0,i)
            if (Strings.contains_only(headString,this['string'])){
              matchingString = headString
            }else{
              break
            }
          }
      
          if (matchingString.length > 0){
            matchFound = true
            matchLength = matchingString.length
          }
        }
        break
      case 'optional':
        {
          let matchInfo = this.pattern.match(string,{depth: metadata.depth + 1, parent: newMatchNode})
          matches.push(matchInfo)
          matchLength = matchInfo.matchLength
          matchFound = true
        }
        break
      case 'exact':
        {
          let matchInfo = this.pattern.match(string,{depth: metadata.depth + 1, parent: newMatchNode})
          matches.push(matchInfo)
          if (matchInfo.matchFound && matchInfo.matchLength == string.length){
            matchLength = matchInfo.matchLength
            matchFound = true  
          }
        }
    }

    let matchString = string.substring(0, matchLength)
    newMatchNode.setProperties({parent: metadata.parent, string, type: this['friendly node type name'], id: this.id, serial: this.parser.getMatchCount(), depth: metadata.depth, matchFound, matchLength, matchString, matches})
    return newMatchNode
  }
}

//Usage: let parser = new Parser()
//parser.setGrammar(grammarDefinitionString)
//parser.parse(string)
//In other words, the grammar that the parser needs to parse is passed into the constructor during the creation on the Parser object
//Then, the parse function is run, taking in an string representing a small set of data given in the language specified by the language loaded by the Parser object during its construction
class Parser{
  constructor(){
    this.validRuleNameCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_'
    this.keywords = ['OR','AND', 'SEQUENCE', 'NOT', 'OPTIONAL', 'MULTIPLE', 'CHARACTER_CLASS', 'WS_ALLOW_BOTH']
    this.idCounter = 0
    this.matchCount = 0 //enumerates the matches

    this.linearParsingNodes = []
    this.registerLinearParsingNodes() //For each head matching function, there needs to be a corresponding grammarize function
  }

  headMatchOr(string){
    return this.headMatchXWithBrackets(string, 'OR')
  }

  headMatchAnd(string){
    return this.headMatchXWithBrackets(string, 'AND')
  }

  headMatchSequence(string){
    return this.headMatchXWithBrackets(string, 'SEQUENCE')
  }

  headMatchNot(string){
    return this.headMatchXWithBrackets(string, 'NOT')
  }

  headMatchOptional(string){
    return this.headMatchXWithBrackets(string, 'OPTIONAL')
  }

  headMatchMultiple(string){
    return this.headMatchXWithBrackets(string, 'MULTIPLE')
  }

  headMatchCharacterClass(string){
    return this.headMatchXWithBrackets(string, 'CHARACTER_CLASS')
  }

  headMatchWSAllowBoth(string){
    return this.headMatchXWithBrackets(string, 'WS_ALLOW_BOTH')
  }

  headMatchExact(string){
    return this.headMatchXWithBrackets(string, 'EXACT')
  }

  registerLinearParsingNodes(){
    this.linearParsingNodes.push(new LinearParsingNode('or', this.headMatchOr, this.grammarize_OR))
    this.linearParsingNodes.push(new LinearParsingNode('and', this.headMatchAnd, this.grammarize_AND))
    this.linearParsingNodes.push(new LinearParsingNode('sequence', this.headMatchSequence, this.grammarize_SEQUENCE))
    this.linearParsingNodes.push(new LinearParsingNode('not', this.headMatchNot, this.grammarize_NOT))
    this.linearParsingNodes.push(new LinearParsingNode('optional', this.headMatchOptional, this.grammarize_OPTIONAL))
    this.linearParsingNodes.push(new LinearParsingNode('multiple', this.headMatchMultiple, this.grammarize_MULTIPLE))
    this.linearParsingNodes.push(new LinearParsingNode('character class', this.headMatchCharacterClass, this.grammarize_CHARACTER_CLASS))
    this.linearParsingNodes.push(new LinearParsingNode('ws allow both', this.headMatchWSAllowBoth, this.grammarize_WS_ALLOW_BOTH))
    this.linearParsingNodes.push(new LinearParsingNode('exact', this.headMatchExact, this.grammarize_EXACT))

    //irregular head matching rules
    this.linearParsingNodes.push(new LinearParsingNode('rule name', this.headMatchRuleName, this.grammarize_RULE_NAME))
    this.linearParsingNodes.push(new LinearParsingNode('quoted string', this.headMatchQuotedString, this.grammarize_QUOTED_STRING))
    this.linearParsingNodes.push(new LinearParsingNode('rule', this.headMatchRule, this.grammarize_RULE))

    //Note that the rule for the rule list does not have to be in this list because no reference to it will can be made within one of its rules
    //and so it will never get triggered during parsing of the input grammar
  }

  headMatchRuleName(string){
    let ruleNameCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_'
    let length = 0
    //A valid rule name consists of letters, numbers and underscores
    for (let i = 0; i < string.length;i++){
      if (Strings.contains_only(string.substring(i,i+1), ruleNameCharacters)){
        length = length + 1
      }
      else{
        break
      }
    }
    return string.substring(0,length)
  }    

  headMatchQuotedString(string){
    if (string.startsWith('S_QUOTE')){
      return 'S_QUOTE'
    }
    if (string.startsWith('L_SQUARE_BRACKET')){
      return 'L_SQUARE_BRACKET'
    }
    if (string.startsWith('R_SQUARE_BRACKET')){
      return 'R_SQUARE_BRACKET'
    }
    if (string.startsWith('COMMA')){
      return 'COMMA'
    }

    if (string.length < 1){
      return ''
    }

    if (string.charAt(0) != '\''){
      return ''
    }

    let stringAfterFirstQuote = string.substring(1)
    let stringCharacters = Strings.headMatchUntilDelimiter(stringAfterFirstQuote, '\'')
    if (stringCharacters.length < 1){
      return ''
    }
    
    if (stringAfterFirstQuote.length < 1 + stringCharacters.length){
      //not long enough string for there to have a second quote
      return ''
    }

    let secondQuote = stringAfterFirstQuote.charAt(stringCharacters.length)
    if (secondQuote !== '\''){
      return ''
    }
    return string.substring(0, 1 + stringCharacters.length + 1)

  }

  //matches a rule(not just a rule name, the entire rulename = pattern)
  headMatchRule(string){
    let location_of_first_equals_sign = string.indexOf('=')
    if (location_of_first_equals_sign < 1){
      return ''
    }

    let left_of_first_equals_sign = string.substring(0, location_of_first_equals_sign)
    let trimmed_left_of_first_equals_sign = left_of_first_equals_sign.trim()

    let rule_name = this.grammarize_RULE_NAME(trimmed_left_of_first_equals_sign)
    if (rule_name == null){
      return ''
    }

    let location_of_first_left_square_bracket = string.indexOf('[')
    let string_between_equals_sign_and_first_left_square_bracket = ''
    let is_keyword = false //is it one of the keywords OR[], AND[], etc.?
    if (location_of_first_left_square_bracket >= 0){
      string_between_equals_sign_and_first_left_square_bracket = string.substring(location_of_first_equals_sign + 1, location_of_first_left_square_bracket)

      let trimmed_string_between_equals_sign_and_first_left_square_bracket = string_between_equals_sign_and_first_left_square_bracket.trim()

      if (this.keywords.indexOf(trimmed_string_between_equals_sign_and_first_left_square_bracket) >= 0){
        //This is one of the keywords
        is_keyword = true
      }
    }

    if (location_of_first_left_square_bracket >= 0 && is_keyword){ //if first left square bracket was found

      let location_of_matching_right_square_bracket = this.get_matching_right_square_bracket(string, location_of_first_left_square_bracket)
      if (location_of_matching_right_square_bracket == -1){
        return ''
      }
  
      let next_rule_string = string.substring(0, location_of_matching_right_square_bracket + 1)
      return next_rule_string
    }else{
      //This is a rule name with no brackets
      let leadingWhitespace = Strings.headMatch(string.substring(location_of_first_equals_sign + 1), Strings.whitespace_characters)
      let ruleName = Strings.headMatch(string.substring(location_of_first_equals_sign + 1 + leadingWhitespace.length), this.validRuleNameCharacters)
      if (ruleName.length > 0){
        return string.substring(0, location_of_first_equals_sign + leadingWhitespace.length + ruleName.length + 1)
      }
    }
  }

  

  //Takes in an attributes object {attribute1: value1, attribute2: value2}
  //All nodes should be created through this interface
  createNode(nodeOptions){
    let node = new Node(nodeOptions)
    //These two properties are meant to be hidden from regular use
    //They are meant to be abstracted away
    node['id'] = this.getId()
    node['parser'] = this
    return node
  }

  getMatchCount(){
    let matchCount = this.matchCount
    this.matchCount = this.matchCount + 1
    return matchCount
  }

  setGrammar(grammarString){
    this.runningGrammar = this.generateParser(grammarString)
    if(!this.runningGrammar){
      throw "Error: invalid grammar specification."
    }
    this.rules = this.getRules(this.runningGrammar)
  }

  getGrammarAST(){
    return this.runningGrammar
  }

  getId(){
    let currentCounter = this.idCounter
    this.idCounter = this.idCounter + 1
    return currentCounter
  }

  //If string starts with a fixed string X, followed by optional empty space and then [ and then a matching right square bracket ] then return the string
  //Otherwise, return the empty string
  //There is a bug when there is a [ followed by ']'. Even so, life goes on.
  headMatchXWithBrackets(string, X){
    var location_of_first_left_bracket = string.indexOf('[')
    if (location_of_first_left_bracket < 0) return ''

    var left_of_first_left_bracket = string.substring(0,location_of_first_left_bracket).trim()
    if (left_of_first_left_bracket == X){
      let indexOfRightMatchingSquareBracket = this.get_matching_right_square_bracket(string,location_of_first_left_bracket)

      if (indexOfRightMatchingSquareBracket > -1){
        return string.substring(0,indexOfRightMatchingSquareBracket+1)
      }
    }

    return false
  }

  
  //If the string starts with one of the pattern strings for or, sequence, quoted string, ws allow both or rule name,
  //return the string containing up to the first pattern string
  //Returns '' if no valid next pattern string is found
  headMatchPattern(string){
    for (let linearParsingNode of this.linearParsingNodes){
      let patternString = linearParsingNode.headMatchFunction.call(this, string)
      if (patternString) return patternString
    }
    return ''
  }

  //WS_ALLOW_BOTH[PATTERN]
  grammarize_WS_ALLOW_BOTH(string){
    var trimmed_string = string.trim()
    var location_of_first_left_square_bracket = trimmed_string.indexOf('[')
    if (location_of_first_left_square_bracket < 0) return null

    var string_before_first_left_square_bracket = trimmed_string.substring(0, location_of_first_left_square_bracket)
    if (string_before_first_left_square_bracket.trim() != 'WS_ALLOW_BOTH') return null

    var location_of_matching_right_square_bracket = this.get_matching_right_square_bracket(trimmed_string, location_of_first_left_square_bracket)
    if (location_of_matching_right_square_bracket < 0){
      return null
    }

    if (location_of_matching_right_square_bracket + 1 != trimmed_string.length) return null
    var string_between_two_square_brackets = trimmed_string.substring(location_of_first_left_square_bracket + 1, location_of_matching_right_square_bracket)

    var inner_pattern = this.grammarize_PATTERN(string_between_two_square_brackets)
    if (inner_pattern != null){
      var newWSAllowBoth = this.createNode({'friendly node type name': 'ws allow both', 'inner pattern': inner_pattern})
  
      return newWSAllowBoth
    }

    return null
  }
  
  grammarize_AND(string){
    var trimmed_string = string.trim()
    var location_of_first_left_square_bracket = trimmed_string.indexOf('[')
    if (location_of_first_left_square_bracket < 0) return null

    var string_before_first_left_square_bracket = trimmed_string.substring(0, location_of_first_left_square_bracket)
    if (string_before_first_left_square_bracket.trim() != 'AND') return null

    var location_of_matching_right_square_bracket = this.get_matching_right_square_bracket(trimmed_string, location_of_first_left_square_bracket)
    if (location_of_matching_right_square_bracket < 0){
      return null
    }

    if (location_of_matching_right_square_bracket + 1 != trimmed_string.length) return null
    var string_between_square_brackets = trimmed_string.substring(location_of_first_left_square_bracket + 1, location_of_matching_right_square_bracket)

    let patterns = this.grammarize_PATTERN_LIST(string_between_square_brackets.trim())
    if (patterns != null){
      let newSequence = this.createNode({'friendly node type name':'and', 'patterns':patterns})

      return newSequence
    }

    return null
  }
  //A pattern list is a set of comma-separated patterns
  //RULE_NAME1,RULE_NAME2, OR[...], SEQUENCE[]
  //PATTERN
  //PATTERN, PATTERN_LIST
  //There are actually two types of pattern lists: or and sequence.
  //This is because it is necessary to know the context of a pattern list in order to know how to interpret it properly later on

  grammarize_PATTERN_LIST(string){
    let patterns = []
    let tempString = string.trim()
    while(tempString != ''){
      let nextPatternString = this.headMatchPattern(tempString)
      if (nextPatternString == ''){
        break
      }
      else{
        let singlePattern = this.grammarize_PATTERN(nextPatternString)
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

  grammarize_SEQUENCE(string){
    var trimmed_string = string.trim()
    if (trimmed_string.length < 'SEQUENCE[]'.length) return null

    var first_few_characters_of_trimmed_string = trimmed_string.substring(0,8)
    if (first_few_characters_of_trimmed_string !== 'SEQUENCE')
    {
      return null
    }

    var location_of_first_left_bracket = trimmed_string.indexOf('[')
    if (location_of_first_left_bracket < 0) return null

    var location_of_last_right_bracket = this.get_matching_right_square_bracket(trimmed_string,location_of_first_left_bracket)
    if (location_of_last_right_bracket < 0) return null
    if (location_of_last_right_bracket != trimmed_string.length - 1) return null
    
    var string_in_between_square_brackets = trimmed_string.substring(location_of_first_left_bracket + 1, location_of_last_right_bracket)

    let patterns = this.grammarize_PATTERN_LIST(string_in_between_square_brackets.trim())
    if (patterns != null){
      let newSequence = this.createNode({'friendly node type name':'sequence', 'patterns':patterns})

      return newSequence
    }

    return null
  }

  grammarize_OR(string){
    //An OR construct is either
    //A) The word OR followed by [], or
    //B)Just the [] by itself

    var trimmed_string = string.trim()

    if (trimmed_string.length < 3){ //minimum string needs to be []
      return null
    }

    var location_of_first_left_bracket = trimmed_string.indexOf('[')
    if (location_of_first_left_bracket < 0) return null

    var location_of_matching_right_bracket = this.get_matching_right_square_bracket(trimmed_string, location_of_first_left_bracket)
    if (location_of_matching_right_bracket < 0) return null
    if (location_of_matching_right_bracket != trimmed_string.length - 1) return null

    var string_before_first_left_bracket = trimmed_string.substring(0,location_of_first_left_bracket).trim()
    if (string_before_first_left_bracket != 'OR') return null

    var string_in_between_two_square_brackets = trimmed_string.substring(location_of_first_left_bracket + 1, location_of_matching_right_bracket)

    var pattern_list = this.grammarize_PATTERN_LIST(string_in_between_two_square_brackets)
    if (pattern_list != null){
      var newOr = this.createNode({'friendly node type name':'or', 'patterns':pattern_list})
      return newOr
    }

    return null
  }

  //A valid RULE_NAME is purely alphabetical, or underscore
  //A valid RULE_NAME must have at least one character in it
  //Exceptions: S_QUOTE, L_SQUARE_BRACKET, R_SQUARE_BRACKET, COMMA
  grammarize_RULE_NAME(string){
    if (string.length < 1) return null
    if (string == 'S_QUOTE'||string == 'L_SQUARE_BRACKET'||string=='R_SQUARE_BRACKET') return null

    if (Strings.contains_only(string, this.validRuleNameCharacters)){
      let ruleNameNode = this.createNode({'friendly node type name':'rule name', 'value':string})
      return ruleNameNode
    }
    return null
  }

  grammarize_QUOTED_STRING(string){
    //First, handle the special cases
    switch(string){
      case 'S_QUOTE':
      case 'L_SQUARE_BRACKET':
      case 'R_SQUARE_BRACKET':
      case 'COMMA':
        let specialString = ''
        if (string == 'S_QUOTE'){
          specialString = '\''
        }else if (string == 'L_SQUARE_BRACKET'){
          specialString = '['
        }else if (string == 'R_SQUARE_BRACKET'){
          specialString = ']'
        }else if (string == 'COMMA'){
          specialString = ','
        }
        return this.createNode({'friendly node type name':'quoted string', 'string':specialString})
    }

    //If all characters are in the range 'A-Za-z0-9', return the string as a node.
    if (string.length < 2){
      return null
    }
    if (string.charAt(0) != '\'') return null
    if (string.charAt(string.length -1) != '\'') return null
    if (Strings.count_occurrences(string, '\'') > 2) return null

    var middle_string = string.substring(1, string.length -1)
    
    var newQuotedString = this.createNode({'friendly node type name':'quoted string', 'string':middle_string})
    return newQuotedString
  }

  grammarize_NOT(string){
    var trimmed_string = string.trim()

    var first_few_characters_of_trimmed_string = trimmed_string.substring(0,'NOT'.length)
    if (first_few_characters_of_trimmed_string !== 'NOT')
    {
      return null
    }

    var location_of_first_left_bracket = trimmed_string.indexOf('[')
    if (location_of_first_left_bracket < 0) return null

    var location_of_last_right_bracket = this.get_matching_right_square_bracket(trimmed_string,location_of_first_left_bracket)
    if (location_of_last_right_bracket < 0) return null
    if (location_of_last_right_bracket != trimmed_string.length - 1) return null
    
    var string_in_between_square_brackets = trimmed_string.substring(location_of_first_left_bracket + 1, location_of_last_right_bracket)

    var pattern = this.grammarize_PATTERN(string_in_between_square_brackets)
    if (pattern != null){
      var newNot = this.createNode({'friendly node type name': 'not', 'pattern': pattern})
      return newNot
    }

    return null
  }
  
  grammarize_OPTIONAL(string){
    var trimmed_string = string.trim()

    var first_few_characters_of_trimmed_string = trimmed_string.substring(0,'OPTIONAL'.length)
    if (first_few_characters_of_trimmed_string !== 'OPTIONAL')
    {
      return null
    }

    var location_of_first_left_bracket = trimmed_string.indexOf('[')
    if (location_of_first_left_bracket < 0) return null

    var location_of_last_right_bracket = this.get_matching_right_square_bracket(trimmed_string,location_of_first_left_bracket)
    if (location_of_last_right_bracket < 0) return null
    if (location_of_last_right_bracket != trimmed_string.length - 1) return null
    
    var string_in_between_square_brackets = trimmed_string.substring(location_of_first_left_bracket + 1, location_of_last_right_bracket)

    var pattern = this.grammarize_PATTERN(string_in_between_square_brackets)
    if (pattern != null){
      var newOptional = this.createNode({'friendly node type name': 'optional', 'pattern': pattern})
      return newOptional
    }

    return null
  }

  grammarize_MULTIPLE(string){
    var trimmed_string = string.trim()

    var first_few_characters_of_trimmed_string = trimmed_string.substring(0,'MULTIPLE'.length)
    if (first_few_characters_of_trimmed_string !== 'MULTIPLE')
    {
      return null
    }

    var location_of_first_left_bracket = trimmed_string.indexOf('[')
    if (location_of_first_left_bracket < 0) return null

    var location_of_last_right_bracket = this.get_matching_right_square_bracket(trimmed_string,location_of_first_left_bracket)
    if (location_of_last_right_bracket < 0) return null
    if (location_of_last_right_bracket != trimmed_string.length - 1) return null
    
    var string_in_between_square_brackets = trimmed_string.substring(location_of_first_left_bracket + 1, location_of_last_right_bracket)

    var pattern = this.grammarize_PATTERN(string_in_between_square_brackets)
    if (pattern != null){
      var newMultiple = this.createNode({'friendly node type name':'multiple', pattern})
  
      return newMultiple
    }

    return null
  }

  grammarize_CHARACTER_CLASS(string){
    var trimmed_string = string.trim()

    var first_few_characters_of_trimmed_string = trimmed_string.substring(0,'CHARACTER_CLASS'.length)
    if (first_few_characters_of_trimmed_string !== 'CHARACTER_CLASS')
    {
      return null
    }

    var location_of_first_left_bracket = trimmed_string.indexOf('[')
    if (location_of_first_left_bracket < 0) return null

    var location_of_last_right_bracket = this.get_matching_right_square_bracket(trimmed_string,location_of_first_left_bracket)
    if (location_of_last_right_bracket < 0) return null
    if (location_of_last_right_bracket != trimmed_string.length - 1) return null
    
    var string_in_between_square_brackets = trimmed_string.substring(location_of_first_left_bracket + 1, location_of_last_right_bracket).trim()

    var quotedString = this.grammarize_QUOTED_STRING(string_in_between_square_brackets)
    if (quotedString != null){
      var newCharacterClass = this.createNode({'friendly node type name':'character class','string':quotedString.string})
      return newCharacterClass
    }

    return null   
  }

  grammarize_EXACT(string){
    var trimmed_string = string.trim()

    var first_few_characters_of_trimmed_string = trimmed_string.substring(0,'EXACT'.length)
    if (first_few_characters_of_trimmed_string !== 'EXACT')
    {
      return null
    }

    var location_of_first_left_bracket = trimmed_string.indexOf('[')
    if (location_of_first_left_bracket < 0) return null

    var location_of_last_right_bracket = this.get_matching_right_square_bracket(trimmed_string,location_of_first_left_bracket)
    if (location_of_last_right_bracket < 0) return null
    if (location_of_last_right_bracket != trimmed_string.length - 1) return null
    
    var string_in_between_square_brackets = trimmed_string.substring(location_of_first_left_bracket + 1, location_of_last_right_bracket)

    var pattern = this.grammarize_PATTERN(string_in_between_square_brackets)
    if (pattern != null){
      var newExact = this.createNode({'friendly node type name': 'exact', 'pattern': pattern})
      return newExact
    }

    return null
  }

  getTypeOfPattern(string){
    for (let i = 0; i < this.linearParsingNodes.length; i++){
      let headMatchResult = this.linearParsingNodes[i].headMatchFunction.call(this,string)
      if (headMatchResult){
        return this.linearParsingNodes[i].constructName
      }
    }
    return ''
  }

  getLinearParsingNodeWithConstructType(constructName){
    for (let linearParsingNode of this.linearParsingNodes){
      if (linearParsingNode.constructName == constructName){
        return linearParsingNode
      }
    }
    return null
  }

  //Give a type of a pattern to match and a string, this function emits a node tree of the type specified by typeOfPattern if string matches
  //the pattern specified by typeOfPattern
  grammarize(typeOfPattern, string){
    let linearParsingNode = this.getLinearParsingNodeWithConstructType(typeOfPattern)
    if (linearParsingNode){
      return linearParsingNode.grammarizeFunction.call(this, string)
    }
    return null
  }

  grammarize_PATTERN(string){
    var trimmed_string = string.trim()
    let typeOfPattern = this.getTypeOfPattern(trimmed_string)
    return this.grammarize(typeOfPattern, trimmed_string)
  }

  //If string is a valid rule, return a rule node
  //If not valid, return null
  grammarize_RULE(string){
    if (!string) return null

    var index_of_equals_sign = string.indexOf('=') 
    if (index_of_equals_sign < 0) return null

    var left_of_equals = string.substring(0, index_of_equals_sign)
    var right_of_equals = string.substring(index_of_equals_sign + 1, string.length)

    if (left_of_equals.length < 1) return null
    if (right_of_equals.length < 1) return null

    var name_node = this.grammarize_RULE_NAME(left_of_equals.trim())
    var pattern_node = this.grammarize_PATTERN(right_of_equals.trim())

    if (name_node == null || pattern_node == null) return null

    var returnNode = this.createNode({'friendly node type name': 'rule', 'pattern': pattern_node, 'name':name_node.value})

    return returnNode
  }

  //If inputString is a valid rule list, return a rule list node, and its corresponding children
  //If not valid, return null
  grammarize_RULE_LIST(inputString){
    if (inputString.length < 1) return null

    let rules = []
    let remainingString = inputString
    
    while(remainingString.length > 0){
      let singleRuleString = this.headMatchRule(remainingString)
      let singleRule = this.grammarize_RULE(singleRuleString)
      if (singleRule){
        rules.push(singleRule)
        remainingString = remainingString.substring(singleRuleString.length).trim()
      }else{
        return null //no valid rule list
      }
    }
    var ruleListNode = this.createNode({'rules': rules,'friendly node type name': 'rule list'})

    return ruleListNode
  }

  //Takes in a string representation of a grammar, and returns a parser
  //The parser is an in-memory tree structure representation of the grammar
  generateParser(string){
    var return_node = this.grammarize_RULE_LIST(string)

    if (return_node == null){
      console.log('Grammar is empty or there was an error in your grammar. Or, there is an error in this parser.')
    }
    return return_node
  }

  //location_of_left_bracket is the bracket you want to match in string
  get_matching_right_square_bracket(string, location_of_left_bracket){
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
    if (grammarNode['friendly node type name'] == 'rule'){
      rules.push(grammarNode)
      return rules
    }else if (grammarNode['friendly node type name'] == 'rule list'){
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
    let matchInformationNodes = this.runningGrammar.match(inputString)
    let matchInformationTree = new Tree(matchInformationNodes)
    this._rawMatches = matchInformationTree
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

