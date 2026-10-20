/**
 * @author HBT <baitao.huang@hand-china.com>
 * @creationDate 2021/7/2
 * @copyright HAND ® 2021
 */
import React from 'react';
import { Header, Content } from 'hzero-front/lib/components/Page';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import { Table, DataSet } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { operatorRender, enableRender } from 'hzero-front/lib/utils/renderer';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { isUndefined, isBoolean } from 'lodash';
import { routerRedux } from 'dva/router';
import withProps from 'hzero-front/lib/utils/withProps';
import getLang from '@/langs/interfaceForwardLang';
import { tableDS as TableDS } from '@/stores/InterfaceForward/InterfaceForwardDS';

@formatterCollections({ code: ['hzero.common', getLang('PREFIX')] })
@withProps(
  () => {
    const tableDS = new DataSet(TableDS());
    return { tableDS };
  },
  { cacheState: true, keepOriginDataSet: false }
)
export default class InterfaceForward extends React.Component {
  @Bind()
  async toggleStatus(record) {
    record.set('enable', true);
    await this.props.tableDS.submit().then((res) => {
      if (res && res.success) {
        this.props.tableDS.query();
      }
    });
  }

  /**
   * 跳转到新建/明细页面
   * @param {*} id
   */
  @Bind()
  handleGotoDetail(id) {
    const path = isUndefined(id) ? '/create' : `/detail/${id}`;
    this.props.dispatch(
      routerRedux.push({
        pathname: `/hitf/interface-forward${path}`,
      })
    );
  }

  get interfaceForwardColumns() {
    const {
      match: { path },
    } = this.props;
    return [
      {
        name: 'urlRuleCode',
        width: 150,
      },
      {
        name: 'interfaceCode',
        width: 150,
      },
      {
        name: 'interfaceName',
        width: 150,
      },
      {
        name: 'serverCode',
        width: 150,
      },
      {
        name: 'serverName',
        width: 150,
      },
      {
        name: 'namespace',
        width: 120,
      },
      {
        name: 'targetServiceName',
        width: 150,
      },
      {
        name: 'enabledFlag',
        width: 100,
        align: 'center',
        renderer: ({ value }) => (isBoolean(value) ? enableRender(value ? 1 : 0) : value),
      },
      {
        name: 'description',
      },
      {
        header: getLang('OPERATOR'),
        width: 150,
        lock: 'right',
        align: 'center',
        renderer: ({ record }) => {
          const { enabledFlag } = record.toData();
          const actions = [
            {
              ele: (
                <ButtonPermission
                  type="text"
                  onClick={() => this.handleGotoDetail(record.get('forwardId'))}
                >
                  {getLang('EDIT')}
                </ButtonPermission>
              ),
              key: 'edit',
              len: 2,
              title: getLang('EDIT'),
            },
            !enabledFlag && {
              ele: (
                <ButtonPermission
                  type="text"
                  permissionList={[
                    {
                      code: `${path}.button.enable`,
                      type: 'button',
                      meaning: '接口转发配置列表-启用',
                    },
                  ]}
                  onClick={() => this.toggleStatus(record)}
                >
                  {getLang('ENABLE')}
                </ButtonPermission>
              ),
              key: 'enable',
              len: 2,
              title: getLang('ENABLE'),
            },
            enabledFlag && {
              ele: (
                <ButtonPermission
                  type="text"
                  permissionList={[
                    {
                      code: `${path}.button.disable`,
                      type: 'button',
                      meaning: '接口转发配置列表-禁用',
                    },
                  ]}
                  onClick={() => this.toggleStatus(record)}
                >
                  {getLang('DISABLE')}
                </ButtonPermission>
              ),
              key: 'disable',
              len: 2,
              title: getLang('DISABLE'),
            },
            !enabledFlag && {
              ele: (
                <ButtonPermission
                  type="text"
                  permissionList={[
                    {
                      code: `${path}.button.delete`,
                      type: 'button',
                      meaning: '接口转发配置列表-删除',
                    },
                  ]}
                  onClick={() => this.props.tableDS.delete(record)}
                >
                  {getLang('DELETE')}
                </ButtonPermission>
              ),
              key: 'delete',
              len: 2,
              title: getLang('DELETE'),
            },
          ];
          return operatorRender(actions, record);
        },
      },
    ];
  }

  render() {
    const {
      match: { path },
    } = this.props;
    return (
      <>
        <Header title={getLang('HEADER')}>
          <ButtonPermission
            permissionList={[
              {
                code: `${path}.button.create`,
                type: 'button',
                meaning: '接口转发配置-新建',
              },
            ]}
            icon="add"
            type="c7n-pro"
            color="primary"
            onClick={() => this.handleGotoDetail()}
          >
            {getLang('CREATE')}
          </ButtonPermission>
        </Header>
        <Content>
          <Table dataSet={this.props.tableDS} columns={this.interfaceForwardColumns} />
        </Content>
      </>
    );
  }
}
