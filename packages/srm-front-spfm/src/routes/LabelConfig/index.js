import React, { Component, Fragment } from 'react';
import { DataSet, Table, Button, Modal, Icon } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import notification from 'utils/notification';
import { enableRender } from 'utils/renderer';

import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import { isTenantRoleLevel } from 'utils/utils';

import { saveDocLabel, getDetailLabel, copyLabel } from '@/services/labelConfigServices';
import { detailDS, tenantLineDS } from './store/tableLineDS';
import TableDs from './store/tableDs';
import LableModal from './LableModal';

const isTenantRole = isTenantRoleLevel();
@formatterCollections({
  code: [
    'spfm.cnfLabel',
    'hzero.common',
    'hzero.c7nProUI',
    'spfm.configServer',
    'spfm.docTransferDefin',
  ],
})
class Index extends Component {
  constructor(props) {
    super(props);
    this.tableDataDs = new DataSet(TableDs());
    this.detailLableDS = new DataSet(detailDS());
    this.tenantLineDs = new DataSet(tenantLineDS());
  }

  dataCreate = ({ record }) => {
    let current = record;
    if (!record) {
      this.detailLableDS.create({ enabledFlag: 1, level: isTenantRole ? 'TENANT' : 'SITE' });
      [current] = this.detailLableDS.created;
    } else {
      getDetailLabel({ labelId: record.get('labelId') }).then((res) => {
        if (res && !res.failed) {
          const { docLabelAssignList, ...otherPramas } = res;
          this.tenantLineDs.loadData(docLabelAssignList);
          this.detailLableDS.loadData([{ ...otherPramas }]);
        } else {
          notification.error({ message: res.message });
        }
      });
    }
    Modal.open({
      key: Modal.key(),
      drawer: true,
      title: intl.get('spfm.cnfLabel.model.cnfLabel.createLabel').d('标签创建'),
      children: <LableModal tenantLineDs={this.tenantLineDs} record={current} />,
      onOk: () => this.handleCreate(current),
      onCancel: () => {
        current.reset();
        this.tenantLineDs.loadData([]);
      },
      destroyOnClose: true,
    });
  };

  dataCopy = ({ record }) => {
    const data = record.toJSONData();
    copyLabel({ ...data }).then((res) => {
      if (res && !res.failed) {
        notification.success();
        this.tableDataDs.query();
      } else {
        notification.error({ message: res.message });
      }
    });
  };

  getColumns = () => {
    return [
      {
        name: 'labelCode',
        width: 90,
      },
      {
        name: 'labelName',
      },
      {
        name: 'labelDescription',
        tooltip: 'overflow',
      },
      {
        name: 'docLabelEntityList',
      },
      {
        name: 'icon',
        renderer: ({ value }) => <Icon type={value} />,
      },
      {
        name: 'level',
      },
      {
        name: 'orderSeq',
      },
      {
        name: 'enabledFlag',
        renderer: ({ value }) => enableRender(Number(value)),
      },
      {
        name: 'tenantId',
        width: 100,
        renderer: ({ value }) => {
          return value !== 0 ? (
            <Tag color="green">{intl.get('hzero.common.custom').d('自定义')}</Tag>
          ) : (
            <Tag color="orange">{intl.get('hzero.common.predefined').d('预定义')}</Tag>
          );
        },
      },
      {
        name: 'operation',
        width: 100,
        fixed: 'right',
        renderer: ({ record }) =>
          record.get('tenantId') === 0 && isTenantRole ? (
            <a onClick={() => this.dataCopy({ record })}>
              {intl.get('hzero.common.copy').d('复制')}
            </a>
          ) : (
            <a onClick={() => this.dataCreate({ record })}>
              {intl.get('hzero.common.edit').d('编辑')}
            </a>
          ),
      },
    ];
  };

  handleCreate = async (current) => {
    const flag = await current.validate();
    const currentData = current.toJSONData();
    if (flag) {
      let tableData = [];
      if (currentData.level === 'TENANT') {
        tableData = this.tenantLineDs.toJSONData();
      }
      saveDocLabel({
        docLabelAssignList: isEmpty(tableData) ? null : tableData,
        ...currentData,
        enabledFlag: currentData.enabledFlag ? 1 : 0,
        _status: null,
        __id: null,
      }).then((res) => {
        if (res && !res.failed) {
          notification.success();
          current.reset();
          this.tenantLineDs.loadData([]);
          this.tableDataDs.query();
        } else {
          notification.error({ message: res.message });
          current.reset();
          this.tenantLineDs.loadData([]);
        }
      });
    } else {
      return false;
    }
  };

  render() {
    return (
      <Fragment>
        <Header title={intl.get('spfm.cnfLabel.model.cnfLabel.labelManage').d('标签管理')}>
          <Button color="primary" onClick={this.dataCreate}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <Table
            dataSet={this.tableDataDs}
            key="labelConfigTable"
            columns={this.getColumns()}
            selectionMode="none"
          />
        </Content>
      </Fragment>
    );
  }
}

export default Index;
