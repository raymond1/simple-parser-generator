//This is the type of node emitted internally by the parser.
//Multiple nodes make up a graph stored in memory that dictate how the
//parser operates.
class Node{
  constructor(metadata){
    this.type = this.constructor.type //Show type in object for the debugger
    this.parser = metadata.parser
    this.id = this.parser.getId()
  }

  //Implemented and overriden by child nodes. Given a node, coverts it into a string form
  M1Export(depth = 0){
    throw new Exception('Error while exporting grammar: ' + node['type'] + ' M1Export not implemented.')
  }
}

//this.rules: an array of rule nodes
class RuleListNode extends Node{
  constructor(metadata){
    super(metadata)
    this.rules = metadata.rules
  }
  static type = 'rule list'

  //If inputString is a valid rule list, return a rule list node, and its corresponding children
  //If not valid, return null
  static grammarize(inputString, parser){
    if (inputString.length < 1) return null

    let rules = []
    let remainingString = inputString
    
    while(remainingString.length > 0){
      let singleRuleString = RuleNode.headMatch(remainingString, parser)
      let singleRule = RuleNode.grammarize(singleRuleString, parser)
      if (singleRule){
        rules.push(singleRule)
        remainingString = remainingString.substring(singleRuleString.length).trim()
      }else{
        return null //no valid rule list
      }
    }
    var ruleListNode = new RuleListNode({'rules': rules, 'parser': parser})

    return ruleListNode
  }

  //H1 encoding notes:
  //Before encoding into human form:
  //ENC( ->becomes ENC(ENC)(
  //Question: how to deal with quotes and spaces and newlines?
  //Quotes are not special
  //Spaces are not special
  //Node names are fixed
  //indentation is fixed
  //rule list
  // rule
  //  name:fasfsfasdf asfsadfsdf "dsfasdfasfasdfENC(NEWLINE)
  //  multiple
  //   string literal
  //    adfasdf

  //M1 encoding notes:
  //> becomes ENC(R_ANGLE_BRACKET)
  //, becomes ENC(COMMA)
  //rule list>rule>asfdasdf,multiple>quoted string>adfasdfasfda,>,
  //Export function exports in M1 format
  //s: output string

  //rule
  //parameter 1: rule name
  //parameter 2: pattern
  M1Export(){
    let s = '[' + this.constructor.type 
    for (let i = 0; i < this['rules'].length; i++){
      s += "," + this['rules'][i].M1Export()
    }

    return s + ']'
  }

  //Given a inputString of characters to match against, the match function returns
  //whether or not the inputString is a RuleListNode
  //If there is a match, then the length of the match is returned
  //This function relies on matching the first rule in the rule list
  match(inputString, metadata = {depth: 0, parent: null}){
    let newMatchNode = new MatchNode()
    let matchInfo = this.rules[0].match(inputString, {depth: 1, parent: newMatchNode})

    Object.assign(newMatchNode, {
      parent: metadata.parent, 
      depth: metadata.depth,
      inputString: inputString.slice(), 
      type: this['type'].slice(),
      id: this.id, 
      serial: this.parser.getMatchCount(),
      matchFound:  matchInfo.matchFound, 
      matchLength: matchInfo.matchLength, 
      matches: [matchInfo],
      matchString: inputString.substring(0, matchInfo.matchLength)
    })
    return newMatchNode
  }
}

class RuleNode extends Node{
  constructor(metadata){
    super(metadata)
    this.name = metadata.name
    this.pattern = metadata.pattern
  }
  static type = 'rule'

  //If string is a valid rule, return a rule node
  //If not valid, return null
  static grammarize(string, parser){
    if (!string) return null

    var index_of_equals_sign = string.indexOf('=') 
    if (index_of_equals_sign < 0) return null

    var left_of_equals = string.substring(0, index_of_equals_sign)
    var right_of_equals = string.substring(index_of_equals_sign + 1, string.length)

    if (left_of_equals.length < 1) return null
    if (right_of_equals.length < 1) return null

    var name_node = RuleNameNode.grammarize(left_of_equals.trim(), parser)
    var pattern_node = Parser.grammarize_PATTERN(right_of_equals.trim(), parser)

    if (name_node == null || pattern_node == null) return null

    return new RuleNode({'pattern': pattern_node, 'name':name_node.string, 'parser': parser})
  }

