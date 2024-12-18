import styled from 'styled-components';

export const Card = styled.div`
  padding: 32px;
  margin-top: 24px;
  border-radius: 16px;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24), 0px 3px 12px rgba(0, 0, 0, 0.12);
`;

export const CardTitle = styled.h3`
  cursor: pointer;
  text-decoration: underline;
`;

export const InputNumber = styled.div`
  display: flex;
  margin-left: 30px;
  height: 54px;
  position: relative;
  label {
    color: #202370;
    position: absolute;
    z-index: 1;
    margin: 8px;
    margin-left: 10px;
    font-size: 11px;
    font-weight: bold;
  }
  input {
    padding-top: 13px;
    padding-left: 10px;
    position: relative;
    border-radius: 5px;
    border: 1px solid gray;
    outline: 0;
  }
  p {
    font-size: 10px;
  }
`;

export const StyleSelect = styled.div`
  height: 58.84px;
  min-height: 48px;
  margin: 0;
  font-size: 12px;
  border: 1px solid #E9E9E9;
  border-radius: 5px;
  box-sizing: border-box !important;
  display: inline-flex;
  .select-search {  
    padding-top: 25px;
  }
  .select-search__value{
  }

  .select-search.has-focus{
  }

  label {
    color: #202370;
    position: absolute;
    z-index: 1;
    margin: 5px;
    margin-left: 10px;
    font-size: 11px;
    padding-top: 3px;
    padding-left: 5px;
    font-weight: bold;
  }
`;

export const CustomAnalysis = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  .dielTool{
    display: none;
    min-width: 0;
    height: 0;
  }
`;
