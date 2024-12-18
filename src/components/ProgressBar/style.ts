import styled from 'styled-components';

export const StyledProgress = styled.div`
  background-color: rgba(255, 255, 255, 0.10);
  border-radius: 5px;
  position: relative;
  margin: 15px 0;
  height: 12px;
  width: 100%;
  padding: 3px;
`;

export const StyledProgressDone = styled.div`
  background: #00FF9B;
  border-radius: 5px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 6px;
  width: 0;
  opacity: 0;
  transition: 2s ease 0.3s;
`;
