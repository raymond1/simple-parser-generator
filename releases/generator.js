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
    var pattern_node = Generator.grammarize_PATTERN(right_of_equals.trim(), parser)

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

      if (Generator.keywords.indexOf(trimmed_string_between_equals_sign_and_first_left_square_bracket) >= 0){
        //This is one of the keywords
        is_keyword = true
      }
    }

    if (location_of_first_left_square_bracket >= 0 && is_keyword){ //if first left square bracket was found

      let location_of_matching_right_square_bracket = Generator.getMatchingRightSquareBracket(string, location_of_first_left_square_bracket)
      if (location_of_matching_right_square_bracket == -1){
        return ''
      }
  
      let next_rule_string = string.substring(0, location_of_matching_right_square_bracket + 1)
      return next_rule_string
    }else{
      //This is a rule name with no brackets
      let leadingWhitespace = Strings.headMatch(string.substring(location_of_first_equals_sign + 1), Strings.whitespace_characters)
      let ruleName = Strings.headMatch(string.substring(location_of_first_equals_sign + 1 + leadingWhitespace.length), Generator.validRuleNameCharacters)
      if (ruleName.length > 0){
        return string.substring(0, location_of_first_equals_sign + leadingWhitespace.length + ruleName.length + 1)
      }
    }
  }

  //s: output string
  M1Export(){
    return `[${this.constructor.type},${Generator.M1Escape(this.name)},${this.pattern.M1Export()}]`
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

    if (Strings.contains_only(string, Generator.validRuleNameCharacters)){
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
    return Generator.headMatchXWithBrackets(string, 'NOT')
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

    var location_of_last_right_bracket = Generator.getMatchingRightSquareBracket(trimmed_string,location_of_first_left_bracket)
    if (location_of_last_right_bracket < 0) return null
    if (location_of_last_right_bracket != trimmed_string.length - 1) return null
    
    var string_in_between_square_brackets = trimmed_string.substring(location_of_first_left_bracket + 1, location_of_last_right_bracket)

    var pattern = Generator.grammarize_PATTERN(string_in_between_square_brackets, parser)
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
    return Generator.headMatchXWithBrackets(string, SequenceNode.type)
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

    var location_of_last_right_bracket = Generator.getMatchingRightSquareBracket(trimmed_string,location_of_first_left_bracket)
    if (location_of_last_right_bracket < 0) return null
    if (location_of_last_right_bracket != trimmed_string.length - 1) return null
    
    var string_in_between_square_brackets = trimmed_string.substring(location_of_first_left_bracket + 1, location_of_last_right_bracket)

    let patterns = Generator.grammarize_PATTERN_LIST(string_in_between_square_brackets.trim(), parser)
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
    return Generator.headMatchXWithBrackets(s, 'OR')
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

    var location_of_matching_right_bracket = Generator.getMatchingRightSquareBracket(trimmed_string, location_of_first_left_bracket)
    if (location_of_matching_right_bracket < 0) return null
    if (location_of_matching_right_bracket != trimmed_string.length - 1) return null

    var string_before_first_left_bracket = trimmed_string.substring(0,location_of_first_left_bracket).trim()
    if (string_before_first_left_bracket != 'OR') return null

    var string_in_between_two_square_brackets = trimmed_string.substring(location_of_first_left_bracket + 1, location_of_matching_right_bracket)

    var pattern_list = Generator.grammarize_PATTERN_LIST(string_in_between_two_square_brackets, parser)
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

    var location_of_matching_right_square_bracket = Generator.getMatchingRightSquareBracket(trimmed_string, location_of_first_left_square_bracket)
    if (location_of_matching_right_square_bracket < 0){
      return null
    }

    if (location_of_matching_right_square_bracket + 1 != trimmed_string.length) return null
    var string_between_square_brackets = trimmed_string.substring(location_of_first_left_square_bracket + 1, location_of_matching_right_square_bracket)

    let patterns = Generator.grammarize_PATTERN_LIST(string_between_square_brackets.trim(), parser)
    if (patterns != null){
      return new AndNode({'patterns':patterns, parser})
    }

    return null
  }

  static headMatch(string){
    return Generator.headMatchXWithBrackets(string, 'AND')
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

    var location_of_last_right_bracket = Generator.getMatchingRightSquareBracket(trimmed_string,location_of_first_left_bracket)
    if (location_of_last_right_bracket < 0) return null
    if (location_of_last_right_bracket != trimmed_string.length - 1) return null
    
    var string_in_between_square_brackets = trimmed_string.substring(location_of_first_left_bracket + 1, location_of_last_right_bracket)

    var pattern = Generator.grammarize_PATTERN(string_in_between_square_brackets, parser)
    if (pattern != null){
      return new MultipleNode({pattern, parser})
    }

    return null
  }

  static headMatch(string){
    return Generator.headMatchXWithBrackets(string, 'MULTIPLE')
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
    return `[${this.constructor.type},${Generator.M1Escape(this.string)}]`
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

    var location_of_last_right_bracket = Generator.getMatchingRightSquareBracket(trimmed_string,location_of_first_left_bracket)
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
    return Generator.headMatchXWithBrackets(string, 'CHARACTER_CLASS')
  }

  M1Export(){
    return `[${this.constructor.type},${Generator.M1Escape(this.string)}]`
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
    return Generator.headMatchXWithBrackets(string, 'OPTIONAL')
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

    var location_of_last_right_bracket = Generator.getMatchingRightSquareBracket(trimmed_string,location_of_first_left_bracket)
    if (location_of_last_right_bracket < 0) return null
    if (location_of_last_right_bracket != trimmed_string.length - 1) return null
    
    var string_in_between_square_brackets = trimmed_string.substring(location_of_first_left_bracket + 1, location_of_last_right_bracket)

    var pattern = Generator.grammarize_PATTERN(string_in_between_square_brackets, parser)
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
    return Generator.headMatchXWithBrackets(string, 'ENTIRE')
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

    var location_of_last_right_bracket = Generator.getMatchingRightSquareBracket(trimmed_string,location_of_first_left_bracket)
    if (location_of_last_right_bracket < 0) return null
    if (location_of_last_right_bracket != trimmed_string.length - 1) return null
    
    var string_in_between_square_brackets = trimmed_string.substring(location_of_first_left_bracket + 1, location_of_last_right_bracket)

    var pattern = Generator.grammarize_PATTERN(string_in_between_square_brackets, parser)
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

/**
 * The Generator class generates in-memory parsers, allows for the export of such parsers into M1 or H1 format 
 * and allows for the import of these formats back into an in-memory parser.
 * 
 * Usage:
 * let parser = new Generator() //Construct a new parser generator
 * parser.setGrammar(grammarDefinitionString) //set input grammar
 * let outputTree = paparserGeneratorrser.parse(inputString) //parse input string
 * 
 * In other words, the grammar that the parser needs to parse is passed into the constructor during the creation on the Generator object
 * Then, the parse function is run, taking in an string representing a small set of data given in the language specified by the language loaded by the Generator object during its construction
 * 
 * The Generator object is a parser generator.
 */
class Generator{
  constructor(){
    this.idCounter = 0
    this.matchCount = 0 //enumerates the matches
  }

  /**
   * Uses console.log to verify that the software has been installed correctly. Running Generator.installCheck() should
   * display a confirmation message that the software is installed.
   * */
  static installCheck(){
    console.log('Simple Generator Generator is installed.')
  }

  static registerNodeTypes(){
    Generator.nodeTypes = []
    Generator.nodeTypes.push(SequenceNode)
    Generator.nodeTypes.push(OrNode)
    Generator.nodeTypes.push(AndNode)
    Generator.nodeTypes.push(MultipleNode)
    Generator.nodeTypes.push(NotNode)
    Generator.nodeTypes.push(OptionalNode)
    Generator.nodeTypes.push(CharacterClassNode)
    Generator.nodeTypes.push(StringLiteralNode)
    Generator.nodeTypes.push(EntireNode)
    //Order matters for getnodetype
    Generator.nodeTypes.push(RuleNameNode)
    Generator.nodeTypes.push(RuleNode)
    Generator.nodeTypes.push(RuleListNode)

    //Note that the rule for the rule list does not have to be in this list because no reference to it will can be made within one of its rules
    //and so it will never get triggered during parsing of the input grammar
  }

  //Returns an array of all node types known by the parser
  static getNodeTypeNames(){
    let nodeTypeNames = []
    for (let nodeType of Generator.nodeTypes){
      nodeTypeNames.push(nodeType.type)
    }
    return nodeTypeNames
  }

  getMatchCount(){
    let matchCount = this.matchCount
    this.matchCount = this.matchCount + 1
    return matchCount
  }

  /*
   * Detects the file format for a given string. Returns "M1", "H1" or "H2" based off of a heuristic analyzing the start of a file.
   # Returns "unknown" for all other file types.
   * 
   * @param {A String object holding an input grammar in H2, H1 or M1 format.} s 
   * @param {A Generator object that will be generating the parser.} parser 
   * @returns {'String'}
   */
  static detectImportLanguage(s, parser){
    //[rule list,
    //rule list
    //<rule name> = <rule>
    if (s.substring(0,'[rule list'.length) == '[rule list'){
      return 'M1'
    }else if (s.substring(0, 'rule list'.length) == 'rule list'){
      return 'H1'
    }else if (RuleNode.headMatch(s, parser) != null){
      return 'H2'
    }else{
      return 'unknown'
    }
  }

  /**
   * Sets the grammar that the parser generator will generate a parser for. The second parameter, language is optional.
   * If specified as one of 'M1', 'H1', or 'H2', that file format will be used to construct a parser in memory. If not specified, 'H2' is assumed.
   * 
   * @param {String} s 
   * @param {String} language 
   */
  setGrammar(s, language='H2'){
    if (language == 'M1'){
      this.grammar = Generator.M1Import(s, this)
    }else if (language == 'H1'){
      this.grammar = Generator.H1Import(s, this)
    }else if (language == 'H2'){
      this.grammar = Generator.H2Import(s, this)
    }else{
      this.grammar = null
    }
    if(this.grammar){
      this.rules = this.getRules(this.grammar)
    }
    else{
      console.log("Error: invalid grammar specification.")
    }
  }


  getId(){
    let currentCounter = this.idCounter
    this.idCounter = this.idCounter + 1
    return currentCounter
  }


  /*
   * 
   * Takes in an input string and feeds it into the in-memory parser after setGrammar has been run.
   * 
   */
  parse(inputString){
    if (this.grammar){
      let matchInformationNodes = this.grammar.match(inputString)
      let matchInformationTree = new Tree(matchInformationNodes)
      this.rawMatches = matchInformationTree
      return this.rawMatches
      // let ruleMatchesTree = matchInformationTree.getRuleMatchesOnly()
      // return ruleMatchesTree  
    }
    else{
      console.log('No grammar has been loaded into the parser.')
    }
  }

  get rawMatches(){
    return this._rawMatches
  }

  set rawMatches(value){
    this._rawMatches = value
  }
}

Generator.registerNodeTypes()
Generator.validRuleNameCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_'
Generator.keywords = ['OR','AND', 'SEQUENCE', 'NOT', 'OPTIONAL', 'MULTIPLE', 'CHARACTER_CLASS', 'ENTIRE']

class Utilities{
	static array_merge(array1,array2){
		let returnArray = []
		for(let element of array1){
			returnArray.push(element)
		}

		for(let element of array2){
			if (returnArray.indexOf(element) == -1){
				returnArray.push(element)
			}
		}
		return returnArray
	}
}

class Tree{
  constructor(treeNode){
    this.root = treeNode
  }

  //returns all nodes in a list
  //Test is a function you can pass in to return only certain nodes
  //If test is passed in and is not null, then if the test function, when it takes matchTree as a parameter evaluates to true, then
  //matchTree will be returned as part of the result set
  returnAllNodes(treeNode, test = null, matchesSoFar = []){
		if (!treeNode){
			return null
		}
		//The default test always returns true, in effect returning all nodes
		if (test == null){
			test = function(){
				return true
			}
		}

		let nodesToReturn = []
		if (test(treeNode) && matchesSoFar.indexOf(treeNode) == -1){
			nodesToReturn.push(treeNode)
		}

		for (let match of treeNode.matches){
			let childNodes = this.returnAllNodes(match, test, nodesToReturn)
			nodesToReturn = Utilities.array_merge(nodesToReturn, childNodes)
		}
		return nodesToReturn
	}

	//Removes a node from a tree and rejoins it
    //          root
	//           |
	//           A
	//          / \
    //          B C
	//         /| |\
	//        / | | \
	//       D  E F  G
	//       |
    //       H
	//       |
	//       I
	//
	//I assume the root cannot be removed. All other nodes can be removed
	//If A is removed, then B and C will be children of the root.
	//If C is removed, then F and G become children of A
	//If D is removed, then H and I become children of B
	//If E is removed, no additional healing of the tree will take place
	removeItemAndHeal(itemToRemove, matchTreeNode = this.root){
		if (itemToRemove == null){
			throw "Cannot remove null from a tree."
		}
		if (matchTreeNode == null){
			throw "Cannot remove an item from an empty tree."
		}

		if (matchTreeNode === itemToRemove){

			//For each match in the current node, if there is a parent, then the parent must add the matches to its matches list
			//All the children must set their parent to the parent of matchTreeNode
			for (let match of matchTreeNode.matches){
				if (matchTreeNode.parent){
					matchTreeNode.parent.matches.push(match)
					match.parent = matchTreeNode.parent
				}
			}

			//If matchTreeNode node has a parent that is not null, then the current node must be removed from its matches list
      if (matchTreeNode.parent){
				for (let i = 0; i < matchTreeNode.parent.matches.length; i++){
					//remove the item
					if (matchTreeNode.parent.matches[i] === matchTreeNode){
						matchTreeNode.parent.matches.splice(i,1)
						break
					}
				}
			}else{
				//If matchTreeNode.parent is null, then
        //matchTreeNode = df
        this.root = matchTreeNode.matches[0]
			}

		}else{
			//item was not found
			//check if children need to be removed
			//All the children must set their parent to the parent of matchTreeNode
			for (let match of matchTreeNode.matches){
				this.removeItemAndHeal(itemToRemove,match)
			}
		}
	}

	//test is a function that sets which nodes to ignore. When test evaluates to true, a node will be ignored from the tree.
	//This function is meant to get rid of certain nodes
	//This function returns a new tree with the same nodes as the old tree, except that nodes that match the test function are deleted
	//Remaining nodes are healed back together
	pruneNodes(test){
		let nodesToPrune = this.returnAllNodes(this.root, test)
		for (let node of nodesToPrune){
			this.removeItemAndHeal(node, this.root)
		}
	}

	//removes branches of the tree that match test
	static _cutNodes(treeNode, test){
		let nodesToCut = []
		for (let i = 0; i < treeNode.matches.length; i++){
			let childNode = treeNode.matches[i]
			if (test(childNode)){
				nodesToCut.push(childNode)
			}
		}

		for (let i = 0; i < nodesToCut.length; i++){
			let index = treeNode.matches.indexOf(nodesToCut[i])
			treeNode.matches.splice(index, 1)
		}

		for (let i = 0; i < treeNode.matches.length; i++){
			Tree._cutNodes(treeNode.matches[i], test)
		}
	}

	//Removes items but does not heal a tree
	cutNodes(test){
		if (test(this.root)){
			this.root = null
			return
		}

		if (this.root){
			Tree._cutNodes(this.root, test)
		}else{
			return
		}
	}

	//Checks if the node and all ancestors have matchFound attribute set to true
	static isSuccessfullyDescendedFromRoot(treeNode){
		if (treeNode.parent == null){
			//If root node
			if (treeNode['matchFound']){
				return true
			}else{
				return false
			}
		}
		else{
			//Not root node
			if (treeNode['matchFound'] == false){
				return false
			}else{
				return Tree.isSuccessfullyDescendedFromRoot(treeNode.parent)
			}	
		}
	}

  //returns a tree consisting only of the rules matched in the user-specified grammar
	//matches are guaranteed to be contiguous
	//Only matches that are from an uninterrupted line of successful matches are returned
  getRuleMatchesOnly(){
		let clonedTree = this.clone()
		clonedTree.cutNodes((treeNode)=>{ return treeNode['matchFound'] == false})
		let successfulRuleNodes = null
		if (clonedTree.root){
			successfulRuleNodes = clonedTree.returnAllNodes(clonedTree.root, 
				(_matchTreeNode)=>{
					return _matchTreeNode.type == 'rule'
				})	
		}

    let notSuccessfulRuleNodes = clonedTree.treeInvert(successfulRuleNodes)
		if (notSuccessfulRuleNodes){
			for (let ruleToRemove of notSuccessfulRuleNodes){
				clonedTree.removeItemAndHeal(ruleToRemove)
			}	
		}

    let returnValue = new Tree(clonedTree.root)
    returnValue.resetDepth(returnValue.root, 0)
    return returnValue
  }
  
  resetDepth(treeNode,depth){
    if(!treeNode){
      //In case treeNode is null or undefined
      return
    }
    treeNode.depth = depth
    for (let match of treeNode.matches){
      this.resetDepth(match, depth + 1)
    }
  }

	//Given a set of nodes in a list, this function returns all elements in domain which are not in the list of nodes passed in
	treeInvert(selectedNodeList, matchTreeNode = this.root){
		if (!selectedNodeList){
			return this.returnAllNodes(matchTreeNode)
		}

		let test = this.returnAllNodes(matchTreeNode, (_matchTreeNode)=>{
			let booleanValue = selectedNodeList.includes(_matchTreeNode)
			return !booleanValue
		})
		return test
  }
  
  //Returns a tree which is a copy of the passed in tree
  clone(){
    let treeNodesCopy = this.innerClone(this.root)
    let newTree = new Tree(treeNodesCopy)
    return newTree
  }

  //clones scalar attributes(not arrays)
  //updates the parent element to refer to the clone tree rather than the parent tree
	innerClone(matchTreeNode){
		let newTreeNode = this.shallowCopy(matchTreeNode)
    newTreeNode.matches = []
    if (matchTreeNode.matches){
      for (let match of matchTreeNode.matches){
        let matchClone = this.innerClone(match)
        newTreeNode.matches.push(matchClone)
        matchClone.parent = newTreeNode
      }
    }

		return newTreeNode
	}

	//copies all attributes one node, except for matches
	shallowCopy(treeNode){
		if (treeNode == null){
			return null
		}

		let newNode = {}
		for (let attribute in treeNode){
			if (!Array.isArray(treeNode[attribute])){
				newNode[attribute]=treeNode[attribute]
			}
    }

		return newNode
  }
/*
	//performs a shallow operation on all nodes that match selectionTest and are not null
	recursiveApply(matchNode = this.root, operation, selectionTest){
		if (matchNode){
			if (selectionTest(matchNode)){
				operation(matchNode)
			}

			for (let match of matchNode.matches){
				this.recursiveApply(match,operation,selectionTest)
			}
		}
  }
  */
}

//For string functions
function Strings(){}

//Takes in a list of strings(array_of_needles), matches them one by one with the string haystack starting at offset index
//Finds the longest match, or returns 'match found' as false if no match was found
Strings.get_longest_matching_string_at_index = function(array_of_needles, haystack, index){
  var matched_needles = []
  var j = 0
  for (var i = 0; i < array_of_needles.length; i++){
    if (haystack.indexOf(array_of_needles[i] == index)){
      matched_needles[j] = array_of_needles[i]
      j++
    }
  }
  if (j == 0){
    //no matches
    return {'match found': false}
  }

  var longest_match = Strings.get_longest_string(matched_needles)['longest string']

  return {'match found': true, 'longest match': longest_match}
}

Strings.is_alphabetical = function(string){
  if (Strings.contains_only(string, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz')){
    return true
  }
  return false
}

//Goes through the list of needles, and searches for their position in haystack.
//Returns the earliest needle position, if any
//If found, returns found as true, and the location
//If none found, returns found as false, and the location is -1
//{'found': true/false, 'location': location found}
Strings.find_earliest_matching_string_index = function(haystack, list_of_needles){

  //assumes there is at least one needle
  var found_index = -1
  var found = false

  for (var i = 0; i < list_of_needles.length; i++){
    var index_of_needle = haystack.indexOf(list_of_needles[i])

    if (found == false){
      if (index_of_needle > 0){
        found = true
        found_index = index_of_needle
      }
    }
    else{
      if (index_of_needle < found_index){
        found_index = index_of_needle
      }
    }
  }

  return {'found': found, 'location': found_index}
}


Strings.whitespace_characters = ' \n\t'

//Returns true if string consists only of characters from the allowed_characters string
Strings.contains_only = function(string, allowed_characters){
  for (var i = 0; i < string.length; i++){
    if (allowed_characters.indexOf(string.charAt(i)) < 0){
      return false
    }
  }
  return true
}

//checks if string contains one or mor characters from character_class
Strings.contains_character_class = function(string, character_class){
  for (var i = 0; i < string.length; i++){
    if (character_class.indexOf(string.charAt(i)) >= 0){
      return true
    }
  }
  return false
}

//Counts the number of occurrences of character in string
Strings.count_occurrences = function(string, character){
  var count = 0

  for (var i = 0; i < string.length; i++){
    var current_character = string.charAt(i)
    if (current_character == character) count++
  }

  return count
}

//operates in two modes, depending on the type of JavaScript object passed in as the variable conditionOrString
//Mode 1, when conditionOrString is a string:
//Returns the longest substring starting at index 0 of string whose characters belong to conditionOrString
//For example, if string is 'test', and character list is 'et', then the string 'te' is returned because
//the first two letters of test are found within the character list

//Mode 2, when conditionOrString is a function
//
Strings.headMatch = function(string, conditionOrString){
  let i = 0;
  let returnString = ''
  for (i = 1; i < string.length + 1; i++){
    let tempString = string.substring(0, i)
    if (typeof conditionOrString == 'string'){
      if (Strings.contains_only(tempString, conditionOrString)){
        returnString = tempString
      }
      else{
        break
      }
    }else if (typeof conditionOrString == 'function'){
      if (conditionOrString(tempString)){
        returnString = tempString
      }
      else{
        break
      }
    }
  }
  return returnString  
}

//returns all strings up to but not including the delimiter; or the empty string if a delimiter is not found.
Strings.headMatchUntilDelimiter = function(string, delimiter){
  for (let i = 0; i < string.length; i++){
    if (string.substring(i, i + delimiter.length) == delimiter){
      return string.substring(0, i)
    }
  }
  return ''
}


class TreeViewer{
  constructor(tree, parentElement){
    this.tree = tree
    this.parentElement = parentElement
    if (parentElement){
      this.domElement = document.createElement('pre')
      this.parentElement.appendChild(this.domElement)
    }
  }

  getOutputString(metadata){
    if (metadata == null){
      return '(null)\n'
    }

    let starIndent = 0
    if (metadata){
      if (metadata['depth']){
        starIndent = metadata['depth']
      }
    }
    let outputString = '  '.repeat(starIndent) + '*****************************\n'

    if (Array.isArray(metadata)){
      outputString += "(array begin)\n"
    }

    if (typeof metadata == 'undefined'){
      outputString += "(undefined)\n"
    }

    for (let key in metadata){
      let keyValue = metadata[key]

      //If the keyValue is an object,
      if (typeof keyValue == 'object'){
        if (key !='parent'){
          if (keyValue !== null){
            if (Array.isArray(keyValue)){
              for (let j = 0; j < keyValue.length; j++){
                outputString += this.getOutputString(keyValue[j])
              }
            }else{
              outputString += this.getOutputString(keyValue)
            }
          }
        }
        else
        {
          outputString += '  '.repeat(starIndent) + key + ":" + keyValue.id + '\n'
        }
      }else{
        outputString += '  '.repeat(starIndent) + key + ":" + keyValue + '\n'
      }
    }

    if (Array.isArray(metadata)){
      outputString += "(array end)\n"
    }

    return outputString
  }
  
  display(metadata){
    let outputString = ''
    if (typeof metadata == 'undefined'){
      metadata = this.tree.root
    }
    outputString = this.getOutputString(metadata)

    //There are two display modes: to display in the console, or to display in the DOM on the browser
    if (!this.parentElement){
      console.log(outputString)
    }else{
      let outputTextNode = document.createTextNode(outputString)
      this.domElement.appendChild(outputTextNode)
    }
  }
}

//DOMTreeNode connects nodes with domElements
//A DOMTreeNode is not the node data it contains
//A DOMTreeNode is not the domElement that is clicked on
class DOMTreeNode{
  constructor(node, parentElement){
    this.children = []
    this.node = node
    this.parentElement = parentElement
    this.expanded = false
    
    let ul = document.createElement('ul')
    this.domElement = ul
    this.parentElement.appendChild(ul)

    ul.style.border = '4px black solid'
    ul.style.width = '100%'
    ul.style.background = '#fff'
    let li = document.createElement('li')
    li.style.width = '100%'
    li.style.background = '#fff'

    let nodeType = node.constructor.name
    let nodeTypeTextNode = document.createTextNode(nodeType)
    li.appendChild(nodeTypeTextNode)
    ul.appendChild(li)


    //For each node attribute display it
    for (let attribute of node.attributes){
      let attributeList = document.createElement('ul')
      li.appendChild(attributeList)

      let attributeDOMElement = document.createElement('li')
      attributeList.appendChild(attributeDOMElement)

      let attributeValue = node[attribute]
      let attributeText = attribute + '=' + attributeValue

      //if node[node.attributes[i]] is an object, it will say 'object'. Instead of showing that, show the name of the attribute instead
      if (Array.isArray(attributeValue)||typeof attributeValue == 'object'){
        attributeText = attribute
      }

      let attributeTextNode = document.createTextNode(attributeText)

      attributeDOMElement.appendChild(attributeTextNode)
      if (Array.isArray(attributeValue)){
        //attributeValue in this block is an array
        for (let j = 0; j < attributeValue.length; j++){
              this.children.push(new DOMTreeNode(attributeValue[j], attributeDOMElement))
        }
      }else if (typeof attributeValue == 'object'){
        this.children.push(new DOMTreeNode(attributeValue, attributeDOMElement))
      }

    }
  }

  highlight(){
    let ul = this.domElement
    ul.style.backgroundColor = "#ff0"
  }
  unhighlight(){
    let ul = this.domElement
    ul.style.backgroundColor = "#fff"
  }
}
export {Generator, TreeViewer}
export default Generator

