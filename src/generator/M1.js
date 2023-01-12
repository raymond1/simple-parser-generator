class M1{
    //Given a string s, returns the first comma that is not part of a node
  //For example:
  //Let s be the string '[adsfdsf,[dfd,asdfs,asdf],dsfsadf]'
  //The function will return 8
  //Let s2 be the string [dfd,asdfs,asdf],dsfsadf]
  //This function will return 16 because it is the first *zero level* comma, or top level comma.
  static getNextZeroLevelComma(s){
    let bracketLevel = 0
    let index = -1
    for (let i = 0; i < s.length; i++){
      let c = s.substring(i,i+1) //Iterate through string s. c is the current character
      if (c == '[') bracketLevel++
      if (c == ']') bracketLevel--

      if (bracketLevel == 0 && c == ','){
        return i
      }
    }

    return index
  }

    //Assumes s is of the form string,string,string
  //Or [a,[sdff,sdfds],fds],[asdf],[adfdf]
  //Takes in a string s which is a pattern list
  //[node name,<pattern list>]
  //Repeatedly find next 0-level comma from caret
  //If not found, then take entire string as the last pattern
  //dafsdf+1-1+1-1
  //Returns an array of pattern nodes
  static M1GetPatterns(s, parser){
    let patterns = []
    let caret = 0
    
    let nextZeroLevelComma = M1.getNextZeroLevelComma(s)
    while(nextZeroLevelComma > 0){
      let nextNodeString = s.substring(caret,nextZeroLevelComma)
      patterns.push(M1.M1Import(nextNodeString, parser))
      caret = caret + nextNodeString.length
    }

    patterns.push(M1.M1Import(s.substring(caret), parser))
    return patterns
}
  //The return value is a number containing the index of the right square bracket
  //counting from the left starting from 0
  //If s starts with a left bracket, then find the matching right bracket
  //If it doesn't, it should be some sort of string literal, so find either a comma or a right bracket
  static M1GetOneNodeSpot(s){
    if (s.substring(0,1)=='['){
      //return index of matching ]
      return M1.getMatchingRightSquareBracket(s,0)
    }

    //Take everything from the beginning of s until the first comma or until the first right square bracket, whichever is first
    let commaLocation = s.indexOf(',')
    let rightBracketLocation = s.indexOf(']')

    if (commaLocation == -1 && rightBracketLocation == -1){
      console.log('Error: expecting a comma or a right square bracket, but none was found.')
      return -1
    }

    if (commaLocation < rightBracketLocation){
      return commaLocation
    }

    if (commaLocation > rightBracketLocation){
      return rightBracketLocation
    }
  }

  //Converts ENC(R) into ]
  //Converts ENC(L) into [
  //Converts ENC(C) into ,
  //Converts ENC(S) into  (space)
  static M1Unescape(s){
    let s2 = s.replace(/ENC(R)/g, ']')
    s2 = s2.replace(/ENC(L)/g, '[')
    s2 = s2.replace(/ENC(C)/g, ',')
    s2 = s2.replace(/ENC(S)/g, ' ')
    return s2
  }

  //Takes in a string in M1 format and converts it into an in-memory representation of a parser
  static M1Import(s, parser){
    //[rule list,[rule,NUMBER,[multiple,[character class,0123456789]]]]
    //Get everything from [ to the first comma as the type of a node

    let nodeType = M1.M1GetNodeType(s)
    switch(nodeType){
      case 'rule list':
        {
          let ruleListNode = new RuleListNode({parser})
          //let nodeList
          //Need to get rule 1, rule 2, rule 3...
          //[rule list,[rule,NUMBER,[multiple,[character class,0123456789]]]]

          //everything from the first comma to the last right bracket are to be processed as a series of nodes
          let caret = s.indexOf(',') + 1
          let rules = M1.M1GetPatterns(s.substring(caret,s.length - 1), parser)
          ruleListNode.rules = rules
          parser.grammar = ruleListNode
        }
        break
      case 'rule':
        {
          //[rule,rule name,pattern]
          let firstComma = s.indexOf(',')
          let secondComma = s.indexOf(',',firstComma + 1)
          let pattern = M1.M1GetPatterns(s.substring(secondComma+1, s.length - 1), parser)[0]
          let ruleNode = new RuleNode({parser:parser, name: s.substring(firstComma+1,secondComma), pattern})
          return ruleNode
        }
      case 'or':
        {
          //[or,pattern 1,pattern 2,pattern 3,...,pattern n]
          let firstComma = s.indexOf(',')
          let patterns = M1.M1GetPatterns(s.substring(firstComma + 1, s.length - 1), parser)
          let orNode = new OrNode({parser:parser, patterns})
          return orNode
        }
      case 'and':
        {
          let firstComma = s.indexOf(',')
          let patterns = M1.M1GetPatterns(s.substring(firstComma + 1, s.length - 1), parser)
          let node = new AndNode({parser:parser, patterns})
          return node  
        }
      case 'sequence':
        {
          let firstComma = s.indexOf(',')
          let patterns = M1.M1GetPatterns(s.substring(firstComma + 1, s.length - 1), parser)
          let node = new SequenceNode({parser:parser, patterns})
          return node  
        }
      case 'not':
        {
          let firstComma = s.indexOf(',')
          let pattern = M1.M1GetPatterns(s.substring(firstComma + 1, s.length - 1), parser)[0]
          let node = new NotNode({parser:parser, pattern})
          return node  
        }
      case 'optional':
        {
          let firstComma = s.indexOf(',')
          let pattern = M1.M1GetPatterns(s.substring(firstComma + 1, s.length - 1), parser)[0]
          let node = new OptionalNode({parser:parser, pattern})
          return node  
        }
      case 'multiple':
        {
          let firstComma = s.indexOf(',')
          let pattern = M1.M1GetPatterns(s.substring(firstComma + 1, s.length - 1), parser)[0]
          let node = new MultipleNode({parser:parser, pattern})
          return node  
        }
      case 'character class':
        {
          let firstComma = s.indexOf(',')
          let string = M1.M1Unescape(s.substring(firstComma + 1, s.length - 1))
          let node = new CharacterClassNode({parser:parser, string})
          return node  
        }
      case 'string literal':
        break          
      default:
        throw new Error('Unknown node type: ') + nodeType
        break;
    }
  }

  //Given a string s in M1 format, this function returns the string between the first left bracket and the first comma
  //E.g. In the M1 string [rule list, [multiple,[character class,23432424]]]
  static M1GetNodeType(s){
    if (s.substring(0,1) != '['){
      throw new Error('Invalid M1 format. \'[\' expected at position 0, but not found.')
    }
    let firstCommaPosition = s.indexOf(',')
    if (firstCommaPosition == -1){
      throw new Error('Invalid M1 format. [ should be followed immediately by a node type, followed by a comma and other property values or nodes, but a comma was not found.')
    }

    return s.substring(1,firstCommaPosition)
  }

  //s is the input string to M1 encode
  //] becomes ENC(R)
  //[ becomes ENC(L)
  //, becomes ENC(C)
  // (space) becomes ENC(S)
  static M1Escape(s){
    let s2 = s.replace(/\[/g, "ENC(L)")
    s2 = s2.replace(/\]/g, "ENC(R)")
    s2 = s2.replace(/,/g, "ENC(C)")
    s2 = s2.replace(/ /g, "ENC(S)")
    return s2
  }

  

  //M1:[rule list,[rule,NUMBER,[multiple,[character class,0123456789]]]]
  //rule list
  // rule
  //  
  //Following a node name, add a line. Keep the node name
  //When seeing the [, add indentation
  //If it is a rule node, add indentation for the second parameter
  //rule list
  //This function converts from machine format M1 into human-compatible format H1
  static M1ConvertToH1(s, depth = 0){
    if (s.substring(0,1) != '['){
      return Generator.H1EncodeDepth(depth) + s.slice()
    }

    let outputString = ''
    let caret = 1

    let commaIndex = s.indexOf(',')
    let nodeType = s.substring(caret, commaIndex)
    outputString += Generator.H1EncodeDepth(depth) + nodeType + '\n'

    caret += nodeType.length + 1//increase caret by left bracket plus node name + a comma, plus one character
    //obtain comma position relative to the string s starting at position caret
    let commaOffset = Generator.getNextZeroLevelComma(s.substring(caret)) 
    while(commaOffset > -1){
      let nextNodeString = s.substring(caret,commaOffset + caret)
      outputString += Generator.M1ConvertToH1(nextNodeString, depth + 1) + '\n'
      caret = caret + nextNodeString.length + 1 //Skip to one character past the last found comma
      commaOffset = Generator.getNextZeroLevelComma(s.substring(caret))
    }

    outputString += Generator.M1ConvertToH1(s.substring(caret,s.length - 1), depth + 1)
    return outputString
  }

  static M1Export(node, depth = 0){
    return node.M1Export(depth)
  }

}