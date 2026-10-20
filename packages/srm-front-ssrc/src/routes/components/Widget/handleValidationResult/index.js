import React from 'react';
import { DataSet, Modal } from 'choerodon-ui/pro';
import { noop, isEmpty } from 'lodash';

import intl from 'utils/intl';

// import { getResponse } from 'utils/utils';

import ValidationResultModal from './ValidationResultModal.js';
import { validationResultDS } from './validationResultDS';

/**

interface Options {
  currentHeaderDtoName: 'rfxQuotationHeaderCurDTOS', // 校验接口返回 头数据字段名
  headerIdName: 'rfxHeaderId', // 校验接口返回 头主键字段名
}

interface Data {
  validationResult: any,  // 校验接口返回数据
  confirmSubmit: noop, // 确认提交函数
  afterSuccessSubmit: noop, // 校验提交提交成功回调
  selectionList, // 提交标段list
  headerId: null, // 单据头ID值
  handleError: noop,
  warningModalCancel: function || null, // 提示弹窗取消事件
  options: ,
  modalProps, // 额外的modal配置
}
*/

/**
 * 处理页面校验后返回逻辑
 */
const handleValidationResult = (data = {}) => {
  const {
    validationResult = {},
    confirmSubmit = noop, // 确认提交函数
    afterSuccessSubmit = noop, // 校验提交提交成功回调
    selectionList, // 提交标段list
    headerId = null, // 单据头ID值
    handleError = noop,
    warningModalCancel = noop, // 提示弹窗取消事件
    options = {},
    // onOkClickInterval = 1200,
    modalProps = {},
    strongValidationTip, // 强校验提示
    weakValidationTip, // 弱校验提示
  } = data || {};
  const {
    currentHeaderDtoName = 'rfxQuotationHeaderCurDTOS', // 校验接口返回的头数据字段名
    headerIdName = 'rfxHeaderId', // 校验接口返回的头主键字段名
  } = options || {};

  // api error
  if (validationResult && validationResult?.failed) {
    handleError(validationResult);
    return;
  }

  // api successed but response empty
  if (!validationResult || isEmpty(validationResult)) {
    afterSuccessSubmit();
    return;
  }

  const { validateResults = [], [currentHeaderDtoName]: currentHeaderDto = [] } =
    validationResult || {};

  if (isEmpty(validateResults)) {
    // 校验规则为空,通过校验,直接提交
    let currentHeaderData = null;
    if (headerId && !isEmpty(currentHeaderDto)) {
      currentHeaderData = currentHeaderDto.find(
        (resultLine = {}) => resultLine[headerIdName] === headerId
      );
    }

    afterSuccessSubmit(currentHeaderData);
    return;
  }

  const errorsMap = { lists: [], description: '' }; // error
  const warningsMap = { lists: [], description: '' }; // warning
  let tipMessage = intl.get('ssrc.common.view.title.warningInfo').d('以下验证未通过，确认发布吗？');

  const validateDS = new DataSet(validationResultDS());
  validateResults.forEach((validateLine = {}) => {
    const { type } = validateLine || {};
    if (type === 'ERROR') {
      // 校验失败
      errorsMap.lists.push(validateLine);
    }

    if (type === 'WARNING') {
      warningsMap.lists.push(validateLine);
    }
  });

  if (errorsMap.lists?.length) {
    const allErrorList = [...errorsMap.lists, ...warningsMap.lists];
    validateDS.loadData(allErrorList);
    tipMessage =
      strongValidationTip ||
      intl.get('ssrc.common.view.title.errorInfo').d('提交失败，以下内容验证不通过');
  }

  if (warningsMap.lists.length && !errorsMap.lists.length) {
    validateDS.loadData(warningsMap.lists);
    tipMessage =
      weakValidationTip ||
      intl.get('ssrc.common.view.title.warningInfo').d('以下验证未通过，确认发布吗？');
  }

  // 无错误类型数据标识
  const errorMapLengthEmptyFlag = errorsMap?.lists?.length === 0;

  Modal.open({
    key: Modal.key(),
    title: intl.get('hzero.common.message.confirm.title').d('提示'),
    closable: true,
    style: {
      width: '560px',
    },
    okProps: {
      wait: 1200,
      waitType: 'throttle',
    },
    cancelProps: {
      color: errorMapLengthEmptyFlag ? 'default' : 'primary',
    },
    cancelText: errorMapLengthEmptyFlag
      ? intl.get('hzero.common.button.cancel').d('取消')
      : intl.get('hzero.common.button.close').d('关闭'),
    okButton: errorMapLengthEmptyFlag,
    children: (
      <>
        <div style={{ marginBottom: '16px' }}>{tipMessage}</div>
        <ValidationResultModal ds={validateDS} sectionFlag={selectionList?.length > 1} />
      </>
    ),
    onClose: () => {
      if (warningModalCancel) {
        warningModalCancel();
      }
    },
    onOk: () => confirmSubmit(),
    onCancel: () => {
      if (warningModalCancel) {
        warningModalCancel();
      }
      validateDS.loadData();
      validateDS.reset();
    },
    ...(modalProps || {}),
  });
};

export { handleValidationResult };
