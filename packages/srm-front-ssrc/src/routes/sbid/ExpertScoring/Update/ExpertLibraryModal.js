/**
 * 专家子账户单选弹窗_专家库来源
 * @date: 2021-02-26
 * @author: lzj<zhijian.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Modal, Row, Col, Form, Button, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { sum, isNumber, isUndefined } from 'lodash';

import intl from 'utils/intl';
import Table from '_components/Table';
import { createPagination, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import withCustomize from 'srm-front-cuz/lib/h0Customize';

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
 * @reactProps {boolean} [queryExpertLibraryLoading=false] - 查询专家子账户请求标识
 * @reactProps {boolean} [visible=false] - 控制弹窗显隐
 * @reactProps {Function} [onOk= ()=>{}] - 确认按钮回调函数
 * @reactProps {Function} [onCancel=()=>{}] - 取消按钮回调函数
 * @return React.element
 */
@withCustomize({
  unitCode: ['SSRC.EXPERT_SCORE_SCORING.EXPERT_LIBRARY'],
})
@Form.create({ fieldNameProp: null })
@connect(({ commonModel, loading }) => ({
  commonModel,
  queryExpertLibraryLoading: loading.effects['commonModel/fetchQueryExpertLibrary'],
  organizationId: getCurrentOrganizationId(),
}))
export default class ExpertLibraryModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectRows: {}, // 勾选行
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
      type: 'commonModel/fetchQueryExpertLibrary',
      payload: {
        page,
        organizationId,
        fuzzyQueryFlag: '', // 待定 - 参数意义不明确
        ...filterValues,
        enabledFlag: 1,
        customizeUnitCode: 'SSRC.EXPERT_SCORE_SCORING.EXPERT_LIBRARY',
      },
    }).then((res) => {
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
  handleRowSelectChange(selectRows) {
    this.setState({
      selectRows,
    });
  }

  // 点击弹窗确定按钮, 把勾选数据返回到组件调用方
  @Bind()
  handleOk() {
    const { onOk = () => {} } = this.props;
    const { selectRows = {} } = this.state;

    const OtherParams = {
      customizeUnitCode: 'SSRC.EXPERT_SCORE_SCORING.EXPERT_LIBRARY',
    };
    onOk(selectRows, OtherParams);
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
                    label={intl.get(`ssrc.common.model.common.expertName`).d('专家姓名')}
                  >
                    {getFieldDecorator('expertName')(<Input />)}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem
                    {...formItemLayout}
                    label={intl.get(`ssrc.common.model.common.mobilePhone`).d('移动电话')}
                  >
                    {getFieldDecorator('mobilephone')(<Input inputChinese={false} />)}
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
      queryExpertLibraryLoading = false,
      onCancel = () => {},
      customizeTable = () => {},
    } = this.props;

    const { selectRows = {}, dataSource = [], pagination = {} } = this.state;

    const columns = [
      {
        title: intl.get(`ssrc.common.model.common.expertName`).d('专家姓名'),
        dataIndex: 'expertName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.common.model.common.expertLevel`).d('专家级别'),
        dataIndex: 'expertLevelMeaning',
        width: 100,
      },
      {
        title: intl.get(`ssrc.common.model.common.expertType`).d('专家类型'),
        dataIndex: 'expertTypeMeaning',
        width: 100,
      },
      {
        title: intl.get(`ssrc.common.model.common.expertCategory`).d('专家类别'),
        dataIndex: 'expertCategoryMeaning',
        width: 100,
      },
      {
        title: intl.get(`ssrc.common.model.common.mobilePhone`).d('移动电话'),
        dataIndex: 'mobilephone',
        width: 100,
      },
    ];

    const rowSelection = {
      selectRows,
      onSelect: this.handleRowSelectChange,
      type: 'radio',
    };
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));

    const tableProps = {
      rowKey: 'expertId',
      columns,
      dataSource,
      pagination,
      rowSelection,
      bordered: true,
      scroll: { x: scrollX },
      loading: queryExpertLibraryLoading,
      onChange: (page) => this.handleSearch(page),
    };

    return (
      <Modal
        title={intl.get(`ssrc.common.view.message.title.chooseExpert`).d('选择专家')}
        visible={visible}
        width={700}
        onOk={this.handleOk}
        onCancel={onCancel}
      >
        {this.handleRenderFilterForm()}
        {customizeTable(
          { code: 'SSRC.EXPERT_SCORE_SCORING.EXPERT_LIBRARY' },
          <Table {...tableProps} />
        )}
      </Modal>
    );
  }
}
