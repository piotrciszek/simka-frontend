import { Component, input, computed } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { inject } from '@angular/core';

@Component({
  selector: 'app-iframe-viewer',
  standalone: true,
  templateUrl: './iframe-viewer.component.html',
  styleUrl: './iframe-viewer.component.scss',
})
export class IframeViewerComponent {
  src = input.required<string>();

  private sanitizer = inject(DomSanitizer);

  safeUrl = computed(() => this.sanitizer.bypassSecurityTrustResourceUrl(this.src()));

  onIframeLoad(iframe: HTMLIFrameElement): void {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.body.innerHTML = doc.body.innerHTML.replace(/\uFFFD/g, '&nbsp;');

        const base = doc.createElement('base');
        base.target = 'content';
        doc.head.appendChild(base);

        const zoom = window.innerWidth < 500 ? 0.6 : 1.0;
        const style = doc.createElement('style');
        style.textContent = `body { zoom: ${zoom}; }`;
        doc.head.appendChild(style);

        // Dopasowanie wysokość do zawartości
        iframe.style.height = doc.documentElement.scrollHeight + 'px';
      }
    } catch (e) {
      console.warn('Błąd:', e);
    }
  }
}

//copied from https://github.com/piotrciszek/simka-new-open, needs some adjustments to work properly with dark mode and fix some color issues in tables, but it causes some weird bugs in player files, so for now it's better to leave it as is
// need to be reworked to support dark mode and fix some color issues in tables, but it causes some weird bugs in player files, so for now it's better to leave it as is
// onIframeLoad(iframe: HTMLIFrameElement): void {
//     try {
//       const doc = iframe.contentDocument || iframe.contentWindow?.document;
//       if (doc) {
//         doc.body.innerHTML = doc.body.innerHTML.replace(/\uFFFD/g, '&nbsp;');

//         const base = doc.createElement('base');
//         base.target = 'content';
//         doc.head.appendChild(base);

//         const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
//         const style = doc.createElement('style');
//         style.textContent = isDark ? `
//           body { zoom: 0.8; background-color: #12151c !important; color: #dde3f0 !important; }
//           table { background-color: #12151c !important; }
//           td, th { color: #dde3f0 !important; border-color: #2a3045 !important; }
//           td[bgcolor="#800080"], th[bgcolor="#800080"],
//           tr[bgcolor="#800080"] td, tr[bgcolor="#800080"] th {
//             background-color: #1a1f2b !important;
//             color: #e8a020 !important;
//           }
//           tr[bgcolor="#C0C0C0"] td,
//           td[bgcolor="#C0C0C0"] {
//             background-color: #1a1f2b !important;
//             color: #dde3f0 !important;
//           }
//           a { color: #e8a020 !important; }
//           a:visited { color: #c47d0a !important; }
//           hr { border-color: #2a3045 !important; }
//         ` : `
//           body { zoom: 0.8; background-color: #f0f2f5 !important; color: #1a1f2b !important; }

//           /* Nagłówki - wszystkie warianty */
//           td[bgcolor="#800080"], th[bgcolor="#800080"],
//           tr[bgcolor="#800080"] td, tr[bgcolor="#800080"] th {
//             background-color: #c47d0a !important;
//             color: #ffffff !important;
//           }
//           /* Fonty i linki WEWNĄTRZ nagłówków */
//           tr[bgcolor="#800080"] font,
//           td[bgcolor="#800080"] font,
//           tr[bgcolor="#800080"] a,
//           td[bgcolor="#800080"] a {
//             color: #ffffff !important;
//           }

//           /* Naprzemienne wiersze */
//           tr[bgcolor="#C0C0C0"] td,
//           td[bgcolor="#C0C0C0"] {
//             background-color: #e8eaed !important;
//             color: #1a1f2b !important;
//           }

//           /* Tabela z bgcolor - np. nagłówek z nazwiskiem gracza */
//           table[bgcolor="#C0C0C0"] td {
//             background-color: #e8eaed !important;
//             color: #1a1f2b !important;
//           }
//           table[bgcolor="#C0C0C0"] {
//             background-color: #e8eaed !important;
//           }

//           /* Linki */
//           a { color: #c47d0a !important; }
//           a:visited { color: #7a5200 !important; }

//           /* Turkusowe linki z plików player */
//           font[color="#00FFFF"], font[color="#00ffff"] { color: #c47d0a !important; }
//         `;
//         doc.head.appendChild(style);
//       }
//     } catch (e) {
//       console.warn('Błąd:', e);
//     }
//   }
