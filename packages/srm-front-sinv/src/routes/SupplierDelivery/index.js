/**
 * SupplierDeliver - 供应商送货单列表查询
 * @date: 2018-12-07
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Tabs, Button, Icon, Tooltip } from 'hzero-ui';
import { connect } from 'dva';
import { Bind, Debounce } from 'lodash-decorators';
import { isEmpty, isArray } from 'lodash';
import qs from 'querystring';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import notification from 'utils/notification';
import { SRM_SPUC } from '_utils/config';
import DynamicButtons from '_components/DynamicButtons';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, filterNullValueObject, getResponse } from 'utils/utils';
import { DATETIME_MIN, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import DeliveryList from './List';
import DetailSearch from './DetailSearch';
import { globalPrint } from '@/routes/components/utils';
import styles from './index.less';

const { TabPane } = Tabs;

/**
 * 供应商送货单列表查询
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} supplierDelivery - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@withCustomize({
  unitCode: [
    'SINV.SUPPLIER_DELIVERY_LIST.GRID',
    'SINV.SUPPLIER_DELIVERY_LIST.GRID_BY_DETAIL',
    'SINV.SUPPLIER_DELIVERY_LIST.QUERY',
    'SINV.SUPPLIER_DELIVERY_LIST.QUERY_BY_DETAIL',
    'SINV.SUPPLIER_DELIVERY_LIST.LIST.BTN',
    'SINV.SUPPLIER_DELIVERY_LIST.DETAIL.BTN',
  ],
})
@formatterCollections({
  code: [
    'sinv.supplierDelivery',
    'sinv.purchaserDelivery',
    'sinv.deliveryClosed',
    'sinv.common',
    'entity.supplier',
    'entity.customer',
    'entity.organization',
    'entity.roles',
    'entity.attachment',
    'entity.company',
    'entity.item',
    'hzero.common',
    'entity.business',
    'sinv.receiptExecution',
  ],
})
@connect(({ loading, supplierDelivery }) => ({
  loadingList: loading.effects['supplierDelivery/queryDeliveryList'],
  loadingDetailList: loading.effects['supplierDelivery/queryDeliveryDetailList'],
  loadingOperation: loading.effects['supplierDelivery/fetchOperationList'],
  loadingPrint: loading.effects['supplierDelivery/printList'],
  loadingNewPrint: loading.effects['supplierDelivery/newPrintList'],
  supplierDelivery,
}))
export default class SupplierDeliver extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = props;
    const { activeKey } = qs.parse(search.substr(1));
    this.state = {
      activeKey: activeKey || 'list', // 当前tabs的活动页
      tenantId: getCurrentOrganizationId(),
      selectedListRows: [],
      selectedListRowKeys: [], // 列表选中主键
      selectedLinesRowKeys: [], // 明细行选中主键
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierDelivery/fetchEnum',
    });
  }

  componentDidUpdate(prevProps) {
    const {
      custLoading,
      location: { pathname = '', search = '' },
    } = this.props;
    const isJump = pathname.includes('/sinv/supplier-delivery/list') && search;
    if (
      (isJump && prevProps.location.search !== search) ||
      (prevProps.custLoading !== custLoading && prevProps.custLoading)
    ) {
      if (this.state.activeKey !== 'detail' && this.state.activeKey !== 'list') {
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({ activeKey: 'list' });
      }
      this.handleSearchList();
    }
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  handleFormCondition(filterValues) {
    const dealTime = {};
    const dateArray = ['creationDateFrom', 'creationDateTo', 'shipDateFrom', 'shipDateTo'];
    const dateTimeArray = ['expectedArriveDateFrom', 'expectedArriveDateTo'];
    dateArray.forEach((item) => {
      dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
    });
    dateTimeArray.forEach((item) => {
      dealTime[item] = filterValues[item]
        ? filterValues[item].format(DEFAULT_DATETIME_FORMAT)
        : undefined;
    });
    return {
      ...filterValues,
      ...dealTime,
    };
  }

  /**
   * 根据当前tab来请求对应的列表
   * @param {Object} fields
   */
  @Bind()
  handleSearch(fields = {}, callback) {
    const { activeKey } = this.state;
    if (activeKey === 'list') {
      this.handleSearchList(fields);
    } else {
      this.handleSearchDetailList(fields, callback);
    }
  }

  /**
   * 配送单列表查询
   * @param {Object} [page={}] 分页数据
   */
  @Bind()
  handleSearchList(page = {}) {
    const { dispatch } = this.props;
    const fieldsValue =
      (this.listForm && filterNullValueObject(this.listForm.searchForm.getFieldsValue())) || {};
    const handleFormValues = this.handleFormCondition(fieldsValue);
    const { expectedArriveDateFrom, expectedArriveDateTo } = fieldsValue;
    if (
      expectedArriveDateFrom &&
      expectedArriveDateTo &&
      expectedArriveDateTo.isBefore(expectedArriveDateFrom, 'time')
    ) {
      notification.warning({
        message: intl.get('hzero.common.validation.date.after', {
          startDate: intl
            .get(`sinv.common.model.common.expectedArriveDateFrom`)
            .d('预计到货日期从'),
          endDate: intl.get(`sinv.common.model.common.expectedArriveDateTo`).d('预计到货日期至'),
        }),
      });
    } else {
      dispatch({
        type: 'supplierDelivery/queryDeliveryList',
        payload: {
          page,
          unReadMessageFlag: 1,
          customizeUnitCode: 'SINV.SUPPLIER_DELIVERY_LIST.QUERY,SINV.SUPPLIER_DELIVERY_LIST.GRID',
          ...handleFormValues,
        },
      });
    }
  }

  /**
   * 明细行查询
   * @param {Object} [page={}] 分页数据
   */
  @Bind()
  handleSearchDetailList(page = {}, callback) {
    const { dispatch } = this.props;
    const fieldsValue =
      (this.detailForm && filterNullValueObject(this.detailForm.searchForm.getFieldsValue())) || {};
    const handleFormValues = this.handleFormCondition(fieldsValue);
    const { expectedArriveDateFrom, expectedArriveDateTo } = fieldsValue;
    if (
      expectedArriveDateFrom &&
      expectedArriveDateTo &&
      expectedArriveDateTo.isBefore(expectedArriveDateFrom, 'time')
    ) {
      notification.warning({
        message: intl
          .get('hzero.common.validation.date.after', {
            startDate: intl
              .get(`sinv.common.model.common.expectedArriveDateFrom`)
              .d('预计到货日期从'),
            endDate: intl.get(`sinv.common.model.common.expectedArriveDateTo`).d('预计到货日期至'),
          })
          .d('到货日期从不晚于到货日期至'),
      });
    } else {
      dispatch({
        type: 'supplierDelivery/queryDeliveryDetailList',
        payload: {
          page,
          customizeUnitCode:
            'SINV.SUPPLIER_DELIVERY_LIST.GRID_BY_DETAIL,SINV.SUPPLIER_DELIVERY_LIST.QUERY_BY_DETAIL',
          ...handleFormValues,
        },
      }).then((res) => {
        if (getResponse(res)) {
          callback(res.content || []);
        }
      });
    }
  }

  /**
   * 查询操作记录
   * @param {Object, Number} { page = {}, asnHeaderId } // 分页参数 头id
   * @returns Promise
   */
  @Bind()
  handleSearchOperation({ page = {}, asnHeaderId }) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'supplierDelivery/fetchOperationList',
      payload: {
        page,
        asnHeaderId,
      },
    });
  }

  /**
   * 打印功能
   */
  @Bind()
  @Debounce(400)
  handlePrint() {
    const { dispatch } = this.props;
    const { selectedListRowKeys, selectedListRows } = this.state;
    const asnHeaderIdList = selectedListRowKeys;
    const asnNum = selectedListRows.filter((n) => n.printStatusFlag === 0).map((m) => m.asnNum)[0];
    const disabledFlag = selectedListRows.some((n) => n.printStatusFlag === 0);
    const dataList = (
      <ul style={{ margin: 0, padding: 0 }}>
        <li>{`${asnNum}${intl.get(`sinv.supplierDelivery.view.notPrint`).d(`不可打印`)}`}</li>
      </ul>
    );
    if (disabledFlag) {
      notification.warning({
        message: dataList,
      });
    } else {
      dispatch({
        type: 'supplierDelivery/printList',
        asnHeaderIdList,
      }).then((res) => {
        globalPrint(res);
      });
    }
  }

  /**
   * 打印功能
   */
  @Bind()
  @Debounce(400)
  newHandlePrint() {
    const { dispatch } = this.props;
    const { selectedListRows, activeKey } = this.state;
    const asnHeaderIdList = selectedListRows;
    const asnNum = selectedListRows.filter((n) => n.printStatusFlag === 0).map((m) => m.asnNum)[0];
    const disabledFlag = selectedListRows.some((n) => n.printStatusFlag === 0);
    const dataList = (
      <ul style={{ margin: 0, padding: 0 }}>
        <li>{`${asnNum}${intl.get(`sinv.supplierDelivery.view.notPrint`).d(`不可打印`)}`}</li>
      </ul>
    );
    // activeKey === null 先不启用校验功能，等待产品后续更新，根据需求修改逻辑
    if (disabledFlag && activeKey === null) {
      notification.warning({
        message: dataList,
      });
    } else {
      dispatch({
        type: 'supplierDelivery/newPrintList',
        asnHeaderIdList,
      }).then((res) => {
        globalPrint(res);
      });
    }
  }

  /**
   * 修改列表和详情列表的选中的主键
   * @param {string} key //主键对应的key
   * @param {String} selectedRowKeys //选中主键
   */
  @Bind()
  handleChangeRowKeys(key, selectedRowKeys, selectedRows) {
    const { dispatch, supplierDelivery } = this.props;
    if (key === 'selectedListRowKeys') {
      // 个性化二开使用 列表
      const cuzAsnList = supplierDelivery.deliveryList.map((i) => {
        i.cuz_selected = selectedRowKeys.includes(i.asnHeaderId); // eslint-disable-line
        return i;
      });

      if (cuzAsnList.length) {
        dispatch({
          type: 'supplierDelivery/updateState',
          payload: {
            deliveryList: cuzAsnList,
          },
        });
      }
    } else {
      // 个性化二开使用 明细
      const cuzAsnList = supplierDelivery.deliveryDetailList.map((i) => {
        i.cuz_selected = selectedRowKeys.includes(i.asnLineId); // eslint-disable-line
        return i;
      });

      if (cuzAsnList.length) {
        dispatch({
          type: 'supplierDelivery/updateState',
          payload: {
            deliveryDetailList: cuzAsnList,
          },
        });
      }
    }

    this.setState({ [key]: selectedRowKeys, selectedListRows: selectedRows });
  }

  /**
   * tab改变回调
   * @param {String} activeKey // 当前活动的tab
   */
  @Bind()
  handleTabsChange(activeKey) {
    this.setState({ activeKey, selectedListRows: [] });
  }

  // 按钮
  @Bind()
  headerBtns() {
    const { activeKey, tenantId, selectedListRowKeys, selectedLinesRowKeys } = this.state;
    const { loadingPrint, loadingNewPrint } = this.props;
    const listFields = this.listForm ? this.listForm.searchForm.getFieldsValue() : {};
    const listQueryCondition = this.handleFormCondition(listFields);
    const detailFields = this.detailForm ? this.detailForm.searchForm.getFieldsValue() : {};
    const detailQueryCondition = this.handleFormCondition(detailFields);
    const asnHeaderIds = selectedListRowKeys.join(',');
    const asnLineIds = selectedLinesRowKeys.join(',');
    const otherButtonProps = {
      icon: 'export',
    };
    const listCheckExportBtnProps = {
      icon: 'export',
      disabled: isArray(selectedListRowKeys) && isEmpty(selectedListRowKeys),
    };
    const detailCheckExportBtnProps = {
      icon: 'export',
      disabled: isArray(selectedLinesRowKeys) && isEmpty(selectedLinesRowKeys),
    };
    const btns = [
      activeKey === 'list' && {
        name: 'newPrint',
        group: true,
        child: (
          <Tooltip
            style={{ marginLeft: 8 }}
            placement="bottomRight"
            title={intl
              .get('sinv.supplierDelivery.view.message.newPrintMessage')
              .d(
                '当点击打印出现【未能加载 PDF 文档】时，说明单据未取到对应的打印模板，请联系客户方检查配置后重试'
              )}
          >
            <Button
              style={{ marginLeft: 8 }}
              onClick={this.newHandlePrint}
              loading={loadingNewPrint}
              disabled={isArray(selectedListRowKeys) && isEmpty(selectedListRowKeys)}
            >
              {intl.get('hzero.common.button.newPrint').d('打印（新）')}
              <Icon type="question-circle-o" />
            </Button>
          </Tooltip>
        ),
      },
      activeKey === 'list' && {
        name: 'print',
        group: true,
        child: (
          <Button
            onClick={this.handlePrint}
            loading={loadingPrint}
            disabled={isArray(selectedListRowKeys) && isEmpty(selectedListRowKeys)}
          >
            {intl.get('hzero.common.button.print').d('打印')}
          </Button>
        ),
      },
      activeKey === 'list' && {
        name: 'newExport',
        group: true,
        child: (
          <ExcelExportPro
            otherButtonProps={{
              icon: 'unarchive',
              type: 'c7n-pro',
              // funcType: 'flat',
              permissionList: [
                {
                  code: 'srm.logistics.delivery.supplier-delivery.ps.button.newexport',
                  type: 'c7n-pro',
                  funcType: 'flat',
                },
              ],
            }}
            buttonText={
              listCheckExportBtnProps.disabled
                ? intl.get(`sinv.purchaserDelivery.view.button.newExport`).d('新版导出')
                : intl.get(`sinv.purchaserDelivery.view.button.newCheckExport`).d('新版勾选导出')
            }
            requestUrl={`${SRM_SPUC}/v1/${tenantId}/asn-header/for-supplier/export`}
            queryParams={listCheckExportBtnProps.disabled ? listQueryCondition : { asnHeaderIds }}
            templateCode="SPUC_SINV_ASN_HEADER_EXPORT"
          />
        ),
      },
      activeKey === 'list' && {
        name: 'export',
        group: true,
        child: (
          <ExcelExport
            otherButtonProps={otherButtonProps}
            requestUrl={`${SRM_SPUC}/v1/${tenantId}/asn-header/for-supplier/export`}
            queryParams={listQueryCondition}
          />
        ),
      },
      activeKey === 'list' && {
        name: 'selectExport',
        group: true,
        child: (
          <ExcelExport
            buttonText={intl.get(`sinv.purchaserDelivery.view.button.checkExport`).d('勾选导出')}
            otherButtonProps={listCheckExportBtnProps}
            requestUrl={`${SRM_SPUC}/v1/${tenantId}/asn-header/for-supplier/export`}
            queryParams={{ asnHeaderIds }}
          />
        ),
      },
      // activeKey !== 'list' && {
      //   name: 'newPrint',
      //   group: true,
      //   child: (
      //     <Tooltip
      //       style={{ marginLeft: 8 }}
      //       placement="bottomRight"
      //       title={intl
      //         .get('sinv.supplierDelivery.view.message.newPrintMessage')
      //         .d(
      //           '当点击打印出现【未能加载 PDF 文档】时，说明单据未取到对应的打印模板，请联系客户方检查配置后重试'
      //         )}
      //     >
      //       <Button
      //         onClick={this.newHandlePrint}
      //         loading={loadingNewPrint}
      //         disabled={isArray(selectedLinesRowKeys) && isEmpty(selectedLinesRowKeys)}
      //       >
      //         {intl.get('hzero.common.button.newPrint').d('打印（新）')}
      //         <Icon type="question-circle-o" />
      //       </Button>
      //     </Tooltip>
      //   ),
      // },
      activeKey !== 'list' && {
        name: 'newExport',
        group: true,
        child: (
          <ExcelExportPro
            data-name="newExport"
            otherButtonProps={{
              icon: 'unarchive',
              type: 'c7n-pro',
              // funcType: 'flat',
              permissionList: [
                {
                  code: 'srm.logistics.delivery.supplier-delivery.ps.button.line.newexport',
                  type: 'c7n-pro',
                  // funcType: 'flat',
                },
              ],
            }}
            buttonText={
              detailCheckExportBtnProps.disabled
                ? intl.get(`sinv.purchaserDelivery.view.button.newExport`).d('新版导出')
                : intl.get(`sinv.purchaserDelivery.view.button.newCheckExport`).d('新版勾选导出')
            }
            requestUrl={`${SRM_SPUC}/v1/${tenantId}/asn-header/lines/for-supplier/export-new`}
            queryParams={detailCheckExportBtnProps.disabled ? detailQueryCondition : { asnLineIds }}
            templateCode="SPUC_SINV_ASN_HEADER_DETAIL"
          />
        ),
      },
      activeKey !== 'list' && {
        name: 'export',
        group: true,
        child: (
          <ExcelExport
            otherButtonProps={otherButtonProps}
            requestUrl={`${SRM_SPUC}/v1/${tenantId}/asn-header/lines/for-supplier/export`}
            queryParams={detailQueryCondition}
          />
        ),
      },
      activeKey !== 'list' && {
        name: 'selectExport',
        group: true,
        child: (
          <ExcelExport
            buttonText={intl.get(`sinv.purchaserDelivery.view.button.checkExport`).d('勾选导出')}
            otherButtonProps={detailCheckExportBtnProps}
            requestUrl={`${SRM_SPUC}/v1/${tenantId}/asn-header/lines/for-supplier/export`}
            queryParams={{ asnLineIds }}
          />
        ),
      },
    ];
    return btns;
  }

  render() {
    const {
      activeKey,
      // tenantId,
      selectedListRowKeys,
      selectedLinesRowKeys,
      // selectedListRows,
    } = this.state;
    const {
      customizeTable,
      customizeBtnGroup,
      customizeFilterForm,
      supplierDelivery: {
        listPagination,
        deliveryList,
        detailListPagination,
        deliveryDetailList,
        enumMap,
      },
      dispatch,
      loadingList,
      loadingDetailList,
      // loadingPrint,
      loadingOperation,
      // loadingNewPrint,
    } = this.props;
    // const disabledFlag = selectedListRows.some(n => n.printStatusFlag === 0);
    const listRowSelection = {
      selectedRowKeys: selectedListRowKeys,
      onChange: (selectedRowKeys, selectedRows) =>
        this.handleChangeRowKeys('selectedListRowKeys', selectedRowKeys, selectedRows),
    };
    const linesRowSelection = {
      selectedRowKeys: selectedLinesRowKeys,
      onChange: (selectedRowKeys, selectedRows) =>
        this.handleChangeRowKeys('selectedLinesRowKeys', selectedRowKeys, selectedRows),
    };
    const listProps = {
      enumMap,
      dispatch,
      customizeFilterForm,
      customizeTable,
      loadingOperation,
      loading: loadingList,
      dataSource: deliveryList,
      pagination: listPagination,
      onSearch: this.handleSearch,
      rowSelection: listRowSelection,
      onFetchOperation: this.handleSearchOperation,
      onRef: (node) => {
        this.listForm = node;
      },
    };
    const detailProps = {
      enumMap,
      customizeFilterForm,
      customizeTable,
      loading: loadingDetailList,
      dataSource: deliveryDetailList,
      pagination: detailListPagination,
      rowSelection: linesRowSelection,
      onSearch: this.handleSearch,
      onRef: (node) => {
        this.detailForm = node;
      },
    };
    const buttons = this.headerBtns();
    const custCode =
      activeKey === 'list'
        ? `SINV.SUPPLIER_DELIVERY_LIST.LIST.BTN`
        : `SINV.SUPPLIER_DELIVERY_LIST.DETAIL.BTN`;
    return (
      <React.Fragment>
        <Header title={intl.get(`sinv.supplierDelivery.view.message.title`).d('我的送货单')}>
          {customizeBtnGroup({ code: custCode, pro: true }, <DynamicButtons buttons={buttons} />)}
        </Header>
        <Content style={{ paddingTop: 0 }} className={styles.content}>
          <Tabs activeKey={activeKey} onChange={this.handleTabsChange} animated={false}>
            <TabPane
              tab={intl.get(`sinv.supplierDelivery.view.tab.list`).d('送货单查询')}
              key="list"
            >
              <DeliveryList {...listProps} />
            </TabPane>
            <TabPane
              tab={intl.get(`sinv.supplierDelivery.view.tab.detail`).d('按明细查询')}
              key="detail"
            >
              <DetailSearch {...detailProps} />
            </TabPane>
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
