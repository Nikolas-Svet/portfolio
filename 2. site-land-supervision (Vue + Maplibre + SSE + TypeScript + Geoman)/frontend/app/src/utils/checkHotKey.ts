import { Consts } from '@/consts/index.consts.ts'
import store from '@/store'

type HotKeyItem = {
  rus: string
  en: string
  full: string
}

export async function checkHotKey(e: KeyboardEvent): Promise<null | string> {
  if (!(e.ctrlKey || e.metaKey)) return null

  const l = store.state.layersMain?.selectedLayerMainEdit

  const modifier = Consts.HotKeys.modifier.default + ' + '
  const toolbar = Consts.HotKeys.toolbar

  for (const category of Object.values(toolbar)) {
    for (const [key, hotKey] of Object.entries(category as any) as [string, HotKeyItem][]) {
      const pressed = e.key.toLowerCase()
      if (pressed === hotKey.en || pressed === hotKey.rus) {
        e.preventDefault()
        console.log(`Поймали сочетание ${modifier}${hotKey.en}`)
        if (!l.id) return null
        return key
      }
    }
  }

  return null
}