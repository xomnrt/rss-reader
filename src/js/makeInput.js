import _ from 'lodash';
import * as yup from 'yup';
import { makeRSS, clear } from './makeFeed.js';
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

  return makeRSS(value)
    .then((feed) => ({ status: 'ok', feed }))
    .catch(() => ({ status: 'invalid_rss_url' }));
}

export default function makeInput(anchorElement, onValidationSuccess) {
  const state = {
    alreadyUsedRss: [],
    error: undefined,
    filled: false,
  };

  function draw(state) {
    clear(anchorElement);

    const form = document.createElement('form');
    const input = document.createElement('input');
    const errorStatement = document.createElement('p');

    const h1 = document.createElement('h1');
    h1.textContent = i18nextInstance.t('header');
    h1.classList.add('display-3', 'mb-0', 'text-white');

    const p1 = document.createElement('p');
    p1.textContent = i18nextInstance.t('starting_phrase');
    p1.classList.add('lead', 'text-white');

    form.setAttribute('action', '');
    form.classList.add('rss-form', 'text-body');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const button = form.querySelector('button');
      button.setAttribute('disabled', true);
      const valueToCheck = input.value.trim();
      state.filled = true;

      validate(valueToCheck, state.alreadyUsedRss).then((validationResult) => {
        button.removeAttribute('disabled');
        state.error = validationResult.status;

        if (validationResult.status === 'ok') {
          state.alreadyUsedRss.push(valueToCheck);
          onValidationSuccess(valueToCheck, validationResult.feed);
        }

        form.reset();
        form.focus();

        draw(state);
      });
    });

    const p2 = document.createElement('p');
    p2.classList.add('mt-2', 'mb-0', 'text-white-50');
    p2.textContent = i18nextInstance.t('example');

    errorStatement.classList.add('feedback', 'm-0', 'position-absolute', 'small', 'text-danger');

    anchorElement.append(h1, p1, form, p2, errorStatement);

    const row = document.createElement('div');
    row.classList.add('row');
    form.append(row);

    const col = document.createElement('div');
    col.classList.add('col');
    const colAuto = document.createElement('div');
    colAuto.classList.add('col-auto');

    row.append(col, colAuto);

    const formFloating = document.createElement('div');
    formFloating.classList.add('form-floating');
    col.append(formFloating);
    input.classList.add('form-control', 'w-100');
    input.id = 'url-input';
    input.autofocus = true;
    input.required = true;
    input.name = 'url';
    input['aria-label'] = 'url';
    input.placeholder = i18nextInstance.t('link');
    input.autocomplete = 'off';
    input.removeAttribute('required');

    const label = document.createElement('label');
    label.setAttribute('for', 'url-input');
    label.textContent = i18nextInstance.t('link');

    formFloating.append(input, label);

    const button = document.createElement('button');
    button.type = 'submit';
    button['aria-label'] = 'add';
    button.classList.add('h-100', 'btn', 'btn-lg', 'btn-info', 'px-sm-5', 'text-white');
    button.textContent = i18nextInstance.t('add');
    colAuto.append(button);

    if (state.filled) {
      switch (state.error) {
        case 'ok':
          errorStatement.classList.remove('text-danger');
          errorStatement.classList.add('text-success');
          errorStatement.textContent = i18nextInstance.t('success_message');
          break;

        case 'already_added_url':
          input.classList.add('border', 'border-danger');
          errorStatement.classList.add('text-danger');

          errorStatement.textContent = i18nextInstance.t('already_added_url');
          break;

        case 'invalid_url':
          errorStatement.classList.add('text-danger');
          input.classList.add('border', 'border-danger');
          errorStatement.textContent = i18nextInstance.t('invalid_url');
          break;

        case 'invalid_rss_url':
          errorStatement.classList.add('text-danger');
          input.classList.add('border', 'border-danger');
          errorStatement.textContent = i18nextInstance.t('invalid_rss_url');
          break;

        case 'empty_input':
          errorStatement.classList.add('text-danger');
          input.classList.add('border', 'border-danger');
          errorStatement.textContent = i18nextInstance.t('empty_input');
          break;

        default:
          break;
      }
    }
  }

  draw(state);
}
