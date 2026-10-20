import React from 'react';
import { DataSet, Modal, Table } from 'choerodon-ui/pro';
import { Tabs, Tag } from 'choerodon-ui';
import { Header, Content } from 'hzero-front/lib/components/Page';
import { operatorRender, enableRender } from 'hzero-front/lib/utils/renderer';
import { getResponse, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { Bind } from 'lodash-decorators';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { serverDomainTreeDS, serverDomainListDS } from '@/stores/ServerDomain/ServerDomainDS';
import getLang from '@/langs/serverDomainLang';
import DomainDrawer from './DomainDrawer';

const { TabPane } = Tabs;

@formatterCollections({
  code: ['hzero.common', getLang('PREFIX')],
})
class ServerDomain extends React.Component {
  constructor(props) {
    super(props);
    this.serverDomainTreeDS = new DataSet(serverDomainTreeDS());
    this.serverDomainListDS = new DataSet(serverDomainListDS());
  }

  /**
   * 启用/禁用
   */
  @Bind()
  async handleToggle(record, dataset, requestType) {
    record.set('_requestType', requestType);
    const confirm = await Modal.confirm({
      children: (
        <p>{requestType === 'enable' ? getLang('ENABLE_CONFIRM') : getLang('DISABLE_CONFIRM')}</p>
      ),
    });
    if (confirm === 'ok') {
      const res = await dataset.submit();
      if (getResponse(res)) {
        await dataset.query();
      }
    }
  }

  /**
   * 删除
   */
  @Bind()
  async handleDelete(record, dataset) {
    const res = await dataset.delete(record, getLang('DELETE_CONFIRM'));
    if (res) {
      this.serverDomainListDS.query();
      this.serverDomainTreeDS.query();
    }
  }

  /**
   * 新建or编辑
   */
  @Bind()
  openDomainDrawer(record, operateType) {
    const domainDrawerProps = {
      operateType,
      selectedDomainRecord: record,
      onRefresh: this.fetchList,
    };
    Modal.open({
      key: Modal.key(),
      title: `${
        operateType === 'edit'
          ? getLang('EDIT')
          : `${
              operateType === 'add'
                ? getLang('ADD_SERVER_DOMAIN')
                : getLang('ADD_SERVER_DOMAIN_NEXT')
            }`
      }`,
      style: {
        width: 600,
      },
      drawer: true,
      children: <DomainDrawer {...domainDrawerProps} />,
      okText: getLang('SAVE'),
    });
  }

  @Bind()
  fetchList() {
    this.serverDomainListDS.query();
    this.serverDomainTreeDS.query();
  }

  columns(isTree) {
    const { match } = this.props;
    const { path } = match;
    return [
      { name: 'domainName', width: 300 },
      { name: 'domainCode', width: isTree ? '' : 300 },
      {
        name: 'enabledFlag',
        width: 80,
        renderer: ({ value }) => enableRender(value ? 1 : 0),
      },
      !isTree
        ? {
            name: 'nameLevelPaths',
            renderer: ({ value }) => {
              return value.join('/');
            },
          }
        : '',
      isTenantRoleLevel() && {
        name: 'source',
        width: 100,
        align: 'center',
        renderer: ({ value, record }) => (
          <Tag color={record.get('predefinedFlag') ? 'orange' : 'green'}>{value}</Tag>
        ),
      },
      {
        header: getLang('OPTION'),
        width: 200,
        lock: 'right',
        align: 'center',
        renderer: ({ record, dataSet }) => {
          const enabledFlag = record.get('enabledFlag');
          const predefinedFlag = record.get('predefinedFlag');
          const operators = [
            {
              key: 'addSon',
              ele: (
                <ButtonPermission
                  type="text"
                  permissionList={[
                    {
                      code: `${path}.button.add`,
                      type: 'button',
                      meaning: '服务领域-子级领域',
                    },
                  ]}
                  onClick={() => this.openDomainDrawer(record, 'addSon')}
                >
                  {getLang('SERVER_DOMAIN_SON')}
                </ButtonPermission>
              ),
              len: 5,
              title: getLang('SERVER_DOMAIN_SON'),
            },
            !predefinedFlag && {
              ele: (
                <ButtonPermission
                  type="text"
                  permissionList={[
                    {
                      code: `${path}.button.edit`,
                      type: 'button',
                      meaning: '服务领域-编辑',
                    },
                  ]}
                  onClick={() => this.openDomainDrawer(record, 'edit')}
                >
                  {getLang('EDIT')}
                </ButtonPermission>
              ),
              key: 'edit',
              len: 2,
              title: getLang('EDIT'),
            },
            !predefinedFlag &&
              !enabledFlag && {
                ele: (
                  <ButtonPermission
                    type="text"
                    permissionList={[
                      {
                        code: `${path}.button.delete`,
                        type: 'button',
                        meaning: '服务领域-删除',
                      },
                    ]}
                    onClick={() => this.handleDelete(record, dataSet)}
                  >
                    {getLang('DELETE')}
                  </ButtonPermission>
                ),
                key: 'delete',
                len: 2,
                title: getLang('DELETE'),
              },
            !predefinedFlag &&
              !enabledFlag && {
                ele: (
                  <ButtonPermission
                    type="text"
                    permissionList={[
                      {
                        code: `${path}.button.enable`,
                        type: 'button',
                        meaning: '服务领域-启用',
                      },
                    ]}
                    onClick={() => this.handleToggle(record, dataSet, 'enable')}
                  >
                    {getLang('ENABLED')}
                  </ButtonPermission>
                ),
                key: 'enable',
                len: 2,
                title: getLang('ENABLED'),
              },
            !predefinedFlag &&
              enabledFlag && {
                ele: (
                  <ButtonPermission
                    type="text"
                    permissionList={[
                      {
                        code: `${path}.button.disable`,
                        type: 'button',
                        meaning: '服务领域-禁用',
                      },
                    ]}
                    onClick={() => this.handleToggle(record, dataSet, 'disable')}
                  >
                    {getLang('DISABLED')}
                  </ButtonPermission>
                ),
                key: 'disable',
                len: 2,
                title: getLang('DISABLED'),
              },
          ];
          return operatorRender(operators, record, { limit: 4 });
        },
      },
    ];
  }

  render() {
    const { match } = this.props;
    const { path } = match;
    return (
      <>
        <Header title={getLang('SERVER_DOMAIN_CONFIG')}>
          <ButtonPermission
            permissionList={[
              {
                code: `${path}.button.create`,
                type: 'button',
                meaning: '服务领域-新建',
              },
            ]}
            icon="add"
            type="c7n-pro"
            color="primary"
            onClick={() => this.openDomainDrawer(undefined, 'add')}
          >
            {getLang('CREATE')}
          </ButtonPermission>
        </Header>
        <Content>
          <Tabs defaultActiveKey="1" className="page-tabs">
            <TabPane tab={getLang('TREE_STRUCTURE')} key="1">
              <Table
                border
                dataSet={this.serverDomainTreeDS}
                columns={this.columns(true)}
                expandIconColumnIndex={0}
                mode="tree"
              />
            </TabPane>
            <TabPane tab={getLang('PAGING_STRUCTURE')} key="2">
              <Table border dataSet={this.serverDomainListDS} columns={this.columns(false)} />
            </TabPane>
          </Tabs>
        </Content>
      </>
    );
  }
}

export default ServerDomain;
