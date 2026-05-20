const STORAGE_KEY = 'tasksAppData'

export function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch (e) {
    console.error('Ошибка сохранения в localStorage:', e)
    throw new Error('Не удалось сохранить данные. Возможно, переполнено хранилище.')
  }
}

export function loadTasks() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []
    const parsed = JSON.parse(data)
    if (!Array.isArray(parsed)) throw new Error('Данные повреждены')
    return parsed
  } catch (e) {
    console.warn('Ошибка загрузки из localStorage, сброс данных:', e)
    return []
  }
}