/**
 * TypeApplication - 组合应用定义-详情
 * @date: 2019/8/22
 * @author: hulingfangzi <lingfangzi.hu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import {
  DataSet,
  Table,
  Form,
  TextField,
  Select,
  Switch,
  Lov,
  Modal,
  Output,
} from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import { isEmpty, isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import queryString from 'query-string';
import notification from 'hzero-front/lib/utils/notification';
import { Header, Content } from 'hzero-front/lib/components/Page';
import { enableRender, operatorRender } from 'hzero-front/lib/utils/renderer';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import {
  DETAIL_CARD_CLASSNAME,
  DETAIL_CARD_TABLE_CLASSNAME,
} from 'hzero-front/lib/utils/constants';
import { basicFormDS, instTableDS } from '@/stores/TypeDefinition/typeDefinitionDS';
import getLang from '@/langs/typeDefinitionLang';
import InstanceDrawer from './InstanceDrawer';

/**
 *  组合应用定义-详情
 * @extends {Component} - React.Component
 * @return React.element
 */
export default class Detail extends Component {
  constructor(props) {
    super(props);

    this.formDS = new DataSet(basicFormDS());
    this.tableDS = new DataSet(instTableDS());

    this.state = {
      composePolicy: '',
    };
  }

  /**
   * 初始查询列表数据
   */
  componentDidMount() {
    this.handleSearch();
  }

  @Bind()
  async handleSearch() {
    const { match = {} } = this.props;
    const { id } = match.params;
    if (!isUndefined(id)) {
      this.formDS.setQueryParameter('applicationId', id);
      this.tableDS.setQueryParameter('applicationId', id);
      await Promise.all([this.formDS.query(), this.tableDS.query()]);
      this.setState({
        composePolicy: this.formDS.current.get('composePolicy'),
      });
    } else {
      this.formDS.create();
    }
  }

  /**
   * 创建/修改应用类型
   */
  @Bind()
  async handleSaveDefinitionHead() {
    const validate = await this.formDS.validate();
    if (!validate) {
      return false;
    }
    const { match = {} } = this.props;
    const { id } = match.params;
    const isCreate = isUndefined(id);
    return this.formDS.submit().then((response) => {
      if (response && !response.failed) {
        if (!isCreate) {
          Promise.all([this.formDS.query(), this.tableDS.query()]);
          this.setState({
            composePolicy: this.formDS.current.get('composePolicy'),
          });
        } else {
          this.redirectToEdit(response.applicationId);
        }
      }
    });
  }

  /**
   * 跳转至编辑页面
   *@param {number} applicationId - 应用ID
   */
  @Bind()
  redirectToEdit(applicationId) {
    const {
      dispatch,
      location: { search, pathname },
    } = this.props;
    const { access_token: accessToken } = queryString.parse(search.substring(1));
    dispatch(
      routerRedux.push({
        pathname:
          pathname.indexOf('/private') === 0
            ? `/private/hitf/application-type-definition/detail/${applicationId}?access_token=${accessToken}`
            : `/hitf/application-type-definition/detail/${applicationId}`,
      })
    );
  }

  /**
   * 跳转到服务注册明细页
   */
  @Bind()
  handleGotoServiceDetail(params, autoOpenInterfaceDrawer = false) {
    const { interfaceServerId, instInterfaceId } = params ? params.toData() : {};
    let search = {};
    if (autoOpenInterfaceDrawer) {
      search = {
        autoOpenInterfaceDrawer,
        interfaceId: instInterfaceId,
      };
    }
    this.props.dispatch(
      routerRedux.push({
        pathname: `/hitf/services/detail/${interfaceServerId}`,
        search: queryString.stringify(search),
      })
    );
  }

  /**
   * 删除实例配置行
   */
  @Bind()
  async deleteLine() {
    const listSelectedRows = this.tableDS.selected;
    if (isEmpty(listSelectedRows)) {
      notification.error({
        message: getLang('EMPTY_INST_VALIDATE'),
      });
      return false;
    }
    await this.tableDS.delete(listSelectedRows);
    this.tableDS.query();
  }

  /**
   * 创建实例配置
   */
  @Bind()
  handleInstSave(cb = () => {}) {
    return cb().then((response) => {
      if (response && !response.failed) {
        this.tableDS.query();
      }
    });
  }

  /**
   * 打开实例配置详情界面
   */
  @Bind()
  handleOpenInstModal(data = {}) {
    const {
      applicationCode,
      applicationId,
      tenantId,
      composePolicy,
    } = this.formDS.current.toData();
    const { applicationInstId } = data;
    const instanceProps = {
      tenantId,
      applicationId,
      applicationCode,
      composePolicy,
      ...data,
      onSave: this.handleInstSave,
    };
    Modal.open({
      title: isUndefined(applicationInstId)
        ? getLang('INSTANCE_CREATE_TITLE')
        : getLang('INSTANCE_EDIT_TITLE'),
      drawer: true,
      closable: true,
      style: { width: 1000 },
      destroyOnClose: true,
      children: <InstanceDrawer {...instanceProps} />,
    });
  }

