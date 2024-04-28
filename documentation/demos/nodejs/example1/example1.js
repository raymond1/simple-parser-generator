## Tutorial

After going through the installation steps above, you will have access to a Generator object. The following tutorial sample program is a minimalistic JavaScript stub program that explains from a software development point of view how to generate a parser using the SPG on the NodeJS platform. Details on the conceptual model will be explained after describing the software workflow.

### Tutorial Sample Program
This sample program demonstrates the software workflow for making a simple parser and parsing an input string.
```
/* 1. Import the 'Generator' class used to convert a parser specification into an in-memory object capable of parsing.*/
import {Generator} from 'simple-parser-generator' 

/* 2. Instantiate a new Generator object. */
let generator = new Generator()

/* 3. Specify the specification for a parser. This is done using the H1 programming language, which is documented
in the file H1.md.*/
let specification = 
`string literal
 world`

/* 4. Generate a parser object by passing in the specification to the generator. This is done using the
generate parser method. */
let parser = generator.generateParser(specification)

/* 5. Create an input string to be fed into your parser. Conceptually, if your parser specification is for the 
CSV file format, then your input string would be a sample CSV file. If your parser specification describes what a valid
PDF file should be like, then your input string would be a possible PDF file. Here, the input string is 'world' because
the parser specification is simply to detect if a string starts with the text 'world'.*/
let inputString = 'world'

/* 6. Parse the input string and save the output in a variable(here, it is called 'output'). The 'parse' function is used to
start parsing the input. It will generate a stream of data tokens which can then be
interpreted to determine various attributes and features of the input string. The features that will be extracted will
depend on the specification initially passed into the generator in step 4.*/
let output = parser.parse(inputString)

/* 7. At this point, the output variable will contain some information. The exact format of this information is described in more detail later on, but it is basically an array of informational objects that can be inspected using a debugger. */
```
