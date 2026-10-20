import { isEmpty, isNil } from 'lodash';

/**
 * 该方法由于校验过多数据，在大数据下性能不好，请谨慎使用
 */

const getErrorMessage = (data = [], params = {}) => {
  if (isEmpty(data)) {
    return null;
  }

  const { groupCategory = null, groupFieldName = null, primaryKey = null, consoleTitle = '' } =
    params || {}; // 以行为单位进行分组提示逻辑开发

  let allErrors = ''; // all error
  let errList = []; // error list
  const cusErrorList = []; // 自定义校验错误
  const errorGroupMap = new Map(); // group error map
  let lineIdValue = null; // table line id value

  data.forEach((item = {}) => {
    const { errors = [] } = item || {};
    if (isEmpty(errors)) {
      return;
    }

    console.log(errors, 'get ds validation errors', consoleTitle);

    errors.forEach((err = {}) => {
      const { errors: errMessageList = [], field: fieldObject = null } = err || {};
      const { pristineProps } = fieldObject || {};
      if (isEmpty(err) || isEmpty(errMessageList)) {
        return;
      }

      errMessageList.forEach((er) => {
        const {
          $validationMessage = null,
          injectionOptions = {},
          validationProps = null,
          ruleName,
        } = er || {};

        // 自定义校验
        if (ruleName === 'customError') {
          const { name, label } = pristineProps || {};
          if (name && label && $validationMessage) {
            const currentFieldErr = `${label}: ${$validationMessage}`;
            cusErrorList.push(currentFieldErr);
          }
        } else {
          if (!$validationMessage || isEmpty(injectionOptions) || !validationProps) {
            return;
          }
          const { record = {} } = validationProps || {};
          const currentRecordIndex = record?.index + 1;
          let groupFieldValue = null; // TODO support multi group Field

          if (groupFieldName && typeof groupFieldName === 'string') {
            groupFieldValue = record.get(groupFieldName); // group fieldName value
          }
          if (groupFieldName && Array.isArray(groupFieldName) && !isEmpty(groupFieldName)) {
            groupFieldName.forEach((groupItem, index) => {
              if (!groupItem) {
                return;
              }
              const { label = null, fieldName = null } = groupItem || {};
              if (!fieldName) {
                throw ReferenceError(`${fieldName} is Required`);
              }

              const currentFieldNameValue = record.get(fieldName);
              const formatLable = label ? `${label}-` : '';
              const currentItemFieldText =
                !isNil(currentFieldNameValue) || label
                  ? `${formatLable}${currentFieldNameValue}`
                  : undefined;
              if (currentItemFieldText) {
                const lastFlag = index === groupFieldName?.length - 1;
                groupFieldValue = groupFieldValue ?? '';
                groupFieldValue += `${currentItemFieldText}${!lastFlag ? ' | ' : ''}`;
              }
            });
          }

          if (primaryKey && typeof primaryKey === 'string') {
            lineIdValue = record.get(primaryKey);
          }
          const groupKey = `${lineIdValue}+${groupFieldValue}+${currentRecordIndex}`; // 防止行信息重复覆盖，key使用多个字段合并，取行索引兜底

          let newMessage;
          Object.keys(injectionOptions).forEach((key, index, arr) => {
            let currentValue = null;
            currentValue = injectionOptions[key];
            if (typeof currentValue === 'object') {
              currentValue = currentValue?.props?.children || '';
            }
            if (typeof currentValue !== 'string') {
              currentValue = String(currentValue);
            }
            if (newMessage) {
              newMessage = newMessage.replace(`{${key}}`, currentValue);
            }

            if (!newMessage) {
              if ($validationMessage) {
                if (typeof $validationMessage === 'string') {
                  newMessage = $validationMessage.replace(`{${key}}`, currentValue);
                }
                if (typeof $validationMessage === 'object') {
                  // dynamicProps label and return a non-string value
                  const dynamicLableChildren = $validationMessage?.props?.children;
                  if (typeof dynamicLableChildren === 'object' && !isEmpty(dynamicLableChildren)) {
                    const dynamicType = dynamicLableChildren['0'];
                    const symbol = dynamicLableChildren['2'];
                    newMessage = dynamicType ? dynamicType + currentValue + symbol : currentValue;
                  }
                }
              }
            }

            newMessage = newMessage ? newMessage.replace(/[,。]/, '') : null;

            if (index === arr.length - 1 && newMessage) {
              // group error
              if (groupFieldName) {
                const currentGroupValue = errorGroupMap.get(groupKey) || [];
                currentGroupValue.push(newMessage);
                errorGroupMap.set(groupKey, currentGroupValue);
              } else {
                errList.push(newMessage); // no group error
              }
            }
          });
        }
      });
    });
  });

  // need group error map
  if (errorGroupMap.size) {
    errorGroupMap.forEach((value = [], key = '') => {
      if (isEmpty(value)) {
        return;
      }

      const formattedKey = key ? key.split('+') : [];
      const [, groupValue = null, lineIndex = null] = formattedKey || [];

      const newKey =
        !isNil(groupValue) && groupValue !== 'null' && groupValue !== 'undefined'
          ? groupValue
          : `LINE ${lineIndex}`;
      const newValue = [...new Set([...value])];

      const categoryGroup = `【${newKey}】:`;
      // newValue.unshift(`【${newKey}】`);
      allErrors += `<div>${categoryGroup} ${newValue.join(', ')}</div>`;
    });
    // ds 类别
    if (groupCategory) {
      allErrors = groupRendererError(groupCategory, allErrors);
    }
  }

  // 不需要分组错误处理
  if (!isEmpty(errList) || !isEmpty(cusErrorList)) {
    errList = new Set([...errList]);
    errList = [...errList];
    allErrors = errList.join(', ');

    const CusErrors = uniqueErrors(cusErrorList);

    // ds 类别
    if (groupCategory) {
      allErrors = groupRendererError(groupCategory, allErrors, CusErrors);
    }
  }

  return allErrors;
};

const uniqueErrors = (errs = []) => {
  let errList = new Set([...errs]);
  errList = [...errList];
  const allErrors = errList.join(', ');
  return allErrors;
};

// group render error
const groupRendererError = (groupCategory = null, allErrors = '', CusErrors = '') => {
  const Err = `<h4>${groupCategory}</h4> ${allErrors} ${CusErrors}`;
  return Err;
};

/**
 * Params {
 *  data array[any]  // ds validate validate error list
 *  groupCategory? null | string  // current ds symbol
 *  groupFieldName? null | string | object[]  // group error category field name
 *  primaryKey? null | string // ds row key
 * }
 *
 * @return null | string
 */
// form error
const getErrors = (params = {}) => {
  const { data = [] } = params || {};
  let currentErrorList = null;
  let errorMessage = null;

  if (isEmpty(data)) {
    return null;
  }

  currentErrorList = data;
  errorMessage = getErrorMessage(currentErrorList, params);

  return errorMessage;
};

export { getErrors };
