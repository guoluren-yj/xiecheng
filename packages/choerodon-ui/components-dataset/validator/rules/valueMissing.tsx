import { isArrayLike } from 'mobx';
import { isEmpty, toRangeValue } from '../../utils';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { methodReturn, ValidatorBaseProps, ValidatorProps } from '.';
import { FieldType } from '../../data-set/enum';

function isEmptyArray(value: any): boolean {
  return isEmpty(value) || (isArrayLike(value) && (value.length === 0 || value.every(item => isEmptyArray(item))));
}

function hasEmptyValue(array): boolean {
  return isEmpty(array) || (isArrayLike(array) && (array.length === 0 || array.some(item => isEmpty(item))));
}

function checkRangeValueRequired(rangeValue: any, rangeAllRequired?: boolean): boolean {
  return rangeAllRequired ? hasEmptyValue(rangeValue) : isEmptyArray(rangeValue);
}

export default function valueMissing(value: any, validatorBaseProps: ValidatorBaseProps, getProp: <T extends keyof ValidatorProps>(key: T) => ValidatorProps[T]): methodReturn | PromiseLike<methodReturn> {
  const required = getProp('required');
  const call = (validationProps) => {
    const label = getProp('label');
    const injectionOptions = { label };
    const key = label ? 'value_missing' : 'value_missing_no_label';
    const ruleName = label ? 'valueMissing' : 'valueMissingNoLabel';
    const { [ruleName]: validationMessage = $l('Validator', key) } = getProp('defaultValidationMessages') || {};
    return new ValidationResult({
      validationProps: {
        ...validatorBaseProps,
        ...validationProps,
      },
      validationMessage,
      injectionOptions,
      value,
      ruleName,
    });
  };
  if (required) {
    if (isEmptyArray(value)) {
      return call({ required });
    }
    const type = getProp('type');
    if (type === FieldType.attachment) {
      const attachmentCount = getProp('attachmentCount');
      if (!attachmentCount) {
        if (value) {
          const fetchCount = getProp('fetchAttachmentCount');
          if (fetchCount) {
            return fetchCount.then(count => {
              if (!count) {
                return call({
                  required,
                  type,
                  attachmentCount: count,
                });
              }
              return true;
            });
          }
        }
        return call({
          required,
          type,
          attachmentCount,
        });
      }
    }
    const range = getProp('range');
    if (range) {
      const multiple = getProp('multiple');
      const rangeAllRequired = getProp('rangeAllRequired');
      if ((multiple ?
        value.every(item => checkRangeValueRequired(toRangeValue(item, range), rangeAllRequired))
        : checkRangeValueRequired(toRangeValue(value, range), rangeAllRequired)
      )) {
        return call({
          required,
          range,
          multiple,
        });
      }
    }
  }
  return true;
}
