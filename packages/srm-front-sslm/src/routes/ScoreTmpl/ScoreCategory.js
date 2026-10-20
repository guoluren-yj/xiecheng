/**
 * ScoreCategory - 分配采购品类
 * @date: 2018-08-09
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { Form, Input, Button, Table } from 'hzero-ui';
import { connect } from 'dva';
import lodash from 'lodash';
import { Bind } from 'lodash-decorators';
import qs from 'querystring';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

/**
 * 评分模板定义
 * @extends {Component} - React.Component
 * @reactProps {Object} scoreCategory - 数据源
 * @reactProps {Object} [history={}]
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: ['sslm.scoreCategory'],
})
@connect(({ scoreCategory, loading }) => ({
  scoreCategory,
  loading: loading.effects,
  updateCheckedCategory: loading.effects['scoreCategory/updateCheckedCategory'],
  fetchpurcahseCategory: loading.effects['scoreCategory/fetchpurcahseCategory'],
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
    this.state = {
      templateId: qs.parse(props.location.search.substr(1)),
    };
  }

  /**
   *组件挂载后执行方法
   */
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'scoreCategory/fetchTmplInfo',
    });
    // dispatch({
    //   type: 'scoreCategory/fetchTmplInfo',
    //   payload: this.state.templateId,
    // });
    // this.fetchAllData();
  }

  /**
   *查询数据
   */
  @Bind()
  fetchAllData() {
    const { dispatch } = this.props;
    dispatch({
      type: 'scoreCategory/fetchpurcahseCategory',
      payload: {
        templateId: this.state.templateId,
        enabledFlag: 1,
      },
    });
    dispatch({
      type: 'scoreCategory/fetchCheckedCategory',
      payload: this.state.templateId,
    });
  }

  /**
   *保存
   */
  @Bind()
  onSave() {
    const {
      dispatch,
      scoreCategory: { checkedData = [], historyData = [] },
    } = this.props;
    const { templateId } = this.state;
    const unChangeData = lodash.intersectionBy(historyData, checkedData, 'categoryId');
    const createList = lodash.xorBy(checkedData, unChangeData, 'categoryId');
    const deleteList = lodash.xorBy(historyData, unChangeData, 'categoryId');
    dispatch({
      type: 'scoreCategory/change',
      payload: {
        changeData: {
          createList,
          deleteList,
        },
        ...templateId,
      },
    }).then(response => {
      if (response) {
        dispatch({
          type: 'scoreCategory/updateCheckedCategory',
          payload: {
            historyData: [],
          },
        });
        notification.success();
        this.refreshAll();
      }
    });
  }

  /**
   * 查询
   */
  @Bind()
  fetchpurcahseCategory() {
    const { form, dispatch } = this.props;
    const { templateId } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        dispatch({
          type: `scoreCategory/fetchpurcahseCategory`,
          payload: {
            ...templateId,
            enabledFlag: 1,
            categoryCode: fieldsValue.categoryCode,
            categoryName: fieldsValue.categoryName,
          },
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
    const { dispatch } = this.props;
    dispatch({
      type: 'scoreCategory/updateCheckedCategory',
      payload: {
        checkedData: rows,
      },
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
    const { dispatch } = this.props;
    dispatch({
      type: 'scoreCategory/updateCheckedCategory',
      payload: {
        checkedData: selected
          ? lodash.unionWith(selectedRows, getAllChilds)
          : lodash.differenceBy(selectedRows, getAllChilds, 'categoryId'),
      },
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
   *点击展开按钮展开方法
   * @param {boolean} expanded
   * @param {Object} record
   */
  @Bind()
  onExpand(expanded, record) {
    const {
      dispatch,
      scoreCategory: { expandedRowKeys = [] },
    } = this.props;
    dispatch({
      type: 'scoreCategory/updateCheckedCategory',
      payload: {
        expandedRowKeys: expanded
          ? expandedRowKeys.concat(record.categoryId)
          : expandedRowKeys.filter(o => o !== record.categoryId),
      },
    });
  }

  /**
   * 渲染查询结构
   * @returns
   */
  @Bind()
  renderForm() {
    const { getFieldDecorator } = this.props.form;
    const {
      scoreCategory: { tmplInfo = {} },
    } = this.props;
    return (
      <Form layout="inline">
        <FormItem
          label={intl.get('sslm.scoreCategory.model.scoreCategory.templateCode').d('评分模板代码')}
        >
          {getFieldDecorator('templateCode', {
            initialValue: tmplInfo.templateCode,
          })(<Input disabled />)}
        </FormItem>
        <FormItem
          label={intl.get('sslm.scoreCategory.model.scoreCategory.templateName').d('评分模板名称')}
        >
          {getFieldDecorator('templateName', {
            initialValue: tmplInfo.templateName,
          })(<Input disabled />)}
        </FormItem>
        <br />
        <FormItem
          label={intl.get('sslm.scoreCategory.model.scoreCategory.categoryCode').d('采购品类编码')}
        >
          {getFieldDecorator(`categoryCode`)(<Input />)}
        </FormItem>
        <FormItem
          label={intl.get('sslm.scoreCategory.model.scoreCategory.categoryName').d('采购品类描述')}
        >
          {getFieldDecorator(`categoryName`)(<Input />)}
        </FormItem>
        <FormItem>
          <Button onClick={() => this.fetchpurcahseCategory()} type="primary" htmlType="submit">
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </FormItem>
      </Form>
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
      scoreCategory: { data = [], checkedData = [], expandedRowKeys = [] },
      updateCheckedCategory,
      fetchpurcahseCategory,
    } = this.props;
    const basePath = match.path.substring(0, match.path.indexOf('/score-category'));
    const columns = [
      {
        title: intl.get('sslm.scoreCategory.model.scoreCategory.categoryCode').d('采购品类编码'),
        dataIndex: 'categoryCode',
        width: 300,
      },
      {
        title: intl.get('sslm.scoreCategory.model.scoreCategory.categoryName').d('采购品类描述'),
        dataIndex: 'categoryName',
      },
    ];
    const leftRowSelection = {
      selectedRowKeys: checkedData.map(n => n.categoryId),
      onChange: this.handleLeftSelectRows,
      onSelect: this.selectChildren,
    };
    const otherProps = {
      columns,
      rowKey: 'categoryId',
      pagination: false,
      defaultExpandAllRows: true,
      bordered: true,
      onExpand: this.onExpand,
      expandedRowKeys,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get('sslm.scoreCategory.view.message.title').d('分配采购品类')}
          backPath={`${basePath}/list`}
        >
          <Button icon="save" loading={updateCheckedCategory} type="primary" onClick={this.onSave}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">{this.renderForm()}</div>
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
