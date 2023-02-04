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
