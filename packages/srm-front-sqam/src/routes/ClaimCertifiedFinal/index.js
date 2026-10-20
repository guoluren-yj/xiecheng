import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import { isUndefined, isEmpty } from 'lodash';
import { Header, Content } from 'components/Page';
// import ExcelExport from 'components/ExcelExport';
// import { SRM_SQAM } from '_utils/config';
import { stringify } from 'querystring';

import intl from 'utils/intl'; 
import remotes from 'hzero-front/lib/utils/remote';
// import notification from 'utils/notification';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

import FilterForm from './FilterForm';
import ListTable from './ListTable';

@remotes({
  code:"SQAM_CLAIM_CERTIFIED_FINAL_LIST",
  name:"remote",
})
@connect(({ claimCertifiedFinal, loading }) => ({
  claimCertifiedFinal,
  loading: {
    search: loading.effects['claimCertifiedFinal/searchMyClaimForm'],
    // release: loading.effects['create8D/release8D'],
    // delete: loading.effects['create8D/delete8D'],
  },
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
  ],
})
export default class MyClaimForm extends PureComponent {
  form;

  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRows:[],
    };
  }

  /**
   * componentDidMount 生命周期函数
   * render()执行后获取页面数据
   */
  componentDidMount() {
    this.fetchEnum(); // 查询值集
    this.handleSearch();
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'claimCertifiedFinal/init',
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
        pathname: `/sqam/claim-certified-final/detail`,
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
      const { supplierCompanyIdStash, ...vals } = formValue;
      const values = {
        ...vals,
        supplierCompanyId: supplierCompanyIdStash,
        creationDateFrom:
          formValue.creationDateFrom && formValue.creationDateFrom.format(DATETIME_MIN),
        creationDateTo: formValue.creationDateTo && formValue.creationDateTo.format(DATETIME_MAX),
        feedbackDateFrom:
          formValue.feedbackDateFrom && formValue.feedbackDateFrom.format(DATETIME_MIN),
        feedbackDateTo: formValue.feedbackDateTo && formValue.feedbackDateTo.format(DATETIME_MAX),
      };
      filterValues = filterNullValueObject(values);
    }
    dispatch({
      type: 'claimCertifiedFinal/searchMyClaimForm',
      payload: {
        tenantId,
        page: isEmpty(fields) ? {} : fields,
        ...filterValues,
        customizeUnitCode: 'SQAM.CLAIM_FORM_LIST.FILTER,SQAM.CLAIM_CERTIFIED_LIST.LIST',
      },
    });
    this.setState({ selectedRowKeys: [],selectedRows:[] });
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    let filterValues = {};
    if (!isUndefined(this.form)) {
      const formValue = this.form.getFieldsValue();
      const values = {
        ...formValue,
        creationDateFrom:
          formValue.creationDateFrom && formValue.creationDateFrom.format(DATETIME_MIN),
        creationDateTo: formValue.creationDateTo && formValue.creationDateTo.format(DATETIME_MAX),
        feedbackDateFrom:
          formValue.feedbackDateFrom && formValue.feedbackDateFrom.format(DATETIME_MIN),
        feedbackDateTo: formValue.feedbackDateTo && formValue.feedbackDateTo.format(DATETIME_MAX),
      };
      filterValues = filterNullValueObject(values);
    }
    return filterValues;
  }

  /**
   * 设置选中行
   * @param {Array} selectedRowKeys
   */
  @Bind()
  onRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows });
  }

  render() {
    const {
      remote,
      loading,
      tenantId,
      claimCertifiedFinal: { list = [], pagination = {}, enumMap = {} },
    } = this.props;
    const { selectedRowKeys, selectedRows } = this.state;
    const filterProps = {
      enumMap,
      tenantId,
      onRef: this.handleBindRef,
      onSearch: this.handleSearch,
    };

    const listProps = {
      remote,
      pagination,
      selectedRowKeys,
      loading: loading.search,
      dataSource: list,
      onSearch: this.handleSearch,
      onDetail: this.handleToDetail,
      onRowSelectChange: this.onRowSelectChange,
    };
    return (
      <React.Fragment>
        <Header title={intl.get(`sqam.common.view.title.claimCertifiedFinal`).d('索赔结果管理')}>
          {/* <ExcelExport
            otherButtonProps={{
              type: 'primary',
            }}
            requestUrl={`${SRM_SQAM}/v1/${tenantId}/claim-form/purchase/page/export`}
            queryParams={this.handleGetFormValue()}
          /> */}
          {remote.process("SQAM_CLAIM_CERTIFIED_FINAL_LIST_BTNS",null,{selectedRows,selectedRowKeys,onSearch: this.handleSearch})}
        </Header>
        <Content>
          <FilterForm {...filterProps} />
          <ListTable {...listProps} />
        </Content>
      </React.Fragment>
    );
  }
}
