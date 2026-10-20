import React, { useRef } from 'react';
import { Modal } from 'choerodon-ui/pro';
import { isFunction, debounce } from 'lodash';
import remoteHoc from 'hzero-front/lib/utils/remote';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import Content from './Content';

const Index = (prop) => {
  const {
    rowData,
    sourceFrom,
    detailFrom, // 针对一些子模块的情况
    quotationStatus,
    continuousQuotationFlag,
    disabled,
    onOk,
    onCancel,
    incomingEditDisable,
    afterClose = () => {},
    uiType = 'hzero',
    postAndDeleteParams = {},
    onBeforeOpen,
    remote,
    extendInterfaceParams, // 保存、提交接口需要接收的额外参数
    pageFrom = '',
    bidFlag = false,
    headerData,
  } = prop;
  const modalCountRef = useRef(0); // 打开弹框数量

  let currentEditDisable = quotationStatus === 'QUOTED' && !continuousQuotationFlag;
  if (Array.isArray(incomingEditDisable)) {
    // eslint-disable-next-line prefer-destructuring
    currentEditDisable = incomingEditDisable[0];
  }
  const abandonedFlagRef = useRef(
    (uiType === 'hzero'
      ? rowData?.$form?.getFieldValue('abandonedFlag')
      : rowData?.get('abandonedFlag')) || 0
  );
  const { quotationDetailFlag } =
    uiType === 'hzero' ? rowData : rowData.get(['quotationDetailFlag']);
  const contentRef = useRef();

  const handleShowModal = debounce(async () => {
    const modalCount = modalCountRef.current;
    if (modalCount >= 1) {
      return;
    } else {
      modalCountRef.current = modalCount + 1;
    }
    if (isFunction(onBeforeOpen)) {
      await onBeforeOpen();
    }
    const props = {
      rowData,
      sourceFrom,
      detailFrom,
      quotationStatus,
      continuousQuotationFlag,
      abandonedFlag: abandonedFlagRef.current,
      contentRef,
      currentEditDisable,
      uiType,
      postAndDeleteParams,
      remote,
      extendInterfaceParams,
      pageFrom,
      bidFlag,
      headerData,
    };
    const modalOnOk = async () => {
      const result = await contentRef.current?.handleSaveAll();
      if (result !== false) {
        // 为了规避校验成功但不返回true的场景
        if (isFunction(onOk)) {
          onOk();
        }
        return true;
      }
      return false;
    };

    const modalProps = {
      style: {
        width: '742px',
      },
    };

    const currentModalProps = remote
      ? remote.process('SSRC_QUOTATION_DETAIL_SUPPLIER_MODAL_PROPS', modalProps, {
          bidFlag,
          pageProps: prop,
          modalContentProps: props,
        })
      : modalProps;

    Modal.open({
      title: intl.get(`ssrc.common.view.message.title.quotationDetail`).d('报价明细'),
      key: 'ssrc-quotation-detail-supplier',
      children: <Content {...props} />,
      okProps: {
        disabled: currentEditDisable || abandonedFlagRef.current,
        waitType: 'debounce',
        wait: 1200,
      },
      drawer: true,
      onOk: modalOnOk,
      afterClose: () => {
        modalCountRef.current = 0;
        // eslint-disable-next-line no-unused-expressions
        isFunction(afterClose) && afterClose();
      },
      onCancel: () => {
        // eslint-disable-next-line no-unused-expressions
        isFunction(onCancel) && onCancel();
      },
      ...(currentModalProps || {}),
    });
  }, 1200);

  return quotationDetailFlag ? (
    <a onClick={handleShowModal} disabled={disabled}>
      {`${intl.get(`ssrc.common.view.message.button.quotationTitle`).d('报价明细')}`}
    </a>
  ) : null;
};

export default remoteHoc(
  {
    code: 'SSRC_QUOTATION_DETAIL_SUPPLIER',
    name: 'remote',
  },
  {
    events: {
      clearParent() {},
      remoteAfterHandleSaveSuccess() {},
      remoteAfterHandleDeleteSuccess() {},
    },
  }
)(formatterCollections({ code: ['ssrc.common'] })(Index));
