<script setup lang="ts">
import PrimaryHeader from '~/components/ui/primaryHeader.vue'
import DocumentsFilter from '~/modules/layout/documents/components/DocumentsFilter.vue'
import DocumentsList from '~/modules/layout/documents/components/DocumentsList.vue'

const documents = ref<any>([])
</script>

<template>
<section class="documents">
  <PrimaryHeader title="Документы"/>
  <DocumentsFilter :documents="documents" :is-show-categories="true" />
  <DocumentsList :documents="documents"/>
</section>
</template>

<style lang="scss">
.documents {
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
}
</style>