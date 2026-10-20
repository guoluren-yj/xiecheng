/**
 * closeRFX - 关闭询价单公用弹框
 * @date: 2021-02-25
 * @author: jamie lee<zhijian.li@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 * */

import React from 'react';
import { DataSet, Modal, Form, TextArea, Attachment } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import notification from 'utils/notification';

import { closeRFXDS } from './closeRFXDS';

/**
 * c7n关闭询价单通用方法
 * @param {*} rfxHeaderId 关闭单据ID
 * @param {*} afterClose 确定关闭的回调
 */
export default function closeRFX(rfxHeaderId, afterClose = () => {}) {
  const formDS = new DataSet(closeRFXDS(rfxHeaderId, afterClose));
  const attProps = {
    name: 'closeAttachmentUuid',
    help: (
      <div style={{ marginTop: '10px' }}>
        {intl
          .get(`ssrc.inquiryHall.view.message.upload.help`)
          .d('大小不超过50M，支持扩展名：.zip .doc .pdf .jpg...')}
      </div>
    ),
    max: 9,
    fileSize: 50 * 1024 * 1024,
    sortable: false,
  };
  Modal.open({
    destroyOnClose: true,
    closable: true,
    key: Modal.key(),
    title: intl.get(`ssrc.qualiExam.view.message.button.close`).d('关闭'),
    children: (
      <Form dataSet={formDS} labelWidth={100}>
        <TextArea name="remark" cols={180} rows={2} resize />
        <Attachment {...attProps} />
      </Form>
    ),
    onOk: async () => {
      const validate = await formDS.validate();
      if (!validate) {
        return false;
      }
      try {
        // 暂时解决接口请求为200，返回failed为true的情况
        await formDS.submit();
      } catch (e) {
        notification.error({
          message: intl.get('hzero.common.notification.error').d('操作失败'),
          description: e.message,
        });
        return false;
      }
    },
  });
}
