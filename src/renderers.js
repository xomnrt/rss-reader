import { clear } from './utils';

export function renderForm(_input, value) {
  const input = _input;
  input.value = value;
}

export function renderFeedback(_feedback, i18nextInstance, value, form) {
  const feedback = _feedback;
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

export function renderBlockedElement(value, sendButton) {
  if (value) {
    sendButton.setAttribute('disabled', true);
  } else {
    sendButton.removeAttribute('disabled');
  }
}

export function renderFeeds(feedList, i18nextInstance, value) {
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

export function renderModal(modal, watchedState, value) {
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

export function createLi(post, watchedState, i18nextInstance, ul) {
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
}

export function createPostsContent(postList, i18nextInstance, watchedState) {
  if (watchedState.posts.length === 0) return;

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
    createLi(post, watchedState, i18nextInstance, ul);
  });

  postList.append(ul);
}