  static headMatch(string, parser){
    let location_of_first_equals_sign = string.indexOf('=')
    if (location_of_first_equals_sign < 1){
      return ''
    }

    let left_of_first_equals_sign = string.substring(0, location_of_first_equals_sign)
    let trimmed_left_of_first_equals_sign = left_of_first_equals_sign.trim()

    let rule_name = RuleNameNode.grammarize(trimmed_left_of_first_equals_sign, parser)
    if (rule_name == null){
      return ''
    }

    let location_of_first_left_square_bracket = string.indexOf('[')
    let string_between_equals_sign_and_first_left_square_bracket = ''
    let is_keyword = false //is it one of the keywords OR[], AND[], etc.?
    if (location_of_first_left_square_bracket >= 0){
      string_between_equals_sign_and_first_left_square_bracket = string.substring(location_of_first_equals_sign + 1, location_of_first_left_square_bracket)

      let trimmed_string_between_equals_sign_and_first_left_square_bracket = string_between_equals_sign_and_first_left_square_bracket.trim()

      if (Parser.keywords.indexOf(trimmed_string_between_equals_sign_and_first_left_square_bracket) >= 0){
        //This is one of the keywords
        is_keyword = true
      }
    }

    if (location_of_first_left_square_bracket >= 0 && is_keyword){ //if first left square bracket was found

      let location_of_matching_right_square_bracket = Parser.getMatchingRightSquareBracket(string, location_of_first_left_square_bracket)
      if (location_of_matching_right_square_bracket == -1){
        return ''
      }
  
      let next_rule_string = string.substring(0, location_of_matching_right_square_bracket + 1)
      return next_rule_string
    }else{
      //This is a rule name with no brackets
      let leadingWhitespace = Strings.headMatch(string.substring(location_of_first_equals_sign + 1), Strings.whitespace_characters)
      let ruleName = Strings.headMatch(string.substring(location_of_first_equals_sign + 1 + leadingWhitespace.length), Parser.validRuleNameCharacters)
      if (ruleName.length > 0){
        return string.substring(0, location_of_first_equals_sign + leadingWhitespace.length + ruleName.length + 1)
      }
    }
  }

  //s: output string
  M1Export(){
    return `[${this.constructor.type},${Parser.M1Escape(this.name)},${this.pattern.M1Export()}]`
  }

  match(inputString, metadata){
    var newMatchNode = new MatchNode()
    let matchInfo = this.pattern.match(inputString,{depth: metadata.depth + 1, parent: newMatchNode})

    Object.assign(
      newMatchNode, {
        parent: metadata.parent, 
        depth: metadata.depth,
        inputString: inputString.slice(), 
        type: this['type'].slice(),
        id: this.id, 
        serial: this.parser.getMatchCount(),
        matchFound:  matchInfo.matchFound, 
        matchLength: matchInfo.matchLength, 
        matches: [matchInfo],
        matchString: inputString.substring(0, matchInfo.matchLength),

        name: this.name
      }
    )
    return newMatchNode
  }
}

class RuleNameNode extends Node{
  constructor(metadata){
    super(metadata)
    this.string = metadata.string
  }
  static type = 'rule name'

  //A valid RULE_NAME is purely alphabetical, or underscore
  //A valid RULE_NAME must have at least one character in it
  //Exceptions: S_QUOTE, L_SQUARE_BRACKET, R_SQUARE_BRACKET, COMMA
  static grammarize(string, parser){
    if (string.length < 1) return null
    if (string == 'S_QUOTE'||string == 'L_SQUARE_BRACKET'||string=='R_SQUARE_BRACKET') return null

    if (Strings.contains_only(string, Parser.validRuleNameCharacters)){
      return new RuleNameNode({'string':string, parser})
    }
    return null
  }

