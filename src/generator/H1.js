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
        throw new Error('Unknown node type: ' + nodeName)
      }
  
      if (['string literal','character class'].indexOf(nodeName) > -1){
        //Take the next line
        childNodes.push(lines[1].substring(firstNodeDepth+1))
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
  
          let newChild = false
          if (lineDepth == firstNodeDepth + 1){
            numberOfChildren++
            childNodes.push('')
            newChild = true
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
    static H1ConvertToM1(s){
      //Valid H1 format means the first line is the name of a node type
      let nodeString = H1.H1GetNodeString(s)
      if (nodeString == ''){
        throw new Error('String passed in for H1 to M1 conversion is not in H1 format.')
      }
      let childNuggets = H1.H1GetChildNuggets(nodeString)
  
      //Get the node name
      let nodeName = H1.H1GetNodeName(s)
      let childrenString = ''
  
      if (nodeName == 'rule'){
        let depth = H1.H1GetDepth(s)
        childrenString += childNuggets[0].substring(depth + 1) + ','
        childrenString += H1.H1ConvertToM1(childNuggets[1])
      }else if (nodeName == 'character class' || nodeName == 'string literal'){
        let depth = H1.H1GetDepth(s)
        let lines = s.split('\n')
        childrenString += lines[1].substring(depth + 1)
      }
      else{
        for (let i = 0; i < childNuggets.length; i++){
          if (i > 0){
            childrenString += ','
          }
          childrenString += H1.H1ConvertToM1(childNuggets[i])
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
    static H1Import(s, parser){
      let M1Code = H1.H1ConvertToM1(s)
      M1.M1Import(M1Code, parser)
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
            childrenString += H1.H1Export(node.pattern, depth + 1)
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
            childrenString += H1.H1Export(node.pattern, depth + 1)
          }
          break
        case 'character class':
        case 'string literal':
        case 'rule name':
          {
            childrenString += H1.H1EncodeDepth(depth + 1) + node.string
          }
          break
        default:
          break
      }
      outputString += childrenString
      return outputString  
    }
  
}