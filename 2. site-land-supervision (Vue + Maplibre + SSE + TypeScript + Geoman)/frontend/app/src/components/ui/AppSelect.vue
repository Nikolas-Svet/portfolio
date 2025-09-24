<template>
  <v-select
    :label="label"
    :options="options"
    v-model="valueSelect"
    :reduce="reduceOptions"
    @update:model-value="updateSelect"
    :append-to-body="true"
    :calculate-position="withPopper"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { ISelectOption } from '@/types/admin'
import { reduceOptions } from '@/utils/select'
import { autoUpdate, computePosition } from '@floating-ui/dom'
import { IComponentCustomProperties } from '@/types/component'

export default defineComponent({
  props: {
    label: {
      required: true,
      type: String
    },
    options: {
      required: true,
      type: Array<ISelectOption>
    },
    value: {
      type: String
    }
  },
  data() {
    return {
      valueSelect: this.$props.value
    }
  },
  emits: ['update'],
  methods: {
    reduceOptions,
    updateSelect(e: string | number) {
      this.$emit('update', e)
    },
    withPopper(
      dropdownList: HTMLElement,
      component: IComponentCustomProperties,
      { width }: { width: string }
    ) {
      dropdownList.style.position = 'fixed'
      dropdownList.style.width = width

      const updateDropDownPosition = () => {
        computePosition(component.$refs.toggle as HTMLElement, dropdownList).then(({ x, y }) => {
          dropdownList.style.left = `${x}px`
          dropdownList.style.top = `${y}px`
        })
      }

      updateDropDownPosition()

      const cleanup = autoUpdate(
        component.$refs.toggle as HTMLElement,
        dropdownList,
        updateDropDownPosition
      )

      return () => cleanup()
    }
  }
})
</script>

<style></style>
