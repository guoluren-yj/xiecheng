/*
 * @Description: 工作台终止组件
 * @Date: 2022-05-30 17:44:42
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React from 'react';
import { Modal, TextArea, Form, DataSet, Attachment, TextField } from 'choerodon-ui/pro';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import intl from 'utils/intl';
import classnames from 'classnames';
import styles from './index.less';

// 终止原因
const terminateDS = () => ({
  fields: [
    {
      name: 'pcNum',
      type: 'string',
      label: intl.get(`spcm.common.model.common.pcNum`).d('协议编号'),
    },
    {
      name: 'pcName',
      type: 'string',
      label: intl.get(`spcm.common.model.common.pcName`).d('协议名称'),
    },
    {
      name: 'createByRealName',
      type: 'string',
      label: intl.get(`spcm.common.model.common.createByRealName`).d('创建人'),
    },
    {
      name: 'terminationReason',
      type: 'string',
      label: intl.get(`spcm.common.model.terminationReason`).d('终止原因'),
      required: true,
      validator: (value) => {
        if (value && value.length > 480) {
          return intl.get('hzero.common.validation.max', { max: 480 });
        }
        return true;
      },
    },
    {
      name: 'terminationAttachmentUuid',
      type: 'string',
      label: intl.get(`spcm.common.model.terminationAttachment`).d('终止文件'),
    },
  ],
});

export default function showTerminateModal(onTerminate, { customizeForm, headerInfo = {} } = {}) {
  // 初始化ds;
  const terminateDs = new DataSet(terminateDS());
  terminateDs.create(headerInfo);
  const children = customizeForm(
    {
      code: 'SPCM.WORKSPACE_COMMON.TERMINATION',
    },
    <Form
      dataSet={terminateDs}
      columns={1}
      labelAlign="left"
      labelLayout="float"
      className={classnames(styles['close-from-wrapper'])}
    >
      <TextField disabled name="pcNum" />
      <TextField disabled name="pcName" />
      <TextField disabled name="createByRealName" />
      <h3
        name="reasonTitle"
        className={classnames(styles['close-sub-title'], styles['close-top-16'])}
      >
        {intl.get(`spcm.common.model.terminationReason`).d('终止原因')}
      </h3>
      <TextArea name="terminationReason" resize="both" />
      <h3
        name="attachmentTitle"
        className={classnames(styles['close-sub-title'], styles['close-top-16'])}
      >
        {intl.get('hzero.common.upload.modal.title').d('附件')}
      </h3>
      <Attachment
        bucketName={PRIVATE_BUCKET}
        name="terminationAttachmentUuid"
        bucketDirectory="purchaser-attachment"
        afterOpenUploadModal={(uuid) => {
          terminateDs.current.set('terminationAttachmentUuid', uuid);
        }}
      />
    </Form>
  );

  Modal.open({
    closable: true,
    drawer: true,
    key: Modal.key(),
    title: intl.get(`spcm.contractChange.view.button.terminate`).d('终止'),
    style: {
      width: '380px',
    },
    children,
    afterClose: () => {
      terminateDs.reset();
    },
    onOk: async () => {
      const flag = await terminateDs.validate();
      if (flag) {
        await onTerminate(terminateDs);
      } else {
        return false;
      }
    },
  });
}
