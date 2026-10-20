/*
 * PurchaseOrderTracking - 采购订单跟踪报表
 * @date: 2020/02/27 14:45:33
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Form } from 'hzero-ui';
import moment from 'moment';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { getCurrentOrganizationId, getDateTimeFormat } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import DynamicButtons from '_components/DynamicButtons';

import List from './List';
import Search from './Search';

@withCustomize({
  unitCode: [
    'SODR.ORDER_TRACKING_LIST.LIST',
    'SODR.ORDER_TRACKING_LIST.SEARCH',
    'SODR.ORDER_TRACKING_LIST.BUTTONS',
  ],
})
@connect(({ loading, purchaseOrderTracking }) => ({
  fetchListLoading: loading.effects['purchaseOrderTracking/fetchList'],
  purchaseOrderTracking,
}))
@formatterCollections({
  code: ['component.docFlow', 'sodr.common', 'entity.company', 'entity.supplier', 'hzero.common'],
})
@Form.create({ fieldNameProp: null })
export default class PurchaseOrderTracking extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: getCurrentOrganizationId(),
    };
  }

  componentDidMount() {
    // this.fetchList();
    this.props.dispatch({
      type: 'purchaseOrderTracking/init',
    });
  }

  componentDidUpdate(prevProps) {
    const { custLoading } = this.props;
    if (!custLoading && prevProps.custLoading !== custLoading) {
      this.fetchList();
    }
  }

  // 查询列表数据
  @Bind()
  fetchList(page = {}, isChangePage = false) {
    const {
      dispatch,
      purchaseOrderTracking: {
        trackingPagination: { total },
      },
    } = this.props;
    const values = this.formatValues();
    const payload = {
      page,
      ...values,
      customizeUnitCode: 'SODR.ORDER_TRACKING_LIST.LIST,SODR.ORDER_TRACKING_LIST.SEARCH',
      asyncCountFlag: 'DEFAULT',
      ...(isChangePage ? { oldTotalElements: total } : null),
    };
    dispatch({
      type: 'purchaseOrderTracking/fetchList',
      payload,
    }).then((res) => {
      if (res && res.needCountFlag === 'Y') {
        dispatch({
          type: 'purchaseOrderTracking/fetchListPage',
          payload,
        });
      }
    });
  }

  // 查询条件格式化
  @Bind()
  formatValues() {
    const { form } = this.props;
    const values = form.getFieldsValue();
    const { releasedDateStart, releasedDateEnd } = values;
    return {
      ...values,
      releasedDateStart: releasedDateStart
        ? moment(releasedDateStart).format(getDateTimeFormat())
        : undefined,
      releasedDateEnd: releasedDateEnd
        ? moment(releasedDateEnd).format(getDateTimeFormat())
        : undefined,
      displaySupplierName: undefined,
    };
  }

  // 选中行onChange
  @Bind()
  onSelectedChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  /**
   *
   * @returns 个性化按钮组
   */
  @Bind()
  getButtons() {
    const { customizeBtnGroup } = this.props;
    const { selectedRowKeys = [], tenantId } = this.state;
    const headerBtnsRender = [
      {
        name: 'exportPro',
        btnComp: ExcelExportPro,
        child: selectedRowKeys.length
          ? intl.get(`hzero.common.button.newSelectedExport`).d('(新)勾选导出')
          : intl.get(`hzero.common.button.newExport`).d('(新)导出'),
        childFor: 'buttonText',
        btnProps: {
          templateCode: 'SRM_C_SODR_TRACK_REPORT_PO_LINE_LOCATION',
          exportAsync: true,
          otherButtonProps: {
            icon: 'unarchive',
            permissionList: [
              {
                code: 'srm.po-admin.report.tracking.ps.button.export',
                type: 'c7n-pro',
                meaning: '采购订单跟踪报表-新版导出',
              },
            ],
          },
          requestUrl: `/spuc/v1/${tenantId}/po-location/order-tracking-report/export/new-module`,
          queryParams: selectedRowKeys.length
            ? { poLineLocationIds: selectedRowKeys }
            : this.formatValues(),
        },
      },
      {
        name: 'export',
        btnComp: ExcelExport,
        child: intl.get(`hzero.common.export`).d('导出'),
        childFor: 'buttonText',
        btnProps: {
          requestUrl: `/spuc/v1/${tenantId}/po-location/order-tracking-report/export`,
          queryParams: this.formatValues(),
        },
      },
      {
        name: 'checkExport',
        btnComp: ExcelExport,
        child: intl.get(`sodr.common.view.tab.checkExport`).d('勾选导出'),
        childFor: 'buttonText',
        btnProps: {
          otherButtonProps: {
            disabled: isEmpty(selectedRowKeys),
          },
          requestUrl: `/spuc/v1/${tenantId}/po-location/order-tracking-report/export`,
          queryParams: { poLineLocationIds: selectedRowKeys },
        },
      },
    ];
    return customizeBtnGroup(
      { code: 'SODR.ORDER_TRACKING_LIST.BUTTONS', pro: true },
      <DynamicButtons buttons={headerBtnsRender} />
    );
  }

  render() {
    const { tenantId, selectedRowKeys = [] } = this.state;
    const {
      form,
      fetchListLoading,
      purchaseOrderTracking,
      customizeTable,
      customizeFilterForm,
    } = this.props;
    const { trackingList, trackingPagination, enumMap } = purchaseOrderTracking;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectedChange,
    };
    const searchProps = {
      form,
      enumMap,
      tenantId,
      customizeFilterForm,
      fetchList: this.fetchList,
    };
    const listProps = {
      trackingList,
      rowSelection,
      customizeTable,
      fetchListLoading,
      trackingPagination,
      fetchList: this.fetchList,
    };
    return (
      <Fragment>
        <Header
          title={intl.get('sodr.common.view.title.orderTrackingReport').d('采购订单跟踪报表')}
        >
          {this.getButtons()}
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
        </Content>
      </Fragment>
    );
  }
}
