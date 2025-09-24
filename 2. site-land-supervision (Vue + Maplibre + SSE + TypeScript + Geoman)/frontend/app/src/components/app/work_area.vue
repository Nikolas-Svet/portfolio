<template>
  <div v-if="flagWorkArea"></div>
</template>

<script>
export default {
  name: 'work_area',
  props: {
    flagWorkArea: false
  },
  data() {
    return {}
  },
  methods: {
    show_work_area() {
      this.$emit('show_work_area', !this.flagWorkArea)
    }
  }
}
</script>

<style scoped>
div {
  height: 500px;
  width: 500px;
  background-color: red;
  position: absolute;
  z-index: 5;
  top: 50%;
  right: 50%;
}
</style>
