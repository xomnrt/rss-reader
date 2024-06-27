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

        const posts = [...items].map((item) => ({
          postTitle: item.querySelector('title').textContent,
          postDescription: item.querySelector('description').textContent,
          postLink: item.querySelector('link').textContent,
          pubDate: new Date(Date.parse(item.querySelector('pubDate').textContent)),
        }));

        return {
          feedLink: url,
          feedName: doc.querySelector('title').textContent,
          feedDescription: doc.querySelector('description').textContent,
          posts,
        };
      } catch {
        throw new Error('invalid_rss_url');
      }
    });
}

export function clear(parentElement) {
  while (parentElement.firstChild) {
    parentElement.removeChild(parentElement.lastChild);
  }
}

export function validate(value, alreadyAddedLinks) {
  const validURL = /^((https?|ftp):\/\/)?(www.)?(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)|\/|\?)*)?$/i;
  const schema = yup.string().matches(validURL).required();

  if (value.length === 0) {
    return Promise.resolve({ status: 'empty_input' });
  }

  try {
    schema.validateSync(value, { abortEarly: false });
  } catch (err) {
    return Promise.resolve({ status: 'invalid_url' });
  }

  if (alreadyAddedLinks.includes(value)) {
    return Promise.resolve({ status: 'already_added_url' });
  }

  return getRSSFeedFromLink(value)
    .then((feed) => ({ status: 'success_message', feed }))
    .catch((e) => ({ status: e.message }));
}