  static headMatch(string){
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

  M1Export(){
    return `[${this.constructor.type},${this.string}]`
  }

  match(inputString, metadata){
    var newMatchNode = new MatchNode()
    let rule = this.parser.getRule(this.string)
    let matchInfo = rule.match(inputString,{depth: metadata.depth + 1, parent: newMatchNode})

    Object.assign(
      newMatchNode, {
        parent: metadata.parent, 
        depth: metadata.depth,
        inputString: inputString.slice(), 
        type: this['type'].slice(),
        id: this.id, 
        serial: this.parser.getMatchCount(),
        matchFound:  matchInfo.matchFound, 
        matchLength: matchInfo.matchLength, 
        matches: [matchInfo],
        matchString: inputString.substring(0, matchLength),

        string: this.string
      }
    )

    return newMatchNode
  }
}

class NotNode extends Node{
  constructor(metadata){
    super(metadata)
    this.pattern = metadata.pattern
  }
  static type = 'not'

  static headMatch(string){
    return Parser.headMatchXWithBrackets(string, 'NOT')
  }

  static grammarize(string, parser){
    var trimmed_string = string.trim()

    var first_few_characters_of_trimmed_string = trimmed_string.substring(0,'NOT'.length)
    if (first_few_characters_of_trimmed_string !== 'NOT')
    {
      return null
    }

    var location_of_first_left_bracket = trimmed_string.indexOf('[')
    if (location_of_first_left_bracket < 0) return null

    var location_of_last_right_bracket = Parser.getMatchingRightSquareBracket(trimmed_string,location_of_first_left_bracket)
    if (location_of_last_right_bracket < 0) return null
    if (location_of_last_right_bracket != trimmed_string.length - 1) return null
    
    var string_in_between_square_brackets = trimmed_string.substring(location_of_first_left_bracket + 1, location_of_last_right_bracket)

    var pattern = Parser.grammarize_PATTERN(string_in_between_square_brackets, parser)
    if (pattern != null){
      return new NotNode({'pattern': pattern, parser})
    }

    return null
  }

  M1Export(){
    return `[${this.constructor.type},${this.pattern.M1Export()}]`
  }

  match(inputString, metadata){
    var newMatchNode = new MatchNode()
    let matchInfo = this.pattern.match(inputString,{depth: metadata.depth + 1, parent: newMatchNode})

    Object.assign(
      newMatchNode, {
        parent: metadata.parent, 
        depth: metadata.depth,
        inputString: inputString.slice(), 
        type: this['type'].slice(),
        id: this.id, 
        serial: this.parser.getMatchCount(),
        matchFound:  !matchInfo.matchFound, 
        matchLength: matchInfo.matchFound?0:matchInfo.matchLength, 
        matches: [matchInfo],
        matchString: inputString.substring(0, matchLength),

        pattern: this.pattern
      }
    )

    return newMatchNode
  }
}


class SequenceNode extends Node{
  constructor(metadata){
    super(metadata)
    this.patterns = metadata.patterns
  }
  static type = 'sequence'

  static headMatch(string){
    return Parser.headMatchXWithBrackets(string, SequenceNode.type)
  }

  static grammarize(string, parser){
    var trimmed_string = string.trim()
    if (trimmed_string.length < 'SEQUENCE[]'.length) return null

    var first_few_characters_of_trimmed_string = trimmed_string.substring(0,8)
    if (first_few_characters_of_trimmed_string !== 'SEQUENCE')
    {
      return null
    }

    var location_of_first_left_bracket = trimmed_string.indexOf('[')
    if (location_of_first_left_bracket < 0) return null

    var location_of_last_right_bracket = Parser.getMatchingRightSquareBracket(trimmed_string,location_of_first_left_bracket)
    if (location_of_last_right_bracket < 0) return null
    if (location_of_last_right_bracket != trimmed_string.length - 1) return null
    
    var string_in_between_square_brackets = trimmed_string.substring(location_of_first_left_bracket + 1, location_of_last_right_bracket)

    let patterns = Parser.grammarize_PATTERN_LIST(string_in_between_square_brackets.trim(), parser)
    if (patterns != null){
      return new SequenceNode({'patterns':patterns, parser})
    }

    return null
  }

  M1Export(){
    let patternsString = ''
    this.patterns.forEach((pattern, index)=>{
      if (index > 0){
        patternString += ","
      }
      patternsString += `[${pattern.M1Export()}]`
    })
    let s = `[${patternsString}]`
    return s
  }

