import styled from 'styled-components';

export const Container = styled.div`
  border: 1px dashed #BFBFBF;
  border-radius: 8px;
`;

export const IframeBox = styled.iframe`
  width: 100%;
  height: 100%;
  min-height: 700px;
  min-width: 700px;
`;
export const Image = styled.img`
  width: 80px;
  height: 80px;
`;

export const FilesPreview = styled.div`
  display: flex;
  min-width: 800px;
  min-height: auto;
  img {
  max-width: 100%;
  height: 100%;
  background-size: cover;
  }
`;

export const FilesContainer = styled.div`
  display: flex;
  justify-content: center;
  text-align: center;
  padding: 10px;
`;
export const DragContainer = styled.div<{ isPadding }>(
  ({ isPadding }) => `
    background: #FFFFFF;
    border: 2px dashed #BFBFBF;
    border-radius: 8px;
    margin: 22px 22px 10px 22px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    font-size: 13px;
    line-height: 16px;
    font-family: 'Inter';
    gap: 10px;
    padding: 50px;
    h6 {
        font-weight: 500;
        font-size: 13px;
        line-height: 16px;
    }
    h5 {
        font-size: 13px;
        line-height: 16px;
        color: #AEAEAE;
    }
    p {
        font-size: 13px;
        line-height: 16px;
        color: blue;
        text-decoration-line: underline;
        margin: 0;
    }
    div {
        display: flex;
        gap: 3px;
    }
    h3 {
      font-size: 13px;
      color: red;
    }
    h4 {
      font-size: 13px;
      color: green;
    }
    iframe {
      background-size: ${isPadding ? 'cover' : 'unset'};
    }
`,
);
