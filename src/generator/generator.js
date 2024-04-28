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
