import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import { isUndefined } from 'lodash';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import intl from 'utils/intl';
// import notification from 'utils/notification';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

import FilterForm from './FilterForm';
import ListTable from './ListTable';

@withCustomize({
  unitCode: [
    'SPFM.PORTAL.NOTICESIGN.PUBLISH.LIST.TB',
    'SPFM.PORTAL.NOTICESIGN.PUBLISH.LIST.FILTER',
  ],
})
@connect(({ noticeSign, loading }) => ({
  noticeSign,
  loading: {
    search: loading.effects['noticeSign/fetchNoticeSign'],
  },
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: [
    'spfm.common',
    'entity.customer',
    'hzero.common',
    'entity.business',
    'entity.supplier',
    'entity.item',
    'entity.company',
    'entity.organization',
    'entity.roles',
  ],
})
export default class NoticeSign extends PureComponent {
  form;

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'noticeSign/init',
    });
    this.handleSearch();
  }

  @Bind()
  handleToDetail(record = {}) {
    const { dispatch } = this.props;
    const { notificationReceiveId } = record;
    dispatch(
      routerRedux.push({
        pathname: `/spfm/notice-sign/detail/${notificationReceiveId}`,
      })
    );
  }

  @Bind()
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    let filterValues = {};
    if (!isUndefined(this.filterForm)) {
      const formValue = this.filterForm.getFieldsValue();
      const values = {
        ...formValue,
        creationDateFrom:
          formValue.creationDateFrom && formValue.creationDateFrom.format(DEFAULT_DATETIME_FORMAT),
        creationDateTo:
          formValue.creationDateTo && formValue.creationDateTo.format(DEFAULT_DATETIME_FORMAT),
      };
      filterValues = filterNullValueObject(values);
    }
    dispatch({
      type: 'noticeSign/fetchNoticeSign',
      payload: {
        page,
        ...filterValues,
        customizeUnitCode:
          'SPFM.PORTAL.NOTICESIGN.PUBLISH.LIST.TB,SPFM.PORTAL.NOTICESIGN.PUBLISH.LIST.FILTER',
      },
    });
  }

  render() {
    const {
      loading,
      tenantId,
      noticeSign: { dataSource = [], pagination = {}, enumMap = {} },
      customizeTable,
      customizeFilterForm,
    } = this.props;
    const filterProps = {
      enumMap,
      tenantId,
      customizeFilterForm,
      onRef: (ref) => {
        this.filterForm = ref.props.form;
      },
      onSearch: this.handleSearch,
    };

    const listProps = {
      pagination,
      dataSource,
      customizeTable,
      loading: loading.search,
      onSearch: this.handleSearch,
      onDetail: this.handleToDetail,
    };
    return (
      <React.Fragment>
        <Header title={intl.get(`spfm.common.view.title.businessNotice`).d('业务通知单')} />
        <Content>
          <FilterForm {...filterProps} />
          <ListTable {...listProps} />
        </Content>
      </React.Fragment>
    );
  }
}
