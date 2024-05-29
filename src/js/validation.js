import '../scss/styles.scss'
import _ from 'lodash';

import * as bootstrap from 'bootstrap';
import * as yup from 'yup';

// export function formValidation() {

//     const addedWebsites = [];

//     const schema = yup.object().shape({
//         website: yup.string().url().notOneOf(addedWebsites).required()
//     })

// }

// export const validate = (field) => {
//     try {
//       schema.validateSync(field, { abortEarly: false });
//       return {};
//     } catch (e) {
//       return _.keyBy(e.inner, 'path');
//     }
//   };
