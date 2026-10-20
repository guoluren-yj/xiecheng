import React, { Component, Fragment } from 'react';
import { Form, Attachment, DataSet } from 'choerodon-ui/pro';
import { noop, isEmpty } from 'lodash';
import { FIlESIZE } from '@/utils/SsrcRegx';
import intl from 'utils/intl';
import { BID } from '@/utils/globalVariable';

const AttachmentDS = () => {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'businessAttachmentUuid',
        type: 'attachment',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessAttachments`).d('商务附件'),
      },
      {
        name: 'techAttachmentUuid',
        type: 'attachment',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.techAttachments`).d('技术附件'),
      },
    ],
  };
};

export default class AttachmentForm extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
    this.AttachmentDS = new DataSet(AttachmentDS());
  }

  componentDidMount() {
    const { header = {} } = this.props;
    if (!isEmpty(header)) {
      this.initDSFields([header]);
    }
  }

  initDSFields(result) {
    this.AttachmentDS.loadData(result);
    this.forceUpdate();
  }

  render() {
    const { customizeForm = noop, sourceKey, bucketName, bucketDirectory, viewOnly } = this.props;
    const AttachmentProps = {
      labelLayout: 'float',
      bucketName,
      bucketDirectory,
      fileSize: FIlESIZE,
      readOnly: viewOnly,
    };
    return (
      <Fragment>
        {customizeForm(
          {
            code: `SSRC.${sourceKey === BID ? 'BID_' : ''}OFFLINE_RESULT_ENTRY.ATTACHMENT_FORM`,
            dataSet: this.AttachmentDS,
          },
          <Form
            dataSet={this.AttachmentDS}
            columns={2}
            labelLayout="float"
            style={{ width: '90%' }}
          >
            <Attachment name="businessAttachmentUuid" {...AttachmentProps} />
            <Attachment name="techAttachmentUuid" {...AttachmentProps} />
          </Form>
        )}
      </Fragment>
    );
  }
}
