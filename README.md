# Habit Tracker Lo-fi/

Aplicativo mobile (React Native + Expo) focado em produtividade pessoal com uma proposta visual lo-fi.

## Funcionalidades atuais

- **Tasks diárias** com criação, conclusão, favoritar e exclusão.
- **Pomodoro** com fases de foco/pausa e tempos customizáveis.
- **Música lo-fi local** (arquivos MP3 embarcados no app).
- **Diário de progresso** com humor + anotações.
- **Persistência local** usando `AsyncStorage`.

## Stack atual

- **Expo SDK 53**
- **React Native 0.79**
- **TypeScript**
- **React Navigation (Native Stack)**
- **expo-av** (áudio/vídeo)

## Pré-requisitos

Para executar o projeto no estado atual, você precisa ter:

1. **Node.js LTS** (recomendado: 18+)
2. **npm** (já vem com Node)
3. **Expo CLI via npx** (não precisa instalar globalmente)
4. **Um ambiente de execução mobile**, escolhendo uma das opções:
   - **Expo Go** no celular Android/iOS (mais simples)
   - **Android Studio** com emulador Android
   - **Xcode** (somente macOS) para simulador iOS

### Apps/ferramentas úteis

- **VS Code** (opcional, mas recomendado)
- **Git**
- **Expo Go** (caso rode em dispositivo físico)

## Como executar o projeto

### 1) Clonar o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd habit-tracker-lofi
```

### 2) Instalar dependências

```bash
npm install
```

### 3) Iniciar o projeto com Expo

```bash
npm start
```

Isso abrirá o Metro/Expo Dev Tools no terminal.

### 4) Rodar no dispositivo desejado

Com o projeto iniciado, use:

- **Android (emulador/dispositivo):**

  ```bash
  npm run android
  ```

- **iOS (simulador - macOS):**

  ```bash
  npm run ios
  ```

- **Web (ambiente de teste):**

  ```bash
  npm run web
  ```

> Também é possível escanear o QR Code no terminal com o app **Expo Go**.

## Estrutura resumida

```text
.
├─ App.tsx
├─ index.ts
├─ src/
│  ├─ components/
│  ├─ contexts/
│  ├─ navigation/
│  └─ screens/
├─ assets/
├─ app.json
├─ package.json
└─ tsconfig.json
```

## Scripts disponíveis

- `npm start` → inicia Expo
- `npm run android` → abre no Android
- `npm run ios` → abre no iOS
- `npm run web` → abre versão web

## Observações do estado atual

- O projeto está funcional para desenvolvimento com Expo.
- Existem ajustes de tipagem TypeScript a serem refinados em alguns arquivos antes de um pipeline de CI estrito.
- A reprodução musical atual usa arquivos locais `.mp3`) incluídos no app.

## Evolução planejada

Próximas evoluções propostas para o TCC:

- Backend + API própria
- Autenticação com OAuth
- Integração com **Google Calendar**
- Integração com **Spotify** para streaming no lugar de MP3 local

## Contribuição

Como este projeto está sendo evoluído para TCC, mudanças devem priorizar:

- clareza de arquitetura,
- documentação,
- e qualidade técnica para publicação Android/iOS.

## Licença

Licença definida no projeto: **0BSD**.
```

