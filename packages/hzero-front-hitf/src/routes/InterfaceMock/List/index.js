/**
 * 接口MOCK
 * @author HBT <baitao.huang@hand-china.com>
 * @creationDate 2021/6/10
 * @copyright HAND ® 2021
 */
import React from 'react';
import { Header, Content } from 'hzero-front/lib/components/Page';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import { Table, DataSet } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { operatorRender, TagRender } from 'hzero-front/lib/utils/renderer';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { routerRedux } from 'dva/router';
import { isUndefined } from 'lodash';
import { isTenantRoleLevel, getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { API_HOST, HZERO_HITF } from 'hzero-front/lib/utils/config';
import withProps from 'hzero-front/lib/utils/withProps';
import * as ClipBoard from 'clipboard-polyfill/text';
import notification from 'hzero-front/lib/utils/notification';
import getLang from '@/langs/interfaceMockLang';
import { tableDS as TableDS } from '@/stores/InterfaceMock/InterfaceMockDS';
import { EXECUTIVE_STRATEGY_TAG } from '@/constants/constants';

@formatterCollections({ code: ['hzero.common', getLang('PREFIX')] })
@withProps(
  () => {
    const tableDS = new DataSet(TableDS());
    return { tableDS };
  },
  { cacheState: true, keepOriginDataSet: false }
)
export default class InterfaceMock extends React.PureComponent {
  /**
   * 跳转到新建/明细页面
   * @param {*} id
   */
  @Bind()
  handleGotoDetail(id) {
    const { dispatch = () => {} } = this.props;
    const path = isUndefined(id) ? '/create' : `/detail/${id}`;
    dispatch(
      routerRedux.push({
        pathname: `/hitf/interface-mock${path}`,
      })
    );
  }

  handleCopyMockUrl(record) {
    const { tenantId, mockGroupCode } = record.toData();
    const level = isTenantRoleLevel() ? `/${getCurrentOrganizationId()}` : '';
    const mockUrl = `${API_HOST}${HZERO_HITF}/v1${level}/mocks/${tenantId}/${mockGroupCode}`;
    return ClipBoard.writeText(mockUrl).then(
      // eslint-disable-next-line func-names
      function () {
        notification.success({
          message: getLang('COPY_SUCCESS'),
        });
      }
    );
  }

  get mockColumns() {
    const {
      match: { path },
    } = this.props;
    return [
      !isTenantRoleLevel() && {
        name: 'tenantName',
        width: 150,
      },
      {
        name: 'mockGroupCode',
        width: 250,
        renderer: ({ value, record }) => (
          <a onClick={() => this.handleGotoDetail(record.get('mockGroupId'))}>{value}</a>
        ),
      },
      {
        name: 'mockGroupName',
        width: 250,
      },
      {
        name: 'mockStrategy',
        width: 100,
        align: 'center',
        renderer: ({ value, record }) =>
          TagRender(value, EXECUTIVE_STRATEGY_TAG, record.get('mockStrategyMeaning')),
      },
      {
        name: 'remark',
      },
      {
        header: getLang('OPERATOR'),
        width: 200,
        lock: 'right',
        align: 'center',
        renderer: ({ record }) => {
          const actions = [
            {
              ele: (
                <ButtonPermission
                  type="text"
                  onClick={() => this.handleGotoDetail(record.get('mockGroupId'))}
                >
                  {getLang('EDIT')}
                </ButtonPermission>
              ),
              key: 'edit',
              len: 2,
              title: getLang('EDIT'),
            },
            {
              ele: (
                <ButtonPermission type="text" onClick={() => this.handleCopyMockUrl(record)}>
                  {getLang('COPY_URL')}
                </ButtonPermission>
              ),
              key: 'copy',
              len: 7,
              title: getLang('COPY_URL'),
            },
            {
              ele: (
                <ButtonPermission
                  type="text"
                  permissionList={[
                    {
                      code: `${path}.button.delete`,
                      type: 'button',
                      meaning: '接口MOCK-删除',
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
          return operatorRender(actions, record, { limit: 3 });
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
                meaning: '接口MOCK-新建',
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
          <Table dataSet={this.props.tableDS} columns={this.mockColumns} />
        </Content>
      </>
    );
  }
}
