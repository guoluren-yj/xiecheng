import React, { Component } from 'react';
import { Form, Attachment, DataSet } from 'choerodon-ui/pro';
import { noop } from 'lodash';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import { AttachmentDS } from './AttachmentDS';
import './index.less';

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
    this.initDSFields([header.rfxAttachmentAdjustDTO]);
  }

  initDSFields(result) {
    this.AttachmentDS.loadData(result);
    this.forceUpdate();
  }

  getClassName(name) {
    const { currentMode } = this.props;
    const record = this.AttachmentDS?.current;
    const adjustFields = record?.get('adjustFields');
    let className = '';
    if (adjustFields?.includes(name)) {
      if (currentMode === 'current') {
        className = 'changeAfter';
      } else if (currentMode === 'history') {
        className = 'changeBefore';
      }
    }
    return className;
  }

  render() {
    const { customizeForm = noop, currentMode, custKey } = this.props;
    const AttachmentProps = {
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rfx-rfxheader',
      help: intl
        .get(`ssrc.inquiryHall.view.inquiryHall.supportExtension`)
        .d('支持扩展名：.rar .zip .doc .docx .pdf .jpg...'),
      readOnly: true,
    };
    return customizeForm(
      {
        code:
          currentMode === 'history'
            ? `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.ATTACHMENT_FORM_HIS`
            : `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.ATTACHMENT_FORM_READ`,
        dataSet: this.AttachmentDS,
      },
      <Form dataSet={this.AttachmentDS} columns={2} labelLayout="float" useWidthPercent>
        <Attachment
          name="businessAttachmentUuid"
          className={this.getClassName('businessAttachmentUuid')}
          {...AttachmentProps}
        />
        <Attachment
          name="techAttachmentUuid"
          className={this.getClassName('techAttachmentUuid')}
          {...AttachmentProps}
        />
      </Form>
    );
  }
}
