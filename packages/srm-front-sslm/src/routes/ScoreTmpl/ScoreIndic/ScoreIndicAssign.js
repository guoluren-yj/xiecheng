/**
 * ScoreIndicAssign - 细项权限
 * @date: 2018-7-4
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { Form, Button, Row, Col, Table, Icon } from 'hzero-ui';
import lodash from 'lodash';
import { Bind } from 'lodash-decorators';
import qs from 'querystring';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import OptionInput from 'components/OptionInput';
import notification from 'utils/notification';
import { createPagination } from 'utils/utils';
import '../index.less';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

/**
 * 评分模板定义 - 模板指标定义 - 细项权限
 * @extends {Component} - React.Component
 * @reactProps {Object} scoreIndicAssign - 数据源
 * @reactProps {Object} [history={}]
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: ['sslm.scoreIndicAssign'],
})
@connect(({ scoreIndicAssign, loading }) => ({
  scoreIndicAssign,
  fetchIndicAssign: loading.effects['scoreIndicAssign/fetchIndicAssign'],
  fetchCheckedIndicAssign: loading.effects['scoreIndicAssign/fetchCheckedIndicAssign'],
}))
@Form.create({ fieldNameProp: null })
@withRouter
export default class ScoreIndicAssign extends PureComponent {
  constructor(props) {
    super(props);
    const parame = qs.parse(props.location.search.substr(1));
    this.state = {
      formValues: {},
      leftSelectRows: [],
      rightSelectRows: [],
      leftSelectedRowKeys: [],
      templateId: parame.templateId,
      indicateId: parame.indicateId,
    };
  }

  /**
   * 组件挂载后执行方法
   */
  componentDidMount() {
    const { dispatch } = this.props;
    const { templateId, indicateId } = this.state;
    const params = {
      templateId,
      indicateId,
    };
    dispatch({
      type: 'scoreIndicAssign/fetchIndicAssign',
      payload: {
        ...params,
      },
    });
    dispatch({
      type: 'scoreIndicAssign/fetchCheckedIndicAssign',
      payload: {
        ...params,
      },
    });
  }

  /**
   * 穿梭表格左侧数据穿梭到右侧方法
   */
  @Bind()
  onLToRBtnClick() {
    const { dispatch } = this.props;
    const { leftSelectRows, templateId, indicateId } = this.state;
    dispatch({
      type: 'scoreIndicAssign/addIndicAssign',
      payload: {
        leftSelectRows,
        templateId,
        indicateId,
      },
    }).then(response => {
      if (response) {
        notification.success();
        this.refreshAll();
      }
    });
  }

  /**
   * 穿梭表格右侧数据穿梭到左侧方法
   */
  @Bind()
  onRToLBtnClick() {
    const { dispatch } = this.props;
    const { rightSelectRows, templateId, indicateId } = this.state;
    dispatch({
      type: 'scoreIndicAssign/removeIndicAssign',
      payload: {
        rightSelectRows,
        templateId,
        indicateId,
      },
    }).then(response => {
      if (response) {
        notification.success();
        this.refreshAll();
      }
    });
  }

  /**
   * 查询数据
   * @param {object} value 查询数据标示
   */
  @Bind()
  queryValue(value) {
    const { form, dispatch } = this.props;
    const { templateId, indicateId } = this.state;
    let action = '';
    let data = {};
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        if (value === 'left') {
          action = 'fetchIndicAssign';
          this.setState({
            formValues: {
              ...fieldsValue[`${value}#supplierInfo`],
            },
          });
          data = {
            templateId,
            indicateId,
          };
        } else {
          action = 'fetchCheckedIndicAssign';
          data = {
            templateId,
            indicateId,
          };
        }
        dispatch({
          type: `scoreIndicAssign/${action}`,
          payload: {
            ...data,
            ...fieldsValue[`${value}#supplierInfo`],
          },
        });
      }
    });
  }

  /**
   * 穿梭表格左侧勾选事件
   * @param {String} keys 已经勾选的key值
   * @param {object} rows 已经勾选中的行数据
   */
  @Bind()
  handleLeftSelectRows(keys, rows) {
    const { leftSelectRows, leftSelectedRowKeys } = this.state;
    // 找到变动的key值
    const differenceKeys = lodash.xor(leftSelectedRowKeys, keys);
    // 找到新增勾选的行数据
    const addrows = rows.filter(row => differenceKeys.find(key => key === row.id));
    // 找到取消勾选的行数据
    const deletedRows = leftSelectRows.filter(row => differenceKeys.find(key => key === row.id));
    this.setState({
      leftSelectedRowKeys: keys,
      leftSelectRows: lodash.unionWith(lodash.xor(leftSelectRows, deletedRows), addrows),
    });
  }

  /**
   * 穿梭表格左侧勾选事件
   * @param {null} _ 占位
   * @param {object} rows 已经勾选中的行数据
   */
  @Bind()
  handleRightSelectRows(_, rows) {
    this.setState({
      rightSelectRows: rows,
    });
  }

  /**
   * 左侧和右侧数据刷新
   */
  @Bind()
  refreshAll() {
    this.refrshLeftTable();
    this.refrshRightTable();
  }

  /**
   * 左侧刷新
   */
  @Bind()
  refrshLeftTable() {
    const { dispatch } = this.props;
    const { templateId, indicateId } = this.state;
    this.setState({
      leftSelectRows: [],
      leftSelectedRowKeys: [],
    });
    dispatch({
      type: 'scoreIndicAssign/fetchIndicAssign',
      payload: {
        templateId,
        indicateId,
      },
    });
  }

  /**
   * 右侧刷新
   */
  @Bind()
  refrshRightTable() {
    const { dispatch } = this.props;
    const { templateId, indicateId } = this.state;
    this.setState({
      rightSelectRows: [],
    });
    dispatch({
      type: 'scoreIndicAssign/fetchCheckedIndicAssign',
      payload: {
        templateId,
        indicateId,
      },
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
    const { formValues, templateId, indicateId } = this.state;
    const staticData = {
      templateId,
      indicateId,
      ...formValues,
    };
    dispatch({
      type: 'scoreIndicAssign/fetchIndicAssign',
      payload: {
        page: pagination,
        ...staticData,
      },
    });
  }

  /**
   * 查询结构渲染
   * @param {object} value 左侧/右侧区分标记
   * @returns
   */
  @Bind()
  renderSearchForm(value) {
    const { getFieldDecorator } = this.props.form;
    const fromArray = [
      {
        queryLabel: intl
          .get('sslm.scoreIndicAssign.model.scoreIndicAssign.loginName')
          .d('对象编码'),
        queryName: 'loginName',
      },
      {
        queryLabel: intl.get('sslm.scoreIndicAssign.model.scoreIndicAssign.realName').d('对象描述'),
        queryName: 'realName',
      },
    ];
    return (
      <Form>
        <Row type="flex" justify="end" align="middle" gutter={24}>
          <Col span={20}>
            <Form.Item>
              {getFieldDecorator(`${value}#supplierInfo`)(<OptionInput queryArray={fromArray} />)}
            </Form.Item>
          </Col>
          <Col span={4}>
            <FormItem>
              <Button onClick={() => this.queryValue(value)} htmlType="submit" type="primary">
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   *渲染事件
   *
   * @returns
   */
  render() {
    const {
      match,
      scoreIndicAssign: { leftData = {}, rightData = [] },
      fetchIndicAssign,
      fetchCheckedIndicAssign,
    } = this.props;
    const { leftSelectRows, rightSelectRows, templateId } = this.state;
    const basePath = match.path.substring(0, match.path.indexOf('/score-indic-assign'));
    const columns = [
      {
        title: intl.get('sslm.scoreIndicAssign.model.scoreIndicAssign.loginName').d('对象编码'),
        dataIndex: 'loginName',
        width: 150,
      },
      {
        title: intl.get('sslm.scoreIndicAssign.model.scoreIndicAssign.realName').d('对象描述'),
        dataIndex: 'realName',
      },
    ];
    const leftRowSelection = {
      selectedRowKeys: leftSelectRows.map(n => n.id),
      onChange: this.handleLeftSelectRows,
      // getCheckboxProps: record => ({
      //   disabled:
      //     selectedRows.length > 0
      //       ? selectedRows.find(data => data.id === record.id)
      //       : rightData.find(data => data.id === record.id),
      // }),
    };
    const rightRowSelection = {
      selectedRowKeys: rightSelectRows.map(n => n.id),
      onChange: this.handleRightSelectRows,
    };
    const otherProps = {
      columns,
      rowKey: 'id',
      defaultExpandAllRows: true,
      bordered: true,
    };
    const pagination = {
      ...createPagination(leftData),
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get('sslm.scoreIndicAssign.view.message.title').d('细项权限')}
          backPath={`${basePath}/score-indic?templateId=${templateId}`}
        />
        <Content>
          <Row gutter={24}>
            <Col span={11}>
              <div className="table-list-search">{this.renderSearchForm('left')}</div>
              <Table
                loading={fetchIndicAssign}
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
                  >
                    <Icon type="right" />
                  </Button>
                </Row>
                <Row style={{ textAlign: 'center' }}>
                  <Button
                    type="primary"
                    disabled={rightSelectRows.length <= 0}
                    onClick={this.onRToLBtnClick}
                  >
                    <Icon type="left" />
                  </Button>
                </Row>
              </div>
            </Col>
            <Col span={11}>
              <div className="table-list-search">{this.renderSearchForm('right')}</div>
              <Table
                loading={fetchCheckedIndicAssign}
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
