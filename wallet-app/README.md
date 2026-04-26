# wallet-app

Aplicación móvil del lado del **usuario** de City Wallet (la "billetera de Mia").
Hermana de [`store-app`](../store-app) (lado merchant) y consumidora del backend en [`app-services`](../app-services).

Construida con **Expo SDK 54** (React Native 0.81 + React 19 + new architecture)
y **Expo Router** (file-based, igual que Next.js).

---

## Stack

| Capa | Lib |
|---|---|
| Framework | Expo SDK 54 + React Native 0.81 |
| Routing | Expo Router 6 (file-based) |
| Estilos | NativeWind v4 (Tailwind para RN) + StyleSheet |
| Push | `expo-notifications` (FCM en Android, APNs en iOS) |
| Geo | `expo-location` |
| Animación | `react-native-reanimated` 4 |
| Build | EAS Build (cloud, no necesitás Xcode/Android Studio configurado) |

---

## Estructura

```
wallet-app/
├── app/                      # File-based routes
│   ├── _layout.tsx           # Root: stack + providers + push hook
│   ├── (tabs)/
│   │   ├── _layout.tsx       # Tab nav (Today / Map / Wallet / Profile)
│   │   ├── index.tsx         # Home: oferta del momento
│   │   ├── map.tsx           # Density en vivo desde app-services
│   │   ├── wallet.tsx        # Historial de redenciones
│   │   └── profile.tsx       # Identidad, GDPR, push token
│   ├── offer/[id].tsx        # Detalle de oferta (modal)
│   └── redeem/[id].tsx       # QR / token de canje
├── components/
│   ├── OfferCard.tsx         # Card hero con countdown
│   ├── ContextStrip.tsx      # Pills de señales contextuales
│   └── Button.tsx            # Botón con haptics
├── hooks/
│   ├── useNotifications.ts   # Permisos + registro de push token + tap-handler
│   └── useLocation.ts        # Permisos + coords (fallback Stuttgart)
├── lib/
│   ├── api.ts                # Cliente tipado de app-services
│   ├── theme.ts              # Tokens de diseño
│   └── mockOffers.ts         # Demo offers hasta que conectemos GenAI
├── app.json                  # Config Expo (plugins, permisos, scheme)
├── tailwind.config.js
├── metro.config.js           # NativeWind transformer
└── babel.config.js           # NativeWind preset
```

---

## Setup inicial (una sola vez)

### 1. Dependencias en tu Mac

```bash
node -v   # Node 20+ (ya tenés 24, perfecto)
```

Expo CLI no necesita instalación global — usamos `npx`.

### 2. Instalar dependencias del proyecto

```bash
cd wallet-app
npm install
```

### 3. Cuenta de Expo (gratuita)

Necesaria para push reales y EAS Build. Las **notificaciones locales** funcionan sin login.

```bash
npx expo login
```

---

## Cómo correrlo en tu local

Hay 3 caminos según qué necesites probar:

### Camino A · Expo Go (más rápido, recomendado para iterar UI)

**Requiere:** instalar la app **Expo Go** en tu iPhone (App Store) o Android (Play Store).

```bash
# 1. levantá el backend en otra terminal
cd ../app-services && npm run dev   # http://localhost:4000

# 2. levantá Metro
cd wallet-app
npm start
```

Te muestra un QR. Escaneá:

- **iOS:** con la app Cámara nativa → te abre Expo Go.
- **Android:** dentro de Expo Go → "Scan QR".

> **Nota sobre `localhost`:** el dispositivo no resuelve `localhost` del Mac.
> Cambiá `apiBaseUrl` en `app.json` por la IP LAN de tu Mac, ej: `http://192.168.1.42:4000`.
> Para encontrarla: `ipconfig getifaddr en0` (Wi-Fi) o `ipconfig getifaddr en1` (cable).

**Limitaciones de Expo Go:**

- Las **notificaciones push remotas funcionan**, pero el token usa el proyecto público de Expo. Para producción usás EAS.
- No podés agregar módulos nativos custom (Notifee con layouts custom, Live Activities iOS). Para eso → Camino B.

