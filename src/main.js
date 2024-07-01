import './scss/styles.scss';
// eslint-disable-next-line no-unused-vars
import * as bootstrap from 'bootstrap';

import i18next from 'i18next';
import watch from './watcher.js';
import { createController, createAnchors } from './controllers.js';
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

export default function main() {
  const i18nextInstance = initTranslation();
  const state = makeModel();
  const [input, form, feedback, sendButton, feedList, postList, modal] = createAnchors();

  const watchedState = watch(state, i18nextInstance, {
    input, feedback, form, sendButton, feedList, postList, modal,
  });

  createController(watchedState, {
    input, form, modal, postList,
  });
}
