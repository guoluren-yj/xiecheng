import { Header, Content } from 'components/Page';
import { Table, DataSet, Modal, Button } from 'choerodon-ui/pro';
import React from 'react';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react';
import Component from '@htd/helper/lib/components/base-component';
import ComponentEnhanceWrapperHoc from '@htd/helper/lib/decorators/props-extension-hoc';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { isTenantRoleLevel, getCurrentOrganizationId, getResponse } from 'utils/utils';
import { downloadFile } from 'services/api';
import { HZERO_FILE } from 'utils/config';
import { isAdministrator } from '@/utils/utils';
import getProcessDSProps from './processDS.js';
import getUuidFileDSProps from './uuidFileDS.js';
import { configRule, processDSConfig } from './extensionRule.js';
import { initComponent, componentDidMount, componentWillUnmount } from './pageLogic.js';
import { repushOperate, canRepushOperate } from '../../services/processService';

import styles from './index.less';

@formatterCollections({ code: ['hpdm.process', 'srdm.process'] })
@observer
@ComponentEnhanceWrapperHoc(configRule)
class Page extends Component {
  constructor(props) {
    super(props);
    this.setDs(
      'processDS',
      new DataSet(processDSConfig.bind(this)(getProcessDSProps.bind(this)()))
    );
    initComponent.bind(this)();
  }

  componentDidMount() {
    componentDidMount.bind(this)();
  }

  componentWillUnmount() {
    componentWillUnmount.bind(this)();
  }

  @Bind()
  async deleteOperation(record) {
    await this.getDs('processDS').delete(record);
    this.getDs('processDS').query();
  }

  @Bind()
  repushOperation(record) {
    Modal.confirm({
      destroyOnClose: true,
      title: intl.get('hpdm.process.title.operation.repush').d('是否确认重推？'),
      onOk: async () => {
        const { processMessage, ...data } = record.toData();
        const res = await repushOperate(data);
        if (getResponse(res)) {
          notification.success();
        }
      },
    });
  }

  @Bind()
  canRepushOperation(record) {
    Modal.confirm({
      destroyOnClose: true,
      title: '设置处理状态为"失败"用来重推?',
      onOk: async () => {
        const res = await canRepushOperate(record.toData());
        if (getResponse(res)) {
          notification.success();
        }
      },
    });
  }

  @Bind()
  downloadOperation(record) {
    const organizationId = getCurrentOrganizationId();
    // 直接从minio上取文件
    const api = `${HZERO_FILE}/v1/${isTenantRoleLevel() ? `${organizationId}/` : ''}files/download`;
    const queryParams = [{ name: 'url', value: encodeURIComponent(record.get('fileUrl')) }];
    queryParams.push({ name: 'bucketName', value: 'hpfe-bucket' });
    downloadFile({
      requestUrl: api,
      queryParams,
    });
  }

  @Bind()
  async downloadUuidOperation(record) {
    const organizationId = getCurrentOrganizationId();
    // 直接从minio上取文件
    const api = `${HZERO_FILE}/v1/${isTenantRoleLevel() ? `${organizationId}/` : ''}files/download`;
    const queryParams = [{ name: 'url', value: encodeURIComponent(record.get('fileUrl')) }];
    queryParams.push({ name: 'bucketName', value: 'hpfe-bucket' });
    downloadFile({
      requestUrl: api,
      queryParams,
    });
  }

