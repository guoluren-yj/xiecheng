import React from 'react';
import { notification } from 'choerodon-ui';
import { isNil, isEmpty } from 'lodash';
import intl from 'utils/intl';

export const collectDsErrors = (dataSet) => {
  const errorInfoList = [];
  const errorList = dataSet.getValidationErrors();
  const { validationNum, validationTitle } = dataSet.props;
  errorList.forEach((error) => {
    const { errors: recordErrors, record } = error;
    // 自定义校验errors中没有label信息
    const recordErrorMsgList = [];
    const requiredErrorLabelList = [];
    recordErrors.forEach((item) => {
      const { field, errors: fieldErors } = item;
      if (!isEmpty(fieldErors)) {
        const { ruleName, validationMessage } = fieldErors[0];
        if (ruleName === 'valueMissing') {
          const label = field.get('label');
          requiredErrorLabelList.push(label);
        } else {
          recordErrorMsgList.push(validationMessage);
        }
      }
    });
    if (!isEmpty(requiredErrorLabelList)) {
      const requiredErrorMsg = intl.get('hzero.common.validation.notNull', {
        name: requiredErrorLabelList.join('，'),
      });
      recordErrorMsgList.unshift(requiredErrorMsg);
    }
    errorInfoList.push({
      num: record.get(validationNum),
      tempNum: record.index + 1,
      recordErrorMsgList,
    });
  });
  const dataSetErrorInfo = {
    validationNum,
    validationTitle,
    errorInfoList,
  };
  return errorInfoList.length !== 0 && dataSetErrorInfo;
};

export const collectDsListErrors = (dataSetList) => {
  const allErrors = dataSetList.reduce((total, dataSet) => {
    const errorInfo = collectDsErrors(dataSet);
    return errorInfo ? [...total, errorInfo] : total;
  }, []);
  return allErrors;
};

export const notifyValidErrors = (dataSetList) => {
  const allErrors = collectDsListErrors(dataSetList.filter(Boolean));
  const errorTextList = allErrors.map((dsError) => {
    const { validationNum, validationTitle, errorInfoList } = dsError;
    console.log(errorInfoList);
    const errorTextContent = errorInfoList.map((errorInfo) => {
      const { num, tempNum, recordErrorMsgList } = errorInfo;
      let numPrefix = '';
      if (!isNil(validationNum)) {
        numPrefix = isNil(num)
          ? intl
              .get(`srpm.common.view.message.lineWithDynamicNum`, { num: tempNum })
              .d(`第{num}行，`)
          : intl
              .get(`srpm.common.view.message.lineErrorAndReasonWithDynamicNum`, { num })
              .d(`行号为{num}，数据校验不通过。具体原因为：`);
      }
      const labelContent = recordErrorMsgList.join('；');
      return <div>{numPrefix + labelContent}</div>;
    });
    return (
      <div>
        <span style={{ fontWeight: 600 }}>{validationTitle}：</span>
        <div>{errorTextContent}</div>
      </div>
    );
  });
  notification.error({
    message: errorTextList,
  });
};
