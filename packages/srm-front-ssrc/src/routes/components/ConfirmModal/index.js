/*
 * confirmModal  -  通用检验弹窗
 * @date: 2021/1/26
 * @author: jamie Lee<zhijian.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */
import React from 'react';
import { isEmpty, isNil, isFunction, debounce, noop } from 'lodash';
import { Modal } from 'choerodon-ui/pro';
import notification from 'utils/notification';

import intl from 'utils/intl';

/**
 * 通用检验弹窗
 * @param {*} response 接口返回值
 * @param {*} onok 确定的回调
 * @param {*} onCancel 取消的回调
 * @param {*} errorOk 强校验报错的回调
 * @param {*} errorCallback 自定义报错
 */
export default function confirmModal(
  response,
  onOk = () => {},
  onCancel = () => {},
  errorOk = () => {},
  errorCallback
) {
  if (response && response.type !== 'SUCCESS') {
    if (errorCallback) {
      errorCallback(response);
    } else {
      switch (response.type) {
        case 'WARNING':
          Modal.confirm({
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            children: response.message,
            onOk: debounce(() => {
              onOk();
            }, 800),
            onCancel: () => {
              onCancel();
            },
          });
          break;
        case 'ERROR':
          Modal.error({
            title: response.message,
            onOk: () => {
              errorOk();
            },
          });
          break;
        default:
          Modal.info(response.message);
          break;
      }
    }
    return response;
  } else {
    return response;
  }
}

/**
 * 为了不影响之前的和二开的，再写一个新的
 * 通用检验弹窗 - 适用于后端返回数据为单条、多条、对象三种数据形式
 * @param {*} response 接口返回值
 * @param {*} validatorType - 接口返回提示校验类型
 * @param {*} validatorArrName - 接口若返回数组类型，数组名变量 {type: 'WARNING', arr: [{type:'',message: ''}, {type:'',message: ''}]}
 * @param {*} onok 确定的回调
 * @param {*} onCancel 取消的回调
 * @param {*} errorOk 强校验报错的回调
 * @param {*} errorCallback 自定义报错
 * @param {*} onValidator 当校验不成功时，执行语句，非回调函数里执行的语句
 */
