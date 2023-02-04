/**
 * The Generator class generates in-memory parsers, allows for the export of such parsers into M1 or H1 format 
 * and allows for the import of these formats back into an in-memory parser.
 * 
 * Usage:
 * let generator = new Generator() //Construct a new parser generator
 * generator.generateParser(grammarDefinitionString) //set input grammar
 * let outputTree = paparserGeneratorrser.parse(inputString) //parse input string
 * 
 * In other words, the grammar that the parser needs to parse is passed into the constructor during the creation on the Generator object
 * Then, the parse function is run, taking in an string representing a small set of data given in the language specified by the language loaded by the Generator object during its construction
 * 
 * The Generator object is a parser generator.
 */
class Generator{
  constructor(){
    this.idCounter = 0
    this.matchCount = 0 //enumerates the matches
    this.nameNodes = {}
    this.jumpNodes = []
  }

  /**
   * Uses console.log to verify that the software has been installed correctly. Running Generator.installCheck() should
   * display a confirmation message that the software is installed.
   * */
  static installCheck(){
    console.log('Simple Generator Generator is installed.')
  }

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

  //Returns an array of all node types known by the parser
  static getNodeTypeNames(){
    return Object.keys(Generator.nodeTypes)
  }

  /*
   * Returns the number of matches the parser has performed. Then, increases it by 1. Used to name 
   * all the match nodes as they are generated.
   * 
   * Returns the number of matches the parser has performed.
   * @returns {Number}
   */
  getAndIncrementMatchCount(){
    let oldMatchCount = this.matchCount
    this.matchCount = this.matchCount + 1
    return oldMatchCount
  }

  /**
   * Generates an in-memory parser using a string description in M1, H1 or H2 formats.
   * 
   * The definition for a parser in H1 format
   * @param {String} parserDescription
   *
   */
  generateParser(parserDescription){
    let parser = Generator.H1Import(parserDescription, this)

    return parser
  }

  getId(){
    let currentCounter = this.idCounter
    this.idCounter = this.idCounter + 1
    return currentCounter
  }
  
  /*
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

  //jumpNodes is an array of jump nodes containing a single node that is a string specifying the name of a name node
  //nameNodes is a map from names of name nodes to the name node itself
  //and the second property of each object is the name node itself
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
