import './scss/styles.scss';
// eslint-disable-next-line no-unused-vars
import * as bootstrap from 'bootstrap';

import onChange from 'on-change';
import i18next from 'i18next';
import {
  createPostsContent, renderFeedback, renderFeeds, renderModal, renderBlockedElement, renderForm,
} from './renderers.js';
import { createController, createAnchors, addPosts } from './controllers.js';
import { getRSSFeedFromLink } from './utils.js';
import resources from './locales/index.js';

function initTranslation() {
  return i18next.createInstance({
    lng: 'ru',
    debug: false,
    resources,
  }, () => {});
}

function makeModel() {
  return {
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
}

function updateFeedsRoutine(watchedState) {
  const updatedFeedsPromises = watchedState
    .feeds.map((feed) => getRSSFeedFromLink(feed.feedLink));

  Promise.all(updatedFeedsPromises).then((updatedFeeds) => {
    const posts = [];
    updatedFeeds.forEach((feed) => {
      posts.push(...feed.posts);
    });

    addPosts(posts, watchedState);
  }).finally(() => {
    setTimeout(() => updateFeedsRoutine(watchedState), 5000);
  });
}

export default function main() {
  const i18nextInstance = initTranslation();
  const state = makeModel();
  const [input, form, feedback, sendButton, feedList, postList, modal] = createAnchors();

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'form.value':
        return renderForm(input, value);
      case 'form.feedback':
        return renderFeedback(feedback, i18nextInstance, value, form);
      case 'form.blocked':
        return renderBlockedElement(value, sendButton);
      case 'feeds':
        return renderFeeds(feedList, i18nextInstance, value);
      case 'posts':
      case 'ui.seenPosts':
        return createPostsContent(postList, i18nextInstance, watchedState);
      case 'modal.postId':
        return renderModal(modal, watchedState, value);

      default:
        throw new Error(`unknown path! ${path}`);
    }
  });

  createController(watchedState, {
    input, form, modal, postList,
  });

  updateFeedsRoutine(watchedState);
}
