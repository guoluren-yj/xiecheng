/**
 * mixConfigure -混合部署
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

import Lov from 'components/Lov';
import { Header, Content } from 'components/Page';

import FilterForm from './FilterForm';

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
@Form.create({ fieldNameProp: null })
@connect(({ mixConfigure, loading }) => ({
  mixConfigure,
  loading: loading.effects['mixConfigure/fetchConfigureList'],
  confirmLoading: loading.effects['mixConfigure/fetchAddList'],
}))
export default class MixConfigure extends Component {
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
      type: 'mixConfigure/fetchConfigureList',
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
          type: 'mixConfigure/fetchAddList',
          payload: {
            ...dataList,
            status: values.status ? 1 : 0,
          },
        }).then(res => {
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
      mixConfigure: { configureList = [], pagination = {} },
    } = this.props;
    const columns = [
      {
        title: intl.get('scec.common.model.common.tenantNum').d('租户编号'),
        dataIndex: 'tenantNum',
      },
      {
        title: intl.get('scec.common.model.common.tenantName').d('租户名称'),
        dataIndex: 'tenantName',
      },
      {
        title: intl.get('scec.common.model.productStatus').d('状态'),
        dataIndex: 'status',
        width: 120,
        render: text => (text ? '启用' : '禁用'),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 100,
        render: record => {
          return (
            <a
              onClick={() => {
                this.openCreateModal(record);
              }}
            >
              {!record.status
                ? intl.get('hzero.common.status.enable').d('启用')
                : intl.get('hzero.common.status.disable').d('禁用')}
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
        <Header title={intl.get('scec.maxConfigure.view.maxConfigure.title').d('混合配置')}>
          <Button type="primary" onClick={this.openCreateModal}>
            新建
          </Button>
        </Header>
        <Content>
          <FilterForm {...filterProps} />
          <Table
            bordered
            rowKey="tenantId"
            loading={loading}
            columns={columns}
            dataSource={configureList}
            pagination={pagination}
            onChange={page => this.findConfigureList(page)}
          />
        </Content>
        <Modal
          destroyOnClose
          title="维护租户"
          confirmLoading={confirmLoading}
          onOk={this.addDataList}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          // transitionName='move-right'
          // wrapClassName='ant-modal-sidebar-right'
        >
          <Form>
            <Form.Item label="租户" {...formLayout}>
              {getFieldDecorator('tenantId', {
                initialValue: initData.tenantId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: '租户',
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
            <Form.Item label={intl.get('hzero.common.status').d('状态')} {...formLayout}>
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
