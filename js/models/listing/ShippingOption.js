import app from '../../app';
import BaseModel from '../BaseModel';
import Services from '../../collections/Services.js';
import is from 'is_js';

export default class extends BaseModel {
  defaults() {
    return {
      type: 'FIXED_PRICE',
      regions: [],
    };
  }

  get nested() {
    return {
      services: Services,
    };
  }

  get shippingTypes() {
    return [
      'LOCAL_PICKUP',
      'FIXED_PRICE',
    ];
  }

  validate(attrs) {
    const errObj = {};
    const addError = (fieldName, error) => {
      errObj[fieldName] = errObj[fieldName] || [];
      errObj[fieldName].push(error);
    };

    if (this.shippingTypes.indexOf(attrs.shippingTypes) === -1) {
      addError('type', 'The shipping type is not one of the available types.');
    }

    if (is.not.string(attrs.name)) {
      addError('name', 'Please provide a name as a string.');
    } else if (!attrs.name) {
      addError('name', app.polyglot.t('shippingOptionModelErrors.provideName'));
    }

    if (!attrs.regions || !attrs.regions.length) {
      addError('regions', app.polyglot.t('shippingOptionModelErrors.provideRegion'));
    }

    if (!attrs.services || !attrs.services.length) {
      addError('services', app.polyglot.t('shippingOptionModelErrors.provideService'));
    }

    if (Object.keys(errObj).length) return errObj;

    return undefined;
  }
}