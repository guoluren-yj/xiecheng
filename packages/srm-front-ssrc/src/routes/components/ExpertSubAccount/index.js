/**
 * 专家子账户多选弹窗_专家子账户来源
 * @date: 2020-06-30
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Modal, Row, Col, Form, Button, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { sum, isNumber, isUndefined } from 'lodash';

import intl from 'utils/intl';
import Table from '_components/Table';
import {
  createPagination,
  getCurrentOrganizationId,
  filterNullValueObject,
  getCurrentTenant,
} from 'utils/utils';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
  style: { width: '100%' },
};

/**
 * 纯组件 - 展示型组件
 * @extends {PureComponent} React.PureComponent
 * @reactProps {Object} [dispatch= ()=>{}] - redux dispatch
 * @reactProps {Object} [commonModel={}] - dva store ps: 记得在路由配置中, 添加commonModel
 * @reactProps {Object} [loading] - dva http请求是否完成标识
 * @reactProps {Object} [loading.effects={}] - 基于对应请求是否完成控制loading
 * @reactProps {boolean} [queryExpertSubAccountLoading=false] - 查询专家子账户请求标识
 * @reactProps {boolean} [visible=false] - 控制弹窗显隐
 * @reactProps {Function} [onOk= ()=>{}] - 确认按钮回调函数
 * @reactProps {Function} [onCancel=()=>{}] - 取消按钮回调函数
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@connect(({ commonModel, loading }) => ({
  commonModel,
  queryExpertSubAccountLoading: loading.effects['commonModel/fetchQueryExpertSubAccount'],
  organizationId: getCurrentOrganizationId(),
}))
export default class ExpertSubAccountModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectRows: [], // 勾选行
      selectRowKeys: [], // 勾选行keys
      dataSource: [], // 数据源
      pagination: {}, // 分页对象
    };
  }

  /**
   * 组件挂载页面后
   */
  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 查询数据
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch, form, organizationId } = this.props;
    const filterValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    dispatch({
      type: 'commonModel/fetchQueryExpertSubAccount',
      payload: {
        page,
        organizationId,
        fuzzyQueryFlag: '', // 待定 - 参数意义不明确
        ...filterValues,
        tenantId: getCurrentTenant() && getCurrentTenant().tenantId,
        lovCode: 'SSRC.EXPERT_SUB_ACCOUNT',
      },
    }).then(res => {
      if (res) {
        this.setState({
          dataSource: res.content || [],
          pagination: createPagination(res),
        });
      }
    });
  }

  /**
   * 勾选行切换
   */
  @Bind()
  handleRowSelectChange(selectRowKeys, selectRows) {
    this.setState({
      selectRowKeys,
      selectRows,
    });
  }

  // 点击弹窗确定按钮, 把勾选数据返回到组件调用方
  @Bind()
  handleOk() {
    const { onOk = () => {} } = this.props;
    const { selectRows = [], selectRowKeys = [] } = this.state;
    onOk(selectRowKeys, selectRows);
  }

  /**
   * @description:表单重置
   *
   */
  @Bind()
  handleFormReset() {
    const { form = {} } = this.props;
    form.resetFields();
  }

  /**
   * 渲染查询框
   */
  @Bind()
  handleRenderFilterForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <div className="table-list-search">
        <Form layout="inline" className="more-fields-form">
          <Row gutter={24}>
            <Col span={16}>
              <Row>
                <Col span={12}>
                  <FormItem
                    {...formItemLayout}
                    label={intl.get(`ssrc.common.model.common.account`).d('账户')}
                  >
                    {getFieldDecorator('loginName')(<Input />)}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem
                    {...formItemLayout}
                    label={intl.get(`ssrc.common.model.common.name`).d('名称')}
                  >
                    {getFieldDecorator('realName')(<Input />)}
                  </FormItem>
                </Col>
              </Row>
            </Col>
            <Col span={8}>
              <FormItem>
                <Button onClick={this.handleFormReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  style={{ marginLeft: 8 }}
                  type="primary"
                  htmlType="submit"
                  onClick={this.handleSearch}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }

  render() {
    const {
      visible = false,
      queryExpertSubAccountLoading = false,
      onCancel = () => {},
    } = this.props;

    const { selectRowKeys = [], selectRows = [], dataSource = [], pagination = {} } = this.state;

    const columns = [
      {
        title: intl.get(`ssrc.common.model.common.account`).d('账户'),
        dataIndex: 'loginName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.common.model.common.name`).d('名称'),
        dataIndex: 'realName',
        width: 100,
      },
    ];

    const rowSelection = {
      selectRowKeys,
      selectRows,
      onChange: this.handleRowSelectChange,
    };
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 0)));

    const tableProps = {
      rowKey: 'id',
      columns,
      dataSource,
      pagination,
      rowSelection,
      bordered: true,
      scroll: { x: scrollX },
      loading: queryExpertSubAccountLoading,
      onChange: page => this.handleSearch(page),
    };

    return (
      <Modal
        title={intl.get(`ssrc.common.view.message.title.chooseAccount`).d('选择账户')}
        visible={visible}
        width={600}
        onOk={this.handleOk}
        onCancel={onCancel}
      >
        {this.handleRenderFilterForm()}
        <Table {...tableProps} />
      </Modal>
    );
  }
}
