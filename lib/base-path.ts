/**
 * Todo o app fica sob /forms (basePath no next.config.ts), para rodar dentro de
 * www.linkamidia.com.br/forms/... via rewrite do site da Linka.
 * `Link` e `redirect()` já somam o /forms sozinhos; `<a>`, `<img>` e `fetch()` precisam de `withBase()`.
 */
export const BASE_PATH = "/forms";

export const withBase = (path: string) => `${BASE_PATH}${path === "/" ? "" : path}`;
