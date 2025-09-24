<template>
  <div>
    <div class="mainLayout__wrap"></div>
    <Header></Header>
    <main class="mainLayout">
      <div class="mainLayout__container">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Header from '@/components/app/header.vue'

export default defineComponent({
  name: 'MainLayout',
  data() {
    return {}
  },
  components: {
    Header
  }
})
</script>

<style scoped lang="scss">
.mainLayout {
  height: calc(100vh - 88.77px);
  display: flex;
  align-items: center;
  justify-content: center;
  //z-index: 10;

  &__wrap {
    position: fixed;
    z-index: -1;
    inset: 0;
    //background-image: url("@/assets/images/background.svg");
  }

  &__container {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: left;
    align-items: flex-start;
  }
}

@media (width < 1900px) {
  .mainLayout {
    height: calc(100vh - 80px);
  }
}
</style>
