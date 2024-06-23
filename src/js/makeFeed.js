import { getRSSFeedFromLink, clear } from './utils.js';
import i18nextInstance from './i18.js';

// https://ru.hexlet.io/lessons.rss

function makeModalWindow(modalDivElement, state) {
  modalDivElement.addEventListener('show.bs.modal', (e) => {
    const button = e.relatedTarget;

    button.previousElementSibling.classList.remove('fw-bold');
    button.previousElementSibling.classList.add('fw-normal');

    const modalTitle = modalDivElement.querySelector('.modal-title');
    const modalDescription = modalDivElement.querySelector('.modal-body');
    const fullArticleLink = modalDivElement.querySelector('.full-article');

    state.feeds.forEach((feed) => {
      const post = feed.posts.find((post) => post.postLink === button.previousElementSibling.href);
      if (post !== undefined) {
        post.seen = true;
        modalTitle.textContent = post.postTitle;
        modalDescription.textContent = post.postDescription;
        fullArticleLink.href = post.postLink;
      }
    });
  });
}

function createLayout(anchorElement) {
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

  const divFeeds = document.createElement('div');
  divRow.append(divPosts, divFeeds);

  return [divFeeds, cardBorder];
}

function fillPostsList(state, cardBorder) {
  const postsList = document.createElement('ul');
  postsList.classList.add('list-group', 'border-0', 'rounded-0');
  cardBorder.append(postsList);

  const allPosts = [];
  state.feeds.forEach((feed) => {
    allPosts.push(...feed.posts);
  });

  allPosts.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  allPosts.forEach((post) => {
    const newLi = postToListItem(post);

    postsList.append(newLi);
  });

  postsList.addEventListener('click', (e) => {
    const activeLink = e.target;
    state.feeds.forEach((feed) => {
      feed.posts.forEach((post) => {
        if (post.postLink === activeLink.href) {
          post.seen = true;
        }
      });
    });
    activeLink.classList.remove('fw-bold');
    activeLink.classList.add('fw-normal');
  });
}

function postToListItem(post) {
  const newLi = document.createElement('li');
  newLi.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

  const a = document.createElement('a');
  a.href = post.postLink;
  a.classList.add(post.seen ? 'fw-normal' : 'fw-bold');
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
  button.id = post.postLink;

  newLi.append(a, button);
  return newLi;
}

function fillFeedsList(state, divFeeds) {
  const feedList = createFeedList(divFeeds);

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
}

function createFeedList(divFeeds) {
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
  return feedList;
}

function draw(state, anchorElement) {
  if (state.feeds.length === 0) {
    return;
  }

  clear(anchorElement);

  const [divFeeds, cardBorder] = createLayout(anchorElement);
  fillPostsList(state, cardBorder);
  fillFeedsList(state, divFeeds);
}

function startUpdatePostsRoutine(state, anchorElement) {
  const updatedFeedsPromises = state.rssLinks.map((link) => getRSSFeedFromLink(link));

  Promise.all(updatedFeedsPromises).then((updatedFeeds) => {
    state.feeds.forEach((feed) => {
      const updatedFeed = updatedFeeds.find((updatedFeed) => updatedFeed.feedId === feed.feedId);
      if (updatedFeed === undefined) {
        return;
      }

      updatedFeed.posts.forEach((updatedPost) => {
        const postFromState = feed.posts.find((post) => post.postLink === updatedPost.postLink);

        if (postFromState === undefined) {
          feed.posts.push(updatedPost);
        }
      });
    });

    draw(state, anchorElement);
  }).finally(() => {
    setTimeout(() => startUpdatePostsRoutine(state, anchorElement), 5000);
  });
}

export function makeFeed(anchorElement, modalDivElement) {
  const state = {
    rssLinks: [],
    feeds: [],
  };

  makeModalWindow(modalDivElement, state);

  startUpdatePostsRoutine(state, anchorElement);

  draw(state, anchorElement);

  return (newLink, newFeed) => {
    state.rssLinks.push(newLink);
    state.feeds.push(newFeed);

    draw(state, anchorElement);
  };
}
