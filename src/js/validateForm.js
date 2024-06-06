import _ from 'lodash';
import * as yup from 'yup';
// import onChange from 'on-change';
// import axios from 'axios';

const alreadyAddedUrls = [];

const validURL = /^((https?|ftp):\/\/)?(www.)?(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;

const schema = yup.string().matches(validURL).required('please enter url');

const validate = (url) => {
  try {
    schema.validateSync(url, { abortEarly: false });
    return {};
  } catch (err) {
    return _.keyBy(err.inner, 'path');
  }
};

export default function validateInput() {
  const formEl = document.querySelector('form');
  const inputEl = document.querySelector('input');
  const additionalInfo = document.querySelector('.feedback');
  const button = document.querySelector('button[type="submit"]');

  formEl.addEventListener('input', (e) => {
    e.preventDefault();
    const inputUrl = inputEl.value.trim();

    if (_.isEmpty(validate(inputUrl))) {
      // console.log('VALIDATION SUCCESS');
      button.removeAttribute('disabled', 'false');
      additionalInfo.textContent = '';
    } else {
      console.log(validate(inputUrl));
      // console.log('VALIDATION ERROR');
      button.setAttribute('disabled', 'true');
      additionalInfo.classList.add('text-danger');
      additionalInfo.textContent = 'Please enter a valid URL';
    }
  });

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputUrl = inputEl.value.trim();

    if (!alreadyAddedUrls.includes(inputUrl)) {
      alreadyAddedUrls.push(inputUrl);
      additionalInfo.textContent = 'Success! URL was added';
      additionalInfo.classList.remove('text-danger');
    } else {
      additionalInfo.classList.add('text-danger');
      additionalInfo.textContent = 'Error! This URL is already added';
    }
  });
}
