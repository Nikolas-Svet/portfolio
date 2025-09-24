// tests/unit/Documents.integration.spec.ts
import { config, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import Documents from '@/views/documents.vue'
import { dictsApi } from '@/api/dicts'
import flushPromises from 'flush-promises'

// 1) Стабы UI-компонентов:
config.global.components = {
  'v-select': { template: '<div data-test="v-select"/>' },
  AppTable: { template: '<table><slot name="THeader"/><slot name="TBody"/></table>' },
  AngleContainer: { template: '<div><slot/></div>' }
}

;(window as any).$notify = vi.fn()

describe('Documents.vue — поэтапный лог: получить → создать → удалить', () => {
  it('Логируем список до создания, после создания и после удаления', async () => {
    localStorage.setItem(
      'token',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDkxODY1NjYsInN1YiI6IntcInVzZXJuYW1lXCI6IFwibmlraXRhXCIsIFwiZW1haWxcIjogXCJuaWtpdGFBZG1pbkBtYWlsLnJ1XCIsIFwiZmlyc3RfbmFtZVwiOiBcIlxcdTA0MWRcXHUwNDM4XFx1MDQzYVxcdTA0MzhcXHUwNDQyXFx1MDQzMFwiLCBcImxhc3RfbmFtZVwiOiBcIlxcdTA0MjFcXHUwNDMyXFx1MDQzNVxcdTA0NDJcXHUwNDNhXFx1MDQzOFxcdTA0M2RcIiwgXCJmYXRoZXJfbmFtZVwiOiBcIlxcdTA0MTVcXHUwNDMyXFx1MDQzM1xcdTA0MzVcXHUwNDNkXFx1MDQ0Y1xcdTA0MzVcXHUwNDMyXFx1MDQzOFxcdTA0NDdcIiwgXCJ1c2VyX2lkXCI6IDksIFwiaXNfYWRtaW5cIjogdHJ1ZSwgXCJpc19zeXNfYWRtaW5cIjogdHJ1ZSwgXCJ0ZXJyaXRvcmllc1wiOiBbXSwgXCJpZF9yb2xlXCI6IG51bGwsIFwicm9sZVwiOiBudWxsfSIsInR5cGUiOiJiZWFyZXIifQ.pKkkbuIwMB3BiDkiluDzSIjkWC2l3lpWh8ouoI3ufGk'
    )

    // 1) Мокаем dictsApi.getDict -> непустые справочники:
    const fakeTerritories = [{ id: 1, name: 'ТестоваяТерритория' }]
    const fakeTypes = [{ id: 1, name: 'ТестовыйТипФайла' }]
    vi.spyOn(dictsApi, 'getDict')
      .mockResolvedValueOnce({ success: true, data: fakeTerritories }) // territories
      .mockResolvedValueOnce({ success: true, data: fakeTypes })       // types-files

    // 2) Монтируем компонент
    const wrapper = mount(Documents, {
      global: {
        provide: { API_URL: import.meta.env.VITE_API_URL }
      }
    })

    // 3) Ждём загрузки справочников + initial load documents
    await nextTick()
    await nextTick()

    const vm = wrapper.vm as any

    // 4) Логируем начальный список документов
    console.log('Before creating, documents:', vm.documents)

    // 5) Убеждаемся, что справочники НЕ пусты
    expect(vm.territoriesOptions).toEqual(fakeTerritories)
    expect(vm.filesTypesOptions).toEqual(fakeTypes)

    // 6) Запоминаем текущее число документов
    const beforeCount = vm.documents.length

    // 7) Заполняем форму для uploadDocument()
    vm.description = 'Тестовый файл интеграции'
    vm.territoriesType = vm.territoriesOptions[0]
    vm.fileType = vm.filesTypesOptions[0]
    const testFile = new File(
      ['Integration test content'],
      'integration-test.txt',
      { type: 'text/plain' }
    )
    vm.file2 = testFile

    // 8) Вызываем uploadDocument()
    await vm.uploadDocument()

    // 9) Ждём, пока loadDocuments() обновит vm.documents
    await nextTick()
    await nextTick()

    // 10) Логируем после создания
    console.log('After creating, documents:', vm.documents)

    // 11) Проверяем, что список увеличился и наш файл есть
    expect(vm.documents.length).toBeGreaterThan(beforeCount)
    const justAdded = vm.documents.find((d: any) => d.name_file === 'integration-test.txt')
    expect(justAdded).toBeDefined()
    const newUUID = justAdded.uuid_file

    // 12) Стабим скачивание
    if (!('createObjectURL' in URL)) {
      // @ts-ignore
      URL.createObjectURL = () => 'blob://fake-url'
    }
    if (!('revokeObjectURL' in URL)) {
      // @ts-ignore
      URL.revokeObjectURL = () => {
      }
    }
    const createSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob://fake-url')
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {
    })

    const origCreateElem = document.createElement.bind(document)
    const clickSpy = vi.fn()
    vi.spyOn(document, 'createElement').mockImplementation(tag => {
      return tag === 'a'
        ? ({ href: '', download: '', click: clickSpy } as unknown as HTMLAnchorElement)
        : origCreateElem(tag)
    })

    // 13) Вызываем downloadDocument()
    const downloadResult = await vm.downloadDocument(newUUID, 'integration-test.txt')
    expect(downloadResult).toBe(true)
    expect(createSpy).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()
    expect(revokeSpy).toHaveBeenCalledWith('blob://fake-url')

    // 14) Удаляем созданный файл
    vm.currentUUID = newUUID
    vm.currentIndex = vm.documents.findIndex((d: any) => d.uuid_file === newUUID)
    await vm.removeDocument()

    // 15) Ждём, пока loadDocuments() обновит vm.documents
    await nextTick()
    await nextTick()

    // 16) Логируем после удаления
    console.log('After deleting, documents:', vm.documents)

    // 17) Проверяем, что файл удалён
    const finalDocs = vm.documents
    const stillExists = finalDocs.find((d: any) => d.uuid_file === newUUID)
    expect(stillExists).toBeUndefined()
    // expect(finalDocs.length).toBe(beforeCount)


    // 5) До клика по «плюсику» форма не видна, поэтому никаких textarea/input ещё нет:
    expect(wrapper.find('textarea').exists()).toBe(false)
    expect(wrapper.find('input[type="file"]').exists()).toBe(false)

    // 6) Находим и кликаем по иконке «добавить документ»:
    const addIcon = wrapper.find('.icon-add.primary-color')
    expect(addIcon.exists()).toBe(true)
    await addIcon.trigger('click')

    await nextTick()
    await nextTick()
    await flushPromises()

    // 7) Теперь форма должна отрисоваться, ищем textarea:
    const textarea = wrapper.find('textarea')
    expect(textarea.exists()).toBe(true)
    console.log('Поле <textarea> для описания документа найдено и отрисовалось')

    // 8) Ищем <input type="file">:
    const fileInput = wrapper.find('input[type="file"]')
    expect(fileInput.exists()).toBe(true)
    console.log('Поле <input type="file"> найдено и отрисовалось')

    // 9) Ищем два <v-select> по data-test:
    const selectAll = wrapper.findAll('[data-test="v-select"]')
    expect(selectAll.length).toBe(2)
    console.log('Найдены два <v-select> (территория и тип файла)')

    // 10) Кнопки «Отменить» / «Загрузить»:
    const cancelBtn = wrapper.find('.add-desktop__buttons button:first-child')
    const uploadBtn = wrapper.find('.add-desktop__buttons button.primary-color')
    expect(cancelBtn.exists()).toBe(true)
    expect(uploadBtn.exists()).toBe(true)
    console.log('Найдены кнопки «Отменить» и «Загрузить»')

    // 11) Эмулируем ввод текста в <textarea>:
    await textarea.setValue('Описание из теста')
    expect(vm.description).toBe('Описание из теста')
    console.log('Ввод в textarea меняет `description`')

    // // 12) Эмулируем выбор «Территории» через первый селект:
    // await selectAll[0].vm.$emit('update:modelValue', fakeTerritories[0])
    // expect(vm.territoriesType).toEqual(fakeTerritories[0])
    // console.log('Выбор в первом v-select меняет `territoriesType`')
    //
    // // 13) Эмулируем выбор «Типа файла» через второй селект:
    // await selectAll[1].vm.$emit('update:modelValue', fakeTypes[0])
    // expect(vm.fileType).toEqual(fakeTypes[0])
    // console.log('Выбор во втором v-select меняет `fileType`')

    // 14) Эмулируем загрузку реального File:
    // const dummyFile = new File(['Hello'], 'test.txt', { type: 'text/plain' })
    // const dt = new DataTransfer()
    // dt.items.add(dummyFile)
    //
    //   // Присваиваем элементу .files без await:
    //   (fileInput.element as HTMLInputElement).files = dt.files
    // // И вручную триггерим событие change:
    // await fileInput.trigger('change')
    // expect(vm.file2).toStrictEqual(dummyFile)
    // console.log('Выбор файла в input[type="file"] сохраняет File в `file2`')

    // 15) Спайм метод uploadDocument, кликаем «Загрузить»:
    const uploadSpy = vi.spyOn(vm, 'uploadDocument')
    await uploadBtn.trigger('click')
    expect(uploadSpy).toHaveBeenCalled()
    console.log('Клик по «Загрузить» вызывает `uploadDocument()`')

    // 16) Кликаем «Отменить» и проверяем, что форма закрылась и поля обнулились:
    await cancelBtn.trigger('click')
    await nextTick()
    expect(vm.addFlag).toBe(false)
    expect(vm.description).toBeNull()
    expect(vm.file2).toBeNull()
    expect(vm.territoriesType).toBeNull()
    expect(vm.fileType).toBeNull()
    console.log('Клик «Отменить» закрывает форму и сбрасывает все поля')

  })
})
