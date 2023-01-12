/**
 * The Generator class generates in-memory parsers, allows for the export of such parsers into M1 or H1 format 
 * and allows for the import of these formats back into an in-memory parser.
 * 
 * Usage:
 * let parser = new Generator() //Construct a new parser generator
 * parser.setGrammar(grammarDefinitionString) //set input grammar
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
    Generator.nodeTypes = []
    Generator.nodeTypes.push(SequenceNode)
    Generator.nodeTypes.push(OrNode)
    Generator.nodeTypes.push(AndNode)
    Generator.nodeTypes.push(MultipleNode)
    Generator.nodeTypes.push(NotNode)
    Generator.nodeTypes.push(OptionalNode)
    Generator.nodeTypes.push(CharacterClassNode)
    Generator.nodeTypes.push(StringLiteralNode)
    Generator.nodeTypes.push(EntireNode)
    //Order matters for getnodetype
    Generator.nodeTypes.push(RuleNameNode)
    Generator.nodeTypes.push(RuleNode)
    Generator.nodeTypes.push(RuleListNode)

    //Note that the rule for the rule list does not have to be in this list because no reference to it will can be made within one of its rules
    //and so it will never get triggered during parsing of the input grammar
  }

  //Returns an array of all node types known by the parser
  static getNodeTypeNames(){
    let nodeTypeNames = []
    for (let nodeType of Generator.nodeTypes){
      nodeTypeNames.push(nodeType.type)
    }
    return nodeTypeNames
  }

  getMatchCount(){
    let matchCount = this.matchCount
    this.matchCount = this.matchCount + 1
    return matchCount
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
   * Sets the grammar that the parser generator will generate a parser for. The second parameter, language is optional.
   * If specified as one of 'M1', 'H1', or 'H2', that file format will be used to construct a parser in memory. If not specified, 'H2' is assumed.
   * 
   * @param {String} s 
   * @param {String} language 
   */
  setGrammar(s, language='H2'){
    if (language == 'M1'){
      this.grammar = Generator.M1Import(s, this)
    }else if (language == 'H1'){
      this.grammar = Generator.H1Import(s, this)
    }else if (language == 'H2'){
      this.grammar = Generator.H2Import(s, this)
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
}

Generator.registerNodeTypes()
Generator.validRuleNameCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_'
Generator.keywords = ['OR','AND', 'SEQUENCE', 'NOT', 'OPTIONAL', 'MULTIPLE', 'CHARACTER_CLASS', 'ENTIRE']