export function validatorConfirmModal(data = {}) {
  const {
    response = {},
    validatorType = 'type',
    validatorArrName,
    onOk = () => {},
    onCancel = () => {},
    errorOk = () => {},
    errorCallback,
    onValidator = noop,
    warningSaveCancel = () => {},
    refreshPage = noop,
    openQualificationModal,
    showErrorType = 'modal', // 弹窗类型，modal：默认弹窗，notification：右下角提示
    firstValidateSuccessCallback, // ps：校验和保存同是一个接口，保存比如调用首次校验调用保存接口，若成功则直接调用保存之后的逻辑，否则，进行二次确认
    remoteFunc = null,
    remoteProcessCodePrefix = "",
  } = data || {};
  if (!response) {
    return;
  }

  // ps：校验接口和提交接口不是同一个接口，校验成功之后直接调用onOk方法
  if (response === true || isEmpty(response)) {
    onOk();
    return;
  }

  // modal props
  const modalCuxprops = () => {
    let modalProps = {};

    modalProps = remoteFunc && remoteProcessCodePrefix ?
      remoteFunc.process(`${remoteProcessCodePrefix}_VALIDATORMODAL_COMMON_PROPS`, modalProps, {
        ...data,
      }) : modalProps;

    modalProps = modalProps || {};

    return modalProps;
  };

  if (response && !isNil(response[validatorType]) && response[validatorType] !== 'SUCCESS') {
    if (errorCallback) {
      errorCallback(response);
    } else {
      const bodyStyle = { maxHeight: 'calc(100vh - 2.5rem)' };
      const qualifyExpiredData = (response[validatorArrName] || []).find(
        (item) => item.code === 'error.ssrc_supplier_qualification_expired'
      );
      switch (response[validatorType]) {
        case 'WARNING':
          Modal.confirm({
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            children: getPromptMessage({ response, validatorArrName }),
            bodyStyle,
            onOk: async () => {
              try {
                const confirmOkResult = await onOk();

                if (confirmOkResult === false) {
                  return false;
                }
              } catch (err) {
                throw err;
              }
            },
            okProps: {
              waitType: 'throttle',
              wait: 1200,
            },
            onCancel: () => {
              onCancel();
            },
            ...modalCuxprops(),
          });
          break;
        case 'ERROR':
          if (qualifyExpiredData && !isEmpty(qualifyExpiredData)) {
            // 渲染资质到期弹窗
            if (openQualificationModal) openQualificationModal(qualifyExpiredData);
          } else if (showErrorType === 'notification') {
            notification.error({
              description: getPromptMessage({ response, validatorArrName }),
              onOk: () => {
                errorOk();
              },
            });
          } else {
            Modal.error({
              children: getPromptMessage({ response, validatorArrName }),
              bodyStyle,
              onOk: () => {
                errorOk();
              },
              onClose: debounce(() => {
                const res = response[validatorArrName];
                const validateErrorRefreshField = 'validateErrorRefreshFlag';
                const validateErrorRefreshFlag = getCurrentSymbolFormValidateResult(
                  res,
                  validateErrorRefreshField
                );
                if (validateErrorRefreshFlag) {
                  refreshPage(); // 校验错误，关闭弹窗时候需要刷新外部页面
                }
              }, 800),
            });
          }

          break;
        case 'WARNING_SAVE':
          Modal.confirm({
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            children: getPromptMessage({ response, validatorArrName }),
            bodyStyle,
            onOk: async () => {
              try {
                await onOk();
              } catch (err) {
                throw err;
              }
            },
            onCancel: () => {
              warningSaveCancel();
            },
          });
          break;
        default:
          Modal.info({
            children: getPromptMessage({ response, validatorArrName }),
            bodyStyle,
          });
          break;
      }
      onValidator();
    }
    return response;
  } else {
    if (response && !response.failed && isFunction(firstValidateSuccessCallback)) {
      return firstValidateSuccessCallback();
    }
    return response;
  }
}

export function getPromptMessage({ response = {}, validatorArrName }) {
  if (!Array.isArray) {
    // 兼容性写法(ie8) 假如不存在 Array.isArray()，则在其他代码之前运行下面的代码将创建该方法
    Array.isArray = function (arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    };
  }
  if (validatorArrName) {
    const res = response[validatorArrName];
    if (Array.isArray(res) && res.length >= 1) {
      if (res.length === 1) {
        if (res[0].message.includes('\n')) {
          const messageArr = res[0].message.split('\n');
          return messageArr?.map?.((item) => {
            return <div>{`${item}`}</div>;
          });
        } else {
          return res[0].message;
        }
      } else {
        return res?.map?.((item, index) => {
          return <div>{`${index + 1}、${item.message}`}</div>;
        });
      }
    }
  }
  return response?.message;
}

// 从校验错误类型中找出特定字段标识为1
const getCurrentSymbolFormValidateResult = (validateResults = [], field = '') => {
  let flag = 0;
  if (isEmpty(validateResults) || !field) {
    return flag;
  }

  validateResults.forEach((validateResult) => {
    const currentFieldValue = validateResult[field];
    if (currentFieldValue) {
      flag = 1;
    }
  });

  return flag;
};

/*
 * 通用检验弹窗
 * @param {*} response 接口返回值
 * @param {*} successCallBack 校验成功回调
 * @param {*} warningOk 校验警告后确定回调
 * @param {*} onCancel 取消的回调
 * @param {*} errorOk 强校验报错的回调
 * @param {*} errorCallback 自定义报错
 */
