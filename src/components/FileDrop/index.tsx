import { DropzoneOptions, useDropzone } from 'react-dropzone';
import { ReactNode, useEffect, useRef } from 'react';
import { LabelStyled } from './styles';

interface FileDropProps {
  onError?: () => void
  onDrag?: (isDragActive: boolean) => void
  onSuccess?: () => void
  onReset?: () => void
  fileDropConfig: DropzoneOptions
  children?: ReactNode
}

export const FileDrop: React.FC<FileDropProps> = ({
  onError,
  onDrag,
  onSuccess,
  onReset,
  fileDropConfig,
  children,
  ...props
}) => {
  const dropzone = useDropzone({
    ...fileDropConfig,
  });

  const {
    getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject,
  } = dropzone;

  const ref = useRef(false);

  const hasError = isDragActive && isDragReject;
  const success = isDragActive && isDragAccept;
  const reset = !isDragActive && !isDragAccept && !isDragReject;

  useEffect(() => {
    hasError && onError?.();
  }, [hasError]);

  useEffect(() => {
    success && onSuccess?.();
  }, [success]);

  useEffect(() => {
    ref.current && onDrag?.(isDragActive);

    ref.current = true;
  }, [isDragActive]);

  useEffect(() => {
    reset && onReset?.();
  }, [reset]);

  return (
    <div
      {...getRootProps()}
      {...props}
    >
      <LabelStyled htmlFor="dropzone-file">
        {children}
      </LabelStyled>
      <input {...getInputProps()} className="hidden" />
    </div>
  );
};
