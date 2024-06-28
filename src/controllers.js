import { validate } from './utils.js';

export function addPosts(newPosts, _watchedState) {
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

export function createAnchors() {
  const input = document.querySelector('input');
  const form = document.querySelector('form');
  const feedback = document.querySelector('p.feedback');
  const sendButton = form.querySelector('button');
  const feedList = document.getElementById('feedlist');
  const postList = document.getElementById('posts');
  const modal = document.getElementById('modal');

  return [input, form, feedback, sendButton, feedList, postList, modal];
}

function createControllerForForm(form, _watchedState) {
  const watchedState = _watchedState;
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
}

function createControllerForModalWindow(modal, _watchedState) {
  const watchedState = _watchedState;

  modal.addEventListener('show.bs.modal', (e) => {
    const button = e.relatedTarget;

    watchedState.ui.seenPosts.add(button.dataset.postId);
    watchedState.modal.postId = button.dataset.postId;
  });
}

function createControllerForLinks(postList, watchedState) {
  postList.addEventListener('click', (e) => {
    if (e.target.nodeName !== 'A') {
      return;
    }

    const currentActiveLink = e.target;
    watchedState.ui.seenPosts.add(currentActiveLink.href);
  });
}

function createControllerForInput(input, _watchedState) {
  const watchedState = _watchedState;
  input.addEventListener('change', () => {
    watchedState.form.value = input.value;
  });
}

export function createController(watchedState, {
  input, form, modal, postList,
}) {
  createControllerForInput(input, watchedState);
  createControllerForForm(form, watchedState);
  createControllerForLinks(postList, watchedState);
  createControllerForModalWindow(modal, watchedState);
}