export function validateModal({
  response,
  successCallBack = () => {},
  warningOk = () => {},
  warningCancel = () => {},
  errorOk = () => {},
  errorCancel = () => {},
  overrideSubmitWarninOkOperate = null, // 覆盖本身的提交操作， return 0，不继续执行后边的提醒，return 1，继续执行后边的Modal
  openQualificationModal,
}) {
  // 校验成功，走成功回调  判断数组为空供应商报价情况/body为true是转RF的情况
  if ((Array.isArray(response) && response.length === 0) || response.body === true) {
    successCallBack();
    return;
  }
  const { validateResults = [] } = response;
  let description;
  let continueWarningFlag = 1; // 是否继续后边的提示
  const qualifyExpiredData = (validateResults || []).find(
    (item) => item.code === 'error.ssrc_supplier_qualification_expired'
  );

  switch (response.highestValidatorType) {
    case 'WARNING':
      description = validateResults?.map?.((i, index) => {
        return <div>{`${index + 1}、${i.message}`}</div>;
      });

      Modal.confirm({
        title: intl.get('ssrc.common.view.title.warningInfo').d('以下验证未通过，确认发布吗？'),
        children: description,
        onOk: debounce(() => {
          // 覆盖提示操作，覆盖函数返回1 ，就继续执行后边提示
          if (isFunction(overrideSubmitWarninOkOperate)) {
            const warningResult = overrideSubmitWarninOkOperate(validateResults);
            continueWarningFlag = warningResult === 1 ? 1 : 0;
          }

          if (continueWarningFlag !== 1) {
            return;
          }
          warningOk();
        }, 800),
        onCancel: () => {
          warningCancel();
        },
      });
      break;
    case 'ERROR':
      if (qualifyExpiredData && !isEmpty(qualifyExpiredData)) {
        // 渲染资质到期弹窗
        if (openQualificationModal) openQualificationModal(qualifyExpiredData);
      } else {
        description = validateResults?.map?.((i, index) => {
          return <div>{`${index + 1}.${i.message}`}</div>;
        });

        notification.error({
          message: intl.get('ssrc.common.view.title.errorInfo').d('提交失败，以下内容验证不通过'),
          description,
          onOk: () => {
            errorOk();
          },
          onCancel: () => errorCancel(),
        });
        errorOk();
      }
      break;
    default:
      Modal.info(response.message);
      break;
  }
}

/*
 * 弹框校验(快速询价维护-发布 快速回复报价-确定)
 * @param {*} response 接口返回值
 * @param {*} successCallBack 校验成功回调
 * @param {*} warningOk 校验警告后确定回调
 * @param {*} onCancel 取消的回调
 * @param {*} errorOk 强校验报错的回调
 */
export function validateQRModal({
  response = {},
  warningTitle = intl.get('hzero.common.message.confirm.title').d('提示'),
  errorTitle = intl.get('hzero.common.notification.error').d('操作失败'),
  successCallBack = () => {},
  warningOk = () => {},
  warningCancel = () => {},
  errorOk = () => {},
  errorCancel = () => {},
}) {
  const { validateResults = [] } = response || {};

  // 校验成功，走成功回调
  if (isEmpty(validateResults)) {
    successCallBack();
    return response;
  }
  let description;

  switch (response.highestValidatorType) {
    case 'WARNING':
      description = validateResults?.map?.((i, index) => {
        return <div>{`${index + 1}、${i.message}`}</div>;
      });

      Modal.confirm({
        title: warningTitle,
        children: description,
        onOk: warningOk,
        onCancel: warningCancel,
      });
      break;
    case 'ERROR':
      description = validateResults?.map?.((i, index) => {
        return <div>{`${index + 1}、${i.message}`}</div>;
      });

      notification.error({
        message: errorTitle,
        description,
        onOk: errorOk,
        onCancel: errorCancel,
      });
      errorOk();
      break;
    default:
      Modal.info(response.message);
      break;
  }
  return response;
}
