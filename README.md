# Simple Parser Generator

This repository contains code for the Simple Parser Generator(SPG), which is a parser generator that generates parsers that can run on the V1 virtual machine, which is defined in the documentation file V1.md. The SPG is designed to be easily portable to arbitrary programming environments and its small size allows it to be useful for learning and teaching. Also due to its small size, the system is extremely extensible.

In addition to the SPG, this repository also includes information on the H1 and M1 file formats, which can both be used as alternatives to JSON for serialization. H1, in particular, is a very promising human-readable file format that can potentially have many applications due to its minimalistic and nature, concise definition, human readability, well-defined escape sequences and ease of implementation.

# How it works

The Simple Parser Generator takes in a parser specification in the H1 language defined in the file [H1.md](documentation/H1.md). The string content from an H1 file is read into memory, parsed, and converted into a collection of micro-parsers that are put into memory, configured and connected with each other, ready to take in input to produce output tokens.

# Installation

## NodeJS
1. Make a new package.json file.
2. Set the type attribute in the package.json file to module.
3. npm install git+https://github.com/raymond1/simple-parser-generator.git
4. Create a file called index.js and add the following line
```
import Generator from 'simple-parser-generator'
```

## Browsers
1. Set up a web server that can serve HTML and JS pages with the correct Content-Type headers.
2. Create a small website containing an index.html file and put it into the document root or public_html folder or other folder where your web server will be serving it from.
3. Clone the https://github.com/raymond1/simple-parser-generator repository.
4. Copy the file releases/generator.js into the folder that your web server is serving.
5. In your index.html file, add the following just before the end of your body tag:
```
    <script type="importmap">
      {
        "imports": {
          "simple-parser-generator":"./parser.js"
        }
      }
    </script>
    <script type="module">
import Generator from 'simple-parser-generator'
let generator = new Generator()
generator.installCheck()
    </script>
```
6. Testing (Optional)
Access the index.html url to activate the script it references.

If the software was successfully installed, you should see the following message: 'Simple Generator Generator is installed.' This message should show up in Dev Tools or another similar console-enabled debugging browser-based tool.

## Tutorial

Note: this tutorial should point to more documentation about the file formats.

After going through the installation steps above, you will have access to a Generator object. The following short tutorial demonstrates how a parser is generated using the Generator object. 

### 1. Creating the parser generator.
After the import line, the parser generator is instantiated with the line 
```
let generator = new Generator()
```

### 2. Setting the input grammar.

The Generator Generator(PG) object requires a parsing specification, or input grammar in order to differentiate between valid and invalid programs. There are three input languages that can currently be used: H2, H1 and M1.


....





After installation has been complete from the installation steps above, you will see the following line:
```
let generator = new Generator()
```

After this line, you can add JavaScript code
line in the install
Imagine that you have an extremely simple web page set up on a web server. 

Imagine that you have NodeJS and NPM installed on your computer. Create a new folder and call it A. Then, enter into the A directory. Then, copy the file releases/parser.js into that directory. Then, create the file index.js.

In

## API

The API documentation for pubicly available GeneratorGenerator methods is available in the [API documentation](documentation/api/index.html file).
let parser = Generator.setGrammar(s)
parser.parse(s)

# Details on the different file formats

Documentation on the various file formats is available in the documentation folder. 

# Status

The Simple Generator Generator is currently in its second generation and is undergoing testing and bug fixes. 

## Demo programs
 
Demo programs are available in the documentation/demos folder. As long as you can get the demos folder served and the files are served with the correct MIME types, then the demos should work in theory.

The nodejs_installation demos should work on NodeJS.

# Bugs
The damned thing doesn't currently work!
