import H1 from "../file-formats/h1/h1.js"
import M1 from "../file-formats/m1/m1.js"
import O1 from "../file-formats/o1/o1.js"
import Tree from "./tree.js"
import TreeViewer from "./tree_viewer.js"
import Nodes from "./nodes.js"

class Parser{
  //Takes in a string, which is a parser definition
  constructor(parserDefinition){
    this.idCounter = 0
    this.matchCount = 0 //enumerates the matches
    this.nameNodes = {}
    this.jumpNodes = []
    let importObject = H1.Import(parserDefinition, this) 
    this.parserRoot = importObject.ultimateRoot
    this.debugInfo = importObject.debugInfo
  }

  parse(input){
    this.reset()
    return this.parserRoot.parse(input)
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
   * parser -> A pointer to the parser object that created the node.
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
    let newNode = new SPG.Nodes.NodeTypes[metadata.type](metadata)
    switch (metadata.type){
      case 'name':
        this.nameNodes[metadata.nodes[0]] = newNode
        break
      case 'jump':
        this.jumpNodes.push(newNode)
    }
    newNode.id = this.getId()
    newNode.parser = this
    return newNode
  }

}

let SPG = {}
SPG.Parser = Parser
SPG.M1 = M1
SPG.H1 = H1
SPG.O1 = O1
SPG.Tree = Tree
SPG.TreeViewer = TreeViewer
SPG.Nodes = Nodes

export {Parser, M1, O1, H1, Tree, TreeViewer, Nodes}
export default SPG
