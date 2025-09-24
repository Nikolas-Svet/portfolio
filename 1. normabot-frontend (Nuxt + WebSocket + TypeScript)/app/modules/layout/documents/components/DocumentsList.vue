<script setup lang="ts">
import Empty from '~/components/ui/Empty.vue'
import DocumentItem from '~/modules/layout/documents/components/DocumentItem.vue'

const props = defineProps<{
  documents: any[]
}>()
</script>

<template>
<section class="documents-list container-chat">
  <DocumentItem/>
<!--  style="display: none"-->
  <Empty v-if="!documents.length" title="Документов не найдено"/>
</section>
</template>

<style scoped lang="scss">
.documents {
  &-list {
    flex: 1;
    margin-top: 40px;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;

    .empty {
      padding-top: 64px;
    }
  }
}
</style>