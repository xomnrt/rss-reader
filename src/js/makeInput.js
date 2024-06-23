import * as yup from 'yup';
import { clear, getRSSFeedFromLink } from './utils.js';
import i18nextInstance from './i18.js';

function validate(value, alreadyAddedLinks) {
  const validURL = /^((https?|ftp):\/\/)?(www.)?(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
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
    .then((feed) => ({ status: 'ok', feed }))
    .catch((e) => { console.log(e); return { status: e.message }; });
}

function draw(state, anchorElement, onValidationSuccess) {
  clear(anchorElement);

  const { h1, p1, p2 } = createHeaderMessages();

  const form = createForm(state, onValidationSuccess, anchorElement);

  const errorStatement = document.createElement('p');
  errorStatement.classList.add('feedback', 'm-0', 'position-absolute', 'small');

  anchorElement.append(h1, p1, form, p2, errorStatement);

  switch (state.error) {
    case 'ok':
      errorStatement.classList.remove('text-danger');
      errorStatement.classList.add('text-success');
      errorStatement.textContent = i18nextInstance.t('success_message');
      break;

    case 'already_added_url':
    case 'invalid_url':
    case 'invalid_rss_url':
    case 'empty_input':
    case 'network_error':
      form.querySelector('input').classList.add('border', 'border-danger');
      errorStatement.classList.add('text-danger');
      errorStatement.textContent = i18nextInstance.t(state.error);
      break;

    default:
      break;
  }
}

function createHeaderMessages() {
  const h1 = document.createElement('h1');
  h1.textContent = i18nextInstance.t('header');
  h1.classList.add('display-3', 'mb-0', 'text-white');

  const p1 = document.createElement('p');
  p1.textContent = i18nextInstance.t('starting_phrase');
  p1.classList.add('lead', 'text-white');

  const p2 = document.createElement('p');
  p2.classList.add('mt-2', 'mb-0', 'text-white-50');
  p2.textContent = i18nextInstance.t('example');
  return { h1, p1, p2 };
}

function createFormEventListener(state, onValidationSuccess, anchorElement) {
  return (e) => {
    e.preventDefault();
    const form = e.target;
    const button = form.querySelector('button');
    button.setAttribute('disabled', true);
    const valueToCheck = form.querySelector('input').value.trim();

    validate(valueToCheck, state.alreadyUsedRss).then((validationResult) => {
      button.removeAttribute('disabled');
      state.error = validationResult.status;
      if (validationResult.status === 'ok') {
        state.alreadyUsedRss.push(valueToCheck);
        onValidationSuccess(valueToCheck, validationResult.feed);
      }
      form.reset();
      form.focus();
      draw(state, anchorElement, onValidationSuccess);
    });
  };
}

function createForm(state, onValidationSuccess, anchorElement) {
  const form = document.createElement('form');
  form.setAttribute('action', '');
  form.classList.add('rss-form', 'text-body');
  form.addEventListener('submit', createFormEventListener(state, onValidationSuccess, anchorElement));

  const row = document.createElement('div');
  row.classList.add('row');

  const col = document.createElement('div');
  col.classList.add('col');
  col.append(createFormFloating());

  const colAuto = document.createElement('div');
  colAuto.classList.add('col-auto');

  const button = document.createElement('button');
  button.type = 'submit';
  button['aria-label'] = 'add';
  button.classList.add('h-100', 'btn', 'btn-lg', 'btn-info', 'px-sm-5', 'text-white');
  button.textContent = i18nextInstance.t('add');
  colAuto.append(button);

  row.append(col, colAuto);

  form.append(row);

  return form;
}

function createFormFloating() {
  const formFloating = document.createElement('div');
  formFloating.classList.add('form-floating');

  const input = document.createElement('input');
  input.classList.add('form-control', 'w-100');
  input.id = 'url-input';
  input.autofocus = true;
  input.required = true;
  input.name = 'url';
  input.setAttribute('aria-label', 'url');
  input.placeholder = i18nextInstance.t('link');
  input.autocomplete = 'off';
  input.removeAttribute('required');

  const label = document.createElement('label');
  label.setAttribute('for', 'url-input');
  label.textContent = i18nextInstance.t('link');

  formFloating.append(input, label);
  return formFloating;
}

export default function makeInput(anchorElement, onValidationSuccess) {
  const state = {
    alreadyUsedRss: [],
    error: undefined,
  };

  draw(state, anchorElement, onValidationSuccess);
}
