/**
 * codeRuleRule - 编码规则
 * @date: 2018-6-29
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Button, Col, Form, Input, Modal, Row, Table } from 'hzero-ui';
import { isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import queryString from 'query-string';

import { Button as ButtonPermission } from 'components/Permission';
import cacheComponent from 'components/CacheComponent';
import { Content, Header } from 'components/Page';
import Lov from 'components/Lov';
import TLEditor from 'components/TLEditor';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getCurrentTenant } from 'utils/utils';
import { operatorRender } from 'utils/renderer';
import { CODE_UPPER } from 'utils/regExp';
import {
  FORM_COL_4_LAYOUT,
  SEARCH_COL_CLASSNAME,
  SEARCH_FORM_CLASSNAME,
  SEARCH_FORM_ITEM_LAYOUT,
  SEARCH_FORM_ROW_LAYOUT,
} from 'utils/constants';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

/**
 * 编码规则弹框编辑
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @reactProps {Object} modalVisible - 控制modal显示/隐藏属性
 * @reactProps {Function} handleAddCodeRule - 数据保存
 * @reactProps {Function} showCreateModal - 控制modal显示隐藏方法
 * @reactProps {Object} organizationId - 组织编号
 * @return React.element
 */
const CreateForm = Form.create({ fieldNameProp: null })((props) => {
  const {
    form,
    modalVisible,
    onHandleAdd,
    onShowCreateModal,
    organizationId,
    userTenant = {},
    loading,
  } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      onHandleAdd(fieldsValue, form);
    });
  };
  const onCancel = () => {
    onShowCreateModal(false);
    form.resetFields();
  };
  const formlayout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 15 },
  };
  return (
    <Modal
      title={intl.get('hpfm.codeRule.view.message.title.modal.list').d('新建编码规则')}
      visible={modalVisible}
      onOk={okHandle}
      width={600}
      destroyOnClose
      confirmLoading={loading}
      onCancel={onCancel}
    >
      <>
        <FormItem
          {...formlayout}
          label={intl.get('hpfm.codeRule.model.codeRule.ruleCode').d('规则代码')}
        >
          {form.getFieldDecorator('ruleCode', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hpfm.codeRule.model.codeRule.ruleCode').d('规则代码'),
                }),
              },
              {
                max: 30,
                message: intl.get('hzero.common.validation.max', {
                  max: 30,
                }),
              },
              {
                pattern: CODE_UPPER,
                message: intl
                  .get('hzero.common.validation.codeUpper')
                  .d('全大写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),
              },
            ],
          })(<Input trim typeCase="upper" inputChinese={false} />)}
        </FormItem>
        <FormItem
          {...formlayout}
          label={intl.get('hpfm.codeRule.model.codeRule.ruleName').d('规则名称')}
        >
          {form.getFieldDecorator('ruleName', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hpfm.codeRule.model.codeRule.ruleName').d('规则名称'),
                }),
              },
              {
                max: 20,
                message: intl.get('hzero.common.validation.max', {
                  max: 20,
                }),
              },
            ],
          })(
            <TLEditor
              label={intl.get('hpfm.codeRule.model.codeRule.ruleName').d('规则名称')}
              field="ruleName"
            />
          )}
        </FormItem>
        <FormItem
          {...formlayout}
          label={intl.get('hpfm.codeRule.model.codeRule.tenantName').d('租户')}
        >
          {form.getFieldDecorator('tenantId', {
            initialValue: organizationId,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hpfm.codeRule.model.codeRule.tenantName').d('租户'),
                }),
              },
            ],
          })(<Lov code="HPFM.TENANT" textValue={userTenant.tenantName} />)}
        </FormItem>
      </>
    </Modal>
  );
});

