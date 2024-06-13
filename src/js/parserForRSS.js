// import axios from 'axios';

export default function makeRSS(url) {
  return fetch(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
    .then((response) => {
      if (response.ok) return response.json();
      throw new Error('Network response was not ok.');
    })
    .then((data) => {
      const doc = new DOMParser().parseFromString(data.contents, 'application/xml');
      console.log(doc);

      const feedName = doc.querySelector('title').textContent;
      const feedDescription = doc.querySelector('description').textContent;

      const postTitle = doc.querySelector('item > title').textContent;
      const postDescription = doc.querySelector('item > description').textContent;
      const postLink = doc.querySelector('item > guid').textContent;

      const feeds = [];
      feeds.push({
        feedName,
        feedDescription,
        posts: {
          postTitle,
          postDescription,
          postLink,
        },
      });

      console.log(feeds);

      return feeds;
    });
}