  match(inputString, metadata){
    var newMatchNode = new MatchNode()
    let tempString = inputString
    let totalMatchLength = 0

    let matches = []
    let matchInfo
    for (let i = 0; i < this['patterns'].length; i++){
      matchInfo = this.patterns[i].match(tempString,{depth: metadata.depth + 1, parent: newMatchNode})
      matches.push(matchInfo)
      if (!matchInfo.matchFound){
        break;
      }else{
        totalMatchLength = totalMatchLength + matchInfo.matchLength
        tempString = tempString.substring(matchInfo.matchLength)
      }
    }
    let matchFound = matchInfo.matchFound
    let matchLength = totalMatchLength

    Object.assign(
      newMatchNode, {
        parent: metadata.parent, 
        depth: metadata.depth,
        inputString: inputString.slice(), 
        type: this['type'].slice(),
        id: this.id, 
        serial: this.parser.getMatchCount(),
        matchFound:  matchFound, 
        matchLength: matchLength, 
        matches,
        matchString: inputString.substring(0, matchLength),
      }
    )

    return newMatchNode
  }
}

class OrNode extends Node{
  constructor(metadata){
    super(metadata)
    this.patterns = metadata.patterns
  }
  static type = 'or'
  
  static headMatch(s){
    return Parser.headMatchXWithBrackets(s, 'OR')
  }

  static grammarize(string, parser){
    //An OR construct is either
    //A) The word OR followed by [], or
    //B)Just the [] by itself

    var trimmed_string = string.trim()

    if (trimmed_string.length < 3){ //minimum string needs to be []
      return null
    }

    var location_of_first_left_bracket = trimmed_string.indexOf('[')
    if (location_of_first_left_bracket < 0) return null

    var location_of_matching_right_bracket = Parser.getMatchingRightSquareBracket(trimmed_string, location_of_first_left_bracket)
    if (location_of_matching_right_bracket < 0) return null
    if (location_of_matching_right_bracket != trimmed_string.length - 1) return null

    var string_before_first_left_bracket = trimmed_string.substring(0,location_of_first_left_bracket).trim()
    if (string_before_first_left_bracket != 'OR') return null

    var string_in_between_two_square_brackets = trimmed_string.substring(location_of_first_left_bracket + 1, location_of_matching_right_bracket)

    var pattern_list = Parser.grammarize_PATTERN_LIST(string_in_between_two_square_brackets, parser)
    if (pattern_list != null){
      return new OrNode({'patterns':pattern_list, parser})
    }

    return null
  }

  M1Export(){
    let patternsString = ''
    this.patterns.forEach((pattern, index)=>{
      if (index > 0) patternsString += ","
      patternsString += pattern.M1Export()
    })
    let s = `[${this.constructor.type},${patternsString}]`
    return s
  }

  match(inputString,metadata){
    var newMatchNode = new MatchNode()

    let matches = []
    let matchInfo
    for (let i = 0; i < this.patterns.length; i++){
      matchInfo = this['patterns'][i].match(inputString,{depth: metadata.depth + 1, parent: newMatchNode})
      matches.push(matchInfo)
      if (matchInfo.matchFound){
        break
      }
    }
    let matchFound = matchInfo.matchFound
    let matchLength = matchInfo.matchLength

    Object.assign(
      newMatchNode, {
        parent: metadata.parent, 
        depth: metadata.depth,
        inputString: inputString.slice(), 
        type: this['type'].slice(),
        id: this.id, 
        serial: this.parser.getMatchCount(),
        matchFound:  matchFound, 
        matchLength: matchLength, 
        matches,
        matchString: inputString.substring(0, matchLength),
      }
    )

    return newMatchNode
  }
}

class AndNode extends Node{
  constructor(metadata){
    super(metadata)
    this.patterns = metadata.patterns
  }
  static type = 'and'

  static grammarize(string, parser){
    var trimmed_string = string.trim()
    var location_of_first_left_square_bracket = trimmed_string.indexOf('[')
    if (location_of_first_left_square_bracket < 0) return null

    var string_before_first_left_square_bracket = trimmed_string.substring(0, location_of_first_left_square_bracket)
    if (string_before_first_left_square_bracket.trim() != 'AND') return null

    var location_of_matching_right_square_bracket = Parser.getMatchingRightSquareBracket(trimmed_string, location_of_first_left_square_bracket)
    if (location_of_matching_right_square_bracket < 0){
      return null
    }

    if (location_of_matching_right_square_bracket + 1 != trimmed_string.length) return null
    var string_between_square_brackets = trimmed_string.substring(location_of_first_left_square_bracket + 1, location_of_matching_right_square_bracket)

    let patterns = Parser.grammarize_PATTERN_LIST(string_between_square_brackets.trim(), parser)
    if (patterns != null){
      return new AndNode({'patterns':patterns, parser})
    }

    return null
  }

