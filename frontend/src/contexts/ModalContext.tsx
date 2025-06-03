import { createContext, useContext, useState, ReactNode } from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// Tipagem do contexto
type ModalContextType = {
  showModal: (content: ReactNode, title?: string) => void;
  closeModal: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal deve ser usado dentro do ModalProvider');
  return ctx;
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState<ReactNode>(null);
  const [title, setTitle] = useState<string>('');

  const showModal = (modalContent: ReactNode, modalTitle?: string) => {
    setContent(modalContent);
    setTitle(modalTitle || '');
    setOpen(true);
  };

  const closeModal = () => setOpen(false);

  return (
    <ModalContext.Provider value={{ showModal, closeModal }}>
      {children}
      <Dialog 
        open={open} 
        onClose={closeModal}
        maxWidth="sm"
        fullWidth
      >
        {title && (
          <DialogTitle>
            {title}
            <IconButton
              aria-label="close"
              onClick={closeModal}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
        )}
        <DialogContent>
          {content}
        </DialogContent>
      </Dialog>
    </ModalContext.Provider>
  );
} 