/**
 * 编码规则
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} codeRule - 数据源
 * @reactProps {Object} fetchCodeLoading - 数据加载是否完成
 * @reactProps {Object} removeCodeLoading - 数据删除加载是否完成
 * @reactProps {Object} addCodeRuleLoading - 数据添加加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ codeRule, loading }) => ({
  codeRule,
  currentTenantId: getCurrentOrganizationId(),
  removeCodeLoading: loading.effects['codeRule/removeCode'],
  fetchCodeLoading: loading.effects['codeRule/fetchCode'],
  addCodeRuleLoading: loading.effects['codeRule/addCodeRule'],
  userTenant: getCurrentTenant(),
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: ['hpfm.codeRule'],
})
@cacheComponent({ cacheKey: '/hpfm/code-rule/list' })
export default class CodeRule extends React.Component {
  /**
   *Creates an instance of codeRule.
   * @param {object} props 属性
   */
  constructor(props) {
    super(props);
    /**
     * 内部状态
     */
    this.state = {
      selectedRows: [],
      formValues: {},
      modalVisible: false,
    };
  }

  /**
   * 新增编码规则
   * @param {object} fieldsValue 传递的filedvalue
   * @param {object} form        表单数据
   */
  @Bind()
  handleAddCodeRule(fieldsValue, form) {
    const {
      dispatch,
      codeRule: { organizationId },
    } = this.props;
    const callback = (res) => {
      this.setState({
        modalVisible: false,
      });
      notification.success();
      form.resetFields();
      this.showCodeRuleDist(res);
    };
    dispatch({
      type: 'codeRule/addCodeRule',
      payload: {
        ...fieldsValue,
        organizationId,
      },
    }).then((response) => {
      if (response) {
        callback(response);
      }
    });
  }

  /**
   * 刷新
   */
  @Bind()
  refreshValue() {
    this.fetchData();
    this.setState({
      selectedRows: [],
    });
  }

  /**
   * 编码规则删除
   */
  @Bind()
  deleteValue() {
    const {
      dispatch,
      codeRule: { organizationId },
      removeCodeLoading,
    } = this.props;
    const { selectedRows } = this.state;
    const onOk = () => {
      dispatch({
        type: 'codeRule/removeCode',
        payload: {
          selectedRows,
          organizationId,
        },
      }).then((response) => {
        if (response) {
          this.refreshValue();
          notification.success();
        }
      });
    };
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk,
      removeCodeLoading,
    });
  }

  /**
   * 控制modal弹出层显隐
   * @param {boolean} flag 显/隐标记
   */
  @Bind()
  showCreateModal(flag) {
    this.setState({
      modalVisible: !!flag,
    });
  }

  /**
   * 查询数据
   * @param {object} pageData 页面基本信息数据
   */
  @Bind()
  fetchData(pageData = {}) {
    const { form, dispatch } = this.props;
    const organizationId = getCurrentOrganizationId();
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        this.setState({
          formValues: fieldsValue,
        });
        dispatch({
          type: 'codeRule/fetchCode',
          payload: {
            ...fieldsValue,
            organizationId,
            ...pageData,
          },
        });
      }
    });
  }

  /**
   * 查询按钮点击
   * @returns
   */
  @Bind()
  queryValue() {
    this.fetchData();
  }

  /**
   * 页面跳转到编码规则维护页面
   * @param {object} record 行数据
   */
  @Bind()
  showCodeRuleDist(record = {}) {
    const {
      history,
      dispatch,
      match: { path },
      location: { search },
    } = this.props;
    const { access_token: accessToken } = queryString.parse(search.substring(1));
    dispatch({
      type: 'codeRule/updateState',
      payload: {
        dist: {
          head: {},
          line: [],
        },
      },
    });
    history.push({
      pathname:
        path.indexOf('/private') === 0
          ? `/private/hpfm/code-rule/dist/${record.ruleId}`
          : `/hpfm/code-rule/dist/${record.ruleId}`,
      search: path.indexOf('/private') === 0 ? `?access_token=${accessToken}` : '',
    });
  }

  /**
   * 组件挂载后执行方法
   */
  componentDidMount() {
    const {
      dispatch,
      codeRule: { list = {} },
      location: { state: { _back } = {} },
    } = this.props;
    const organizationId = getCurrentOrganizationId();
    dispatch({
      type: 'codeRule/settingOrgId',
      payload: {
        organizationId,
      },
    });
    const page = isUndefined(_back) ? {} : list.data && list.data.pagination;
    this.fetchData({ page });
  }

  /**
   * 分页变化后触发方法
   * @param {object} pagination 分页信息
   */
  @Bind()
  handleStandardTableChange(pagination = {}) {
    const {
      codeRule: { organizationId },
    } = this.props;
    const { formValues } = this.state;
    const params = {
      organizationId,
      ...formValues,
      page: pagination,
    };
    this.fetchData(params);
  }

  /**
   * 重置form表单
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
  }

  /**
   *选择数据触发方法
   * @param {null} _ 占位符
   * @param {object} rows 行记录
   */
  @Bind()
  handleSelectRows(_, rows) {
    this.setState({
      selectedRows: rows,
    });
  }

  /**
   * 渲染查询结构
   * @returns
   */
  renderForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form className={SEARCH_FORM_CLASSNAME}>
        <Row type="flex" gutter={24} align="bottom" {...SEARCH_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_4_LAYOUT}>
            <FormItem
              {...SEARCH_FORM_ITEM_LAYOUT}
              label={intl.get('hpfm.codeRule.model.codeRule.ruleCode').d('规则代码')}
            >
              {getFieldDecorator('ruleCode')(<Input trim typeCase="upper" inputChinese={false} />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_4_LAYOUT}>
            <FormItem
              {...SEARCH_FORM_ITEM_LAYOUT}
              label={intl.get('hpfm.codeRule.model.codeRule.ruleName').d('规则名称')}
            >
              {getFieldDecorator('ruleName')(<Input />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_4_LAYOUT} className={SEARCH_COL_CLASSNAME}>
            <FormItem>
              <Button onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.queryValue}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 渲染方法
   * @returns
   */
  render() {
    const {
      codeRule: {
        organizationId,
        list: { data = {} },
      },
      match: { path },
      removeCodeLoading,
      fetchCodeLoading,
      addCodeRuleLoading,
      userTenant,
    } = this.props;
    const { selectedRows, modalVisible } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedRows.map((n) => n.ruleId),
      onChange: this.handleSelectRows,
    };
    const columns = [
      {
        title: intl.get('hpfm.codeRule.model.codeRule.ruleCode').d('规则代码'),
        dataIndex: 'ruleCode',
        width: 200,
      },
      {
        title: intl.get('hpfm.codeRule.model.codeRule.ruleName').d('规则名称'),
        dataIndex: 'ruleName',
      },
      {
        title: intl.get('hpfm.codeRule.model.codeRule.tenantName').d('租户'),
        dataIndex: 'tenantName',
        width: 200,
      },
      {
        title: intl.get('hpfm.codeRule.model.codeRule.description').d('规则描述'),
        dataIndex: 'description',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 150,
        render: (_, record) => {
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
                      meaning: '编码规则-编辑',
                    },
                  ]}
                  onClick={() => {
                    this.showCodeRuleDist(record);
                  }}
                >
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </ButtonPermission>
              ),
              len: 2,
              title: intl.get('hzero.common.button.edit').d('编辑'),
            },
          ];
          return operatorRender(operators, record);
        },
      },
    ].filter((col) =>
      !organizationId ? true : col.dataIndex !== 'meaning' && col.dataIndex !== 'tenantName'
    );
    const parentMethods = {
      onHandleAdd: this.handleAddCodeRule,
      onShowCreateModal: this.showCreateModal,
    };

    return (
      <>
        <Header title={intl.get('hpfm.codeRule.view.message.title.list').d('编码规则')}>
          <ButtonPermission
            icon="plus"
            type="primary"
            permissionList={[
              {
                code: `${path}.button.create`,
                type: 'button',
                meaning: '编码规则-新建',
              },
            ]}
            onClick={() => this.showCreateModal(true)}
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </ButtonPermission>
          <ButtonPermission
            icon="delete"
            loading={removeCodeLoading}
            permissionList={[
              {
                code: `${path}.button.delete`,
                type: 'button',
                meaning: '编码规则-删除',
              },
            ]}
            onClick={this.deleteValue}
            disabled={selectedRows.length <= 0}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </ButtonPermission>
        </Header>
        <Content>
          {this.renderForm()}
          <Table
            loading={fetchCodeLoading}
            rowKey="ruleId"
            rowSelection={rowSelection}
            dataSource={data.content}
            columns={columns}
            pagination={data.pagination || {}}
            onChange={this.handleStandardTableChange}
            bordered
          />
          <CreateForm
            {...parentMethods}
            modalVisible={modalVisible}
            loading={addCodeRuleLoading}
            organizationId={organizationId}
            userTenant={userTenant}
          />
        </Content>
      </>
    );
  }
}
