class TreeViewer{
  constructor(tree, parentElement){
    this.tree = tree
    this.parentElement = parentElement
    this.domElement = document.createElement('pre')
    if (parentElement){
      this.parentElement.appendChild(this.domElement)
    }
  }

  getOutputString(metadata){
    if (metadata == null){
      return '(null)\n'
    }

    let starIndent = 0
    if (metadata){
      if (metadata['depth']){
        starIndent = metadata['depth']
      }
    }
    let outputString = '  '.repeat(starIndent) + '*****************************\n'

    if (Array.isArray(metadata)){
      outputString += "(array begin)\n"
    }

    if (typeof metadata == 'undefined'){
      outputString += "(undefined)\n"
    }

    for (let key in metadata){
      let keyValue = metadata[key]
      if (typeof keyValue == 'object' && key !='parent'){
        if (keyValue !== null){
          if (Array.isArray(keyValue)){
            for (let j = 0; j < keyValue.length; j++){
              outputString += this.getOutputString(keyValue[j])
            }
          }else{
            outputString += this.getOutputString(keyValue)
          }
        }
      }else{
        outputString += '  '.repeat(starIndent) + key + ":" + keyValue + '\n'
      }
    }

    if (Array.isArray(metadata)){
      outputString += "(array end)\n"
    }

    return outputString
  }
  
  display(metadata){
    let outputString = ''
    if (typeof metadata == 'undefined'){
      metadata = this.tree.root
    }
    outputString = this.getOutputString(metadata)

    //There are two display modes: to display in the console, or to display in the DOM on the browser
    if (!this.parentElement){
      console.log(outputString)
    }else{
      let outputTextNode = document.createTextNode(outputString)
      this.domElement.appendChild(outputTextNode)
    }
  }
}
