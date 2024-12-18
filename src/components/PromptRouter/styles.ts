import styled from 'styled-components';

export const Modal = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: center;

    z-index: 5;
    width: 100%;
    height: 100%;

    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;

    padding: 20%;
    margin: 0px;

    background-color: #0000004d;
    box-sizing: border-box;
    
    h1 {
        font-weight: bold;
    }
`;

export const CenterModal = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    max-width: 300px;

    text-align: center;
    font-size: 14px;
    line-height: 17px;

    background: #FFFFFF;
    border: 1px solid #D7D7D7;
    border-radius: 8px;
    padding: 30px;
    gap: 10px;
    button {
        width: 52%;
    }
`;
