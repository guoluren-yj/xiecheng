/*
 * HistoricVersion  - 历史版本弹框
 * @date: 2021-09-14
 * @author: HB <xinying.li@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Table, DataSet, Modal, Button } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { getAttachmentUrl, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import Viewer from 'react-viewer';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import historyDs from './historyDs';

const bucketDirectory = 'spfm-comp';
const DEFAULT_BUCKET_NAME = PRIVATE_BUCKET;
const tenantId = getCurrentOrganizationId();

@formatterCollections({
  code: ['spfm.sealmanage', 'spcm.common', 'spfm.common', 'hzero.common'],
})
export default class HistoricVersion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sealFileUrl: '',
    };
  }

  // 印章预览
  @Bind()
  sealPreview(record) {
    this.setState({
      sealFileUrl: record.get('sealFileUrl'),
    });
  }

  // 关闭预览弹框
  @Bind()
  handlePreviewCancel() {
    this.setState({
      sealFileUrl: '',
    });
  }

  @Bind()
  getColumns() {
    const { bucketName = DEFAULT_BUCKET_NAME } = this.props;
    const columns = [
      {
        title: intl.get(`spfm.sealmanage.model.sealCode`).d('印章编码'),
        name: 'sealCode',
        width: 100,
      },
      {
        title: intl.get(`spfm.common.model.createDate`).d('创建时间'),
        name: 'creationDate',
        width: 150,
      },
      {
        title: intl.get(`spcm.common.model.common.createByRealName`).d('创建人'),
        name: 'createdBy',
        width: 140,
        renderer: ({ record }) => {
          return `${record.get('loginName')}-${record.get('realName')}`;
        },
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        name: 'remark',
        width: 120,
      },
      {
        title: intl.get(`hzero.common.table.column.option`).d('操作'),
        name: 'action',
        width: 140,
        renderer: ({ record }) => {
          return (
            <span>
              <a
                onClick={() => {
                  this.sealPreview(record);
                }}
              >
                {intl.get('spfm.sealmanage.model.sealPreview').d('印章预览')}
              </a>
              <a
                download=""
                href={getAttachmentUrl(
                  record.get('sealFileUrl'),
                  bucketName,
                  tenantId,
                  bucketDirectory
                )}
                style={{ margin: '0 0 0 8px' }}
              >
                {intl.get('spfm.sealmanage.model.sealDownload').d('印章下载')}
              </a>
            </span>
          );
        },
      },
    ];
    return columns;
  }

  @Bind()
  openModel() {
    const { queryParams } = this.props;
    const columns = this.getColumns();
    const title = intl.get(`spcm.common.model.sealHistoryVersion`).d('印章历史版本');
    this.recordDS = new DataSet(historyDs(queryParams));
    this.recordDS.query();
    const modal = Modal.open({
      key: Modal.key(),
      title,
      closable: true,
      style: {
        width: 742,
        zIndex: 9999,
      },
      drawer: true,
      children: (
        <div>
          <Table
            border={false}
            rowHeight={32}
            dataSet={this.recordDS}
            columns={columns}
            // pagination={false}
            rowNumber
          />
        </div>
      ),
      footer: (
        <Button
          onClick={() => {
            modal.close();
          }}
          color="primary"
        >
          {intl.get(`hzero.common.status.closed`).d('关闭')}
        </Button>
      ),
      onCancel: () => null,
      afterClose: () => null,
    });
  }

  render() {
    const { sealFileUrl } = this.state;
    const { bucketName = DEFAULT_BUCKET_NAME } = this.props;
    return (
      <div>
        <Button onClick={this.openModel}>
          {intl.get(`hzero.common.button.historyVersion`).d('历史版本')}
        </Button>
        <Viewer
          noImgDetails
          noNavbar
          scalable={false}
          changeable={false}
          visible={sealFileUrl}
          onClose={this.handlePreviewCancel}
          images={[
            {
              src: getAttachmentUrl(sealFileUrl, bucketName, tenantId, bucketDirectory),
              alt: '',
            },
          ]}
        />
      </div>
    );
  }
}
