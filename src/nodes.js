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

//These nodes take in text and then emit Nodes which are then used by the user parser to emit match nodes
class LinearParsingRow{
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
