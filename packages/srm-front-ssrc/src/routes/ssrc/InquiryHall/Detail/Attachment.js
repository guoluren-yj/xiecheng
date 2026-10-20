/**
 * Attachment - 上传下载附件
 * @date: 2018-1-11
 * @author: HZL <ZILI.HOU@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

/*eslint-disable*/

import React, { Component } from 'react';
import { noop } from 'lodash';
import CollapseForm from '_components/CollapseForm';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import { Attachment as NewAttachment, DataSet } from 'choerodon-ui/pro';
import { attachmentDS } from './attchement';

class Attachment extends Component {
  attachmentDs = new DataSet(attachmentDS());

  componentDidMount() {
    const { info } = this.props;
    this.attachmentDs.loadData([info]);
  }

  render() {
    const {
      sourceKey,
      viewOnly = false,
      bucketName = 'PRIVATE_BUCKET',
      bucketDirectory = 'ssrc-rfx-rfxheader',
      businessAttachmentFlag = true,
      customizeCollapseForm = noop,
    } = this.props;
    const businessAttachmentsProps = {
      name: 'businessAttachmentUuid',
      bucketName: bucketName,
      bucketDirectory: bucketDirectory,
      readOnly: viewOnly,
      onChange: (businessAttachmentUuid) => {
        this.setState({ businessAttachmentUuid });
      },
    };
    const techAttachmentsProps = {
      name: 'techAttachmentUuid',
      bucketName: bucketName,
      bucketDirectory: bucketDirectory,
      readOnly: viewOnly,
      onChange: (techAttachmentUuid) => {
        this.setState({ techAttachmentUuid });
      },
    };
    return (
      <React.Fragment>
        {customizeCollapseForm(
          {
            code: `SSRC.${sourceKey}_DETAIL.CHECK_PRICE.ATTACHMENT`,
            readOnly: viewOnly,
            showLines: 2,
            dataSet: this.attachmentDs,
          },
          <CollapseForm columns={2} dataSet={this.attachmentDs} labelLayout="float" showLines={2}>
            <NewAttachment hidden={!businessAttachmentFlag} {...businessAttachmentsProps} />
            <NewAttachment hidden={!businessAttachmentFlag} {...techAttachmentsProps} />
          </CollapseForm>
        )}
      </React.Fragment>
    );
  }
}

export default WithCustomizeC7N({
  unitCode: [`SSRC.INQUIRY_HALL_DETAIL.CHECK_PRICE.ATTACHMENT`],
})(Attachment);

export { Attachment };
