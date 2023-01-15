/**
 * This is the type of node emitted internally by the parser.
 * Multiple nodes make up a graph stored in memory that dictate how the
 * parser operates.
 * metadata is just an alternative syntax to function parameters
 * */
class Node{
  /**
   * A set of key-value pairs. Must have a parser value in the 'parser' key.
   * @param {Generator} generator 
   */
  constructor(){
    this.type = this.constructor.type //Show type in object for the debugger
  }

  //Implemented and overriden by child nodes. Given a node, coverts it into a string form
  M1Export(depth = 0){
    throw new Exception('Error while exporting grammar: ' + node['type'] + ' M1Export not implemented.')
  }
}

/**
 * A CharacterClassNode is a node that is associated with an internal string, s1. It returns n letters, where
 * n is equal to the number of consecutive characters, starting from the head of the input string, that are
 * also found in the internal string s1.
 * 
 * 
 * {
 *  matchFound,
 *  subMatches,
 *  matchString
 * }
 * 
 *
 * */
class CharacterClassNode extends Node{
  constructor(metadata){
    super()
    this.string = metadata.string
  }

  static type = 'character class'

  // static grammarize(string, parser){
  //   var trimmed_string = string.trim()

  //   var first_few_characters_of_trimmed_string = trimmed_string.substring(0,'CHARACTER_CLASS'.length)
  //   if (first_few_characters_of_trimmed_string !== 'CHARACTER_CLASS')
  //   {
  //     return null
  //   }

  //   var location_of_first_left_bracket = trimmed_string.indexOf('[')
  //   if (location_of_first_left_bracket < 0) return null

  //   var location_of_last_right_bracket = Generator.getMatchingRightSquareBracket(trimmed_string,location_of_first_left_bracket)
  //   if (location_of_last_right_bracket < 0) return null
  //   if (location_of_last_right_bracket != trimmed_string.length - 1) return null
    
  //   var string_in_between_square_brackets = trimmed_string.substring(location_of_first_left_bracket + 1, location_of_last_right_bracket).trim()

  //   var stringLiteral = StringLiteralNode.grammarize(string_in_between_square_brackets, parser)
  //   if (stringLiteral != null){
  //     return new CharacterClassNode({'string':stringLiteral.string, parser})
  //   }

  //   return null   
  // }

  static headMatch(string){
    return Generator.headMatchXWithBrackets(string, 'CHARACTER_CLASS')
  }

  M1Export(){
    return `[${this.constructor.type},${Generator.M1Escape(this.string)}]`
  }

  /**
   * The characterclass match function
   * 
   * @param {String} inputString 
   * @param {Object} metadata 
   * @returns 
   */
  parse(inputString, metadata = {depth: 0, parent: null}){

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
      serial: this.generator.getAndIncrementMatchCount(),
      matchFound:  matchFound, 
      matchLength,
      matchString: inputString.substring(0, matchLength),
    })
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

  parse(inputString, metadata = {depth: 0, parent: null}){
    let newMatchNode = new MatchNode()
    //matches if inputString starts with the string passed in during object construction
    let matchFound = false
    if (inputString.substring(0, this.string.length) == this.string){
      matchFound = true
    }

    let matchLength = matchFound?this.string.length:0
    Object.assign(newMatchNode, {
      parent: metadata.parent, 
      depth: metadata.depth,
      inputString: inputString.slice(), 
      type: this['type'].slice(),
      id: this.id, 
      serial: this.generator.getAndIncrementMatchCount(),
      matchFound:  matchFound, 
      matchLength,
      subMatches: [],
      matchString: inputString.substring(0, matchLength),
      string: this.string
    })
    return newMatchNode
  }
}

class NotNode extends Node{
  constructor(metadata){
    super(metadata)
    this.nodes = metadata.nodes
  }
  static type = 'not'

  static headMatch(string){
    return Generator.headMatchXWithBrackets(string, 'NOT')
  }

  // static grammarize(string, parser){
  //   var trimmed_string = string.trim()

  //   var first_few_characters_of_trimmed_string = trimmed_string.substring(0,'NOT'.length)
  //   if (first_few_characters_of_trimmed_string !== 'NOT')
  //   {
  //     return null
  //   }

  //   var location_of_first_left_bracket = trimmed_string.indexOf('[')
  //   if (location_of_first_left_bracket < 0) return null

  //   var location_of_last_right_bracket = Generator.getMatchingRightSquareBracket(trimmed_string,location_of_first_left_bracket)
  //   if (location_of_last_right_bracket < 0) return null
  //   if (location_of_last_right_bracket != trimmed_string.length - 1) return null
    
  //   var string_in_between_square_brackets = trimmed_string.substring(location_of_first_left_bracket + 1, location_of_last_right_bracket)

  //   var pattern = Generator.grammarize_PATTERN(string_in_between_square_brackets, parser)
  //   if (pattern != null){
  //     return new NotNode({'nodes': [pattern], parser})
  //   }

