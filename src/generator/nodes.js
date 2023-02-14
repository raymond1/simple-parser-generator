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
 *  subMatches,
 *  matchString
 * }
 * 
 *
 * */
class CharacterClassNode extends Node{
  constructor(metadata){
    super(metadata)
    this.nodes = metadata.nodes
  }

  static type = 'character class'

  M1Export(){
    return `[${this.constructor.type},${Generator.M1Escape(this.string)}]`
  }

  /**
   * The characterclass match function
   * 
   * @param {String} inputString 
   * @param {Object} metadata 
   * @returns {String}
   */
  parse(inputString, metadata = {depth: 0, parent: null}){

    let newMatchNode = new MatchNode()
    //matches if the inputString starts with characters from the character class
    let matchingString = ''
    //i is the number of characters to take for comparison
    //i goes from 1, 2, 3, ... to the length of the inputString
    for (let i = 1; i <= inputString.length; i++){
      let headString = inputString.substring(0,i)
      if (Strings.contains_only(headString,this.nodes[0])){
        matchingString = headString
      }else{
        break
      }
    }

    let matchLength = 0
    if (matchingString.length > 0){
      matchLength = matchingString.length
    }

    Object.assign(newMatchNode, {
      parent: metadata.parent, 
      depth: metadata.depth,
      inputString: inputString.slice(), 
      type: this['type'].slice(),
      id: this.id, 
      serial: this.generator.getAndIncrementMatchCount(),
      matchString: inputString.substring(0, matchLength),
    })
    return newMatchNode
  }
}

class StringLiteralNode extends Node{
  constructor(metadata){
    super(metadata)
    this.nodes = metadata.nodes
  }

  static type = 'string literal'

  M1Export(){
    return `[${this.constructor.type},${Generator.M1Escape(this.nodes[0])}]`
  }

