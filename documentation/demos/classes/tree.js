import Utilities from "./utilities.js"

class Tree{
  constructor(treeNode){
    this.root = treeNode
  }

  //returns all nodes in a list
  //Test is a function you can pass in to return only certain nodes
  //If test is passed in and is not null, then if the test function, when it takes matchTree as a parameter evaluates to true, then
  //matchTree will be returned as part of the result set
  static returnFilteredNodeList(treeNode, test = null, matchesSoFar = []){
		if (!treeNode){
			return null
		}
		//The default test always returns true, in effect returning all nodes
		if (!test){
			test = function(){
				return true
			}
		}

		let nodesToReturn = []

		if (test(treeNode) && matchesSoFar.indexOf(treeNode) == -1){
			nodesToReturn.push(treeNode)
		}

		for (let match of treeNode.submatches){
			let childNodes = Tree.returnFilteredNodeList(match, test, nodesToReturn)
			nodesToReturn = Utilities.array_merge(nodesToReturn, childNodes)
		}
		return nodesToReturn
	}

	//Removes a node from a tree and rejoins it
  //          root
	//           |
	//           A
	//          / \
  //          B C
	//         /| |\
	//        / | | \
	//       D  E F  G
	//       |
  //       H
	//       |
	//       I
	//
	//I assume the root cannot be removed. All other nodes can be removed
	//If A is removed, then B and C will be children of the root.
	//If C is removed, then F and G become children of A
	//If D is removed, then H and I become children of B
	//If E is removed, no additional healing of the tree will take place
	removeItemAndHeal(itemToRemove, matchTreeNode = this.root){
		if (itemToRemove == null){
			throw "Cannot remove null from a tree."
		}
		if (matchTreeNode == null){
			throw "Cannot remove an item from an empty tree."
		}

		if (matchTreeNode === itemToRemove){
      if (matchTreeNode.parent){ //read as 'if matchTreeNode is not the root of the entire tree'

				//Set child matches as the children of the parent
        for (let match of matchTreeNode.submatches){
					matchTreeNode.parent.submatches.push(match)
					match.parent = matchTreeNode.parent
			  }

        for (let i = 0; i < matchTreeNode.parent.submatches.length; i++){
					//remove the item
					if (matchTreeNode.parent.submatches[i] === matchTreeNode){
						matchTreeNode.parent.submatches.splice(i,1)
						break
					}
				}
      }else{
				//Here, matchTreeNode is the root of the entire tree as it has no parent
        if (matchTreeNode.submatches.length > 1){

          throw new Error('Operation does not result in a tree')
          // //Create a new root node if the match tree node has two or more children
          // this.root = new MatchNode()
          // this.root.parent = null
          // this.root.submatches = matchTreeNode.submatches
        }else if (matchTreeNode.submatches.length == 1){
          this.root = matchTreeNode.submatches[0]
					matchTreeNode.parent = null
					matchTreeNode.submatches = []
					this.root.parent = null
        }else{ //0 submatches. Remove root only
          this.root = null
        }
      }
		}else{
			//item was not found
			//check if children need to be removed
			//All the children must set their parent to the parent of matchTreeNode
			for (let match of matchTreeNode.submatches){
				this.removeItemAndHeal(itemToRemove,match)
			}
		}
	}

  //Incomplete
  //Takes in a tree and a filter function and returns a new tree that is
  //the same as the old tree, except that nodes identified by the filter function have been removed.
  //If the root node with two or more children is removed, the result is more than one tree, so this 
  //function will return an array of trees.
  //The element passed in is a Tree object, not a treeNode.
  static ReturnPrunedTrees(tree, filter){
    let treeArray = []
    let newTree = tree.clone()
    return treeArray
  }


	//test is a function that sets which nodes to ignore. When test evaluates to true, a node will be ignored from the tree.
	//This function is meant to get rid of certain nodes
	//This function returns a new tree with the same nodes as the old tree, except that nodes that match the test function are deleted
	//Remaining nodes are healed back together
	pruneNodes(test){
		let nodesToPrune = Tree.returnFilteredNodeList(this.root, test).sort((a,b)=>{
      a.depth - b.depth
    }).reverse()

    for (let i = 0; i < nodesToPrune.length; i++){
      let nodeToPrune = nodesToPrune[i]
			this.removeItemAndHeal(nodeToPrune, this.root)
		}
	}

	//removes branches of the tree that match test
	static _cutNodes(treeNode, test){
		let nodesToCut = []
		for (let i = 0; i < treeNode.submatches.length; i++){
			let childNode = treeNode.submatches[i]
			if (test(childNode)){
				nodesToCut.push(childNode)
			}
		}

		for (let i = 0; i < nodesToCut.length; i++){
			let index = treeNode.submatches.indexOf(nodesToCut[i])
			treeNode.submatches.splice(index, 1)
		}

		for (let i = 0; i < treeNode.submatches.length; i++){
			Tree._cutNodes(treeNode.submatches[i], test)
		}
	}

