import isPromise from 'is-promise';
import moment, { isMoment } from 'moment';
import { isEmpty } from '../../utils';
import ValidationResult from '../ValidationResult';
import localeContext, { $l } from '../../locale-context';
import { FieldType } from '../../data-set/enum';
import { mobxGet } from '../../mobx-helper';
import { DateStoreProps } from '../../stores/DateCodeStore';
import { methodReturn, ValidatorBaseProps, ValidatorProps } from '.';

const types: {
  [key: string]: [
    'DatePicker',
    'type_mismatch_date'
  ];
} = {
  [FieldType.date]: ['DatePicker', 'type_mismatch_date'],
  [FieldType.dateTime]: ['DatePicker', 'type_mismatch_date'],
  [FieldType.auto]: ['DatePicker', 'type_mismatch_date'],
};

export default function valueMismatch(value: any, _: ValidatorBaseProps, getProp: <T extends keyof ValidatorProps>(key: T) => ValidatorProps[T]): methodReturn | PromiseLike<methodReturn> {
  if (!isEmpty(value)) {
    const type = getProp('type');
    if (type) {
      const validateType = types[type];
      if (validateType) {
        const [component, validatorKey] = validateType;
        const callback = getProp('disabledDate');
        if (callback && isPromise(callback) && isMoment(value) ) {
          return callback.then((result: DateStoreProps) => {
            if (result && result.date && result.date.includes(moment(value).format('YYYY-MM-DD'))) {
              const ruleName = 'valueMismatch';
              const locale = localeContext.getCmp(component);
              const {
                [ruleName]: validationMessage = locale ? mobxGet(locale, 'type_mismatch') : $l('Validator', validatorKey),
              } = getProp('defaultValidationMessages') || {};
              return new ValidationResult({
                validationProps: {
                  type,
                  disabledDate: result.date,
                },
                validationMessage,
                value,
                ruleName,
              });
            }
            return true;
          });
        }
      }
    }
  }
  return true;
}
