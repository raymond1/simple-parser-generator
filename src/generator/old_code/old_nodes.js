/**
 * RuleListNode is basically a program: a list of rules.
 * this.rules: an array of rule nodes
 * */
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

  match(inputString, metadata = {depth: 0, parent: null}){
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

  match(inputString, metadata = {depth: 0, parent: null}){
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
