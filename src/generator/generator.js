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
   * CZZZ Need to be able to make this work with multiple input formats...
   * 
   * Generates an in-memory parser using a string description in M1 or H1 format.
   * 
   * The definition for a parser in H1 or M1 format. See the documentation in M1.md or H1.md for more information.
   * @param {String} parserDescription
   * 
   * Either H1 or M1
   * @param {String} format
   *
   * Returns a parser, as described by the string parserDescription.
   * @returns {Object}
   */
  generateParser(parserDescription, format='H1'){
    let parser = Generator.H1Import(parserDescription, this)

    return parser
  }

  /**
   * 
   * @returns CZZZ
   */
  getId(){
    let currentCounter = this.idCounter
    this.idCounter = this.idCounter + 1
    return currentCounter
  }
  
  /*
   * CZZZ
   * Takes in one of the official node type names and returns an object of that node type.
   * Also sets the generator object for a node and the id.
   * 
   * 
   * metadata is of the form:
   * {
   *  type:<node type>,
   *  ...other attributes, like
   *  string
   * }
   * @param {String} metadata 
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

  /**
   * CZZZ
   *   jumpNodes is an array of jump nodes containing a single node that is a string specifying the name of a name node
  nameNodes is a map from names of name nodes to the name node itself
  and the second property of each object is the name node itself
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

Generator.H1Import = H1.H1Import
Generator.M1Import = M1.M1Import

export {Generator}
export default Generator
