import React, { useState, useEffect, useRef } from 'react';
import { createGlobalStyle } from 'styled-components';
import { ref, set, onValue, off, push, remove, update } from 'firebase/database';
import { auth, database } from './firebase-config';
import { signOut } from 'firebase/auth';
import Statistics from './Statistics';
import {
  GlobalStyle,
  AppContainer,
  Header,
  Title,
  HeaderButton,
  HeaderButtons,
  TaskLibrary,
  TaskCardWrapper,
  TaskImage,
  TaskContent,
  TaskTitle,
  TaskTime,
  TaskControls,
  ControlButton,
  EditButton,
  DeleteButton,
  ModalOverlay,
  ModalContent,
  ModalTitle,
  FormGroup,
  FormLabel,
  FormInput,
  UploadLabel,
  FileInput,
  ImagePreview,
  ModalButtons
} from './styles/styles';

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const parseTimeString = (timeString) => {
  const [hours = 0, minutes = 0, seconds = 0] = timeString.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

const MainPage = ({ onLogout }) => {
  // Состояния
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    background: '',
    timeSpent: 0,
    isRunning: false,
    startTime: null
  });
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Загрузка задач из Firebase
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const tasksRef = ref(database, `users/${user.uid}/tasks`);
    const listener = onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedTasks = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
          isRunning: false,
          startTime: null
        }));
        setTasks(loadedTasks);
      } else {
        setTasks([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error reading tasks:", error);
      setError("Failed to load tasks");
      setLoading(false);
    });

    return () => off(tasksRef, 'value', listener);
  }, []);

  // Таймер для активных задач
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prevTasks => {
        const updatedTasks = prevTasks.map(task => {
          if (task.isRunning && task.startTime) {
            const additionalTime = Math.floor((Date.now() - task.startTime) / 1000);
            return {
              ...task,
              timeSpent: task.timeSpent + additionalTime,
              startTime: Date.now()
            };
          }
          return task;
        });
        return updatedTasks;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Функция сброса формы
  const resetForm = () => {
    setNewTask({
      title: '',
      background: '',
      timeSpent: 0,
      isRunning: false,
      startTime: null
    });
    setEditingTask(null);
    setImagePreview('');
    setShowModal(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Сохранение задачи в Firebase
  const saveTaskToFirebase = async (task) => {
    const user = auth.currentUser;
    if (!user) {
      setError("No authenticated user");
      return null;
    }

    try {
      if (task.id) {
        const taskRef = ref(database, `users/${user.uid}/tasks/${task.id}`);
        await update(taskRef, {
          title: task.title,
          background: task.background,
          timeSpent: task.timeSpent || 0
        });
        return taskRef;
      } else {
        const newTaskRef = push(ref(database, `users/${user.uid}/tasks`));
        await set(newTaskRef, {
          title: task.title,
          background: task.background,
          timeSpent: task.timeSpent || 0,
          createdAt: Date.now()
        });
        return newTaskRef;
      }
    } catch (error) {
      console.error("Error saving task:", error);
      setError("Failed to save task");
      throw error;
    }
  };

  // Удаление задачи из Firebase
  const deleteTaskFromFirebase = async (taskId) => {
    const user = auth.currentUser;
    if (!user) {
      setError("No authenticated user");
      return;
    }

    try {
      const taskRef = ref(database, `users/${user.uid}/tasks/${taskId}`);
      await remove(taskRef);
    } catch (error) {
      console.error("Error deleting task:", error);
      setError("Failed to delete task");
    }
  };

  // Обработчики событий
  const handleLogout = async () => {
    try {
      await signOut(auth);
      if (onLogout) onLogout();
    } catch (error) {
      console.error("Error signing out: ", error);
      setError("Failed to logout");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setNewTask(prev => ({ ...prev, background: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTimeChange = (e) => {
    const timeString = e.target.value;
    if (/^(\d{0,2}:?){0,3}$/.test(timeString)) {
      const seconds = parseTimeString(timeString);
      setNewTask(prev => ({ ...prev, timeSpent: seconds }));
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      background: task.background,
      timeSpent: task.timeSpent,
      isRunning: false,
      startTime: null
    });
    setImagePreview(task.background);
    setShowModal(true);
  };

  const handleAddTask = async () => {
    setError(null);
    if (newTask.title.trim() === '') {
      setError("Task title cannot be empty");
      return;
    }
    
    try {
      if (editingTask) {
        await saveTaskToFirebase({
          id: editingTask.id,
          title: newTask.title,
          background: newTask.background,
          timeSpent: newTask.timeSpent
        });
      } else {
        await saveTaskToFirebase({
          title: newTask.title,
          background: newTask.background,
          timeSpent: newTask.timeSpent
        });
      }
      resetForm();
    } catch (error) {
      console.error("Error in handleAddTask:", error);
      setError(`Failed to ${editingTask ? 'update' : 'add'} task`);
    }
  };

  const handleDeleteTask = async (id) => {
    await deleteTaskFromFirebase(id);
  };

  const handleStartTimer = (id) => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => {
        if (task.id === id) {
          return {
            ...task,
            isRunning: true,
            startTime: Date.now()
          };
        }
        if (task.isRunning) {
          return {
            ...task,
            isRunning: false,
            timeSpent: task.timeSpent + Math.floor((Date.now() - task.startTime) / 1000),
            startTime: null
          };
        }
        return task;
      });
      return updatedTasks;
    });
  };

  const handleStopTimer = async (id) => {
    const taskToUpdate = tasks.find(task => task.id === id && task.isRunning);
    if (taskToUpdate) {
      const updatedTime = taskToUpdate.timeSpent + 
        Math.floor((Date.now() - taskToUpdate.startTime) / 1000);
      
      await saveTaskToFirebase({
        ...taskToUpdate,
        timeSpent: updatedTime
      });
    }

    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id && task.isRunning
          ? {
              ...task,
              isRunning: false,
              timeSpent: task.timeSpent + Math.floor((Date.now() - task.startTime) / 1000),
              startTime: null
            }
          : task
      )
    );
  };

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId === targetId) return;

    const draggedIndex = tasks.findIndex(task => task.id === draggedId);
    const targetIndex = tasks.findIndex(task => task.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;

    const newTasks = [...tasks];
    const [removed] = newTasks.splice(draggedIndex, 1);
    newTasks.splice(targetIndex, 0, removed);
    
    setTasks(newTasks);
  };

  return (
  <>
    <GlobalStyle />
    <AppContainer>
      <Header>
        <Title>Productivity Library</Title>
        <HeaderButtons>
          <HeaderButton primary onClick={() => setShowModal(true)}>
            <i className="fas fa-plus"></i> Add Task
          </HeaderButton>
          <HeaderButton 
            onClick={handleLogout} 
            style={{ 
              background: 'linear-gradient(to bottom, #ff6464 5%, #d93c3c 95%)', 
              color: '#fff' 
            }}
          >
            <i className="fas fa-sign-out-alt"></i> Logout
          </HeaderButton>
        </HeaderButtons>
      </Header>

      {error && (
        <div style={{ 
          color: '#ff6464',
          padding: '10px',
          margin: '10px 0',
          background: 'rgba(255, 100, 100, 0.1)',
          borderRadius: '3px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      <TaskLibrary>
        {loading ? (
          <div style={{ 
            color: '#c6d4df', 
            textAlign: 'center', 
            gridColumn: '1/-1',
            padding: '20px'
          }}>
            <i className="fas fa-spinner fa-spin"></i> Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div style={{ 
            color: '#c6d4df', 
            textAlign: 'center', 
            gridColumn: '1/-1',
            padding: '20px'
          }}>
            <i className="fas fa-tasks"></i> No tasks found. Add your first task!
          </div>
        ) : (
          tasks.map(task => (
            <TaskCardWrapper
              key={task.id}
              draggable
              onDragStart={(e) => handleDragStart(e, task.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, task.id)}
            >
              <TaskImage background={task.background} />
              <TaskContent>
                <TaskTitle>{task.title}</TaskTitle>
                <TaskTime>
                  <i className="fas fa-clock"></i> Time spent: {formatTime(task.timeSpent)}
                  {task.isRunning && (
                    <span style={{ 
                      display: 'inline-block',
                      width: '10px',
                      height: '10px',
                      backgroundColor: '#a1cd44',
                      borderRadius: '50%',
                      marginLeft: '8px',
                      animation: 'pulse 1.5s infinite'
                    }}></span>
                  )}
                </TaskTime>
                <TaskControls>
                  <EditButton onClick={() => handleEditTask(task)}>
                    <i className="fas fa-edit"></i> Edit
                  </EditButton>
                  {task.isRunning ? (
                    <ControlButton onClick={() => handleStopTimer(task.id)}>
                      <i className="fas fa-stop"></i> Stop
                    </ControlButton>
                  ) : (
                    <ControlButton primary onClick={() => handleStartTimer(task.id)}>
                      <i className="fas fa-play"></i> Start
                    </ControlButton>
                  )}
                  <DeleteButton onClick={() => handleDeleteTask(task.id)}>
                    <i className="fas fa-trash-alt"></i> Delete
                  </DeleteButton>
                </TaskControls>
              </TaskContent>
            </TaskCardWrapper>
          ))
        )}
      </TaskLibrary>

      <Statistics tasks={tasks} />

      {showModal && (
        <ModalOverlay onClick={resetForm}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalTitle>
              <i className={editingTask ? 'fas fa-edit' : 'fas fa-plus-circle'}></i> 
              {editingTask ? ' Edit Task' : ' Add New Task'}
            </ModalTitle>
            
            <FormGroup>
              <FormLabel>
                <i className="fas fa-heading"></i> Task Title
              </FormLabel>
              <FormInput
                type="text"
                name="title"
                value={newTask.title}
                onChange={handleInputChange}
                placeholder="Enter task name"
                autoFocus
              />
            </FormGroup>
            
            <FormGroup>
              <FormLabel>
                <i className="fas fa-image"></i> Background Image
              </FormLabel>
              <FormInput
                type="text"
                name="background"
                value={newTask.background}
                onChange={handleInputChange}
                placeholder="Enter image URL"
              />
              <UploadLabel>
                <i className="fas fa-upload"></i> Upload from device
                <FileInput 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                />
              </UploadLabel>
              {imagePreview && (
                <ImagePreview>
                  <img src={imagePreview} alt="Preview" />
                </ImagePreview>
              )}
            </FormGroup>
            
            <FormGroup>
              <FormLabel>
                <i className="fas fa-clock"></i> Time Spent (HH:MM:SS)
              </FormLabel>
              <FormInput
                type="text"
                value={formatTime(newTask.timeSpent)}
                onChange={handleTimeChange}
                placeholder="00:00:00"
              />
            </FormGroup>
            
            <ModalButtons>
              <ControlButton onClick={resetForm}>
                <i className="fas fa-times"></i> Cancel
              </ControlButton>
              <ControlButton primary onClick={handleAddTask}>
                <i className="fas fa-check"></i> {editingTask ? 'Save Changes' : 'Add Task'}
              </ControlButton>
            </ModalButtons>
          </ModalContent>
        </ModalOverlay>
      )}
    </AppContainer>

    <style>
      {`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
      `}
    </style>
  </>
);
};

export default MainPage;