  get tableColumns() {
    const { composePolicy } = this.state;
    return [
      {
        name: 'interfaceCode',
        width: 150,
        renderer: ({ value, record }) => (
          <a onClick={() => this.handleGotoServiceDetail(record, true)}>{value}</a>
        ),
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
      !isTenantRoleLevel() && {
        name: 'tenantName',
        width: 150,
      },
      composePolicy === 'WEIGHT' && {
        name: 'weight',
        width: 150,
      },
      composePolicy === 'ROUND_ROBIN' && {
        name: 'orderSeq',
        width: 150,
      },
      {
        name: 'remark',
      },
      {
        name: 'enabledFlag',
        width: 100,
        renderer: ({ value }) => enableRender(value),
      },
      {
        title: getLang('OPERATOR'),
        width: 100,
        lock: 'right',
        align: 'center',
        renderer: ({ record }) => {
          const operators = [
            {
              key: 'edit',
              ele: (
                <a onClick={() => this.handleOpenInstModal(record.toData())}>{getLang('EDIT')}</a>
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
    const { match = {} } = this.props;
    const { id } = match.params;
    const isCreate = isUndefined(id);
    return [
      <ButtonPermission
        permissionList={[
          {
            code: `${match.path}.button.create`,
            type: 'button',
            meaning: '组合应用定义-实例配置-新建',
          },
        ]}
        icon="add"
        type="c7n-pro"
        disabled={isCreate}
        onClick={this.handleOpenInstModal}
      >
        {getLang('CREATE')}
      </ButtonPermission>,
      <ButtonPermission
        permissionList={[
          {
            code: `${match.path}.button.delete`,
            type: 'button',
            meaning: '组合应用定义-实例配置-删除',
          },
        ]}
        icon="delete"
        type="c7n-pro"
        disabled={isCreate}
        onClick={this.deleteLine}
      >
        {getLang('DELETE')}
      </ButtonPermission>,
    ];
  }

  render() {
    const {
      match = {},
      location: { search },
    } = this.props;
    const { id } = match.params;
    const isCreate = isUndefined(id);
    const { access_token: accessToken } = queryString.parse(search.substring(1));
    return (
      <>
        <Header
          title={getLang('INSTANCE_TITLE')}
          backPath={
            match.path.indexOf('/private') === 0
              ? `/private/hitf/application-type-definition/list?access_token=${accessToken}`
              : '/hitf/application-type-definition/list'
          }
        >
          <ButtonPermission
            permissionList={[
              {
                code: `${match.path}.button.save`,
                type: 'button',
                meaning: '组合应用定义-保存',
              },
            ]}
            icon="save"
            type="c7n-pro"
            color="primary"
            onClick={() => this.handleSaveDefinitionHead()}
          >
            {getLang('SAVE')}
          </ButtonPermission>
        </Header>
        <Content>
          <Card
            key="instance-head"
            bordered={false}
            title={<h3>{getLang('APPLICATION_TYPE')}</h3>}
            className={DETAIL_CARD_CLASSNAME}
          >
            <Form dataSet={this.formDS} columns={3} labelLayout="horizontal">
              <TextField name="applicationCode" restrict="a-zA-Z0-9-_./" disabled={!isCreate} />
              <TextField name="applicationName" />
              <Lov name="tenantLov" disabled={!isCreate} />
              <Lov name="majorCategoryLov" />
              <Select name="minorCategory" />
              <Select name="serviceType" />
              {isCreate ? (
                <Lov name="interfaceLov" disabled />
              ) : (
                <Output
                  name="interfaceServerName"
                  renderer={({ value }) => {
                    return (
                      <a onClick={() => this.handleGotoServiceDetail(this.formDS.current)}>
                        {value}
                      </a>
                    );
                  }}
                />
              )}
              <Select name="composePolicy" />
              <Switch name="enabledFlag" />
              <TextField name="remark" />
              <Switch name="fastFailFlag" />
            </Form>
          </Card>
          <Card
            key="instance-line"
            bordered={false}
            title={<h3>{getLang('INSTANCE_TITLE')}</h3>}
            className={DETAIL_CARD_TABLE_CLASSNAME}
          >
            <Table dataSet={this.tableDS} columns={this.tableColumns} buttons={this.tableButtons} />
          </Card>
        </Content>
      </>
    );
  }
}
