import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import { isUndefined, isEmpty } from 'lodash';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import { SRM_SQAM } from '_utils/config';
import { stringify } from 'querystring';

import intl from 'utils/intl';
// import notification from 'utils/notification';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId, getCurrentUser } from 'utils/utils';

import FilterForm from './FilterForm';
import ListTable from './ListTable';

const customizeUnitCodes = [
  'SQAM.RECEIVED_CLAIM_FORM_LIST.FILTER',
  'SQAM.RECEIVED_CLAIM_FORM_LIST.GRID',
].join();

@connect(({ myReceivedClaimForm, loading }) => ({
  myReceivedClaimForm,
  loading: {
    searchLoading: loading.effects['myReceivedClaimForm/fetchReceivedClaim'],
  },
}))
@formatterCollections({
  code: [
    'sqam.common',
    'hzero.common',
    'entity.business',
    'entity.supplier',
    'entity.item',
    'entity.company',
    'entity.organization',
    'entity.roles',
  ],
})
export default class MyReceivedClaimForm extends PureComponent {
  form;

  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      tenantId: getCurrentOrganizationId(),
      supplierTenantId: getCurrentUser().organizationId,
    };
  }

  /**
   * componentDidMount 生命周期函数
   * render()执行后获取页面数据
   */
  componentDidMount() {
    this.handleSearch();
    this.fetchEnum();
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'myReceivedClaimForm/init',
    });
  }

  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  handlePrint() {
    // 打印相关的逻辑
    const { dispatch, match = {} } = this.props;
    const { params = {} } = match;
    dispatch({
      type: 'myReceivedClaimForm/print',
      poHeaderId: params.id,
    }).then((res) => {
      if (res) {
        const file = new Blob([res], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const printWindow = window.open(fileURL);
        if (printWindow?.print) {
          printWindow.print();
        }
      }
    });
  }

  @Bind()
  handleToDetail(record = {}) {
    // 跳转至详情页
    const { dispatch } = this.props;
    const { formHeaderId, supplierTenantId } = record;
    dispatch(
      routerRedux.push({
        pathname: `/sqam/my-received-claim-form/detail`,
        search: formHeaderId ? stringify({ formHeaderId, supplierTenantId }) : {},
      })
    );
  }

  @Bind()
  handleSearch(fields = {}) {
    const { dispatch } = this.props;
    const { supplierTenantId, tenantId } = this.state;
    let filterValues = {};
    if (!isUndefined(this.form)) {
      const val = this.form.getFieldsValue() || {};
      const { statusCode, ...formValue } = val;
      const values = {
        ...formValue,
        creationDateFrom:
          formValue.creationDateFrom && formValue.creationDateFrom.format(DATETIME_MIN),
        creationDateTo: formValue.creationDateTo && formValue.creationDateTo.format(DATETIME_MAX),
        feedbackDateFrom:
          formValue.feedbackDateFrom && formValue.feedbackDateFrom.format(DATETIME_MIN),
        feedbackDateTo: formValue.feedbackDateTo && formValue.feedbackDateTo.format(DATETIME_MAX),
        claimStatusList: statusCode,
      };
      filterValues = filterNullValueObject(values);
    }
    dispatch({
      type: 'myReceivedClaimForm/fetchReceivedClaim',
      payload: {
        tenantId,
        supplierTenantId,
        page: isEmpty(fields) ? {} : fields,
        ...filterValues,
        customizeUnitCode: customizeUnitCodes,
      },
    });
    this.setState({ selectedRowKeys: [] });
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    let filterValues = {};
    if (!isUndefined(this.form)) {
      const { supplierTenantId, tenantId } = this.state;
      const formValue = this.form.getFieldsValue();
      const { statusCode, ...val } = formValue;
      const values = {
        ...val,
        supplierTenantId,
        tenantId,
        creationDateFrom:
          formValue.creationDateFrom && formValue.creationDateFrom.format(DATETIME_MIN),
        creationDateTo: formValue.creationDateTo && formValue.creationDateTo.format(DATETIME_MAX),
        feedbackDateFrom:
          formValue.feedbackDateFrom && formValue.feedbackDateFrom.format(DATETIME_MIN),
        feedbackDateTo: formValue.feedbackDateTo && formValue.feedbackDateTo.format(DATETIME_MAX),
        claimStatusList: statusCode,
      };
      filterValues = filterNullValueObject(values);
    }
    return {
      ...filterValues,
      customizeUnitCode: customizeUnitCodes,
    };
  }

  /**
   * 设置选中行
   * @param {Array} selectedRowKeys
   */
  @Bind()
  onRowSelectChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  render() {
    const {
      loading,
      myReceivedClaimForm: { list = [], pagination = {}, enumMap = {} },
    } = this.props;
    const { tenantId, selectedRowKeys } = this.state;

    const filterProps = {
      enumMap,
      tenantId,
      onRef: this.handleBindRef,
      onSearch: this.handleSearch,
    };

    const listProps = {
      pagination,
      selectedRowKeys,
      loading: loading.searchLoading,
      dataSource: list,
      onSearch: this.handleSearch,
      onDetail: this.handleToDetail,
      onRowSelectChange: this.onRowSelectChange,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get('sqam.common.view.message.title.receivedClaimForm').d('我收到的索赔单')}
        >
          <ExcelExportPro
            otherButtonProps={{
              icon: 'unarchive',
              type: 'c7n-pro',
              funcType: 'flat',
              style: {
                border: '0.01rem solid rgba(0, 0, 0, 0.2)',
              },
              permissionList: [
                {
                  code: `srm.sqam.business.cliam.feedback.receiced.claim.ps.newexport`,
                  type: 'button',
                },
              ],
            }}
            requestUrl={`${SRM_SQAM}/v1/${tenantId}/claim-form/supplier/page/export/new`}
            queryParams={this.handleGetFormValue()}
            buttonText={intl.get('hzero.common.button.newExport').d('(新)导出')}
            templateCode="SQAM_CLAIM_FORM_HEADER_SUPPLIER_EXPORT"
            method="POST"
            allBody
          />
          <ExcelExport
            otherButtonProps={{
              icon: 'unarchive',
              type: 'c7n-pro',
              funcType: 'flat',
              style: {
                border: '0.01rem solid rgba(0, 0, 0, 0.2)',
              },
              permissionList: [
                {
                  code: `srm.sqam.business.cliam.feedback.receiced.claim.ps.export`,
                  type: 'button',
                },
              ],
            }}
            requestUrl={`${SRM_SQAM}/v1/${tenantId}/claim-form/supplier/page/export`}
            queryParams={this.handleGetFormValue()}
            method="POST"
            allBody
          />
        </Header>
        <Content>
          <FilterForm {...filterProps} />
          <ListTable {...listProps} />
        </Content>
      </React.Fragment>
    );
  }
}
