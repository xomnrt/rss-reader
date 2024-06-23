import '../scss/styles.scss';
// eslint-disable-next-line no-unused-vars
import * as bootstrap from 'bootstrap';

import makeInput from './makeInput.js';
import makeFeed from './makeFeed.js';

export default () => {
  const addLinkToFeed = makeFeed(document.getElementById('newsContainer'), document.getElementById('modal'));
  makeInput(document.getElementById('header'), (newLink, newFeed) => {
    addLinkToFeed(newLink, newFeed);
  });
};
