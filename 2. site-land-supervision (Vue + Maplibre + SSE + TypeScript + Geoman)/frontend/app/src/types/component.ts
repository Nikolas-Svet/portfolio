export interface IComponentCustomProperties {
  $refs: {
    [key: string]: HTMLElement | IComponentCustomProperties
  }
}