  static headMatch(string){
    return Parser.headMatchXWithBrackets(string, 'AND')
  }

  M1Export(){
    let patternsString = ''
    this.patterns.forEach((pattern, index)=>{
      if (index > 0) patternsString += ","
      patternsString += pattern.M1Export()
    })
    let s = `[${this.constructor.type},${patternsString}]`
    return s
  }

  match(inputString,metadata){
    var newMatchNode = new MatchNode()

    let matches = []
    let matchInfo
    let andDetected = true
    let smallestMatchLength = 0 //0 indicates no match
    let tempMatchLength
    let firstIteration = true
      
    for (let i = 0; i < this.patterns.length; i++){
      matchInfo = this['patterns'][i].match(inputString,{depth: metadata.depth + 1, parent: newMatchNode})
      matches.push(matchInfo)
      if (!matchInfo.matchFound){
        andDetected = false
        smallestMatchLength = 0
        break
      }else{
        if (firstIteration){
          smallestMatchLength = matchInfo.matchLength
          firstIteration = false
        }
        else{
          if (matchInfo.matchLength < smallestMatchLength){
            smallestMatchLength = matchInfo.matchLength
          }
        }
      }

    }
      
    //matchLength will be equal to the shortest match, or 0 if there was no match

    let matchFound = andDetected
    matchLength = smallestMatchLength

    Object.assign(
      newMatchNode, {
        parent: metadata.parent, 
        depth: metadata.depth,
        inputString: inputString.slice(), 
        type: this['type'].slice(),
        id: this.id, 
        serial: this.parser.getMatchCount(),
        matchFound:  matchFound, 
        matchLength: matchLength, 
        matches,
        matchString: inputString.substring(0, matchLength),
      }
    )

    return newMatchNode
  }
}

class MultipleNode extends Node{
  constructor(metadata){
    super(metadata)
    this.pattern = metadata.pattern
  }
  static type = 'multiple'

  static grammarize(string, parser){
    var trimmed_string = string.trim()

    var first_few_characters_of_trimmed_string = trimmed_string.substring(0,'MULTIPLE'.length)
    if (first_few_characters_of_trimmed_string !== 'MULTIPLE')
    {
      return null
    }

    var location_of_first_left_bracket = trimmed_string.indexOf('[')
    if (location_of_first_left_bracket < 0) return null

    var location_of_last_right_bracket = Parser.getMatchingRightSquareBracket(trimmed_string,location_of_first_left_bracket)
    if (location_of_last_right_bracket < 0) return null
    if (location_of_last_right_bracket != trimmed_string.length - 1) return null
    
    var string_in_between_square_brackets = trimmed_string.substring(location_of_first_left_bracket + 1, location_of_last_right_bracket)

    var pattern = Parser.grammarize_PATTERN(string_in_between_square_brackets, parser)
    if (pattern != null){
      return new MultipleNode({pattern, parser})
    }

    return null
  }

  static headMatch(string){
    return Parser.headMatchXWithBrackets(string, 'MULTIPLE')
  }

  M1Export(){
    return `[multiple,${this.pattern.M1Export()}]`
  }

  match(inputString, metadata){
    var newMatchNode = new MatchNode()
    let tempString = inputString
    let totalMatchLength = 0

    let matches = []
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
  
    let matchFound = false
    if (matches.length > 0){
      matchFound = true
    }
    
    Object.assign(
      newMatchNode, {
        parent: metadata.parent, 
        depth: metadata.depth,
        inputString: inputString.slice(), 
        type: this['type'].slice(),
        id: this.id, 
        serial: this.parser.getMatchCount(),
        matchFound:  matchFound, 
        matchLength: totalMatchLength,
        matches,
        matchString: inputString.substring(0, totalMatchLength),
      }
    )

    return newMatchNode
  }
}

class StringLiteralNode extends Node{
  constructor(metadata){
    super(metadata)
    this.string = metadata.string
  }

