import React from 'react';
import notification from 'utils/notification';
import intl from 'utils/intl';

function formatErrorInfo(headerDS, lineDS, text) {
  const headerErrors = headerDS.current?.getValidationErrors() || [];
  const lineErrors = lineDS ? lineDS.getValidationErrors() : [];
  let errorMsg = [];
  headerErrors.forEach((item) => {
    const { injectionOptions = {}, validationMessage = '' } = item?.errors[0];
    const { label = '' } = injectionOptions;
    if (label || validationMessage) {
      errorMsg = [
        ...errorMsg,
        <span>
          {' '}
          {label
            ? intl.get('hzero.common.validation.notNull', { name: label })
            : validationMessage}{' '}
          <br />{' '}
        </span>,
      ];
    }
    return item;
  });
  lineErrors.forEach((item, index) => {
    const { errors = [] } = item;
    // 如果行信息有验证不通过报错，先把标题加上去
    if (index === 0) {
      errorMsg = [
        ...errorMsg,
        <span style={{ fontWeight: '600', color: '#000000' }}>
          {text}: <br />{' '}
        </span>,
      ];
    }
    const lineIndex = item.record?.index + 1;
    errors.forEach((ele) => {
      const { injectionOptions = {}, validationMessage = '' } = ele?.errors[0];
      const { label = '' } = injectionOptions;
      if (label || validationMessage) {
        errorMsg = [
          ...errorMsg,
          <span>
            {intl.get('ssta.common.validate.line.index', { index: lineIndex })}{' '}
            {label
              ? intl.get('hzero.common.validation.notNull', { name: label })
              : validationMessage}{' '}
            <br />{' '}
          </span>,
        ];
      }
    });
    return item;
  });
  if (errorMsg.length > 0) {
    notification.error({ message: errorMsg });
  }
}

export { formatErrorInfo };
