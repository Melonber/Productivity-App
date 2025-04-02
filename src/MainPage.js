import React, { useState, useEffect, useRef } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import Statistics from './Statistics';
import {
  GlobalStyle,
  fadeIn,
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

// Utility functions
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

const saveTasksToStorage = (tasks) => {
  try {
    localStorage.setItem('steam-productivity-tasks', JSON.stringify(tasks));
  } catch (e) {
    console.error("Failed to save tasks to localStorage", e);
  }
};

const loadTasksFromStorage = () => {
  try {
    const savedTasks = localStorage.getItem('steam-productivity-tasks');
    if (savedTasks) {
      return JSON.parse(savedTasks);
    }
  } catch (e) {
    console.error("Failed to load tasks from localStorage", e);
  }
  return [];
};

// Main App Component
const MainPage = () => {
  const [tasks, setTasks] = useState(() => {
    const loadedTasks = loadTasksFromStorage();
    return loadedTasks.map(task => ({
      ...task,
      isRunning: false,
      startTime: null
    }));
  });

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    background: 'https://via.placeholder.com/300x120?text=Task+Image',
    timeSpent: 0,
    isRunning: false,
    startTime: null
  });
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  // Save tasks whenever they change
  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  // Update running timers every second
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
        
        if (updatedTasks.some(task => task.isRunning)) {
          return updatedTasks;
        }
        return prevTasks;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Save tasks when page is about to unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const tasksWithStoppedTimers = tasks.map(task => {
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
      saveTasksToStorage(tasksWithStoppedTimers);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [tasks]);

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

  const handleAddTask = () => {
    if (newTask.title.trim() === '') return;
    
    if (editingTask) {
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === editingTask.id 
            ? { 
                ...task, 
                title: newTask.title,
                background: newTask.background,
                timeSpent: newTask.timeSpent
              } 
            : task
        )
      );
    } else {
      const task = {
        ...newTask,
        id: Date.now(),
        isRunning: false,
        startTime: null
      };
      setTasks(prev => [...prev, task]);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setNewTask({
      title: '',
      background: 'https://via.placeholder.com/300x120?text=Task+Image',
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

  const handleDeleteTask = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id));
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
      saveTasksToStorage(updatedTasks);
      return updatedTasks;
    });
  };

  const handleStopTimer = (id) => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => {
        if (task.id === id && task.isRunning) {
          return {
            ...task,
            isRunning: false,
            timeSpent: task.timeSpent + Math.floor((Date.now() - task.startTime) / 1000),
            startTime: null
          };
        }
        return task;
      });
      saveTasksToStorage(updatedTasks);
      return updatedTasks;
    });
  };

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    const draggedId = Number(e.dataTransfer.getData('text/plain'));
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
          </HeaderButtons>
        </Header>

        <TaskLibrary>
          {tasks.map(task => (
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
                <TaskTime>Time spent: {formatTime(task.timeSpent)}</TaskTime>
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
          ))}
        </TaskLibrary>

        <Statistics tasks={tasks} />

        {showModal && (
          <ModalOverlay onClick={resetForm}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <ModalTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</ModalTitle>
              <FormGroup>
                <FormLabel>Task Title</FormLabel>
                <FormInput
                  type="text"
                  name="title"
                  value={newTask.title}
                  onChange={handleInputChange}
                  placeholder="Enter task name"
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel>Background Image</FormLabel>
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
                <FormLabel>Time Spent (HH:MM:SS)</FormLabel>
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
                  <i className="fas fa-check"></i> {editingTask ? 'Save' : 'Add'}
                </ControlButton>
              </ModalButtons>
            </ModalContent>
          </ModalOverlay>
        )}
      </AppContainer>
    </>
  );
};

export default MainPage;