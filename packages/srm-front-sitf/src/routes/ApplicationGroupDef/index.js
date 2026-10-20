/**
 * applicationGroupDef -应用组定义页面
 * @date: 2018-8-16
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Input, Table, Form, Button, Row, Col } from 'hzero-ui';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { isUndefined, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { enableRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';

import { Header, Content } from 'components/Page';
import CacheComponent from 'components/CacheComponent';
import ApplicationGroDefModal from './applicationGroDefModal';

const FormItem = Form.Item;
const formlayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@connect(({ applicationGroupDef, loading }) => ({
  applicationGroupDef,
  loading: loading.effects['applicationGroupDef/fetchApplicationGroup'],
}))
@withRouter
@formatterCollections({
  code: ['sitf.applicationGroupDef', 'sitf.common'],
})
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/sitf/application-group-def' })
export default class ApplicationGroupDef extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: getCurrentOrganizationId(),
      modalVisible: false,
      tableRecord: {},
    };
  }

  componentDidMount() {
    this.refreshData();
  }

  @Bind()
  refreshData() {
    const { dispatch } = this.props;
    const { tenantId } = this.state;
    dispatch({
      type: 'applicationGroupDef/fetchApplicationGroup',
      payload: {
        tenantId,
        page: {},
      },
    });
  }

  /**
   * 应用组定义列表
   * @param {object} params 查询参数
   */
  @Bind()
  fetchApplicationGroup(params = {}) {
    const {
      dispatch,
      form,
      applicationGroupDef: { pagination = {} },
    } = this.props;
    const { tenantId } = this.state;
    const fieldValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    dispatch({
      type: 'applicationGroupDef/fetchApplicationGroup',
      payload: {
        tenantId,
        page: isEmpty(params) ? pagination : params,
        ...fieldValues,
      },
    });
  }

  /**
   * 按条件查询
   */
  @Bind()
  fetchApplicationByCondition() {
    const { form } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        this.fetchApplicationGroup({
          ...values,
        });
      }
    });
  }

  /**
   * 表单重置
   */
  @Bind()
  queryReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 新建表格
   */
  @Bind()
  handleCreateApplication() {
    this.setState({
      modalVisible: true,
      tableRecord: {},
    });
  }

  @Bind()
  onCancel() {
    this.setState({
      modalVisible: false,
      tableRecord: {},
    });
  }

  /**
   * 编辑
   * @param {object} record 当前行数据
   */
  @Bind()
  handlerEditApplication(record) {
    this.setState({
      tableRecord: record,
      modalVisible: true,
    });
  }

  /**
   * 保存数据
   * @param {object} values 需要保存的值
   */
  @Bind()
  onSaveDate(values = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'applicationGroupDef/updateApplicationGroups',
      payload: {
        body: [values],
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.setState({
          modalVisible: false,
          tableRecord: {},
        });
        this.fetchApplicationGroup();
      }
    });
  }

  /**
   * 渲染表单
   */
  renderSearchForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          <Col span={6}>
            <FormItem
              label={intl
                .get(`sitf.applicationGroupDef.model.applicationGroupDef.applicationGroupCode`)
                .d('应用组代码')}
              {...formlayout}
            >
              {getFieldDecorator('applicationGroupCode')(
                <Input typeCase="upper" trim inputChinese={false} />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              label={intl.get(`sitf.common.applicationGroup.name`).d('应用组名称')}
              {...formlayout}
            >
              {getFieldDecorator('applicationGroupName')(<Input />)}
            </FormItem>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.queryReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.fetchApplicationByCondition}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const {
      applicationGroupDef: { list = {}, pagination = {}, code },
      loading,
    } = this.props;
    const { tenantId, tableRecord, modalVisible } = this.state;
    const columns = [
      {
        title: intl
          .get(`sitf.applicationGroupDef.model.applicationGroupDef.applicationGroupCode`)
          .d('应用组代码'),
        dataIndex: 'applicationGroupCode',
        width: 200,
      },
      {
        title: intl.get(`sitf.common.applicationGroup.name`).d('应用组名称'),
        dataIndex: 'applicationGroupName',
        width: 200,
      },
      {
        title: intl.get(`sitf.common.product.name`).d('产品线名称'),
        dataIndex: 'productLineName',
        width: 150,
      },
      {
        title: intl.get(`hzero.common.status.enable`).d('启用'),
        align: 'left',
        dataIndex: 'enabledFlag',
        width: 80,
        render: enableRender,
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'remark',
      },
      {
        title: intl.get(`hzero.common.button.action`).d('操作'),
        align: 'left',
        dataIndex: 'edit',
        width: 100,
        render: (val, record) => {
          return (
            <a
              onClick={() => {
                this.handlerEditApplication(record);
              }}
            >
              {intl.get(`hzero.common.button.edit`).d('编辑')}
            </a>
          );
        },
      },
    ];
    const detailProps = {
      code,
      modalVisible,
      loading,
      tenantId,
      tableRecord,
      anchor: 'right',
      onSaveDate: this.onSaveDate,
      onCancel: this.onCancel,
    };
    return (
      <React.Fragment>
        <Header
          title={intl
            .get(`sitf.applicationGroupDef.view.applicationGroupDef.headerTitle`)
            .d('应用组定义')}
        >
          <Button type="primary" icon="plus" onClick={this.handleCreateApplication}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">{this.renderSearchForm()}</div>
          <Table
            pagination={pagination}
            dataSource={list.content}
            rowKey="applicationGroupId"
            columns={columns}
            loading={loading}
            bordered
            onChange={page => this.fetchApplicationGroup(page)}
          />
        </Content>
        <ApplicationGroDefModal {...detailProps} />
      </React.Fragment>
    );
  }
}
