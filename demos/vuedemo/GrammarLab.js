import CommandBar from './CommandBar.js'
import Tabs from './Tabs.js'
import {TreeViewer} from 'parser'

export default {
  template: `
  <div class='ui-area'>
    <tabs v-on:tab-select='tabSelect'>
      <template v-slot:s1>
        <div>Grammar</div>
      </template>
      <template v-slot:s2>
        <div>Program</div>
      </template>
      <template v-slot:s3>
        <div>Parsed output</div>
      </template>
    </tabs>
    <div class='main-area'>
      <div class='main-area-inside'>
        <div class='wrapper'>
          <div class='wrapper2'>
            <textarea id='grammar' v-if='tab == "grammar"' class='textarea' v-on:change='updateGrammar'>{{grammar}}</textarea>
            <textarea id='program' v-if='tab == "program"' class='textarea' v-on:change='updateProgram'>{{program}}</textarea>
            <div v-if='tab == "output"' class='output' ref='output'><pre><code>{{output}}</code></pre></div>
          </div>
        </div>
      </div>
    </div>
    <div class='bottom-area'>
      <command-bar 
        v-bind:state='tab' 
        v-bind:grammar='grammar' 
        v-bind:program='program' 
        v-on:update-output="updateOutput" 
        v-on:h1-export='h1Export' 
        v-on:m1-export='m1Export'></command-bar>
    </div>
  </div>
    `,
  props: {
    grammar: String,
    program: String,
  },
  data(){
    return{
      tab: 'grammar',
      output: ''
    }
  },
  methods:{
    tabSelect(e){
      if (e == 1){
        this.tab = 'grammar'
      }else if (e == 2){
        this.tab = 'program'
      }else if (e == 3){
        this.tab = 'output'
        this.parse()
      }
    },
    updateGrammar(e){
      this.parser.setGrammar(e.target.value)
    },
    updateProgram(e){
      this.$emit('update-program', e.target.value)
    },
    updateOutput(parsedOutputTree){
      if (this.$refs.output){//the output ref is conditionally rendered in a v-if
        let treeviewer = new TreeViewer(parsedOutputTree, this.$refs.output)
debugger
        this.output = treeviewer.getOutputString(parsedOutputTree)  
      }
    },
    h1Export(){
      this.$emit('h1-export')
    },
    m1Export(){
      this.$emit('m1-export')
    },
    parse(){
      this.parser.setGrammar(this.grammar)
      let parsedOutputTree = this.parser.parse(this.program)
      this.updateOutput(parsedOutputTree)
    },

  },
  components:{
    CommandBar,
    Tabs
  },
  emits: ['update-grammar', 'update-program', 'update-output', 'h1-export', 'm1-export'],
  inject:['parser']
}
