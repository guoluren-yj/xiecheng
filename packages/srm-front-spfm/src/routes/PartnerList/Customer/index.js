/**
 * index.js - 我的合作伙伴 - 我的客户
 * @date: 2018-10-18
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { Table, Row } from 'hzero-ui';
import { sum, isNumber, isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { SRM_PLATFORM } from '_utils/config';
import { dateRender } from 'utils/renderer';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import FilterForm from './FilterForm';

const tenantId = getCurrentOrganizationId();

@withCustomize({
  unitCode: [
    'SPFM.PARTNER_LIST_CUSTOMER.LIST',
    'SPFM.PARTNER_LIST_CUSTOMER.SEARCH_FORM',
    'SPFM.PARTNER_LIST_CUSTOMER.LIST.BTN_GROUP',
  ],
})
@connect(({ supplier, loading }) => ({
  supplier,
  loading: loading.effects['queryDetail/queryCustomer'],
}))
@formatterCollections({
  code: ['spfm.customer', 'entity.company'],
})
export default class Customer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.fetchCustomer();
  }

  // FilterForm绑定
  @Bind()
  bindForm(form) {
    this.form = form;
  }

  // 查询我的客户数据
  @Bind()
  fetchCustomer(page = {}) {
    const { dispatch } = this.props;
    const filterValues = this.form.getFieldsValue();
    const startDate = filterValues.startDate
      ? moment(filterValues.startDate).format(DEFAULT_DATE_FORMAT)
      : '';
    dispatch({
      type: 'supplier/queryCustomer',
      payload: {
        ...filterValues,
        page,
        tenantId,
        startDate,
        customizeUnitCode: 'SPFM.PARTNER_LIST_CUSTOMER.LIST,SPFM.PARTNER_LIST_CUSTOMER.SEARCH_FORM',
      },
    });
  }

  // 获取导出参数
  @Bind()
  getExportParams() {
    const formValues = isUndefined(this.form) ? {} : this.form.getFieldsValue();
    const { startDate, ...rest } = formValues;
    const params = {
      ...rest,
      startDate: startDate && moment(startDate).format(DEFAULT_DATE_FORMAT),
    };
    return filterNullValueObject(params);
  }

  render() {
    const {
      loading,
      supplier = {},
      customizeTable,
      customizeFilterForm,
      customizeBtnGroup,
      custLoading,
    } = this.props;
    const { customerList = [], customerPagination = {} } = supplier;
    const columns = [
      {
        title: intl.get('spfm.customer.model.customer.customCompanyNum').d('企业编码'),
        width: 120,
        dataIndex: 'customCompanyNum',
      },
      {
        title: intl.get('spfm.customer.model.customer.customCompanyName').d('企业名称'),
        dataIndex: 'customCompanyName',
        // width: 250,
      },
      {
        title: intl
          .get('spfm.customer.model.customer.customUnifiedSocialCode')
          .d('统一社会信用代码'),
        width: 170,
        dataIndex: 'customUnifiedSocialCode',
      },
      {
        title: intl.get('spfm.customer.model.customer.startDate').d('合作开始日期'),
        width: 120,
        dataIndex: 'startDate',
        render: dateRender,
      },
      {
        title: intl.get('entity.company.tag').d('公司'),
        dataIndex: 'supplierCompanyName',
        width: 250,
      },
      {
        title: intl.get('spfm.supplier.model.supplier.platform.privateFlag').d('是否私有化'),
        width: 100,
        dataIndex: 'privateFlag',
        render: (value) =>
          value
            ? intl.get('hzero.common.status.yes').d('是')
            : intl.get('hzero.common.status.no').d('否'),
      },
      {
        title: intl.get('spfm.supplier.model.supplier.platform.thirdPartyFlag').d('是否第三方合作'),
        width: 120,
        dataIndex: 'thirdPartyFlag',
        render: (value) =>
          value
            ? intl.get('hzero.common.status.yes').d('是')
            : intl.get('hzero.common.status.no').d('否'),
      },
      {
        title: intl.get('spfm.supplier.model.supplier.platform.thirdPartyTime').d('第三方合作时间'),
        width: 150,
        dataIndex: 'thirdPartyTime',
        render: dateRender,
      },
      // {
      //   title: intl.get('spfm.customer.model.customer.levelType').d('是否为集团级'),
      //   width: 200,
      //   dataIndex: 'levelTypeFlagMeaning',
      // },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 180;
    const filterProps = {
      fetchList: this.fetchCustomer,
      bindForm: this.bindForm,
      customizeFilterForm,
      code: 'SPFM.PARTNER_LIST_CUSTOMER.SEARCH_FORM',
      custLoading,
    };
    return (
      <React.Fragment>
        <div className="table-list-search">
          <FilterForm {...filterProps} />
        </div>
        <Row style={{ marginBottom: 16, textAlign: 'right' }}>
          {customizeBtnGroup(
            {
              // code: 'SPFM.PARTNER_LIST_CUSTOMER.LIST.BTN_GROUP',
              code: '',
            },
            [
              <ExcelExport
                data-name="export"
                requestUrl={`${SRM_PLATFORM}/v1/${tenantId}/partners/customers/export`}
                queryParams={this.getExportParams()}
                otherButtonProps={{
                  icon: '',
                  style: { marginRight: 8 },
                  permissionList: [
                    {
                      code: 'srm.partner.my-partner.my-partner.ps.customers.export.old',
                      type: 'button',
                      meaning: '我的客户-导出',
                    },
                  ],
                }}
              />,
              <ExcelExportPro
                data-name="exportPro"
                buttonText={intl.get('hzero.common.export.new').d('(新)导出')}
                templateCode="SRM_C_SRM_SPFM_PARTNER_EXPORT" // 导出模板编码
                requestUrl={`${SRM_PLATFORM}/v1/${tenantId}/partners/customers/export`}
                queryParams={this.getExportParams()}
                otherButtonProps={{
                  icon: '',
                  permissionList: [
                    {
                      code: 'srm.partner.my-partner.my-partner.ps.customers.export.new',
                      type: 'button',
                      meaning: '我的客户-导出',
                    },
                  ],
                }}
              />,
            ]
          )}
        </Row>
        {customizeTable(
          {
            code: 'SPFM.PARTNER_LIST_CUSTOMER.LIST',
          },
          <Table
            bordered
            columns={columns}
            dataSource={customerList}
            scroll={{ x: scrollX, y: 'calc(100vh - 386px)' }}
            loading={loading}
            pagination={customerPagination}
            onChange={this.fetchCustomer}
          />
        )}
      </React.Fragment>
    );
  }
}
