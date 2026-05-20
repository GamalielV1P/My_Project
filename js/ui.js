import { updateTask } from './taskModel.js'

export function renderTasks(tasks, onEdit, onDelete) {
  const tbody = document.querySelector('#tasks-table tbody')
  if (!tbody) return
  tbody.innerHTML = ''

  if (tasks.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6">Нет задач для отображения</td></tr>'
    return
  }

  tasks.forEach(task => {
    const row = document.createElement('tr')
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed
    if (isOverdue) row.classList.add('overdue')

    row.innerHTML = `
      <td>${escapeHtml(task.title)}</td>
      <td>${task.category}</td>
      <td>${task.dueDate || '—'}</td>
      <td>${task.isUrgent ? '🔴' : '—'}</td>
      <td><input type="checkbox" class="toggle-completed" data-id="${task.id}" ${task.completed ? 'checked' : ''}></td>
      <td>
        <button class="btn-edit" data-id="${task.id}">✎</button>
        <button class="btn-delete" data-id="${task.id}">🗑</button>
      </td>
    `

    const checkbox = row.querySelector('.toggle-completed')
    if (checkbox) {
      checkbox.addEventListener('change', (e) => {
        updateTask(task.id, { ...task, completed: e.target.checked })
        if (typeof onEdit === 'function') onEdit()
      })
    }

    const editBtn = row.querySelector('.btn-edit')
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        if (typeof onEdit === 'function') onEdit(task.id)
      })
    }

    const deleteBtn = row.querySelector('.btn-delete')
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        if (typeof onDelete === 'function') onDelete(task.id)
      })
    }

    tbody.appendChild(row)
  })
}

export function showNotification(message, type = 'info') {
  const area = document.getElementById('notification-area')
  if (!area) return
  area.textContent = message
  area.className = `notification notification-${type}`
  area.style.display = 'block'
  setTimeout(() => { area.style.display = 'none' }, 3000)
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

export function showEditModal(task, onSave) {
  const modal = document.getElementById('modal-container')
  if (!modal) return

  const titleInput = modal.querySelector('#edit-title')
  const descInput = modal.querySelector('#edit-desc')
  const categorySelect = modal.querySelector('#edit-category')
  const dueDateInput = modal.querySelector('#edit-duedate')
  const urgentCheck = modal.querySelector('#edit-urgent')
  const completedCheck = modal.querySelector('#edit-completed')

  if (titleInput) titleInput.value = task.title
  if (descInput) descInput.value = task.description
  if (categorySelect) categorySelect.value = task.category
  if (dueDateInput) dueDateInput.value = task.dueDate
  if (urgentCheck) urgentCheck.checked = task.isUrgent
  if (completedCheck) completedCheck.checked = task.completed

  modal.style.display = 'flex'

  const saveBtn = modal.querySelector('.modal-save')
  const closeBtn = modal.querySelector('.modal-close')

  const closeModal = () => {
    modal.style.display = 'none'
  }

  if (saveBtn) {
    saveBtn.onclick = () => {
      const updated = {
        title: titleInput ? titleInput.value.trim() : '',
        description: descInput ? descInput.value.trim() : '',
        category: categorySelect ? categorySelect.value : '',
        dueDate: dueDateInput ? dueDateInput.value : '',
        isUrgent: urgentCheck ? urgentCheck.checked : false,
        completed: completedCheck ? completedCheck.checked : false
      }
      if (!updated.title) {
        showNotification('Название не может быть пустым', 'error')
        return
      }
      if (typeof onSave === 'function') onSave(updated)
      closeModal()
    }
  }

  if (closeBtn) {
    closeBtn.onclick = closeModal
  }
}

export function showConfirmDialog(message, onConfirm) {
  const modal = document.getElementById('confirm-modal')
  if (!modal) return

  const messageEl = modal.querySelector('.confirm-message')
  const yesBtn = modal.querySelector('.confirm-yes')
  const noBtn = modal.querySelector('.confirm-no')

  if (messageEl) messageEl.textContent = message
  modal.style.display = 'flex'

  if (yesBtn) {
    yesBtn.onclick = () => {
      if (typeof onConfirm === 'function') onConfirm()
      modal.style.display = 'none'
    }
  }

  if (noBtn) {
    noBtn.onclick = () => {
      modal.style.display = 'none'
    }
  }
}