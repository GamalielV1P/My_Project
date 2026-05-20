import { loadTasks } from './storage.js'
import { setTasks, addTask, getFilteredTasks, updateTask, deleteTask } from './taskModel.js'
import { renderTasks, showNotification, showEditModal, showConfirmDialog } from './ui.js'
import { CATEGORIES } from './config.js'

function populateCategorySelects() {
  const selects = [
    document.getElementById('task-category'),
    document.getElementById('filter-category'),
    document.getElementById('edit-category')
  ]

  selects.forEach(select => {
    if (!select) return
    select.innerHTML = ''
    CATEGORIES.forEach(cat => {
      const option = document.createElement('option')
      option.value = cat
      option.textContent = cat
      select.appendChild(option)
    })
    if (select.id === 'filter-category') {
      const allOption = document.createElement('option')
      allOption.value = 'Все'
      allOption.textContent = 'Все'
      select.prepend(allOption)
      select.value = 'Все'
    }
  })
}

let currentSort = { field: 'dueDate', order: 'asc' }

function refreshView() {
  const filters = getFilterStateFromUI()
  const filtered = getFilteredTasks(filters)
  renderTasks(filtered, handleEditClick, handleDeleteClick)
}

function getFilterStateFromUI() {
  const activeBtn = document.querySelector('#filters button.active')
  const filterValue = activeBtn ? activeBtn.dataset.filter : 'all'
  return {
    category: document.getElementById('filter-category')?.value || 'Все',
    urgent: document.getElementById('filter-urgent')?.checked || false,
    completed: filterValue === 'completed' ? true : (filterValue === 'active' ? false : undefined),
    search: document.getElementById('search-input')?.value?.trim() || '',
    sortBy: currentSort.field,
    sortOrder: currentSort.order
  }
}

function handleEditClick(taskId) {
  const tasks = getFilteredTasks({})
  const task = tasks.find(t => t.id === taskId)
  if (!task) return showNotification('Задача не найдена', 'error')
  showEditModal(task, (updatedData) => {
    updateTask(taskId, updatedData)
    showNotification('Задача обновлена', 'success')
    refreshView()
  })
}

function handleDeleteClick(taskId) {
  showConfirmDialog('Вы уверены, что хотите удалить задачу?', () => {
    try {
      deleteTask(taskId)
      showNotification('Задача удалена', 'success')
      refreshView()
    } catch (err) {
      showNotification(err.message, 'error')
    }
  })
}

function debounce(fn, delay) {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn.apply(this, args), delay)
  }
}

function exportToCSV(tasks) {
  const header = 'Название,Описание,Категория,Срок,Срочно,Завершена'
  const rows = tasks.map(t => `"${t.title}","${t.description}","${t.category}","${t.dueDate}","${t.isUrgent}","${t.completed}"`)
  const csv = [header, ...rows].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'tasks.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function checkUpcomingDeadlines(tasks) {
  const now = Date.now()
  const soon = now + 24 * 60 * 60 * 1000
  const upcoming = tasks.filter(t => t.dueDate && !t.completed && new Date(t.dueDate).getTime() > now && new Date(t.dueDate).getTime() <= soon)
  if (upcoming.length > 0) {
    showNotification(`В ближайшие 24 часа срок сдачи у ${upcoming.length} задач(и)`, 'warning')
  }
}

function initApp() {
  populateCategorySelects()

  const tasks = loadTasks()
  setTasks(tasks)
  checkUpcomingDeadlines(tasks)
  refreshView()

  const addForm = document.getElementById('add-task-form')
  if (addForm) {
    addForm.addEventListener('submit', (e) => {
      e.preventDefault()
      const title = document.getElementById('task-title')?.value?.trim() || ''
      if (!title) {
        showNotification('Введите название задачи', 'error')
        return
      }
      const taskData = {
        title,
        description: document.getElementById('task-desc')?.value?.trim() || '',
        category: document.getElementById('task-category')?.value || '',
        dueDate: document.getElementById('task-duedate')?.value || '',
        isUrgent: document.getElementById('task-urgent')?.checked || false
      }
      addTask(taskData)
      addForm.reset()
      showNotification('Задача добавлена', 'success')
      refreshView()
    })
  }

  document.querySelectorAll('#filters button[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#filters button[data-filter]').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      refreshView()
    })
  })

  const filterCategory = document.getElementById('filter-category')
  if (filterCategory) filterCategory.addEventListener('change', refreshView)

  const filterUrgent = document.getElementById('filter-urgent')
  if (filterUrgent) filterUrgent.addEventListener('change', refreshView)

  const searchInput = document.getElementById('search-input')
  if (searchInput) searchInput.addEventListener('input', debounce(refreshView, 300))

  document.querySelectorAll('#tasks-table th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const field = th.dataset.sort
      if (currentSort.field === field) {
        currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc'
      } else {
        currentSort.field = field
        currentSort.order = 'asc'
      }
      refreshView()
    })
  })

  const exportBtn = document.getElementById('export-csv')
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const filters = getFilterStateFromUI()
      const filtered = getFilteredTasks(filters)
      exportToCSV(filtered)
    })
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp)
} else {
  initApp()
}