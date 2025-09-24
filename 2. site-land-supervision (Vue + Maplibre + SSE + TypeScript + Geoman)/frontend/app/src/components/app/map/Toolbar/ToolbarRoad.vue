<script setup lang="ts">
import DrawBufferTool from '@/modules/toolbar/drawBuffer/entities/DrawBuffer.ts'

const props = defineProps<{
  map: maplibregl.Map | null
  geoman: any
}>()

const DrawBuffer = ref<DrawBufferTool | null>(null)

onMounted(async () => {
  setTimeout(() => {
    if (!props.map || !props.geoman) {
      console.log('[ToolbarRoad] не инициализировано')
      return
    }
    DrawBuffer.value = new DrawBufferTool(props.map, props.geoman, 10, 'meters')
  }, 3000)
})

const toggleMode = () => {
  console.log(DrawBuffer.value)
  if (!DrawBuffer.value) return
  if (!DrawBuffer.value.isActive()) {
    DrawBuffer.value.activate()
  } else {
    DrawBuffer.value.deactivate()
  }
}
</script>

<template>
  <div class="toolbar-basic">
    <button style="min-width: 20px; height: 20px; background-color: gold" @click="toggleMode">

    </button>
  </div>
</template>

<style scoped lang="scss">
.toolbar-basic {
  max-width: 212px !important;
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;

  svg {
    cursor: pointer;
    width: 30px;
    height: 30px;
  }
}
</style>