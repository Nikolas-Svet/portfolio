<script setup lang="ts">
import PrimaryHeader from '~/components/ui/primaryHeader.vue'
import DocumentsFilter from '~/modules/layout/documents/components/DocumentsFilter.vue'
import DocumentItem from '~/modules/layout/documents/components/DocumentItem.vue'
import DocumentsList from '~/modules/layout/documents/components/DocumentsList.vue'

const documents = ref<any[]>([])
</script>

<template>
<section class="favorites">
  <PrimaryHeader title="Избранное"/>
  <DocumentsFilter :documents="documents"/>
  <DocumentsList :documents="documents"/>
</section>
</template>

<style lang="scss">
.favorites {
  height: 100%;
  flex: 1;
}
</style>