  static type = 'string literal'

  static grammarize(string, parser){
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
        return new StringLiteralNode({'type':'string literal', 'string':specialString, parser})
    }
    
    return new StringLiteralNode({'string':string, parser})
  }

  static headMatch(string){
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

  M1Export(){
    return `[${this.constructor.type},${Parser.M1Escape(this.string)}]`
  }

  match(inputString, metadata){
    let newMatchNode = new MatchNode()
    //matches if inputString starts with the string passed in during object construction
    let matchFound = false
    if (inputString.substring(0, this.string.length) == this.string){
      matchFound = true
    }

    Object.assign(newMatchNode, {
      parent: metadata.parent, 
      depth: metadata.depth,
      inputString: inputString.slice(), 
      type: this['type'].slice(),
      id: this.id, 
      serial: this.parser.getMatchCount(),
      matchFound:  matchFound, 
      matchLength: matchFound?this.string.length:0,
      matches,
      matchString: inputString.substring(0, matchLength),

      string: this.string
    })
    return newMatchNode
  }
}

//Each character class is associated with an initialization string (this.string)
//Given an input string, CharacterClassNode will match with the first n characters of the string
//such that all those characters are one of the initilization characters of the input string.
class CharacterClassNode extends Node{
  constructor(metadata){
    super(metadata)
    this.string = metadata.string
  }

  static type = 'character class'

  static grammarize(string, parser){
    var trimmed_string = string.trim()

    var first_few_characters_of_trimmed_string = trimmed_string.substring(0,'CHARACTER_CLASS'.length)
    if (first_few_characters_of_trimmed_string !== 'CHARACTER_CLASS')
    {
      return null
    }

    var location_of_first_left_bracket = trimmed_string.indexOf('[')
    if (location_of_first_left_bracket < 0) return null

    var location_of_last_right_bracket = Parser.getMatchingRightSquareBracket(trimmed_string,location_of_first_left_bracket)
    if (location_of_last_right_bracket < 0) return null
    if (location_of_last_right_bracket != trimmed_string.length - 1) return null
    
    var string_in_between_square_brackets = trimmed_string.substring(location_of_first_left_bracket + 1, location_of_last_right_bracket).trim()

    var stringLiteral = StringLiteralNode.grammarize(string_in_between_square_brackets, parser)
    if (stringLiteral != null){
      return new CharacterClassNode({'string':stringLiteral.string, parser})
    }

    return null   
  }

  static headMatch(string){
    return Parser.headMatchXWithBrackets(string, 'CHARACTER_CLASS')
  }

  M1Export(){
    return `[${this.constructor.type},${Parser.M1Escape(this.string)}]`
  }

  match(inputString, metadata){
    let newMatchNode = new MatchNode()
    //matches if the inputString starts with characters from the character class
    let matchingString = ''
    //i is the number of characters to take for comparison
    //i goes from 1, 2, 3, ... to the length of the inputString
    for (let i = 1; i <= inputString.length; i++){
      let headString = inputString.substring(0,i)
      if (Strings.contains_only(headString,this['string'])){
        matchingString = headString
      }else{
        break
      }
    }

    let matchFound = false
    let matchLength = 0
    if (matchingString.length > 0){
      matchFound = true
      matchLength = matchingString.length
    }

    Object.assign(newMatchNode, {
      parent: metadata.parent, 
      depth: metadata.depth,
      inputString: inputString.slice(), 
      type: this['type'].slice(),
      id: this.id, 
      serial: this.parser.getMatchCount(),
      matchFound:  matchFound, 
      matchLength,
      matchString: inputString.substring(0, matchLength),
    })
    return newMatchNode
  }
}

class OptionalNode extends Node{
  constructor(metadata){
    super(metadata)
    this.pattern = metadata.pattern
  }

  static type = 'optional'

  static headMatch(string){
    return Parser.headMatchXWithBrackets(string, 'OPTIONAL')
  }

