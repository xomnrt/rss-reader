import i18next from 'i18next';
import resources from './locales/index.js';

export default i18next.createInstance({
  lng: 'ru',
  debug: false,
  resources,
}, () => {});
