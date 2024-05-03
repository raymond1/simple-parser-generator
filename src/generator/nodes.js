/**
 * This class represents an atomic operation. When configured into a graph, Node objects form parsing programs that can
 * accomplish complex tasks. Parsing is also sometimes called 'matching'.
 * 
 * A Node object is not usually constructed directly, but is extended by another class that is directly constructed.
 * */
class Node{
  /**
   * This constructor is called by the subclass that extends it when an object of the subclass is instantiated.
   * The type property of then becomes the type property of the class that it has become. For example,
   * if the subclass of a Node is JumpNode, the command "new CharacterClassNode('a')" will set the type of a Node object to the
   * type property of the CharacterClassNode class.
   */
  constructor(metadata){
    this.type = this.constructor.type //Show type in object for the debugger
    this.nodes = metadata.nodes
  }

  //Implemented and overriden by child nodes. Given a node, coverts it into a string form
  export(depth = 0){
    throw new Exception('Error while exporting grammar: ' + node['type'] + ' export not implemented.')
  }
}

/**
 * This class represents a character class. It provides the 'parse' function, which is capable of 
 * determining whether the start of an input string belongs to a class of characters defined
 * and stored in the class during instantiation.
 * 
 * After instantiation, an object of the CharacterClassNode class will have a nodes property,
 * where nodes[0] contains a string. When the parse function is called with an input string,
 * 
 * Examples:
 * 
 * let metadata = {nodes:['a string']}
 * let cc = new CharacterClassNode()
 * 
 * @property {Object} nodes - An array containing one element, nodes[0], which stores the internal
 * string of the character class node, representing the list of characters belonging to the character class.
 * */
class CharacterClassNode extends Node{
  /**
   * This constructor takes in a metadata object with a nodes property with nodes[0] equal to a string representing the character class that this node will match against.
   * @param {Object} metadata 
   */
  constructor(metadata){
    super(metadata)
    this.nodes = metadata.nodes
  }

  /**
   * @property {String} type - The constant string 'character class'
   * */
  static type = 'character class'

  export(){
    return `[${this.constructor.type},${ParserGenerator.escape(this.string)}]`
  }

  /**
   * This method takes in a string value in the inputString parameter
   * and returns n, where n is equal to the number of consecutive characters of inputString,
   * starting from the beginning, which are also found in the internal string stored in
   * the first element of the nodes property, which is defined during class construction.
   * 
   * @param {String} inputString - The input string to parse.
   * @returns {MatchNode}
   */
  parse(inputString, metadata = {depth: 0, parent: null}){

    let newMatchNode = new MatchNode()
    //matches if the inputString starts with characters from the character class
    let matchingString = ''
    let matchFound = false
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
      matchFound = true
    }

    Object.assign(newMatchNode, {
      parent: metadata.parent, 
      depth: metadata.depth,
      inputString: inputString.slice(), 
      type: this['type'].slice(),
      id: this.id, 
      serial: this.generator.getAndIncrementMatchCount(),
      matchString: inputString.substring(0, matchLength),
      matchFound
    })
    return newMatchNode
  }
}

/**
 * A string literal node is associated with an internal string. It is used to determine if
 * an input string starts with the internal string associated with it.
 * 
 * associated with the string literal node.
 */
class StringLiteralNode extends Node{
  /**
   * To construct a string literal node, a metadata object is passed in, containing the internal
   * string to initialize the string literal node.
   * @param {Object} metadata - An object with a nodes property, where nodes is an array with one
   * element, which is the internal string of the string literal node
   */
  constructor(metadata){
    super(metadata)
  }

  /**
   * @property {String} type - The string constant 'string literal'
   */
  static type = 'string literal'

  export(){
    return `[${this.constructor.type},${ParserGenerator.escape(this.nodes[0])}]`
  }

  /**
   * During parsing, the inputString is compared against the internal string. If the first
   * few letters of inputString are equal to the internal string, the parse method returns
   * the length of the internal string. Otherwise, the method returns 0.
   * 
   * @param {String} inputString - The input string
   * @returns {MatchNode}
   */
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
      string: this.nodes[0],
      matchFound: matchLength > 0?true:false
    })
    return newMatchNode
  }
}

/**
 * A not node is a parser that is used to invert the value of the parse method of its child node. If
 * the child node's parse method returns 0, the not node returns the length of the input string. If
 * the child node's parse method returns a positive value, a not node's parse function returns 0.
 * 
 * @property {Object} nodes - An array of nodes containing one element, which is a child node.
 */
