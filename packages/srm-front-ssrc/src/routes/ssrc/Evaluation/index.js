/**
 * Evaluation - 评标方法
 * @date: 2019-5-16
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import { Button, Table } from 'hzero-ui';
import { connect } from 'dva';
import intl from 'utils/intl';
import { isUndefined } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import { enableRender } from 'utils/renderer';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import Create from './Create';
import QueryForm from './QueryForm';

const promptCode = 'ssrc.evaluation';

@connect(({ evaluation, loading }) => ({
  evaluation,
  tableLoading: loading.effects['evaluation/queryEvaluationList'],
  drawerLoading: loading.effects['evaluation/evaluationSave'],
  tenantId: getCurrentOrganizationId(),
  evaluationList: evaluation.evaluationList || {},
  evaluationPagination: evaluation.evaluationPagination || {},
}))
@formatterCollections({ code: ['ssrc.evaluation'] })
export default class Evaluation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      drawerVisible: false, // 抽屉的显示／隐藏
      initDrawerData: {}, // 初始化抽屉数据
      drawerStatus: '', // 根据状态判断新建还是编辑
    };
  }

  form;

  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  componentDidMount() {
    const { evaluationPagination } = this.props;
    this.handleEvaluationList(evaluationPagination);
  }

  /**
   * handleEvaluationList - 查询评标方法列表
   */
  @Bind()
  handleEvaluationList(page = {}) {
    const { dispatch, tenantId } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());

    dispatch({
      type: 'evaluation/queryEvaluationList',
      payload: {
        tenantId,
        page,
        ...filterValues,
      },
    });
  }

  /**
   * handleEdit - 编辑
   * @param {*} record -当前行
   */
  @Bind()
  handleEdit(record = {}) {
    this.setState({
      drawerVisible: true,
      initDrawerData: record,
      drawerStatus: 'EDIT',
    });
  }

  /**
   * handleCreate - 新建
   */
  @Bind()
  handleCreate() {
    this.setState({
      drawerVisible: true,
      initDrawerData: {},
      drawerStatus: 'Create',
    });
  }

  /**
   * handleClose - 关闭抽屉
   */
  @Bind()
  handleClose() {
    this.setState({
      drawerVisible: false,
      initDrawerData: {},
    });
  }

  /**
   * createEvaluation - 新建评标方法
   */
  @Bind()
  createEvaluation(data, callback) {
    const { dispatch, tenantId, evaluationPagination } = this.props;
    dispatch({
      type: 'evaluation/evaluationSave',
      payload: {
        tenantId,
        ...data,
      },
    }).then(res => {
      if (res) {
        callback();
        notification.success();
        this.handleEvaluationList(evaluationPagination);
      }
    });
  }

  render() {
    const { drawerVisible, drawerStatus, initDrawerData = {} } = this.state;
    const { evaluationList, evaluationPagination, tableLoading, drawerLoading } = this.props;
    const columns = [
      {
        title: intl.get(`${promptCode}.view.evaluation.evalMethodCode`).d('评标方法编码'),
        width: 150,
        dataIndex: 'evalMethodCode',
      },
      {
        title: intl.get(`${promptCode}.view.evaluation.evalMethodName`).d('评标方法名称'),
        width: 150,
        dataIndex: 'evalMethodName',
      },
      {
        title: intl.get(`${promptCode}.view.evaluation.remark`).d('描述'),
        width: 400,
        dataIndex: 'remark',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 100,
        dataIndex: 'enabledFlag',
        render: enableRender,
      },
      {
        title: intl.get(`${promptCode}.view.evaluation.operation`).d('操作'),
        width: 100,
        render: (_, record) => (
          <a onClick={() => this.handleEdit(record)}>
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
        ),
      },
    ];

    const queryProps = {
      handleSearch: this.handleEvaluationList,
      onRef: this.handleBindRef,
    };
    const tableProps = {
      columns,
      loading: tableLoading,
      bordered: true,
      rowKey: 'evalMethodId',
      dataSource: evaluationList.content,
      pagination: evaluationPagination,
      onChange: this.handleEvaluationList,
    };
    const createProps = {
      drawerLoading,
      visible: drawerVisible,
      onClose: this.handleClose,
      drawerStatus,
      initDrawerData,
      createEvaluation: this.createEvaluation,
    };
    return (
      <React.Fragment>
        <Header title={intl.get(`${promptCode}.view.evaluation.operationMethod`).d('评标方法')}>
          <Button icon="plus" type="primary" onClick={this.handleCreate}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <QueryForm {...queryProps} />
          <Table {...tableProps} />
          <Create {...createProps} />
        </Content>
      </React.Fragment>
    );
  }
}
