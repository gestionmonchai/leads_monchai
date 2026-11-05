const origin=document.querySelector('meta[name="bevhive-api-origin"]')?.content||location.origin;
export const apiUrl=path=>new URL(path,origin).href;