class NotNode extends Node{
  constructor(metadata){
    super(metadata)
    this.nodes = metadata.nodes
  }
  /**
   * @property {String} type - The string constant 'not'
   */
  static type = 'not'

  export(){
    return `[${this.constructor.type},${this.pattern.export()}]`
  }

  /**
   * This function returns 0 if its child node returns a positive number when fed with the input string.
   * Otherwise, it returns the length of the input string.
   * @param {String} inputString - The input string.
   * @returns {Number} - Returns 0 if child node's parse function returns a positive number. Otherwise, returns
   * the length of inputString.
   */
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
        matchFound: !matchInfo.matchFound
      }
    )

    return newMatchNode
  }
}

/**
 * The entire node matches an input string only if the entire input string is matched by its child node during matching.
 * It is useful when determining when the entire input string matches rather than just a part of a string.
 * 
 * @property {Object} nodes - nodes is an array of nodes of length 1.
 * */
class EntireNode extends Node{
  /**
   * @param {Object} metadata - metadata is an object with a nodes property, where nodes is an
   * array containing a single Node object.
   */
  constructor(metadata){
    super(metadata)
    this.nodes = metadata.nodes
  }

  /**
   * @property {String} type - The string constant 'entire'.
   */
  static type = 'entire'

  export(){
    return `[${this.constructor.type},${this.nodes[0].export()}]`
  }

  /**
   * This function passes the input string to its child node's parse function. The return value from
   * the child node's parse function is n. If n is the same as the length of the input string,
   * then this function returns n. Otherwise, this 0 is returned.
   * @param {String} inputString - The input string. 
   * @returns {MatchNode}
   */
  parse(inputString, metadata = {depth: 0, parent: null}){
    let newMatchNode = new MatchNode()
    let matchInfo = this.nodes[0].parse(inputString,{depth: metadata.depth + 1, parent: newMatchNode})

    let subMatches = []
    let matchLength = 0
    let matchFound = false
    subMatches.push(matchInfo)

    if (matchInfo.matchString.length == inputString.length){
      matchLength = matchInfo.matchString.length
      matchFound = true
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
      matchFound
    })
    return newMatchNode
  }
}

/**
 * This class represents a node that matches a sequence of one or more child nodes.
 * 
 * @property {Object} nodes - An array of child nodes, containing one or more elements.
 */
class SequenceNode extends Node{
  /**
   * @param {Object} metadata - An object with a nodes property, which is an array of nodes.
   */
  constructor(metadata){
    super(metadata)
    this.nodes = metadata.nodes
  }
  /**
   * @property {String} type - The string constant 'sequence'.
   */
  static type = 'sequence'

  export(){
    let patternsString = ''
    this.nodes.forEach((pattern, index)=>{
      if (index > 0){
        patternString += ","
      }
      patternsString += `[${pattern.export()}]`
    })
    let s = `[${patternsString}]`
    return s
  }

  /**
   * The sequence node has an array of one or more child nodes. It matches the first child node from
   * the nodes property (i.e. nodes[0]), against the input string. If it is
   * 
   * 
   * This method returns false if any of the submatches returns false
   * 
   * 
   * @param {String} inputString - The input string. 
   * @returns {Number} The sum of the matched strings of its child nodes if matching was successful
   */
  parse(inputString, metadata = {depth: 0, parent: null}){
    var newMatchNode = new MatchNode()
    let tempString = inputString
    let totalMatchLength = 0

    let subMatches = []
    let matchInfo
    let matchFound = true
    for (let i = 0; i < this['nodes'].length; i++){
      matchInfo = this.nodes[i].parse(tempString,{depth: metadata.depth + 1, parent: newMatchNode})
      subMatches.push(matchInfo)
      if (!matchInfo.matchFound){
        matchFound = false
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
        matchFound
      }
    )

    return newMatchNode
  }
}

/**
 * Simulates an 'or' operation between two or more child node operands. If one or more operands evaluates to
 * true, the 'or' node evaluates to true.
 */
class OrNode extends Node{
  /**
   * 
   * @param {Object} metadata - has a 'nodes' property which is an array of two or more elements. Element 1
   * is 
   */
  constructor(metadata){
    super(metadata)
  }

