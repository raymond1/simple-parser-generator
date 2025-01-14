//see demos/calculator/index.js for an example
class H1{
  //Takes in a string s containing line breaks and finds the depth of the first line.
  //Afterwards, the location where the depth becomes less than or equal to the depth of the first line is
  //considered the end of the node that started on the first line of the input string.
  static GetNodeString(s){
    //1)Get depth of first line, which should contain the node name
    let firstNodeDepth = H1.GetDepth(s)

    //2)Go line by line until a lower or equal depth has been reached. That should be the end of the current node
    let lines = s.split('\n')

    let nodeString = lines[0] + '\n'
    for (let i = 1; i < lines.length; i++){
      let line = lines[i]
      let lineDepth = H1.GetDepth(line)
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
  //This function returns the number of child elements of the first node of the string s
  static GetNumberOfChildren(s){
    let lines = s.split('\n')
    let firstNodeDepth = H1.GetDepth(s)
    let numberOfChildren = 0
    for (let i = 1; i < lines.length; i++){
      let line = lines[i]
      let lineDepth = H1.GetDepth(line)
      if (lineDepth <= firstNodeDepth){
        break
      }
      if (lineDepth == firstNodeDepth + 1){
        numberOfChildren++
      }
    }
    return numberOfChildren
  }

  //Given a string s, returns the number of distinct root nodes
  static GetNumberOfRootNodes(s){
    let rootNodes = 0
    let lines = s.split('\n')
    for (let line of lines){
      if (line.length > 0 && line.substring(0,1) !== ' '){
        rootNodes += 1
      }
    }
    return rootNodes
  }


  //Takes in a tree fragment in H1 format, possibly a part of a tree with leading spaces, and returns the children of the node on the first line. The children
  //are returned as strings
  //Assumes input string is the complete node string for a single node
  static GetChildNodeStrings(s){
    let childNodes = []
    let lines = s.split('\n')
    let firstNodeDepth = H1.GetDepth(s)
    let nodeName = H1.GetContent(s)
    
    let nodeTypeNames = ParserGenerator.getNodeTypeNames()
    if (nodeTypeNames.indexOf(nodeName) == -1){
      //error
debugger
      throw new Error('Unknown node type(GetChildNodeStrings): |' + nodeName + '|')
    }


    //For all other nodes, return an array of the child node strings
    let numberOfChildren = 0
    let previousNodeDepth = firstNodeDepth
    for (let i = 1; i < lines.length; i++){
      let currentDepth = H1.GetDepth(lines[i])
      
      //Check if lines are well-formed
      if (currentDepth == previousNodeDepth + 1 || currentDepth <= previousNodeDepth && currentDepth > firstNodeDepth){
        if (currentDepth == firstNodeDepth + 1){
          numberOfChildren++
          childNodes.push(lines[i].slice())
        }else{
          childNodes[numberOfChildren-1] += '\n' + lines[i].slice()
        }
        //Well formed
      } else if (currentDepth > previousNodeDepth + 1){
        throw new Error(`Error: parser definition is invalid due to non-consecutive node depths detected ${i} line(s) from the first.`)
      }
      else{
        break
      }

      previousNodeDepth = currentDepth
    }

    return childNodes
  }

  //Given a string s in H1 format, returns the number of spaces before the first line in s. The number of
  //spaces is called the depth.
  static GetDepth(s){
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
  static GetFirstLineWithDepth(depthArray, firstNodeDepth, startingLine = 1){
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
  static GetContent(s){
    let depth = H1.GetDepth(s)
    let nodeName = Strings.ReadOneLine(s).substring(depth)
    return nodeName
  }

  //Returns n spaces
  static EncodeDepth(n){
    return ' '.repeat(n)
  }
  

  //Assumes input string is well-formed
  //Given a string in H1 format, returns an object that is treelike
  //in form
  //Should returns undefined for a string like the empty string with no nodes

  //Assumes that there is only one root for now
  static Import(s, generator){
    let childNodes = H1.GetChildNodeStrings(s)
    let nodeType = H1.GetContent(s)

    let node
    
    switch(nodeType){
      case 'name':
        if (!childNodes[0]||!childNodes[1]){
          throw new Error('name node should have two children.')
        }
        //name                 line i
        // <identifier>        line i+1
        // <name of target>    line i+2
        node = generator.createNode(
          {
            type:nodeType, 
            nodes: [
              H1.GetContent(childNodes[0]),
              H1.Import(childNodes[1],generator)
            ]
          }
        )
        break
      case 'jump':
        //Jump nodes are incomplete at this stage because they do not have a reference yet to the name nodes and must be reprocessed
        //by the import function in a post-processing operation
      case 'string literal':
      case 'character class':
        let childContent = H1.GetContent(childNodes[0])
        node = generator.createNode({type:nodeType, nodes: [childContent]})
        break
      default:
        //need to get all child nodes of the current node...
        //stuff like and, or, sequence have one or more children that have children
        let childNodesAsObjects = []
        for (let childNode of childNodes){
          childNodesAsObjects.push(H1.Import(childNode,generator))
        }
        node = generator.createNode({type:nodeType, nodes: childNodesAsObjects})
        break
    }
    return node
  }


  //Returns without a trailing carriage return
  //rule list
  // rule
  //  multiple
  //Given the root node of a parsing tree, this transforms it into H1 format
  static Export(node, depth = 0){
    let outputString = H1.EncodeDepth(depth) + node.type + '\n'

    for (let childNode of node.nodes){
      if (typeof childNode == "string"){
        outputString += H1.EncodeDepth(depth + 1) + H1.GetContent(childNode) + '\n'
      }
      else{
        outputString += H1.Export(childNode, depth + 1)
      }
    }

    return outputString  
  }

}