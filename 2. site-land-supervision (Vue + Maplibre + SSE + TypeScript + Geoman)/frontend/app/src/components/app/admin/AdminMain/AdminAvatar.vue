<script setup lang="ts">
import { VueCropper } from 'vue-cropper'
import { userApi } from '@/api/user.ts'
import store from '@/store'
import { user } from '@/store/actions/user.ts'
import defaultIcon from '@/assets/icons/user.svg'

const iconUrl = ref<string>('')
const imageUrl = ref<string | null>(null)
const selectedFile = ref<File | null>(null)
const cropper = ref<any>(null)

onMounted(async () => {
  const blob = await userApi.getIcon()
  iconUrl.value = URL.createObjectURL(blob)
})

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    window.$notify('Файл не должен быть больше 5 МБ', true)
    return
  }
  selectedFile.value = file
  imageUrl.value = URL.createObjectURL(file)
}

function cropImage() {
  if (!selectedFile.value) return;

  (cropper.value as any).getCropBlob(async (blob: Blob) => {
    await userApi.loadIcon(blob)

    iconUrl.value = URL.createObjectURL(blob)
    imageUrl.value = null
    window.$notify('Аватар обновлен', true)
    await store.dispatch(user.updatePhoto, true)
  })
}
</script>

<template>
  <section class="avatar-section">
    <AppAdminTitle title="Аватар" />
    <div class="avatar-upload">
      <div class="avatar-preview">
        <img
          v-if="!imageUrl && iconUrl"
          :src="iconUrl"
          alt="Аватар пользователя"
          class="avatar-img"
        />
        <defaultIcon
          v-else-if="iconUrl === '' && !imageUrl"
        />
        <VueCropper
          v-else
          ref="cropper"
          :auto-crop="true"
          :auto-crop-area="1"
          :can-move="true"
          :can-move-box="false"
          :can-zoom="true"
          :center-box="true"
          :fixed-box="true"
          :img="imageUrl"
          :output-size="1"
          :view-mode="1"
          :wheel-zoom="true"
          class="cropper"
          mode="cover"
        />
      </div>
      <div class="controls">
        <input accept="image/*" type="file" @change="onFileChange" />
        <button
          v-if="imageUrl"
          class="btn-crop"
          type="button"
          @click="cropImage"
        >
          Подтвердить
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.avatar {
  &-upload {
    padding-left: 64px;
    display: flex;
    align-items: flex-end;
  }

  &-preview {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    overflow: hidden;
    margin-bottom: 0.75rem;
    //background-color: #f0f0f0;
    svg {
      width: 100%;
      height: 100%;
    }
  }

  &-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.cropper {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.controls input {
  margin-bottom: 0.5rem;

  input {
    width: 200px;
  }
}

.btn-crop {
  cursor: pointer;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0;
  background-color: $primary-color_2;
}
</style>