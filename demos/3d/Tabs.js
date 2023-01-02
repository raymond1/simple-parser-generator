import { h} from 'vue'
import Tab from './Tab.js'
export default {
  data(){
    return {
      activeTab: -1,
    }
  },
  methods:{
  },
  render(){
    this.tabs = []
    // let slotObjects = {}
    let i = 1
    while(true){
      let computedName = 's' + i
      if (!this.$slots[computedName]){
        break
      }

      let test = {'tab':true, 'selected':i ==  this.activeTab}
      let props = {
        value: i,
        active: i == this.activeTab,
        onTabActivated:(e)=>{
          this.activeTab = parseInt(e)
          this.$emit('tab-select', this.activeTab)
        },
        class: test
      }

      let tab = h(Tab, props, this.$slots[computedName])
      this.tabs.push(tab)
      i++
    }

    return h('div', {class:'tabs', onTabActivated(e){
      alert('test')
    }}, [this.tabs])
  },
  components:{
    Tab
  },
  emits: ['tab-select']
}