import React, { Component } from 'react';
import { Form as ProForm, TextField, Attachment } from 'choerodon-ui/pro';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import classnames from 'classnames';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';

import { getResponse } from 'utils/utils';
import { getEnableDeleteArchiveFileFlag } from '@/services/contractCommonService';

import styles from './index.less';

@WithCustomizeC7N({
  unitCode: ['SPCM.WORKSPACE_COMMON.ARCHIVE'],
})
export default class componentName extends Component {
  constructor(props) {
    super(props);
    this.state = {
      enableDeleteArchiveFileFlag: 1,
    };
  }

  componentDidMount() {
    this.enableDeleteArchiveFileFlag();
    this.handleRemoteEvent();
  }

  enableDeleteArchiveFileFlag = async () => {
    const { ds } = this.props || {};
    if (!ds?.current?.get('pcHeaderId')) {
      return false;
    }
    const res = getResponse(
      await getEnableDeleteArchiveFileFlag({ pcHeaderId: ds.current.get('pcHeaderId') })
    );
    if (res) {
      this.setState({
        enableDeleteArchiveFileFlag: res?.enableDeleteArchiveFileFlag,
      });
    }
  };

  handleRemoteEvent = async () => {
    const { remote } = this.props;
    if (remote?.event) {
      await remote.event.fireEvent('handleCuxArchiveRemoteEvent', { current: this });
    }
  };

  render() {
    const { ds, remote, customizeForm } = this.props;
    const { enableDeleteArchiveFileFlag } = this.state;
    // 归档文件额外props
    const archiveAttrRemoteProps = remote
      ? remote.process('SPCM_WORKSPACE_DETAIL_ARCHIVE_ATTR_PROPS', {}, { ds })
      : {};
    return customizeForm(
      {
        code: 'SPCM.WORKSPACE_COMMON.ARCHIVE',
      },
      <ProForm
        dataSet={ds}
        columns={1}
        labelWidth={130}
        labelAlign="left"
        labelLayout="float"
        className={classnames(styles['close-from-wrapper'])}
      >
        <TextField disabled name="pcNum" />
        <TextField disabled name="pcName" />
        <TextField disabled name="createByRealName" />
        <h3
          name="archiveTitle"
          className={classnames(styles['close-sub-title'], styles['close-top-16'])}
        >
          {intl.get(`spcm.common.archiveCode`).d('归档码')}
        </h3>
        <TextField name="archiveCode" />
        <h3
          name="attachmentTitle"
          className={classnames(styles['close-sub-title'], styles['close-top-16'])}
        >
          {intl.get('hzero.common.upload.modal.title').d('附件')}
        </h3>
        <Attachment
          name="archiveAttachmentUuid"
          bucketName={PRIVATE_BUCKET}
          bucketDirectory="spcm-supplier"
          fileReadOnly={(file) => file.fileMark === 'readOnly' && enableDeleteArchiveFileFlag !== 1}
          {...archiveAttrRemoteProps}
        />
      </ProForm>
    );
  }
}
