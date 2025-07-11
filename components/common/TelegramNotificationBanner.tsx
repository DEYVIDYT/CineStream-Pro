import React from 'react';

interface TelegramNotificationBannerProps {
  isVisible: boolean;
  onDismiss: () => void;
}

const TelegramNotificationBanner: React.FC<TelegramNotificationBannerProps> = ({ isVisible, onDismiss }) => {
  if (!isVisible) {
    return null;
  }

  const telegramLink = "https://t.me/CineStreamPro2";

  return (
    <div className="bg-primary-container text-on-primary-container p-3 text-sm fixed top-0 left-0 right-0 z-40 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <p>
          Não perca as novidades!{' '}
          <a
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline hover:text-yellow-300 transition-colors"
          >
            Entre no nosso grupo do Telegram.
          </a>
        </p>
        <button
          onClick={onDismiss}
          className="ml-4 p-1 rounded-full hover:bg-black/20 transition-colors"
          aria-label="Dispensar notificação"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TelegramNotificationBanner;
