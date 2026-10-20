/*
 * @Description: 物料查询页
 * @Date: 2020-05-08 17:35:16
 * @Author: HJ <jinhuang02@hand-china.com>
 * @Copyright: Copyright (c) 2018, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import { Table, Form } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { PRIVATE_BUCKET } from '_utils/config';

import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import { getCurrentOrganizationId, getAttachmentUrl } from 'utils/utils';

const bucketName = PRIVATE_BUCKET;
const bucketDirectory = 'smdm-materiel';

/**
 * 附件表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} showEditModal 显示编辑模态框
 * @reactProps {Object} form 表单
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class EnclosureTable extends PureComponent {
  componentDidMount() {
    const { itemId, onTableChange } = this.props;
    if (itemId) {
      onTableChange({}, 'queryEnclosure');
    }
  }

  state = {
    tenantId: getCurrentOrganizationId(),
  };

  render() {
    const { dataSource = [], customizeTable } = this.props;
    const { tenantId } = this.state;
    const columns = [
      {
        title: intl.get(`smdm.materiel.model.materiel.attachmentDesc`).d('附件名称'),
        width: 200,
        dataIndex: 'attachmentDesc',
        render: (value, record) => (
          <a
            href={getAttachmentUrl(record.attachmentUrl, bucketName, tenantId, bucketDirectory)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {value}
          </a>
        ),
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.attachmentSize`).d('附件大小(Mb)'),
        width: 120,
        dataIndex: 'attachmentSize',
        render: (text) => {
          if (text) {
            const size = `${text / (1024 * 1024)}`;
            return size.substring(0, 5);
          } else {
            return 0;
          }
        },
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.realName`).d('上传人'),
        width: 150,
        dataIndex: 'realName',
        render: (text, record) => (isEmpty(text) ? record.loginName : text),
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.uploadDate`).d('上传时间'),
        width: 150,
        dataIndex: 'uploadDate',
        render: dateTimeRender,
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.remark`).d('备注'),
        dataIndex: 'remark',
      },
    ];
    return (
      <Fragment>
        {customizeTable(
          {
            code: 'SMDM_MATERIELQUERY_ATTACHMENT.LIST',
          },
          <Table
            bordered
            rowKey="attachmentId"
            columns={columns}
            dataSource={dataSource}
            pagination={false}
          />
        )}
      </Fragment>
    );
  }
}