  parse(inputString, metadata = {depth: 0, parent: null}){
    let newMatchNode = new MatchNode()
    //matches if inputString starts with the string passed in during object construction
    let matchLength = 0
    if (inputString.substring(0, this.nodes[0].length) == this.nodes[0]){
      matchLength = this.nodes[0].length
    }

    Object.assign(newMatchNode, {
      parent: metadata.parent, 
      depth: metadata.depth,
      inputString: inputString.slice(), 
      type: this['type'].slice(),
      id: this.id, 
      serial: this.generator.getAndIncrementMatchCount(),
      subMatches: [],
      matchString: inputString.substring(0, matchLength),
      string: this.nodes[0]
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

  M1Export(){
    return `[${this.constructor.type},${this.pattern.M1Export()}]`
  }

  parse(inputString, metadata = {depth: 0, parent: null}){
    var newMatchNode = new MatchNode()
    let matchInfo = this.nodes[0].parse(inputString,{depth: metadata.depth + 1, parent: newMatchNode})

    let matchLength = (matchInfo.matchString !== '')?0:inputString.matchLength
    Object.assign(
      newMatchNode, {
        parent: metadata.parent, 
        depth: metadata.depth,
        inputString: inputString.slice(), 
        type: this['type'].slice(),
        id: this.id, 
        serial: this.generator.getAndIncrementMatchCount(),
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

  M1Export(){
    return `[${this.constructor.type},${this.nodes[0].M1Export()}]`
  }

  parse(inputString, metadata = {depth: 0, parent: null}){
    let newMatchNode = new MatchNode()
    let matchInfo = this.nodes[0].parse(inputString,{depth: metadata.depth + 1, parent: newMatchNode})

    let subMatches = []
    let matchLength = 0
    subMatches.push(matchInfo)

    if (matchInfo.matchString.length == inputString.length){
      matchLength = matchInfo.matchString.length
    }

    Object.assign(newMatchNode, {
      parent: metadata.parent, 
      depth: metadata.depth,
      inputString: inputString.slice(), 
      type: this['type'].slice(),
      id: this.id, 
      serial: this.generator.getAndIncrementMatchCount(),
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
    var newMatchNode = new MatchNode()
    let tempString = inputString
    let totalMatchLength = 0

    let subMatches = []
    let matchInfo
    for (let i = 0; i < this['nodes'].length; i++){
      matchInfo = this.nodes[i].parse(tempString,{depth: metadata.depth + 1, parent: newMatchNode})
      subMatches.push(matchInfo)
      if (matchInfo.matchString === ''){
        break;
      }else{
        totalMatchLength = totalMatchLength + matchInfo.matchString.length
        tempString = tempString.substring(matchInfo.matchString.length)
      }
    }
    let matchLength = totalMatchLength

    Object.assign(
      newMatchNode, {
        parent: metadata.parent, 
        depth: metadata.depth,
        inputString: inputString.slice(), 
        type: this['type'].slice(),
        id: this.id, 
        serial: this.generator.getAndIncrementMatchCount(),
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
      if (matchInfo.matchString === ''){
        break
      }
    }
    let matchLength = matchInfo.matchString.length

    Object.assign(
      newMatchNode, {
        parent: metadata.parent, 
        depth: metadata.depth,
        inputString: inputString.slice(), 
        type: this['type'].slice(),
        id: this.id, 
        serial: this.generator.getAndIncrementMatchCount(),
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
    let smallestMatchLength = 0 //0 indicates no match
    let firstIteration = true

    for (let i = 0; i < this.nodes.length; i++){
      matchInfo = this.nodes[i].parse(inputString,{depth: metadata.depth + 1, parent: newMatchNode})
      subMatches.push(matchInfo)
      if (matchInfo.matchString === ''){
        smallestMatchLength = 0
        break
      }else{
        if (firstIteration){
          smallestMatchLength = matchInfo.matchString.matchLength
          firstIteration = false
        }
        else{
          if (matchInfo.matchString.matchLength < smallestMatchLength){
            smallestMatchLength = matchInfo.matchString.matchLength
          }
        }
      }

    }
      
    //matchLength will be equal to the shortest match, or 0 if there was no match
    let matchLength = smallestMatchLength

    Object.assign(
      newMatchNode, {
        parent: metadata.parent, 
        depth: metadata.depth,
        inputString: inputString.slice(), 
        type: this['type'].slice(),
        id: this.id, 
        serial: this.generator.getAndIncrementMatchCount(),
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

  M1Export(){
    return `[multiple,${this.nodes[0].M1Export()}]`
  }

  parse(inputString, metadata = {depth: 0, parent: null}){
    var newMatchNode = new MatchNode()
    let tempString = inputString
    let totalMatchLength = 0

    let subMatches = []
    let matchInfo = this.nodes[0].parse(tempString,{depth: metadata.depth + 1, parent: newMatchNode})
    if (matchInfo.matchString !== ''){
      subMatches.push(matchInfo)
    }
    while(matchInfo.matchString !== ''){
      totalMatchLength = totalMatchLength + matchInfo.matchString.matchLength
      tempString = tempString.substring(matchInfo.matchString.matchLength)
      matchInfo = this.nodes[0].parse(tempString,{depth: metadata.depth + 1, parent: this})
      subMatches.push(matchInfo)
    }
  
    Object.assign(
      newMatchNode, {
        parent: metadata.parent, 
        depth: metadata.depth,
        inputString: inputString.slice(), 
        type: this['type'].slice(),
        id: this.id, 
        serial: this.generator.getAndIncrementMatchCount(),
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

  M1Export(){
    return `[${this.constructor.type},${this.nodes[0].M1Export()}]`
  }

  parse(inputString, metadata = {depth: 0, parent: null}){
    let newMatchNode = new MatchNode()
    let matchInfo = this.nodes[0].parse(inputString,{depth: metadata.depth + 1, parent: newMatchNode})

    let subMatches = []
    subMatches.push(matchInfo)

    Object.assign(newMatchNode, {
      parent: metadata.parent, 
      depth: metadata.depth,
      inputString: inputString.slice(), 
      type: this['type'].slice(),
      id: this.id, 
      serial: this.generator.getAndIncrementMatchCount(),
      subMatches,
      matchString: inputString.substring(0, matchInfo.matchString.length),
    })
    return newMatchNode
  }
}

class SplitNode extends Node{
  static type = 'split'

  constructor(metadata){
    super(metadata)
    this.nodes = metadata.nodes
  }

  parse(inputString, metadata={depth:0,parent:null}){
    let newMatchNode = new MatchNode()
    let matchInfo = this.nodes[0].parse(inputString,{depth: metadata.depth + 1, parent: newMatchNode})
    let subMatches = []
    subMatches.push(matchInfo)
    
    Object.assign(newMatchNode, {
      parent: metadata.parent, 
      depth: metadata.depth,
      inputString: inputString.slice(), 
      type: this['type'].slice(),
      id: this.id, 
      serial: this.generator.getAndIncrementMatchCount(),
      subMatches,
      matchString: matchInfo.matchString.slice(),
    })
    return newMatchNode
  }
}

//A name node associates a name and a node together
//The first child of a name node is a string
//The second child of a name node is a node
class NameNode extends Node{
  static type = 'name'

  constructor(metadata){
    super(metadata)
    this.nodes = metadata.nodes
  }

  parse(inputString, metadata={depth:0,parent:null}){
    let newMatchNode = new MatchNode()
    let matchInfo = this.nodes[1].parse(inputString,{depth: metadata.depth + 1, parent: newMatchNode})
    let subMatches = []
    subMatches.push(matchInfo)
    
    Object.assign(newMatchNode, {
      parent: metadata.parent, 
      depth: metadata.depth,
      inputString: inputString.slice(), 
      type: this['type'].slice(),
      id: this.id, 
      serial: this.generator.getAndIncrementMatchCount(),
      subMatches,
      matchString: matchInfo.matchString.slice(),
    })
    return newMatchNode
  }
}

//A jump node is associated with the jump target, which is a string stored in this.nodes[0] representing a node id
//The jump node and the name node both need to exist before the connection between them can be finalized
class JumpNode extends Node{
  static type = 'jump'

  constructor(metadata){
    super(metadata)
    this.nodes = metadata.nodes
  }

  parse(inputString, metadata={depth:0,parent:null}){
    let newMatchNode = new MatchNode()
    let matchInfo = this.nodes[0].parse(inputString,{depth: metadata.depth + 1, parent: newMatchNode})
    let subMatches = []
    subMatches.push(matchInfo)
    
    Object.assign(newMatchNode, {
      parent: metadata.parent, 
      depth: metadata.depth,
      inputString: inputString.slice(), 
      type: this['type'].slice(),
      id: this.id, 
      serial: this.generator.getAndIncrementMatchCount(),
      subMatches,
      matchString: matchInfo.matchString.slice(),
    })
    return newMatchNode
  }
}

//This is the type of object that is emitted during the parsing operation by the parser
class MatchNode{
  constructor(){
    //Defaults will be overridden during matching
    this.subMatches = []
    this.matchString = ''
  }

  shallowDisplay(){
    console.log('begin node')
    for (let attribute in this){
      console.log(attribute + ':' + this[attribute])
    }
    console.log('end node')
  }
}