	//Removes items but does not heal a tree
	cutNodes(test){
		if (test(this.root)){
			this.root = null
			return
		}

		if (this.root){
			Tree._cutNodes(this.root, test)
		}else{
			return
		}
	}

	//Checks if the node and all ancestors have matchFound attribute set to true
	static isSuccessfullyDescendedFromRoot(treeNode){
		if (treeNode.parent == null){
			//If root node
			if (treeNode['matchFound']){
				return true
			}else{
				return false
			}
		}
		else{
			//Not root node
			if (treeNode['matchFound'] == false){
				return false
			}else{
				return Tree.isSuccessfullyDescendedFromRoot(treeNode.parent)
			}	
		}
	}

  //returns a tree consisting only of the name nodes matched in the user-specified grammar
	//matches are guaranteed to be contiguous
	//Only matches that are from an uninterrupted line of successful matches are returned
  getNameNodeMatchesOnly(){
		let clonedTree = this.clone()
		clonedTree.cutNodes((treeNode)=>{ return treeNode['matchFound'] == false})
		let successfulNameNodes = null
		if (clonedTree.root){
			successfulNameNodes = Tree.returnFilteredNodeList(clonedTree.root, 
				(_matchTreeNode)=>{
					return _matchTreeNode.type == 'name'
				})	
		}

    let notSuccessfulNameNodes = clonedTree.treeInvert(successfulNameNodes)
		if (notSuccessfulNameNodes){
			for (let nameNodeToRemove of notSuccessfulNameNodes){
				clonedTree.removeItemAndHeal(nameNodeToRemove)
			}	
		}

    let returnValue = new Tree(clonedTree.root)
    returnValue.resetDepth(returnValue.root, 0)
    return returnValue
  }
  
  //After pruning, trees may have node whose depth values are out of sync with the parent-child relationships.
  //This function corrects the depth values
  resetDepth(treeNode,depth){
    if(!treeNode){
      //In case treeNode is null or undefined
      return
    }
    treeNode.depth = depth
    for (let match of treeNode.submatches){
      this.resetDepth(match, depth + 1)
    }
  }

	//Given a set of nodes in a list, this function returns all elements in domain which are not in the list of nodes passed in
	treeInvert(selectedNodeList, matchTreeNode = this.root){
		if (!selectedNodeList){
			return Tree.returnFilteredNodeList(matchTreeNode)
		}

		let test = Tree.returnFilteredNodeList(matchTreeNode, (_matchTreeNode)=>{
			let booleanValue = selectedNodeList.includes(_matchTreeNode)
			return !booleanValue
		})
		return test
  }
  
  //Returns a tree which is a copy of the passed in tree
  clone(){
    let treeNodesCopy = this.innerClone(this.root)
    let newTree = new Tree(treeNodesCopy)
    return newTree
  }

  //clones scalar attributes(not arrays)
  //updates the parent element to refer to the clone tree rather than the parent tree
	innerClone(matchTreeNode){
		let newTreeNode = this.shallowCopy(matchTreeNode)
    newTreeNode.submatches = []
    if (matchTreeNode.submatches){
      for (let match of matchTreeNode.submatches){
        let matchClone = this.innerClone(match)
        newTreeNode.submatches.push(matchClone)
        matchClone.parent = newTreeNode
      }
    }

		return newTreeNode
	}

	//copies all attributes on node, but does not copy matches
	shallowCopy(treeNode){
		if (treeNode == null){
			return null
		}

		let newNode = {}
		for (let attribute in treeNode){
			if (!Array.isArray(treeNode[attribute])){
				newNode[attribute]=treeNode[attribute]
			}
    }

		return newNode
  }

	//performs a shallow operation on all nodes that match selectionTest and are not null
	recursiveApply(matchNode = this.root, operation, selectionTest){
		if (matchNode){
			if (selectionTest(matchNode)){
				operation(matchNode)
			}

			for (let match of matchNode.submatches){
				this.recursiveApply(match,operation,selectionTest)
			}
		}
  }

	//Returns number of nodes in the tree
	size(matchNode = this.root, total = 0){
		if (matchNode){
			for (let match of matchNode.submatches){
				total += this.size(match)
			}
			return total + 1
		}else{
      return 0
    }
	}


	//Takes in a tree and a filter
	//Clones the tree and returns a new one containing only the filtered nodes.
	//Assumes that root node will not be filtered out
	returnFilteredTree(filter){
		let newTree = this.clone()
		let listOfFilteredInNodes = Tree.returnFilteredNodeList(newTree.root, filter)
		let listOfFilteredOutNodes = newTree.treeInvert(listOfFilteredInNodes)

		newTree.pruneNodes((node)=>{
      let includes = listOfFilteredOutNodes.includes(node)
			return includes
	  })
		return newTree
	}
}

export default Tree

