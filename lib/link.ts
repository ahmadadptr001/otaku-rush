function filterAnimeLink(fullUrl: string): string {
  const url = new URL(fullUrl);
  const segments = url.pathname.split('/');
  const filteredPath = segments.slice(0, 4).join('/'); // ambil sampai /anime/:id/:slug
  return `${url.origin}${filteredPath}`;
}

export { filterAnimeLink }
