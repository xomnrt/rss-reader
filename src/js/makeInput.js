import i18next from 'i18next';
import _ from 'lodash';
import * as yup from 'yup';
import resources from './locales/index.js';

// export default function makeInput(anchorElement, onFeedUpdate)
function validate(value) {
  const validURL = /^((https?|ftp):\/\/)?(www.)?(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
  const schema = yup.string().matches(validURL).required('');

  try {
    schema.validateSync(value, { abortEarly: false });
    return {};
  } catch (err) {
    return _.keyBy(err.inner, 'path');
  }
}

export default async function makeInput(anchorElement) {
  const state = {
    alreadyUsedRss: [],
    error: undefined,
    status: 'empty', // filled
  };

  const i18nextInstance = i18next.createInstance();
  await i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources,
  });

  const form = document.createElement('form');
  const input = document.createElement('input');
  const errorStatement = document.createElement('p');

  function draw(state) {
    const elements = [anchorElement, form, input, errorStatement];
    elements.forEach((el) => {
      while (el.firstChild) {
        el.removeChild(el.lastChild);
      }
    });

    const h1 = document.createElement('h1');
    h1.textContent = i18nextInstance.t('header');
    h1.classList.add('display-3', 'mb-0', 'text-white');

    const p1 = document.createElement('p');
    p1.textContent = i18nextInstance.t('starting_phrase');
    p1.classList.add('lead', 'text-white');

    form.setAttribute('action', '');
    form.classList.add('rss-form', 'text-body');

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

    if (state.status === 'filled') {
      switch (state.error) {
        case 'ok':
          console.log('state.error');

          errorStatement.classList.remove('text-danger');
          errorStatement.classList.add('text-success');

          errorStatement.textContent = i18nextInstance.t('success_message');
          break;

        case i18nextInstance.t('already_added_url'):
          errorStatement.classList.add('text-danger');

          errorStatement.textContent = i18nextInstance.t('already_added_url');
          break;

        case i18nextInstance.t('invalid_url'):
          errorStatement.classList.add('text-danger');
          errorStatement.textContent = i18nextInstance.t('invalid_url');
          break;

        default:
          break;
      }
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const valueToCheck = input.value.trim();
    state.status = 'filled';

    if (_.isEmpty(validate(valueToCheck))) {
      if (!state.alreadyUsedRss.includes(valueToCheck)) {
        state.alreadyUsedRss.push(valueToCheck);
        state.error = 'ok';
        console.log('success!');
      } else {
        state.error = i18nextInstance.t('already_added_url');
        console.log('already added');
      }
    } else {
      state.error = i18nextInstance.t('invalid_url');
      console.log('invalid url');
    }
    console.log(state);

    form.reset();
    form.focus();

    draw(state);
  });

  draw(state);

  // <p3 class="feedback m-0 position-absolute small text-success text-danger"></p3>

  //     el.addEventListener('submit', () => {
  //       validation().then((res) => {
  //         if (res.error) {
  //           currentState.error = res.error;
  //           draw(currentState);
  //           return;
  //         }

  //         currentState.error = undefined;
  //         currentState.alreadyUsedRss.append(res.input);
  //         draw(currentState);
  //       });
  //     });

  //     anchorElement.append(el);
  //   }
}
