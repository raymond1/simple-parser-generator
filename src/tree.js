class Tree{
  constructor(treeNode){
    this.root = treeNode
  }

  //returns all nodes in a list
  //Test is a function you can pass in to return only certain nodes
  //If test is passed in and is not null, then if the test function, when it takes matchTree as a parameter evaluates to true, then
  //matchTree will be returned as part of the result set
  returnAllNodes(treeNode, test = null){

		//The default test always returns true, in effect returning all nodes
		if (test == null){
			test = function(){
				return true
			}
		}

		let nodesToReturn = []
		if (test(treeNode)){
			nodesToReturn.push(treeNode)
		}

		for (let match of treeNode.matches){
			let childNodes = this.returnAllNodes(match, test)
			nodesToReturn = nodesToReturn.concat(childNodes)
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

			//For each match in the current node, if there is a parent, then the parent must add the matches to its matches list
			//All the children must set their parent to the parent of matchTreeNode
			for (let match of matchTreeNode.matches){
				if (matchTreeNode.parent){
					matchTreeNode.parent.matches.push(match)
					match.parent = matchTreeNode.parent
				}
			}

			//If matchTreeNode node has a parent that is not null, then the current node must be removed from its matches list
      if (matchTreeNode.parent){
				for (let i = 0; i < matchTreeNode.parent.matches.length; i++){
					//remove the item
					if (matchTreeNode.parent.matches[i] === matchTreeNode){
						matchTreeNode.parent.matches.splice(i,1)
						break
					}
				}
			}else{
				//If matchTreeNode.parent is null, then
        //matchTreeNode = df
        this.root = matchTreeNode.matches[0]
			}

		}else{
			//item was not found
			//check if children need to be removed
			//All the children must set their parent to the parent of matchTreeNode
			for (let match of matchTreeNode.matches){
				this.removeItemAndHeal(itemToRemove,match)
			}
		}
	}

	//test is a function that sets which nodes to ignore. When test evaluates to true, a node will be ignored from the tree.
	//This function is meant to get rid of certain nodes
	//This function returns a new tree with the same nodes as the old tree, except that nodes that match the test function are deleted
	//Remaining nodes are healed back together
	pruneNodes(test){
		let nodesToPrune = this.returnAllNodes(this.root, test)
		for (let node of nodesToPrune){
			this.removeItemAndHeal(node, this.root)
		}
	}

  //returns a tree consisting only of the rules matched in the user-specified grammar
	//matches are guaranteed to be contiguous
  getRuleMatchesOnly(){
    let clonedTree = this.clone()

    let ruleNodes = clonedTree.returnAllNodes(clonedTree.root, (_matchTreeNode)=>{return _matchTreeNode.matchFound&&_matchTreeNode.type == 'rule'})
    let notRuleNodes = clonedTree.treeInvert(ruleNodes)
    for (let ruleToRemove of notRuleNodes){
      clonedTree.removeItemAndHeal(ruleToRemove)
    }

    let returnValue = new Tree(clonedTree.root)
    returnValue.resetDepth(returnValue.root, 0)
    return returnValue
  }
  
  resetDepth(treeNode,depth){
    if(!treeNode){
      //In case treeNode is null or undefined
      return
    }
    treeNode.depth = depth
    for (let match of treeNode.matches){
      this.resetDepth(match, depth + 1)
    }
  }

	//Given a set of nodes in a list, this function returns all elements in domain which are not in the list of nodes passed in
	treeInvert(selectedNodeList, matchTreeNode = this.root){
		let test = this.returnAllNodes(matchTreeNode, (_matchTreeNode)=>{
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
    newTreeNode.matches = []
    if (matchTreeNode.matches){
      for (let match of matchTreeNode.matches){
        let matchClone = this.innerClone(match)
        newTreeNode.matches.push(matchClone)
        matchClone.parent = newTreeNode
      }
    }

		return newTreeNode
	}

	//copies all attributes one node, except for matches
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
/*
	//performs a shallow operation on all nodes that match selectionTest and are not null
	recursiveApply(matchNode = this.root, operation, selectionTest){
		if (matchNode){
			if (selectionTest(matchNode)){
				operation(matchNode)
			}

			for (let match of matchNode.matches){
				this.recursiveApply(match,operation,selectionTest)
			}
		}
  }
  */
}

