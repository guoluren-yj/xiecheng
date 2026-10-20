/**
 * 调查表创建页面
 * @date: 2018-7-25
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import { Form, Button, Table, Modal } from 'hzero-ui';
import { isEmpty, isUndefined, isNumber, sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
// import cacheComponent from 'components/CacheComponent';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { dateTimeRender } from 'utils/renderer';
import { getCurrentOrganizationId, getCurrentUser, filterNullValueObject } from 'utils/utils';
import FilterForm from './FilterForm';

@connect(({ investigationCreate, loading }) => ({
  investigationCreate,
  allLoading:
    loading.effects['investigationCreate/fetchInvestigateList'] ||
    loading.effects['investigationCreate/investigateDelete'] ||
    loading.effects['investigationCreate/investigateRelease'],
}))
@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: [
    'SSLM.INVESTIGATION_CREATE_LIST.TABLE_LIST',
    'SSLM.INVESTIGATION_CREATE_LIST.SEARCH_FORM',
  ],
})
@formatterCollections({ code: ['sslm.investCreate', 'sslm.common'] })
export default class InvestigationList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      organizationId: getCurrentOrganizationId(), // 租户ID
      currentUser: getCurrentUser(), // 用户名
      selectedRows: [], // 多选框选中记录
    };
  }

  componentDidMount() {
    // this.fetchInvestigationList();
    this.resetRows();
  }

  /**
   * 清空勾选框的值
   */
  @Bind()
  resetRows() {
    this.setState({
      selectedRows: [],
    });
  }

  @Bind()
  handleRef(ref = {}) {
    this.setState({ form: (ref.props || {}).form });
  }

  /**
   * 查询调查表列表
   * @param {object} params --查询条件
   * @param {object} pagination --初始查询时的默认参数
   * @param {string} query.getOrganizationId --租户ID
   */
  @Bind()
  fetchInvestigationList(params = {}) {
    const {
      dispatch,
      investigationCreate: { pagination = {} },
    } = this.props;
    const { organizationId, form } = this.state;
    const fieldValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    const { startDate, endDate } = fieldValues;
    dispatch({
      type: 'investigationCreate/fetchInvestigateList',
      payload: {
        organizationId,
        page: isEmpty(params) ? pagination : params,
        ...fieldValues,
        startDate: startDate ? startDate.format(DEFAULT_DATETIME_FORMAT) : undefined,
        endDate: endDate ? endDate.format(DEFAULT_DATETIME_FORMAT) : undefined,
        customizeUnitCode:
          'SSLM.INVESTIGATION_CREATE_LIST.TABLE_LIST,SSLM.INVESTIGATION_CREATE_LIST.SEARCH_FORM',
      },
    });
  }

  /**
   * 保存勾选的数据
   * @param {string} selectedRowKeys --当前勾选数据key
   * @param {object} selectedRows --当前勾选行数据
   */
  @Bind()
  handlerRowSelect(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
    });
  }

  /**
   * 调查表发布
   */
  @Bind()
  handlerInvestigatonRelease() {
    const { dispatch } = this.props;
    const { selectedRows, organizationId } = this.state;
    // 判断勾选框中是否有值
    const selectCopyList = selectedRows.map(item => item.investgHeaderId);
    dispatch({
      type: 'investigationCreate/investigateRelease',
      payload: {
        organizationId,
        body: selectCopyList,
      },
    }).then(res => {
      if (!isEmpty(res)) {
        notification.success();
        this.fetchInvestigationList();
      }
    });
  }

  /**
   * 调查表删除
   */
  @Bind()
  handleDeleteInvetigation() {
    const { dispatch } = this.props;
    const { selectedRows, organizationId } = this.state;
    // 判断是否有勾选值
    const delectList = selectedRows.map(item => item.investgHeaderId);
    dispatch({
      type: 'investigationCreate/investigateDelete',
      payload: {
        organizationId,
        body: delectList,
      },
    }).then(res => {
      if (res) {
        notification.success();
        // 将删除的信息也一并删除
        this.setState({
          selectedRows: [],
        });
        this.fetchInvestigationList();
      }
    });
  }

  /**
   * 调查表确认发布提示框
   */
  @Bind()
  showSaveConfirm() {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.release').d('是否确认发布？'),
      onOk: () => {
        this.handlerInvestigatonRelease();
      },
    });
  }

  /**
   * 调查表删除提示框
   */
  @Bind()
  delecteConfirm() {
    const { allLoading } = this.props;
    const { handleDeleteInvetigation } = this;
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.delete').d('是否确认删除?'),
      onOk() {
        return new Promise(resolve => {
          handleDeleteInvetigation();
          resolve();
        }).catch(() => {});
      },
      onCancel() {},
      confirmLoading: allLoading,
    });
  }

  /**
   * 新建调查表
   */
  @Bind()
  handleAddOption() {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sslm/investigation/create`,
      })
    );
  }

  /**
   * 展开与收起 多条件查询框
   */
  @Bind()
  handleToggle() {
    const {
      dispatch,
      investigationCreate: { display },
    } = this.props;

    dispatch({
      type: 'investigationCreate/updateState',
      payload: {
        display: !display,
      },
    });
  }

  render() {
    const { selectedRows, organizationId, currentUser } = this.state;
    const {
      form,
      allLoading,
      investigationCreate: { list = {}, pagination = {}, display },
      customizeFilterForm,
      customizeTable,
      custLoading,
    } = this.props;
    const columns = [
      {
        title: intl.get('sslm.common.model.investiagte.code').d('调查表编号'),
        width: 150,
        dataIndex: 'investgNumber',
        render: (text, record) => {
          return (
            <Link
              to={`/sslm/investigation/detail?investgHeaderId=${record.investgHeaderId}&investigateTemplateId=${record.investigateTemplateId}`}
            >
              {text}
            </Link>
          );
        },
      },
      {
        title: intl.get('sslm.common.model.investigate.status').d('调查表状态'),
        width: 100,
        dataIndex: 'processStatusMeaning',
      },
      {
        title: intl.get('sslm.common.view.supplier.code').d('供应商编码'),
        width: 120,
        dataIndex: 'partnerCompanyNum',
      },
      {
        title: intl.get('sslm.common.view.supplier.name').d('供应商名称'),
        dataIndex: 'supplierZhOrEnCompanyNum',
      },
      {
        title: intl.get('sslm.common.view.company.name').d('公司'),
        width: 200,
        dataIndex: 'companyName',
      },
      {
        title: intl.get('sslm.common.model.investigate.type').d('调查表类型'),
        width: 100,
        dataIndex: 'investigateTypeMeaning',
      },
      {
        title: intl.get('sslm.common.model.investigate.level').d('调查表管控维度'),
        width: 150,
        dataIndex: 'investigateLevelMeaning',
      },
      {
        title: intl.get('sslm.common.model.investigate.template.code').d('调查表模板代码'),
        width: 150,
        dataIndex: 'templateCode',
      },
      {
        title: intl.get('sslm.common.model.investigate.template.name').d('调查表模板名称'),
        width: 150,
        dataIndex: 'templateName',
      },
      {
        title: intl.get('sslm.common.view.creator.name').d('创建人'),
        width: 100,
        dataIndex: 'createUserName',
      },
      {
        title: intl.get('sslm.investCreate.model.investCreate.createDate').d('创建时间'),
        width: 160,
        dataIndex: 'createDate',
        render: dateTimeRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 80,
        dataIndex: 'option',
        render: (text, record) => {
          return (
            <Link
              to={`/sslm/investigation/detail?investgHeaderId=${record.investgHeaderId}&investigateTemplateId=${record.investigateTemplateId}`}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </Link>
          );
        },
      },
    ];

    const filterProps = {
      form,
      display,
      currentUser,
      organizationId,
      onHandleToggle: this.handleToggle,
      onRef: this.handleRef,
      onFetchInvestigationList: this.fetchInvestigationList,
      custLoading,
      customizeFilterForm,
      code: 'SSLM.INVESTIGATION_CREATE_LIST.SEARCH_FORM',
    };

    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));
    return (
      <React.Fragment>
        <Header
          title={intl.get(`sslm.investCreate.view.investCreate.parentHeader`).d('调查表创建及发布')}
        >
          <Button icon="plus" type="primary" onClick={this.handleAddOption} loading={allLoading}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button
            icon="rocket"
            onClick={this.showSaveConfirm}
            loading={allLoading}
            disabled={selectedRows.length < 1}
          >
            {intl.get('hzero.common.button.release').d('发布')}
          </Button>
          <Button
            icon="delete"
            onClick={this.delecteConfirm}
            loading={allLoading}
            disabled={selectedRows.length < 1}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
        </Header>
        <Content>
          <FilterForm {...filterProps} />
          {customizeTable(
            {
              code: 'SSLM.INVESTIGATION_CREATE_LIST.TABLE_LIST',
            },
            <Table
              bordered
              ref={node => {
                this.tableList = node;
              }}
              loading={allLoading}
              columns={columns}
              rowKey="investgHeaderId"
              dataSource={list.content}
              pagination={pagination}
              onChange={page => this.fetchInvestigationList(page)}
              rowSelection={{
                selectedRowKeys: selectedRows.map(n => n.investgHeaderId),
                onChange: this.handlerRowSelect,
              }}
              scroll={{ x: scrollX }}
              custLoading={custLoading}
            />
          )}
        </Content>
      </React.Fragment>
    );
  }
}