  /**
   * @property {String} type - The string constant 'or'.
   */
  static type = 'or'
  
  export(){
    let patternsString = ''
    this.nodes.forEach((pattern, index)=>{
      if (index > 0) patternsString += ","
      patternsString += pattern.export()
    })
    let s = `[${this.constructor.type},${patternsString}]`
    return s
  }

  /**
   * Takes in a string and returns a MatchNode object with two properties: matchFound and matchString.
   * 
   * matchNode{
   *  matchFound: true if one or more of the child nodes' parse functions returns a matchFound property of true. False otherwise.
   *  matchString: equal to the substring of the input string of length equal to the the length of the first matching child node function.
   * }
   * @param {String} inputString - the input string.
   * @returns {MatchNode}
   */
  parse(inputString,metadata = {depth: 0, parent: null}){
    var newMatchNode = new MatchNode()

    let subMatches = []
    let matchInfo
    let matchFound = false
    for (let i = 0; i < this.nodes.length; i++){
      matchInfo = this['nodes'][i].parse(inputString,{depth: metadata.depth + 1, parent: newMatchNode})
      subMatches.push(matchInfo)
      if (!matchInfo.matchFound){
        continue
      }
      else{
        matchFound = true
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
        matchFound
      }
    )

    return newMatchNode
  }
}

/**
 * Represents an 'and' operation. Takes in two or more operands and returns true if all operands return true.
 * 
 * The length of the returned operand will be equal to the length of the shortest matching operand if
 * the input string matches all child nodes. It will be 0 otherwise.
 */
class AndNode extends Node{
  constructor(metadata){
    super(metadata)
    this.nodes = metadata.nodes
  }

  /**
   * @property {String} type - The string constant 'and'.
   */
  static type = 'and'

  export(){
    let patternsString = ''
    this.nodes.forEach((pattern, index)=>{
      if (index > 0) patternsString += ","
      patternsString += pattern.export()
    })
    let s = `[${this.constructor.type},${patternsString}]`
    return s
  }

  /**
   * Takes in a string and returns a MatchNode object with the following properties:
   * matchFound: true if every child node matches with inputString, false otherwise
   * matchString: equal to the substring of inputString of length n, where n is equal to the length of the
   * smallest match of the child nodes of the 'and' node.
   * 
   * @param {String} inputString - The input string. 
   * @returns {MatchNode}
   */
  parse(inputString,metadata = {depth: 0, parent: null}){
    var newMatchNode = new MatchNode()

    let subMatches = []
    let matchInfo
    let smallestMatchLength = 0 //0 indicates no match
    let firstIteration = true
    let matchFound = true

    for (let i = 0; i < this.nodes.length; i++){
      matchInfo = this.nodes[i].parse(inputString,{depth: metadata.depth + 1, parent: newMatchNode})
      subMatches.push(matchInfo)
      if (!matchInfo.matchFound){
        smallestMatchLength = 0
        matchFound = false
        break
      }else{
        //If there is only one subsequence, use that as the matchLength
        if (firstIteration){
          smallestMatchLength = matchInfo.matchString.matchLength
          firstIteration = false
        }
        else{
          //If there is more than one subsequence, use the smallest matchLength
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
        matchFound
      }
    )

    return newMatchNode
  }
}

/**
 * The multiple node has one child node. It feeds the child node with a subset of the input string repeatedly until the child node's parse function returns false.
 * The subset of the input string fed in is the input string starting from the offset k, where k is
 * equal to the sum of the lengths of the child node matches for which the matchFound property is true.
 */
class MultipleNode extends Node{
  /**
   * @param {Object} metadata - metadata is an object with a nodes property with one child node.
   */
  constructor(metadata){
    super(metadata)
  }

  /**
   * @property {String} type - The string constant 'multiple'.
   */
  static type = 'multiple'

  export(){
    return `[multiple,${this.nodes[0].export()}]`
  }

  /**
   * Takes in an input string and returns a MatchNode object with the following properties:
   * matchFound: true if the child node of the multiple node matches at least once
   * matchLength: Equal to the value n, where n is the sum of the matchLength property of 
   * the child node's parse function when fed with an interation of the input string.
   * @param {String} inputString - The input string
   * @returns {MatchNode}
   */
  parse(inputString, metadata = {depth: 0, parent: null}){
    var newMatchNode = new MatchNode()
    let tempString = inputString
    let totalMatchLength = 0
    let matchFound = false
    let subMatches = []
    let matchInfo = this.nodes[0].parse(tempString,{depth: metadata.depth + 1, parent: newMatchNode})
    if (matchInfo.matchFound){
      matchFound = true
      subMatches.push(matchInfo)
    }

    while(matchInfo.matchFound){
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
        matchFound
      }
    )

