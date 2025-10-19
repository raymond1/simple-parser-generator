import SpaceTree from "space-tree"

//H1 is the class that deals with conversions to and from the H1 file format
//which is the human-readable file format that can be imported into memory.

class H1{
  //Mathematical model:
  //Lines are numbered from 0
  //Following a newline character, a new line begins and the newline counter is incremented.
  //Empty lines count as a line.
  //Lines are separated by newline characters.
  //Regions can be either a comment, a newline character, an empty line

  //Slots are the spaces between characters and are numbered starting from the left from 0.
  static GetTextAndNewlineRegions(s){
    let regions = []

    let regionStart = 0

    let lineBreaks = H1.GetLineBreaks(s) //Get all line break indices

    for (let i = 0; i < lineBreaks.length; i++){
      let textRegion = {start:regionStart, end:lineBreaks[i], type: 'text'}
      regions.push(textRegion)

      let newlineRegion = {start:lineBreaks[i], end:lineBreaks[i] + 1, type: 'newline'}
      regions.push(newlineRegion)
      regionStart = lineBreaks[i] + 1
    }
    let endRegion = {start: regionStart, end: s.length, type: 'text'}
    regions.push(endRegion)

    return regions
  }

  //Marks regions as comments if they begin with '//'
  //Marks regions as empties if they have a length of 0
  static MarkCommentsAndEmpties(s, regions){
    for (let i = 0; i < regions.length; i++){
      if (regions[i].type == 'text'){
        if (s.substring(regions[i].start, regions[i].end).substring(0,2) == '//'){
          regions[i].type = 'comment'
        }

        if (regions[i].start == regions[i].end){
          regions[i].type = 'empty'
        }
      }
    }
  }

  static GetLineBreaks(s){
    let lineBreaks = []
    let caret
    for (caret = 0; caret < s.length; caret++){
      if (s[caret] == '\n'){
        lineBreaks.push(caret)
      }
    }
    return lineBreaks
  }

  //Given a set of regions, changes comment regions into empty regions
  static MarkCommentsAsEmpties(regions){
    for (let region of regions){
      if (region.type == 'comment'){
        region.type = 'empty'
      }
    }
  }

  //Given an array of regions, returns a new set. If two or more newline regions are continuous within the array,
  //only one of them will be kept, and the rest will be marked for deletion.
  static SquashConsecutiveNewlines(regions){
    let newNewlineSequence = true
    for (let i = 0; i < regions.length; i++){
      if (regions[i].type == 'newline'){
        if (newNewlineSequence){
          newNewlineSequence = false
        }else{
          regions[i].type = 'delete'
        }
      }else{ //Not a newline region. Text region expected
        newNewlineSequence = true //reset the flag
      }
    }

    let newRegions = regions.filter((region)=>{return region.type != 'delete'})
    return structuredClone(newRegions)
  }

  //If the first or last regions are of the newline type, delete the newlines
  static DeleteDanglingNewlines(regions){
    if (regions[0].type == 'newline'){
      regions = regions.slice(1)
    }

    if(regions[regions.length - 1].type == 'newline'){
      regions = regions.slice(0,-1)
    }

    return structuredClone(regions)
  }

  //Returns a string made up of various regions(start and end pairs)
  static Reconstruct(s, regions){
    let returnString = ''
    for (let i = 0; i < regions.length; i++){
      returnString += s.substring(regions[i].start, regions[i].end)
    }
    return returnString
  }

  //Given an original string s, returns a new string, newString, with empty lines and comments removed.
  //Also returns debugging information, indicating where in the original string s the output string got its information from
  static StripEmptyInformation(s){

    let regions = H1.GetTextAndNewlineRegions(s)

    H1.MarkCommentsAndEmpties(s,regions)
    H1.MarkCommentsAsEmpties(regions) 
    regions = structuredClone(regions).filter((region)=>{return region.type !='empty'})
    regions = H1.SquashConsecutiveNewlines(regions)
    regions = H1.DeleteDanglingNewlines(regions)

    let newString = H1.Reconstruct(s, regions)
    return {newString, originalRegions: regions}
  }



// '0123456789\nasdfasdf\nadfasdf\n'
//'\nsdfadsfasf\n\n'

//Line locations: 0-9,10-...
//Line locations: Beginning,0- 
/*
    let outputStringArray = []
    let lines = s.split('\n')
    for (let line of lines){
      if (line == ''){
        continue
      }

      if (line.substring(0,2) == '//'){
        continue
      }

      outputStringArray.push(line)
    }

    return outputStringArray.join('\n')
  }
*/

