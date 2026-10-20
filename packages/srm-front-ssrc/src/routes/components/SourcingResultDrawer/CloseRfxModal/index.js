/**
 * closeRFX - 关闭询价单
 * */

import React from 'react';
import { DataSet, Modal, Form, TextArea, Attachment } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import classnames from 'classnames';
import styles from './index.less';

import { formDS } from './formDS';

/**
 * c7n关闭询价单通用方法
 * @param {*} afterClose 确定关闭的回调
 */
export default function closeRFX(afterClose = () => {}, documentTypeName, remote) {
  const formDs = new DataSet(
    remote
      ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_CLOSE_RFX_DRAWER_DS', formDS())
      : formDS()
  );

  const handleClose = async () => {
    const validate = await formDs.validate();
    if (!validate) {
      return false;
    }
    const { remark, closeAttachmentUuid } = formDs.current?.get(['remark', 'closeAttachmentUuid']);
    afterClose({ remark, closeAttachmentUuid, otherParams: formDs.current?.toData() });
  };

  Modal.open({
    destroyOnClose: true,
    closable: true,
    drawer: true,
    key: Modal.key(),
    style: { width: 380 },
    title: intl
      .get(`ssrc.inquiryHall.view.message.button.commonCloseInquiryList`, { documentTypeName })
      .d(`关闭{documentTypeName}`),
    children: (
      <Form
        dataSet={formDs}
        labelWidth={100}
        labelLayout="float"
        className={classnames(styles['close-from-wrapper'])}
      >
        <h3 className={classnames(styles['close-sub-title'])}>
          {intl.get(`ssrc.inquiryHall.view.message.close.inquiryListReason`).d('关闭理由')}
        </h3>
        <TextArea name="remark" cols={180} rows={2} resize />
        <h3 className={classnames(styles['close-sub-title'], styles['close-top-16'])}>
          {intl.get('hzero.common.upload.modal.title').d('附件')}
        </h3>
        <Attachment name="closeAttachmentUuid" />
        {remote
          ? remote.render('SSRC_INQUIRY_HALL_NEW_LIST_RENDER_CLOSE_RFXDRAWER_NODE', <></>)
          : null}
      </Form>
    ),
    onOk: async () => {
      if (remote.event) {
        remote.event.fireEvent('closeSectionRfxOnOk', {
          handleClose,
          documentTypeName,
        });
      } else {
        handleClose();
      }
    },
  });
}
