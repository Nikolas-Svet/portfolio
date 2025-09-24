<template>
  <div class="container" style="height: 100%; width: 100%">
    <div class="desktops">
      <div class="desktops__title">
        <p>Документы</p>
        <span
          class="icon-add primary-color"
          title="Добавить документ"
          @click="add_document()"
        ></span>
      </div>
      <div class="desktops__content">
        <AppTable>
          <template #THeader>
            <thead>
            <tr>
              <th>Тип</th>
              <th>Наименование</th>
              <th>Описание</th>
              <th>Действие</th>
            </tr>
            </thead>
          </template>

          <template #TBody>
            <tbody>
            <tr v-for="(document, index) in documents" :key="document.uuid_file">
              <td>{{ document.name_type }}</td>
              <td>{{ document.name_file }}</td>
              <td>{{ document.description }}</td>
              <td>
                <img
                  :src="download"
                  alt=""
                  @click="downloadDocument(document.uuid_file, document.name_file)"
                />
                <img :src="del" alt="" @click="removeDoc(document.uuid_file, index)" />
              </td>
            </tr>
            </tbody>
          </template>
        </AppTable>
      </div>
    </div>
  </div>

  <div v-if="addFlag" class="window">
    <div class="add-desktop">
      <div class="add-desktop__title">
        <p>Добавить документ</p>
      </div>
      <div class="add-desktop__content">
        <AngleContainer>
          <textarea v-model="description" placeholder="Описание документа"></textarea>
        </AngleContainer>
        <AngleContainer>
          <input
            style="height: 24px; width: 100%; padding: 0"
            type="file"
            @change="handleFileUpload"
          />
        </AngleContainer>
        <AngleContainer>
          <v-select
            v-model="territoriesType"
            :options="territoriesOptions"
            label="name"
            placeholder="Территория"
          ></v-select>
        </AngleContainer>
        <AngleContainer>
          <v-select
            v-model="fileType"
            :options="filesTypesOptions"
            label="name"
            placeholder="Тип файла"
          ></v-select>
        </AngleContainer>
      </div>
      <div class="add-desktop__buttons">
        <button @click="close()">Отменить</button>
        <button class="primary-color" @click="uploadDocument()">Загрузить</button>
      </div>
    </div>
  </div>

  <div v-if="deleteDelFlag" class="window">
    <div class="window__delete">
      <p>Удалить документ?</p>
      <div class="window__delete-block">
        <button @click="removeDocument()">Удалить</button>
        <button class="primary-color" @click="removeDoc()">Отменить</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { dictsApi } from '@/api/dicts.ts'
import { Consts } from '@/consts/index.consts.ts'
import { IDocument } from '@/types/documents.ts'
import { documentsApi } from '@/api/documents.ts'
import { IDictTerritories, IDictTypesFiles } from '@/types/dicts.ts'

const del = ref(new URL('@/assets/images/delete.svg', import.meta.url).href)
const download = ref(new URL('@/assets/images/download.svg', import.meta.url).href)
const documents = ref<Array<IDocument>>([])
const territoriesOptions = ref<Array<IDictTerritories>>([])
const filesTypesOptions = ref<Array<IDictTypesFiles>>([])
const deleteDelFlag = ref(false)
const addFlag = ref(false)
const currentUUID = ref<string>('')
const territoriesType = ref<{ id: number; name: string } | null>(null)
const fileType = ref<{ id: number; name: string } | null>(null)
const currentIndex = ref<number | null>(null)
const file2: Ref<File | null> = ref(null)
const selectedFileName = ref<string | null>(null)
const description = ref<string | null>(null)

const removeDoc = (uuid_file: string = '', index: number | null = null) => {
  deleteDelFlag.value = !deleteDelFlag.value
  currentUUID.value = uuid_file
  currentIndex.value = index
}

onMounted(async () => {
  const response_ter = await dictsApi.getDict(Consts.DictsPrefixAPI.DictTerritories)
  const response_types_files = await dictsApi.getDict(Consts.DictsPrefixAPI.DictTypesFiles)
  territoriesOptions.value = response_ter.success ? response_ter.data : []
  filesTypesOptions.value = response_types_files.success ? response_types_files.data : []

  await loadDocuments()
  if (documents.value.length > 0) {
    addDocumentTypes()
  }
})

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    file2.value = file
    selectedFileName.value = file.name
  }
}

const loadDocuments = async () => {
  try {
    const response = await documentsApi.getDocuments()

    if (!response.success) {
      console.error('Не удалось загрузить документы')
    } else {
      documents.value = await response.data
    }
  } catch (error) {
    console.error('Ошибка при загрузке документов:', error)
  }
}

const close = () => {
  addFlag.value = false
  description.value = null
  file2.value = null
  selectedFileName.value = null
  fileType.value = null
  territoriesType.value = null
}

