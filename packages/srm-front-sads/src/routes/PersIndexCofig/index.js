import React, { Component } from 'react';
import intl from 'utils/intl';
import classNames from 'classnames';
import { Bind } from 'lodash-decorators';
import { getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import { Header, Content } from 'components/Page';
import { Table, DataSet, Modal, Button } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { Button as ButtonPermission } from 'components/Permission';
import styles from './index.less';
import IndexForm from './components/IndexForm';

import { IndexDS } from './stores/IndexDS';
import { updateEnabled } from '../../services/index';

@formatterCollections({ code: ['sads.indexcongig', 'hzero.common'] })
export default class PersIndexCofig extends Component {
  indexDS = new DataSet({ ...IndexDS(), autoQuery: true });

  @Bind()
  getIndexColumns() {
    return [
      {
        name: 'indexName',
        width: 200,
        lock: 'left',
      },
      {
        name: 'tenantObject',
        width: 200,
      },
      {
        name: 'companyObject',
        width: 200,
      },
      {
        name: 'indexNamePrefix',
        width: 200,
      },
      {
        name: 'indexNameSuffix',
        width: 200,
      },
      {
        name: 'parentIndex',
        width: 200,
      },
      {
        name: 'enabledFlag',
        width: 112,
        align: 'center',
        renderer: ({ value, text }) => (
          <Tag
            className={classNames(
              styles['list-normal-tag'],
              value ? styles['success-tag'] : styles['warning-tag']
            )}
          >
            {text}
          </Tag>
        ),
      },
      {
        name: 'operation',
        header: intl.get(`hzero.common.action`).d('操作'),
        width: 150,
        align: 'center',
        lock: 'right',
        renderer: ({ record }) => {
          const enabledFlag = record.get('enabledFlag');
          return (
            <span className="action-link">
              <ButtonPermission type="text" onClick={() => this.openIndexModal(record, true)}>
                {intl.get(`hzero.common.button.view`).d('查看')}
              </ButtonPermission>
              <ButtonPermission type="text" onClick={() => this.openIndexModal(record)}>
                {intl.get('hzero.common.edit').d('编辑')}
              </ButtonPermission>
              <ButtonPermission type="text" onClick={() => this.updateIndexStatus(record)}>
                {enabledFlag
                  ? intl.get(`hzero.common.button.unEnabled`).d('禁用')
                  : intl.get(`hzero.common.button.enabled`).d('启用')}
              </ButtonPermission>
            </span>
          );
        },
      },
    ];
  }

  @Bind()
  async updateIndexStatus(record) {
    const preEnabledFlag = record.get('enabledFlag');
    const newEnabledFlag = Number(!preEnabledFlag);
    const res = await updateEnabled({ ...record.toData(), enabledFlag: newEnabledFlag });
    if (getResponse(res)) {
      this.indexDS.query(this.indexDS.currentPage);
    }
  }

  @Bind()
  openIndexModal(record, isView = false) {
    const formRecord = record || this.indexDS.create();
    let modalTitle = record
      ? intl.get('sads.indexcongig.view.modal.edit').d('编辑配置')
      : intl.get('sads.indexcongig.view.modal.create').d('新建配置');
    if (isView) {
      modalTitle = intl.get('sads.indexcongig.view.modal.view').d('查看配置');
    }
    if (isView) formRecord.setState('isView', true);
    else formRecord.setState('isView', false);
    const modalProperties = {
      title: modalTitle,
      drawer: true,
      closable: true,
      key: 'indexForm',
      style: {
        width: 1100,
      },
      children: <IndexForm record={formRecord} dataSet={this.indexDS} />,
      onCancel: () => {
        this.handCancelIndexModal(formRecord);
      },
    };
    Modal.open(modalProperties);
  }

  @Bind()
  handCancelIndexModal(formRecord) {
    const indexId = formRecord.get('indexId');
    if (!indexId) {
      this.indexDS.remove(formRecord);
    }
    if (this.indexDS.current) {
      this.indexDS.current.reset();
    }
    return true;
  }

  render() {
    return (
      <>
        <Header title={intl.get('sads.indexcongig.view.header.title').d('个性化索引配置')}>
          <Button color="primary" icon="add" onClick={() => this.openIndexModal()}>
            {intl.get('hzero.common.button.new').d('新建')}
          </Button>
        </Header>
        <Content>
          <Table columns={this.getIndexColumns()} dataSet={this.indexDS} queryFieldsLimit={3} />
        </Content>
      </>
    );
  }
}
