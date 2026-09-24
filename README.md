# CURSAR · Panel de administración web

Gestión para la app móvil CURSAR: usuarios, ofertas, instituciones, tags, avisos, soporte y test vocacional.

Vanilla JS + Firebase (Authentication, Firestore) + Chart.js. Sin dependencias externas.

## Levantar en local

No requiere instalación (Node >= 14):

```bash
node dev.js
```

Abrir `http://localhost:8090`. Para otro puerto: `node dev.js 8080`.

## Deploy a Firebase Hosting

```bash
npm install -g firebase-tools   # una sola vez
firebase login                  # una sola vez
firebase deploy                 # hosting + firestore rules
```

La web queda publicada en el proyecto `proyecto-app-a77c8`:

- `https://proyecto-app-a77c8.web.app`
- `https://proyecto-app-a77c8.firebaseapp.com`

Solo reglas: `firebase deploy --only firestore:rules`.

## Alta de administradores

El acceso al panel está limitado a cuentas con `rol: "admin"` en `usuarios/{uid}`.

- **Desde Firebase Console:** `Authentication` → crear usuario; luego en `Firestore` → `usuarios/{uid}` → `rol: "admin"`.
- La web tiene registro deshabilitado por defecto. Si en algún momento se habilita (`permitirRegistro` en `js/config/firebase-config.js`), registrar una cuenta la crea con rol admin como primer paso de setup, y conviene volver a desactivarlo después.

## Estructura

```
css/                Estilos
js/
  config/           Config de Firebase
  controllers/      Lógica por módulo + router
  models/           Acceso a Firestore (BaseModel + modelos)
  state/            Estado global de la sesión
  utils/            Helpers y export CSV
  views/            Vistas HTML (auth, layout, CRUD, dashboard)
assets/             Imágenes y recursos
dev.js              Servidor de desarrollo local (sin dependencias)
firebase.json       Config de Firebase Hosting
firestore.rules     Security Rules de Firestore
```