// website-public/tasks.js
async function loadTasks() {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      try {
        const response = await fetch('https://a1dos-creations.com/api/tasks', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();
        if (response.ok) {
          displayTasks(data.tasks);
        } else {
          alert(data.error || 'Failed to load tasks.');
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
        alert('Error loading tasks.');
      }
    } else {
      // For guests, load tasks stored locally
      const localTasks = JSON.parse(localStorage.getItem('localTasks')) || [];
      displayTasks(localTasks);
    }
  }
  
  function displayTasks(tasks) {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    tasks.forEach(task => {
      const li = document.createElement('li');
      li.textContent = `${task.title}: ${task.details || ''}`;
      taskList.appendChild(li);
    });
  }
  
  document.getElementById('task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const taskData = Object.fromEntries(formData.entries());
    
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      // Send task to backend if signed in
      try {
        const response = await fetch('https://a1dos-creations.com/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...taskData, token: authToken })
        });
        const data = await response.json();
        if (response.ok) {
          alert(data.message);
          loadTasks();
        } else {
          alert(data.error || 'Failed to add task.');
        }
      } catch (error) {
        console.error('Error adding task:', error);
        alert('Error adding task.');
      }
    } else {
      // For guests, save task locally
      let localTasks = JSON.parse(localStorage.getItem('localTasks')) || [];
      localTasks.push(taskData);
      localStorage.setItem('localTasks', JSON.stringify(localTasks));
      alert('Task added locally.');
      loadTasks();
    }
  });
  
  document.getElementById('refresh-tasks').addEventListener('click', loadTasks);
  
  // Load tasks when page loads
  loadTasks();
  