    return newMatchNode
  }
}

/**
 * The optional node always produces a matchFound property of true.
 * It attempts to match the input string against its child node. If it succeeds, it moves
 * the caret by the length of the match. If its child node's match fails, it moves its caret by 0.
 */
class OptionalNode extends Node{
  /**
   * 
   * @param {Object} metadata - Contains a nodes property which is an array with one element, which is a child node.
   */
  constructor(metadata){
    super(metadata)
  }

  /**
   * @property {String} type - The string constant 'optional'.
   */
  static type = 'optional'

  export(){
    return `[${this.constructor.type},${this.nodes[0].export()}]`
  }

  /**
   * Takes in a string and returns a MatchNode object with the following properties:
   * matchFound: true
   * matchLength: equal to 0 if child node produces a matchFound value of false, equal to the
   * length of the child node's matchLength property if the child node's parse function produces a matchFound property of true.
   * @param {String} inputString - The input string.
   * @returns {MatchNode}
   */
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
      matchFound: true
    })
    return newMatchNode
  }
}

/**
 * Produces multiple partition spaces for nodes, which can be used in conjunction with the Name node and Jump node to produce loops.
 */
class SplitNode extends Node{
  /**
   * @property {String} type - The string constant 'split'.
   */
  static type = 'split'

  /**
   * Takes in a metadata object with nodes property which is an array of one or more child nodes.
   * @param {Object} metadata 
   */
  constructor(metadata){
    super(metadata)
  }

  /**
   * Takes in an input string and returns a MatchNode object with the following properties:
   * matchFound: true if the nodes[0].parse(inputString) function returns true, false otherwise.
   * matchLength: Equal to the matchLength property of the nodes[0].parse(inputString) function
   * @param {String} inputString - The input string. 
   * @returns {MatchNode}
   */
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
      matchFound: matchInfo.matchFound
    })
    return newMatchNode
  }
}

/**
 * This node represents a node that is given a special name that is reachable as a target by a jump node.
 * */
class NameNode extends Node{
  /**
   * @property {String} type - The string constant 'name'.
   */
  static type = 'name'

  /**
   * @param {Object} metadata - an object with a nodes property containing an element with two elements:
   * element 1: a string holding the name of the node
   * element 2: a child node
   */
  constructor(metadata){
    super(metadata)
  }

  /**
   * The parse function takes in an input string and returns a MatchNode object with the following properties:
   * matchFound: true if its nodes[1] object's parse function returns true
   * matchLength: equal to the length of its child node's matchLength property
   * @param {String} inputString - The input string. 
   * @returns {MatchNode}
   */
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
      matchFound: matchInfo.matchFound
    })
    return newMatchNode
  }
}

//A jump node is associated with the jump target, which is a string stored in this.nodes[0] representing a node id
//The jump node and the name node both need to exist before the connection between them can be finalized
class JumpNode extends Node{
  /**
   * @property {String} type - The string constant 'name'.
   */
  static type = 'jump'

  /**
   * @param {Object} metadata - Contains a nodes property, which is an array containing one child node
   * The child node is the name of the name node that the jump node will jump to.
   */
  constructor(metadata){
    super(metadata)
  }

  /**
   * Takes in a string and returns a MatchNode object with the following properties:
   * matchFound: true if its child node returns matchFound true
   * matchLength: equal to the length of the child's matchFound property
   * @param {String} inputString - The input string. 
   * @returns {MatchNode}
   */
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
      matchFound: matchInfo.matchFound
    })
    return newMatchNode
  }
}

/**
 * A MatchNode object contains statistics that indicate the result of various parsing functions.
 * It will have a matchString property
 * and a matchFound property.
 * */
class MatchNode{
  constructor(){
    //Defaults will be overridden during matching
    this.subMatches = []
    this.matchString = ''
    this.matchFound = false
  }

  shallowDisplay(){
    console.log('begin node')
    for (let attribute in this){
      console.log(attribute + ':' + this[attribute])
    }
    console.log('end node')
  }
}

