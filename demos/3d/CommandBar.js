

export default {
  template: `
  <div>
    <div v-if='state == "grammar"'><button 
      v-on:click="H1Export">H1 Export</button><button 
      v-on:click='M1Export'>M1 Export</button></div>
    <div v-if='state == "program"'></div>
    <div v-if='state == "output"'></div>
  </div>
    `,
  props: {
    state: String,
    program: String,
    grammar: String
  },
  methods:{
    H1Export(){
      this.$emit('h1-export')
    },

    M1Export(){
      this.$emit('m1-export')
    }
  },
  inject: ['parser'],
  emits: ['h1-export', 'm1-export']
}
