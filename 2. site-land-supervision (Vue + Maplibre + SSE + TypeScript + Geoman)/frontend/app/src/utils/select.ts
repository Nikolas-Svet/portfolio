import { ISelectOption } from '@/types/admin'

export function reduceOptions(option: ISelectOption): number | string {
  return option.id
}

export function dataToOptions<T extends ISelectOption>(
  data: T[],
  placeholder: string
): ISelectOption[] {
  return [
    {
      id: 0,
      name: placeholder
    },
    ...data.map((el) => ({
      id: el.id,
      name: el.name
    }))
  ]
}