const uploadDocument = async () => {
  if (!file2.value) {
    ;(window as any).$notify('Выберите файл перед загрузкой', true)
    return
  }

  try {
    await documentsApi.uploadDocument(
      description.value || '',
      Number(territoriesType.value?.id) || null,
      Number(fileType.value?.id) || null,
      file2.value
    )

    close()
    await loadDocuments()
  } catch (error) {
    console.error('Ошибка при загрузке документа:', error)
  }
}

const add_document = () => {
  addFlag.value = true
}

const addDocumentTypes = () => {
  documents.value = documents.value.map((document: IDocument) => {
    const docType = filesTypesOptions.value.find((type: IDictTypesFiles) => type.id === document.id_dict_type_file)
    return {
      ...document,
      name_type: docType ? docType.name : '',
      name_file: document.name_file || '',
      uuid_file: document.uuid_file || ''
    }
  })
}

const downloadDocument = async (uuid_file: string, name_file: string) => {
  try {
    const result = await documentsApi.downloadDocument(uuid_file)

    if (!result.success || !result.data) {
      console.error('Ошибка при загрузке файла')
      return false
    }

    // Пытаемся извлечь имя файла
    let filename = name_file.split('.')[0]

    // contentDisposition — нужен только если сервер отдаёт заголовки в data (проверь API)
    const contentDisposition = result.data?.headers?.['content-disposition'] || ''
    const match = contentDisposition.match(/filename="?([^"]+)"?/)
    if (match && match[1]) {
      filename = match[1]
    }

    const contentType = result.data?.headers?.['content-type']

    if (contentType?.includes('application/json')) {
      const text = typeof result.data === 'string' ? result.data : JSON.stringify(result.data)
      const jsonData = JSON.stringify(JSON.parse(text), null, 2)

      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = filename.endsWith('.geojson') ? filename : `${filename}.geojson`
      link.click()
      URL.revokeObjectURL(url)
      return true
    }

    // Обработка бинарных файлов
    const blob = new Blob([result.data])
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
    return true
  } catch (error) {
    console.error('Ошибка при загрузке файла:', error)
    return false
  }
}

const removeDocument = async () => {
  try {
    const response = await documentsApi.deleteDocument(currentUUID.value)

    if (!response.success) {
      ;(window as any).$notify('Ошибка при удалении документа', true)
      removeDoc('', null)
      return
    } else {
      ;(window as any).$notify('Документ успешно удален', true)
      await loadDocuments()
      deleteDelFlag.value = false
      return
    }
  } catch (error) {
    console.error('Ошибка при удалении файла:', error)
  }
}

</script>

<style lang="scss" scoped>

.window {
  z-index: 111;
}

thead {
  transform: translateY(-1px);
}

img {
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
}

tr {
  background-color: transparent !important;
}

.add-desktop {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
  max-width: 490px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 50px;

  &__title {
    p {
      font-family: $Golos_Text_Medium;
      font-size: 22px;
      font-weight: 500;
      margin-bottom: 30px;
    }
  }

  &__content {
    width: 100%;
  }

  &__buttons {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    border-radius: 0;
    outline: none;

    button {
      width: 40%;
      height: 40px;

      &:first-child {
        background-color: transparent;
      }

      &:last-child {
        border: none;
      }
    }
  }
}

input {
  width: 100%;
  background-color: transparent;
  border: 1px solid rgb(104, 104, 104);
  border-radius: 1px;
  height: 50px;
  padding-left: 10px;
  outline: none;
}

textarea {
  display: flex;
  width: 100%;
  max-height: 300px;
  background-color: transparent;
  border: 1px solid rgb(104, 104, 104);
  border-radius: 1px;
  min-height: 100px;
  padding: 10px;
  resize: vertical;
  outline: none;

  &::placeholder {
    color: #ffffff;
  }
}

.angle {
  &__container {
    width: 100%;
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 30px;
    }
  }
}

.desktops {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex: 1;
  padding-top: 60px;

  &__title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 220px;
    width: 100%;
    margin-bottom: 30px;

    p {
      font-size: 24px;
      font-family: $Golos_Text_Medium;
    }

    span {
      width: 24px;
      height: 24px;

      &:after {
        width: 10px;
        height: 1px;
      }

      &:before {
        width: 10px;
        height: 1px;
      }
    }
  }

  &__content {
    flex: 1;
    overflow: auto;
  }

  &__block_buttons {
    margin-top: 70px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: end;

    div {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 455px;
      width: 100%;
      border-radius: 0;
      outline: none;

      button {
        width: 49%;
        height: 50px;

        &:first-child {
          background-color: transparent;
          border: 1px solid #d68166;
          color: #d68166;

          &:hover {
            background-color: #d68166;
            color: #2b2b2b;
          }
        }

        &:last-child {
          border: none;
          color: #2b2b2b;
        }
      }
    }
  }
}
</style>
