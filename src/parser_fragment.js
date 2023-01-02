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
    Parser.nodeTypes.push(SequenceNode)
    Parser.nodeTypes.push(OrNode)
    Parser.nodeTypes.push(AndNode)
    Parser.nodeTypes.push(MultipleNode)
    Parser.nodeTypes.push(NotNode)
    Parser.nodeTypes.push(OptionalNode)
    Parser.nodeTypes.push(CharacterClassNode)
    Parser.nodeTypes.push(StringLiteralNode)
    //Order matters for getnodetype
    Parser.nodeTypes.push(RuleNameNode)
    Parser.nodeTypes.push(RuleNode)
    Parser.nodeTypes.push(RuleListNode)

    //Note that the rule for the rule list does not have to be in this list because no reference to it will can be made within one of its rules
    //and so it will never get triggered during parsing of the input grammar
  }

  //Returns an array of all node types known by the parser
  static getNodeTypeNames(){
    let nodeTypeNames = []
    for (let nodeType of Parser.nodeTypes){
      nodeTypeNames.push(nodeType.type)
    }
    return nodeTypeNames
  }

  getMatchCount(){
    let matchCount = this.matchCount
    this.matchCount = this.matchCount + 1
    return matchCount
  }

  //Given a string s, returns "M1", "H1", "H2" or "unknown", depending on the type of 
  //language the information is written in
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

  setGrammar(s){
    let language = Parser.detectImportLanguage(s, this)
    if (language == 'M1'){
      this.grammar = Parser.M1Import(s, this)
    }else if (language == 'H1'){
      this.grammar = Parser.H1Import(s, this)
    }else if (language == 'H2'){
      this.grammar = Parser.H2Import(s, this)
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


  //Given an object o of the form {name:value} returns a string 
  static encodeProperty(o){
    let property = Object.keys(o)[0]
    return property + ":" + o[property] + "\n"
  }

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
    
    let nextZeroLevelComma = Parser.getNextZeroLevelComma(s)
    while(nextZeroLevelComma > 0){
      let nextNodeString = s.substring(caret,nextZeroLevelComma)
      patterns.push(Parser.M1Import(nextNodeString, parser))
      caret = caret + nextNodeString.length
    }

    patterns.push(Parser.M1Import(s.substring(caret), parser))
    return patterns
}
  //The return value is a number containing the index of the right square bracket
  //counting from the left starting from 0
  //If s starts with a left bracket, then find the matching right bracket
  //If it doesn't, it should be some sort of string literal, so find either a comma or a right bracket
  static M1GetOneNodeSpot(s){
    if (s.substring(0,1)=='['){
      //return index of matching ]
      return Parser.getMatchingRightSquareBracket(s,0)
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

    let nodeType = Parser.M1GetNodeType(s)
    switch(nodeType){
      case 'rule list':
        {
          let ruleListNode = new RuleListNode({parser})
          //let nodeList
          //Need to get rule 1, rule 2, rule 3...
          //[rule list,[rule,NUMBER,[multiple,[character class,0123456789]]]]

          //everything from the first comma to the last right bracket are to be processed as a series of nodes
          let caret = s.indexOf(',') + 1
          let rules = Parser.M1GetPatterns(s.substring(caret,s.length - 1), parser)
          ruleListNode.rules = rules
          parser.grammar = ruleListNode
        }
        break
      case 'rule':
        {
          //[rule,rule name,pattern]
          let firstComma = s.indexOf(',')
          let secondComma = s.indexOf(',',firstComma + 1)
          let pattern = Parser.M1GetPatterns(s.substring(secondComma+1, s.length - 1), parser)[0]
          let ruleNode = new RuleNode({parser:parser, name: s.substring(firstComma+1,secondComma), pattern})
          return ruleNode
        }
      case 'or':
        {
          //[or,pattern 1,pattern 2,pattern 3,...,pattern n]
          let firstComma = s.indexOf(',')
          let patterns = Parser.M1GetPatterns(s.substring(firstComma + 1, s.length - 1), parser)
          let orNode = new OrNode({parser:parser, patterns})
          return orNode
        }
      case 'and':
        {
          let firstComma = s.indexOf(',')
          let patterns = Parser.M1GetPatterns(s.substring(firstComma + 1, s.length - 1), parser)
          let node = new AndNode({parser:parser, patterns})
          return node  
        }
      case 'sequence':
        {
          let firstComma = s.indexOf(',')
          let patterns = Parser.M1GetPatterns(s.substring(firstComma + 1, s.length - 1), parser)
          let node = new SequenceNode({parser:parser, patterns})
          return node  
        }
      case 'not':
        {
          let firstComma = s.indexOf(',')
          let pattern = Parser.M1GetPatterns(s.substring(firstComma + 1, s.length - 1), parser)[0]
          let node = new NotNode({parser:parser, pattern})
          return node  
        }
      case 'optional':
        {
          let firstComma = s.indexOf(',')
          let pattern = Parser.M1GetPatterns(s.substring(firstComma + 1, s.length - 1), parser)[0]
          let node = new OptionalNode({parser:parser, pattern})
          return node  
        }
      case 'multiple':
        {
          let firstComma = s.indexOf(',')
          let pattern = Parser.M1GetPatterns(s.substring(firstComma + 1, s.length - 1), parser)[0]
          let node = new MultipleNode({parser:parser, pattern})
          return node  
        }
      case 'character class':
        {
          let firstComma = s.indexOf(',')
          let string = Parser.M1Unescape(s.substring(firstComma + 1, s.length - 1))
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
      case 'string literal':
        return StringLiteralNode.grammarize(string,parser)
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
    let typeOfPattern = Parser.getTypeOfPattern(trimmed_string)
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

  //Below here lies the code for parsing using the running grammar
  
  //takes in a string and returns an abstract syntax tree, according to previously loaded grammar
  //Assumes there is only one top-level construct
  parse(inputString){
    if (this.grammar){
      let matchInformationNodes = this.grammar.match(inputString)
      let matchInformationTree = new Tree(matchInformationNodes)
      this.rawMatches = matchInformationTree
      let ruleMatchesTree = matchInformationTree.getRuleMatchesOnly()
      return ruleMatchesTree  
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
      return Parser.H1EncodeDepth(depth) + s.slice()
    }

    let outputString = ''
    let caret = 1

    let commaIndex = s.indexOf(',')
    let nodeType = s.substring(caret, commaIndex)
    outputString += Parser.H1EncodeDepth(depth) + nodeType + '\n'

    caret += nodeType.length + 1//increase caret by left bracket plus node name + a comma, plus one character
    //obtain comma position relative to the string s starting at position caret
    let commaOffset = Parser.getNextZeroLevelComma(s.substring(caret)) 
    while(commaOffset > -1){
      let nextNodeString = s.substring(caret,commaOffset + caret)
      outputString += Parser.M1ConvertToH1(nextNodeString, depth + 1) + '\n'
      caret = caret + nextNodeString.length + 1 //Skip to one character past the last found comma
      commaOffset = Parser.getNextZeroLevelComma(s.substring(caret))
    }

    outputString += Parser.M1ConvertToH1(s.substring(caret,s.length - 1), depth + 1)
    return outputString
  }

  //Given a string s beginning with a node at line 0, this function will return the last character in the node
  static H1GetNodeString(s){
    //1)Get depth of first line, which should contain the node name
    let firstNodeDepth = Parser.H1GetDepth(s)

    //2)Go line by line until a lower or equal depth has been reached. That should be the end of the current node
    let lines = s.split('\n')

    let nodeString = lines[0] + '\n'
    for (let i = 1; i < lines.length; i++){
      let line = lines[i]
      let lineDepth = Parser.H1GetDepth(line)
      if (lineDepth <= firstNodeDepth){
        break
      }

      //No delimiter at end of last line
      let delimiter = '\n'
      if (i == lines.length -1){
        delimiter = ''
      }
      nodeString += lines[i] + delimiter
    }
    return nodeString
  }

  //s: a string in H1 format, starting with a node string
  static H1GetNumberOfChildren(s){
    let lines = s.split('\n')
    let firstNodeDepth = Parser.H1GetDepth(s)
    let numberOfChildren = 0
    for (let i = 1; i < lines.length; i++){
      let line = lines[i]
      let lineDepth = Parser.H1GetDepth(line)
      if (lineDepth <= firstNodeDepth){
        break
      }
      if (lineDepth == firstNodeDepth + 1){
        numberOfChildren++
      }
    }
    return numberOfChildren
  }

  //Takes in a tree in H1 format, possibly with leading spaces also, and returns the children of the node on the first line. The children
  //are returned as strings
  //Assumes input string is the complete node string for a single node
  static H1GetChildNuggets(s){
    let childNodes = []
    let lines = s.split('\n')
    let firstNodeDepth = Parser.H1GetDepth(s)
    let nodeName = Parser.H1GetNodeName(s)
    
    let nodeTypeNames = Parser.getNodeTypeNames()
    if (nodeTypeNames.indexOf(nodeName) == -1){
      //error
      throw new Error('Unknown node type: ' + nodeName)
    }

    if (['string literal','character class'].indexOf(nodeName) > -1){
      //Take the next line
      childNodes.push(lines[1].substring(firstNodeDepth+1))
    }
    else{
      //For all other nodes, return an array of the child node strings
      let numberOfChildren = 0
      for (let i = 1; i < lines.length; i++){
        let line = lines[i] + '\n'
        let lineDepth = Parser.H1GetDepth(line)
        if (lineDepth <= firstNodeDepth){
          break
        }

        let newChild = false
        if (lineDepth == firstNodeDepth + 1){
          numberOfChildren++
          childNodes.push('')
          newChild = true
        }
  
        if (lineDepth >= firstNodeDepth + 1){
          childNodes[numberOfChildren-1] += line
        }
      }

      for (let i = 0; i < childNodes.length; i++){
        childNodes[i] = childNodes[i].substring(0,childNodes[i].length - 1) //Chop off last carriage return for each child
      }
    }

    return childNodes
  }

  //Given a string s in H1 format, returns the number of spaces before the first line in s. The number of
  //spaces is called the depth.
  static H1GetDepth(s){
    let numberOfSpaces = 0
    for (let i = 0; i < s.length; i++){
      if (s.substring(i,i+1) == ' '){
        numberOfSpaces += 1
      }else{
        break
      }
    }
    return numberOfSpaces
  }

  //Returns the index of the first line with a particular depth in depthArray such that
  //the line number is greater than or equal to startingLine
  static H1GetFirstLineWithDepth(depthArray, firstNodeDepth, startingLine = 1){
    for (let i = 0; i < depthArray.length; i++){
      if (depthArray[i] == firstNodeDepth){
        if (i >= startingLine){
          return firstNodeDepth
        }
      }
    }

    return -1
  }

  //Takes in a node string s and returns the first line without the carriage return and leading spaces
  static H1GetNodeName(s){
    let depth = Parser.H1GetDepth(s)
    let nodeName = s.substring(depth,s.indexOf('\n'))
    return nodeName
  }

  //A string in H1 form starts with a node name on a single line
  //followed by a property or
  //one or more nodes.
  //Or one property followed by one or more nodes
  //Given a string in H1 form:
  //rule list
  // rule
  //  NUMBER
  //  multiple
  //   multiple
  //    sequence
  //     reference rule name 2----To do
  //     multiple
  //      character class
  //       (space)(space)0123456789
  // rule2
  //  rule name 2
  //  multiple
  //   string literal
  //    (space)fsfasfasdfsdfs
  //this function will convert it into M1 format
  static H1ConvertToM1(s){
    //Valid H1 format means the first line is the name of a node type
    let nodeString = Parser.H1GetNodeString(s)
    if (nodeString == ''){
      throw new Error('String passed in for H1 to M1 conversion is not in H1 format.')
    }
    let childNuggets = Parser.H1GetChildNuggets(nodeString)

    //Get the node name
    let nodeName = Parser.H1GetNodeName(s)
    let childrenString = ''

    if (nodeName == 'rule'){
      let depth = Parser.H1GetDepth(s)
      childrenString += childNuggets[0].substring(depth + 1) + ','
      childrenString += Parser.H1ConvertToM1(childNuggets[1])
    }else if (nodeName == 'character class' || nodeName == 'string literal'){
      let depth = Parser.H1GetDepth(s)
      let lines = s.split('\n')
      childrenString += lines[1].substring(depth + 1)
    }
    else{
      for (let i = 0; i < childNuggets.length; i++){
        if (i > 0){
          childrenString += ','
        }
        childrenString += Parser.H1ConvertToM1(childNuggets[i])
      }
    }

    let outputString = `[${nodeName},${childrenString}]`

    return outputString
  }

  //Returns n spaces
  static H1EncodeDepth(n){
    return ' '.repeat(n)
  }
  
  //Given a string in H1 format, loads the appropriate nodes into memory
  static H1Import(s, parser){
    let M1Code = Parser.H1ConvertToM1(s)
    Parser.M1Import(M1Code, parser)
  }


  //Returns without a trailing carriage return
  //rule list
  // rule
  //  multiple
  //Given the root node of a parsing tree, this transforms it into H1 format
  static H1Export(node, depth = 0){
    let outputString = Parser.H1EncodeDepth(depth) + node.type + '\n'

    let childrenString = ''
    switch(node.type){
      case 'multiple':
      case 'not':
      case 'optional':
        {
          childrenString += Parser.H1Export(node.pattern, depth + 1)
        }
        break
      case 'or':
      case 'and':
      case 'sequence':
      case 'rule list':
        {
          let listPropertyName = 'patterns'
          if (node.type == 'rule list') listPropertyName = 'rules'

          for (let i = 0; i < node[listPropertyName].length; i++){
            childrenString += Parser.H1Export(node[listPropertyName][i], depth + 1)
            if (i < node.rules.length - 1){
              childrenString += '\n'
            }
          }      
        }
        break
      case 'rule':
        {
          childrenString += Parser.H1EncodeDepth(depth + 1) + node.name + '\n'
          childrenString += Parser.H1Export(node.pattern, depth + 1)
        }
        break
      case 'character class':
      case 'string literal':
      case 'rule name':
        {
          childrenString += Parser.H1EncodeDepth(depth + 1) + node.string
        }
        break
      default:
        break
    }
    outputString += childrenString
    return outputString  
  }

  static M1Export(node, depth = 0){
    return node.M1Export(depth)
  }

}

Parser.registerNodeTypes()
Parser.validRuleNameCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_'
Parser.keywords = ['OR','AND', 'SEQUENCE', 'NOT', 'OPTIONAL', 'MULTIPLE', 'CHARACTER_CLASS']

