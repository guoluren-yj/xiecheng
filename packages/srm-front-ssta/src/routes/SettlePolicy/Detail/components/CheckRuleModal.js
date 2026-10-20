/*
 * @Description: 结算策略详情-校验规则设置弹框
 * @Date: 2022年7月15日11:27:42
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useEffect, useCallback, useContext, memo, useMemo } from 'react';
import { useDataSet, Table, Select } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Store } from '../StoreProvider';
import { checkRuleDS } from '@/stores/SettleStrategyDS';
import { getSelectedNegActConfirmMsg } from '@/utils/utils';
// import commonStyles from '@/routes/common.less';

/**
 * @description: 检验规则设置弹框
 * @param {Object} props
 * @return {ReactNode}
 */
export default memo(({ modal }) => {
  const { platModalFlag, settleConfigId, headerDs } = useContext(Store);
  const { enableCheckFlag } = headerDs.current.get(['enableCheckFlag']);
  const checkRuleDs = useDataSet(() => checkRuleDS(platModalFlag, enableCheckFlag), [
    platModalFlag,
    enableCheckFlag,
  ]);

  useEffect(() => {
    modal.handleOk(handleSubmit);
    checkRuleDs.setQueryParameter('settleConfigId', settleConfigId);
    checkRuleDs.query();
    checkRuleDs.addEventListener('update', handleUpdate);
  }, [modal, handleSubmit, settleConfigId, checkRuleDs]);

  const handleUpdate = useCallback(({ value, record, name }) => {
    const { validateLevel } = record.get(['validateLevel']) || {};
    // 当校验节点选择了发票查验成功后（AFTER_INVOICE_CHECK）同时校验等级为禁止(FORBIDDEN),需要把校验等级置空
    if (name === 'invoiceVerifyNode') {
      if (value === 'AFTER_INVOICE_CHECK' && validateLevel === 'FORBIDDEN') {
        record.set('validateLevel', null);
      }
      record.set('dimension', null);
    }
  }, []);

  // 当enableCheckFlag为否即等于0的时候去掉AFTER_INVOICE_CHECK
  const optionsFilter = useCallback(
    (option) => {
      return (
        enableCheckFlag === 1 ||
        (enableCheckFlag === 0 && option.get('value') !== 'AFTER_INVOICE_CHECK')
      );
    },
    [enableCheckFlag]
  );

  // 当OCR识别成功AFTER_OCR，发票查验成功后AFTER_INVOICE_CHECK，校验等级只能选警告
  const optionsLevelFilter = useCallback((option, record) => {
    const invoiceVerifyNode = record.get('invoiceVerifyNode');
    const flag = ['AFTER_OCR', 'AFTER_OFD', 'AFTER_INVOICE_CHECK'].includes(invoiceVerifyNode);
    return (flag && option.get('value') !== 'FORBIDDEN') || !flag;
  }, []);
  // 当enableCheckFlag为否即等于0时，校验维度不能选择税务发票查验状态：查验成功CHECK_STATUS_SUCCESS和税务发票发票状态：正常或已红冲INVOICE_STATUS_NORMAL_OR_NEGATIVE
  // 当enableCheckFlag为否即等于1时同时校验节点为AFTER_OCR时，校验维度不能选择税务发票查验状态：查验成功CHECK_STATUS_SUCCESS和税务发票发票状态：正常或已红冲INVOICE_STATUS_NORMAL_OR_NEGATIVE
  // 当校验节点是提交时才能选择 发票种类唯一INVOICE_TYPE_UNIQUE
  const optionsDimensionFilter = useCallback((option, record) => {
    const value = option.get('value');
    const invoiceVerifyNode = record.get('invoiceVerifyNode');
    const invoiceVerifyFlag = invoiceVerifyNode === 'AFTER_OCR';
    const invoiceVerifySubmit = invoiceVerifyNode === 'SUBMIT';
    const flag = ['CHECK_STATUS_SUCCESS', 'INVOICE_STATUS_NORMAL_OR_NEGATIVE'].includes(value);
    const flagUnique = value === 'INVOICE_TYPE_UNIQUE';
    return (
      ((enableCheckFlag === 1 && (!invoiceVerifyFlag || (invoiceVerifyFlag && !flag))) ||
        (enableCheckFlag === 0 && !flag)) &&
      (!flagUnique || (invoiceVerifySubmit && flagUnique))
    );
  }, []);
  /**
   * @description: 弹窗确认回调
   * @param {*}
   * @return {Boolean} 是否都提交成功
   */
  const handleSubmit = useCallback(async () => {
    const validateRes = await checkRuleDs.validate();
    if (!validateRes) return false;
    const res = await checkRuleDs.submit();
    if (res && res.failed) {
      checkRuleDs.query();
    }
  }, [checkRuleDs]);

  const { editFlag, settleConifgId } = useContext(Store);

  const columns = useMemo(
    () => [
      {
        name: 'invoiceVerifyNode',
        width: 150,
        editor: (record) =>
          editFlag ? <Select optionsFilter={(option) => optionsFilter(option, record)} /> : false,
      },
      {
        name: 'invoiceType',
        editor: editFlag,
      },
      {
        name: 'validateLevel',
        width: 150,
        help: intl
          .get(`ssta.settleStrategy.view.help.invoiceVerifyValidateLevel`)
          .d(
            '发票查验校验规则中校验节点为确认，校验等级为警告时，不支持工作流最后一个节点批量审批，若用户启用工作流只读表单批量审批时则系统不会警告提醒'
          ),
        editor: (record) =>
          editFlag ? (
            <Select optionsFilter={(option) => optionsLevelFilter(option, record)} />
          ) : (
            false
          ),
      },
      {
        name: 'dimension',
        editor: (record) =>
          editFlag ? (
            <Select optionsFilter={(option) => optionsDimensionFilter(option, record)} />
          ) : (
            false
          ),
      },
    ],
    [editFlag]
  );

  /**
   * 自定义行内 新增 为-1时行后新增
   */
  const handleAdd = () => {
    const record = checkRuleDs.create({}, 0);
    record.setState('editing', true);
  };

  const handleDelete = async () => {
    const res = await checkRuleDs.delete(
      checkRuleDs.selected,
      getSelectedNegActConfirmMsg('delete', checkRuleDs)
    );
    if (res && res.success) {
      checkRuleDs.query(undefined, undefined, true);
    }
  };

  const buttons = () => {
    if (editFlag && settleConifgId !== 'create') {
      return [
        ['add', { onClick: handleAdd }],
        [
          'delete',
          {
            icon: 'delete_sweep',
            onClick: handleDelete,
            children: intl.get('hzero.common.button.batchDelete').d('批量删除'),
          },
        ],
      ];
    } else {
      return [];
    }
  };

  return (
    <Table
      dataSet={checkRuleDs}
      selectionMode={!editFlag ? 'none' : 'rowbox'}
      buttons={buttons()}
      columns={columns}
      customizedCode="SSTA_STRATEGY_DETAIL.CHECK_RULE"
      style={{ maxHeight: 'calc(100vh - 220px)' }}
    />
  );
});
