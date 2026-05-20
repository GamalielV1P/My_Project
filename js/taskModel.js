import { saveTasks } from './storage.js'

let tasks = []

export function setTasks(loadedTasks) {
  tasks = loadedTasks
}

export function getTasks() {
  return tasks
}

export function addTask({ title, description, category, dueDate, isUrgent }) {
  const newTask = {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substr(2),
    title,
    description,
    category,
    dueDate,
    isUrgent: Boolean(isUrgent),
    completed: false
  }
  tasks.push(newTask)
  saveTasks(tasks)
  return newTask
}

export function deleteTask(id) {
  const index = tasks.findIndex(t => t.id === id)
  if (index === -1) throw new Error('Задача не найдена')
  tasks.splice(index, 1)
  saveTasks(tasks)
}

export function updateTask(id, newData) {
  const task = tasks.find(t => t.id === id)
  if (!task) throw new Error('Задача не найдена')
  Object.assign(task, {
    title: newData.title,
    description: newData.description,
    category: newData.category,
    dueDate: newData.dueDate,
    isUrgent: Boolean(newData.isUrgent),
    completed: Boolean(newData.completed)
  })
  saveTasks(tasks)
  return task
}

export function getFilteredTasks({ category, urgent, completed, search, sortBy, sortOrder }) {
  let filtered = [...tasks]

  if (category && category !== 'Все') {
    filtered = filtered.filter(t => t.category === category)
  }

  if (urgent) {
    filtered = filtered.filter(t => t.isUrgent)
  }

  if (completed !== undefined) {
    filtered = filtered.filter(t => t.completed === completed)
  }

  if (search) {
    const lowerSearch = search.toLowerCase()
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(lowerSearch) ||
      t.description.toLowerCase().includes(lowerSearch)
    )
  }

  const field = sortBy || 'dueDate'
  const order = sortOrder === 'desc' ? -1 : 1
  filtered.sort((a, b) => {
    if (field === 'title') return a.title.localeCompare(b.title) * order
    if (field === 'dueDate') {
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return (new Date(a.dueDate) - new Date(b.dueDate)) * order
    }
    return 0
  })

  return filtered
}