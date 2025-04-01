import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import Statistics from './Statistics';

// Global Styles
const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Arial', sans-serif;
  }

  body {
    background-color: #1b2838;
    color: #c6d4df;
    min-height: 100vh;
    padding: 20px;
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Main App Container
const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

// Header Styles
const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #2a3f5a;
`;

const Title = styled.h1`
  color: #fff;
  font-size: 28px;
`;

const AddButton = styled.button`
  background: linear-gradient(to bottom, #799905 5%, #536904 95%);
  color: #d2e885;
  border: none;
  padding: 10px 20px;
  border-radius: 3px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;

  &:hover {
    background: linear-gradient(to bottom, #8cb306 5%, #6a8504 95%);
    color: #fff;
  }
`;

// Task Library Styles
const TaskLibrary = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

// Task Card Styles
const TaskCardWrapper = styled.div`
  background: linear-gradient(to bottom, #2a3f5a 0%, #1b2838 100%);
  border-radius: 5px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.3s ease-out;
  position: relative;
  cursor: grab;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.6);
  }
`;

const TaskImage = styled.div`
  height: 220px;
  background-image: ${props => `url(${props.background})`};
  background-size: cover;
  background-position: center;
  position: relative;
`;

const TaskContent = styled.div`
  padding: 15px;
`;

const TaskTitle = styled.h3`
  color: #fff;
  margin-bottom: 10px;
  font-size: 18px;
`;

const TaskTime = styled.p`
  color: #66c0f4;
  font-size: 14px;
  margin-bottom: 15px;
`;

const TaskControls = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ControlButton = styled.button`
  background: ${props => props.primary ? 'linear-gradient(to bottom, #67c1f5 0%, #3182b8 100%)' : 'rgba(103, 193, 245, 0.2)'};
  color: ${props => props.primary ? '#fff' : '#67c1f5'};
  border: none;
  padding: 8px 15px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.primary ? 'linear-gradient(to bottom, #7dcbf7 0%, #4292c0 100%)' : 'rgba(103, 193, 245, 0.3)'};
  }
`;

const DeleteButton = styled.button`
  background: rgba(255, 100, 100, 0.2);
  color: #ff6464;
  border: none;
  padding: 8px 15px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 100, 100, 0.3);
  }
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #2a3f5a;
  padding: 25px;
  border-radius: 5px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
`;

const ModalTitle = styled.h2`
  color: #fff;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 5px;
  color: #c6d4df;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 10px;
  background: #171a21;
  border: 1px solid #2a3f5a;
  border-radius: 3px;
  color: #fff;

  &:focus {
    outline: none;
    border-color: #66c0f4;
  }
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

// Utility functions
const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
const App = () => {
  const [tasks, setTasks] = useState(() => {
    const loadedTasks = loadTasksFromStorage();
    // Reset running states when loading
    return loadedTasks.map(task => ({
      ...task,
      isRunning: false,
      startTime: null
    }));
  });

  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    background: 'https://via.placeholder.com/300x120?text=Task+Image',
    timeSpent: 0,
    isRunning: false,
    startTime: null
  });

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
        
        // Only update state if there are running tasks
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

  const handleAddTask = () => {
    if (newTask.title.trim() === '') return;
    
    const task = {
      ...newTask,
      id: Date.now(),
      timeSpent: 0,
      isRunning: false,
      startTime: null
    };
    
    setTasks(prev => [...prev, task]);
    setNewTask({
      title: '',
      background: 'https://via.placeholder.com/300x120?text=Task+Image',
      timeSpent: 0,
      isRunning: false,
      startTime: null
    });
    setShowModal(false);
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
        // Stop any other running tasks
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
          <AddButton onClick={() => setShowModal(true)}>Add Task</AddButton>
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
                  {task.isRunning ? (
                    <ControlButton onClick={() => handleStopTimer(task.id)}>
                      Stop
                    </ControlButton>
                  ) : (
                    <ControlButton primary onClick={() => handleStartTimer(task.id)}>
                      Start
                    </ControlButton>
                  )}
                  <DeleteButton onClick={() => handleDeleteTask(task.id)}>
                    Delete
                  </DeleteButton>
                </TaskControls>
              </TaskContent>
            </TaskCardWrapper>
          ))}
        </TaskLibrary>
          <Statistics tasks={tasks} />

        {showModal && (
          <ModalOverlay onClick={() => setShowModal(false)}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <ModalTitle>Add New Task</ModalTitle>
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
                <FormLabel>Background Image URL</FormLabel>
                <FormInput
                  type="text"
                  name="background"
                  value={newTask.background}
                  onChange={handleInputChange}
                  placeholder="Enter image URL"
                />
              </FormGroup>
              <ModalButtons>
                <ControlButton onClick={() => setShowModal(false)}>
                  Cancel
                </ControlButton>
                <ControlButton primary onClick={handleAddTask}>
                  Add Task
                </ControlButton>
              </ModalButtons>
            </ModalContent>
          </ModalOverlay>
        )}
      </AppContainer>
    </>
  );
};

export default App;