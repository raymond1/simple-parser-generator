# Space Tree: the line-based object notation

Space Tree notation is a line-based string format that can represent trees of information using spaces and lines. Hierarchical information representing objects can be converted into ST notation, and ST strings can be converted back into objects.

This file explains the details of what ST notation is.

# Space Tree syntax

Here is an example Space Tree string:

Example 1:
"Cat
 legs
  4
 whiskers
  many
 tails
  1
 name
  Mouse"

A valid Space Tree string consists of one or more lines. Each line represents a single node in a mathematical tree. To understand the structure of the tree and its information, it is necessary to explain some of the syntax and terminology of ST notation.

Lines are delineated from each other with the newline character. Each line, in turn consists of two parts. Part 1 consists of 0 or more leading spaces which are used to represent hierarchical information. Part 2 consists of 0 or more characters of textual information. Newlines and spaces are escaped as detailed in the section on escape sequences section. The newline character is not considered part of a line and is thought of as something that separates them only.

In example 1, the lines are: "Cat", " legs", "  4", " whiskers", "  many", " tails", " 1", " name", and "  Mouse".

The number of leading spaces on each line is referred to as the "depth" of the line. The textual information on each line is referred to as the node text. Because each line represents a node in a mathematical tree, a node can also be said to have a depth or node text.

In example 1, the depths and node text of the lines are as follows:

Text of Entire Line | Depth | Node Text
---------------------------------------
"Cat"               | 0     | "Cat"
" legs"             | 1     | "legs"
"  4"               | 2     | "4"
" whiskers"         | 1     | "whiskers"
"  many"            | 2     | "many"
" tails"            | 1     | "tails
"  1"               | 2     | "1"
" name"             | 1     | "name"
"  Mouse"           | 2     | "Mouse"

Together, the depth and the node text represent nodes in a mathematical tree.

## Hierarchical information in Space Tree notation
The depth of a line is not arbitrary and must follow certain rules.

Rule 1) Root nodes have a depth of 0. All nodes must either be a root node or be children of root nodes.
Rule 2) To indicate that a node is a child of another node, the child node must be placed after the parent node and have a depth of exactly one greater than the parent node. In addition, in between the parent node and the child node, there must not be any node with a depth equal to or less than the depth of the parent node.

Thus, the node represented by the line "Cat" is a root node. The nodes with node text "legs", "whiskers", "tails" and "name" are the children of the root node "Cat".

## Escape Sequences
Because spaces and newline characters have a special meaning in Space Tree notation, they need to be escaped if used as part of the node text. Spaces become "\ ". The newline character becomes "\n".