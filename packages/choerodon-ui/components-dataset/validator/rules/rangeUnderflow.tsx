import moment, { isMoment } from 'moment';
import isNil from 'lodash/isNil';
import { isEmpty, toDateString, toRangeValue } from '../../utils';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import math from '../../math';
import { methodReturn, ValidatorBaseProps, ValidatorProps } from '.';

const isUnderflow = (value, min, range) => {
  if (range) {
    return toRangeValue(value, range).some(item => !isEmpty(item) &&
      (isMoment(item) ? item.isBefore(min) : math.lt(item, min)));
  }
  if (isMoment(value)) {
    return value.isBefore(min);
  }
  return math.lt(value, min);
};

export default function rangeUnderflow(value: any, validatorBaseProps: ValidatorBaseProps, getProp: <T extends keyof ValidatorProps>(key: T) => ValidatorProps[T]): methodReturn {
  if (!isEmpty(value)) {
    const min = getProp('min');
    if (!isNil(min)) {
      const range = getProp('range');
      if (isUnderflow(value, min, range)) {
        const format = getProp('format');
        const label = getProp('label');
        let minString = toDateString(min, format);
        const type = getProp('type');
        if (type === 'time' || type === 'dateTime') {
          const timeZone = getProp('timeZone');
          if (timeZone) {
            const renderedTimeZone = typeof timeZone === 'function' ? timeZone(moment(min), { boundaryType: 'min' }) : moment(min).format(timeZone);
            if (renderedTimeZone) {
              minString = `${minString}${renderedTimeZone}`;
            }
          }
        }
        const injectionOptions = { min: minString, label };
        const ruleName = 'rangeUnderflow';
        const {
          [ruleName]: validationMessage = $l('Validator', 'range_underflow'),
        } = getProp('defaultValidationMessages') || {};
        return new ValidationResult({
          validationProps: {
            ...validatorBaseProps,
            min,
            range,
          },
          validationMessage,
          injectionOptions,
          value,
          ruleName,
        });
      }
    }
  }
  return true;
}
