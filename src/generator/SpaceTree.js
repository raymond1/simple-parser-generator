class SpaceTree{
    //Takes in a string s containing line breaks and finds the depth of the first line.
  //Afterwards, the location where the depth becomes less than or equal to the depth of the first line is
  //considered the end of the node that started on the first line of the input string.
  static GetEntireNodeString(s){
    //1)Get depth of first line, which should contain the node name
    let firstNodeDepth = SpaceTree.GetDepth(s)

    //2)Go line by line until a lower or equal depth has been reached. That should be the end of the current node
    let lines = s.split('\n')

    let nodeString = lines[0] + '\n'
    for (let i = 1; i < lines.length; i++){
      let line = lines[i]
      let lineDepth = SpaceTree.GetDepth(line)
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


  //s: a string in SpaceTree format, starting with a node string
  //This function returns the number of child elements of the first node of the string s
  static GetNumberOfChildren(s){
    let lines = s.split('\n')
    let firstNodeDepth = SpaceTree.GetDepth(s)
    let numberOfChildren = 0
    for (let i = 1; i < lines.length; i++){
      let line = lines[i]
      let lineDepth = SpaceTree.GetDepth(line)
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


  //Takes in a tree fragment in SpaceTree format, possibly a part of a tree with leading spaces, and returns the children of the node on the first line. The children
  //are returned as strings
  //Assumes input string is the complete node string for a single node
  static GetChildNodeStrings(s){
    let childNodes = []
    let lines = s.split('\n')
    let firstNodeDepth = SpaceTree.GetDepth(s)

    //For all other nodes, return an array of the child node strings
    let numberOfChildren = 0
    let previousNodeDepth = firstNodeDepth
    for (let i = 1; i < lines.length; i++){
      let currentDepth = SpaceTree.GetDepth(lines[i])
      
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

  //Given a string s in SpaceTree format, returns the number of spaces before the first line in s. The number of
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

  //Obtains the content of the nodes with depth 0
  static GetRootLevelNodesContent(s){
    let lines = s.split('\n')
    let returnLines = []
    for (let i = 0; i < lines.length; i++){
      let line = lines[i]
      if (SpaceTree.GetDepth(line) == 0){
        returnLines.push(line)
      }
    }
    return returnLines
  }

  //Returns all nodes of depth 0
  //Assumes s is well-formed
  static GetEntireRootNodeStrings(s){
    let lines = s.split('\n')
    let returnLineNumbers = []
    let returnLines = []
    for (let i = 0; i < lines.length; i++){
      let line = lines[i]
      if (SpaceTree.GetDepth(line) == 0){
        returnLineNumbers.push(i)
      }
    }
    returnLineNumbers.push(lines.length)

    for (let i = 0; i < returnLineNumbers.length-1; i++){
      let accumulatorString = []
      for (let j = returnLineNumbers[i]; j < returnLineNumbers[i+1]; j++){
        accumulatorString.push(lines[j])
      }
      let tempString = accumulatorString.join('\n')
      returnLines.push(tempString)
    }
    return returnLines
  }

  //Takes in a node string s and returns the first line, which is returned without the carriage return and leading spaces
  static GetContent(s){
    let depth = SpaceTree.GetDepth(s)
    let nodeName = Strings.ReadOneLine(s).substring(depth)
    return nodeName
  }

  //Returns n spaces
  static EncodeDepth(n){
    return ' '.repeat(n)
  }
}