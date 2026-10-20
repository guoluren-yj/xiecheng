import React, { useState, useCallback } from 'react';
import { Drawer, Button } from 'hzero-ui';
import { Modal } from 'choerodon-ui/pro';
import remoteHoc from 'hzero-front/lib/utils/remote';
import { observer } from 'mobx-react-lite';
import { compose } from 'lodash';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import styles from './index.less';
import Content from './Content';

/**
 * 慎重传参allowSupplierViewFlag和allowSupplierViewFlag
 * 在供应商未报价之前采购方查看报价明细 【都不传】【报价明细弹框2】
 * 供应商报价查看报价明细 传【allowSupplierViewFlag】【报价明细弹框3】
 * 供应商报完价之后采购方查看报价明细 传【allowBuyerViewFlag】【报价明细弹框5】
 * @param {Boolean} allowSupplierViewFlag
 * @param {Boolean} allowBuyerViewFlag
 */
const Index = ({
  rowData = {},
  sourceFrom,
  tenantId,
  allowSupplierViewFlag = false,
  allowBuyerViewFlag = false,
  sourceHeaderId,
  modalType = 'c7n-pro',
  uiType = 'hzero',
  sourceResultId, // 协议通过sourceResultId查询报价明细
  quotationHistoryFlag = 0,
  remote,
  bidFlag,
}) => {
  const [visible, setVisible] = useState(false);
  const handleCancel = useCallback(() => setVisible(false), []);

  const { quotationLineId, quotationDetailFlag } =
    uiType === 'hzero' ? rowData : rowData?.get(['quotationLineId', 'quotationDetailFlag']);

  const props = {
    rowData,
    sourceFrom,
    tenantId,
    allowSupplierViewFlag,
    allowBuyerViewFlag,
    sourceHeaderId,
    rowKeyId: sourceResultId || quotationLineId ? 'supQuotationDetailId' : 'quotationDetailId',
    uiType,
    sourceResultId,
    quotationHistoryFlag,
    bidFlag,
    remote,
  };

  const handleShowModal = () => {
    // 为了适配工作流中c7n modal与h0 modal 遮挡bug ps: h0 modal会在iframe里, 而c7n modal则在iframe parent中
    if (modalType !== 'c7n-pro') {
      setVisible(true);
      return;
    }

    const modalProps = {
      title: intl.get(`ssrc.common.view.message.title.quotationDetail`).d('报价明细'),
      key: Modal.key(),
      children: <Content {...props} />,
      drawer: true,
      style: {
        width: '1090px',
      },
      onOk: () => {},
      onCancel: () => {},
      okButton: false,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      cancelProps: {
        color: 'primary',
      },
    };

    const currentModalProps = remote
      ? remote.process('SSRC_QUOTATION_DETAIL_CURRENT_VIEW_MODAL_PROPS', modalProps, {
          bidFlag,
        })
      : modalProps;

    // c7n modal展示
    Modal.open({
      ...(currentModalProps || {}),
    });
  };

  return (
    <>
      {quotationDetailFlag || sourceResultId ? (
        <a onClick={handleShowModal}>
          {`${intl.get(`ssrc.common.view.message.button.quotationTitle`).d('报价明细')}`}
        </a>
      ) : null}
      {/*  h0报价明细 */}
      {visible && (
        <Drawer
          okText={intl.get('hzero.common.button.save').d('保存')}
          closable
          destroyOnClose
          title={intl.get(`ssrc.common.view.message.title.quotationDetail`).d('报价明细')}
          width="70%"
          visible={visible}
          onClose={handleCancel}
          onOk={handleCancel}
        >
          <Content {...props} />
          <div className={styles['modal-footer-button-group']}>
            <Button type="primary" onClick={handleCancel} className={styles['button-m-l-sm']}>
              {intl.get('hzero.common.button.ok').d('确定')}
            </Button>
            <Button onClick={handleCancel}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>
          </div>
        </Drawer>
      )}
    </>
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
    remoteHoc({
      code: 'SSRC_QUOTATION_DETAIL_CURRENT_VIEW',
      name: 'remote',
    })
  )(observer(NewComponent));
};

export default hocComponent(Index);
