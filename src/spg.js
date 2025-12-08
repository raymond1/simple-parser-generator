import M1 from "./file-formats/m1/m1.js"
import H1 from "./file-formats/h1/h1.js"
import O1 from "./file-formats/o1/o1.js"
import Tree from "./classes/tree.js"
import TreeViewer from "./classes/tree_viewer.js"
import Nodes from "./classes/nodes.js"

/**
 * The ParserGenerator class is a parser generator that generates in-memory parsers, and allows for the export of such parsers into the O1 or H1 format 
 * so that they can be imported in a different language environment.
 */
class ParserGenerator{
  /**
   * @constructor
   */
  constructor(){
    this.idCounter = 0
    this.matchCount = 0 //enumerates the matches
    this.nameNodes = {}
    this.jumpNodes = []
  }

  reset(){
    this.idCounter = 0
    this.matchCount = 0
    this.nameNodes = {}
    this.jumpNodes = []
    //It is possible that the nodes themselves may point to each other, resulting in a memory leak.
  }

  /** @method
   * This function uses console.log to verify that the software has been installed correctly. Running ParserGenerator.installCheck() should
   * display the message 'Successfully installed.'.
   * */
  static installCheck(){
    console.log('Successfully installed.')
  }

  /** 
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

  /** @method
   * Generates an in-memory parser using a string description in O1 or H1 format.
   * 
   * The definition for a parser in H1 or O1 format. The format must match the value passed into the format parameter. See the documentation in O1.md or H1.md for more information on the O1 and H1 file formats.
   * @param {String} parserDescription
   * 
   *
   * Returns a parser, as described by the string parserDescription.
   * @returns {Object}
   */
  generateParser(parserDescription){
    return ParserGenerator.H1.Import(parserDescription, this)
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
    let newNode = new ParserGenerator.Nodes.NodeTypes[metadata.type](metadata)
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
}


ParserGenerator.M1 = M1
ParserGenerator.H1 = H1
ParserGenerator.O1 = O1
ParserGenerator.Tree = Tree
ParserGenerator.TreeViewer = TreeViewer
ParserGenerator.Nodes = Nodes

export {ParserGenerator}
export default ParserGenerator