  @Bind()
  openUuidOperation(record) {
    const uuid = record.get('fileUuid');
    this.setDs('uuidFileDS', new DataSet(getUuidFileDSProps.bind(this)({ uuid })));
    Modal.open({
      key: 'download_uuid_operation_1',
      destroyOnClose: true,
      style: {
        width: 800,
      },
      okCancel: false,
      children: (
        <>
          <Table
            dataSet={this.getDs('uuidFileDS')}
            columns={[
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'fileName',
                type: 'string',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'fileType',
                type: 'string',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'fileUrl',
                type: 'string',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'bucketName',
                type: 'string',
              },
              {
                header: intl.get('hpdm.process.title.operation').d('操作'),
                width: 200,
                lock: 'right',
                command: ({ record: value }) => {
                  const btns = [];
                  btns.push(
                    <a
                      onClick={() => {
                        this.downloadUuidOperation(value);
                      }}
                      style={{ marginRight: '0.1rem' }}
                    >
                      {intl.get('hpdm.process.operation.download').d('下载')}
                    </a>
                  );
                  return btns;
                },
              },
            ]}
          />
        </>
      ),
    });
  }

  @Bind()
  openMore(value, title) {
    Modal.open({
      className: styles['open-more-modal'],
      title,
      children: value,
      okCancel: false,
    });
  }

  @Bind()
  moreRenderer({ value, record, name, dataSet }) {
    if (value && value.length > 20) {
      return (
        <>
          {value.slice(0, 20)}...
          <a onClick={() => this.openMore(record.get(name), dataSet.getField(name).get('label'))}>
            查看更多
          </a>
        </>
      );
    }
    return value;
  }

  render() {
    return (
      <>
        <Header title={intl.get('srdm.process.header.title').d('处理记录')} textLayout="right">
          <Button
            color="primary"
            onClick={() => {
              this.getDs('processDS').query();
            }}
          >
            {intl.get('hzero.common.button.refresh').d('刷新')}
          </Button>
        </Header>
        <Content>
          <Table
            data-hcg_flag="Table_81849"
            rowNumber={false}
            queryFieldsLimit={3}
            queryBar="professionalBar"
            columnResizable
            columnHideable
            columnTitleEditable
            columnDraggable
            editMode="cell"
            customizable={false}
            customizedCode="Table_81849"
            border
            autoHeight={false}
            virtual={false}
            virtualCell={false}
            virtualSpin={false}
            columns={[
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'groupId',
                type: 'string',
                width: 250,
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'processType',
                type: 'string',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'processDesc',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'processStatus',
              },
              {
                name: 'processMessage',
                tooltip: 'none',
                renderer: this.moreRenderer,
                width: 220,
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'processUserName',
              },
              // {
              //   name: 'processParam',
              //   tooltip: 'none',
              //   renderer: this.moreRenderer,
              //   width: 220,
              // },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'lastUpdateDate',
                width: 150,
              },
              isAdministrator
                ? {
                    header: intl.get('hpdm.process.title.operation').d('操作'),
                    width: 200,
                    lock: 'right',
                    command: ({ record }) => {
                      const btns = [];
                      btns.push(
                        <a
                          onClick={() => this.deleteOperation(record)}
                          style={{ marginRight: '0.1rem' }}
                        >
                          {intl.get('hpdm.process.operation.delete').d('删除')}
                        </a>,
                        record.get('fileUrl') || record.get('fileUuid') ? (
                          <a
                            onClick={() => {
                              if (record.get('fileUuid')) {
                                this.openUuidOperation(record);
                              } else {
                                this.downloadOperation(record);
                              }
                            }}
                            style={{ marginRight: '0.1rem' }}
                          >
                            {intl.get('hpdm.process.operation.download').d('下载')}
                          </a>
                        ) : (
                          <a
                            tyle={{ color: 'gray', cursor: 'not-allowed' }}
                            style={{ marginRight: '0.1rem' }}
                            disabled
                          >
                            {intl.get('hpdm.process.operation.download').d('下载')}
                          </a>
                        ),
                        record.get('repushFlag') === 0 ? (
                          <a tyle={{ color: 'gray', cursor: 'not-allowed' }} disabled>
                            {intl.get('hpdm.process.operation.repush').d('重推')}
                          </a>
                        ) : record.get('processStatus') !== 'E' ? (
                          <a onClick={() => this.canRepushOperation(record)}>设置为可重推</a>
                        ) : (
                          <a onClick={() => this.repushOperation(record)}>
                            {intl.get('hpdm.process.operation.repush').d('重推')}
                          </a>
                        )
                      );

                      //   record.get('repushFlag') === 0 || record.get('processStatus') !== 'E' ? (
                      //     <a onClick={() => this.canRepushOperation(record)}>
                      //       {intl.get('hpdm.process.operation.canrepush').d('设置为可重推')}
                      //     </a>
                      //   ) : (
                      //     <a onClick={() => this.repushOperation(record)}>
                      //       {intl.get('hpdm.process.operation.repush').d('重推')}
                      //     </a>
                      //   )
                      // );
                      return btns;
                    },
                  }
                : null,
            ]}
            buttons={[]}
            dataSet={this.getDs('processDS')}
          />
        </Content>
      </>
    );
  }
}

export default Page;
