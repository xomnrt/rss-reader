import * as yup from 'yup';

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

        return {
          feedLink: url,
          feedName: doc.querySelector('title').textContent,
          feedDescription: doc.querySelector('description').textContent,
          posts: [...items].map((item) => ({
            postTitle: item.querySelector('title').textContent,
            postDescription: item.querySelector('description').textContent,
            postLink: item.querySelector('link').textContent,
            pubDate: new Date(Date.parse(item.querySelector('pubDate').textContent)),
          })),
        };
      } catch {
        throw new Error('invalid_rss_url');
      }
    });
}

export function validate(value, alreadyAddedLinks) {
  const schema = yup.string().trim().url('invalid_url').required('empty_input')
    .notOneOf([...alreadyAddedLinks], 'already_added_url');

  return schema.validate(value)
    .then(getRSSFeedFromLink)
    .then((feed) => ({ status: 'success_message', feed }))
    .catch((e) => ({ status: e.message }));
}

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

function updateFeedsRoutine(watchedState) {
  const updatedFeedsPromises = watchedState
    .feeds.map((feed) => getRSSFeedFromLink(feed.feedLink));

  Promise.all(updatedFeedsPromises).then((updatedFeeds) => {
    const posts = [];
    updatedFeeds.forEach((feed) => {
      posts.push(...feed.posts);
    });

    addPosts(posts, watchedState);
  })
    .catch((e) => console.log(e))
    .finally(() => {
      setTimeout(() => updateFeedsRoutine(watchedState), 5000);
    });
}

export function createController(watchedState, {
  input, form, modal, postList,
}) {
  createControllerForInput(input, watchedState);
  createControllerForForm(form, watchedState);
  createControllerForLinks(postList, watchedState);
  createControllerForModalWindow(modal, watchedState);
  updateFeedsRoutine(watchedState);
}
