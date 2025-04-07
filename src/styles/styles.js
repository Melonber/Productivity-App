import { createGlobalStyle, keyframes, styled } from 'styled-components';

// Global Styles
export const GlobalStyle = createGlobalStyle`
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

// Animations
export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Main Components
export const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

// Header Components
export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #2a3f5a;
`;

export const Title = styled.h1`
  color: #fff;
  font-size: 28px;
`;

export const HeaderButton = styled.button`
  background: linear-gradient(to bottom, ${props => props.primary ? '#67c1f5' : '#799905'} 5%, ${props => props.primary ? '#3182b8' : '#536904'} 95%);
  color: ${props => props.primary ? '#fff' : '#d2e885'};
  border: none;
  padding: 10px 20px;
  border-radius: 3px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: linear-gradient(to bottom, ${props => props.primary ? '#7dcbf7' : '#8cb306'} 5%, ${props => props.primary ? '#4292c0' : '#6a8504'} 95%);
    color: #fff;
  }
`;

export const HeaderButtons = styled.div`
  display: flex;
  gap: 15px;
`;

// Task Components
export const TaskLibrary = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

export const TaskCardWrapper = styled.div`
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

export const TaskImage = styled.div`
  height: 220px;
  background-image: ${props => `url(${props.background})`};
  background-size: cover;
  background-position: center;
  position: relative;
`;

export const TaskContent = styled.div`
  padding: 15px;
`;

export const TaskTitle = styled.h3`
  color: #fff;
  margin-bottom: 10px;
  font-size: 18px;
`;

export const TaskTime = styled.p`
  color: #66c0f4;
  font-size: 14px;
  margin-bottom: 15px;
`;

export const TaskControls = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const ControlButton = styled.button`
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

export const EditButton = styled.button`
  background: rgba(255, 215, 0, 0.2);
  color: #ffd700;
  border: none;
  padding: 8px 15px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  margin-right: 10px;

  &:hover {
    background: rgba(255, 215, 0, 0.3);
  }
`;

export const DeleteButton = styled.button`
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

// Modal Components
export const ModalOverlay = styled.div`
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

export const ModalContent = styled.div`
  background: #2a3f5a;
  padding: 25px;
  border-radius: 5px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
`;

export const ModalTitle = styled.h2`
  color: #fff;
  margin-bottom: 20px;
`;

export const FormGroup = styled.div`
  margin-bottom: 15px;
`;

export const FormLabel = styled.label`
  display: block;
  margin-bottom: 5px;
  color: #c6d4df;
`;

export const FormInput = styled.input`
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

export const UploadLabel = styled.label`
  display: block;
  padding: 10px 15px;
  background: #2a3f5a;
  color: #66c0f4;
  border-radius: 3px;
  cursor: pointer;
  text-align: center;
  margin-top: 10px;
  transition: all 0.2s;

  &:hover {
    background: #3d556e;
  }
`;

export const FileInput = styled.input`
  display: none;
`;

export const ImagePreview = styled.div`
  margin-top: 15px;
  img {
    max-width: 100%;
    max-height: 150px;
    border-radius: 3px;
  }
`;

export const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

// Utility Components
export const TimeValue = styled.p`
  color: #a1cd44;
  font-size: 24px;
  font-weight: bold;
`;

export const LogoutButton = styled(HeaderButton)`
  background: linear-gradient(to bottom, #ff6464 5%, #d93c3c 95%);
  color: #fff;
  
  &:hover {
    background: linear-gradient(to bottom, #ff7a7a 5%, #e05050 95%);
  }
`;