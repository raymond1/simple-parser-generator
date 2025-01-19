//For string functions
function Strings(){}

//Returns true if string consists only of characters from the allowed_characters string
Strings.contains_only = function(string, allowed_characters){
  for (var i = 0; i < string.length; i++){
    if (allowed_characters.indexOf(string.charAt(i)) < 0){
      return false
    }
  }
  return true
}

//Takes a string with one or more lines and returns
//the first line. If the input string has no line breaks, the entire string is returned
Strings.ReadOneLine = function(s){
  let firstNewLineLocation = s.indexOf('\n')
  if (firstNewLineLocation < 0){
    return s
  }else{
    return s.substring(0,firstNewLineLocation)
  }

}