import React, { Component } from 'react';
import { Button, Table } from 'hzero-ui';
import { Bind, Throttle } from 'lodash-decorators';
import { connect } from 'dva';
import { isUndefined } from 'lodash';

import intl from 'utils/intl';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { dateRender } from 'utils/renderer';
import { Header, Content } from 'components/Page';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';

import { ApproveSearch, PublishSearch } from './SearchForm';
import { ApproveDrawer, PublishDrawer } from './SearchModal';
import dataChangeReq from './dataChangeReq';
import style from './index.less';

@formatterCollections({
  code: [
    'small.common',
    'small.productPublish',
    'small.mallAgreementApprove',
    'small.mallProtocolManagement',
  ],
})
@connect(({ mallAgreementApprove, loading }) => ({
  mallAgreementApprove,
  loading: loading.effects['mallAgreementApprove/fetchAgreementList'],
  approveLoading: loading.effects['mallAgreementApprove/agreementApprove'],
  rejectLoading: loading.effects['mallAgreementApprove/agreementReject'],
  publishLoading: loading.effects['mallAgreementApprove/agreementPublish'],
}))
export default class MallAgreementApprove extends Component {
  constructor(props) {
    super(props);
    this.state = {
      display: false,
      isApprove: props.location.pathname.indexOf('approve') !== -1,
      selectedRows: [],
      selectedRowKeys: [],
      dataValue: {},
    };
  }

  componentDidMount() {
    this.fetchMapCode();
    this.fetchAgreementList();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const isApprove = nextProps.location.pathname.indexOf('approve') !== -1;
    if (isApprove !== prevState.isApprove) {
      return {
        isApprove,
      };
    }
    return null;
  }

