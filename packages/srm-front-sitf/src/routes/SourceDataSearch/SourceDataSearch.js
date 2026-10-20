/**
 * SourceDataSearch - 源数据查询
 * @date: 2018-10-16
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Table, Modal } from 'hzero-ui';
import { withRouter } from 'react-router-dom';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import { statusRender, yesOrNoRender, isErrorOrNoRender } from 'utils/renderer';
import { filterNullValueObject, isTenantRoleLevel } from 'utils/utils';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import 'codemirror/mode/clike/clike';
import CodeMirror from 'components/CodeMirror';

import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import QueryForm from './QueryForm';
import QueryFormOrg from './QueryFormOrg';

/**
 * 源数据查询
 * @extends {Component} - React.Component
 * @reactProps {Object} supplierDetail | supplierDetailOrg - 数据源
 * @reactProps {Object} [history={}]
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: ['sitf.sourceDataSearch', 'entity.interface', 'entity.application', 'sitf.common'],
})
@Form.create({ fieldNameProp: null })
@withRouter
export default class SourceDataSearch extends PureComponent {
  state = {
    errorVisible: false, // 错误弹框显示/隐藏标记
    errorMessage: '', // 错误信息
  };

  Form;

  /**
   * 组件挂载后方法
   */
  componentDidMount() {
    const {
      modelName = 'sourceDataSearch',
      location: { state: { _back } = {} },
    } = this.props;
    const { [modelName]: sourceDataSearch } = this.props;
    const { batchData = {} } = sourceDataSearch;
    const level = isTenantRoleLevel();
    if (+level || !isUndefined(_back)) {
      this.fetchData(batchData.pagination);
    }
  }

  /**
   * 查询数据(条件查询)
   * @param {object} pageData 页面信息数据
   */
  @Bind()
  fetchData(pageData = {}) {
    const { dispatch, modelName = 'sourceDataSearch' } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const searchData = {
      ...filterValues,
      creationDateFrom:
        filterValues.creationDateFrom &&
        filterValues.creationDateFrom.format(DEFAULT_DATETIME_FORMAT),
      creationDateTo:
        filterValues.creationDateTo && filterValues.creationDateTo.format(DEFAULT_DATETIME_FORMAT),
    };
    dispatch({
      type: `${modelName}/queryBatchList`,
      payload: {
        ...searchData,
        page: pageData,
      },
    });
  }

  /**
   *点击查询按钮事件
   *
   * @param {object} queryData 查询参数
   */
  @Bind()
  fetchDataByCondition(queryData = {}) {
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
   * 分页变化事件
   *
   * @param {Object} pagination 错误信息
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
    this.form = (ref.props || {}).form;
  }

  /**
   * 渲染方法
   */
  render() {
    const { queryBatchList, history, modelName = 'sourceDataSearch' } = this.props;
    const { [modelName]: sourceDataSearch } = this.props;
    const { batchData = {} } = sourceDataSearch;
    const { errorVisible, errorMessage } = this.state;
    const level = isTenantRoleLevel();
    const columns = [
      // {
      //   title: intl.get('entity.interface.code').d('接口代码'),
      //   dataIndex: 'interfaceCode',
      //   width: 150,
      // },
      // {
      //   title: intl.get('entity.interface.name').d('接口名称'),
      //   dataIndex: 'interfaceName',
      //   width: 150,
      // },
      {
        title: intl
          .get('sitf.sourceDataSearch.model.sourceDataSearch.esInterfaceCode')
          .d('外部接口代码'),
        dataIndex: 'esInterfaceCode',
        width: 300,
      },
      {
        title: intl.get('entity.application.group').d('应用组'),
        dataIndex: 'applicationGroupName',
        width: 150,
      },
      {
        title: intl.get('entity.application.tag').d('应用'),
        dataIndex: 'applicationCodeName',
        width: 120,
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
        title: intl.get('sitf.sourceDataSearch.model.sourceDataSearch.finishedFlag').d('完成'),
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
        title: intl.get('sitf.common.data.executeResult').d('数据执行结果'),
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
        title: intl.get('hzero.common.date.creation').d('创建日期'),
        width: 180,
        align: 'left',
        dataIndex: 'creationDate',
      },
      {
        title: intl.get('sitf.sourceDataSearch.model.sourceDataSearch.dataDetail').d('源数据详情'),
        width: 120,
        align: 'left',
        render: (_, record) => (
          <a
            onClick={() => {
              history.push(
                `/sitf/sourcedata-search-org/detail?interfaceId=${record.interfaceId}&batchId=${record.batchId}&tenant=${record.tenant}&esInterfaceCode=${record.esInterfaceCode}`
              );
            }}
          >
            {intl.get('sitf.sourceDataSearch.model.sourceDataSearch.dataDetail').d('源数据详情')}
          </a>
        ),
      },
    ];

    return (
      <React.Fragment>
        <Header title={intl.get('sitf.sourceDataSearch.view.title.head').d('源数据查询')} />
        <Content>
          {+level ? (
            <QueryFormOrg queryValue={this.fetchDataByCondition} onRef={this.handleBindRef} />
          ) : (
            <QueryForm queryValue={this.fetchDataByCondition} onRef={this.handleBindRef} />
          )}

          <Table
            bordered
            scroll={{ x: 1800 }}
            loading={queryBatchList}
            rowKey="batchId"
            dataSource={batchData.list}
            columns={columns}
            pagination={batchData.pagination}
            onChange={this.handleStandardTableChange}
          />
          <Modal
            width={800}
            title={intl.get('sitf.common.error.errorMessage').d('错误信息')}
            visible={errorVisible}
            destroyOnClose
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