  static grammarize(string, parser){
    var trimmed_string = string.trim()

    var first_few_characters_of_trimmed_string = trimmed_string.substring(0,'OPTIONAL'.length)
    if (first_few_characters_of_trimmed_string !== 'OPTIONAL')
    {
      return null
    }

    var location_of_first_left_bracket = trimmed_string.indexOf('[')
    if (location_of_first_left_bracket < 0) return null

    var location_of_last_right_bracket = Parser.getMatchingRightSquareBracket(trimmed_string,location_of_first_left_bracket)
    if (location_of_last_right_bracket < 0) return null
    if (location_of_last_right_bracket != trimmed_string.length - 1) return null
    
    var string_in_between_square_brackets = trimmed_string.substring(location_of_first_left_bracket + 1, location_of_last_right_bracket)

    var pattern = Parser.grammarize_PATTERN(string_in_between_square_brackets, parser)
    if (pattern != null){
      return new OptionalNode({'pattern': pattern, parser})
    }

    return null
  }

  M1Export(){
    return `[${this.constructor.type},${this.pattern.M1Export()}]`
  }

  match(inputString, metadata){
    let newMatchNode = new MatchNode()
    let matchInfo = this.pattern.match(inputString,{depth: metadata.depth + 1, parent: newMatchNode})

    let matches = []
    let matchLength = 0
    matches.push(matchInfo)

    Object.assign(newMatchNode, {
      parent: metadata.parent, 
      depth: metadata.depth,
      inputString: inputString.slice(), 
      type: this['type'].slice(),
      id: this.id, 
      serial: this.parser.getMatchCount(),
      matchFound:  true, 
      matchLength: matchInfo.matchLength,
      matches,
      matchString: inputString.substring(0, matchLength),
    })
    return newMatchNode
  }
}

//Produces a match if the input string matches the inner pattern match
class EntireNode extends Node{
  constructor(metadata){
    super(metadata)
    this.pattern = metadata.pattern
  }

  static type = 'entire'

  static headMatch(string){
    return Parser.headMatchXWithBrackets(string, 'ENTIRE')
  }

  static grammarize(string, parser){
    var trimmed_string = string.trim()

    var first_few_characters_of_trimmed_string = trimmed_string.substring(0,'ENTIRE'.length)
    if (first_few_characters_of_trimmed_string !== 'ENTIRE')
    {
      return null
    }

    var location_of_first_left_bracket = trimmed_string.indexOf('[')
    if (location_of_first_left_bracket < 0) return null

    var location_of_last_right_bracket = Parser.getMatchingRightSquareBracket(trimmed_string,location_of_first_left_bracket)
    if (location_of_last_right_bracket < 0) return null
    if (location_of_last_right_bracket != trimmed_string.length - 1) return null
    
    var string_in_between_square_brackets = trimmed_string.substring(location_of_first_left_bracket + 1, location_of_last_right_bracket)

    var pattern = Parser.grammarize_PATTERN(string_in_between_square_brackets, parser)
    if (pattern != null){
      return new EntireNode({'pattern': pattern, parser})
    }

    return null
  }

  M1Export(){
    return `[${this.constructor.type},${this.pattern.M1Export()}]`
  }

  match(inputString, metadata){
    let newMatchNode = new MatchNode()
    let matchInfo = this.pattern.match(inputString,{depth: metadata.depth + 1, parent: newMatchNode})

    let matches = []
    let matchLength = 0
    matches.push(matchInfo)

    let matchFound = false
    if (matchInfo.length == inputString.length) matchFound = true

    Object.assign(newMatchNode, {
      parent: metadata.parent, 
      depth: metadata.depth,
      inputString: inputString.slice(), 
      type: this['type'].slice(),
      id: this.id, 
      serial: this.parser.getMatchCount(),
      matchFound:  matchFound, 
      matchLength: matchInfo.matchLength,
      matches,
      matchString: inputString.substring(0, matchLength),
    })
    return newMatchNode
  }
}

//This is the type of object that is emitted during the parsing operation by the parser
class MatchNode{
  constructor(){
    //Defaults will be overridden during matching
    this.matches = []
    this.matchFound = false
    this.matchLength = 0
  }

  shallowDisplay(){
    console.log('begin node')
    for (let attribute in this){
      console.log(attribute + ':' + this[attribute])
    }
    console.log('end node')
  }
}

