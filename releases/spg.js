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
    return `[${this.constructor.type},${Generator.escape(this.string)}]`
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
    return `[${this.constructor.type},${Generator.escape(this.nodes[0])}]`
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

class H1{
  //Given a string s beginning with a node at line 0, this function will return the last character in the node
  static H1GetNodeString(s){
    //1)Get depth of first line, which should contain the node name
    let firstNodeDepth = H1.H1GetDepth(s)

    //2)Go line by line until a lower or equal depth has been reached. That should be the end of the current node
    let lines = s.split('\n')

    let nodeString = lines[0] + '\n'
    for (let i = 1; i < lines.length; i++){
      let line = lines[i]
      let lineDepth = H1.H1GetDepth(line)
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
      let firstNodeDepth = H1.H1GetDepth(s)
      let numberOfChildren = 0
      for (let i = 1; i < lines.length; i++){
        let line = lines[i]
        let lineDepth = H1.H1GetDepth(line)
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
      let firstNodeDepth = H1.H1GetDepth(s)
      let nodeName = H1.H1GetNodeName(s)
      
      let nodeTypeNames = Generator.getNodeTypeNames()
      if (nodeTypeNames.indexOf(nodeName) == -1){
        //error
        throw new Error('Unknown node type(H1GetChildNuggets): ' + nodeName)
      }
  
      if (['string literal','character class', 'jump'].indexOf(nodeName) > -1){
        //Take the next line
        childNodes.push(lines[1].substring(firstNodeDepth+1))
      }
      else if (nodeName == 'name'){
        childNodes.push(lines[1].substring(firstNodeDepth+1))
        childNodes.push(lines[2].substring(firstNodeDepth+1))
      }
      else{
        //For all other nodes, return an array of the child node strings
        let numberOfChildren = 0
        for (let i = 1; i < lines.length; i++){
          let line = lines[i] + '\n'
          let lineDepth = H1.H1GetDepth(line)
          if (lineDepth <= firstNodeDepth){
            break
          }
  
          if (lineDepth == firstNodeDepth + 1){
            numberOfChildren++
            childNodes.push('')
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
      let depth = H1.H1GetDepth(s)
      let nodeName = s.substring(depth,s.indexOf('\n'))
      return nodeName
    }
  
    //This function works for only one root node. It fails if there are two or more root nodes.
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
    static convertToM1(s){
      //Valid H1 format means the first line is the name of a node type
      let nodeString = H1.H1GetNodeString(s)
      if (nodeString == ''){
        throw new Error('String passed in for H1 to M1 conversion is not in H1 format.')
      }
      let childNuggets = H1.H1GetChildNuggets(nodeString)
  
      //Get the node name
      let nodeName = H1.H1GetNodeName(s)
      let childrenString = ''
  
      if (nodeName == 'character class' || nodeName == 'string literal'|| nodeName == 'jump'){
        let depth = H1.H1GetDepth(s)
        let lines = s.split('\n')
        childrenString += lines[1].substring(depth + 1)
      }else if (nodeName == 'name'){
//   name
//    asfdsf
//    adfsadfdsf
//     asdfasdfasdf
        let lines = s.split('\n')
        let secondLineBreak = s.indexOf('\n', lines[0].length + 1 + 1)
        childrenString += childNuggets[0]+ ',' + H1.convertToM1(s.substring(secondLineBreak + 1))
      }
      else{
        for (let i = 0; i < childNuggets.length; i++){
          if (i > 0){
            childrenString += ','
          }
          childrenString += H1.convertToM1(childNuggets[i])
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
    static import(s, generator){
      let M1Code = H1.convertToM1(s)
console.log('h1 converted to m1 is:' + M1Code)
      return M1.import(M1Code, generator)
    }
  
  
    //Returns without a trailing carriage return
    //rule list
    // rule
    //  multiple
    //Given the root node of a parsing tree, this transforms it into H1 format
    static H1Export(node, depth = 0){
      let outputString = H1.H1EncodeDepth(depth) + node.type + '\n'
  
      let childrenString = ''
      switch(node.type){
        case 'multiple':
        case 'not':
        case 'optional':
        case 'entire':
          {
            childrenString += H1.H1Export(node.nodes[0], depth + 1)
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
              childrenString += H1.H1Export(node[listPropertyName][i], depth + 1)
              if (i < node.rules.length - 1){
                childrenString += '\n'
              }
            }      
          }
          break
        case 'rule':
          {
            childrenString += H1.H1EncodeDepth(depth + 1) + node.name + '\n'
            childrenString += H1.H1Export(node.nodes[0], depth + 1)
          }
          break
        case 'character class':
        case 'string literal':
        case 'rule name':
          {
            childrenString += H1.H1EncodeDepth(depth + 1) + node.nodes[0]
          }
          break
        default:
          break
      }
      outputString += childrenString
      return outputString  
    }
  
}class M1{
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

  //s is a string passed in using M1 Format
  //generator is a reference to the Generator object, which is a parser generator
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
        //by the import function in a post-processing operation
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

}class H2{
    //If string starts with a fixed string X, followed by optional empty space and then [ and then a matching right square bracket ] then return the string
  //Otherwise, return the empty string
  //There is a bug when there is a [ followed by ']'. Even so, life goes on.
  static headMatchXWithBrackets(string, X){
    var location_of_first_left_bracket = string.indexOf('[')
    if (location_of_first_left_bracket < 0) return ''

    var left_of_first_left_bracket = string.substring(0,location_of_first_left_bracket).trim()
    if (left_of_first_left_bracket == X){
      let indexOfRightMatchingSquareBracket = Generator.getMatchingRightSquareBracket(string,location_of_first_left_bracket)

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
    for (let nodeType of Generator.nodeTypes){
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
      let nextPatternString = Generator.headMatchPattern(tempString)
      if (nextPatternString == ''){
        break
      }
      else{
        let singlePattern = Generator.grammarize_PATTERN(nextPatternString)
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
    for (let i = 0; i < Generator.nodeTypes.length; i++){
      let headMatchResult = Generator.nodeTypes[i].headMatch(string)
      if (headMatchResult){
        return Generator.nodeTypes[i].type
      }
    }
    return ''
  }

  //Given a type of a pattern to match and a string, this function emits a node tree of the type specified by typeOfPattern if string matches
  //the pattern specified by typeOfPattern
  static grammarize(typeOfPattern, string, parser){
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
      case 'entire':
        return EntireNode.grammarize(string,parser)
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
    let typeOfPattern = Generator.getTypeOfPattern(trimmed_string)
    return parser.grammarize(typeOfPattern, trimmed_string, parser)
  }

  //Takes in a string representation of a grammar, and returns a parser
  //The parser is an in-memory tree structure representation of the grammar
  static H2Import(string, parser){
    var return_node = RuleListNode.grammarize(string, parser)

    if (return_node == null){
      console.log('H2 Import failed. Grammar is empty or there was an error in your grammar.')
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

}
/**
 * The Generator class is a parser generator that generates in-memory parsers, and allows for the export of such parsers into the M1 or H1 format 
 * so that they can be imported in a different language environment.
 */
class Generator{
  /**
   * @constructor
   */
  constructor(){
    this.idCounter = 0
    this.matchCount = 0 //enumerates the matches
    this.nameNodes = {}
    this.jumpNodes = []
  }

  /**
   * This function Uses console.log to verify that the software has been installed correctly. Running Generator.installCheck() should
   * display the message 'Successfully installed.'.
   * */
  static installCheck(){
    console.log('Successfully installed.')
  }

  /***
   * This is a private function that initializes the Generator.nodeTypes property with a
   * mapping between the 'friendly names' of nodes and the object classes.
   */
  static registerNodeTypes(){
    Generator.nodeTypes = {
      'character class': CharacterClassNode,
      'string literal':StringLiteralNode,
      'sequence':SequenceNode,
      'or':OrNode,
      'and':AndNode,
      'multiple':MultipleNode,
      'not':NotNode,
      'optional':OptionalNode,
      'entire':EntireNode,
      'split':SplitNode,
      'name':NameNode,
      'jump':JumpNode
    }
  }

  /**
   * Returns an array of strings listing the available node types recognized by this parser generator.
   * 
   * In other words: ['character class', 'string literal', 'sequence',...]
   * @returns {Array}
   */
  static getNodeTypeNames(){
    return Object.keys(Generator.nodeTypes)
  }

  /***
   * Increments the number of matches the parser has performed. Then, returns one less than the number of matches. Used to uniquely identify
   * all the match nodes as they are generated.
   * 
   * @returns {Number}
   */
  getAndIncrementMatchCount(){
    let oldMatchCount = this.matchCount
    this.matchCount = this.matchCount + 1
    return oldMatchCount
  }

  /**
   * Generates an in-memory parser using a string description in M1 or H1 format.
   * 
   * The definition for a parser in H1 or M1 format. The format must match the value passed into the format parameter. See the documentation in M1.md or H1.md for more information on the M1 and H1 file formats.
   * @param {String} parserDescription
   * 
   * format can be either 'H1' or 'M1'
   * @param {String} format
   *
   * Returns a parser, as described by the string parserDescription.
   * @returns {Object}
   */
  generateParser(parserDescription, format='H1'){
    let parser
    switch (format){
      case 'H1':
        //Given a parser description in H1 format, loads the parser into memory
        parser = Generator.H1.import(parserDescription, this)
        break
      case 'M1':
        parser = Generator.M1.import(parserDescription, this)
        break
      default:
        break
    }

    return parser
  }

  /***
   * Generates and returns the next id value associated with the parser generator. The first id value is 0. Each time this function is called, the id value that will be returned will be incremented by 1.
   * 
   * @returns {Number}
   */
  getId(){
    let currentCounter = this.idCounter
    this.idCounter = this.idCounter + 1
    return currentCounter
  }
  
  /***
   * This function takes in a metadata object specifying the official node type name of a node and returns
   * the node of that node type.
   * 
   * Takes in one of the official node type names as a string and returns an object of that node type.
   * 
   * The new node has the following properties:
   * type -> A string 
   * id -> A unique integer
   * generator -> A pointer to the generator object that created the node.
   * 
   * 
   * The metadata parameter is an object of the form:
   * {
   *  type:<node type>,
   *  ...other attributes, like
   * }
   * @param {Object} metadata 
   */
  createNode(metadata){
    let newNode = new Generator.nodeTypes[metadata.type](metadata)
    switch (metadata.type){
      case 'name':
        this.nameNodes[metadata.nodes[0]] = newNode
        break
      case 'jump':
        this.jumpNodes.push(newNode)
    }
    newNode.id = this.getId()
    newNode.generator = this
    return newNode
  }

  /***
   * This function takes in an array of jump nodes and a map going from jump nodes to name nodes, and uses this information
   * to connect the jump node to the name node that it is jumping to. A connection is formed when the first
   * node child of a jump node is set to the value of a name node object.
   * 
   * During parsing, a jump node succeeds if its name node target succeeds.
   */
  static connectJumpNodesToNameNodes(jumpNodes, nameNodesMap){
    for (let jumpNode of jumpNodes){
      let tempNode = nameNodesMap[jumpNode.nodes[0]]
      jumpNode.nodes[0] = tempNode
    }
  }
}

Generator.registerNodeTypes()
Generator.validRuleNameCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_'
Generator.keywords = ['OR','AND', 'SEQUENCE', 'NOT', 'OPTIONAL', 'MULTIPLE', 'CHARACTER_CLASS', 'ENTIRE']

Generator.H1 = H1
Generator.M1 = M1

export {Generator}
export default Generator
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


/**
 * Converts a tree into either a text-based representation or a DOM tree representation.
 * 
 */
class TreeViewer{
  /**
   * 
   * @param {Object} root The root tree node
   * @param {DOMElement} parentElement The DOM parent node where the root HTML element will be attached for display.
   */
  constructor(parentElement = null){
    /** 
     * The parentElement, if passed in is used to attach DOM elements when using the display function.
     * If no parent element is passed in,
     * @member {DOMElement} */
    this.parentElement = parentElement
    // this.domElement = document.createElement('pre')
    // this.parentElement.appendChild(this.domElement)
  }

  /**
   * A recursively applied function.
   * 
   * node is a node on a parse tree produced by the parse function. It is expected that nodes have
   * the following properties
   * @param {MatchNode} matchNode
   * 
   * Returns an output string representing the input tree rooted at node. If the node is null, then 
   * "(null)\n" is returned.
   * @returns {String}
   */
  getOutputString(matchNode){
    if (matchNode === null){
      return '(null)\n'
    }

    if (typeof matchNode == 'undefined'){
      return '(undefined)\n'
    }

    let outputString = ' '.repeat(matchNode.depth) + '*****BEGIN*' + matchNode.type+'*'+matchNode.depth+'\n'

    for (let key in matchNode){
      let keyValue = matchNode[key]

      switch(key){
        case 'parent':
          {
            //display parent's id value
            let parentIdValue = '(null)'
  
            if (keyValue != null){
              parentIdValue = keyValue.id + ''
            }

            outputString += ' '.repeat(matchNode.depth) + key + ":" + parentIdValue + '\n'
  
          }
          break
        case 'subMatches':
          for (let i = 0; i < matchNode['subMatches'].length;i++){
            outputString += this.getOutputString(keyValue[i])
          }
          // outputString += ' '.repeat(matchNode.depth) + key + ':' + keyValue + '\n'
          break;
        default:
          if (keyValue === ''){
            keyValue = '(empty string)'
          }
          outputString += ' '.repeat(matchNode.depth) + key + ':' + keyValue + '\n'
          //this.getOutputString(keyValue)
          break
      }
    }

    outputString += ' '.repeat(matchNode.depth) + '*************END*************'+matchNode.depth+'\n'

    return outputString
  }

  /**
   * A set of key-value pairs used to configure the display function. The possible options are:
   * 'text' and 'html'.
   * If 'text' mode is selected, then output will be in the form of indented string blocks and the console will be
   * used for display. If display is not desired, the function getOutputString can be used instead.
   * 
   * @param {Object} mode
   * 
   */
  display(mode = 'text', matchNode){
    // //There are two display modes: to display in the console, or to display in the DOM on the browser
    // if (!this.parentElement){
    //   console.log(outputString)
    // }else{
    // }

    if (mode == 'text'){
      console.log(this.getOutputString(matchNode))
    }
    /*
    else if (mode == 'html'){
      let outputTextNode = document.createTextNode(outputString)
      this.domElement.appendChild(outputTextNode)
    }*/
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

export {TreeViewer}