  @Bind
  fetchMapCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'mallAgreementApprove/queryMapIdpValue',
    });
  }

  @Bind()
  fetchAgreementList(page) {
    const { dispatch } = this.props;
    const { isApprove } = this.state;
    const filterValue = isUndefined(this.form) ? {} : this.form.getFieldsValue();
    const filterRightValue = isUndefined(this.rightForm) ? {} : this.rightForm.getFieldsValue();
    const formValues = {
      ...filterNullValueObject(filterValue),
      ...filterNullValueObject(filterRightValue),
    };
    dispatch({
      type: 'mallAgreementApprove/fetchAgreementList',
      payload: {
        isApprove,
        ...formValues,
        agreementStatus: isApprove ? 'SUBMITTED' : 'APPROVED',
        creationDateFrom:
          formValues.creationDateFrom && formValues.creationDateFrom.format(DATETIME_MIN),
        creationDateTo: formValues.creationDateTo && formValues.creationDateTo.format(DATETIME_MAX),
        tenantId: getCurrentOrganizationId(),
        page,
      },
    });
  }

  @Bind()
  handleOK() {
    this.setState(
      {
        display: false,
      },
      () => this.fetchAgreementList()
    );
  }

  @Bind()
  handleSelect(keys, rows) {
    this.setState({
      selectedRowKeys: keys,
      selectedRows: rows,
    });
  }

  form;

  rightForm;

  /**
   * 绑定查询表单form
   * @param {Object} ref 表单组件实例
   */
  @Bind()
  handleBindRef(ref) {
    this.form = ref.props.form || {};
  }

  @Bind()
  handleRightRef(ref) {
    this.rightForm = ref.props.form || {};
  }

  /**
   * 取消
   */
  @Bind()
  handleCancel() {
    this.setState({
      display: false,
    });
  }

  /**
   * 多查询条件展示
   */
  @Bind()
  toggleForm() {
    const { display } = this.state;
    this.setState({
      display: !display,
    });
  }

  @Bind()
  handleEdit(record) {
    const { history } = this.props;
    const { isApprove } = this.state;
    history.push(
      `/small/mall-agreement-${isApprove ? 'approve' : 'publish'}/detail/${record.agreementId}`
    );
  }

  @Bind()
  @Throttle(1000)
  handleApproveAndReject(type) {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    dataChangeReq({ type, dispatch, data: selectedRows }, () => {
      this.setState({
        selectedRows: [],
        selectedRowKeys: [],
      });
      this.fetchAgreementList();
    });
  }

  @Bind()
  handleChange(params, type) {
    const { dataValue } = this.state;
    const newDataValue = {
      ...dataValue,
      ...params,
    };
    this.setState({
      dataValue: newDataValue,
    });
    if (type) this.form.resetFields();
    this.form.setFieldsValue(newDataValue);
    this.rightForm.setFieldsValue(newDataValue);
  }

  render() {
    const { display, selectedRowKeys, isApprove, dataValue } = this.state;
    const {
      loading,
      approveLoading,
      rejectLoading,
      publishLoading,
      mallAgreementApprove: {
        [isApprove ? 'agreementApproveList' : 'agreementPublishList']: agreementList = [],
        [isApprove ? 'approvePagination' : 'publishPagination']: pagination = {},
        agreementStatus,
        materialType,
        agreementType,
        paymentType,
        sourceFrom,
      },
    } = this.props;

    const rightKey = isApprove
      ? 'small/mall-agreement-approve/right'
      : 'small/mall-agreement-publish/right';

    const searchProps = {
      display,
      dataValue,
      onRef: this.handleBindRef,
      onSearch: this.handleOK,
      onOpen: this.toggleForm,
      onHidden: this.toggleForm,
      onHandleChange: this.handleChange,
      onReset: () => this.rightForm.resetFields(),
    };

    const rightProps = {
      display,
      dataValue,
      agreementStatus,
      materialType,
      agreementType,
      paymentType,
      sourceFrom,
      cacheKey: rightKey,
      onRef: this.handleRightRef,
      onOk: this.handleOK,
      onCancel: this.handleCancel,
      onHandleChange: this.handleChange,
    };
    const columns = [
      {
        title: intl.get(`small.common.view.status`).d('状态'),
        dataIndex: 'agreementStatusMeaning',
        align: 'center',
        width: 90,
      },
      {
        title: intl.get(`small.common.view.agreementInfo`).d('协议信息'),
        dataIndex: 'agreementInfo',
        className: style['agreement-table'],
        width: 240,
        render: (_, record) => {
          const {
            versionNum,
            creationDate,
            agreementName,
            agreementNumber,
            agreementTypeMeaning,
          } = record;
          return (
            <div className={style['product-info']}>
              <p>
                {intl.get('small.common.model.agreementNum').d('协议编号')}：
                {<a onClick={() => this.handleEdit(record)}>{agreementNumber}</a>}
              </p>
              <p>
                {intl.get('small.common.model.agreementName').d('协议名称')}：{agreementName}
              </p>
              <p>
                {intl.get('small.common.model.agreementType').d('协议类型')}：{agreementTypeMeaning}
              </p>
              <p>
                {intl.get('small.common.model.version').d('版本')}：
                {versionNum ? `v${versionNum}` : '-'}
              </p>
              <p>
                {intl.get('small.common.model.creationDate').d('创建日期')}：
                {dateRender(creationDate)}
              </p>
            </div>
          );
        },
      },
      {
        title: intl.get('small.common.view.supplierPurCompany').d('供采公司'),
        dataIndex: 'company',
        className: style['agreement-table'],
        width: 250,
        render: (_, record) => {
          const { companyName, supplierCompanyName } = record;
          return (
            <div className={style['product-info']}>
              <p>
                {intl.get('small.common.model.pur').d('采')}：{companyName}
              </p>
              <p>
                {intl.get('small.common.model.sup').d('供')}：{supplierCompanyName}
              </p>
            </div>
          );
        },
      },
      {
        title: intl.get('small.common.model.agreementSourceFrom').d('协议来源'),
        dataIndex: 'sourceFrom',
        className: style['agreement-table'],
        width: 170,
        render: (_, record) => {
          const { sourceFromMeaning, sourceFromNumber } = record;
          return (
            <div className={style['product-info']}>
              <p>
                {intl.get('small.common.model.documentSource').d('单据来源')}：{sourceFromMeaning}
              </p>
              <p>
                {intl.get('small.mallProtocolManagement.model.sourceFromNum').d('来源单号')}：
                {sourceFromNumber}
              </p>
            </div>
          );
        },
      },
      {
        title: intl.get('small.common.model.materialType').d('物资类型'),
        dataIndex: 'materialTypeMeaning',
        width: 110,
      },
    ];
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleSelect,
      // getCheckboxProps: record => ({ disabled: record.status !== 'SUBMITTED' }),
    };
    const approveTittle = intl
      .get('small.mallAgreementApprove.view.approveTitle')
      .d('商城协议审批');
    const publishTittle = intl
      .get('small.mallAgreementApprove.view.publishTitle')
      .d('商城协议发布');
    return (
      <React.Fragment>
        <Header title={isApprove ? approveTittle : publishTittle}>
          {isApprove ? (
            <>
              <Button
                icon="check"
                type="primary"
                loading={approveLoading}
                disabled={selectedRowKeys.length === 0}
                onClick={() => this.handleApproveAndReject('approve')}
              >
                {intl.get('small.common.model.pass').d('通过')}
              </Button>
              <Button
                icon="close"
                loading={rejectLoading}
                disabled={selectedRowKeys.length === 0}
                onClick={() => this.handleApproveAndReject('reject')}
              >
                {intl.get('hzero.common.button.refuse').d('拒绝')}
              </Button>
            </>
          ) : (
            <Button
              icon="check"
              type="primary"
              loading={publishLoading}
              disabled={selectedRowKeys.length === 0}
              onClick={() => this.handleApproveAndReject('publish')}
            >
              {intl.get('hzero.common.button.publish').d('发布')}
            </Button>
          )}
        </Header>
        <Content>
          {isApprove ? <ApproveSearch {...searchProps} /> : <PublishSearch {...searchProps} />}
          <Table
            bordered
            loading={loading}
            rowKey="agreementId"
            dataSource={agreementList}
            rowSelection={rowSelection}
            columns={columns}
            pagination={pagination}
            onChange={(page) => this.fetchAgreementList(page)}
          />
        </Content>
        {isApprove ? <ApproveDrawer {...rightProps} /> : <PublishDrawer {...rightProps} />}
      </React.Fragment>
    );
  }
}
