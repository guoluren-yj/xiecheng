import React, { Component } from 'react';
import { Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { isUndefined, isEmpty, sum } from 'lodash';
import { withRouter } from 'react-router';

import { dateRender } from 'utils/renderer';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
import ExcelExport from 'components/ExcelExport';
import DynamicButtons from '_components/DynamicButtons';
import ExcelExportPro from 'components/ExcelExportPro';

import SearchForm from './SearchForm';
import SearchModal from './SearchModal.js';
import { protManageBtns } from '../../const/uniCode';
import style from '../index.less';

@connect(({ mallProtocolManagement, loading }) => ({
  mallProtocolManagement,
  fetchLoading: loading.effects['mallProtocolManagement/fetcthHistoryData'],
}))
@withRouter
export default class ProtocolSearch extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      display: false,
      dataValue: {},
    };
  }

  searchForm;

  rightForm;

  componentDidMount() {
    this.fetcthProtocolData();
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
  getFormValues() {
    const filterValue = isUndefined(this.searchForm) ? {} : this.searchForm.getFieldsValue();
    const filterRightValue = isUndefined(this.rightForm) ? {} : this.rightForm.getFieldsValue();
    return {
      ...filterValue,
      ...filterRightValue,
      creationDateFrom:
        filterRightValue.creationDateFrom && filterRightValue.creationDateFrom.format(DATETIME_MIN),
      creationDateTo:
        filterRightValue.creationDateTo && filterRightValue.creationDateTo.format(DATETIME_MAX),
    };
  }

  @Bind()
  fetcthProtocolData(page = { page: 0, size: 10 }) {
    const { dispatch } = this.props;
    const params = {
      tenantId: getCurrentOrganizationId(),
      page: isEmpty(page) ? {} : page,
      ...this.getFormValues(),
    };
    dispatch({
      type: 'mallProtocolManagement/fetcthHistoryData',
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

  @Bind()
  handleToNew(record) {
    this.props.history.push(
      `/small/mall-protocol-management/history-detail/${record.agreementId}/${record.versionNum}`
    );
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
      mallProtocolManagement: { historyVersionPagination = {}, historyVersionList = [] },
      activeKey,
      fetchLoading,
      customizeBtnGroup,
      path,
    } = this.props;
    const { display, dataValue } = this.state;
    const columns = [
      {
        title: intl.get(`small.common.view.status`).d('状态'),
        dataIndex: 'agreementStatusMeaning',
        align: 'center',
        width: 80,
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
                {intl.get('small.common.model.version').d('版本')}：v{versionNum}
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
    const scrollWidth = sum(columns.map((n) => n.width));

    const organizationId = getCurrentOrganizationId();

    const filterParams = filterNullValueObject({
      tenantId: organizationId,
      ...this.getFormValues(),
    });
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
          <ExcelExportPro
            templateCode="SAGM_AGREEMENT_HISTORY_EXPORT"
            buttonText={intl.get('sagm.common.button.exportNew').d('(新)导出')}
            requestUrl={`/sagm/v1/${organizationId}/agreement-line-hiss/export/new`}
            queryParams={filterParams}
            otherButtonProps={{
              icon: 'unarchive',
              type: 'c7n-pro',
              permissionList: [
                {
                  code: `${path}.button.line-his-export-new`,
                  type: 'button',
                  meaning: '商城协议-（新）历史行导出',
                },
              ],
            }}
            exportAsync
          />
          {customizeBtnGroup(
            {
              code: protManageBtns.history,
              // 新版按钮组个性化（必须）
              pro: true,
            },
            <DynamicButtons
              buttons={[
                {
                  name: 'oldExport',
                  btnComp: ExcelExport,
                  btnProps: {
                    requestUrl: `/sagm/v1/${organizationId}/agreement-line-hiss/export`,
                    otherButtonProps: { icon: 'unarchive', type: 'c7n-pro' },
                    queryParams: filterParams,
                    exportAsync: true,
                  },
                },
              ]}
            />
          )}
        </div>

        <Table
          bordered
          rowKey="agreementIdVersion"
          loading={fetchLoading}
          columns={columns}
          scroll={{ x: scrollWidth }}
          pagination={historyVersionPagination}
          dataSource={historyVersionList.map((h) => ({
            ...h,
            agreementIdVersion: `${h.agreementId}-${h.versionNum}`,
          }))}
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
