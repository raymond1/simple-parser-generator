//H1 is the class that deals with conversions to and from the H1 file format
//which is the human-readable file format that can be imported into memory.

class H1{
  //Gets rid of completely empty lines(not even spaces)
  //Gets rid of comment lines starting with //
  static Process(s){
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
  
  /*`

  integer
   entire
    or
     positive number
     string literal
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
    //Extract line numbers for the debugger
    let originalLines = s.split('\n')
    
    //Internally, line numbers start from 0.
    let mapOriginalLineNumbersToLines = {}
    for (let i = 0; i < originalLines.length; i++){
      mapOriginalLineNumbersToLines[i] = originalLines[i]
    }

    //Get rid of empty lines and comments
    let s2 = H1.Process(s)

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

    //Will also need to map nodes to processed lines
    let mapNodeIdsToProcessedLines = {}

    //Find all lines of depth 0
    let rootNodeStrings = SpaceTree.GetEntireRootNodeStrings(s2)
    let rootNodeLineNumberOffsets = []
    let accumulator = 0
    for (let i = 0; i < rootNodeStrings.length; i++){
      rootNodeLineNumberOffsets.push(accumulator)
      accumulator = accumulator + rootNodeStrings[i].split('\n').length
    }

    //Extract the node names at depth 0. Store the key inside the generator object
    for (let i = 0; i < rootNodeStrings.length; i++){
      let rootNodeName = SpaceTree.GetContent(rootNodeStrings[i])
      generator.nameNodes[rootNodeName] = null
    }

    let rootNodes = []
    //All root level strings become name nodes
    for (let i = 0; i < rootNodeStrings.length; i++){
      let rootNodeString = rootNodeStrings[i]
      let customNodeName = SpaceTree.GetContent(rootNodeString)
      let childNode = H1.importInternal(SpaceTree.GetChildNodeStrings(rootNodeString)[0], generator, rootNodeLineNumberOffsets[i]+1, mapNodeIdsToProcessedLines)

      let nameNode = generator.createNode({type:'name', nodes:[customNodeName, childNode]})
      mapNodeIdsToProcessedLines[nameNode.id] = rootNodeLineNumberOffsets[i]

      rootNodes.push(nameNode)
    }

    let ultimateRoot = generator.createNode({type:'split', nodes: rootNodes})
    mapNodeIdsToProcessedLines[ultimateRoot.id] = -1

    let mapNodeIdsToOriginalLineNumbers = {}

    for (let id of Object.keys(mapNodeIdsToProcessedLines)){
      mapNodeIdsToOriginalLineNumbers[id] = mapProcessedLineNumbersToOriginalLineNumbers[mapNodeIdsToProcessedLines[id]]
    }

    ParserGenerator.connectJumpNodesToNameNodes(generator.jumpNodes,generator.nameNodes)
    return {ultimateRoot, mapNodeIdsToOriginalLineNumbers}
  }

  //Assumes input string is well-formed
  //Given a string in H1 format, returns an object that is treelike
  //in form filled with nodes that parse things.
  //Should return undefined for a string like the empty string with no nodes

  //Assumes that there is only one root for now
  static importInternal(s, generator, lineNumberOffset, mapNodeIdsToProcessedLines){
    let childNodes = SpaceTree.GetChildNodeStrings(s)
    let nodeType = SpaceTree.GetContent(s)

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
              SpaceTree.GetContent(childNodes[0]),
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
        childContent = SpaceTree.GetContent(childNodes[0])
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
}