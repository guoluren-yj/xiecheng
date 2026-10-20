/*
 * AttachmentInfo - 订单明细页-附件信息
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { useCallback, Fragment } from 'react';
import { Form, Attachment } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import styles from './index.less';

const AttachmentInfo = (props) => {
  const {
    ds,
    remote,
    dispatch,
    poHeaderId,
    customizeForm,
    customizeCode = [],
    insideAttachment = true,
    externalAttachment = true,
    terminateSignShow = false,
    attachmentConfig: { readOnly = [], title = [] } = {},
  } = props;
  // 内部附件
  const afterOpenInsideModal = useCallback((uuid) => {
    dispatch({
      type: 'orderExecutionWorkbench/saveAttachmentUUID',
      payload: { poHeaderId, uuidType: 3, uuid },
    }).then((res) => {
      if (res) {
        ds.current.init({ objectVersionNumber: res });
      }
    });
  }, []);

  // 外部附件(采购方)
  const afterOpenExternalModal = useCallback((uuid) => {
    dispatch({
      type: 'orderExecutionWorkbench/saveAttachmentUUID',
      payload: { poHeaderId, uuidType: 1, uuid },
    }).then((res) => {
      if (res) {
        ds.current.init({ objectVersionNumber: res });
      }
    });
  }, []);

  // 外部附件(供应商)
  const afterOpensupplierModal = useCallback((uuid) => {
    dispatch({
      type: 'orderExecutionWorkbench/saveAttachmentUUID',
      payload: { poHeaderId, uuidType: 2, uuid },
    }).then((res) => {
      if (res) {
        ds.current.init({ objectVersionNumber: res });
      }
    });
  }, []);
  return (
    <Fragment>
      <div
        className={styles['order-workspace-attachment']}
        id="order-workSpace-detail-content-attachmentInfo"
      >
        {insideAttachment && (
          <div className={styles['order-workspace-attachment-content']}>
            <h3 className="content-title">
              {title[0] ||
                intl.get('slod.orderExecution.view.attachment.insideAttachment').d('内部附件')}
            </h3>
            {customizeForm(
              { code: customizeCode[0] },
              <Form dataSet={ds} labelLayout="float" columns={1}>
                <Attachment
                  name="purchaserInnerAttachmentUuid"
                  onChange={afterOpenInsideModal}
                  readOnly={readOnly[0]}
                />
                {remote?.process('insideAttachmentExtraForm', null, { props })}
              </Form>
            )}
          </div>
        )}
        {insideAttachment && externalAttachment && (
          <div className={styles['order-workspace-attachmentInfo-divider']} />
        )}
        {externalAttachment && (
          <div className={styles['order-workspace-attachment-content']}>
            <h3 className="content-title">
              {title[1] ||
                intl.get('slod.orderExecution.view.attachment.externalAttachment').d('外部附件')}
            </h3>
            {customizeForm(
              { code: customizeCode[1] },
              <Form dataSet={ds} labelLayout="float" columns={1}>
                <Attachment
                  name="attachmentUuid"
                  readOnly={readOnly[1]}
                  onChange={afterOpenExternalModal}
                />
                <Attachment
                  name="supplierAttachmentUuid"
                  readOnly={readOnly[2]}
                  onChange={afterOpensupplierModal}
                  afterUpload={(...args) =>
                    remote && remote.event.fireEvent('supplierAttachmentAfterUpload', { args, ds })
                  }
                  afterDelete={(...args) =>
                    remote && remote.event.fireEvent('supplierAttachmentAfterDelete', { args, ds })
                  }
                />
                {terminateSignShow && <Attachment readOnly name="terminateSignUuid" />}
                {remote?.process('externalAttachmentExtraForm', null, { props })}
              </Form>
            )}
          </div>
        )}
      </div>
    </Fragment>
  );
};

export default AttachmentInfo;
