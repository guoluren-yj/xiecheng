/*
 * @Description: 结算策略详情-字体加粗弹框
 * @Date: 2022-10-17 14:44:10
 * @Author: yan.xie <yan.xie@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useEffect, useContext, memo, useCallback, useRef, useMemo } from 'react';
import { intersection } from 'lodash';
import { useDataSet, Select } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import EditorForm from '@/routes/Components/EditorForm';
import { uxTitleCssDS } from '@/stores/SettleStrategyDS';
import { Store } from '../StoreProvider';

/**
 * @description: 结算策略详情-字体加粗弹框
 * @param {Object} props
 * @return {ReactNode}
 */
export default memo(({ documentType, modal }) => {
  const { editFlag, settleConfigId } = useContext(Store);
  const formRef = useRef();

  // ux标题样式
  const uxTitleCssDs = useDataSet(() => uxTitleCssDS(), []);

  useEffect(() => {
    uxTitleCssDs.setQueryParameter('documentHeaderType', documentType);
    uxTitleCssDs.setQueryParameter('settleConfigId', settleConfigId);
    uxTitleCssDs.query();
  }, [uxTitleCssDs, documentType, settleConfigId]);

  useEffect(() => {
    modal.handleOk(async () => {
      const res = await uxTitleCssDs.submit();
      return res;
    });
  }, [uxTitleCssDs, modal]);

  useEffect(() => {
    uxTitleCssDs.addEventListener('update', handleUpdate);
    return () => {
      uxTitleCssDs.removeEventListener('update', handleUpdate);
    };
  }, [uxTitleCssDs, handleUpdate]);

  const handleUpdate = useCallback(({ record, name }) => {
    // 【显示区域】若在选择后更新，【加粗字体】同步清空
    if (name === 'displayArea') {
      record.set('cssJson', []);
      // eslint-disable-next-line no-unused-expressions
      formRef.current?.element?.blur();
    }
  }, []);

  // 付款(含发票) 值集选项过滤
  const filterPayInvOption = useCallback(
    (record) => {
      const displayAreaArr = uxTitleCssDs?.current?.get('displayArea') || [];
      // 当【显示区域】选中 未付款金额等式(Unpaid Amount Equation)  ，则【加粗字体】值集可选择  付款申请金额、本次实际付款金额、本次预付款核销金额
      // 当【显示区域】选中 尾差金额等式(Tail Difference Equation) ，则【加粗字体】值集可选择  税务发票 、发票申请金额、尾差
      // 若都选择，则不做限制
      const interArr = intersection(displayAreaArr, [
        'Tail Difference Equation',
        'Unpaid Amount Equation',
      ]);

      const filterFlag = interArr.includes('Unpaid Amount Equation')
        ? ['paymentApplyAmount', 'paymentAmount', 'applyAmount'].includes(record.get('value'))
        : ['invoiceTaxIncludedAmount', 'taxIncludedAmount', 'tailDiffAmount'].includes(
            record.get('value')
          );

      return interArr.length > 1
        ? record.get('parentValue') === documentType
        : interArr.length === 0
        ? false
        : record.get('parentValue') === documentType && filterFlag;
    },
    [uxTitleCssDs, documentType]
  );

  const editorColumns = useMemo(
    () => [
      {
        name: 'displayArea',
        editor: Select,
        label: intl.get(`ssta.settleStrategy.model.settleStrategy.displayArea`).d('显示区域'),
        optionsFilter: (record) => record.get('parentValue') === documentType,
        help:
          documentType === 'PAYMENT'
            ? intl
                .get(`ssta.settleStrategy.view.help.showUxTitleDisplayArea`)
                .d('多个标题同时配置按标题序号优先展示序号最小的唯一标题')
            : undefined,
        showHelp: 'newLine',
      },
      {
        name: 'cssJson',
        ref: formRef,
        editor: Select,
        label: intl.get(`ssta.settleStrategy.model.settleStrategy.uxFontWeight`).d('加粗字体'),
        help: intl
          .get(`ssta.settleStrategy.view.message.uxFontWeightHelp`)
          .d('控制金额下的备注信息，是否加粗展示【字段描述+数值】'),
        optionsFilter: (record) =>
          ['INVOICE_PAYMENT'].includes(documentType)
            ? filterPayInvOption(record)
            : record.get('parentValue') === documentType,
      },
    ],
    [documentType, filterPayInvOption]
  );
  return (
    <EditorForm
      columns={1}
      dataSet={uxTitleCssDs}
      editorFlag={editFlag}
      editorColumns={editorColumns}
    />
  );
});
