//M1 is a machine compatible format for converting a string into a parser and a parser into a string.
//It is different from the H1 format in that it is meant primarily to be a serialization format for parsers, not
//a human-friendly way of writing them, even though Space Tree notation allows for it to happen.
class M1{

  static Import(s, generator){
    let parser = M1.importInternal(s,generator)
    ParserGenerator.connectJumpNodesToNameNodes(generator.jumpNodes,generator.nameNodes)
    return parser
  }
  //Given a string definition of a parser, this function converts it into an in-memory parser
  static importInternal(s, generator){
    let childNodes = SpaceTree.GetChildNodeStrings(s)
    let nodeInformation = SpaceTree.GetContent(s).split('-')
    let nodeType = nodeInformation[0]
    let nodeId = nodeInformation[1]

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
              M1.importInternal(childNodes[1],generator)
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

      //The following nodes are variadic
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
        for (let childNode of childNodes){
          childNodesAsObjects.push(M1.importInternal(childNode,generator))
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
    }
    node.id = nodeId
    return node
  }

  //Note: 
  // 1)Jump nodes may cause loops
  // 2)Technically, the string nodes are also nodes, but here, they will not be visited
  static Export(node, depth = 0, nodesVisited = []){
    if (nodesVisited.includes(node)) return ''
    let outputString = SpaceTree.EncodeDepth(depth) + `${node.type}-${node.id}` + '\n'

    nodesVisited.push(node)
    for (let childNode of node.nodes){
      if (typeof childNode == "string"){
        outputString += SpaceTree.EncodeDepth(depth + 1) + SpaceTree.GetContent(childNode) + '\n'
      }
      else{
        switch(node.type){
          case 'jump':
            //Do not process child nodes for jump nodes. Jump targets will be name nodes
            outputString += SpaceTree.EncodeDepth(depth + 1) + childNode.nodes[0] + '\n'
            break
          default:
            outputString += M1.Export(childNode, depth + 1, nodesVisited)
        }

      }
    }

    return outputString  
  }
}