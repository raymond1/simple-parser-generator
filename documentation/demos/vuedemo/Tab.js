export default {
  props:{
    value: Number,
    active: false,
  },
  data(){
    return {
    }
  },
  template:`<div v-on:click='activate'>
    <slot></slot>
  </div>`,
  methods:{
    activate(){
      this.$emit('tab-activated', this.value)
    }
  },
  emits:['tab-activated']
}