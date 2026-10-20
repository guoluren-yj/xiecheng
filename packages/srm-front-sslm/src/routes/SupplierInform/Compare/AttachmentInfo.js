/**
 * AttachmentInfo - 附件信息
 * @date: 2021-04-01
 * @author: xiaomei.lv <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Component } from 'react';
import { sum, isNumber } from 'lodash';
import { Table } from 'hzero-ui';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import UploadModal from 'srm-front-boot/lib/components/Upload/index';
import { PRIVATE_BUCKET } from '_utils/config';
import { formatYesOrNo } from '@/routes/components/utils';

export default class AttachmentInfo extends Component {
  render() {
    const { dataSource, custLoading, customizeTable } = this.props;
    const columns = [
      {
        title: intl.get('sslm.enterpriseInform.view.model.attachment.type').d('附件类型'),
        dataIndex: 'attachmentFileType',
        width: 180,
        render: (_, record) => record.attachmentMeaning,
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.attachment.desc').d('附件描述'),
        dataIndex: 'description',
        width: 180,
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.attachment.dueDate').d('文件到期日'),
        dataIndex: 'endDate',
        width: 110,
      },
      {
        title: intl.get('sslm.supplierInform.model.attachment.longEffective').d('是否长期有效'),
        dataIndex: 'longEffectiveFlag',
        width: 110,
        render: val => formatYesOrNo(val),
      },
      {
        title: intl
          .get('sslm.enterpriseInform.view.model.attachment.lastUpdatedTime')
          .d('最后更新时间'),
        dataIndex: 'uploadDate',
        width: 140,
        render: dateTimeRender,
      },
      // {
      //   title: intl
      //     .get('sslm.enterpriseInform.model.attachment.supplierAttFlag')
      //     .d('供方附件是否必传'),
      //   dataIndex: 'supplierAttFlag',
      //   width: 140,
      //   render: val => yesOrNoRender(val),
      // },
      {
        title: intl.get('sslm.enterpriseInform.view.model.attachment.upload').d('附件上传'),
        dataIndex: 'attachmentUuid',
        width: 150,
        render: val => (
          <UploadModal
            attachmentUUID={val}
            filePreview
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="spfm-comp"
            viewOnly
          />
        ),
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        width: 200,
      },
    ].map(n => ({
      ...n,
      render: (val, record) => {
        return (
          <div
            className={
              ['CREATE', 'DELETE'].includes(record.objectFlag) ||
              record[`${n.dataIndex}Flag`] === 'UPDATE'
                ? 'sslm-compare-info-style'
                : ''
            }
          >
            {n.render ? n.render(val, record) : val}
          </div>
        );
      },
    }));

    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));

    return customizeTable(
      {
        code: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.ATTACHMENT_INFO',
      },
      <Table
        bordered
        rowKey="attachmentReqId"
        pagination={false}
        dataSource={dataSource}
        columns={columns}
        scroll={{ x: scrollX }}
        custLoading={custLoading}
      />
    );
  }
}
