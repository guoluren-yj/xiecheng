/**
 * smalMixConfigure -混合部署
 * @date: 2020-01-10
 * @author lx <xia.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component, Fragment } from 'react';
import { Table, Modal, Button, Form, Switch } from 'hzero-ui';
import { connect } from 'dva';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';
import { isUndefined, isEmpty } from 'lodash';
import { filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import Lov from 'components/Lov';
import { Header, Content } from 'components/Page';

import FilterForm from './FilterForm';

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
@formatterCollections({
  code: ['small.common', 'small.mallHomePlate'],
})
@Form.create({ fieldNameProp: null })
@connect(({ smalMixConfigure, loading }) => ({
  smalMixConfigure,
  loading: loading.effects['smalMixConfigure/fetchConfigureList'],
  confirmLoading: loading.effects['smalMixConfigure/fetchAddList'],
}))
export default class smalMixConfigure extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      lovValue: {},
      initData: {},
    };
  }

  componentDidMount() {
    this.findConfigureList();
  }

  /**
   * 列表查询
   */
  @Bind()
  findConfigureList(page = {}) {
    const { dispatch } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'smalMixConfigure/fetchConfigureList',
      payload: {
        ...fieldValues,
        page: isEmpty(page) ? {} : page,
      },
    });
  }

  /**
   * 新建/启用/禁用
   */
  @Bind()
  addDataList() {
    const { lovValue, initData } = this.state;
    const {
      dispatch,
      form: { validateFields },
    } = this.props;
    const dataList = initData.tenantId ? initData : lovValue;
    validateFields((err, values) => {
      if (!err) {
        dispatch({
          type: 'smalMixConfigure/fetchAddList',
          payload: {
            ...dataList,
            budgetFlag: values.budgetFlag ? 1 : 0,
            status: values.status ? 1 : 0,
          },
        }).then((res) => {
          if (res) {
            this.setState({
              visible: false,
            });
            notification.success();
            this.findConfigureList();
          }
        });
      }
    });
  }

  @Bind()
  openCreateModal(record) {
    this.setState({
      visible: true,
      initData: record,
    });
  }

  @Bind()
  handleCancel() {
    this.setState({
      visible: false,
    });
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  render() {
    const { initData } = this.state;
    const {
      loading,
      confirmLoading,
      form: { getFieldDecorator },
      smalMixConfigure: { configureList = [], pagination = {} },
    } = this.props;
    const columns = [
      {
        title: intl.get('small.maxConfigure.model.tenantNum').d('租户编号'),
        dataIndex: 'tenantNum',
      },
      {
        title: intl.get('small.maxConfigure.model.tenantName').d('租户名称'),
        dataIndex: 'tenantName',
      },
      {
        title: intl.get('small.common.model.status.budgetFlag').d('预算本地化'),
        dataIndex: 'budgetFlag',
        width: 140,
        render: (flag) =>
          flag
            ? intl.get('small.common.model.status.budgetFlag').d('预算本地化')
            : intl.get('small.common.model.standard').d('标准'),
      },
      {
        title: intl.get('small.common.model.status').d('状态'),
        dataIndex: 'status',
        width: 120,
        render: (text) =>
          text
            ? intl.get('small.common.button.enable').d('启用')
            : intl.get('small.common.new.button.disable').d('禁用'),
      },
      {
        title: intl.get('small.common.model.operation').d('操作'),
        width: 100,
        render: (record) => {
          return (
            <a
              onClick={() => {
                this.openCreateModal(record);
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        },
      },
    ];
    const filterProps = {
      onRef: this.handleRef,
      findConfigureList: this.findConfigureList,
    };
    return (
      <Fragment>
        <Header title={intl.get('small.maxConfigure.view.maxConfigure').d('混合配置')}>
          <Button type="primary" onClick={this.openCreateModal}>
            {intl.get('small.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <FilterForm {...filterProps} />
          <Table
            bordered
            className="small-table-all-space"
            rowKey="tenantId"
            loading={loading}
            columns={columns}
            dataSource={configureList}
            pagination={pagination}
            onChange={(page) => this.findConfigureList(page)}
          />
        </Content>
        <Modal
          destroyOnClose
          title={intl.get('small.maxConfigure.view.maintenanceTenant').d('维护租户')}
          confirmLoading={confirmLoading}
          onOk={this.addDataList}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          // transitionName='move-right'
          // wrapClassName='ant-modal-sidebar-right'
        >
          <Form>
            <Form.Item label={intl.get('small.common.model.tenant').d('租户')} {...formLayout}>
              {getFieldDecorator('tenantId', {
                initialValue: initData.tenantId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('small.common.model.tenant').d('租户'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="HPFM.TENANT"
                  disabled={initData.tenantName}
                  textValue={initData.tenantName}
                  onChange={(_, value) => {
                    this.setState({
                      lovValue: value,
                    });
                  }}
                />
              )}
            </Form.Item>
            <Form.Item
              label={intl.get('small.common.model.status.budgetFlag').d('预算本地化')}
              {...formLayout}
            >
              {getFieldDecorator('budgetFlag', {
                initialValue: !!initData.budgetFlag,
              })(<Switch />)}
            </Form.Item>
            <Form.Item label={intl.get('small.common.model.status').d('状态')} {...formLayout}>
              {getFieldDecorator('status', {
                initialValue: !!initData.status,
              })(<Switch />)}
            </Form.Item>
          </Form>
        </Modal>
      </Fragment>
    );
  }
}
