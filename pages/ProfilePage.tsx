import React, { useState, useRef, useEffect, useContext } from 'react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useFocusable, FocusContext } from '../components/tv/FocusManager';

const TelegramIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="currentColor" stroke="none" className={className}>
        <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-1.39.2-1.71l15.1-5.55c.73-.27 1.36.17 1.15.99l-2.28 10.57c-.23.95-1.04 1.17-1.81.71l-4.88-3.58-2.35 2.25c-.24.24-.45.46-.8.46z"/>
    </svg>
);

const CopyIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
);

const PlusCircleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
);

const FocusableButton: React.FC<{
  onClick: (e?: React.MouseEvent) => void;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}> = ({ onClick, className, children, disabled }) => {
    const { ref, isFocused } = useFocusable<HTMLButtonElement>({ onEnterPress: disabled ? () => {} : onClick });
    
    return (
        <button
            ref={ref}
            onClick={onClick}
            tabIndex={-1}
            disabled={disabled}
            className={`${className} ${isFocused ? 'focused' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {children}
        </button>
    );
};


// --- Dialog Component ---
interface AddListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => Promise<{ success: boolean; message: string }>;
}

const AddListDialog: React.FC<AddListDialogProps> = ({ isOpen, onClose, onSubmit }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const focusContext = useContext(FocusContext);

  useEffect(() => {
    if (isOpen && focusContext && dialogRef.current) {
      focusContext.trapFocus(dialogRef);
    }
    return () => {
      if (isOpen && focusContext) {
        focusContext.releaseFocus();
      }
    };
  }, [isOpen, focusContext]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      setFeedback({ type: 'error', message: 'Por favor, insira uma URL.' });
      return;
    }
    
    setIsLoading(true);
    setFeedback(null);
    
    const result = await onSubmit(url);

    setIsLoading(false);
    setFeedback({ type: result.success ? 'success' : 'error', message: result.message });
    
    if (result.success) {
      setUrl('');
      setTimeout(() => {
        onClose();
        setFeedback(null);
      }, 2000);
    }
  };
  
  const handleClose = () => {
      if(isLoading) return;
      setUrl('');
      setFeedback(null);
      onClose();
  }
  
  const { ref: inputContainerRef, isFocused: isInputFocused } = useFocusable<HTMLDivElement>({});
  const inputRef = useRef<HTMLInputElement>(null);
  
   useEffect(() => {
      if (isInputFocused) {
        inputRef.current?.focus();
      }
    }, [isInputFocused]);


  if (!isOpen) return null;

  return (
    <div ref={dialogRef} className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div className="bg-surface rounded-lg shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-on-surface mb-2">Adicionar Lista Xtrem Codes</h2>
        <p className="text-sm text-on-surface-variant mb-4">
          Ao contribuir com sua lista, você ajuda a manter nosso servidor ativo e com mais opções para todos. Agradecemos sua colaboração!
        </p>
        
        <form onSubmit={handleSubmit}>
          <div ref={inputContainerRef} tabIndex={-1} className={`p-1 rounded-lg ${isInputFocused ? 'focused' : ''}`}>
            <input
              ref={inputRef}
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://servidor.com/get.php?..."
              className="w-full p-3 bg-background rounded-lg text-on-surface placeholder-on-surface-variant focus:outline-none"
              disabled={isLoading}
            />
          </div>
          
          {feedback && (
            <p className={`mt-3 text-sm text-center ${feedback.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {feedback.message}
            </p>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <FocusableButton
              onClick={handleClose}
              disabled={isLoading}
              className="px-6 py-2 rounded-lg bg-white/10 text-on-surface font-semibold hover:bg-white/20 transition-colors"
            >
              Cancelar
            </FocusableButton>
            <FocusableButton
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-2 rounded-lg bg-primary text-on-primary font-semibold hover:bg-yellow-600 transition-colors flex items-center justify-center min-w-[100px] h-[40px]"
            >
              {isLoading ? <LoadingSpinner className="w-6 h-6 border-2" /> : 'Enviar'}
            </FocusableButton>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- Main Profile Page Component ---
const ProfilePage: React.FC = () => {
  const [copyButtonText, setCopyButtonText] = useState('Copiar Lista IPTV');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleCopyClick = () => {
        const listUrl = 'http://mybrasiltv.x10.mx/stream.php';
        navigator.clipboard.writeText(listUrl).then(() => {
            setCopyButtonText('Copiado!');
            setTimeout(() => setCopyButtonText('Copiar Lista IPTV'), 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            setCopyButtonText('Falha ao copiar');
            setTimeout(() => setCopyButtonText('Copiar Lista IPTV'), 2000);
        });
    };

  const handleAddListSubmit = async (url: string): Promise<{ success: boolean; message: string }> => {
    try {
      const urlObject = new URL(url);
      const params = urlObject.searchParams;

      const username = params.get('username');
      const password = params.get('password');
      const server = `${urlObject.protocol}//${urlObject.host}`;

      if (!username || !password) {
        return { success: false, message: 'URL inválida. Usuário ou senha não encontrados.' };
      }

      const credentialData = [{
        id: `user-${Date.now()}`,
        server: server,
        username: username,
        password: password,
        added_at: new Date().toISOString(),
        last_validated: new Date().toISOString(),
      }];

      const response = await fetch('http://mybrasiltv.x10.mx/data.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(credentialData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro no servidor: ${response.status} ${response.statusText}. Detalhes: ${errorText}`);
      }
      
      const result = await response.json();

      if (result.success) {
        return { success: true, message: 'Lista adicionada com sucesso! Obrigado.' };
      } else {
        return { success: false, message: result.error || 'Falha ao adicionar a lista.' };
      }

    } catch (error) {
      console.error('Failed to parse URL or submit data:', error);
      let message = 'Ocorreu um erro.';
      if (error instanceof TypeError) {
        message = 'A URL fornecida é inválida. Verifique o formato.';
      } else if (error instanceof Error) {
        message = error.message;
      }
      return { success: false, message };
    }
  };
  
    const openTelegram = () => {
      window.open('https://t.me/mybrasiltv', '_blank', 'noopener,noreferrer');
    };

  return (
    <>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-on-surface mb-6">Perfil e Configurações</h1>
        
        <div className="space-y-4">
          <FocusableButton
            onClick={() => setIsDialogOpen(true)}
            className="w-full flex items-center justify-center bg-surface text-on-surface font-bold py-3 rounded-lg hover:bg-white/10 transition-colors"
          >
              <PlusCircleIcon className="mr-2 h-5 w-5" />
              <span>Adicionar Lista Xtrem Codes</span>
          </FocusableButton>
          <FocusableButton
              onClick={openTelegram}
              className="w-full flex items-center justify-center bg-surface text-on-surface font-bold py-3 rounded-lg hover:bg-white/10 transition-colors"
          >
              <TelegramIcon className="mr-2 h-5 w-5" />
              <span>Abrir grupo do Telegram</span>
          </FocusableButton>
          <FocusableButton
              onClick={handleCopyClick}
              className="w-full flex items-center justify-center bg-surface text-on-surface font-bold py-3 rounded-lg hover:bg-white/10 transition-colors"
          >
              <CopyIcon className="mr-2 h-5 w-5" />
              <span>{copyButtonText}</span>
          </FocusableButton>
        </div>

        <div className="mt-8 text-center text-on-surface-variant">
          <p>CineStream Pro v1.0.0</p>
        </div>
      </div>
      <AddListDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleAddListSubmit}
      />
    </>
  );
};

export default ProfilePage;