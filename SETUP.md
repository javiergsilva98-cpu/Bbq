# Plantilla de invitación con scroll-scrubbing

Web de invitación de una sola página, estilo Apple/Reels, donde **el scroll
controla el tiempo de un vídeo** (scroll-scrubbing) en vez de reproducirse
solo. El vídeo llena el fondo durante todo el scroll y encima van apareciendo
y desapareciendo "escenas" de texto sincronizadas con el progreso.

**Stack:** Vite + React + GSAP (ScrollTrigger) + Lenis. Sin backend. Deploy en
Vercel conectado a GitHub (una rama = producción).

---

## Cómo arrancar un proyecto nuevo (por evento)

### 1. Crear el repositorio
- github.com → **New repository** → nombre en minúsculas y guiones
  (`bbq-boda-ana`), con README → Create.
- **Atajo:** marca este repo como *Template repository* (Settings) y usa
  **Use this template → Create a new repository** para clonar todo el código
  ya funcionando. El original no se toca.

### 2. Abrir un chat nuevo de Claude sobre ese repo
- Pégale el **PROMPT** (ver abajo).
- Sube el vídeo como **adjunto** (no pegado en el mensaje).
- Indícale la **rama** de trabajo.
- Personaliza: título, fecha, textos, enlaces de botones, icono.
- Como es otro repo, este proyecto nunca se pisa.

### 3. Conectar Vercel
- vercel.com → **Add New → Project** → importa el repo.
  - Si no aparece: github.com/settings/installations → Vercel → **Configure**
    → dale acceso al repo.
- Vercel detecta Vite solo → **Deploy**.
- **Production Branch:** Settings → Environments → Production → pon la rama.
- **Quitar login:** Settings → Deployment Protection → Vercel Authentication →
  **Off**.
- **URL bonita:** Domains → Add → `nombreevento.vercel.app`.

### 4. Flujo de trabajo
- Claude push a su rama → Vercel crea un **preview** automático.
- Cuando esté listo: le dices **"publica"** → merge a `main` → URL oficial.
- Refrescar preview de WhatsApp: developers.facebook.com/tools/debug/ → pega
  la URL → **Scrape Again**.

---

## PROMPT para el chat nuevo

> Quiero crear una web de invitación cinemática de una sola página, estilo
> Apple/Instagram Reels, donde **el scroll controla el tiempo de un vídeo**
> (scroll-scrubbing) en vez de reproducirse solo. Voy a subirte un vídeo
> vertical.
>
> **Stack:** Vite + React + GSAP (con ScrollTrigger) + Lenis (smooth scroll).
> Sin backend. Deploy en Vercel conectado a GitHub (rama = producción).
>
> **Concepto:** el vídeo ocupa el fondo durante todo el scroll. Encima aparecen
> y desaparecen "escenas" de texto por fases, sincronizadas con el progreso del
> scroll (título → detalles → cierre con botones). Al final, botones de acción
> (WhatsApp/mapa/Instagram, te los daré).
>
> **REQUISITOS TÉCNICOS CRÍTICOS — hazlos desde el principio:**
> 1. **El vídeo DEBE re-codificarse sin B-frames** (`-bf 0`) y con keyframes
>    densos (`-g 8`), H.264 High, Level ≤ 4.2, `yuv420p`, `+faststart`. Los
>    B-frames hacen que el scrubbing falle en iOS Safari (fotograma en negro al
>    saltar). Interpola a 60fps (`minterpolate`) para que el movimiento lento
>    sea fluido.
> 2. **Un solo `<source>` mp4.** Nada de webm/VP9: Chrome lo prefiere y sus
>    "alt-ref frames" rompen el seeking igual que los B-frames.
> 3. **Poster como fondo CSS detrás del `<video>`** (no solo el atributo
>    `poster`): iOS borra el poster del vídeo al hacer seek y deja negro si no
>    decodifica. La capa CSS nunca se borra → nunca hay fondo negro.
> 4. **Nombra los archivos con versión** (`hero-v1.mp4`) para evitar caché
>    agresiva de Chrome al recodificar.
> 5. **Mobile-first:** usa `svh`/`lvh` (no `vh`),
>    `ScrollTrigger.config({ ignoreMobileResize: true })`,
>    `overscroll-behavior-y: none`, y "primar" el vídeo con `play()`+`pause()`
>    para que iOS permita el scrubbing.
> 6. **Imán de scroll (snap) a través de Lenis**, no el snap nativo de
>    ScrollTrigger (se pelean). Detecta que el scroll paró por **posición**
>    (ticks <3px no cuentan), no por velocidad, o el imán tarda ~1s en iOS.
>    Animación del imán 0.25–0.5s con easeInOutCubic.
> 7. **En escritorio**, el vídeo vertical va con letterbox: columna centrada +
>    fondo difuminado del propio poster (no `object-fit: cover` que recorta
>    demasiado).
> 8. **Deps del `useEffect` estables** (mueve arrays de sources a constantes de
>    módulo).
> 9. **Iconos:** `apple-touch-icon` (180px) para iOS y `manifest.webmanifest`
>    con iconos 192/512 para Android. Meta OG/Twitter con imagen 1200×630 para
>    la preview de WhatsApp.
>
> Monta la estructura, el componente de scroll-scrubbing reutilizable, y las
> escenas. Iremos personalizando contenido después. Verifica en emulación de
> iPhone/Android/desktop.

---

## Comandos de referencia

Re-codificar el vídeo para scrubbing (desde el original vertical):

```bash
# mp4 sin B-frames, keyframes densos, 60fps interpolado
ffmpeg -i original.mov -an \
  -vf "minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:vsbmc=1,format=yuv420p" \
  -c:v libx264 -preset slow -crf 18 -profile:v high -level 4.1 \
  -bf 0 -g 8 -keyint_min 8 -sc_threshold 0 -movflags +faststart \
  public/video/hero-v1.mp4

# poster (primer frame)
ffmpeg -i public/video/hero-v1.mp4 -frames:v 1 -q:v 4 public/video/hero-poster-v1.jpg

# comprobar que NO hay B-frames (debe dar 0)
ffprobe -v error -select_streams v -show_frames -show_entries frame=pict_type \
  -of csv=p=0 public/video/hero-v1.mp4 | grep -c "^B"
```

Desarrollo local:

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/
```
