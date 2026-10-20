/*
 * @Description: file content
 * @Date: 2022-02-08 15:01:33
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, {
  memo,
  Fragment,
  useMemo,
  useEffect,
  useCallback,
  useContext,
  cloneElement,
} from 'react';
import { observer } from 'mobx-react';
import {
  Icon,
  Table,
  useModal,
  Form,
  Button,
  Tooltip,
  Select,
  Modal,
  DataSet,
} from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import { isArray, isNil } from 'lodash';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { queryIdpValue } from 'services/api';
import notification from 'utils/notification';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';

import { getSettleHeaderData } from '@/services/settlePoolServices';
import { multiDimensionPayDS } from '@/stores/NewPurchaseSettleDS';
import { recordPickValues, viewPayPlanModal } from '@/utils/utils';
import MultiPrePayWriteOffModal from './MultiPrePayWriteOffModal';
import { Store } from '../Detail/StoreProvider';
import { useModalOpen } from '../hooks';
import { clickDefaultPlanAmountFlagger } from '@/utils/amountConfig';
import commonStyles from '@/routes/common.less';
import EditorForm from '@/routes/Components/EditorForm';

const QueryBar = memo((props) => {
  const { dataSet, queryDataSet } = props;
  const handleQuery = useCallback(() => {
    dataSet.query();
  }, [dataSet]);
  useEffect(() => {
    queryDataSet.addEventListener('reset', handleQuery);
    queryDataSet.addEventListener('update', handleQuery);
    return () => {
      queryDataSet.addEventListener('reset', handleQuery);
      queryDataSet.removeEventListener('update', handleQuery);
    };
  }, [queryDataSet, handleQuery]);
  return (
    <Form dataSet={queryDataSet} labelLayout="float" columns={3} style={{ paddingBottom: 16 }}>
      <Select name="paymentDimension" clearButton={false} />
      <Button type="reset" funcType="flat" color="primary" style={{ width: 'auto' }}>
        {intl.get('hzero.common.button.reset').d('重置')}
      </Button>
    </Form>
  );
});
const queryBarRender = (props) => <QueryBar {...props} />;

export default observer((props) => {
  const { modal, isModalEdit } = props;
  const c7nModal = useModal();
  const modalOpen = useModalOpen(c7nModal);

  const {
    settleType,
    updateFlag = true,
    settleHeaderDs,
    settleLineDs,
    multiDimensionPayDs: propTableDs,
    customizeCollapse,
    customizeForm,
    customizeTable,
    history,
    remoteProps,
    permissionMap,
    paymentStageDs,
  } = useContext(Store);

  const {
    documentType,
    settleHeaderId,
    amountPrecision,
    paymentDimension,
    paymentControlRuleSource,
    companyId,
    supplierId,
    currencyCode,
    supplierCompanyId,
    prepaymentDimensionMeaning,
  } =
    settleHeaderDs.current?.get([
      'documentType',
      'settleHeaderId',
      'amountPrecision',
      'paymentDimension',
      'paymentControlRuleSource',
      'companyId',
      'supplierId',
      'currencyCode',
      'supplierCompanyId',
      'prepaymentDimensionMeaning',
    ]) || {};

  const multiDimensionPayDs = useMemo(() => {
    if (propTableDs) return propTableDs;
    const normalDS = multiDimensionPayDS(paymentDimension, updateFlag, {
      settleHeaderId,
      companyId,
      supplierId,
      currencyCode,
      supplierCompanyId,
    });
    const processDS = remoteProps
      ? remoteProps.process('SSTA_PURCHASESETTLE_DETAIL.MULTI_DIMENSION_PAY_DSPROPS', normalDS, {})
      : normalDS;
    return new DataSet(processDS);
  }, [
    remoteProps,
    propTableDs,
    paymentDimension,
    updateFlag,
    settleHeaderId,
    companyId,
    supplierId,
    currencyCode,
    supplierCompanyId,
  ]);

  const paymentDimensionParam = multiDimensionPayDs.queryDataSet?.current?.get('paymentDimension');
  const okDisabled =
    multiDimensionPayDs.status !== 'ready' || isNil(multiDimensionPayDs.getState('combineFields'));

  // 响应【一键默认计划金额】按钮点击
  const handleAutoApplyAmount = useCallback(async () => {
    const res = await multiDimensionPayDs.setState('submitType', 'autoApplyAmount').forceSubmit();
    const newData = res?.content;
    if (!isArray(newData)) return;
    // 后端存在DTO数据类型转换，由前端重新拼接
    const realData = newData.map(({ prePaymentLineDTOList, ...others }) => ({
      ...others,
      settleApplyLineList: prePaymentLineDTOList || [],
    }));
    multiDimensionPayDs.loadData(realData);
    notification.success();
  }, [multiDimensionPayDs]);

  // 一键预付款自动核销
  const handleAutoWriteOff = useCallback(async () => {
    const confirmRes = await Modal.confirm({
      title: intl.get('ssta.common.view.message.tip').d('提示'),
      children: intl
        .get('ssta.common.view.help.oneClickPrepayAutoWriteOff', { prepaymentDimensionMeaning })
        .d(
          '点击【一键预付款自动核销】按钮后，系统将按照该单据的预付款核销维度「{prepaymentDimensionMeaning}」进行自动核销，会将之前核销的记录覆盖，且该操作不可逆。同时会根据配置规则自动赋值于【本次付款金额】，核销后请检查本次付款金额和本次核销金额是否符合业务要求'
        ),
    });
    if (confirmRes !== 'ok') return;
    const res = await multiDimensionPayDs.setState('submitType', 'autoWriteOff').forceSubmit();
    if (!res) return;
    notification.success();
    modal.close();
    settleLineDs.query(settleLineDs.currencyPage);
    const cuszLineDs = settleHeaderDs.children?.attributeList;
    if (cuszLineDs) cuszLineDs.query();
    settleHeaderDs.status = 'loading';
    const newHeaderData = getResponse(await getSettleHeaderData({ documentType, settleHeaderId }));
    settleHeaderDs.status = 'ready';
    if (!newHeaderData) return;
    recordPickValues(settleHeaderDs.current, newHeaderData, ['paymentAmount', 'applyAmount']);
  }, [
    modal,
    settleLineDs,
    documentType,
    settleHeaderId,
    settleHeaderDs,
    multiDimensionPayDs,
    prepaymentDimensionMeaning,
  ]);

  const handleUpdateFooter = useCallback(() => {
    if (!modal) return;
    const clickDefaultPlanAmountFlag = clickDefaultPlanAmountFlagger({
      paymentDimension,
      paymentDimensionParam,
      paymentControlRuleSource,
    });
    modal.update({
      footer: (okBtn, cancelBtn) => [
        cloneElement(okBtn, { disabled: okDisabled }),
        clickDefaultPlanAmountFlag && permissionMap.get('clickDefaultPlanAmount') && (
          <Button onClick={handleAutoApplyAmount}>
            {intl.get('ssta.common.view.button.oneClickDefaultPlanAmount').d('一键默认计划金额')}
            <Tooltip
              title={intl
                .get('ssta.common.view.tooltip.oneClickDefaultPlanAmount')
                .d(
                  '点击【一键默认计划金额】按钮，系统将把付款计划「剩余阶段金额」及付款计划下未核销的预付款写入「本次付款金额」&「本次核销金额」中'
                )}
            >
              <Icon type="help" className={commonStyles['ssta-button-help-icon']} />
            </Tooltip>
          </Button>
        ),
        // 【一键预付款自动核销】逻辑为：【一键默认计划金额】不展示
        !clickDefaultPlanAmountFlag && permissionMap.get('clickPrepayAutoWriteOff') && (
          <Button onClick={handleAutoWriteOff}>
            {intl.get('ssta.common.view.button.oneClickPrepayAutoWriteOff').d('一键预付款自动核销')}
          </Button>
        ),
        cancelBtn,
      ],
    });
  }, [
    modal,
    okDisabled,
    permissionMap,
    paymentDimension,
    handleAutoWriteOff,
    handleAutoApplyAmount,
    paymentDimensionParam,
    paymentControlRuleSource,
  ]);

  const handleQueryCombineFields = useCallback(async () => {
    const res = getResponse(
      await queryIdpValue('SSTA.DIMENSION_PAYMENT_MATCH_FIELD_TO_SETTLE_LINE')
    );
    const combineFields = res && isArray(res) ? res.map(({ value }) => value) : [];
    multiDimensionPayDs.setState('combineFields', combineFields);
  }, [multiDimensionPayDs]);

  const handleUpdate = useCallback(
    ({ value, record, name }) => {
      if (name === 'paymentAmount' && (value || value === 0)) {
        record.set('paymentAmount', math.toFixed(value, Number(amountPrecision)));
      }
    },
    [amountPrecision]
  );

  const handleMultiPrePayWriteOff = useCallback(
    (record) => {
      record.set('paymentDimensionParam', paymentDimensionParam);
      modalOpen({
        size: 'large',
        editFlag: isModalEdit,
        title: isModalEdit
          ? intl.get('ssta.purchaseSettle.view.title.multiPrePaymentWriteOff').d('多维度预付款核销')
          : intl
              .get('ssta.purchaseSettle.button.multPrePayWriteOffRecord')
              .d('多维度预付款核销记录'),
        children: <MultiPrePayWriteOffModal topRecord={record} isModalEdit={isModalEdit} />,
      });
    },
    [modalOpen, isModalEdit, paymentDimensionParam]
  );

  const handleSave = useCallback(async () => {
    const paymentSpliteRule = settleHeaderDs.current?.get('paymentSpliteRule');
    multiDimensionPayDs.forEach((record) => {
      record.set('paymentSpliteRule', paymentSpliteRule);
    });
    const res = await multiDimensionPayDs.setState('submitType', 'submit').submit();
    if (!res) return false;
    const { warnMessage } = res.content?.[0] || {};
    notification.success({ description: warnMessage });
    settleLineDs.query(settleLineDs.currencyPage);
    const cuszLineDs = settleHeaderDs.children?.attributeList;
    if (cuszLineDs) cuszLineDs.query();
    if (paymentStageDs) paymentStageDs.query();
    settleHeaderDs.status = 'loading';
    const newHeaderData = getResponse(await getSettleHeaderData({ documentType, settleHeaderId }));
    settleHeaderDs.status = 'ready';
    if (!newHeaderData) return;
    recordPickValues(settleHeaderDs.current, newHeaderData, [
      'paymentDimension',
      'paymentSpliteRule',
      'paymentAmount',
      'applyAmount',
    ]);
  }, [
    settleHeaderDs,
    documentType,
    settleHeaderId,
    settleLineDs,
    multiDimensionPayDs,
    paymentStageDs,
  ]);

  useEffect(() => {
    if (modal && isModalEdit) handleUpdateFooter();
  }, [modal, isModalEdit, handleUpdateFooter]);

  useEffect(() => {
    if (modal && isModalEdit) modal.handleOk(handleSave);
    handleQueryCombineFields();
    multiDimensionPayDs.query();
    multiDimensionPayDs.addEventListener('update', handleUpdate);
    return () => {
      multiDimensionPayDs.removeEventListener('update', handleUpdate);
    };
  }, [modal, isModalEdit, multiDimensionPayDs, handleUpdate, handleSave, handleQueryCombineFields]);

  const columns = useMemo(
    () => [
      {
        name: 'documentNum',
        width: 160,
      },
      {
        name: 'invoicedTaxIncludedAmount',
        width: 150,
      },
      {
        name: 'remainingPaymentAmount',
        width: 150,
      },
      {
        name: 'paymentAmount',
        width: 150,
        editor: isModalEdit,
      },
      {
        name: 'applyAmount',
        width: 150,
      },
      {
        name: 'prePaymentWriteOff',
        title: intl.get(`ssta.purchaseSettle.button.prePaymentWriteOff`).d('预付款核销'),
        width: 150,
        renderer: ({ record }) =>
          record.get('invoicedTaxIncludedAmount') > 0 ? (
            <a onClick={() => handleMultiPrePayWriteOff(record)}>
              {isModalEdit
                ? intl.get('ssta.purchaseSettle.button.prePaymentWriteOff').d('预付款核销')
                : intl
                    .get('ssta.purchaseSettle.button.prePaymentWriteOffRecord')
                    .d('预付款核销记录')}
            </a>
          ) : null,
      },
      // 如果查询条件有值且是采购订单显示付款计划字段或者查询条件没值头信息字段是采购订单
      ...(((!paymentDimensionParam && ['PO', 'CONTRACT', 'PO_LINE'].includes(paymentDimension)) ||
        ['PO', 'CONTRACT', 'PO_LINE'].includes(paymentDimensionParam)) &&
      settleType === 'PAYMENT' &&
      paymentControlRuleSource
        ? [
            {
              name: 'planNum',
              width: 150,
              renderer: ({ value }) => (
                <a
                  onClick={() =>
                    viewPayPlanModal({ planNum: value, history, source: 'multiDimen' })
                  }
                >
                  {value}
                </a>
              ),
            },
            {
              name: 'versionNumber',
              width: 120,
            },
            {
              name: 'planStageNum',
              width: 150,
            },
            {
              name: 'planStageDesc',
              width: 150,
            },
            {
              name: 'planStageAmount',
              width: 150,
            },
            {
              name: 'planStageBalance',
              width: 150,
            },
            {
              name: 'planStagePercent',
              width: 120,
            },
            {
              name: 'planStageStartDate',
              width: 120,
            },
            {
              name: 'planStageEndDate',
              width: 120,
            },
          ]
        : []),
    ],
    [
      history,
      isModalEdit,
      handleMultiPrePayWriteOff,
      settleType,
      paymentDimension,
      paymentControlRuleSource,
      paymentDimensionParam,
    ]
  );

  return (
    <Fragment>
      {customizeCollapse(
        {
          code:
            settleType === 'PAYMENT'
              ? 'SSTA.PURCHASE_SETTLE_DETAIL.PAY_MULTI_DIMEN_ASSIGN_CARDS'
              : 'SSTA.PURCHASE_SETTLE_DETAIL.INV_MULTI_DIMEN_ASSIGN_CARDS',
        },
        <div>
          <Card
            key="paymentDetailInfo"
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl.get(`ssta.common.view.title.paymentDetailInfo`).d('付款明细信息')}
          >
            {customizeTable(
              {
                code:
                  settleType === 'PAYMENT'
                    ? 'SSTA.PURCHASE_SETTLE_DETAIL.PAY_MULTI_DIMEN_PAY_DETAIL'
                    : 'SSTA.PURCHASE_SETTLE_DETAIL.INV_MULTI_DIMEN_PAY_DETAIL',
              },
              <Table
                columns={columns}
                dataSet={multiDimensionPayDs}
                queryBar={queryBarRender}
                style={{ maxHeight: 418 }}
              />
            )}
          </Card>
          <Card
            key="spliteRule"
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl.get(`ssta.common.view.title.spliteRule`).d('拆分规则')}
          >
            <EditorForm
              columns={3}
              dataSet={settleHeaderDs}
              editorFlag={updateFlag}
              editorColumns={[{ name: 'paymentSpliteRule', editor: Select }]}
              customizeForm={customizeForm}
              customizeOptions={{
                // readOnly: true, // 避免更新头字段
                code:
                  settleType === 'PAYMENT'
                    ? 'SSTA.PURCHASE_SETTLE_DETAIL.PAY_MULTI_DIMEN_SPLITE'
                    : 'SSTA.PURCHASE_SETTLE_DETAIL.INV_MULTI_DIMEN_SPLITE',
              }}
            />
          </Card>
        </div>
      )}
    </Fragment>
  );
});
