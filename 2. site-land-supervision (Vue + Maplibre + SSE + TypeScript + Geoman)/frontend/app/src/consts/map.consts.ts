import { MapLayouts } from '@/types/map/MapLayouts'

export const mapStyles = ref(<MapLayouts>{
  streets: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  satellite:
    'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  terrain: 'https://tile.opentopomap.org/{z}/{x}/{y}.png'
})

export enum LayerTypes {
  VECTOR = 'layer-vector',
  RASTER = 'layer-raster'
}

export enum rowName {
  sum = 'Расчетная стоимость ввода земельного участка в оборот составляет',
  sum_2 = 'Стоимость расчистки полей с помощью мульчера',
  area = 'Площадь леса в области',
  area2 = 'Площадь участка',
  title = 'Расчет затрат',
  title_default = 'Свойства'
}