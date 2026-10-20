/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2022-03-07 17:35:29
 */

import React, { useContext, useMemo } from 'react';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import { Attachment, Form, Spin } from 'choerodon-ui/pro';

import { Store } from '../stores';

const AttachmentInfo = function AttachmentInfo({
  code,
  readOnly = false,
  showChangeAttach = false,
  changeReadOnly = false,
  externalCode,
}) {
  const {
    headerDs,
    customizeForm,
    permissonFlag = {},
    pubPathFlag,
    location,
    cuxHandlebeforeUpload,
    cuxMsgHelp,
    cuxCuzAttachment,
  } = useContext(Store);

  const HelpMsg = useMemo(() => (
    <span className="attachment-title">
      {intl.get('sprm.common.view.attachment.supportExtensions').d('支持扩展名')}: .rar .zip .doc
      .docx .pdf .jpg...
    </span>
  ));

  const externalAttachmentUuidVisibleFx = headerDs?.current
    ?.getField('externalAttachmentUuid')
    ?.getProps?.()?.dynamicProps;
  const visibleFlag =
    headerDs && externalAttachmentUuidVisibleFx?.visible
      ? externalAttachmentUuidVisibleFx?.visible(headerDs)
      : 1;

  const attachmentComp = (
    <Attachment
      readOnly={headerDs?.current?.get('cuxAttachmentEdit') === 'edit' ? false : readOnly}
      labelLayout="float"
      help={typeof cuxMsgHelp === 'function' ? cuxMsgHelp({ headerDs }) : HelpMsg}
      beforeUpload={
        typeof cuxHandlebeforeUpload === 'function'
          ? attachment => cuxHandlebeforeUpload({ headerDs, attachment })
          : () => {}
      }
      name="attachmentUuid"
      bucketName={PRIVATE_BUCKET}
      bucketDirectory="sprm"
    />
  );

  const cuxAttachmentComp =
    typeof cuxCuzAttachment === 'function'
      ? cuxCuzAttachment({ pubPathFlag, headerDs, attachmentComp, location })
      : attachmentComp;

  const formAttach = customizeForm(
    {
      code,
      dataSet: headerDs,
    },
    <Form dataSet={headerDs} columns={2} labelLayout="float">
      {cuxAttachmentComp}
      {showChangeAttach && (
        <Attachment
          readOnly={changeReadOnly}
          bucketName={PRIVATE_BUCKET}
          bucketDirectory="sprm"
          name="changeAttachmentUuid"
          labelLayout="float"
          help={HelpMsg}
        />
      )}
    </Form>
  );

  const formAttachExternal = customizeForm(
    {
      code: externalCode,
      dataSet: headerDs,
    },
    <Form dataSet={headerDs} columns={1} labelLayout="float" useColon={false}>
      {(permissonFlag.externalAttachmentUuid || !pubPathFlag) && (
        <Attachment
          readOnly={readOnly}
          labelLayout="float"
          help={HelpMsg}
          name="externalAttachmentUuid"
          bucketName={PRIVATE_BUCKET}
          bucketDirectory="sprm"
        />
      )}
    </Form>
  );

  return (
    <Spin dataSet={headerDs} code="attach">
      <div className="sprm-cols-attachment">
        <div className="sprm-cols-enter-enclosure">{formAttach}</div>
        {permissonFlag.externalAttachmentUuid && Boolean(visibleFlag) && (
          <>
            <div className="custom-page-content-att-divider" />
            <div>
              <h3 className="content-title">
                {intl.get('sprm.common.view.attachment.externalAttachment').d('外部附件')}
              </h3>
              {formAttachExternal}
            </div>
          </>
        )}
      </div>
    </Spin>
  );
};

export default AttachmentInfo;
