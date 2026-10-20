/*
 * @Date: 2022-02-21 11:26:33
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Component } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import { isReview, reviewFile, downLoadFile } from '@/routes/components/utils';
import { getExpanAttachment } from '../stores/getExpandDS';

export default class Attachment extends Component {
  constructor(props) {
    super(props);
    const { supplyAbilityExpandLineId } = this.props;
    this.attachmentListDs = new DataSet(getExpanAttachment({ supplyAbilityExpandLineId }));
  }

  render() {
    const columns = [
      {
        name: 'attachmentDesc',
        width: 150,
        renderer: ({ value, record }) => {
          const { attachmentDesc, attachmentUrl } = record.get(['description', 'attachmentUrl']);
          return isReview(attachmentDesc) && attachmentUrl ? (
            <a
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => reviewFile(attachmentDesc, attachmentUrl)}
            >
              {value}
            </a>
          ) : (
            value
          );
        },
      },
      {
        name: 'attachmentSize',
        width: 120,
        renderer: ({ value }) => {
          if (value) {
            const size = `${value / (1024 * 1024)}`;
            return size.substring(0, 5);
          } else {
            return 0;
          }
        },
      },
      {
        name: 'uploadUserName',
        width: 100,
      },
      {
        name: 'uploadDate',
        width: 140,
      },
      {
        width: 150,
        name: 'attachmentType',
      },
      {
        width: 140,
        name: 'dueDate',
      },
      {
        name: 'remark',
        width: 150,
      },
      {
        name: 'operation',
        width: 80,
        renderer: ({ record }) => {
          const { tenantId, attachmentUrl } = record.get(['tenantId', 'attachmentUrl']);
          return (
            attachmentUrl && (
              <a
                href={downLoadFile({ tenantId, attachmentUrl })}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginRight: 8 }}
              >
                {intl.get('hzero.common.button.download').d('下载')}
              </a>
            )
          );
        },
      },
    ];
    return <Table columns={columns} dataSet={this.attachmentListDs} />;
  }
}
