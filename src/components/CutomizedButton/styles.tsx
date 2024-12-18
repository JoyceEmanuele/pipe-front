import styled from 'styled-components';

export const Base = styled.button`
  border-radius: 10px;
  border-style: solid;
  border: 0.8px solid rgba(80, 80, 80, 0.22);
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-size: 13px;
  outline: none;
  padding: 12px;
  text-decoration: none;
  transition: all 0.2s ease-in-out;
  width: 100%;
  background: #FFFFFF;
  width: 178px;
  height: 36px;
  display: flex;
  align-items:center;
  margin-bottom: 15px;

  :hover {
    background: #E9E9E9;
  }
`;

export const IconArea = styled.div`
  padding-right: 12px;
  padding-left: 5px;
`;