  //   return null
  // }

  M1Export(){
    return `[${this.constructor.type},${this.pattern.M1Export()}]`
  }

  parse(inputString, metadata = {depth: 0, parent: null}){
    var newMatchNode = new MatchNode()
    let matchInfo = this.nodes[0].parse(inputString,{depth: metadata.depth + 1, parent: newMatchNode})

    let matchLength = matchInfo.matchFound?0:inputString.matchLength
    Object.assign(
      newMatchNode, {
        parent: metadata.parent, 
        depth: metadata.depth,
        inputString: inputString.slice(), 
        type: this['type'].slice(),
        id: this.id, 
        serial: this.generator.getAndIncrementMatchCount(),
        matchFound:  !matchInfo.matchFound, 
        matchLength,
        subMatches: [matchInfo],
        matchString: inputString.substring(0, matchLength),
      }
    )

    return newMatchNode
  }
}

//Produces a match if the input string matches the inner pattern match
class EntireNode extends Node{
  constructor(metadata){
    super(metadata)
    this.nodes = metadata.nodes
  }

  static type = 'entire'

  static headMatch(string){
    return Generator.headMatchXWithBrackets(string, 'ENTIRE')
  }

  static grammarize(string, generator){
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

    var pattern = Generator.grammarize_PATTERN(string_in_between_square_brackets, generator)
    if (pattern != null){
      return new EntireNode({'nodes': [pattern], generator})
    }

    return null
  }

  M1Export(){
    return `[${this.constructor.type},${this.nodes[0].M1Export()}]`
  }

  parse(inputString, metadata = {depth: 0, parent: null}){
    let newMatchNode = new MatchNode()
    let matchInfo = this.nodes[0].parse(inputString,{depth: metadata.depth + 1, parent: newMatchNode})

    let subMatches = []
    let matchLength = 0
    subMatches.push(matchInfo)

    let matchFound = false
    if (matchInfo.matchLength == inputString.length){
      matchFound = true
    }

    Object.assign(newMatchNode, {
      parent: metadata.parent, 
      depth: metadata.depth,
      inputString: inputString.slice(), 
      type: this['type'].slice(),
      id: this.id, 
      serial: this.generator.getAndIncrementMatchCount(),
      matchFound:  matchFound, 
      matchLength: matchInfo.matchLength,
      subMatches,
      matchString: inputString.substring(0, matchLength),
    })
    return newMatchNode
  }
}

class SequenceNode extends Node{
  constructor(metadata){
    super(metadata)
    this.nodes = metadata.nodes
  }
  static type = 'sequence'

  static headMatch(string){
    return Generator.headMatchXWithBrackets(string, SequenceNode.type)
  }
/*
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
*/
  M1Export(){
    let patternsString = ''
    this.nodes.forEach((pattern, index)=>{
      if (index > 0){
        patternString += ","
      }
      patternsString += `[${pattern.M1Export()}]`
    })
    let s = `[${patternsString}]`
    return s
  }

  parse(inputString, metadata = {depth: 0, parent: null}){
debugger
    var newMatchNode = new MatchNode()
    let tempString = inputString
    let totalMatchLength = 0

    let subMatches = []
    let matchInfo
    for (let i = 0; i < this['nodes'].length; i++){
      matchInfo = this.nodes[i].parse(tempString,{depth: metadata.depth + 1, parent: newMatchNode})
      subMatches.push(matchInfo)
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
        serial: this.generator.getAndIncrementMatchCount(),
        matchFound:  matchFound, 
        matchLength: matchLength, 
        subMatches,
        matchString: inputString.substring(0, matchLength),
      }
    )

    return newMatchNode
  }
}

class OrNode extends Node{
  constructor(metadata){
    super(metadata)
    this.nodes = metadata.nodes
  }
  static type = 'or'
  
  static headMatch(s){
    return Generator.headMatchXWithBrackets(s, 'OR')
  }
/*
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
*/
  M1Export(){
    let patternsString = ''
    this.nodes.forEach((pattern, index)=>{
      if (index > 0) patternsString += ","
      patternsString += pattern.M1Export()
    })
    let s = `[${this.constructor.type},${patternsString}]`
    return s
  }

  parse(inputString,metadata = {depth: 0, parent: null}){
    var newMatchNode = new MatchNode()

    let subMatches = []
    let matchInfo
    for (let i = 0; i < this.nodes.length; i++){
      matchInfo = this['nodes'][i].parse(inputString,{depth: metadata.depth + 1, parent: newMatchNode})
      subMatches.push(matchInfo)
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
        serial: this.generator.getAndIncrementMatchCount(),
        matchFound:  matchFound, 
        matchLength: matchLength, 
        subMatches,
        matchString: inputString.substring(0, matchLength),
      }
    )

    return newMatchNode
  }
}

