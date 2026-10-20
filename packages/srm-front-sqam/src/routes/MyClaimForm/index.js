import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import { isUndefined, isArray, isEmpty, throttle } from 'lodash';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import { SRM_SQAM } from '_utils/config';
import { stringify } from 'querystring';
import remotes from 'hzero-front/lib/utils/remote';
// import moment from 'moment';
import intl from 'utils/intl';
import notification from 'utils/notification';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { Button as PermissionButton } from 'components/Permission';

import FilterForm from './FilterForm';
import ListTable from './ListTable';

const customizeUnitCodes = ['SQAM.CLAIM_FORM_LIST.FILTER', 'SQAM.CLAIM_FORM_LIST.GRID'].join();

@remotes({
  code: 'SQAM_MY_CLAIM_FORM_LIST_CUX',
  name: 'remote',
})
@connect(({ myClaimForm, loading }) => ({
  myClaimForm,
  loading: {
    search: loading.effects['myClaimForm/searchMyClaimForm'],
    // release: loading.effects['create8D/release8D'],
    // delete: loading.effects['create8D/delete8D'],
  },
  syncLoading: loading.effects['myClaimForm/myClaimFormSync'],
  syncExternalLoading: loading.effects['myClaimForm/myClaimFormSync'],
  tenantId: getCurrentOrganizationId(),
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
    'ssta.common',
  ],
})
@withCustomize({
  unitCode: ['SQAM.CLAIM_FORM_LIST.FILTER'],
})
export default class MyClaimForm extends PureComponent {
  form;

  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
    };
  }

  /**
   * componentDidMount 生命周期函数
   * render()执行后获取页面数据
   */
  componentDidMount() {
    this.fetchEnum(); // 查询值集
  }

  componentDidUpdate(prevProps) {
    if (prevProps.custLoading && !this.props.custLoading) {
      this.handleSearch();
    }
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'myClaimForm/init',
    });
  }

  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  handleToDetail(record = {}) {
    // 跳转至详情页
    const { dispatch } = this.props;
    const { formHeaderId } = record;
    dispatch(
      routerRedux.push({
        pathname: `/sqam/my-claim-form/detail`,
        search: formHeaderId ? stringify({ formHeaderId }) : {},
      })
    );
  }

  @Bind()
  handleSearch(fields = {}) {
    const { dispatch, tenantId } = this.props;
    let filterValues = {};
    if (!isUndefined(this.form)) {
      const formValue = this.form.getFieldsValue();
      const { supplierCompanyIdStash, statusCode, ...vals } = formValue || {};
      const values = {
        ...vals,
        supplierCompanyId: supplierCompanyIdStash,
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
      type: 'myClaimForm/searchMyClaimForm',
      payload: {
        tenantId,
        page: isEmpty(fields) ? {} : fields,
        ...filterValues,
        customizeUnitCode: customizeUnitCodes,
      },
    });
    this.setState({ selectedRowKeys: [], selectedRows: [] });
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    const { selectedRowKeys } = this.state;
    let filterValues = {};
    if (!isUndefined(this.form)) {
      const { tenantId } = this.props;
      const formValue = this.form.getFieldsValue();
      const { supplierCompanyIdStash, statusCode, ...vals } = formValue || {};
      const values = {
        ...vals,
        supplierCompanyId: supplierCompanyIdStash,
        tenantId,
        creationDateFrom:
          formValue.creationDateFrom && formValue.creationDateFrom.format(DATETIME_MIN),
        creationDateTo: formValue.creationDateTo && formValue.creationDateTo.format(DATETIME_MAX),
        feedbackDateFrom:
          formValue.feedbackDateFrom && formValue.feedbackDateFrom.format(DATETIME_MIN),
        feedbackDateTo: formValue.feedbackDateTo && formValue.feedbackDateTo.format(DATETIME_MAX),
        formHeaderIds: selectedRowKeys.length === 0 ? undefined : selectedRowKeys,
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
  onRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows });
  }

  /**
   *
   * @returns 同步选中行
   */
  @Bind()
  handleSync() {
    const { dispatch } = this.props;
    const { selectedRowKeys } = this.state;
    dispatch({
      type: 'myClaimForm/myClaimFormSync',
      payload: selectedRowKeys,
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearch();
      }
    });
  }

  @Bind()
  handleSyncExternal() {
    const { dispatch } = this.props;
    const { selectedRowKeys } = this.state;
    dispatch({
      type: 'myClaimForm/myClaimFormSyncExternal',
      payload: selectedRowKeys,
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearch();
      }
    });
  }

  render() {
    const {
      syncExternalLoading,
      syncLoading,
      loading,
      tenantId,
      customizeFilterForm,
      myClaimForm: { list = [], pagination = {}, enumMap = {} },
      remote: remoteProps,
    } = this.props;
    const { selectedRowKeys = [], syncFlag, selectedRows } = this.state;
    const filterProps = {
      enumMap,
      tenantId, 
      customizeFilterForm,
      onRef: this.handleBindRef,
      onSearch: this.handleSearch,
    };
    const listProps = {
      pagination,
      selectedRowKeys,
      remote:remoteProps,
      loading: loading.search,
      dataSource: list,
      onSearch: this.handleSearch,
      onDetail: this.handleToDetail,
      onSelectRow: this.onRowSelectChange,
    };
    const isLoading = loading?.search || syncExternalLoading || syncLoading;
    return (
      <React.Fragment>
        <Header title={intl.get(`sqam.common.view.title.myClaimForm`).d('我的索赔单')}>
          <PermissionButton
            permissionList={[
              {
                code: `srm.sqam.business.claim.my.claim.button.syncExternal`,
                type: 'button',
              },
            ]}
            icon="sync"
            disabled={isEmpty(selectedRowKeys)}
            onClick={throttle(this.handleSyncExternal, 1500, { trailing: false })}
            loading={isLoading}
          >
            {intl.get('sqam.common.model.common.syncExternal').d('同步外部系统')}
          </PermissionButton>
          <PermissionButton
            icon="sync"
            disabled={(isArray(selectedRowKeys) && isEmpty(selectedRowKeys)) || syncFlag}
            loading={isLoading}
            onClick={throttle(this.handleSync, 1500, { trailing: false })}
            permissionList={[
              {
                code: `srm.sqam.business.claim.my.claim.button.syncSettle`,
                type: 'button',
              },
            ]}
          >
            {intl.get(`sqam.common.model.common.syncSettle`).d('同步结算平台')}
          </PermissionButton>
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
                  code: `srm.sqam.business.claim.my.claim.ps.newexport`,
                  type: 'button',
                },
              ],
              loading: isLoading,
            }}
            requestUrl={`${SRM_SQAM}/v1/${tenantId}/claim-form/purchase/page/export/new`}
            queryParams={this.handleGetFormValue()}
            buttonText={
              selectedRowKeys.length > 0
                ? intl.get('hzero.common.button.newSelectedExport').d('(新)勾选导出')
                : intl.get('hzero.common.button.newExport').d('(新)导出')
            }
            templateCode="SQAM_CLAIM_FORM_HEADER_PURCHASER_EXPORT"
            method="POST"
            allBody
          />
          <ExcelExport
            buttonText={
              selectedRowKeys.length === 0
                ? intl.get(`hzero.common.view.title.marmotDownloadButton`).d('导出')
                : intl.get(`hzero.common.button.exportSelect`).d('勾选导出')
            }
            otherButtonProps={{
              icon: 'unarchive',
              type: 'c7n-pro',
              funcType: 'flat',
              style: {
                border: '0.01rem solid rgba(0, 0, 0, 0.2)',
              },
              permissionList: [
                {
                  code: `srm.sqam.business.claim.my.claim.ps.export`,
                  type: 'button',
                },
              ],
              loading: isLoading,
            }}
            requestUrl={`${SRM_SQAM}/v1/${tenantId}/claim-form/purchase/page/export`}
            queryParams={this.handleGetFormValue()}
            method="POST"
            allBody
          />
          {remoteProps
            ? remoteProps.process('SQAM_MY_CLAIM_FORM_LIST_CUX_BTNS', '', {
                loading: isLoading,
                selectedRowKeys,
                selectedRows,
                handleSearch: this.handleSearch,
              })
            : ''}
        </Header> 
        <Content>
          <FilterForm {...filterProps} />
          <ListTable {...listProps} />
        </Content>
      </React.Fragment>
    );
  }
}
