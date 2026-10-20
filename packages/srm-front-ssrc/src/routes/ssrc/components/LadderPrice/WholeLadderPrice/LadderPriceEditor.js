// 线下整单录入 阶梯报价 c7n

import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { DataSet, useModal } from 'choerodon-ui/pro';
import { noop, throttle, isFunction } from 'lodash';
import { observer } from 'mobx-react';

import intl from 'utils/intl';

import { baseInfoDS } from '../ds/baseInfoDS';
import { tableDS } from './ds/tableDataSet';
import EditorContent from './pages/EditorContent';

const LadderPriceEditor = (props = {}) => {
  const {
    headerDS = {}, // 报价头ds
    record: currentLineRecord = {}, // 报价行record
    onBeforeOpen,
    onCancel = noop,
    // onOk = noop,
    disabled = false,
    readOnly = false, // 只读内容
    organizationId,
    customizeUnitCode = null, // 个性化编码
    customizeFlag = 0, // 是否需要个性化
    pageName = '', // quotationHistory 代表报价查询或者报价页面
    // uiType = 'c7n-pro',
    doubleUnitFlag = false,
    offlineEntryRemote,
    currentModal = {}, // 防止多行多个组件实例打开多次
    tableRowKey = '', // table row key
  } = props;

  const tableRef = useRef({});

  const Modal = useModal();

  const modalCountRef = useRef(0); // 打开阶梯报价弹框数量

  const { priceTypeCode = null, rfxLineItemId } = headerDS.current
    ? headerDS.current.get(['priceTypeCode', 'rfxLineItemId'])
    : {};
  const {
    offlineQuoLineId,
    rfxLineItemId: quotationRfxLineItemId,
    quotationCurrencyCode,
  } = currentLineRecord
    ? currentLineRecord.get(['offlineQuoLineId', 'rfxLineItemId', 'quotationCurrencyCode'])
    : {};

  const currencyCode = quotationCurrencyCode?.currencyCode;

  useEffect(() => {
    if (!formDS?.current) {
      return;
    }

    formDS.current.set('currencyCode', currencyCode);
  }, [currencyCode]);

  const isUnTaxPriceFlag = priceTypeCode && priceTypeCode === 'NET_PRICE'; // 未税标识
  // const TableFieldDisabledCommonFlag = abandonedFlag || eliminateFlag; // 表格禁用逻辑

  const formDS = useMemo(() => new DataSet(baseInfoDS()), []);

  const tableLineDS = useMemo(
    () =>
      new DataSet(
        tableDS({
          readOnly,
          isUnTaxPriceFlag,
          pageName,
          doubleUnitFlag,
          offlineEntryRemote,
        })
      ),
    [readOnly, isUnTaxPriceFlag, pageName, doubleUnitFlag]
  );

  const initPage = useCallback(() => {
    const formData = currentLineRecord?.toData() || {};

    formDS.loadData([
      {
        ...formData,
        currencyCode,
      },
    ]);

    tableLineDS.setQueryParameter('QUERY', {
      organizationId,
      rfxLineItemId: rfxLineItemId || quotationRfxLineItemId,
      offlineQuoLineId,
      // recordId,
      customizeUnitCode: customizeFlag ? customizeUnitCode : null,
    });
    tableLineDS.query();
  }, [
    currentLineRecord,
    customizeUnitCode,
    customizeFlag,
    // recordId,
    offlineQuoLineId,
    quotationRfxLineItemId,
    tableLineDS,
    quotationCurrencyCode?.currencyCode,
  ]);

  // modal cancel
  const handleCancel = useCallback(() => {
    formDS.reset();
    tableLineDS.reset();
    formDS.loadData();
    tableLineDS.loadData();
    onCancel();
  }, [formDS, tableLineDS]);

  // model ok
  const handleOk = useCallback(
    throttle(async () => {
      const { handleSave = () => {} } = tableRef.current || {};
      const result = await handleSave();
      if (!result) {
        return false;
      }

      await onCancel();
    }, 1200),
    [readOnly]
  );

  // open modal
  const viewLadderLevelModal = useCallback(
    throttle(async () => {
      const modalCount = modalCountRef.current;
      if (modalCount >= 1) {
        return;
      } else {
        modalCountRef.current = modalCount + 1;
      }
      if (isFunction(onBeforeOpen)) {
        const beforeOpenOperateResult = await onBeforeOpen();
        const failedFlag =
          beforeOpenOperateResult === false || beforeOpenOperateResult instanceof Error;
        if (failedFlag) {
          modalCountRef.current = 0;
          return;
        }
      }

      await initPage();

      const pageContentProps = {
        formDS,
        tableLineDS,
        ...props,
        offlineQuoLineId,
        isUnTaxPriceFlag,
        currentLineRecord,
        pageName,
        doubleUnitFlag,
        onRef: tableRef,
        tableRowKey,
        currencyCode,
      };

      const modalProps = {
        title: intl.get(`ssrc.supplierQuotation.view.message.button.ladderLevel`).d('阶梯报价'),
        children: <EditorContent {...pageContentProps} />,
        onCancel: handleCancel,
        onOk: handleOk,
        drawer: true,
        closable: true,
        style: {
          width: '1090px',
        },
        okButton: !readOnly,
        // okCancel: false,
        // okText: intl.get('hzero.common.button.save').d('保存'),
        afterClose: () => {
          currentModal.current = null;
          modalCountRef.current = 0;
        },
      };

      if (!currentModal?.current) {
        currentModal.current = await Modal.open(modalProps);
      } else {
        await currentModal?.current?.update?.(modalProps);
      }
    }, 1200),
    [
      formDS,
      tableLineDS,
      handleCancel,
      handleOk,
      pageName,
      offlineQuoLineId,
      doubleUnitFlag,
      currentLineRecord,
      currentModal,
      initPage,
      currencyCode,
    ]
  );

  return (
    <a onClick={viewLadderLevelModal} disabled={disabled}>
      {intl.get(`ssrc.supplierQuotation.view.message.button.ladderLevel`).d('阶梯报价')}
    </a>
  );
};

export default observer(LadderPriceEditor);
