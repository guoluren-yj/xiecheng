/**
 * PurchaseCategory - 分配采购品类
 * @date: 2019-2-15
 * @author: lixiaolong <xiaolong.li02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { Form, Input, Button, Table, Row, Col } from 'hzero-ui';
import { connect } from 'dva';
import lodash from 'lodash';
import { Bind } from 'lodash-decorators';
// import qs from 'querystring';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import qs from 'querystring';
// import styles from '../ScoreLevel/index.less';

// 使用 Form.Item 组件
const FormItem = Form.Item;
/**
 * 评分模板定义
 * @extends {Component} - React.Component
 * @reactProps {Object} purchaseCategory - 数据源
 * @reactProps {Object} [history={}]
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: ['sslm.purchaseCategory', 'sslm.scoreLevel'],
})
@connect(({ purchaseCategory, loading }) => ({
  purchaseCategory,
  loading: loading.effects,
  fetchpurcahseCategory: loading.effects['purchaseCategory/fetchpurcahseCategory'],
  changeLoading: loading.effects['purchaseCategory/change'],
}))
@Form.create({ fieldNameProp: null })
@withRouter
export default class ScoreCategory extends PureComponent {
  /**
   *Creates an instance of ScoreCategory.
   * @param {*} props
   */
  constructor(props) {
    super(props);
    const routerParams = qs.parse(props.location.search.substr(1));
    const { evalTplCode, routeType = '' } = routerParams;
    this.state = {
      evalTplCode,
      routeType,
      selectedRows: [],
      action: props.match.params.action,
    };
  }

  /**
   *组件挂载后执行方法
   */
  componentDidMount() {
    const { dispatch, match } = this.props;
    const { routeType, evalTplCode } = this.state;
    const checkedData = [];
    if (routeType && routeType === 'HistoricalVersion') {
      dispatch({
        type: 'purchaseCategory/fetchTmplInfoHistory',
        payload: {
          templateId: match.params.id,
          evalTplCode,
        },
      });
    } else {
      dispatch({
        type: 'purchaseCategory/fetchTmplInfo',
        payload: {
          templateId: match.params.id,
        },
      });
    }
    dispatch({
      type: 'purchaseCategory/fetchpurcahseCategory',
      payload: {
        templateId: match.params.id,
        enabledFlag: 1,
      },
    }).then(data => {
      if (Array.isArray(data)) {
        data.forEach(d => {
          // 递归勾选
          const recursiveCheck = r => {
            if (r.evalTplScopeDtlId) {
              checkedData.push(r);
            }
            if (r.children) {
              r.children.forEach(i => {
                recursiveCheck(i);
              });
            }
          };
          recursiveCheck(d);
        });
        this.setState({
          selectedRows: checkedData,
        });
      }
    });
  }

  /**
   *保存
   */
  @Bind()
  onSave() {
    const { selectedRows } = this.state;
    const {
      dispatch,
      purchaseCategory: { data = [] },
      match = {},
    } = this.props;
    const newCheckedData = [];
    const unCheckedData = [];
    const checkedChange = item => {
      let isNewCheckedData = true;
      let isUnCheckedData = false;
      if (item.evalTplScopeDtlId) {
        // 本来勾选
        for (let i = 0; i < selectedRows.length; i++) {
          if (selectedRows[i].categoryId === item.categoryId) {
            // selectedRows中存在这一条数据
            isNewCheckedData = false; // 勾选状态没有变化
            break;
          }
        }
      } else {
        // 本来没有勾选
        isNewCheckedData = false;
        for (let i = 0; i < selectedRows.length; i++) {
          if (selectedRows[i].categoryId === item.categoryId) {
            // selectedRows中存在这一条数据
            isUnCheckedData = true; // 勾选状态变化
            break;
          }
        }
      }
      if (isNewCheckedData) {
        const { children, ...rest } = item;
        const n = { deleteFlag: 1, ...rest };
        newCheckedData.push(n);
      }
      if (isUnCheckedData) {
        const { children, ...rest } = item;
        const n = { deleteFlag: 0, ...rest };
        unCheckedData.push(n);
      }
    };
    data.forEach(d => {
      // 递归勾选
      const recursiveCheck = r => {
        checkedChange(r);
        if (r.children) {
          r.children.forEach(i => {
            recursiveCheck(i);
          });
        }
      };
      recursiveCheck(d);
    });
    dispatch({
      type: 'purchaseCategory/change',
      payload: {
        changeData: [...newCheckedData, ...unCheckedData],
        templateId: match.params.id,
      },
    }).then(res => {
      if (res && !res.failed) {
        notification.success({
          message: intl.get(`hzero.common.notification.success.save`).d('保存成功'),
        });
      }
    });
  }

  /**
   * 查询
   */
  @Bind()
  fetchpurcahseCategory() {
    const { form, dispatch, match = {} } = this.props;
    const checkedData = [];
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        dispatch({
          type: `purchaseCategory/fetchpurcahseCategory`,
          payload: {
            templateId: match.params.id,
            enabledFlag: 1,
            categoryCode: fieldsValue.categoryCode,
            categoryName: fieldsValue.categoryName,
          },
        }).then(data => {
          if (Array.isArray(data)) {
            data.forEach(d => {
              // 递归勾选
              const recursiveCheck = r => {
                if (r.evalTplScopeDtlId) {
                  checkedData.push(r);
                }
                if (r.children) {
                  r.children.forEach(i => {
                    recursiveCheck(i);
                  });
                }
              };
              recursiveCheck(d);
            });
            this.setState({
              selectedRows: checkedData,
            });
          }
        });
      }
    });
  }

  /**
   * 采购品类的数据选择
   * @param {null} _ 占位
   * @param {Object} rows 选中行
   */
  @Bind()
  handleLeftSelectRows(_, rows) {
    this.setState({
      selectedRows: rows,
    });
  }

  /**
   * 获得子元素
   * @param {Object} record 行记录
   * @returns
   */
  @Bind()
  getAllChilds(record) {
    let arr = [];
    const findChilds = r => {
      if (r.children) {
        arr = lodash.unionWith(arr, r.children);
        r.children.forEach(child => {
          findChilds(child);
        });
      }
    };
    findChilds(record);
    return arr;
  }

  /**
   * 查询当前行下所有子元素
   * @param {Object} record 行数据
   * @param {Object} selected 选中/取消标记
   * @param {Object} selectedRows 已经选中行
   */
  @Bind()
  selectChildren(record, selected, selectedRows) {
    const getAllChilds = this.getAllChilds(record);
    this.setState({
      selectedRows: selected
        ? lodash.unionWith(selectedRows, getAllChilds)
        : lodash.differenceBy(selectedRows, getAllChilds, 'categoryId'),
    });
  }

  /**
   * 刷新
   */
  @Bind()
  refreshAll() {
    this.fetchAllData();
  }

  /**
   * 重置表单
   */
  @Bind()
  formReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 渲染查询结构
   * @returns
   */
  @Bind()
  renderForm() {
    const { getFieldDecorator } = this.props.form;
    const {
      purchaseCategory: { tmplInfo = {} },
    } = this.props;
    return (
      <Fragment>
        <Row style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Row>
              <Col span={10}>
                {intl.get('sslm.scoreLevel.model.scoreLevel.templateCode').d('评分模板代码')}
              </Col>
              <Col span={14}>{tmplInfo.templateCode}</Col>
            </Row>
          </Col>
          <Col span={8}>
            <Row>
              <Col span={10}>
                {intl.get('sslm.scoreLevel.model.scoreLevel.templateName').d('评分模板描述')}
              </Col>
              <Col span={14}>{tmplInfo.templateName}</Col>
            </Row>
          </Col>
        </Row>
        <Form layout="inline">
          <FormItem
            label={intl
              .get('sslm.purchaseCategory.model.purchaseCategory.categoryCode')
              .d('采购品类编码')}
          >
            {getFieldDecorator(`categoryCode`)(<Input />)}
          </FormItem>
          <FormItem
            label={intl
              .get('sslm.purchaseCategory.model.purchaseCategory.categoryName')
              .d('采购品类描述')}
          >
            {getFieldDecorator(`categoryName`)(<Input />)}
          </FormItem>
          <FormItem>
            <Button onClick={() => this.formReset()} style={{ marginRight: '8px' }}>
              {intl.get('hzero.common.button.reset').d('重置')}
            </Button>
            <Button onClick={() => this.fetchpurcahseCategory()} type="primary" htmlType="submit">
              {intl.get('hzero.common.button.search').d('查询')}
            </Button>
          </FormItem>
        </Form>
      </Fragment>
    );
  }

  /**
   *渲染方法
   *
   * @returns
   */
  render() {
    const {
      match,
      purchaseCategory: { data = [] },
      changeLoading,
      fetchpurcahseCategory,
    } = this.props;
    const { selectedRows, action, evalTplCode, routeType } = this.state;
    const basePath = match.path.substring(0, match.path.indexOf('/purchase-category'));
    const columns = [
      {
        title: intl
          .get('sslm.purchaseCategory.model.purchaseCategory.categoryCode')
          .d('采购品类编码'),
        dataIndex: 'categoryCode',
        width: 300,
      },
      {
        title: intl
          .get('sslm.purchaseCategory.model.purchaseCategory.categoryName')
          .d('采购品类描述'),
        dataIndex: 'categoryName',
      },
    ];
    const leftRowSelection = {
      selectedRowKeys: selectedRows.map(n => n.categoryId),
      onChange: this.handleLeftSelectRows,
      onSelect: this.selectChildren,
      getCheckboxProps: () => ({
        disabled: action === 'view',
      }),
    };
    const otherProps = {
      columns,
      rowKey: 'categoryId',
      pagination: false,
      defaultExpandAllRows: true,
      bordered: true,
      onExpand: this.onExpand,
    };

    const backPath =
      routeType && routeType === 'HistoricalVersion'
        ? `${basePath}/historical-version/list?evalTplCode=${evalTplCode}`
        : `${basePath}/list`;
    return (
      <React.Fragment>
        <Header
          title={intl.get('sslm.purchaseCategory.view.message.title').d('分配采购品类')}
          backPath={backPath}
        >
          <Button
            disabled={action === 'view'}
            icon="save"
            loading={changeLoading}
            type="primary"
            onClick={this.onSave}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <div style={{ marginBottom: 16 }}>{this.renderForm()}</div>
          <Table
            loading={fetchpurcahseCategory}
            dataSource={data}
            rowSelection={leftRowSelection}
            {...otherProps}
          />
        </Content>
      </React.Fragment>
    );
  }
}
