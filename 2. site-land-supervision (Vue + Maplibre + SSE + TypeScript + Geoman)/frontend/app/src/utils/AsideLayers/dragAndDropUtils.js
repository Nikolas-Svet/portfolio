export const onDragStart = ({ event, item, selectedLayersForGrouping }) => {
  const draggingSelection = selectedLayersForGrouping.includes(`${item.type}-${item.id}`)
    ? selectedLayersForGrouping.map((entry) => {
        const [type, id] = entry.split('-')
        return { id: Number(id), type }
      })
    : [{ id: item.id, type: item.type }]

  event.dataTransfer.setData('application/json', JSON.stringify({ id: item.id, type: item.type }))
  event.dataTransfer.effectAllowed = 'move'

  console.log('Начато перемещение:', { draggedItem: item, draggingSelection })
  return { draggedItem: item, draggingSelection }
}

export const onDragOver = ({ event, item }) => {
  event.preventDefault()

  const rect = event.currentTarget.getBoundingClientRect()
  const offset = event.clientY - rect.top
  const height = rect.height
  const zoneHeight = height / 2

  let dropPosition = null

  if (offset < zoneHeight) {
    dropPosition = 'before'
  } else if (offset > height - zoneHeight) {
    dropPosition = 'after'
  } else if (item.type === 'group') {
    dropPosition = 'inside'
  }

  return dropPosition
}

export function onDrop({
  rootGroup,
  draggingSelection,
  targetItem,
  dropPosition,
  findParentGroupById
}) {
  console.log('rootGroup', rootGroup)
  console.log('targetItem', targetItem)
  console.log('dropPosition', dropPosition)
  console.log('draggingSelection', draggingSelection)

  // Проверяем, не вложена ли группа в другую группу
  if (targetItem.group) {
    if (draggingSelection.some((item) => item.type === 'group' && targetItem.group.length > 0)) {
      window.$notify('Вложение группы в группу запрещено', true)
      // alert('Вложение группы в группу запрещено')
      return rootGroup
    }
  }

  // Находим исходную группу
  const sourceParent = findParentGroupById(
    rootGroup,
    draggingSelection[0].id,
    draggingSelection[0].type
  )

  if (!sourceParent) {
    console.warn(
      `Родительская группа не найдена для ID: ${draggingSelection[0].id} и типа: ${draggingSelection[0].type}`
    )
    return rootGroup
  }

  // Удаляем перемещаемые элементы из исходной группы
  const itemsToMove = sourceParent.children.filter((child) =>
    draggingSelection.some((dragged) => dragged.id === child.id && dragged.type === child.type)
  )

  if (itemsToMove.length === 0) {
    console.warn('Нет элементов для перемещения')
    return rootGroup
  }

  console.log('Перемещаемые элементы:', itemsToMove)

  // Обновляем исходную группу
  sourceParent.children = sourceParent.children.filter((child) => !itemsToMove.includes(child))

  // Обновляем поле group для перемещаемых элементов
  const targetGroup = targetItem.type === 'group' ? targetItem.id : targetItem.group || ''
  itemsToMove.forEach((item) => {
    const previousGroup = item.group // Для отладки
    item.group = targetGroup // Присваиваем новое значение group
    console.log(
      `Слой ${item.id} (${item.type}): группа обновлена с ${previousGroup} на ${item.group}`
    )
  })

  // Находим целевую группу
  const targetParent = findParentGroupById(rootGroup, targetItem.id, targetItem.type)

  if (!targetParent) {
    console.warn('Целевая группа не найдена')
    return rootGroup
  }

  // Целевой индекс в целевой группе
  const targetIndex = targetParent.children.findIndex(
    (child) => child.id === targetItem.id && child.type === targetItem.type
  )

  console.log('Целевой индекс:', targetIndex)

  // Добавляем элементы в целевую группу
  if (dropPosition === 'before') {
    targetParent.children.splice(targetIndex, 0, ...itemsToMove)
  } else if (dropPosition === 'after') {
    targetParent.children.splice(targetIndex + 1, 0, ...itemsToMove)
  } else if (dropPosition === 'inside' && targetItem.type === 'group') {
    const targetGroupItem = targetParent.children.find(
      (child) => child.id === targetItem.id && child.type === targetItem.type
    )
    if (targetGroupItem) {
      targetGroupItem.children.push(...itemsToMove)
    }
  }

  console.log('Обновленный rootGroup:', rootGroup)

  return rootGroup
}

export const resetDragState = () => ({
  draggedItem: null,
  dragOverTarget: null,
  dragOverPosition: null,
  draggingSelection: []
})
