/**
 * paymentUsagesList - 付款用途定义
 * @date: 2018-7-11
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { Form, Input, Button, Modal, Table } from 'hzero-ui';
import lodash from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import Switch from 'components/Switch';
import cacheComponent from 'components/CacheComponent';
import { enableRender } from 'utils/renderer';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';
import TLEditor from 'components/TLEditor';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;
/**
 * modal的侧滑属性
 */
const otherProps = {
  wrapClassName: 'ant-modal-sidebar-right',
  transitionName: 'move-right',
};

/**
 * 付款用途编辑弹框
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @reactProps {Object} editRowData - 当前编辑数据
 * @reactProps {Object} modalVisible - 控制modal显示/隐藏属性
 * @reactProps {Function} handleAdd - 数据保存
 * @reactProps {Function} showEditModal - 控制modal显示隐藏方法
 * @return React.element
 */
const CreateForm = Form.create({ fieldNameProp: null })((props) => {
  const { form, modalVisible, handleAdd, showEditModal, editRowData, loading } = props;
  const { usageCode, usageName, description, enabledFlag } = editRowData;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      handleAdd(fieldsValue, form);
    });
  };
  const cancelHandle = () => {
    showEditModal(false);
    form.resetFields();
  };
  const formLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 15 },
  };
  return (
    <Modal
      confirmLoading={loading}
      title={intl.get('smdm.paymentUsages.view.message.title.modal').d('新建付款用途')}
      visible={modalVisible}
      onOk={okHandle}
      destroyOnClose
      width={500}
      {...otherProps}
      onCancel={() => cancelHandle()}
    >
      <React.Fragment>
        <FormItem
          label={intl.get('smdm.paymentUsages.model.paymentUsages.usageCode').d('付款用途代码')}
          {...formLayout}
        >
          {form.getFieldDecorator('usageCode', {
            initialValue: usageCode,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl
                    .get('smdm.paymentUsages.model.paymentUsages.usageCode')
                    .d('付款用途代码'),
                }),
              },
              {
                max: 30,
                message: intl.get('hzero.common.validation.max', {
                  max: 30,
                }),
              },
            ],
          })(<Input inputChinese={false} disabled={!!usageCode} />)}
        </FormItem>
        <FormItem
          label={intl.get('smdm.paymentUsages.model.paymentUsages.usageName').d('付款用途描述')}
          {...formLayout}
        >
          {form.getFieldDecorator('usageName', {
            initialValue: usageName,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl
                    .get('smdm.paymentUsages.model.paymentUsages.usageName')
                    .d('付款用途描述'),
                }),
              },
              {
                max: 50,
                message: intl.get('hzero.common.validation.max', {
                  max: 50,
                }),
              },
            ],
          })(
            <TLEditor
              label={intl.get('smdm.paymentUsages.model.paymentUsages.usageName').d('付款用途描述')}
              field="usageName"
              token={editRowData._token}
            />
          )}
        </FormItem>
        <FormItem
          label={intl.get('smdm.paymentUsages.model.paymentUsages.remark').d('备注')}
          {...formLayout}
        >
          {form.getFieldDecorator('description', {
            initialValue: description,
          })(<Input />)}
        </FormItem>
        <FormItem label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
          {form.getFieldDecorator('enabledFlag', {
            initialValue: enabledFlag === undefined ? 1 : enabledFlag,
          })(<Switch />)}
        </FormItem>
      </React.Fragment>
    </Modal>
  );
});

