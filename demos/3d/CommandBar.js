

export default {
  template: `
  <div>
    <div v-if='state == "input-grammar"'><button 
      v-on:click="H1Export">H1 Export</button><button 
      v-on:click='M1Export'>M1 Export</button></div>
    <div v-if='state == "input-program"'></div>
    <div v-if='state == "output"'><button v-on:click="parse">Parse</button></div>
  </div>
    `,
  props: {
    state: String,
    program: String,
    grammar: String
  },
  methods:{
    parse(){
      this.parser.setGrammar(this.grammar)

      let parsedOutputTree = this.parser.parse(this.program)
      this.$emit('update-output', parsedOutputTree)
    },

    H1Export(){
      this.$emit('h1-export')
    },

    M1Export(){
      this.$emit('m1-export')
    }
  },
  inject: ['parser'],
  emits: ['update-output', 'h1-export', 'm1-export']
}
