class M1{
  //Given a string s, returns the first comma that is not part of a node
  //For example:
  //Let s be the string '[adsfdsf,[dfd,asdfs,asdf],dsfsadf]'
  //The function will return 8
  //Let s2 be the string [dfd,asdfs,asdf],dsfsadf]
  //This function will return 16 because it is the first *zero level* comma, or top level comma.
  //[dfd,asdfs,asdf] is part of a node, so it is skipped.
  //Algorithm works as follows:
  //The 'level' is 0.
  //Upon encountering [, the 'level' is increased by 0. It is no longer a zero level.
  //Upon encountering ], the 'level' is decreased by 1.
  //Zero level commas are commas detected when the 'level' is zero.
  static getNextZeroLevelComma(s){
  console.log('inside getNextZeroLevelComma:'+ s)
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
  //Takes in a string s which is a pattern list, the comma-separated information after the node name
  //[node name,<pattern list>]
  //Repeatedly find next 0-level comma from caret
  //If not found, then take entire string as the last pattern
  //dafsdf+1-1+1-1
  //Returns an array of pattern nodes
  static getPatterns(s, generator){
    let patterns = []
    let startCaret = 0
    let endCaret = M1.getNextZeroLevelComma(s)
    
    while(endCaret > startCaret){
      let nugget = s.substring(startCaret,endCaret)
      patterns.push(M1.importInternal(nugget, generator))
      startCaret = endCaret + 1
      let commaOffset = M1.getNextZeroLevelComma(s.substring(startCaret))
      endCaret = startCaret + commaOffset
    }

    patterns.push(M1.importInternal(s.substring(startCaret), generator))
    return patterns
}
  //The return value is a number containing the index of the right square bracket
  //counting from the left starting from 0
  //If s starts with a left bracket, then find the matching right bracket
  //If it doesn't, it should be some sort of string literal, so find either a comma or a right bracket
  static getOneNodeSpot(s){
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
  static unescape(s){
    let s2 = s.replace(/ENC(R)/g, ']')
    s2 = s2.replace(/ENC(L)/g, '[')
    s2 = s2.replace(/ENC(C)/g, ',')
    s2 = s2.replace(/ENC(S)/g, ' ')
    return s2
  }

  static importInternal(s,generator){
    //Stage 1 transforms M1 format to an in-memory format
    let firstComma = s.indexOf(',')
    let nodeType = s.substring(1,firstComma)
    let node
    switch(nodeType){
      case 'name':
        //[name,asdfasdf,target]
        let afterFirstComma = s.substring(firstComma + 1)
        let secondComma = afterFirstComma.indexOf(',') + 1 + firstComma 
        node = generator.createNode({type:nodeType, nodes: [s.substring(firstComma + 1, secondComma),
           M1.importInternal(s.substring(secondComma + 1,s.length - 1), generator)]})
        break
      case 'jump':
        //Jump nodes are incomplete at this stage because they do not have a reference yet to the name nodes and must be reprocessed
      case 'string literal':
      case 'character class':
        node = generator.createNode({type:nodeType, nodes: [s.substring(firstComma + 1, s.length - 1)]})
        break
      default:
        let patterns = M1.getPatterns(s.substring(firstComma + 1, s.length - 1), generator)
        node = generator.createNode({type:nodeType, nodes: patterns})
        break
    }
    return node
  }

  //Takes in a string, s, in M1 format and converts it into an in-memory representation of a parser
  static import(s, generator){
    let rootNode = M1.importInternal(s,generator)
    Generator.connectJumpNodesToNameNodes(generator.jumpNodes,generator.nameNodes)
    return rootNode
  }

  //Given a string s in M1 format, this function returns the string between the first left bracket and the first comma
  //E.g. In the M1 string [rule list, [multiple,[character class,23432424]]]
  static getNodeType(s){
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
  //(space) becomes ENC(S)
  //(newline) becomes ENC(N)
  static escape(s){
    let s2 = s.replace(/\(/g, "ENC(L)")
    s2 = s2.replace(/\)/g, "ENC(R)")
    s2 = s2.replace(/,/g, "ENC(C)")
    s2 = s2.replace(/ /g, "ENC(S)")
    s2 = s2.replace(/\\n/g, "ENC(N)")
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
  static convertToH1(s, depth = 0){
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
      outputString += Generator.M1.convertToH1(nextNodeString, depth + 1) + '\n'
      caret = caret + nextNodeString.length + 1 //Skip to one character past the last found comma
      commaOffset = Generator.getNextZeroLevelComma(s.substring(caret))
    }

    outputString += Generator.M1.convertToH1(s.substring(caret,s.length - 1), depth + 1)
    return outputString
  }

  static export(node, depth = 0){
    switch(node.nodes.length){
      case 'name':
        return `[${node.type},${Generator.M1.escape(node.nodes[0])},${node.nodes[1].export()}]`
      case 'or':
      case 'sequence':
      case 'and':
      case 'split':
        let patternsString = ''
        this.nodes.forEach((pattern, index)=>{
          if (index > 0) patternsString += ","
          patternsString += Generator.M1.export(pattern)
        })
        let s = `[${node.type},${patternsString}]`
        return s      
      
      case 'not':
      case 'entire':
      case 'optional':
        return `[${node.type},${node.nodes[0].export()}]`
    
      case 'character class':
      case 'string literal':
      case 'jump':
        return `[${node.type},${Generator.escape(node.nodes[0])}]`
    }

    return node.export(depth)
  }

}