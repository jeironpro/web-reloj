# web-reloj

Reloj web con un **reloj analógico clásico animado en 3D**, un **temporizador** y un **cronómetro**, construido con **Vite + TypeScript** y **Three.js**.

Este proyecto forma parte de mi portafolio personal. El objetivo es demostrar buenas prácticas de programación, organización, accesibilidad y documentación.

## ✨ Funcionalidades

- **Reloj** — esfera clásica renderizada en 3D (Three.js) con caja de latón, números romanos, tres manecillas animadas en tiempo real y paralaje sutil con el puntero.
- **Temporizador** — cuenta regresiva con horas/minutos/segundos, ajustes rápidos, anillo de progreso y aviso sonoro al terminar.
- **Cronómetro** — precisión de centésimas con pausa, vueltas y detección de la vuelta más rápida.
- **Navbar flotante** con menú hamburguesa en dispositivos móviles.
- **Diseño** inspirado en la skill Hallmark (adaptado): tokens OKLCH, tipografía Fraunces / Inter / JetBrains Mono, escala de espaciado 4pt y soporte de `prefers-reduced-motion`.
- **Accesible**: navegación por teclado, `aria-current`, `aria-expanded`, `aria-live` y anillos de foco visibles.

## 🛠️ Tecnologías

- [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Three.js](https://threejs.org/)
- Google Fonts (Fraunces, Inter, JetBrains Mono)
- GitHub Actions para CI

## 🚀 Puesta en marcha

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Typecheck + build de producción
npm run build

# Previsualizar el build
npm run preview
```

## 📁 Estructura

```
├── index.html            # Shell de la aplicación
├── tokens.css            # Sistema de diseño (colores, tipografía, espaciado, movimiento)
├── src/
│   ├── main.ts           # Punto de entrada y routing entre vistas
│   ├── nav.ts            # Navbar flotante + menú hamburguesa
│   ├── style.css         # Estilos
│   ├── types.ts          # Tipos compartidos
│   └── views/
│       ├── clockView.ts      # Reloj analógico en Three.js
│       ├── timerView.ts      # Temporizador
│       └── stopwatchView.ts  # Cronómetro
└── .github/workflows/ci.yml  # CI (npm ci + npm run build)
```

## 📜 Licencia

Este proyecto está bajo la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.
