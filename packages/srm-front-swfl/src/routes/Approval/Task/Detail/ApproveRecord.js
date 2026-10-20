/**
 *  待办事项列表-详情
 */

import React, { Component } from 'react';
import { Table } from 'choerodon-ui/pro';
import { Tooltip } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';

import { BKT_HWFP } from 'utils/config';
import intl from 'utils/intl';
import UploadModal from 'components/Upload';

import { approveNameRender } from '@/utils/util';
import styles from './index.less';

export default class ApproveRecord extends Component {
  @Bind()
  getColumns() {
    return [
      {
        name: 'endTime',
        width: 180,
      },
      {
        name: 'action',
        // width: 120,
        renderer: ({ text }) => approveNameRender(text),
      },
      {
        name: 'name',
        width: 150,
      },
      {
        name: 'assigneeName',
        width: 150,
      },
      {
        name: 'comment',
        renderer: ({ text }) => (
          <Tooltip title={text} placement="topLeft" overlayClassName={styles['comment-tooltip']}>
            {text}
          </Tooltip>
        ),
      },
      {
        header: intl.get('hwfp.common.model.approval.file').d('附件'),
        name: 'attachmentUuid',
        fixed: 'right',
        width: 150,
        renderer: ({ text, record }) => {
          if (record.get('attachmentUuid')) {
            return (
              <UploadModal
                attachmentUUID={text}
                bucketName={BKT_HWFP}
                bucketDirectory="hwfp01"
                viewOnly
              />
            );
          }
        },
      },
    ];
  }

  render() {
    const { dataSet } = this.props;
    return (
      <Table
        dataSet={dataSet}
        className={styles['apporve-record-table']}
        columns={this.getColumns()}
      />
    );
  }
}
