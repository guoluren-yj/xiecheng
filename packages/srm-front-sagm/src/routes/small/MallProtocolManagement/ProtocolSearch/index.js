import React, { Component } from 'react';
import { Button, Table, Popover, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { isUndefined, isEmpty, sum } from 'lodash';
import { withRouter } from 'react-router';

import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';
import { dateRender } from 'utils/renderer';
import intl from 'utils/intl';
import notification from 'utils/notification';
import SearchForm from './SearchForm';
import SearchModal from './SearchModal.js';
import AsyncButton from '@/components/AsyncButton';
import style from '../index.less';
@connect(({ mallProtocolManagement, loading }) => ({
  mallProtocolManagement,
  fetchLoading: loading.effects['mallProtocolManagement/fetcthProtocolData'],
  terminateLoading: loading.effects['mallProtocolManagement/terminateAgreement'],
}))
@withRouter
export default class ProtocolSearch extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      selectedRows: [],
      selectedRowKeys: [],
      display: false,
      dataValue: {},
    };
  }

  searchForm;

  rightForm;

  componentDidMount() {
    this.fetcthProtocolData();
    if (this.searchForm || this.rightForm) {
      this.searchForm.resetFields();
      this.rightForm.resetFields();
    }
  }

  @Bind()
  handleOpen() {
    this.setState({ display: true });
  }

  @Bind()
  handleHidden() {
    this.setState({ display: false });
  }

  @Bind()
  fetcthProtocolData(page = { page: 0, size: 10 }) {
    const { dispatch } = this.props;
    const filterValue = isUndefined(this.searchForm) ? {} : this.searchForm.getFieldsValue();
    const filterRightValue = isUndefined(this.rightForm) ? {} : this.rightForm.getFieldsValue();
    const params = {
      tenantId: getCurrentOrganizationId(),
      page: isEmpty(page) ? {} : page,
      ...filterValue,
      ...filterRightValue,
      validDateFrom:
        filterRightValue.validDateFrom && filterRightValue.validDateFrom.format(DATETIME_MIN),
      validDateTo:
        filterRightValue.validDateTo && filterRightValue.validDateTo.format(DATETIME_MAX),
      creationDateFrom:
        filterRightValue.creationDateFrom && filterRightValue.creationDateFrom.format(DATETIME_MIN),
      creationDateTo:
        filterRightValue.creationDateTo && filterRightValue.creationDateTo.format(DATETIME_MAX),
      // releaseDateFrom:
      //   filterRightValue.releaseDateFrom && filterRightValue.releaseDateFrom.format(DATETIME_MIN),
      // releaseDateTo:
      //   filterRightValue.releaseDateTo && filterRightValue.releaseDateTo.format(DATETIME_MAX),
    };
    dispatch({
      type: 'mallProtocolManagement/fetcthProtocolData',
      payload: params,
    });
  }

  @Bind()
  handleRef(ref = {}) {
    this.searchForm = (ref || {}).props.form;
  }

  @Bind()
  handleRightRef(ref = {}) {
    this.rightForm = (ref || {}).props.form;
  }

  /**
   * 保存勾选的数据
   * @param {string} selectedRowKeys --当前勾选数据key
   * @param {object} selectedRows --当前勾选行数据
   */
  @Bind()
  handlerRowSelect(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  }

  @Bind()
  handleToNew(record) {
    if (record.agreementStatus === 'NEW') {
      this.props.history.push(
        `/small/mall-protocol-management/handwork?agreementId=${record.agreementId}`
      );
    } else {
      this.props.history.push({
        pathname: `/small/mall-protocol-management/check-detail/${record.agreementId}`,
      });
    }
  }

  @Bind()
  terminateAgreement(list) {
    const { dispatch } = this.props;
    dispatch({
      type: 'mallProtocolManagement/terminateAgreement',
      payload: list,
    }).then((res) => {
      if (res) {
        notification.success();
        this.setState({
          selectedRowKeys: [],
          selectedRows: [],
        });
        this.fetcthProtocolData();
      }
    });
  }

  @Bind()
  handleSubmit(list) {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const isOtherStatus = selectedRows.some((s) => s.agreementStatus !== 'NEW');
    if (isOtherStatus) {
      notification.error({
        message: intl
          .get('small.common.view.message.submitStatusLimit')
          .d('只有新建状态的协议才能被提交'),
      });
      return false;
    }
    return dispatch({
      type: 'mallProtocolManagement/bacthSubmitAgreement',
      payload: list,
    }).then((res) => {
      if (res) {
        const { status, message } = res;
        // 0失败  1 全部成功   2 部分成功
        const info = { message };
        if (status === 1) {
          notification.success(info);
        } else if (status === 2) {
          notification.warning(info);
        } else {
          notification.error(info);
        }
        this.setState({
          selectedRowKeys: [],
          selectedRows: [],
        });
        this.fetcthProtocolData();
      }
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
    if (type) {
      this.searchForm.resetFields();
      this.rightForm.resetFields();
    } else {
      this.searchForm.setFieldsValue(newDataValue);
      this.rightForm.setFieldsValue(newDataValue);
    }
  }

  render() {
    const {
      mallProtocolManagement: { headPagination = {}, protocolHead = [] },
      activeKey,
      fetchLoading,
      terminateLoading,
    } = this.props;
    const { selectedRowKeys, selectedRows, display, dataValue } = this.state;
    const columns = [
      {
        title: intl.get(`small.common.view.status`).d('状态'),
        dataIndex: 'agreementStatusMeaning',
        align: 'center',
        width: 80,
        render: (val, record) => {
          const { rejectRemark, submitErrorMessageMeaning } = record;
          return (
            <Col>
              <Row>{val}</Row>
              {rejectRemark && (
                <Row>
                  <Popover placement="top" content={rejectRemark}>
                    <a>{intl.get('small.common.view.rejectReason').d('拒绝原因')}</a>
                  </Popover>
                </Row>
              )}
              {submitErrorMessageMeaning && (
                <Row>
                  <Popover placement="top" content={submitErrorMessageMeaning}>
                    <a>{intl.get('small.common.view.submitFail').d('提交失败')}</a>
                  </Popover>
                </Row>
              )}
            </Col>
          );
        },
      },
      {
        title: intl.get(`small.common.view.agreementInfo`).d('协议信息'),
        dataIndex: 'agreementInfo',
        className: style['agreement-table'],
        width: 220,
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
                {<a onClick={() => this.handleToNew(record)}>{agreementNumber}</a>}
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
        title: intl.get('small.common.model.supplierAndPurchaser').d('供采公司'),
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
        width: 200,
        render: (_, record) => {
          const { sourceFromMeaning, sourceFromNumber } = record;
          return (
            <div className={style['product-info']}>
              <p>
                {intl.get('small.common.model.documentSource').d('单据来源')}：{sourceFromMeaning}
              </p>
              <p>
                {intl.get('small.mallProtocolManagement.model.sourceFromNum').d('来源单号')}：
                {sourceFromNumber || ''}
              </p>
            </div>
          );
        },
      },
      {
        title: intl.get('small.common.model.otherInfo').d('其他信息'),
        dataIndex: 'otherInfo',
        className: style['agreement-table'],
        width: 200,
        render: (_, record) => {
          const { materialTypeMeaning, paymentTypeMeaning } = record;
          return (
            <div className={style['product-info']}>
              <p>
                {intl.get('small.common.model.materialType').d('物资类型')}：{materialTypeMeaning}
              </p>
              <p>
                {intl.get('small.common.model.paymentMethod').d('支付方式')}：{paymentTypeMeaning}
              </p>
            </div>
          );
        },
      },
    ];
    const publishList = selectedRows.filter((n) => n.agreementStatus === 'PUBLISHED');
    const newList = selectedRows.filter((n) => n.agreementStatus === 'NEW');
    const scrollWidth = sum(columns.map((n) => n.width));
    return (
      <React.Fragment>
        <SearchForm
          onRef={this.handleRef}
          onSearch={this.fetcthProtocolData}
          activeKey={activeKey}
          display={display}
          onOpen={this.handleOpen}
          onHidden={this.handleHidden}
          onReset={() => this.rightForm.resetFields()}
          dataValue={dataValue}
          onHandleChange={this.handleChange}
        />
        <div className="table-operator">
          <Button
            disabled={publishList.length === 0}
            loading={terminateLoading}
            onClick={() => this.terminateAgreement(publishList)}
          >
            {intl.get('small.common.model.stop').d('终止')}
          </Button>
          <AsyncButton disabled={newList.length === 0} onClick={() => this.handleSubmit(newList)}>
            {intl.get('hzero.common.button.submit').d('提交')}
          </AsyncButton>
        </div>
        <Table
          bordered
          rowKey="agreementId"
          loading={fetchLoading}
          columns={columns}
          rowSelection={{
            selectedRowKeys,
            onChange: this.handlerRowSelect,
          }}
          scroll={{ x: scrollWidth }}
          pagination={headPagination}
          dataSource={protocolHead}
          onChange={(page) => this.fetcthProtocolData(page)}
        />

        <SearchModal
          onRef={this.handleRightRef}
          display={display}
          onCancel={this.handleCancel}
          onSearch={this.fetcthProtocolData}
          activeKey={activeKey}
          onOpen={this.handleOpen}
          onHidden={this.handleHidden}
          dataValue={dataValue}
          onHandleChange={this.handleChange}
        />
      </React.Fragment>
    );
  }
}
