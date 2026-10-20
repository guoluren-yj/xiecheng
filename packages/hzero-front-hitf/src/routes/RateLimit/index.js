/**
 * @author HBT <baitao.huang@hand-china.com>
 * @creationDate 2021/6/17
 * @copyright HAND ® 2021
 */
import React from 'react';
import { Header, Content } from 'hzero-front/lib/components/Page';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import { Table, DataSet, Modal } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import {
  operatorRender,
  yesOrNoRender,
  TagRender,
  enableRender,
} from 'hzero-front/lib/utils/renderer';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { isEmpty, toLower, isBoolean } from 'lodash';
import getLang from '@/langs/rateLimitLang';
import { tableDS } from '@/stores/RateLimit/RateLimitDS';
import { SERVICE_TYPE_TAGS, SOURCE_TYPE_TAG } from '@/constants/constants';
import RateLimitDrawer from './RateLimitDrawer';

@formatterCollections({ code: ['hzero.common', getLang('PREFIX')] })
export default class RateLimit extends React.Component {
  constructor(props) {
    super(props);

    this.tableDS = new DataSet(tableDS());
  }

  @Bind()
  openRateLimitDrawer(interfaceData, itfRateLimitId) {
    const drawerProps = {
      itfRateLimitId,
      interfaceData,
      onRefresh: () => this.tableDS.query(),
    };
    Modal.open({
      drawer: true,
      title: getLang('RATE_LIMIT_INFO'),
      style: {
        width: 1000,
      },
      okText: getLang('SAVE'),
      children: <RateLimitDrawer {...drawerProps} />,
    });
  }

  @Bind()
  async handleUpdateUrl(record) {
    record.set('_requestType', 'refresh-url');
    await this.tableDS.submit();
  }

  @Bind()
  async toggleStatus(record) {
    record.set('_requestType', 'enable');
    await this.tableDS.submit().then((res) => {
      if (res && res.success) {
        this.tableDS.query();
      }
    });
  }

  get rateLimitColumns() {
    const {
      match: { path },
    } = this.props;
    return [
      !isTenantRoleLevel() && {
        name: 'tenantName',
      },
      {
        name: 'interfaceCode',
      },
      {
        name: 'interfaceName',
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
      isTenantRoleLevel() && {
        name: 'sourceType',
        width: 90,
        align: 'center',
        renderer: ({ value, text }) => TagRender(value, SOURCE_TYPE_TAG, text),
      },
      {
        name: 'publishType',
        width: 100,
        align: 'center',
        renderer: ({ value }) => {
          return TagRender(value, SERVICE_TYPE_TAGS, value);
        },
      },
      {
        name: 'publicFlag',
        width: 100,
        align: 'center',
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'enabledFlag',
        width: 100,
        align: 'center',
        renderer: ({ value }) => (isBoolean(value) ? enableRender(value ? 1 : 0) : value),
      },
      {
        header: getLang('OPERATOR'),
        width: 240,
        lock: 'right',
        align: 'center',
        renderer: ({ record }) => {
          const {
            publishType,
            rateLimitId,
            enabledFlag,
            lineSize,
            dimensionKey = '',
          } = record.toData();
          let showRefreshBtn = false;
          if (!isEmpty(dimensionKey)) {
            dimensionKey.split(',').forEach((url) => {
              if (url.indexOf(toLower(publishType)) === -1) {
                showRefreshBtn = true;
              }
            });
          }
          const actions = [
            !rateLimitId && {
              ele: (
                <ButtonPermission
                  type="text"
                  permissionList={[
                    {
                      code: `${path}.button.create`,
                      type: 'button',
                      meaning: '接口限流规则列表-新建',
                    },
                  ]}
                  onClick={() => this.openRateLimitDrawer(record.toData())}
                >
                  {getLang('CREATE_RULE')}
                </ButtonPermission>
              ),
              key: 'create',
              len: 4,
              title: getLang('CREATE_RULE'),
            },
            rateLimitId && {
              ele: (
                <ButtonPermission
                  type="text"
                  permissionList={[
                    {
                      code: `${path}.button.edit`,
                      type: 'button',
                      meaning: '接口限流规则列表-编辑',
                    },
                  ]}
                  onClick={() =>
                    this.openRateLimitDrawer(record.toData(), record.get('itfRateLimitId'))
                  }
                >
                  {getLang('EDIT_RULE')}
                </ButtonPermission>
              ),
              key: 'edit',
              len: 4,
              title: getLang('EDIT_RULE'),
            },
            rateLimitId &&
              !enabledFlag && {
                ele: (
                  <ButtonPermission
                    type="text"
                    permissionList={[
                      {
                        code: `${path}.button.enable`,
                        type: 'button',
                        meaning: '接口限流规则列表-启用',
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
            rateLimitId &&
              enabledFlag && {
                ele: (
                  <ButtonPermission
                    type="text"
                    permissionList={[
                      {
                        code: `${path}.button.disable`,
                        type: 'button',
                        meaning: '接口限流规则列表-禁用',
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
            showRefreshBtn && {
              ele: (
                <ButtonPermission
                  type="text"
                  permissionList={[
                    {
                      code: `${path}.button.updateUrl`,
                      type: 'button',
                      meaning: '接口限流规则列表-更新限流地址',
                    },
                  ]}
                  onClick={() => this.handleUpdateUrl(record)}
                >
                  {getLang('UPDATE_URL')}
                </ButtonPermission>
              ),
              key: 'updateUrl',
              len: 6,
              title: getLang('UPDATE_URL'),
            },
            !enabledFlag &&
              lineSize > 0 && {
                ele: (
                  <ButtonPermission
                    type="text"
                    permissionList={[
                      {
                        code: `${path}.button.delete`,
                        type: 'button',
                        meaning: '接口限流规则列表-删除规则',
                      },
                    ]}
                    onClick={() => this.tableDS.delete(record, getLang('DELETE_ALL_RULE_CONFIRM'))}
                  >
                    {getLang('DELETE_RULE')}
                  </ButtonPermission>
                ),
                key: 'delete',
                len: 4,
                title: getLang('DELETE_RULE'),
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
                meaning: '接口限流规则-新建',
              },
            ]}
            icon="add"
            type="c7n-pro"
            color="primary"
            onClick={() => this.openRateLimitDrawer()}
          >
            {getLang('CREATE_RULE')}
          </ButtonPermission>
        </Header>
        <Content>
          <Table dataSet={this.tableDS} columns={this.rateLimitColumns} />
        </Content>
      </>
    );
  }
}
