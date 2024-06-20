import '../scss/styles.scss';
import * as bootstrap from 'bootstrap';

import makeInput from './makeInput.js';
import { makeFeed } from './makeFeed.js';

const addLinkToFeed = makeFeed(document.getElementById('newsContainer'), document.getElementById('modal'));
makeInput(document.getElementById('header'), (newLink, newFeed) => {
  addLinkToFeed(newLink, newFeed);
});
