/*
 * @Descripttion: xxxx管理信息--Index
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2024-06-14 10:03:28
 * @LastEditors: yiping.liu
 */
import React, { useRef } from 'react';
import { Modal } from 'choerodon-ui/pro';
import { isFunction } from 'lodash';
import remoteHoc from 'hzero-front/lib/utils/remote';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import Content from './Content';

const Index = (prop) => {
  const {
    rowData,
    sourceFrom,
    uiType = 'hzero',
    operationType = '',
    onOk,
    remote,
    buttonText,
    headerData,
    saveUrl,
    deleteUrl,
    deleteRequestPrams,
    coverInterfaceParam,
    modalProps: otherModalProps = {},
    bidFlag = false,
    totalSaveNoNotification = 0, // 大保存不需要操作成功的提示
    tableDs,
  } = prop;
  const contentRef = useRef();

  const handleShowModal = () => {
    const props = {
      tableDs,
      rowData,
      sourceFrom,
      contentRef,
      uiType,
      operationType,
      remote,
      headerData,
      saveUrl,
      deleteUrl,
      deleteRequestPrams,
      coverInterfaceParam,
      bidFlag,
    };
    const modalOnOk = async () => {
      const result = await contentRef.current?.handleSaveAll({ totalSaveNoNotification });
      if (result !== false) {
        // 为了规避校验成功但不返回true的场景
        if (isFunction(onOk)) {
          await onOk();
        }
        return true;
      }
      return false;
    };

    const modalProps = {
      title: intl.get(`ssrc.common.view.message.title.quotationDetail`).d('报价明细'),
      key: Modal.key(),
      children: <Content {...props} />,
      drawer: true,
      style: {
        width: '1090px',
      },
      onOk: modalOnOk,
      onCancel: () => {},
      ...(otherModalProps || {}),
    };

    const currentModalProps = remote
      ? remote.process('SSRC_QUOTATION_DETAIL_PURCHASER_MODAL_PROPS', modalProps, {
          bidFlag,
          pageProps: prop,
          contentRef,
          modelContentProps: props,
        })
      : modalProps;

    Modal.open({
      ...(currentModalProps || {}),
    });
  };

  return (
    <a onClick={handleShowModal}>
      {buttonText || `${intl.get(`ssrc.common.view.message.button.quotationTitle`).d('报价明细')}`}
    </a>
  );
};

export default remoteHoc(
  {
    code: 'SSRC_QUOTATION_DETAIL_PURCHASER',
    name: 'remote',
  },
  {
    events: {
      modalHandleOKSaved() {},
      remoteAfterHandleDeleteSuccess() {},
    },
  }
)(formatterCollections({ code: ['ssrc.common'] })(Index));
