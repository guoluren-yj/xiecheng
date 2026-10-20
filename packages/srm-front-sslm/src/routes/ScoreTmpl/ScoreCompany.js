/**
 * ScoreCompany - 分配适用公司
 * @date: 2018-08-08
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Table } from 'hzero-ui';
import lodash from 'lodash';
import { Bind } from 'lodash-decorators';
import { Content } from 'components/Page';
import intl from 'utils/intl';

/**
 * 评分模板定义 - 分配适用公司
 * @extends {Component} - React.Component
 * @reactProps {Object} scoreTmpl - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class ScoreCompany extends PureComponent {
  /**
   * @param {object} props
   */
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      createList: [],
      deleteList: [],
    };
  }

  /**
   * 状态发生改变后触发
   * @static
   * @param {object} nextProps 下个状态外部传入属性
   * @param {object} prevState 上一个状态的数据
   * @returns
   */
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.scoreCompany !== prevState.prevSelectedRows) {
      return {
        selectedRows: nextProps.scoreCompany,
        prevSelectedRows: nextProps.scoreCompany,
      };
    }
    return null;
  }

  /**
   * 组件挂载后执行方法
   */
  componentDidMount() {
    const { getCompanyRef } = this.props;
    if (lodash.isFunction(getCompanyRef)) {
      getCompanyRef(this);
    }
  }

  /**
   * 分配适用公司保存（暂不使用）
   */
  @Bind()
  dataSave() {
    const { createList, deleteList } = this.state;
    const { saveCompany } = this.props;
    saveCompany(createList, deleteList);
  }

  /**
   * 勾选的数据
   * @param {object} record 行记录
   * @param {boolean} checked 是否选中
   */
  @Bind()
  selectData(record, checked) {
    const { scoreCompany } = this.props;
    if (checked) {
      if (!scoreCompany.find(company => company.companyId === record.companyId)) {
        this.setState({
          createList: [...this.state.createList, record],
        });
      }
    } else if (scoreCompany.find(company => company.companyId === record.companyId)) {
      this.setState({
        deleteList: [
          ...this.state.deleteList,
          scoreCompany.find(company => company.companyId === record.companyId),
        ],
      });
    }
  }

  /**
   * 选择全部
   * @param {object} selected
   * @param {object} selectedRows
   */
  @Bind()
  onSelectAll(selected, selectedRows) {
    const { scoreCompany } = this.props;
    if (selected) {
      this.setState({
        createList: selectedRows,
        deleteList: [],
      });
    } else {
      this.setState({
        createList: [],
        deleteList: scoreCompany,
      });
    }
  }

  /**
   * 行选中/取消事件
   * @param {null} _占位符
   * @param {object} rows 行数据
   */
  @Bind()
  handleSelectRows(_, rows) {
    this.setState({
      selectedRows: rows,
    });
  }

  /**
   * 渲染方法
   * @returns
   */
  render() {
    const dataSource = this.props.companyData;
    const { loading } = this.props;
    const { selectedRows } = this.state;
    const columns = [
      {
        title: intl.get('sslm.common.view.company.code').d('公司编码'),
        dataIndex: 'companyNum',
        width: 300,
      },
      {
        title: intl.get('sslm.common.view.company.companyName').d('公司名称'),
        dataIndex: 'companyName',
        width: 300,
      },
    ];
    const rowSelection = {
      selectedRowKeys: selectedRows.map(n => n.companyId),
      onChange: this.handleSelectRows,
      onSelect: this.selectData,
      onSelectAll: this.onSelectAll,
    };
    return (
      <React.Fragment>
        <Content>
          <Table
            loading={loading}
            rowKey="companyId"
            dataSource={dataSource}
            columns={columns}
            rowSelection={rowSelection}
            pagination={false}
            onChange={this.handleTableChange}
            bordered
          />
        </Content>
      </React.Fragment>
    );
  }
}
