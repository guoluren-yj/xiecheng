// 阶梯报价 c7n

import React, { useMemo, useCallback, useRef } from 'react';
import { DataSet, useModal } from 'choerodon-ui/pro';
import { noop, throttle, isFunction, debounce } from 'lodash';

import intl from 'utils/intl';

import { baseInfoDS } from './ds/baseInfoDS';
import { tableDS } from './ds/tableDataSet';
import EditorContent from './pages/EditorContent';

let pageModalCount = 0;

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
    currentModal = {}, // 防止多行多个组件实例打开多次
    tableRowKey = '', // table row key
    remote,
    remoteCode = '',
  } = props;

  const tableRef = useRef({});

  const Modal = useModal();

  const modalCountRef = useRef(0); // 打开阶梯报价弹框数量

  const { priceTypeCode = null, rfxLineItemId } = headerDS.current
    ? headerDS.current.get(['priceTypeCode', 'rfxLineItemId'])
    : {};
  const {
    abandonedFlag,
    eliminateFlag,
    diyLadderQuotationFlag = 0,
    quotationLineCurrentId,
    recordId,
    rfxLineItemId: quotationRfxLineItemId,
  } = currentLineRecord
    ? currentLineRecord.get([
        'abandonedFlag',
        'eliminateFlag',
        'diyLadderQuotationFlag',
        'quotationLineCurrentId',
        'recordId',
        'rfxLineItemId',
      ])
    : {};

  const isUnTaxPriceFlag = priceTypeCode && priceTypeCode === 'NET_PRICE'; // 未税标识
  const TableFieldDisabledCommonFlag = abandonedFlag || eliminateFlag; // 表格禁用逻辑

  const formDS = useMemo(() => new DataSet(baseInfoDS()), []);

  const tableLineDS = useMemo(
    () =>
      new DataSet(
        remote
          ? remote.process(
              `${remoteCode}_PROCESS_LADDER_TABLE_DS`,
              tableDS({
                readOnly,
                isUnTaxPriceFlag,
                TableFieldDisabledCommonFlag,
                pageName,
                doubleUnitFlag,
                diyLadderQuotationFlag,
              }),
              {
                currentLineRecord,
                headerDS,
              }
            )
          : tableDS({
              readOnly,
              isUnTaxPriceFlag,
              TableFieldDisabledCommonFlag,
              pageName,
              doubleUnitFlag,
              diyLadderQuotationFlag,
            })
      ),
    [
      readOnly,
      isUnTaxPriceFlag,
      TableFieldDisabledCommonFlag,
      pageName,
      diyLadderQuotationFlag,
      doubleUnitFlag,
    ]
  );

  const initPage = useCallback(() => {
    const formData = currentLineRecord?.toData() || {};
    formDS.loadData([formData]);

    tableLineDS.setQueryParameter('QUERY', {
      organizationId,
      rfxLineItemId: rfxLineItemId || quotationRfxLineItemId,
      quotationLineCurrentId,
      recordId,
      customizeUnitCode: customizeFlag ? customizeUnitCode : null,
    });
    tableLineDS.query();
  }, [
    currentLineRecord,
    customizeUnitCode,
    customizeFlag,
    recordId,
    quotationLineCurrentId,
    quotationRfxLineItemId,
    tableLineDS,
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
      if (readOnly) {
        return;
      }

      const { handleSave = () => {} } = tableRef.current || {};
      const result = await handleSave();
      if (!result) {
        return false;
      }

      await onCancel();
    }, 1200),
    [readOnly, diyLadderQuotationFlag]
  );

  // open modal
  const viewLadderLevelModal = useCallback(
    debounce(async () => {
      const modalCount = modalCountRef.current;

      if (modalCount >= 1 || pageModalCount >= 1) {
        return;
      } else {
        modalCountRef.current = modalCount + 1;
        pageModalCount += 1;
      }
      if (isFunction(onBeforeOpen) && !readOnly) {
        const beforeOpenOperateResult = await onBeforeOpen();
        const failedFlag =
          beforeOpenOperateResult === false || beforeOpenOperateResult instanceof Error;
        if (failedFlag) {
          return;
        }
      }

      await initPage();

      const pageContentProps = {
        formDS,
        tableLineDS,
        ...props,
        isUnTaxPriceFlag,
        currentLineRecord,
        pageName,
        doubleUnitFlag,
        diyLadderQuotationFlag,
        onRef: tableRef,
        tableRowKey,
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
        okButton: !readOnly && diyLadderQuotationFlag,
        // okCancel: false,
        okText: intl.get('hzero.common.button.save').d('保存'),
        afterClose: () => {
          currentModal.current = null;
          modalCountRef.current = 0;
          pageModalCount = 0;
        },
      };

      if (!currentModal?.current) {
        currentModal.current = await Modal.open(modalProps);
      } else {
        await currentModal?.current?.update?.(modalProps);
      }
    }, 1000),
    [
      formDS,
      tableLineDS,
      handleCancel,
      handleOk,
      pageName,
      quotationLineCurrentId,
      recordId,
      doubleUnitFlag,
      currentLineRecord,
      currentModal,
      initPage,
      readOnly,
    ]
  );

  return (
    <a onClick={viewLadderLevelModal} disabled={disabled}>
      {intl.get(`ssrc.supplierQuotation.view.message.button.ladderLevel`).d('阶梯报价')}
    </a>
  );
};

export default LadderPriceEditor;
