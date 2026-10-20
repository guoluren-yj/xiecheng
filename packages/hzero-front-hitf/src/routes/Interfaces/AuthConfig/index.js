/**
 * index - 接口平台-应用配置
 * @date: 2018-7-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { DataSet, Modal as C7NModal, Output, Table, Form } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import queryString from 'query-string';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import { Header, Content } from 'hzero-front/lib/components/Page';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';
import { TagRender, operatorRender } from 'hzero-front/lib/utils/renderer';
import getLang from '@/langs/interfacesLang';
import { tableDS, basicFormDS } from '@/stores/Interfaces/authConfigDS';
import { createAuthSelf, updateAuthSelf } from '@/services/interfacesService';
import { AUTH_LEVEL_TAG } from '@/constants/constants';
import styles from '../index.less';
import AuthModal from '../AuthModal';

export default class AuthConfig extends PureComponent {
  constructor(props) {
    super(props);

    this.tableDS = new DataSet(tableDS());
    this.fromDS = new DataSet(basicFormDS());

    this.state = {};
  }

  componentDidMount() {
    const { match = {} } = this.props;
    const { interfaceId } = match.params || {};
    this.handleFetchDetail(interfaceId);
  }

  /**
   * 查询
   */
  @Bind()
  async handleFetchDetail(interfaceId) {
    this.fromDS.setQueryParameter('interfaceId', interfaceId);
    this.tableDS.setQueryParameter('interfaceId', interfaceId);
    await Promise.all([this.fromDS.query(), this.tableDS.query()]);
  }

  /**
   * 新增认证信息
   * @param {Object} params
   */
  @Bind()
  createAuthSelf(data) {
    const { match = {} } = this.props;
    const { interfaceId } = match.params || {};
    return createAuthSelf(interfaceId, data).then((res) => {
      if (res && !res.failed) {
        notification.success();
        this.tableDS.query();
      } else {
        notification.error({ description: res.message });
        return false;
      }
      return res;
    });
  }

  /**
   * 更新认证信息
   * @param {Object} params
   */
  @Bind()
  updateAuthSelf(data) {
    const { match = {} } = this.props;
    const param = (match.params || {}).interfaceId;
    const interfaceId = param.indexOf('?') === -1 ? param : param.substring(0, param.indexOf('?'));

    return updateAuthSelf(interfaceId, data).then((res) => {
      if (res && !res.failed) {
        notification.success();
        this.tableDS.query();
      } else {
        notification.error({ description: res.message });
        return false;
      }
      return res;
    });
  }

  @Bind()
  async deleteRows() {
    const listSelectedRows = this.tableDS.selected;
    if (isEmpty(listSelectedRows)) {
      notification.error({
        message: getLang('EMPTY_AUTH_VALIDATE'),
      });
      return false;
    }
    await this.tableDS.delete(listSelectedRows);
    this.tableDS.query();
  }

  @Bind()
  openEditor(activeRowData = {}) {
    const { match = {} } = this.props;
    const { formDataSource = {} } = this.state;
    const { authFlag } = formDataSource;
    const { interfaceId } = match.params || {};
    const { interfaceAuthId } = activeRowData;
    const modalProps = {
      interfaceId,
      interfaceAuthId,
      authFlag,
      isNew: false,
      onSave: this.updateAuthSelf,
    };
    this.authModal = C7NModal.open({
      title: getLang('EDIT_AUTH'),
      destroyOnClose: true,
      closable: true,
      style: { width: '60%' },
      okText: getLang('SAVE'),
      className: styles['calc-height-modal'],
      children: <AuthModal {...modalProps} />,
    });
  }

  @Bind()
  add() {
    const { match = {} } = this.props;
    const { formDataSource = {} } = this.state;
    const { authFlag } = formDataSource;
    const { interfaceId } = match.params || {};
    const modalProps = {
      authFlag,
      isNew: true,
      interfaceId,
      tenantId: this.fromDS.current.get('tenantId'),
      onSave: this.createAuthSelf,
    };
    this.authModal = C7NModal.open({
      title: getLang('CREATE_AUTH'),
      destroyOnClose: true,
      closable: true,
      style: { width: '60%' },
      okText: getLang('SAVE'),
      className: styles['calc-height-modal'],
      children: <AuthModal {...modalProps} />,
    });
  }

  get tableColumns() {
    const {
      match: { path },
    } = this.props;
    return [
      {
        name: 'authLevel',
        width: 100,
        align: 'center',
        renderer: ({ value, text }) => TagRender(value, AUTH_LEVEL_TAG, text),
      },
      {
        name: 'authLevelValueMeaning',
        width: 180,
      },
      {
        name: 'remark',
      },
      {
        title: getLang('OPERATOR'),
        width: 80,
        fixed: 'right',
        renderer: ({ record }) => {
          const operators = [
            {
              key: 'edit',
              ele: (
                <ButtonPermission
                  type="text"
                  permissionList={[
                    {
                      code: `${path}.button.edit`,
                      type: 'button',
                      meaning: getLang('EDIT'),
                    },
                  ]}
                  onClick={() => this.openEditor(record.toData())}
                  disabled={isTenantRoleLevel() && getCurrentOrganizationId() !== record.tenantId}
                >
                  {getLang('EDIT')}
                </ButtonPermission>
              ),
              len: 2,
              title: getLang('EDIT'),
            },
          ];
          return operatorRender(operators, record);
        },
      },
    ];
  }

  get tableButtons() {
    const {
      match: { path },
    } = this.props;
    return [
      <ButtonPermission
        permissionList={[
          {
            code: `${path}.button.create`,
            type: 'button',
            meaning: '接口能力汇总-认证配置-新建',
          },
        ]}
        icon="add"
        type="c7n-pro"
        onClick={this.add}
      >
        {getLang('CREATE')}
      </ButtonPermission>,
      <ButtonPermission
        permissionList={[
          {
            code: `${path}.button.delete`,
            type: 'button',
            meaning: '接口能力汇总-认证配置-删除',
          },
        ]}
        icon="delete"
        type="c7n-pro"
        onClick={this.deleteRows}
      >
        {getLang('DELETE')}
      </ButtonPermission>,
    ];
  }

  render() {
    const {
      location: { search },
      match: { path },
    } = this.props;
    const { access_token: accessToken } = queryString.parse(search.substring(1));

    return (
      <>
        <Header
          title={getLang('AUTH_CONFIG_HEADER')}
          backPath={
            path.indexOf('/private') === 0
              ? `/private/hitf/interfaces/list?access_token=${accessToken}`
              : '/hitf/interfaces/list'
          }
        />
        <Content>
          <Form labelLayout="horizontal" dataSet={this.fromDS} columns={3}>
            <Output name="interfaceCode" />
            <Output name="interfaceName" />
          </Form>
          <Table
            dataSet={this.tableDS}
            columns={this.tableColumns}
            autoHeight={{ type: 'maxHeight', diff: 90 }}
            buttons={this.tableButtons}
          />
        </Content>
      </>
    );
  }
}
