export enum activeTools {
  message = 'message',
  geometry_polygon = 'geometry_polygon',
  geometry_point = 'geometry_point',
  geometry_line = 'geometry_line',
  delete_point = 'delete_point',
  highlight_polygon = 'highlight_polygon',
  highlight_bbox = 'highlight_bbox',
  polygon = 'polygon',
  circle_marker = 'circle_marker',
  circle = 'circle',
  line = 'line',
}

export enum activeCursors {
  move = 'move',
  default = '',
  message = 'message',
  crosshair = 'crosshair',
  grabbing = 'move',
  move_default = '',
}

export enum messageForUser {
  notEdit = 'Данному слою нельзя редактировать геометрию',
  circle_marker = 'Нарисовать точку',
  polygon = 'Нарисовать полигон',
  line = 'Нарисовать линию',
  circle = 'Нарисовать окружность',
  highlightPolygon = 'Выделить объект с помощью полигона',
  highlightBbox = 'Выделить объект с помощью bbox',
  deletePoint = 'Удалить созданную геометрию по точкам',
  saveChanges = 'Сохранить изменения'
}

