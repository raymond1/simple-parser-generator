class Node{
  constructor(parser){
    if (parser){
      this.parser = parser
      this.id = this.parser.getId()
    }
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

  //Originally used for debugging purposes
  saveData(object){
    object.id = this.id
    this.parser.matchRecorder.push(object)
    return object
  }
}

class RuleList extends Node{
  constructor(parser, rulesArray){
    super(parser)
    this['rules'] = rulesArray
    this['friendly node type name'] = 'rule list'
  }
  
  //produces rule nodes as long as they are found
  match(string, metadata = {depth: 0, parentId: null}){
    let matchFound = false //indicates if rulelist is valid
    let ruleMatched = false //used in the do loop to determine if any of the rules match
    let tempString = string

    let internalMatches = [] //internalMatches refers to the rules that are matched while matching a rule list
    do{
      ruleMatched = false
      let matchInformation = null
      for (let i = 0; i < this.rules.length; i++){
        matchInformation = this.rules[i].match(tempString, {depth: 1, parentId: this.id})
        if (matchInformation.matchFound){
          ruleMatched = true
          break
        }
      }
      internalMatches.push(matchInformation)

      if (ruleMatched){
        tempString = tempString.substring(matchInformation.matchLength)
      }else{
        break
      }
    }while(ruleMatched&&tempString != '')

    let totalLength = 0
    if (ruleMatched){
      for (let i = 0; i < internalMatches.length; i++){
        totalLength = totalLength + internalMatches[i].matchLength
      }
      matchFound = true
    }

    let returnValue = {type: this['friendly node type name'],id: this.id, depth: metadata.depth, matchFound, matchLength: totalLength, matchString: string.substring(0, totalLength), internalMatches: internalMatches}

    this.saveData(returnValue)
    return returnValue
  }
}

class Rule extends Node{
  constructor(parser, pattern, name){
    super(parser)
    this['friendly node type name'] = 'rule'
    this['pattern'] = pattern
    this['name'] = name
  }

  match(string,metadata){
    let matchInfo = this.pattern.match(string,{depth: metadata.depth + 1, parentId: this.id})
    let matchLength = matchInfo.matchLength
    let internalMatches = matchInfo

    let returnValue = {type: this['friendly node type name'], id: this.id, depth: metadata.depth, matchFound: matchInfo.matchFound, matchLength, matchString: string.substring(0, matchLength), name: this.name, internalMatches: internalMatches}

    this.saveData(returnValue)
    return returnValue
  }
}

//When matching a rule name, it has to match with an entry in the rule table...
//So... I need a rule table first...
class RuleName extends Node{
  constructor(parser, name){
    super(parser)
    this['value']=name
    this['friendly node type name']='rule name'
  }

  match(string,metadata){
    let rule = this.parser.getRule(this.value)
    let matchInfo = rule.match(string,{depth: metadata.depth + 1, parentId: this.id})

    let returnValue = {type: this['friendly node type name'], id: this.id, depth: metadata.depth, matchFound: matchInfo.matchFound, matchLength: matchInfo.matchLength, matchString: string.substring(0, matchInfo.matchLength), value: this.value, internalMatches: matchInfo}

    this.saveData(returnValue)
    return returnValue
  }
}

//untested
class Not extends Node{
  constructor(parser,pattern){
    super(parser)
    this['pattern']=pattern
    this['friendly node type name']='not'
  }

  match(string,metadata){
    let innerMatchInfo = this['pattern'].match(string,{depth: metadata.depth + 1, parentId: this.id})

    let matchLength = 0
    let matchFound = !innerMatchInfo.matchFound
    if (matchFound){
      matchLength = string.length
    }
    let returnValue = {type: this['friendly node type name'], id: this.id, depth: metadata.depth, matchFound: matchFound, matchLength, matchString: string.substring(0, matchLength), internalMatches: innerMatchInfo}

    this.saveData(returnValue)

    return returnValue
  }
}

//WS_ALLOW_BOTH must take a parameter
//Assumes you are not going to use WS_ALLOW_BOTH on a whitespace character
class WSAllowBoth extends Node{
  constructor(parser,innerPattern){
    super(parser)
    this['inner pattern']=innerPattern
    this['friendly node type name']='ws allow both'
  }

  match(string,metadata){
    let matchLength = 0
    let leadingWhitespace = Strings.headMatch(string, Strings.whitespace_characters)

    let remainderString = string.substring(leadingWhitespace.length)
    let matchInfo = this['inner pattern'].match(remainderString,{depth: metadata.depth + 1, parentId: this.id})
    if (matchInfo.matchFound){
      let afterInnerPattern = remainderString.substring(matchInfo.matchLength)
      let trailingWhitespace = Strings.headMatch(afterInnerPattern, Strings.whitespace_characters)
      matchLength = leadingWhitespace.length + matchInfo.matchLength + trailingWhitespace.length
    }
    let returnValue = {type: this['friendly node type name'], id: this.id, depth: metadata.depth, matchFound: matchInfo.matchFound, matchLength, matchString: string.substring(0, matchLength), internalMatches: matchInfo}
    this.saveData(returnValue)

    return returnValue
    
    //is it just the pattern with no white space at the front?
    //is there whitespace in the front?
    //If yes, is it followed by the pattern?
    //If yes, is it followed by whitespace?
  }
}

class Sequence extends Node{
  constructor(parser,patterns){
    super(parser)
    this['patterns']=patterns
    this['friendly node type name']='sequence'
  }

  match(string,metadata){
    let tempString = string
    let totalMatchLength = 0

    let matchInfoList = []
    let matchInfo
    for (let i = 0; i < this['patterns'].length; i++){
      matchInfo = this['patterns'][i].match(tempString,{depth: metadata.depth + 1, parentId: this.id})
      matchInfoList.push(matchInfo)
      if (!matchInfo.matchFound){
        break;
      }else{
        totalMatchLength = totalMatchLength + matchInfo.matchLength
        tempString = tempString.substring(matchInfo.matchLength)
      }
    }

    let returnValue = {type: this['friendly node type name'], id: this.id, depth: metadata.depth, matchFound: matchInfo.matchFound, matchLength: totalMatchLength, matchString: string.substring(0, totalMatchLength), internalMatches: matchInfoList}

    this.saveData(returnValue)

    return returnValue
  }
}

class Or extends Node{
  //patternList is an array
  constructor(parser,patterns){
    super(parser)
    this['patterns']=patterns
    this['friendly node type name']='or'
  }

  match(string,metadata){
    let matchInfoList = []
    let matchInfo
    for (let i = 0; i < this.patterns.length; i++){
      matchInfo = this['patterns'][i].match(string,{depth: metadata.depth + 1, parentId: this.id})
      matchInfoList.push(matchInfo)
      if (matchInfo.matchFound){
        break
      }
    }

    let returnValue = {type: this['friendly node type name'], id: this.id, depth: metadata.depth, matchFound: matchInfo.matchFound, matchLength: matchInfo.matchLength, matchString: string.substring(0, matchInfo.matchLength), internalMatches: matchInfoList}

    this.saveData(returnValue)

    return returnValue
  }
}

class Multiple extends Node{
  constructor(parser,pattern){
    super(parser)
    this['pattern']=pattern
    this['friendly node type name']='multiple'
  }

  match(string,metadata){
    let tempString = string
    let totalMatchLength = 0

    let matchInfoList = []
    let matchInfo = this.pattern.match(tempString,{depth: metadata.depth + 1, parentId: this.id})
    if (matchInfo.matchFound){
      matchInfoList.push(matchInfo)
    }
    while(matchInfo.matchFound){
      totalMatchLength = totalMatchLength + matchInfo.matchLength
      tempString = tempString.substring(matchInfo.matchLength)
      matchInfo = this.pattern.match(tempString,{depth: metadata.depth + 1, parentId: this.id})
      matchInfoList.push(matchInfo)
    }
    let matchFound = false
    if (matchInfoList.length > 0){
      matchFound = true
    }
    let returnValue = {type: this['friendly node type name'], id: this.id, depth: metadata.depth, matchFound, matchLength: totalMatchLength, matchString: string.substring(0, totalMatchLength), internalMatches: matchInfoList}
    this.saveData(returnValue)
    return returnValue
  }
}


class Pattern extends Node{
  constructor(parser,innerPattern){
    super(parser)
    this['friendly node type name']='pattern'
    this['inner pattern']=innerPattern//is it a 'quoted string', an 'or', a 'sequence', a 'rule name', or a 'ws allow both'?
  }

  match(string,metadata){
    let matchInfo = this['inner pattern'].match(string,{depth: metatdata.depth + 1, parentId: this.id})
    let returnValue = {type: this['friendly node type name'], id: this.id, depth: metadata.depth, matchFound: matchInfo.matchFound, matchLength: matchInfo.matchLength, matchString: string.substring(0, matchInfo.matchLength), internalMatches: matchInfo}
    this.saveData(returnValue)

    return matchInfo
  }
}


//A Quoted string in the input grammar is a ' followed by a string followed by a '
//Currently, there is no such thing as an empty string ''. You must have something in between.
//The string in between the two quotes is used to match
class QuotedString extends Node{
  constructor(parser,string){
    super(parser)
    this['string']=string
    this['friendly node type name']='quoted string'
  }

  match(string,metadata){
    let internalString = this['string']
    
    let matchFound = false
    if (string.substring(0, internalString.length) == internalString){
      matchFound = true
    }

    let matchLength = 0
    if (matchFound){
      matchLength = internalString.length
    }
    let returnValue = {type: this['friendly node type name'], id: this.id, depth: metadata.depth, matchFound: matchFound, matchLength, matchString: string.substring(0, matchLength), string: this.string, internalMatches: null}

    this.saveData(returnValue)

    return returnValue
  }
}

//untested
class CharacterClass extends Node{
  constructor(parser,quotedString){
    super(parser)
    this['friendly node type name']='character class'
    this['string']=quotedString.string//is it a 'quoted string', an 'or', a 'sequence', a 'rule name', or a 'ws allow both'?
  }

  match(string,metadata){
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

    let matchFound = false
    if (matchingString.length > 0){
      matchFound = true
    }

    let returnValue = {type: this['friendly node type name'], id: this.id, depth: metadata.depth, matchFound: matchFound, matchLength: matchingString.length, matchString: string.substring(0, matchingString.length), internalMatches: null}
    this.saveData(returnValue)

    return returnValue
  }

}


//Usage: let parser = new Parser()
//parser.setGrammar(grammarDefinitionString)
//parser.parse(input_string)
//In other words, the grammar that the parser needs to parse is passed into the constructor during the creation on the Parser object
//Then, the parse function is run, taking in an input_string representing a small set of data given in the language specified by the language loaded by the Parser object during its construction
class Parser{
  constructor(){
    this.validRuleNameCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_'
    this.matchRecorder = [] //collects the names of the classes whose match functions were run
    this.idCounter = 0
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

  //Returns the or construct portion of a string if found, or the empty string if not found
  //The string must be at the beginning of the string
  headMatchOr(string){
    let matchWithOrKeyword = this.headMatchXWithBrackets(string, 'OR')
    if (matchWithOrKeyword){
      return matchWithOrKeyword
    }

    let matchWithNoBrackets = this.headMatchXWithBrackets(string, '')
    if (matchWithNoBrackets){
      return matchWithNoBrackets
    }
    return ''
  }

  headMatchSequence(string){
    return this.headMatchXWithBrackets(string, 'SEQUENCE')
  }

  headMatchNot(string){
    return this.headMatchXWithBrackets(string, 'NOT')
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
    if (location_of_first_left_square_bracket >= 0){ //if first left square bracket was found
      let location_of_matching_right_square_bracket = this.get_matching_right_square_bracket(string, location_of_first_left_square_bracket)
      if (location_of_matching_right_square_bracket == -1){
        return ''
      }
  
      let next_rule_string = string.substring(0, location_of_matching_right_square_bracket + 1)
      return next_rule_string
    }else{
      let leadingWhitespace = Strings.headMatch(string.substring(location_of_first_equals_sign + 1), Strings.whitespace_characters)
      let ruleName = Strings.headMatch(string.substring(location_of_first_equals_sign + 1 + leadingWhitespace.length), this.validRuleNameCharacters)
      if (ruleName.length > 0){
        return string.substring(0, location_of_first_equals_sign + leadingWhitespace.length + ruleName.length + 1)
      }
    }
  }

  headMatchMultiple(string){
    return this.headMatchXWithBrackets(string, 'MULTIPLE')
  }

  //checks if string matches the pattern CHARACTER_CLASS[] and returns the matching string
  headMatchCharacterClass(string){
    return this.headMatchXWithBrackets(string, 'CHARACTER_CLASS')
  }

  //checks if string matches the pattern CHARACTER_CLASS[] and returns the matching string
  headMatchWSAllowBoth(string){
    return this.headMatchXWithBrackets(string, 'WS_ALLOW_BOTH')
  }
  
  //If the string starts with one of the pattern strings for or, sequence, quoted string, ws allow both or rule name,
  //return the string containing up to the first pattern string
  //Returns '' if no valid next pattern string is found
  headMatchPattern(string){
    let patternString = this.headMatchQuotedString(string)
    if (patternString){
      return patternString
    }

    patternString = this.headMatchOr(string)
    if (patternString){
      return patternString
    }

    patternString = this.headMatchSequence(string)
    if (patternString){
      return patternString
    }

    patternString = this.headMatchMultiple(string)
    if (patternString){
      return patternString
    }

    patternString = this.headMatchCharacterClass(string)
    if (patternString){
      return patternString
    }

    patternString = this.headMatchWSAllowBoth(string)
    if (patternString){
      return patternString
    }

    patternString = this.headMatchRuleName(string)
    if (patternString){
      return patternString
    }

    return ''
  }

  //WS_ALLOW_BOTH[PATTERN]
  grammarize_WS_ALLOW_BOTH(input_string){
    var trimmed_input_string = input_string.trim()
    var location_of_first_left_square_bracket = trimmed_input_string.indexOf('[')
    if (location_of_first_left_square_bracket < 0) return null

    var string_before_first_left_square_bracket = trimmed_input_string.substring(0, location_of_first_left_square_bracket)
    if (string_before_first_left_square_bracket.trim() != 'WS_ALLOW_BOTH') return null

    var location_of_matching_right_square_bracket = this.get_matching_right_square_bracket(trimmed_input_string, location_of_first_left_square_bracket)
    if (location_of_matching_right_square_bracket < 0){
      return null
    }

    if (location_of_matching_right_square_bracket + 1 != trimmed_input_string.length) return null
    var string_between_two_square_brackets = trimmed_input_string.substring(location_of_first_left_square_bracket + 1, location_of_matching_right_square_bracket)

    var inner_pattern = this.grammarize_PATTERN(string_between_two_square_brackets)
    if (inner_pattern != null){
      var new_node = new WSAllowBoth(this,inner_pattern)
      return new_node
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

  grammarize_SEQUENCE(input_string){
    var trimmed_string = input_string.trim()
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
      let new_node = new Sequence(this,patterns)
      return new_node
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
    if (string_before_first_left_bracket != 'OR' && string_before_first_left_bracket != '') return null

    var string_in_between_two_square_brackets = trimmed_string.substring(location_of_first_left_bracket + 1, location_of_matching_right_bracket)

    var pattern_list = this.grammarize_PATTERN_LIST(string_in_between_two_square_brackets)
    if (pattern_list != null){
      var return_node = new Or(this,pattern_list)
      return return_node
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
      let returnNode = new RuleName(this,string)
      return returnNode
    }
    return null
  }

  grammarize_QUOTED_STRING(string){
    //First, handle the exceptions
    if (string == 'S_QUOTE'){
      return new QuotedString(this, '\'')
    }else if (string == 'L_SQUARE_BRACKET'){
      return new QuotedString(this, '[')
    }else if (string == 'R_SQUARE_BRACKET'){
      return new QuotedString(this, ']')
    }else if (string == 'COMMA'){
      return new QuotedString(this, ',')
    }
    
    //If all characters are in the range 'A-Za-z0-9', return the string as a node.
    if (string.length < 2){
      return null
    }
    if (string.charAt(0) != '\'') return null
    if (string.charAt(string.length -1) != '\'') return null
    if (Strings.count_occurrences(string, '\'') > 2) return null

    var middle_string = string.substring(1, string.length -1)
    
    var new_node = new QuotedString(this, middle_string)
    return new_node
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
      var new_node = new Not(this,pattern)
      return new_node
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
      var new_node = new Multiple(this,pattern)
      return new_node
    }

    return null
  }

  grammarize_CHARACTER_CLASS(input_string){
    var trimmed_string = input_string.trim()

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
      var new_node = new CharacterClass(this,quotedString)
      return new_node
    }

    return null   
  }

  grammarize_PATTERN(input_string){
    var trimmed_input_string = input_string.trim()
    if (this.headMatchQuotedString(trimmed_input_string)){
      //The quoted string needs to be matched first because of the exceptions
      //L_SQUARE_BRACKET, R_SQUARE_BRACKET, COMMA, S_QUOTE
      var quoted_string = this.grammarize_QUOTED_STRING(trimmed_input_string)
      if (quoted_string != null){
        return quoted_string
      }  
    }else if (this.headMatchNot(trimmed_input_string)){
      var not_construct = this.grammarize_NOT(trimmed_input_string)
      if (not_construct != null){
        return not_construct
      }
    }
    else if (this.headMatchOr(trimmed_input_string)){
      var or_construct = this.grammarize_OR(trimmed_input_string)
      if (or_construct != null){
        return or_construct
      }  
    }else if (this.headMatchSequence(trimmed_input_string)){
      var sequence_construct = this.grammarize_SEQUENCE(trimmed_input_string)
      if (sequence_construct != null){
        return sequence_construct
      }  
    }else if (this.headMatchMultiple(trimmed_input_string)){
      var multiple = this.grammarize_MULTIPLE(trimmed_input_string)
      if (multiple != null){
        return multiple
      }  
    }else if (this.headMatchCharacterClass(trimmed_input_string)){
      let characterClass = this.grammarize_CHARACTER_CLASS(trimmed_input_string)
      if (characterClass){
        return characterClass
      }
    }else if (this.headMatchWSAllowBoth(trimmed_input_string)){
      var ws_allow_both_construct = this.grammarize_WS_ALLOW_BOTH(trimmed_input_string)
      if (ws_allow_both_construct != null){
        return ws_allow_both_construct
      }
    }
    else if (this.headMatchRuleName(trimmed_input_string)){
      var rule_name = this.grammarize_RULE_NAME(trimmed_input_string)
      if (rule_name != null){
        return rule_name
      }  
    }

    return null
  }

  //If input_string is a valid rule, return a rule node
  //If not valid, return null
  grammarize_RULE(input_string){
    if (!input_string) return null

    var index_of_equals_sign = input_string.indexOf('=') 
    if (index_of_equals_sign < 0) return null

    var left_of_equals = input_string.substring(0, index_of_equals_sign)
    var right_of_equals = input_string.substring(index_of_equals_sign + 1, input_string.length)

    if (left_of_equals.length < 1) return null
    if (right_of_equals.length < 1) return null

    var name_node = this.grammarize_RULE_NAME(left_of_equals.trim())
    var pattern_node = this.grammarize_PATTERN(right_of_equals.trim())

    if (name_node == null || pattern_node == null) return null

    var return_node = new Rule(this,pattern_node, name_node.value)

    return return_node
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
    var return_node = new RuleList(this,rules)
    return return_node
  }

  //Takes in a string representation of a grammar, and returns a parser
  //The parser is an in-memory tree structure representation of the grammar
  generateParser(input_string){
    var return_node = this.grammarize_RULE_LIST(input_string)

    if (return_node == null){
      console.log('Grammar is empty or there was an error in your grammar. Or, there is an error in this parser.')
    }
    return return_node
  }

  //location_of_left_bracket is the bracket you want to match in input_string
  get_matching_right_square_bracket(input_string, location_of_left_bracket){
    //[dfgfgdsfasdfa['[']][][[]]] //How to deal with this case?

    let number_of_unmatched_left_square_brackets = 0
    for (var i = location_of_left_bracket; i < input_string.length; i++){
      if (input_string.charAt(i) == '['){
        number_of_unmatched_left_square_brackets++
      }

      if (input_string.charAt(i) == ']'){
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
    let matchInformation = this.runningGrammar.match(inputString)
    return matchInformation
  }
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

Strings.is_alphabetical = function(input_string){
  if (Strings.contains_only(input_string, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz')){
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

//Returns true if input_string consists only of characters from the allowed_characters string
Strings.contains_only = function(input_string, allowed_characters){
  for (var i = 0; i < input_string.length; i++){
    if (allowed_characters.indexOf(input_string.charAt(i)) < 0){
      return false
    }
  }
  return true
}

//Counts the number of occurrences of character in input_string
Strings.count_occurrences = function(input_string, character){
  var count = 0

  for (var i = 0; i < input_string.length; i++){
    var current_character = input_string.charAt(i)
    if (current_character == character) count++
  }

  return count
}

//operates in two modes, depending on the type of JavaScript object passed in as the variable conditionOrString
//Mode 1, when conditionOrString is a string:
//Returns the longest substring starting at index 0 of input_string whose characters belong to conditionOrString
//For example, if input_string is 'test', and character list is 'et', then the string 'te' is returned because
//the first two letters of test are found within the character list

//Mode 2, when conditionOrString is a function
//
Strings.headMatch = function(input_string, conditionOrString){
  let i = 0;
  let returnString = ''
  for (i = 1; i < input_string.length + 1; i++){
    let tempString = input_string.substring(0, i)
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
  constructor(root, parentElement){
    this.root = root
    this.parentElement = parentElement
    this.domElement = document.createElement('pre')
    if (parentElement){
      this.parentElement.appendChild(this.domElement)
    }
  }

  getOutputString(metadata){
    if (metadata == null){
      return ''
    }
    let outputString = '  '.repeat(metadata['depth']) + '*****************************\n'

    let keys = Object.keys(metadata)
    for(let i = 0; i < keys.length; i++){
      let keyValue = metadata[keys[i]]
      if (typeof keyValue == 'object'){
        if (keyValue !== null){
          if (Array.isArray(keyValue)){
            for (let j = 0; j < keyValue.length; j++){
              outputString += this.getOutputString(keyValue[j])
            }
          }else{
            outputString += this.getOutputString(keyValue)
          }
        }
      }else{
        outputString += '  '.repeat(metadata['depth']) + keys[i] + ":" + keyValue + '\n'
      }
    }
    return outputString
  }
  
  display(metadata){
    let outputString = ''
    if (typeof metadata == 'undefined'){
      metadata = this.root
    }
    outputString = this.getOutputString(metadata)

    if (!this.parentElement){
      console.log(outputString)
    }else{
      let outputTextNode = document.createTextNode(outputString)
      this.domElement.appendChild(outputTextNode)
    }
  }
}

