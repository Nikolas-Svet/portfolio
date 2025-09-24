declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'vue-cropper/lib/vue-cropper.vue' {
  import { DefineComponent } from 'vue'
  const comp: DefineComponent<{}, {}, any>
  export default comp
}
