export function getRSSFeedFromLink(url) {
  return fetch(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
    .catch(() => { throw new Error('network_error'); })
    .then((response) => {
      if (response.ok) return response.json();
      throw new Error('network_error');
    })
    .then((data) => {
      try {
        const doc = new DOMParser().parseFromString(data.contents, 'application/xml');

        const items = doc.querySelectorAll('item');

        const posts = [...items].map((item) => ({
          postTitle: item.querySelector('title').textContent,
          postDescription: item.querySelector('description').textContent,
          postLink: item.querySelector('link').textContent,
          pubDate: new Date(Date.parse(item.querySelector('pubDate').textContent)),
          seen: false,
        }));

        return {
          feedId: doc.querySelector('link').textContent,
          feedName: doc.querySelector('title').textContent,
          feedDescription: doc.querySelector('description').textContent,
          posts,
        };
      } catch {
        throw new Error('invalid_rss_url');
      }
    });
}

export function clear(parentElement) {
  while (parentElement.firstChild) {
    parentElement.removeChild(parentElement.lastChild);
  }
}
