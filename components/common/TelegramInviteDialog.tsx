import React from 'react';

interface TelegramInviteDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const TelegramInviteDialog: React.FC<TelegramInviteDialogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  const telegramLink = "https://t.me/CineStreamPro2";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-surface p-6 rounded-lg shadow-xl w-full max-w-md text-on-surface">
        <h2 className="text-xl font-bold mb-4 text-center">Junte-se à nossa comunidade!</h2>
        <p className="mb-6 text-center text-sm text-on-surface-variant">
          Fique por dentro das últimas novidades, lançamentos e interaja com outros usuários.
          Clique abaixo para entrar no nosso grupo oficial do Telegram.
        </p>
        <a
          href={telegramLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-primary text-on-primary text-center font-semibold py-3 px-4 rounded-lg hover:bg-yellow-600 transition-colors mb-3"
        >
          Entrar no Grupo Telegram
        </a>
        <button
          onClick={onClose}
          className="w-full bg-surface-variant text-on-surface-variant text-center font-semibold py-3 px-4 rounded-lg hover:bg-opacity-80 transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};

export default TelegramInviteDialog;
