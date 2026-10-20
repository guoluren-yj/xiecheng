// 线下整单录入 阶梯报价 c7n 只读

import React, { useMemo, useCallback } from 'react';
import { DataSet, Modal } from 'choerodon-ui/pro';
import { noop, throttle } from 'lodash';

import intl from 'utils/intl';

import { baseInfoDS } from '../ds/baseInfoDS';
import { tableDS } from './ds/tableDataSet';
import Content from './pages/Content';

const LadderPrice = (props = {}) => {
  const {
    headerDS = {}, // 报价头ds
    record: currentLineRecord = {}, // 报价行record
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
  } = props;

  const { priceTypeCode = null } = headerDS.current ? headerDS.current.get(['priceTypeCode']) : {};

  const isUnTaxPriceFlag = priceTypeCode && priceTypeCode === 'NET_PRICE';
  // const TableFieldDisabledCommonFlag = abandonedFlag || eliminateFlag;

  const formDS = useMemo(() => new DataSet(baseInfoDS()), []);
  const tableLineDS = useMemo(
    () =>
      new DataSet(
        tableDS({
          readOnly,
          isUnTaxPriceFlag,
          // TableFieldDisabledCommonFlag,
          pageName,
          doubleUnitFlag,
          // diyLadderQuotationFlag,
        })
      ),
    [doubleUnitFlag]
  );

  // init modal page
  const initPage = useCallback(() => {
    const formData = currentLineRecord?.toData() || {};
    formDS.loadData([
      {
        ...formData,
        currencyCode: formData?.quotationCurrencyCode,
      },
    ]);
    const { rfxLineItemId, offlineQuoLineId, recordId } = formData;

    tableLineDS.setQueryParameter('QUERY', {
      organizationId,
      rfxLineItemId,
      offlineQuoLineId,
      recordId,
      customizeUnitCode: customizeFlag ? customizeUnitCode : null,
    });
    tableLineDS.query();
  }, [currentLineRecord, customizeUnitCode, customizeFlag]);

  // modal cancel
  const handleCancel = useCallback(() => {
    formDS.reset();
    tableLineDS.reset();
    formDS.loadData();
    tableLineDS.loadData();

    currentModal.current = null;
    onCancel();
  }, [formDS, tableLineDS, currentModal]);

  // model ok
  const handleOk = useCallback(() => {
    if (readOnly) {
      return;
    }

    handleCancel();
  }, [readOnly, handleCancel]);

  // modal open or update
  const viewLadderLevelModal = useCallback(
    throttle(async () => {
      await initPage();

      const pageContentProps = {
        formDS,
        tableLineDS,
        ...props,
        doubleUnitFlag,
        isUnTaxPriceFlag,
        currentLineRecord,
        pageName,
        // diyLadderQuotationFlag,
      };

      const modalProps = {
        title: intl.get(`ssrc.supplierQuotation.view.message.button.ladderLevel`).d('阶梯报价'),
        children: <Content {...pageContentProps} />,
        onCancel: handleCancel,
        onOk: handleOk,
        drawer: true,
        closable: true,
        style: {
          width: '1090px',
        },
        cancelButton: false,
        // okButton: !readOnly,
        okText: intl.get('hzero.common.button.close').d('关闭'),
        afterClose: () => {
          currentModal.current = null;
        },
      };

      if (!currentModal?.current) {
        currentModal.current = await Modal.open(modalProps);
      } else {
        await currentModal?.current?.update?.(modalProps);
      }
    }, 500),
    [
      formDS,
      tableLineDS,
      handleCancel,
      handleOk,
      pageName,
      doubleUnitFlag,
      currentModal,
      isUnTaxPriceFlag,
      currentLineRecord,
    ]
  );

  return (
    <a onClick={() => viewLadderLevelModal()} disabled={disabled}>
      {intl.get(`ssrc.supplierQuotation.view.message.button.ladderLevel`).d('阶梯报价')}
    </a>
  );
};

export default LadderPrice;
