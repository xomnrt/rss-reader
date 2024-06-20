// import axios from 'axios';
import { set } from 'lodash';
import i18nextInstance from './i18.js';

export function clear(parentElement) {
  while (parentElement.firstChild) {
    parentElement.removeChild(parentElement.lastChild);
  }
}

export function makeRSS(url) {
  return fetch(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
    .then((response) => {
      if (response.ok) return response.json();
      throw new Error('Network response was not ok.');
    })
    .then((data) => {
      const doc = new DOMParser().parseFromString(data.contents, 'application/xml');

      const feedName = doc.querySelector('title').textContent;
      const feedDescription = doc.querySelector('description').textContent;

      const items = doc.querySelectorAll('item');

      const posts = [...items].map((item) => ({
        id: item.querySelector('guid').textContent,
        postTitle: item.querySelector('title').textContent,
        postDescription: item.querySelector('description').textContent,
        postLink: item.querySelector('link').textContent,
        pubDate: new Date(Date.parse(item.querySelector('pubDate').textContent)),
        seen: false,
      }));

      return {
        feedId: doc.querySelector('link').textContent,
        feedName,
        feedDescription,
        posts,
      };
    });
}

export function makeFeed(anchorElement, modalDivElement) {
  const state = {
    rssLinks: [],
    feeds: [],
  };

  modalDivElement.addEventListener('show.bs.modal', (e) => {
    const button = e.relatedTarget;

    state.feeds.forEach((feed) => {
      feed.posts.forEach((post) => {
        if (post.id === button.previousElementSibling.href) {
          post.seen = true;
        }
      });
    });

    button.previousElementSibling.classList.remove('fw-bold');
    button.previousElementSibling.classList.add('fw-normal');

    const modalTitle = modalDivElement.querySelector('.modal-title');
    const modalDescription = modalDivElement.querySelector('.modal-body');
    const fullArticleLink = modalDivElement.querySelector('.full-article');

    state.feeds.forEach((feed) => {
      feed.posts.forEach((post) => {
        if (post.id === button.id) {
          modalTitle.textContent = post.postTitle;
          modalDescription.textContent = post.postDescription;
          fullArticleLink.href = post.postLink;
        }
      });
    });
  });

  const draw = (state) => {
    if (state.feeds.length === 0) {
      return;
    }

    clear(anchorElement);

    const divRow = document.createElement('div');
    divRow.classList.add('row');
    anchorElement.append(divRow);

    const divPosts = document.createElement('div');
    divPosts.classList.add('col-md-10', 'col-lg-8', 'order-1', 'mx-auto', 'posts');

    const cardBorder = document.createElement('div');
    cardBorder.classList.add('card', 'border-0');
    divPosts.append(cardBorder);

    const cardBodyPosts = document.createElement('div');
    cardBodyPosts.classList.add('card-body');
    cardBorder.append(cardBodyPosts);

    const postTitle = document.createElement('h2');
    postTitle.classList.add('card-title', 'h4');
    postTitle.textContent = i18nextInstance.t('posts');
    cardBodyPosts.append(postTitle);

    const postsList = document.createElement('ul');
    postsList.classList.add('list-group', 'border-0', 'rounded-0');
    cardBorder.append(postsList);

    const allPosts = [];
    state.feeds.forEach((feed) => {
      allPosts.push(...feed.posts);
    });

    allPosts.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

    allPosts.forEach((post) => {
      const newLi = document.createElement('li');
      newLi.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

      const a = document.createElement('a');
      a.href = post.postLink;
      if (post.seen) {
        a.classList.add('fw-normal');
      } else {
        a.classList.add('fw-bold');
      }
      a.dataset.id = '2';
      a.target = '_blank';
      a.rel = 'noopener norefferer';
      a.textContent = post.postTitle;

      const button = document.createElement('button');
      button.type = 'button';
      button.classList.add('btn', 'btn-outline-primary', 'btn-sm', 'viewButton');
      button.dataset.id = '2';
      button.dataset.bsToggle = 'modal';
      button.dataset.bsTarget = '#modal';
      button.textContent = i18nextInstance.t('view');
      button.id = post.id;

      newLi.append(a, button);

      postsList.append(newLi);
    });

    postsList.addEventListener('click', (e) => {
      const activeLink = e.target;
      state.feeds.forEach((feed) => {
        feed.posts.forEach((post) => {
          if (post.id === activeLink.href) {
            post.seen = true;
          }
        });
      });
      activeLink.classList.remove('fw-bold');
      activeLink.classList.add('fw-normal');
    });

    const divFeeds = document.createElement('div');
    divFeeds.classList.add('col-md-10', 'col-lg-4', 'mx-auto', 'order-0', 'order-lg-1', 'feeds');
    const cardBorderFeeds = document.createElement('div');
    cardBorderFeeds.classList.add('card', 'border-0');
    divFeeds.append(cardBorderFeeds);

    const cardBodyFeeds = document.createElement('div');
    cardBodyFeeds.classList.add('card-body');
    cardBorderFeeds.append(cardBodyFeeds);

    const feedTitle = document.createElement('h2');
    feedTitle.classList.add('card-title', 'h4');
    feedTitle.textContent = i18nextInstance.t('feeds');
    cardBodyFeeds.append(feedTitle);

    const feedList = document.createElement('ul');
    feedList.classList.add('list-group', 'border-0', 'rounded-0');
    cardBorderFeeds.append(feedList);

    state.feeds.forEach((feed) => {
      const feedLi = document.createElement('li');
      feedLi.classList.add('list-group-item', 'border-0', 'border-end-0');

      const subscribedFeedTitle = document.createElement('h3');
      subscribedFeedTitle.classList.add('h6', 'm-0');
      subscribedFeedTitle.textContent = feed.feedName;

      const subscribedFeedDescription = document.createElement('p');
      subscribedFeedDescription.classList.add('m-0', 'small', 'text-black-50');
      subscribedFeedDescription.textContent = feed.feedDescription;
      feedLi.append(subscribedFeedTitle, subscribedFeedDescription);

      feedList.append(feedLi);
    });

    divRow.append(divPosts, divFeeds);
  };

  function updatePosts(state) {
    const updatedFeedsPromises = [];
    state.rssLinks.forEach((link) => {
      updatedFeedsPromises.push(makeRSS(link));
    });

    Promise.all(updatedFeedsPromises).then((updatedFeeds) => {
      state.feeds.forEach((feed) => {
        const updatedFeed = updatedFeeds.find((updatedFeed) => updatedFeed.feedId === feed.feedId);
        if (updatedFeed === undefined) {
          return;
        }

        updatedFeed.posts.forEach((updatedPost) => {
          const postFromState = feed.posts.find((post) => post.id === updatedPost.id);

          if (postFromState === undefined) {
            feed.posts.push(updatedPost);
          }
        });
      });

      draw(state);
    }).finally(() => {
      setTimeout(() => updatePosts(state), 5000);
    });
  }

  updatePosts(state);

  draw(state);

  return (newLink, newFeed) => {
    state.rssLinks.push(newLink);
    state.feeds.push(newFeed);

    draw(state);
  };
}
