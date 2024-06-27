import '../scss/styles.scss';
// eslint-disable-next-line no-unused-vars
import * as bootstrap from 'bootstrap';

import onChange from 'on-change';
import i18next from 'i18next';
import { validate, clear, getRSSFeedFromLink } from './utils.js';

import resources from './locales/index.js';

function addPosts(newPosts, _watchedState) {
  const watchedState = _watchedState;

  const oldPosts = [...watchedState.posts];

  newPosts.forEach((newPost) => {
    const postFromState = oldPosts.find((post) => post.postLink === newPost.postLink);

    if (postFromState === undefined) {
      oldPosts.push(newPost);
    }
  });

  oldPosts.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  watchedState.posts = oldPosts;
}

function main() {
  const i18nextInstance = i18next.createInstance({
    lng: 'ru',
    debug: false,
    resources,
  }, () => {});

  const state = {
    form: {
      value: '',
      feedback: null,
      blocked: false,
    },

    feeds: [],
    posts: [],
    modal: {
      postId: null,
    },
    ui: {
      seenPosts: new Set(),
    },
  };

  const input = document.querySelector('input');
  const form = document.querySelector('form');
  const feedback = document.querySelector('p.feedback');
  const sendButton = form.querySelector('button');
  const feedList = document.getElementById('feedlist');
  const postList = document.getElementById('posts');
  const modal = document.getElementById('modal');

  const watchedState = onChange(state, (path, value) => {
    if (path === 'form.value') {
      input.value = value;
    }

    if (path === 'form.feedback') {
      feedback.textContent = i18nextInstance.t(value);

      switch (value) {
        case 'success_message':
          feedback.classList.remove('text-danger');
          feedback.classList.add('text-success');
          break;

        case 'already_added_url':
        case 'invalid_url':
        case 'invalid_rss_url':
        case 'empty_input':
        case 'network_error':
          form.querySelector('input').classList.add('border', 'border-danger');
          feedback.classList.add('text-danger');
          break;

        default:
          break;
      }
    }

    if (path === 'form.blocked') {
      if (value) {
        sendButton.setAttribute('disabled', true);
      } else {
        sendButton.removeAttribute('disabled');
      }
    }

    if (path === 'feeds') {
      clear(feedList);

      const cardBody = document.createElement('div');
      cardBody.classList.add('card-body');

      const h2 = document.createElement('h2');
      h2.classList.add('card-title', 'h4');
      h2.textContent = i18nextInstance.t('feeds');

      cardBody.append(h2);
      feedList.append(cardBody);

      const ul = document.createElement('ul');
      ul.classList.add('list-group', 'border-0', 'rounded-0');

      value.forEach((feed) => {
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'border-0', 'border-end-0');
        const h3 = document.createElement('h3');
        h3.classList.add('h6', 'm-0');
        h3.textContent = feed.feedName;
        li.append(h3);

        const p = document.createElement('p');
        p.classList.add('m-0', 'small', 'text-black-50');
        p.textContent = feed.feedDescription;
        li.append(p);

        ul.append(li);
      });

      feedList.append(ul);
    }

    if (path === 'posts' || path === 'ui.seenPosts') {
      if (watchedState.posts.length === 0) {
        return;
      }

      clear(postList);

      const cardBody = document.createElement('div');
      cardBody.classList.add('card-body');

      const h2 = document.createElement('h2');
      h2.classList.add('card-title', 'h4');
      h2.textContent = i18nextInstance.t('posts');

      cardBody.append(h2);
      postList.append(cardBody);

      const ul = document.createElement('ul');
      ul.classList.add('list-group', 'border-0', 'rounded-0');

      watchedState.posts.forEach((post) => {
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

        const a = document.createElement('a');
        a.href = post.postLink;
        a.dataset.id = '2';
        a.target = '_blank';
        a.classList.add(watchedState.ui.seenPosts.has(post.postLink) ? 'fw-normal' : 'fw-bold');
        a.rel = 'noopener norefferer';
        a.textContent = post.postTitle;
        li.append(a);

        const button = document.createElement('button');
        button.type = 'button';
        button.classList.add('btn', 'btn-outline-primary', 'btn-sm', 'viewButton');
        button.dataset.id = '2';
        button.dataset.bsToggle = 'modal';
        button.dataset.bsTarget = '#modal';
        button.textContent = i18nextInstance.t('view');
        button.dataset.postId = post.postLink;
        li.append(button);

        ul.append(li);
      });

      postList.append(ul);
    }

    if (path === 'modal.postId') {
      const modalTitle = modal.querySelector('.modal-title');
      const modalDescription = modal.querySelector('.modal-body');
      const fullArticleLink = modal.querySelector('.full-article');

      const post = watchedState.posts.find((p) => p.postLink === value);
      if (post !== undefined) {
        modalTitle.textContent = post.postTitle;
        modalDescription.textContent = post.postDescription;
        fullArticleLink.href = post.postLink;
      }
    }
  });
  // навесить на стейт онченжж
  // на изменение по разным патсх реагировать по разному

  // навесить лисенеры на инпут и переход по ссылкам и модальные тыки

  input.addEventListener('change', () => {
    watchedState.form.value = input.value;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.blocked = true;
    validate(
      watchedState.form.value,
      watchedState.feeds.map((feed) => feed.feedLink),
    ).then((validateResult) => {
      if (validateResult.status === 'success_message') {
        const feed = {
          feedName: validateResult.feed.feedName,
          feedLink: validateResult.feed.feedLink,
          feedDescription: validateResult.feed.feedDescription,
        };
        watchedState.feeds.push(feed);

        addPosts(validateResult.feed.posts, watchedState);
      }

      watchedState.form.feedback = validateResult.status;
      watchedState.form.value = '';
      watchedState.form.blocked = false;
    });
  });

  modal.addEventListener('show.bs.modal', (e) => {
    const button = e.relatedTarget;

    watchedState.ui.seenPosts.add(button.dataset.postId);
    watchedState.modal.postId = button.dataset.postId;
  });

  function updateFeedsRoutine() {
    const updatedFeedsPromises = watchedState
      .feeds.map((feed) => getRSSFeedFromLink(feed.feedLink));

    Promise.all(updatedFeedsPromises).then((updatedFeeds) => {
      const posts = [];
      updatedFeeds.forEach((feed) => {
        posts.push(...feed.posts);
      });

      addPosts(posts, watchedState);
    }).finally(() => {
      setTimeout(updateFeedsRoutine, 5000);
    });
  }

  updateFeedsRoutine();
}

main();