class AndNode extends Node{
  constructor(metadata){
    super(metadata)
    this.nodes = metadata.nodes
  }
  static type = 'and'
/*
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
*/
  static headMatch(string){
    return Generator.headMatchXWithBrackets(string, 'AND')
  }

  M1Export(){
    let patternsString = ''
    this.nodes.forEach((pattern, index)=>{
      if (index > 0) patternsString += ","
      patternsString += pattern.M1Export()
    })
    let s = `[${this.constructor.type},${patternsString}]`
    return s
  }

  parse(inputString,metadata = {depth: 0, parent: null}){
    var newMatchNode = new MatchNode()

    let subMatches = []
    let matchInfo
    let andDetected = true
    let smallestMatchLength = 0 //0 indicates no match
    let firstIteration = true

    for (let i = 0; i < this.nodes.length; i++){
      matchInfo = this.nodes[i].parse(inputString,{depth: metadata.depth + 1, parent: newMatchNode})
      subMatches.push(matchInfo)
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
    let matchLength = smallestMatchLength

    Object.assign(
      newMatchNode, {
        parent: metadata.parent, 
        depth: metadata.depth,
        inputString: inputString.slice(), 
        type: this['type'].slice(),
        id: this.id, 
        serial: this.generator.getAndIncrementMatchCount(),
        matchFound:  matchFound, 
        matchLength: matchLength, 
        subMatches,
        matchString: inputString.substring(0, matchLength),
      }
    )

    return newMatchNode
  }
}

class MultipleNode extends Node{
  constructor(metadata){
    super(metadata)
    this.nodes = metadata.nodes
  }
  static type = 'multiple'
/*
  static grammarize(string, generator){
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

    var pattern = Generator.grammarize_PATTERN(string_in_between_square_brackets, generator)
    if (pattern != null){
      return new MultipleNode({pattern, generator})
    }

    return null
  }
*/
  static headMatch(string){
    return Generator.headMatchXWithBrackets(string, 'MULTIPLE')
  }

  M1Export(){
    return `[multiple,${this.nodes[0].M1Export()}]`
  }

  parse(inputString, metadata = {depth: 0, parent: null}){
    var newMatchNode = new MatchNode()
    let tempString = inputString
    let totalMatchLength = 0

    let subMatches = []
    let matchInfo = this.nodes[0].parse(tempString,{depth: metadata.depth + 1, parent: newMatchNode})
    if (matchInfo.matchFound){
      subMatches.push(matchInfo)
    }
    while(matchInfo.matchFound){
      totalMatchLength = totalMatchLength + matchInfo.matchLength
      tempString = tempString.substring(matchInfo.matchLength)
      matchInfo = this.nodes[0].parse(tempString,{depth: metadata.depth + 1, parent: this})
      subMatches.push(matchInfo)
    }
  
    let matchFound = false
    if (subMatches.length > 0){
      matchFound = true
    }
    
    Object.assign(
      newMatchNode, {
        parent: metadata.parent, 
        depth: metadata.depth,
        inputString: inputString.slice(), 
        type: this['type'].slice(),
        id: this.id, 
        serial: this.generator.getAndIncrementMatchCount(),
        matchFound:  matchFound, 
        matchLength: totalMatchLength,
        subMatches,
        matchString: inputString.substring(0, totalMatchLength),
      }
    )

    return newMatchNode
  }
}

class OptionalNode extends Node{
  constructor(metadata){
    super(metadata)
    this.nodes = metadata.nodes
  }

  static type = 'optional'

  static headMatch(string){
    return Generator.headMatchXWithBrackets(string, 'OPTIONAL')
  }

  static grammarize(string, generator){
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

    var pattern = Generator.grammarize_PATTERN(string_in_between_square_brackets, generator)
    if (pattern != null){
      return new OptionalNode({'nodes': [pattern], generator})
    }

    return null
  }

  M1Export(){
    return `[${this.constructor.type},${this.nodes[0].M1Export()}]`
  }

  parse(inputString, metadata = {depth: 0, parent: null}){
    let newMatchNode = new MatchNode()
    let matchInfo = this.nodes[0].parse(inputString,{depth: metadata.depth + 1, parent: newMatchNode})

    let subMatches = []
    let matchLength = 0
    subMatches.push(matchInfo)

    Object.assign(newMatchNode, {
      parent: metadata.parent, 
      depth: metadata.depth,
      inputString: inputString.slice(), 
      type: this['type'].slice(),
      id: this.id, 
      serial: this.generator.getAndIncrementMatchCount(),
      matchFound:  true, 
      matchLength: matchInfo.matchLength,
      subMatches,
      matchString: inputString.substring(0, matchLength),
    })
    return newMatchNode
  }
}


//This is the type of object that is emitted during the parsing operation by the parser
class MatchNode{
  constructor(){
    //Defaults will be overridden during matching
    this.subMatches = []
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

