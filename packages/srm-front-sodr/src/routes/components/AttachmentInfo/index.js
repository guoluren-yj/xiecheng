/*
 * AttachmentInfo - 订单明细页-附件信息
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { useCallback, useMemo, Fragment } from 'react';
import { Form, Attachment } from 'choerodon-ui/pro';
// import { observable } from 'mobx';
import { observer } from 'mobx-react-lite';
import { isNil } from 'lodash';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import UrlAttachment from 'srm-front-boot/lib/components/UrlAttachment';
// import { BUCKET_NAME, BUCKET_DIRECTORY } from '@/routes/components/utils/constant';

import { saveAttachmentUUID, saveAttachmentUUIDForChange } from '@/services/orderWorkspaceService';
import styles from './index.less';

const AttachmentInfo = (props) => {
  const {
    ds,
    poHeaderId,
    eSignShow = false, // 附件列表显示
    // eSignfileList = [],
    customizeForm,
    customizeCode = [],
    insideAttachment,
    externalAttachment,
    terminateSignShow = false,
    attachmentConfig: { readOnly = [] } = {},
    type,
    handleChangeAttachment = () => {},
  } = props;

  // const fileList = observable(eSignfileList);

  // const eSignDom = useMemo(() => {
  //   return (
  //     <div name="__electric_sign_attachment__" style={{ display: eSignShow ? 'block' : 'none' }}>
  //       <Attachment
  //         dataSet={null}
  //         label={intl.get('sodr.common.view.btn.electronicSignatureAttachment').d('电子签章附件')}
  //         value="electricSignUrl"
  //         readOnly
  //         hidden={eSignShow}
  //         downloadAll={false}
  //         bucketName={BUCKET_NAME}
  //         bucketDirectory={BUCKET_DIRECTORY}
  //         attachments={fileList.map((i) => ({
  //           name: i.fileName,
  //           size: i.fileSize,
  //           type: i.fileType,
  //           uid: i.fileId,
  //           url: i.fileUrl,
  //           status: 'done',
  //           creationDate: i.creationDate,
  //         }))}
  //       />
  //     </div>
  //   );
  // }, [eSignShow, fileList.length]);

  /**
   * @poHeaderId
   * 手工创建来源-新建时poHeaderId默认值为new不调附件接口
   */
  const isCreate = useMemo(() => poHeaderId === 'new', [poHeaderId]);

  // 内部附件
  const afterOpenInsideModal = useCallback(
    (uuid) => {
      if (!isCreate && poHeaderId && uuid) {
        let saveUUID = saveAttachmentUUID;
        if (type === 'change') {
          saveUUID = saveAttachmentUUIDForChange;
        }
        saveUUID({
          poHeaderId,
          uuidType: 3,
          uuid,
        }).then((res) => {
          if (getResponse(res)) {
            ds.current.init({ objectVersionNumber: res });
          }
        });
      }
    },
    [isCreate, poHeaderId, ds]
  );

  const onAttachmentsChange = useCallback(() => {
    handleChangeAttachment();
  }, [handleChangeAttachment]);

  // 外部附件(采购方)
  const afterOpenExternalModal = useCallback(
    (uuid) => {
      if (!isCreate && poHeaderId && uuid) {
        let saveUUID = saveAttachmentUUID;
        if (type === 'change') {
          saveUUID = saveAttachmentUUIDForChange;
        }
        saveUUID({
          poHeaderId,
          uuidType: 1,
          uuid,
        }).then((res) => {
          if (getResponse(res)) {
            ds.current.init({ objectVersionNumber: res });
          }
        });
      }
    },
    [isCreate, poHeaderId, ds]
  );

  // 外部附件(供应商)
  const afterOpensupplierModal = useCallback(
    (uuid) => {
      if (!isCreate && poHeaderId && uuid) {
        saveAttachmentUUID({
          poHeaderId,
          uuidType: 2,
          uuid,
        }).then((res) => {
          if (getResponse(res)) {
            ds.current.init({ objectVersionNumber: res });
          }
        });
      }
    },
    [isCreate, poHeaderId, ds]
  );

  return (
    <Fragment>
      <div className={styles['order-workspace-attachment']}>
        <div className={styles['order-workspace-attachment-content']}>
          <h3 id="order-workSpace-detail-content-attachmentInfo" className="content-title">
            {intl.get('sodr.workspace.view.attachment.insideAttachment').d('内部附件')}
          </h3>
          {customizeForm(
            { code: customizeCode[0] },
            <Form dataSet={ds} labelLayout="float" columns={1}>
              {!isNil(insideAttachment) ? (
                insideAttachment && (
                  <Attachment
                    name="purchaserInnerAttachmentUuid"
                    onChange={afterOpenInsideModal}
                    readOnly={readOnly[0]}
                    onAttachmentsChange={onAttachmentsChange}
                  />
                )
              ) : (
                <Attachment
                  name="purchaserInnerAttachmentUuid"
                  onChange={afterOpenInsideModal}
                  readOnly={readOnly[0]}
                  onAttachmentsChange={onAttachmentsChange}
                />
              )}
            </Form>
          )}
        </div>
        <div className={styles['order-workspace-attachmentInfo-divider']} />
        <div className={styles['order-workspace-attachment-content']}>
          <h3 className="content-title">
            {intl.get('sodr.workspace.view.attachment.externalAttachment').d('外部附件')}
          </h3>
          {customizeForm(
            { code: customizeCode[1] },
            <Form dataSet={ds} labelLayout="float" columns={1}>
              {!isNil(externalAttachment) ? (
                externalAttachment && (
                  <Attachment
                    name="attachmentUuid"
                    readOnly={readOnly[1]}
                    onChange={afterOpenExternalModal}
                    onAttachmentsChange={onAttachmentsChange}
                  />
                )
              ) : (
                <Attachment
                  name="attachmentUuid"
                  readOnly={readOnly[1]}
                  onChange={afterOpenExternalModal}
                  onAttachmentsChange={onAttachmentsChange}
                />
              )}
              <Attachment
                name="supplierAttachmentUuid"
                readOnly={readOnly[2]}
                onChange={afterOpensupplierModal}
              />
              <UrlAttachment readOnly hidden={!eSignShow} name="electricSignUrl" />
              {/* {eSignDom} */}
              {/* {terminateSignShow && <Attachment readOnly name="terminateSignUuid" />} */}
              <Attachment readOnly hidden={!terminateSignShow} name="terminateSignUuid" />
            </Form>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default observer(AttachmentInfo);
