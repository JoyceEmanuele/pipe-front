import { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { Modal, CenterModal } from './styles';
import { Button } from '../Button';
import { Loader } from '../Loader';

interface Props {
  when?: boolean,
  onOK?: any,
  onCancel?: any,
  children?: JSX.Element | (JSX.Element[]) | null | string,
  title?: string,
  okText: string | JSX.Element,
  cancelText?: string | null,
}

export function RouterPrompt(props: Props) {
  const {
    when, onOK, onCancel, title, okText, cancelText, children,
  } = props;
  const history = useHistory();
  const [showPrompt, setShowPrompt] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const unblock = history.block((location, action): any => {
      const bool = true;
      if (when) {
        setCurrentPath(location.pathname);
        setShowPrompt(true);
        return '';
      }
      return bool;
    });

    return () => {
      unblock();
    };
  }, [when, history]);

  const handleCancel = useCallback(async (e) => {
    e.preventDefault();
    if (onOK) {
      const canRoute = await Promise.resolve(onOK());
      setShowPrompt(false);
      if (canRoute) {
        history.push(currentPath);
      }
    }
  }, [currentPath, history, onOK]);

  const handleOK = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    const response = await Promise.resolve(onCancel());
    setShowPrompt(false);
    if (response) {
      history.push(currentPath);
    }
    setLoading(false);
  }, [currentPath, history, onCancel]);

  return showPrompt ? (
    <Modal
      title={title}
      visible={showPrompt}
      onOk={handleOK}
      okText={okText}
      onCancel={handleCancel}
      cancelText={cancelText}
    >
      <CenterModal>
        <h1>Aviso</h1>
        {children}
        <Button variant="primary" onClick={(e) => handleOK(e)}>
          {loading
            ? (
              <Loader
                size="small"
                variant="secondary"
              />
            )
            : okText}
        </Button>
        <p style={{ textDecoration: 'underline' }} onClick={(e) => handleCancel(e)}>
          {cancelText}
        </p>
      </CenterModal>
    </Modal>
  ) : null;
}
