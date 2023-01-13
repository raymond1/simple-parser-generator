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
      'entire':EntireNode
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

  /*
   * Detects the file format for a given string. Returns "M1", "H1" or "H2" based off of a heuristic analyzing the start of a file.
   # Returns "unknown" for all other file types.
   * 
   * @param {A String object holding an input grammar in H2, H1 or M1 format.} s 
   * @param {A Generator object that will be generating the parser.} parser 
   * @returns {'String'}
   */
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

  /**
   * Generates an in-memory parser using a string description in M1, H1 or H2 formats.
   * 
   * The definition for a parser in either M1, H1 or H2 format
   * @param {String} parserDescription
   *
   * One of 'M1', 'H1', or 'H2' in lower case or upper case.
   * @param {String} language 
   */
  generateParser(parserDescription, language){
    if (!language){
      throw new Error("No input language specified.")
    }

    let _language = language.toUpperCase()
    let parser

    if (['M1','H1','H2'].includes(_language)){
      console.log(_language + ' parser detected.')
    }
    if (_language == 'M1'){
      parser = Generator.M1Import(parserDescription, this)
    }else if (_language == 'H1'){
      parser = Generator.H1Import(parserDescription, this)
    }else if (_language == 'H2'){
      parser = Generator.H2Import(parserDescription, this)
    }else{
      throw new Error("Invalid input language. Should be 'H1', 'M1' or 'H2'(either lower or upper case).")
    }
    
    return parser
  }


  getId(){
    let currentCounter = this.idCounter
    this.idCounter = this.idCounter + 1
    return currentCounter
  }


  /*
   * 
   * Takes in an input string and feeds it into the in-memory parser after setGrammar has been run.
   * 
   */
  parse(inputString){
    if (this.grammar){
      let matchInformationNodes = this.grammar.match(inputString)
      let matchInformationTree = new Tree(matchInformationNodes)
      this.rawMatches = matchInformationTree
      return this.rawMatches
      // let ruleMatchesTree = matchInformationTree.getRuleMatchesOnly()
      // return ruleMatchesTree  
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
    newNode.id = this.getId()
    newNode.generator = this
    return newNode
  }
}

Generator.registerNodeTypes()
Generator.validRuleNameCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_'
Generator.keywords = ['OR','AND', 'SEQUENCE', 'NOT', 'OPTIONAL', 'MULTIPLE', 'CHARACTER_CLASS', 'ENTIRE']

Generator.H1Import = H1.H1Import
Generator.M1Import = M1.M1Import
Generator.H2Import = H2.H2Import
