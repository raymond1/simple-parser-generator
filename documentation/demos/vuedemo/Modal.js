export default {
  template: `
  <Teleport to="body">
    <div v-if="open" class="modal" v-cloak role='dialog' aria-labelledby="modalHeader">
      <div><button @click='close'>X</button></div>
      <div class='modalHeader' id='modalHeader'><slot name='header'></slot></div>
      <div class='modalOutput'><textarea v-model='content' readonly></textarea></div>
    </div>
  </Teleport>
    `,
  props: {
    open: Boolean,
    content: String
  },
  methods:{
    close(){
      this.$emit('close')
    }
  },
  inject: [],
  emits: ['close']
}
