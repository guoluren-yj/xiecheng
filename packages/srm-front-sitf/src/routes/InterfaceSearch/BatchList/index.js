/**
 * BatchList - 接口查询 - 批次列表
 * @date: 2018-9-18
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table, Modal, Layout } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { statusRender, yesOrNoRender, isErrorOrNoRender } from 'utils/renderer';
import { filterNullValueObject, isTenantRoleLevel } from 'utils/utils';
import 'codemirror/mode/clike/clike';
import CodeMirror from 'components/CodeMirror';
import QueryForm from './QueryForm';
import QueryFormOrg from './QueryFormOrg';

const { Content } = Layout;
/**
 * 接口查询 - 批次列表
 * @extends {Component} - React.Component
 * @reactProps {Object} [history={}]
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
export default class BatchList extends PureComponent {
  Form;

  constructor(props) {
    super(props);
    props.getRef(this);
    this.state = {
      errorVisible: false, // 错误弹框显示/隐藏标记
      errorMessage: '', // 错误信息
      selectedRows: [],
    };
  }

  /**
   * 行点击事件
   */
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 150,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: e => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  /**
   *查询数据
   *
   * @param {Object} pageData 页面信息数据
   */
  @Bind()
  fetchData(pageData = {}) {
    const { queryBatchList } = this.props;
    const filterValues = isUndefined(this.Form)
      ? {}
      : filterNullValueObject(this.Form.getFieldsValue());
    const searchData = {
      ...filterValues,
      creationDateFrom:
        filterValues.creationDateFrom &&
        filterValues.creationDateFrom.format(DEFAULT_DATETIME_FORMAT),
      creationDateTo:
        filterValues.creationDateTo && filterValues.creationDateTo.format(DEFAULT_DATETIME_FORMAT),
    };
    if (queryBatchList) {
      queryBatchList({
        page: pageData,
        ...searchData,
      });
    }
  }

  /**
   * 勾选行数据
   * @param {*} _ 占位
   * @param {Array} selectedRows 选择的行数据
   */
  @Bind()
  onSelectChange(_, selectedRows) {
    this.setState({ selectedRows });
  }

  /**
   *点击查询按钮事件
   * @param {Object} queryData 查询参数
   */
  @Bind()
  queryValue(queryData = {}) {
    this.fetchData(queryData);
  }

  /**
   * 显示错误信息
   * @param {String} message 错误信息
   */
  @Bind()
  showErrorMessage(message) {
    this.setState({
      errorVisible: true,
      errorMessage: message,
    });
  }

  /**
   * 隐藏错误信息
   */
  @Bind()
  hideErrorMessage() {
    this.setState({
      errorVisible: false,
      errorMessage: '',
    });
  }

  /**
   *分页change时间
   *
   * @param {Object} pagination 分页信息
   */
  @Bind()
  handleStandardTableChange(pagination = {}) {
    this.fetchData(pagination);
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.Form = (ref.props || {}).form;
  }

  /**
   *渲染方法
   */
  render() {
    const {
      batchData = {},
      loading,
      history,
      queryData,
      batchStatus = '',
      DataExecuteResult = [],
      onResetModelData,
      modelName = 'interfaceListDetail',
    } = this.props;

    const { errorVisible, errorMessage, selectedRows } = this.state;

    const rowSelection = {
      onChange: this.onSelectChange,
      selectedRowKeys: selectedRows.map(n => n.batchId),
      getCheckboxProps: record => ({
        disabled:
          record.dataExecuteResult === 'SUCCESS' || record.dataExecuteResult === 'UNEXECUTE',
      }),
    };

    const columns = [
      {
        title: intl.get('entity.interface.code').d('接口代码'),
        dataIndex: 'interfaceCode',
        width: 150,
      },
      {
        title: intl.get('entity.interface.name').d('接口名称'),
        dataIndex: 'interfaceName',
        width: 150,
      },
      {
        title: intl.get('entity.application.group').d('应用组'),
        dataIndex: 'applicationGroupName',
        width: 150,
        onCell: this.onCell.bind(this),
      },
      {
        title: intl.get('sitf.common.data.externalSystemName').d('外部系统名称'),
        dataIndex: 'externalSystemName',
        width: 150,
      },
      {
        title: intl.get('sitf.common.data.docNum').d('IDOC编码'),
        dataIndex: 'docNum',
        width: 100,
      },
      {
        title: intl.get('sitf.common.batch.number').d('批次号'),
        dataIndex: 'batchNum',
        width: 100,
      },
      {
        title: intl.get('sitf.common.batch.status').d('批次状态'),
        dataIndex: 'status',
        align: 'left',
        width: 120,
        render: (text, record) => statusRender(text, record.statusMeaning),
      },
      {
        title: intl.get('sitf.common.action.finishedFlag').d('完成'),
        dataIndex: 'finishedFlag',
        width: 80,
        align: 'left',
        render: yesOrNoRender,
      },
      {
        title: intl.get('sitf.common.action.flag').d('是否出错'),
        dataIndex: 'errorFlag',
        width: 100,
        align: 'left',
        render: isErrorOrNoRender,
      },
      {
        title: intl.get('sitf.common.error.errorMessage').d('错误信息'),
        dataIndex: 'errorMessage',
        width: 120,
        align: 'left',
        render: (text, record) => {
          if (record.errorFlag) {
            return (
              <a onClick={() => this.showErrorMessage(record.errorMessage)}>
                {intl.get('sitf.common.error.errorMessage').d('错误信息')}
              </a>
            );
          } else {
            return <div />;
          }
        },
      },
      {
        title: intl
          .get('sitf.interfaceSearch.model.interfaceSearch.dataExecuteResult')
          .d('数据执行结果'),
        width: 120,
        align: 'left',
        dataIndex: 'dataExecuteResult',
        render: (text, record) => statusRender(text, record.dataExecuteResultMeaning),
      },
      {
        title: intl.get('sitf.common.batch.confirmFlag').d('批次确认'),
        width: 100,
        align: 'left',
        dataIndex: 'confirmFlag',
        render: yesOrNoRender,
      },
      {
        title: intl.get('sitf.common.data.history').d('历史数据'),
        width: 100,
        align: 'left',
        dataIndex: 'historyFlag',
        render: yesOrNoRender,
      },
      {
        title: intl
          .get('sitf.interfaceSearch.model.interfaceSearch.masterErrorFlag')
          .d('主数据出错'),
        width: 120,
        align: 'left',
        dataIndex: 'masterErrorFlag',
        render: isErrorOrNoRender,
      },
      {
        title: intl
          .get('sitf.interfaceSearch.model.interfaceSearch.businessErrorFlag')
          .d('业务数据出错'),
        width: 120,
        align: 'left',
        dataIndex: 'businessErrorFlag',
        render: isErrorOrNoRender,
      },
      {
        title: intl.get('sitf.common.error.runningErrorFlag').d('运行时出错'),
        width: 120,
        align: 'left',
        dataIndex: 'runningErrorFlag',
        render: isErrorOrNoRender,
      },
      {
        title: intl.get('hzero.common.date.creation').d('创建时间'),
        width: 180,
        align: 'left',
        dataIndex: 'creationDate',
      },
      {
        title: intl.get('sitf.interfaceSearch.model.interfaceSearch.interfaceId').d('接口表'),
        width: 100,
        align: 'left',
        render: (_, record) => (
          <a
            onClick={() => {
              history.push(
                `/sitf/${
                  modelName === 'interfaceSearchOrg' ? 'interface-search-org' : 'interface-search'
                }/interface-list-detail?batchId=${record.batchId}&tenant=${record.tenant}`
              );
            }}
          >
            {intl.get('sitf.interfaceSearch.model.interfaceSearch.interfaceId').d('接口表')}
          </a>
        ),
      },
    ];

    const level = isTenantRoleLevel();
    return (
      <React.Fragment>
        <Content style={{ margin: '8px 16px 16px', padding: '16px' }}>
          {+level ? (
            <QueryFormOrg
              onResetModelData={onResetModelData}
              batchStatus={batchStatus}
              queryValue={this.queryValue}
              onRef={this.handleBindRef}
              codes={DataExecuteResult}
              queryData={queryData}
            />
          ) : (
            <QueryForm
              onResetModelData={onResetModelData}
              batchStatus={batchStatus}
              queryValue={this.queryValue}
              onRef={this.handleBindRef}
              codes={DataExecuteResult}
              queryData={queryData}
            />
          )}
          <Table
            bordered
            scroll={{ x: 2000 }}
            loading={loading}
            rowKey="batchId"
            dataSource={batchData.list}
            columns={columns}
            rowSelection={rowSelection}
            pagination={batchData.pagination}
            onChange={this.handleStandardTableChange}
          />
          <Modal
            title={intl.get('sitf.common.error.errorMessage').d('错误信息')}
            visible={errorVisible}
            destroyOnClose
            width={800}
            onCancel={this.hideErrorMessage}
            footer={false}
          >
            <CodeMirror
              codeMirrorProps={{
                value: errorMessage,
                options: {
                  mode: 'text/x-java',
                  autoFocus: false,
                  readOnly: true,
                  lineNumbers: true,
                },
              }}
            />
          </Modal>
        </Content>
      </React.Fragment>
    );
  }
}