  /*`

integer
 entire
  or
   positive number
   string literalß
    0
   negative number

//comment
positive number
 number

number
 and
  multiple
   character class
    0123456789
  not
   string literal
    0

negative number
 sequence
  string literal
   -
  positive number
`*/
  static Import(s, generator){
    let rootNodes = [] //Array of Node objects
    let originalLines = s.split('\n')
    
    //Get rid of empty lines and comments
    let {s2, debugInfo} = H1.StripEmptyInformation(s)

    //Map processed lines to original line numbers
    let processedLines = s2.split('\n')
    let mapProcessedLineNumbersToOriginalLineNumbers = {}

    let j = 0 //counter for originalLines
    for (let i = 0; i < processedLines.length; i++){
      while (processedLines[i] != originalLines[j]){
        j++
      }
      mapProcessedLineNumbersToOriginalLineNumbers[i] = j
    }
    
    //Will also need to map nodes to processed lines. In other words, each node has an id and the association between the
    //node id and the processed
    let mapNodeIdsToProcessedLines = {}

    //Get all nodes of depth 0
    let rootNodeLineNumbers = []

    //Find all line numbers of all lines with depth 0, the 'root' nodes from an H1 specification
    let filter = `depth
 =
  0
return
 node`
    let rootNodeStrings = SpaceTree.Filter(s2, filter) //Array of node strings

    let accumulator = 0
    for (let i = 0; i < rootNodeStrings.length; i++){
      rootNodeLineNumbers.push(accumulator)
      accumulator = accumulator + rootNodeStrings[i].split('\n').length
    }

    //Extract the node names at depth 0. Store the key inside the generator object
    for (let i = 0; i < rootNodeStrings.length; i++){
      let rootNodeName = SpaceTree.GetText(rootNodeStrings[i])
      generator.nameNodes[rootNodeName] = null
    }

    //All root level strings become name nodes
    for (let i = 0; i < rootNodeStrings.length; i++){
      let rootNodeString = rootNodeStrings[i]
      let customNodeName = SpaceTree.GetText(rootNodeString)
      let childNode = H1.importInternal(SpaceTree.GetChildren(rootNodeString)[0], generator, rootNodeLineNumbers[i]+1, mapNodeIdsToProcessedLines)

      let nameNode = generator.createNode({type:'name', nodes:[customNodeName, childNode]})
      mapNodeIdsToProcessedLines[nameNode.id] = rootNodeLineNumbers[i]

      rootNodes.push(nameNode)
    }

    let ultimateRoot = generator.createNode({type:'split', nodes: rootNodes})
    mapNodeIdsToProcessedLines[ultimateRoot.id] = -1

    let mapNodeIdsToOriginalLineNumbers = {}

    for (let id of Object.keys(mapNodeIdsToProcessedLines)){
      mapNodeIdsToOriginalLineNumbers[id] = mapProcessedLineNumbersToOriginalLineNumbers[mapNodeIdsToProcessedLines[id]]
    }

    this.connectJumpNodesToNameNodes(generator.jumpNodes,generator.nameNodes)
    return {ultimateRoot, mapNodeIdsToOriginalLineNumbers}
  }

  //Assumes input string is well-formed
  //Given a string in H1 format, returns an object that is treelike
  //in form filled with nodes that parse things.
  //Should return undefined for a string like the empty string with no nodes

  //Assumes that there is only one root for now
  static importInternal(s, generator, lineNumberOffset, mapNodeIdsToProcessedLines){
    let childNodes = SpaceTree.GetChildren(s)
    let nodeType = SpaceTree.GetText(s)

    let node
    let childContent
    if (!nodeType){
      throw new Error('Invalid node. A node appears to be empty. Perhaps you have a line containing only spaces?')
    }

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
            type:'name', 
            nodes: [
              SpaceTree.GetText(childNodes[0]),
              H1.importInternal(childNodes[1],generator, lineNumberOffset + 2, mapNodeIdsToProcessedLines)
            ]
          }
        )
        break
      case 'jump':
        //Jump nodes are incomplete at this stage because they do not have a reference yet to the name nodes and must be reprocessed
        //by the importInternal function in a post-processing operation
      case 'string literal':
      case 'character class':
        childContent = SpaceTree.GetText(childNodes[0])
        node = generator.createNode({type:nodeType, nodes: [childContent]})
        break
      case 'sequence':
      case 'or':
      case 'and':
      case 'multiple':
      case 'not':
      case 'optional':
      case 'entire':
      case 'split':
        //need to get all child nodes of the current node...
        //stuff like and, or, sequence have one or more children that have children
        let childNodesAsObjects = []
        let i = 1
        for (let childNode of childNodes){
          childNodesAsObjects.push(H1.importInternal(childNode,generator, lineNumberOffset + i, mapNodeIdsToProcessedLines))
          i = i + 1
        }
        node = generator.createNode({type:nodeType, nodes: childNodesAsObjects})
        break
      default:
        //Treat as an implicit jump 
        //Here, nodeType should be a custom nodeType

        if (nodeType in generator.nameNodes){
          node = generator.createNode({type:'jump', nodes: [nodeType]})
          break
        }
        throw new Error(`Jump target of |${nodeType}| does does not correspond to any known name node. Known name nodes include: ${Object.keys(generator.nameNodes).join(',')}`)
        break
    }

    mapNodeIdsToProcessedLines[node.id] = lineNumberOffset
    return node
  }

  /***
   * This function takes in an array of jump nodes and a map going from jump nodes to name nodes, and uses this information
   * to connect the jump node to the name node that it is jumping to. A connection is formed when the first
   * node child of a jump node is set to the value of a name node object.
   * 
   * During parsing, a jump node succeeds if its name node target succeeds.
   */
  static connectJumpNodesToNameNodes(jumpNodes, nameNodesMap){
    for (let jumpNode of jumpNodes){
      let tempNode = nameNodesMap[jumpNode.nodes[0]]
      jumpNode.nodes[0] = tempNode
    }
  }
}

export default H1