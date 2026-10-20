import React, { useState, useCallback } from 'react';
import { Drawer, Button } from 'hzero-ui';
import { Modal } from 'choerodon-ui/pro';
import remoteHoc from 'hzero-front/lib/utils/remote';

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
const Index = (props = {}) => {
  const {
    rowData = {},
    sourceFrom,
    tenantId,
    allowSupplierViewFlag = false,
    allowBuyerViewFlag = false,
    sourceHeaderId,
    modalType = 'c7n-pro',
    uiType = 'hzero',
    sourceResultId, // 协议通过sourceResultId查询报价明细
    remote,
    pageFrom = '',
    buttonText, // 按钮名称
    queryTableUrl, // 覆盖查询表格接口方法（ps: 目前寻源立项变更审批需要替换接口）
    queryTableParams, // 查询表格接口接口参数（ps: 目前寻源立项变更审批需要替换接口）
    bidFlag = false,
    quotationHistoryFlag,
    exportParas = {},
  } = props;
  const [visible, setVisible] = useState(false);

  const handleCancel = useCallback(() => setVisible(false), []);

  const { quotationLineId, quotationDetailFlag } =
    uiType === 'hzero' ? rowData : rowData?.get(['quotationLineId', 'quotationDetailFlag']);

  const contentProps = {
    rowData,
    sourceFrom,
    tenantId,
    allowSupplierViewFlag,
    allowBuyerViewFlag,
    sourceHeaderId,
    rowKeyId: sourceResultId || quotationLineId ? 'supQuotationDetailId' : 'quotationDetailId',
    uiType,
    sourceResultId,
    remote,
    pageFrom,
    queryTableUrl,
    queryTableParams,
    bidFlag,
    quotationHistoryFlag,
    exportParas,
  };

  const handleShowModal = (e) => {
    // 为了适配工作流中c7n modal与h0 modal 遮挡bug ps: h0 modal会在iframe里, 而c7n modal则在iframe parent中
    if (modalType !== 'c7n-pro') {
      setVisible(true);
      return;
    }

    e.stopPropagation();
    const modalContentProps = remote
      ? remote.process('SSRC_QUOTATION_DETAIL_VIEW_MODAL_PROCESS_CONTENT_PROPS', contentProps, {
          props,
        })
      : contentProps;
    const modalProps = {
      title: intl.get(`ssrc.common.view.message.title.quotationDetail`).d('报价明细'),
      key: Modal.key(),
      children: <Content {...modalContentProps} />,
      drawer: true,
      style: {
        width: '1090px',
      },
      okButton: false,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      cancelProps: {
        color: 'primary',
      },
      onOk: () => {},
      onCancel: () => {},
    };

    const currentModalProps = remote
      ? remote.process('SSRC_QUOTATION_DETAIL_VIEW_MODAL_PROPS', modalProps, {
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
          {buttonText ||
            `${intl.get(`ssrc.common.view.message.button.quotationTitle`).d('报价明细')}`}
        </a>
      ) : (
        '-'
      )}
      {/*  h0报价明细 */}
      {visible && (
        <Drawer
          okText={intl.get('hzero.common.button.save').d('保存')}
          closable
          destroyOnClose
          title={intl.get(`ssrc.common.view.message.title.quotationDetail`).d('报价明细')}
          width="742px"
          visible={visible}
          onClose={handleCancel}
          onOk={handleCancel}
        >
          <Content {...contentProps} />
          <div className={styles['modal-footer-button-group']}>
            <Button type="primary" onClick={handleCancel} className={styles['button-m-l-sm']}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>
          </div>
        </Drawer>
      )}
    </>
  );
};

export default remoteHoc({
  code: 'SSRC_QUOTATION_DETAIL_VIEW',
  name: 'remote',
})(formatterCollections({ code: ['ssrc.common'] })(Index));
