import SpaceTree from "space-tree"

class O1{
  //Takes in a tree of produced match nodes
  //And returns a list of match nodes sorted by serial number
  static GetNodesAsList(matchNode, nodes=[]){
    nodes.push(matchNode) //Add current node

    let considerationSet = matchNode.submatches
    while (considerationSet.length > 0){
      for (let subMatch of considerationSet){
        nodes.push(subMatch) //add all children
      }

      let newConsiderationSet = []

      for (let subMatch of considerationSet){
        if (subMatch.submatches.length > 0){
          for (let childOfChildren of subMatch.submatches){
            newConsiderationSet.push(childOfChildren)
          }
        }
      }
      considerationSet = newConsiderationSet
    }
    return nodes
  }

  //Returns a string similar to
  //operations
  // 1
  // depth
  //  0
  // globalOffset
  //  0
  // id
  //  1
  // inputString
  //  
  // matchFound
  //  true
  // matchString
  //  abc
  // parent
  //  
  // serial
  //  1
  // submatches
  //  2
  //  3
  //  4
  // type
  //  split
  // producer
  //  <id from original grammar>
  static Export(matchNode){
    let nodesAsList = O1.GetNodesAsList(matchNode)
    let sortedNodes = nodesAsList.sort((a,b)=>{
      return a.serial - b.serial
    })

    let outputString = 'operations\n'
    for (let sortedNode of sortedNodes){
      outputString += SpaceTree.EncodeDepth(1) + sortedNode.serial + '\n'
      for (let key of Object.keys(sortedNode)){
        let tempString = ''

        switch (key){
          case 'generator':
            //Do not display the generator property
            continue
          case 'submatches':
            for (let subMatch of sortedNode['submatches']){
              tempString += SpaceTree.EncodeDepth(3) + subMatch.serial + '\n'
            }
            break
          case 'parent':
            {
              let parentNodeId = 0 //no parent
              if (sortedNode['parent']){
                parentNodeId = sortedNode['parent'].serial
              }
              tempString = SpaceTree.EncodeDepth(3) + parentNodeId + '\n'
              break
            }
          default:
            tempString = SpaceTree.EncodeDepth(3) + sortedNode[key] + '\n'
            break
        }
        outputString += SpaceTree.EncodeDepth(2) + key + '\n' + tempString 
      }
    }

    return outputString
  }
}