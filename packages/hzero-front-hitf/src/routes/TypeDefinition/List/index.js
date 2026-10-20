/* eslint-disable no-unused-vars */
/**
 * TypeApplication - 组合应用定义
 * @date: 2019-8-22
 * @author: hulingfangzi <lingfangzi.hu01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Header, Content } from 'hzero-front/lib/components/Page';
import queryString from 'query-string';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import intl from 'hzero-front/lib/utils/intl';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import notification from 'hzero-front/lib/utils/notification';
import withProps from 'hzero-front/lib/utils/withProps';
import { enableRender, TagRender, operatorRender } from 'hzero-front/lib/utils/renderer';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import { tableDS as TableDS } from '@/stores/TypeDefinition/typeDefinitionDS';
import getLang from '@/langs/typeDefinitionLang';
import { SERVICE_TYPE_TAGS, EXECUTIVE_STRATEGY_TAG } from '@/constants/constants';

/**
 * 组合应用定义
 * @extends {Component} - PureComponent
 * @return React.element
 */

@formatterCollections({
  code: ['hzero.common', 'hitf.typeDefinition', 'hitf.services'],
})
@withProps(
  () => {
    const tableDS = new DataSet(TableDS());
    return { tableDS };
  },
  { cacheState: true }
)
export default class TypeDefinition extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {};
  }

  /**
   * 跳转至新建实例页面
   */
  @Bind()
  redirectToCreate() {
    const {
      history,
      location: { search, pathname },
    } = this.props;
    const { access_token: accessToken } = queryString.parse(search.substring(1));
    history.push({
      pathname:
        pathname.indexOf('/private') === 0
          ? `/private/hitf/application-type-definition/create`
          : `/hitf/application-type-definition/create`,
      search: pathname.indexOf('/private') === 0 ? `?access_token=${accessToken}` : '',
    });
  }

  /**
   * 跳转至编辑实例页面
   *@param {number} applicationId - 应用ID
   */
  @Bind()
  redirectToEdit(applicationId) {
    const {
      history,
      location: { search, pathname },
    } = this.props;
    const { access_token: accessToken } = queryString.parse(search.substring(1));
    history.push({
      pathname:
        pathname.indexOf('/private') === 0
          ? `/private/hitf/application-type-definition/detail/${applicationId}`
          : `/hitf/application-type-definition/detail/${applicationId}`,
      search: pathname.indexOf('/private') === 0 ? `?access_token=${accessToken}` : '',
    });
  }

  /**
   * 删除应用定义
   */
  @Bind()
  async handleDeleteDefinition() {
    const { tableDS } = this.props;
    const selectedRows = tableDS.selected;
    if (isEmpty(selectedRows)) {
      notification.error({
        message: getLang('EMPTY_VALIDATE'),
      });
      return false;
    }
    await tableDS.delete(selectedRows);
    tableDS.query();
  }

  get tableColumns() {
    return [
      !isTenantRoleLevel() && {
        name: 'tenantName',
        width: 150,
      },
      {
        name: 'applicationCode',
        width: 200,
      },
      {
        name: 'applicationName',
        width: 200,
      },
      {
        name: 'majorCategoryMeaning',
        width: 100,
      },
      {
        name: 'minorCategoryMeaning',
        width: 100,
      },
      {
        name: 'serviceType',
        width: 100,
        align: 'center',
        renderer: ({ value, text }) => TagRender(value, SERVICE_TYPE_TAGS, text),
      },
      {
        name: 'interfaceName',
        width: 200,
      },
      {
        name: 'composePolicy',
        width: 90,
        align: 'center',
        renderer: ({ value, text }) => TagRender(value, EXECUTIVE_STRATEGY_TAG, text),
      },
      {
        name: 'enabledFlag',
        width: 90,
        renderer: ({ value }) => enableRender(value),
      },
      {
        name: 'remark',
        width: 200,
      },
      {
        title: getLang('OPERATOR'),
        width: 120,
        lock: 'right',
        align: 'center',
        renderer: ({ record }) => {
          const operators = [
            {
              key: 'edit',
              ele: (
                <a onClick={() => this.redirectToEdit(record.get('applicationId'))}>
                  {getLang('EDIT')}
                </a>
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

  render() {
    const {
      match: { path },
      tableDS,
    } = this.props;
    return (
      <>
        <Header
          title={intl
            .get('hitf.typeDefinition.view.message.title.typeDefinition')
            .d('组合应用定义')}
        >
          <ButtonPermission
            permissionList={[
              {
                code: `${path}.button.create`,
                type: 'button',
                meaning: '组合应用定义-新建',
              },
            ]}
            icon="add"
            type="c7n-pro"
            color="primary"
            onClick={this.redirectToCreate}
          >
            {getLang('CREATE')}
          </ButtonPermission>
          <ButtonPermission
            permissionList={[
              {
                code: `${path}.button.delete`,
                type: 'button',
                meaning: '组合应用定义-删除',
              },
            ]}
            icon="delete"
            type="c7n-pro"
            onClick={this.handleDeleteDefinition}
          >
            {getLang('DELETE')}
          </ButtonPermission>
        </Header>
        <Content>
          <Table
            dataSet={tableDS}
            columns={this.tableColumns}
            autoHeight={{ type: 'maxHeight', diff: 90 }}
          />
        </Content>
      </>
    );
  }
}