### Camino B · Dev Client (para features nativas custom)

Cuando quieras Live Activities (Dynamic Island), Notifee con layouts Android totalmente custom, o cualquier módulo nativo no-Expo:

```bash
# 1. configurar EAS (una sola vez por proyecto)
npx eas-cli login
npx eas-cli build:configure

# 2. generar dev client
npx eas-cli build --profile development --platform ios
npx eas-cli build --profile development --platform android

# 3. instalar el .ipa / .apk que entrega EAS en tu device
# 4. levantar Metro y abrir tu dev client (en lugar de Expo Go)
npm start --dev-client
```

### Camino C · Build de producción (para el demo final)

```bash
npx eas-cli build --profile preview --platform ios
npx eas-cli build --profile preview --platform android
```

EAS te entrega un link → instalás vía TestFlight (iOS) o APK directo (Android).

---

## Probar notificaciones

### Push remoto (device físico)

1. Asegurate de estar en un **dispositivo real** (los simuladores no reciben push remoto).
2. Abrí la tab **Profile**: vas a ver tu **Expo push token**.
3. Mandá la push desde tu Mac:

```bash
curl -X POST https://exp.host/--/api/v2/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "ExponentPushToken[xxx]",
    "title": "Cold outside? Your cappuccino is waiting.",
    "body": "20% off cappuccino at Café Müller, 250 m away.",
    "data": { "offerId": "off_cappuccino_mueller" },
    "categoryId": "offer",
    "sound": "default"
  }'
```

Flujo real (próxima iteración): `app-services` detecta `isQuiet === true` → genera oferta → llama a Expo Push API con el token guardado del usuario → Mia ve la notificación.

---

## Personalización del estilo de las notificaciones

**Resumen honesto:**

| Plataforma | Sí podés | NO podés |
|---|---|---|
| **iOS** | Texto, sonido, badge, imagen/video adjunto, botones de acción, vista expandida custom (Notification Content Extension), **Live Activities** (Dynamic Island) | Re-skinear la "burbuja" base de la lock screen |
| **Android** | Layouts completos custom (RemoteViews / Notifee), íconos, colores, sonidos por canal, expandible, media controls | Casi nada está bloqueado |

**Estrategia para el demo:**

1. La **notificación push** es solo el gatillo. La estética rica vive **dentro de la app** (pantalla `offer/[id]`).
2. iOS wow-factor: **Live Activity** — countdown vivo en Dynamic Island ("12 min · €1.50 off"). Requiere dev client + módulo (`@expo/live-activity` o config plugin custom).
3. Android: cuando quieras layouts custom, sumá [`@notifee/react-native`](https://notifee.app/).

Lo dejé fuera por defecto para no forzarte al dev client el día 1.

---

## Conectar al backend `app-services`

`lib/api.ts` lee la URL desde `app.json → expo.extra.apiBaseUrl`, con fallback a `EXPO_PUBLIC_API_BASE_URL` y a `http://localhost:4000`.

Para cambiarla rápido sin tocar `app.json`:

```bash
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.42:4000 npm start
```

Endpoints que ya consume el cliente tipado:

- `GET /api/transactions/density` — pantalla **Map**
- `GET /api/weather` — listo para usar en **Today**
- `GET /api/merchants/nearby` — listo para usar
- `POST/DELETE /api/transactions/scenario` — para forzar quiet en demos

---

## Scripts

```bash
npm start          # Metro + QR para Expo Go
npm run ios        # Metro + abre simulador iOS
npm run android    # Metro + abre emulador Android
npm run web        # Versión web (utilidad limitada para nuestro caso)
npm run lint
```

---

## Próximos pasos

- Reemplazar `mockOffers` por una llamada al GenAI engine.
- Agregar `react-native-maps` para que **Map** muestre pins reales.
- QR real con `react-native-qrcode-svg` en `redeem/[id]`.
- Live Activity de iOS con countdown ("12 min para canjear").
- Onboarding con consent GDPR explícito + setup del SLM on-device (Phi-3 / Gemma).
