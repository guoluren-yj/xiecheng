import React, { Component, Fragment } from 'react';
import { Form, Attachment, DataSet } from 'choerodon-ui/pro';
import { noop } from 'lodash';
import { PRIVATE_BUCKET } from '_utils/config';
import intl from 'utils/intl';
import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import { AttachmentDS } from './AttachmentDS';
import { AttachmentComponentDiffRender } from './utils';

export default class AttachmentForm extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
    this.AttachmentDS = new DataSet(AttachmentDS());
  }

  initDSFields(result = []) {
    this.AttachmentDS.loadData(result);
    this.forceUpdate();
  }

  AttachmentFormDStoData() {
    return this.AttachmentDS.current.toJSONData();
  }

  changeAttachment(name, attachmentFile) {
    const { remote, queryMain, bidFlag = false, header = {} } = this.props;
    const adjustFields = this.AttachmentDS?.current?.get('adjustFields') || [];
    // const attachmentUuid = this.AttachmentDS?.current?.get(name) || '';
    if (!adjustFields.length) {
      adjustFields.push(name);
    } else if (!adjustFields.includes(name)) {
      adjustFields.push(name);
    }
    this.AttachmentDS.current.set('adjustFields', adjustFields.length ? adjustFields : null);
    // if (attachmentUuid) {

    // }
    if (remote?.event) {
      remote.event.fireEvent('clearAttachmentUUid', {
        bidFlag,
        name,
        header,
        attachmentFile,
        AttachmentDS: this.AttachmentDS,
        queryMain,
      });
    } else {
      this.AttachmentDS.submit();
    }
  }

  onUploadSuccess() {
    // const attachmentUuid = this.AttachmentDS?.current?.get(name) || '';
    // if (!attachmentUuid) {
    //   this.AttachmentDS.submit();
    // }
  }

  render() {
    const { customizeForm = noop, custKey } = this.props;
    const AttachmentProps = {
      help: intl
        .get(`ssrc.inquiryHall.view.inquiryHall.supportExtension`)
        .d('支持扩展名：.rar .zip .doc .docx .pdf .jpg...'),
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rfx-rfxheader',
      fileSize: FIlESIZE,
      dataSet: this.AttachmentDS,
      onUploadSuccess: () => this.onUploadSuccess(),
      ...(ChunkUploadProps || {}),
    };
    return (
      <Fragment>
        {customizeForm(
          {
            code: `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.ATTACHMENT_FORM`,
            dataSet: this.AttachmentDS,
          },
          <Form dataSet={this.AttachmentDS} columns={2} labelLayout="float" useWidthPercent>
            <AttachmentComponentDiffRender
              record={this.AttachmentDS?.current}
              name="businessAttachmentUuid"
            >
              <Attachment
                name="businessAttachmentUuid"
                onAttachmentsChange={(attachmentFile) =>
                  this.changeAttachment('businessAttachmentUuid', attachmentFile)
                }
                {...AttachmentProps}
              />
            </AttachmentComponentDiffRender>
            <AttachmentComponentDiffRender
              record={this.AttachmentDS?.current}
              name="techAttachmentUuid"
            >
              <Attachment
                name="techAttachmentUuid"
                onAttachmentsChange={(attachmentFile) =>
                  this.changeAttachment('techAttachmentUuid', attachmentFile)
                }
                {...AttachmentProps}
              />
            </AttachmentComponentDiffRender>
          </Form>
        )}
      </Fragment>
    );
  }
}
