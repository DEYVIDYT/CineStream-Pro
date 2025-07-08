// Esta interface deve ser implementada pelo código nativo Android
// e injetada no WebView com o nome 'AndroidBridge'.
interface AndroidBridgeInterface {
  makeApiRequest(action: string, paramsJson: string, callbackId: string): void;
}

declare global {
  interface Window {
    AndroidBridge: AndroidBridgeInterface;
    resolvePromise: (callbackId: string, isSuccess: boolean, data: string, error: string) => void;
  }
}

type PromiseCallbacks = {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
};

const pendingPromises = new Map<string, PromiseCallbacks>();
let promiseIdCounter = 0;

// Esta função será chamada pelo app nativo Android para resolver ou rejeitar a Promise.
window.resolvePromise = (callbackId, isSuccess, data, error) => {
  const callbacks = pendingPromises.get(callbackId);
  if (callbacks) {
    if (isSuccess) {
      try {
        callbacks.resolve(JSON.parse(data));
      } catch(e) {
        callbacks.reject(new Error("Falha ao analisar o JSON da resposta nativa."));
      }
    } else {
      try {
        callbacks.reject(JSON.parse(error));
      } catch(e) {
         callbacks.reject(new Error(error || "Erro nativo desconhecido."));
      }
    }
    pendingPromises.delete(callbackId);
  }
};

/**
 * Invoca um método na ponte nativa do Android.
 * @param action A ação a ser executada (ex: 'get_credentials', 'player_api').
 * @param params Os parâmetros para a ação.
 * @returns Uma Promise que resolve com os dados da chamada nativa.
 */
export function invokeNative<T>(action: string, params: Record<string, any> = {}): Promise<T> {
  return new Promise((resolve, reject) => {
    if (typeof window.AndroidBridge?.makeApiRequest !== 'function') {
      const errorMessage = 'AndroidBridge não está disponível. Este app deve ser executado dentro do contêiner nativo Android.';
      console.error(errorMessage);
      // Simula uma interface de login para facilitar o desenvolvimento em navegador
      if (window.location.protocol.startsWith('http')) {
         alert(errorMessage + "\n\nModo de fallback para desenvolvimento em browser não implementado.");
      }
      return reject(new Error(errorMessage));
    }

    const callbackId = `cb_${promiseIdCounter++}`;
    pendingPromises.set(callbackId, { resolve, reject });
    
    try {
        const paramsJson = JSON.stringify(params);
        window.AndroidBridge.makeApiRequest(action, paramsJson, callbackId);
    } catch (e) {
        pendingPromises.delete(callbackId);
        reject(e);
    }

    // Define um timeout para evitar que as promises fiquem pendentes indefinidamente.
    setTimeout(() => {
        if (pendingPromises.has(callbackId)) {
            pendingPromises.delete(callbackId);
            reject(new Error(`A chamada nativa '${action}' expirou (timeout).`));
        }
    }, 30000); // Timeout de 30 segundos
  });
}
