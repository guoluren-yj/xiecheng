import React, { Component } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { initDs } from './tableDs';
import { updateDoc } from '@/services/docManageService';
// import styles from './index.less';
export default class DocManage extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  tableDs = new DataSet(initDs());

  @Bind()
  handleOpen(record = {}) {
    const recordData = record.toData();
    this.props.history.push({ pathname: '/smop/doc-manage/detail', state: { recordData } });
  }

  @Bind()
  async handleUpdate(record, flag) {
    const data = record.toData();
    const param = { ...data, status: flag };
    const res = getResponse(await updateDoc(param));
    if (res) {
      this.tableDs.query();
    }
  }

  render() {
    const colorStyle = (value) => {
      if (value) {
        return {
          backgroundColor: 'rgba(71,184,129,0.1)',
          color: '#47B881',
          border: 'none',
        };
      } else {
        return {
          backgroundColor: 'rgba(245,99,73,0.1)',
          color: '#F56349',
          border: 'none',
        };
      }
    };
    const columns = [
      { name: 'menuDeployId' },
      { name: 'title' },
      { name: 'level' },
      { name: 'parentMenuDeployId' },
      {
        name: 'status',
        renderer: ({ value }) => {
          return (
            <Tag style={{ ...colorStyle(value) }}>
              {value
                ? intl.get('smop.common.view.dispark').d('开放')
                : intl.get('smop.common.view.disabled').d('禁用')}
            </Tag>
          );
        },
      },
      {
        name: 'operation',
        renderer: ({ record }) => (
          <span className="action-link">
            <a onClick={() => this.handleOpen(record)}>
              {intl.get('smop.common.view.detail').d('详情')}
            </a>
            {record.get('status') ? (
              <a onClick={() => this.handleUpdate(record, 0)}>
                {intl.get('smop.common.view.disabled').d('禁用')}
              </a>
            ) : (
              <a onClick={() => this.handleUpdate(record, 1)}>
                {intl.get('smop.common.view.startUse').d('启用')}
              </a>
            )}
          </span>
        ),
      },
    ];
    return (
      <div>
        <Header title={intl.get('smop.common.view.docManage').d('文档管理')}>
          <Button
            icon="add"
            color="primary"
            onClick={() => this.props.history.push('/smop/doc-manage/detail')}
          >
            {intl.get('smop.common.view.add').d('新建')}
          </Button>
        </Header>
        <Content>
          <Table dataSet={this.tableDs} columns={columns} queryFieldsLimit={3} />
        </Content>
      </div>
    );
  }
}
