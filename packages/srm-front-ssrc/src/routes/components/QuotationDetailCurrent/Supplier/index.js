/* eslint-disable no-param-reassign */
import React, { useRef } from 'react';
import { Modal } from 'choerodon-ui/pro';
import { isFunction, debounce, compose } from 'lodash';
import { observer } from 'mobx-react-lite';
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
    rfxHeaderId,
    onBeforeOpen,
    currentModal = {},
    remote,
    pageFrom = '',
    bidFlag = false,
    headerData = {},
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
    if (isFunction(onBeforeOpen) && !currentEditDisable) {
      await onBeforeOpen(); // 打开弹框之前做的一些操作
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
      rfxHeaderId,
      remote,
      pageFrom,
      bidFlag,
      headerData,
    };

    const modalOnOk = async () => {
      const result = await contentRef.current?.handleSaveAll();

      if (result === false) {
        return false;
      }

      // 为了规避校验成功但不返回true的场景
      if (isFunction(onOk)) {
        onOk();
      }
      return true;
    };

    let currentModalProps = {};

    const modalProps = {
      title: intl.get(`ssrc.common.view.message.title.quotationDetail`).d('报价明细'),
      key: Modal.key(),
      children: <Content {...props} />,
      okProps: {
        disabled: currentEditDisable || abandonedFlagRef.current,
        waitType: 'debounce',
        wait: 1200,
      },
      drawer: true,
      style: {
        width: '1090px',
      },
      onOk: modalOnOk,
      okButton: !currentEditDisable,
      okText: intl.get('hzero.common.button.save').d('保存'),
      onCancel: () => {
        if (isFunction(onCancel)) {
          onCancel();
        }
      },
      afterClose: () => {
        currentModal.current = null;
        modalCountRef.current = 0;
        // eslint-disable-next-line no-unused-expressions
        isFunction(afterClose) && afterClose();
      },
      ...(currentModalProps || {}),
    };

    currentModalProps = remote
      ? remote.process('SSRC_QUOTATION_DETAIL_CURRENT_SUPPLIER_MODAL_PROPS', modalProps, {
          bidFlag,
          pageProps: prop,
          modalContentProps: props,
        })
      : modalProps;

    currentModalProps = currentModalProps || modalProps;
    if (!currentModal?.current) {
      currentModal.current = Modal.open(currentModalProps);
    } else {
      currentModal.current.update(currentModalProps);
    }
  }, 1200);

  return quotationDetailFlag ? (
    <a onClick={handleShowModal} disabled={disabled}>
      {`${intl.get(`ssrc.common.view.message.button.quotationTitle`).d('报价明细')}`}
    </a>
  ) : (
    '-'
  );
};

const hocComponent = (NewComponent) => {
  return compose(
    formatterCollections({
      code: [
        'ssrc.supplierQuotation',
        'ssrc.common',
        'ssrc.inquiryHall',
        'scux.ssrc',
        'sscux.ssrc',
      ],
    }),
    remoteHoc(
      {
        code: 'SSRC_QUOTATION_DETAIL_CURRENT_SUPPLIER',
        name: 'remote',
      },
      {
        events: {
          clearParent() {},
          remoteAfterHandleDeleteSuccess() {},
          remoteAfterHandleSaveSuccess() {},
        },
      }
    )
  )(observer(NewComponent));
};

export default hocComponent(Index);
