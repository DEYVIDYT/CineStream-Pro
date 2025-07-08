#!/data/data/com.termux/files/usr/bin/bash

ORIGEM="/storage/emulated/0/player"
DESTINO="$HOME/ptv"
BUILD_DIR="/storage/emulated/0/ptvbuild"

echo "📁 Copiando projeto para o Termux..."
rm -rf "$DESTINO"
cp -r "$ORIGEM" "$DESTINO"

cd "$DESTINO" || {
  echo "❌ Erro ao acessar $DESTINO"
  exit 1
}

if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependências..."
  npm install || {
    echo "❌ Erro ao instalar dependências."
    exit 1
  }
fi

echo "Escolha uma opção:"
echo "1) Iniciar app (npm run dev)"
echo "2) Fazer build (npm run build)"

read -p "Digite 1 ou 2: " OPCAO

if [ "$OPCAO" = "1" ]; then
  echo "🚀 Iniciando o app com 'npm run dev'..."
  npm run dev

elif [ "$OPCAO" = "2" ]; then
  echo "🛠️ Executando build com 'npm run build'..."
  npm run build || {
    echo "❌ Erro durante o build."
    exit 1
  }
  echo "📂 Copiando build para $BUILD_DIR..."
  rm -rf "$BUILD_DIR"
  mkdir -p "$BUILD_DIR"
  cp -r dist/* "$BUILD_DIR"

  echo "✅ Build copiado com sucesso para $BUILD_DIR"

else
  echo "❌ Opção inválida. Saindo."
  exit 1
fi
