import CommandBar from './CommandBar.js'
import {TreeViewer} from 'parser'

export default {
  template: `
  <div class='ui-area'>
    <div class='tabs'>
      <div v-bind:class='tab1State' v-on:click='tabSelect($event)' value='input-grammar'>Input Grammar</div>
      <div v-bind:class='tab2State' v-on:click='tabSelect($event)' value='input-program'>Input program</div>
      <div v-bind:class='tab3State' v-on:click='tabSelect($event)' value='output'>Output</div>
    </div>
    <div class='main-area'>
      <div class='main-area-inside'>
        <div class='wrapper'>
          <div class='wrapper2'>
            <textarea id='input-grammar' v-if='tab == "input-grammar"' class='textarea' v-on:change='updateGrammar'>{{grammar}}</textarea>
            <textarea id='program' v-if='tab == "input-program"' class='textarea' v-on:change='updateProgram'>{{program}}</textarea>
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
      tab: 'input-grammar',
      tab1State: 'tab selected',
      tab2State: 'tab',
      tab3State: 'tab',
      output: ''
    }
  },
  methods:{
    tabSelect(e){
      this.tab1State = 'tab'
      this.tab2State = 'tab'
      this.tab3State = 'tab'
      
      let tabName = e.target.getAttribute('value')
      switch(tabName){
        case 'input-grammar':
          this.tab1State = 'tab selected'
          break
        case 'input-program':
          this.tab2State = 'tab selected'
          break
        case 'output':
          this.tab3State = 'tab selected'
          break
      }
      this.tab = tabName
    },
    updateGrammar(e){
      this.parser.setGrammar(e.target.value)
    },
    updateProgram(e){
      this.$emit('update-program', e.target.value)
    },
    updateOutput(parsedOutputTree){
      let treeviewer = new TreeViewer(parsedOutputTree, this.$refs.output)
      this.output = treeviewer.getOutputString(parsedOutputTree)
    },
    h1Export(){
      this.$emit('h1-export')
    },
    m1Export(){
      this.$emit('m1-export')
    }
  },
  components:{
    CommandBar
  },
  emits: ['update-grammar', 'update-program', 'h1-export', 'm1-export'],
  inject:['parser']
}
