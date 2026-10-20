/**
 * ScoreSupplier - 分配试用供应商
 * @date: 2018-08-08
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { Form, Input, Button, Row, Col, Table, Icon, Divider } from 'hzero-ui';
import { connect } from 'dva';
import lodash from 'lodash';
import { Bind } from 'lodash-decorators';
import qs from 'querystring';
import OptionInput from 'components/OptionInput';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import { createPagination } from 'utils/utils';
import './index.less';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

/**
 * 分配试用供应商
 * @extends {Component} - React.Component
 * @reactProps {Object} scoreSupplier - 数据源
 * @reactProps {Object} [history={}]
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: ['sslm.scoreSupplier', 'sslm.common'],
})
@connect(({ scoreSupplier, loading }) => ({
  scoreSupplier,
  fetchSupplier: loading.effects['scoreSupplier/fetchSupplier'],
  addLoading: loading.effects['scoreSupplier/addScoreSupplier'],
  removeLoading: loading.effects['scoreSupplier/removeScoreSupplier'],
  fetchCheckedSupplier: loading.effects['scoreSupplier/fetchCheckedSupplier'],
}))
@Form.create({ fieldNameProp: null })
@withRouter
export default class ScoreSupplier extends PureComponent {
  /**
   * @param {object} props
   */
  constructor(props) {
    super(props);
    const parame = qs.parse(props.location.search.substr(1));
    this.partnerCompanyIds = [];
    this.state = {
      leftSelectRows: [],
      rightSelectRows: [],
      leftSelectedRowKeys: [],
      templateId: parame.templateId,
    };
  }

  /**
   * 组件挂载后执行方法
   */
  componentDidMount() {
    const { dispatch } = this.props;
    const { templateId } = this.state;
    dispatch({
      type: 'scoreSupplier/fetchTmplInfo',
      payload: {
        templateId,
      },
    });
    dispatch({
      type: 'scoreSupplier/fetchCheckedSupplier',
      payload: {
        templateId,
      },
    }).then(response => {
      if (response) {
        this.partnerCompanyIds = response.map(n => n.supplierCompanyId).join();
        dispatch({
          type: 'scoreSupplier/fetchSupplier',
          payload: {
            enabledFlag: 1,
            partnerCompanyIds: this.partnerCompanyIds,
          },
        });
        dispatch({
          type: 'scoreSupplier/updateCheckedSupplier',
          payload: response,
        });
      }
    });
  }

  /**
   * 左侧框选择数据添加到右侧触发方法
   */
  @Bind()
  onLToRBtnClick() {
    const { dispatch } = this.props;
    const { leftSelectRows, templateId } = this.state;
    dispatch({
      type: 'scoreSupplier/addScoreSupplier',
      payload: {
        leftSelectRows,
        templateId,
      },
    }).then(response => {
      if (response) {
        notification.success();
        this.refreshData();
      }
    });
  }

  /**
   * 右侧框选择数据添加到左侧触发方法
   */
  @Bind()
  onRToLBtnClick() {
    const { dispatch } = this.props;
    const { rightSelectRows, templateId } = this.state;
    dispatch({
      type: 'scoreSupplier/removeScoreSupplier',
      payload: {
        rightSelectRows,
        templateId,
      },
    }).then(response => {
      if (response) {
        notification.success();
        this.refreshData();
      }
    });
  }

  /**
   * 查询分配供应商
   * @param {object} value
   */
  @Bind()
  fetchSupplier(value) {
    const { form, dispatch } = this.props;
    const { templateId } = this.state;
    let action = '';
    let data = {};
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        if (value === 'left') {
          action = 'fetchSupplier';
          data = {
            partnerCompanyIds: this.partnerCompanyIds,
          };
          dispatch({
            type: `scoreSupplier/${action}`,
            payload: {
              ...data,
              enabledFlag: 1,
              ...fieldsValue[`${value}#supplierInfo`],
            },
          });
        } else {
          action = 'fetchCheckedSupplier';
          data = {
            templateId,
          };
          dispatch({
            type: `scoreSupplier/${action}`,
            payload: {
              ...data,
              ...fieldsValue[`${value}#supplierInfo`],
            },
          }).then(response => {
            if (response) {
              dispatch({
                type: 'scoreSupplier/updateCheckedSupplier',
                payload: response,
              });
            }
          });
        }
      }
    });
  }

  /**
   * 左侧数据选择事件
   * @param {string} keys 已经选中的键值
   * @param {object} rows 已经选中的行数据
   */
  @Bind()
  handleLeftSelectRows(keys, rows) {
    const { leftSelectRows, leftSelectedRowKeys } = this.state;
    // 找到变动的key值
    const differenceKeys = lodash.xor(leftSelectedRowKeys, keys);
    // 找到新增勾选的行数据
    const addrows = rows.filter(
      row => differenceKeys.filter(key => key === row.supplierCompanyId).length > 0
    );
    // 找到取消勾选的行数据
    const deletedRows = leftSelectRows.filter(
      row => differenceKeys.filter(key => key === row.supplierCompanyId).length > 0
    );
    this.setState({
      leftSelectedRowKeys: keys,
      leftSelectRows: lodash.unionWith(lodash.xor(leftSelectRows, deletedRows), addrows),
    });
  }

  /**
   * 右侧数据选择事件
   * @param {null} _ 占位
   * @param {string} rows 已经选中数据
   */
  @Bind()
  handleRightSelectRows(_, rows) {
    this.setState({
      rightSelectRows: rows,
    });
  }

  /**
   * 全部刷新
   */
  @Bind()
  refreshData() {
    const { dispatch } = this.props;
    const { templateId } = this.state;
    this.setState({
      leftSelectRows: [],
      rightSelectRows: [],
      leftSelectedRowKeys: [],
    });
    dispatch({
      type: 'scoreSupplier/fetchCheckedSupplier',
      payload: {
        templateId,
      },
    }).then(response => {
      if (response) {
        this.partnerCompanyIds = response.map(n => n.supplierCompanyId).join();
        dispatch({
          type: 'scoreSupplier/fetchSupplier',
          payload: {
            enabledFlag: 1,
            partnerCompanyIds: this.partnerCompanyIds,
          },
        });
        dispatch({
          type: 'scoreSupplier/updateCheckedSupplier',
          payload: response,
        });
      }
    });
  }

  /**
   * 分页change事件
   * @param {object} pagination 分页信息
   * @memberof ScoreTmpl
   */
  @Bind()
  handleTableChange(pagination = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'scoreSupplier/fetchSupplier',
      payload: {
        page: pagination,
      },
    });
  }

  /**
   *查询结构渲染
   *
   * @param {object} value 查询
   * @returns
   */
  @Bind()
  renderSearchForm(value) {
    const { getFieldDecorator } = this.props.form;
    const fromArray = [
      {
        queryLabel: intl.get('sslm.common.view.supplier.code').d('供应商编码'),
        queryName: 'supplierCompanyNum',
      },
      {
        queryLabel: intl.get('sslm.common.view.supplier.description').d('供应商描述'),
        queryName: 'supplierCompanyName',
      },
    ];
    return (
      <Form>
        <Row type="flex" justify="end" align="bottom" gutter={24}>
          <Col span={20}>
            <Form.Item>
              {getFieldDecorator(`${value}#supplierInfo`)(<OptionInput queryArray={fromArray} />)}
            </Form.Item>
          </Col>
          <Col span={4}>
            <FormItem>
              <Button onClick={() => this.fetchSupplier(value)} type="primary" htmlType="submit">
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 渲染模板信息显示
   * @returns
   */
  @Bind()
  renderForm() {
    const { getFieldDecorator } = this.props.form;
    const {
      scoreSupplier: { tmplInfo = {} },
    } = this.props;
    return (
      <Form layout="inline">
        <FormItem
          label={intl.get('sslm.scoreSupplier.model.scoreSupplier.templateCode').d('评分模板代码')}
        >
          {getFieldDecorator('templateCode', {
            initialValue: tmplInfo.templateCode,
          })(<Input disabled />)}
        </FormItem>
        <FormItem
          label={intl.get('sslm.scoreSupplier.model.scoreSupplier.templateName').d('评分模板描述')}
        >
          {getFieldDecorator('templateName', {
            initialValue: tmplInfo.templateName,
          })(<Input disabled />)}
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
      match,
      scoreSupplier: { leftData = {}, rightData = [] },
      fetchSupplier,
      addLoading,
      removeLoading,
      fetchCheckedSupplier,
    } = this.props;
    const { leftSelectRows, rightSelectRows } = this.state;
    const basePath = match.path.substring(0, match.path.indexOf('/score-supplier'));
    const columns = [
      {
        title: intl.get('sslm.common.view.supplier.code').d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 150,
      },
      {
        title: intl.get('sslm.common.view.supplier.name').d('供应商名称'),
        dataIndex: 'supplierCompanyName',
      },
    ];
    const leftRowSelection = {
      selectedRowKeys: leftSelectRows.map(n => n.supplierCompanyId),
      onChange: this.handleLeftSelectRows,
    };
    const rightRowSelection = {
      selectedRowKeys: rightSelectRows.map(n => n.supplierCompanyId),
      onChange: this.handleRightSelectRows,
    };
    const otherProps = {
      columns,
      rowKey: 'supplierCompanyId',
      bordered: true,
    };
    const pagination = {
      ...createPagination(leftData),
      onShowSizeChange: (_, size) => {
        this.PageSize = size;
      },
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get('sslm.scoreSupplier.view.message.title').d('分配供应商')}
          backPath={`${basePath}/list`}
        />
        <Content>
          <div className="table-list-search">{this.renderForm()}</div>
          <Divider />
          <Row gutter={24}>
            <Col span={11}>
              <div className="table-list-search">{this.renderSearchForm('left')}</div>
              <Table
                loading={fetchSupplier}
                dataSource={leftData.list}
                rowSelection={leftRowSelection}
                pagination={pagination}
                onChange={this.handleTableChange}
                {...otherProps}
              />
            </Col>
            <Col span={2}>
              <div className="transfer-btn">
                <Row style={{ textAlign: 'center' }}>
                  <Button
                    type="primary"
                    style={{ margin: '10px 0' }}
                    disabled={leftSelectRows.length <= 0}
                    onClick={this.onLToRBtnClick}
                    loading={addLoading}
                  >
                    <Icon type="right" />
                  </Button>
                </Row>
                <Row style={{ textAlign: 'center' }}>
                  <Button
                    type="primary"
                    disabled={rightSelectRows.length <= 0}
                    onClick={this.onRToLBtnClick}
                    loading={removeLoading}
                  >
                    <Icon type="left" />
                  </Button>
                </Row>
              </div>
            </Col>
            <Col span={11}>
              <div className="table-list-search">{this.renderSearchForm('right')}</div>
              <Table
                loading={fetchCheckedSupplier}
                dataSource={rightData}
                rowSelection={rightRowSelection}
                pagination={false}
                {...otherProps}
              />
            </Col>
          </Row>
        </Content>
      </React.Fragment>
    );
  }
}
