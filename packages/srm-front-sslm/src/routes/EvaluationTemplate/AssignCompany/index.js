/**
 * CompanyModal - 分配适用公司
 * @date: 2019-2-15
 * @author: lixioalong <xiaolong.li02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import { isFunction } from 'lodash';
import React, { PureComponent } from 'react';
import { Form, Table, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import notification from 'utils/notification';

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
      dataSource: [],
      selectedRows: [],
      createList: [],
      deleteList: [],
    };
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (isFunction(onRef)) {
      onRef(this);
    }
  }

  /**
   * 组件更新后执行方法
   */
  componentDidUpdate(prevProps) {
    const { onLoad = e => e, companyVisible } = this.props;
    if (companyVisible && companyVisible !== prevProps.companyVisible) {
      onLoad().then(res => {
        if (res) {
          this.setState({
            dataSource: res,
            selectedRows: Array.isArray(res) ? res.filter(n => n.evalTplCompanyId) : [],
          });
        }
      });
    }
  }

  // 清空勾选项，关闭弹框
  @Bind()
  handleClearAndClose() {
    this.setState({
      createList: [],
      deleteList: [],
      selectedRows: [],
    });
    this.handleClose();
  }

  /**
   * 分配适用公司保存
   */
  @Bind()
  dataSave() {
    const { createList, deleteList } = this.state;
    const { onSaveCompany = e => e } = this.props;
    onSaveCompany(createList, deleteList).then(res => {
      if (res) {
        notification.success();
        this.handleClearAndClose();
      }
    });
  }

  /**
   * 勾选全部
   * @param {boolean} select - 是否勾选
   * @param {object[]} selectedRows -  被选择的行
   */
  @Bind()
  selectAll(select, selectedRows) {
    const { selectedRows: oldSelectedRow } = this.state;
    if (select) {
      selectedRows.forEach(row => {
        this.selectData(row, true);
      });
    } else {
      oldSelectedRow.forEach(row => {
        this.selectData(row, false);
      });
    }
  }

  /**
   * 选择/取消选择某行的回调
   * @param {object} record 行记录
   * @param {boolean} checked 是否选中
   */
  @Bind()
  selectData(record, checked) {
    const { selectedRows, createList, deleteList } = this.state;
    if (checked) {
      // 勾选一条数据
      if (!selectedRows.find(company => company.companyId === record.companyId)) {
        // 此条数据并没有已选择
        if (!deleteList.find(company => company.companyId === record.companyId)) {
          // 此条数据没有在之前被删除
          const data = { deleteFlag: 0, ...record }; // 此条数据是要新建的
          this.setState(prevState => ({
            createList: [...prevState.createList, data],
          }));
        } else {
          // 否则此条数据是先被取消勾选 后又被勾选的数据
          const filteredArr = deleteList.filter(n => n.companyId !== record.companyId); // 从删除列表这去除这条数据
          this.setState({
            deleteList: filteredArr,
          });
        }
      }
    } else if (selectedRows.find(company => company.companyId === record.companyId)) {
      // 取消勾选一条数据
      if (!createList.find(company => company.companyId === record.companyId)) {
        // 此条数据不属于新勾选的数据
        const data = selectedRows.find(company => company.companyId === record.companyId);
        data.deleteFlag = 1;
        this.setState(prevState => ({
          deleteList: [...prevState.deleteList, data],
        }));
      } else {
        const filteredArr = createList.filter(n => n.companyId !== record.companyId);
        this.setState({
          createList: filteredArr,
        });
      }
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
   * 关闭companyModal
   */
  @Bind()
  handleClose() {
    const { onHandleCloseCompany } = this.props;
    onHandleCloseCompany(false);
  }

  /**
   * 渲染方法
   * @returns
   */
  render() {
    const {
      form,
      loading,
      companyVisible,
      modalLoading,
      mode,
      currentRows,
      evaluationTemplateRemote,
    } = this.props;
    const { selectedRows, dataSource } = this.state;
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
      onSelectAll: this.selectAll,
    };
    const tableProps = {
      loading,
      columns,
      dataSource: mode === 'view' ? dataSource.filter(n => n.evalTplCompanyId) : dataSource,
    };
    const modalProps = {
      title: intl.get(`sslm.evaluationTemplate.view.title.assignCompany`).d('分配适用公司'),
      visible: companyVisible,
      onCancel: this.handleClose,
      width: 800,
      bodyStyle: { maxHeight: 600 },
    };
    if (mode === 'view') {
      modalProps.footer = null;
    } else {
      modalProps.onOk = this.dataSave;
      modalProps.confirmLoading = modalLoading;
      tableProps.rowSelection = rowSelection;
    }
    const renderProps = {
      form,
      currentRows,
      isEdit: mode !== 'view',
    };
    return (
      <Modal {...modalProps}>
        {evaluationTemplateRemote &&
          evaluationTemplateRemote.render &&
          evaluationTemplateRemote.render(
            'SSLM_EVALUATIONTEMPLATE_DEFINITION_ASSIGN_COMPANY_RENDER',
            <></>,
            renderProps
          )}
        <Table
          scroll={{ y: 500 }}
          rowKey="companyId"
          pagination={false}
          onChange={this.handleTableChange}
          bordered
          {...tableProps}
        />
      </Modal>
    );
  }
}