/**
 * 付款用途定义
 * @extends {Component} - React.Component
 * @reactProps {Object} paymentUsages - 数据源
 * @reactProps {Object} fetchLoading - 数据加载是否完成
 * @reactProps {Object} addLoading - 数据添加加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: ['smdm.paymentUsages'],
})
@connect(({ paymentUsages, loading }) => ({
  paymentUsages,
  fetchLoading: loading.effects['paymentUsages/fetchUsages'],
  addLoading: loading.effects['paymentUsages/addUsages'],
}))
@Form.create({ fieldNameProp: null })
@withRouter
@cacheComponent({ cacheKey: '/smdm/payment-usages' })
export default class paymentUsagesList extends PureComponent {
  /**
   * 内部状态
   */
  state = {
    modalVisible: false,
    editRowData: {},
  };

  /**
   * 控制modal弹出框显示隐藏
   * @param {boolean} flag 显示隐藏标记
   * @param {Object} record 行数据
   */
  @Bind()
  showEditModal(flag, record) {
    this.setState({
      modalVisible: !!flag,
      editRowData: record || {},
    });
    if (!flag) {
      this.setState({
        editRowData: {},
      });
      this.refreshValue();
      this.setState({
        editRowData: {},
      });
    }
  }

  /**
   * 新增付款用途
   * @param {Object} fieldsValue 传递的filedvalue
   * @param {Object} form 表单
   */
  @Bind()
  handleAdd(fieldsValue, form) {
    const {
      dispatch,
      paymentUsages: { tenantId },
    } = this.props;
    const { editRowData } = this.state;
    dispatch({
      type: 'paymentUsages/addUsages',
      payload: [
        {
          ...editRowData,
          ...fieldsValue,
          usageCode: lodash.trim(fieldsValue.usageCode),
          tenantId,
        },
      ],
    }).then((response) => {
      if (response) {
        notification.success();
        form.resetFields();
        this.showEditModal(false);
      }
    });
  }

  /**
   * 刷新
   */
  @Bind()
  refreshValue() {
    const {
      paymentUsages: { data = {} },
    } = this.props;
    this.fetchUsages({
      page: data.pagination,
    });
    this.setState({
      editRowData: {},
    });
  }

  /**
   * 查询付款用途
   * @param {Object} pageData
   */
  @Bind()
  fetchUsages(pageData) {
    const { form, dispatch } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        dispatch({
          type: 'paymentUsages/fetchUsages',
          payload: {
            ...fieldsValue,
            ...pageData,
          },
        });
      }
    });
  }

  /**
   * 按条件查询
   */
  @Bind()
  queryValue() {
    this.fetchUsages();
  }

  /**
   * 组件挂载后执行方法
   */
  componentDidMount() {
    const { dispatch } = this.props;
    const tenantId = getCurrentOrganizationId();
    this.fetchUsages();
    dispatch({
      type: 'paymentUsages/setTenantId',
      payload: tenantId,
    });
  }

  /**
   * 分页change事件
   */
  @Bind()
  handleStandardTableChange(pagination) {
    this.fetchUsages({
      page: pagination,
    });
  }

  /**
   * 重置表单
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 渲染查询结构
   * @returns
   */
  renderForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form layout="inline">
        <FormItem
          label={intl.get('smdm.paymentUsages.model.paymentUsages.usageCode').d('付款用途代码')}
        >
          {getFieldDecorator('usageCode')(<Input inputChinese={false} />)}
        </FormItem>
        <FormItem
          label={intl.get('smdm.paymentUsages.model.paymentUsages.usageName').d('付款用途描述')}
        >
          {getFieldDecorator('usageName')(<Input />)}
        </FormItem>
        <FormItem>
          <Button onClick={this.handleFormReset}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
          <Button
            style={{ marginLeft: 8 }}
            type="primary"
            onClick={() => this.queryValue()}
            htmlType="submit"
          >
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </FormItem>
      </Form>
    );
  }

  /**
   * 渲染方法
   * @returns
   */
  render() {
    const {
      paymentUsages: { data = {} },
      fetchLoading,
      addLoading,
    } = this.props;
    const { modalVisible, editRowData } = this.state;
    const columns = [
      {
        title: intl.get('smdm.paymentUsages.model.paymentUsages.usageCode').d('付款用途代码'),
        dataIndex: 'usageCode',
        width: 150,
        // align: 'center',
      },
      {
        title: intl.get('smdm.paymentUsages.model.paymentUsages.usageName').d('付款用途描述'),
        dataIndex: 'usageName',
      },
      {
        title: intl.get('smdm.paymentUsages.model.paymentUsages.remark').d('备注'),
        dataIndex: 'description',
        // align: 'left',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 100,
        // align: 'center',
        render: (val) => ['0', 0, '1', 1].includes(val) ? enableRender(Number(val)) : val,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 80,
        // align: 'center',
        render: (_, record) => (
          <Fragment>
            <a onClick={() => this.showEditModal(true, record)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          </Fragment>
        ),
      },
    ];

    const parentMethods = {
      handleAdd: this.handleAdd,
      showEditModal: this.showEditModal,
    };

    return (
      <React.Fragment>
        <Header title={intl.get('smdm.paymentUsages.view.message.newtitle').d('付款用途定义')}>
          <Button icon="plus" type="primary" onClick={() => this.showEditModal(true)}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">{this.renderForm()}</div>
          <Table
            loading={fetchLoading}
            rowKey="usageId"
            dataSource={data.list}
            columns={columns}
            pagination={data.pagination}
            onChange={this.handleStandardTableChange}
            bordered
          />
          <CreateForm
            modalVisible={modalVisible}
            editRowData={editRowData}
            loading={addLoading}
            {...parentMethods}
          />
        </Content>
      </React.Fragment>
    );
  }
}
