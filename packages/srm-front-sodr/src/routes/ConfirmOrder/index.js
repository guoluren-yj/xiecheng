/*
 * ConfirmOrder - 订单确认
 * @date: 2018/10/16 10:09:34
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Button, Modal, Spin } from 'hzero-ui';
import { connect } from 'dva';
import { isArray, isEmpty, forEach, unionWith, uniqWith, throttle } from 'lodash';
import { routerRedux } from 'dva/router';
import { Bind, Throttle } from 'lodash-decorators';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId, getCurrentUser, filterNullValueObject } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { DATETIME_MIN } from 'utils/constants';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import List from './List';
import Search from './Search';
import { BUCKET_NAME, THROTTLE_TIME } from '@/routes/components/utils/constant';

const messagePrompt = 'sodr.confirmOrder.view.message';
// const buttonPrompt = 'sodr.view.button';
/**
 * 订单确认
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} invitationList - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@withCustomize({
  unitCode: [
    'SODR.CONFIRM_ORDER_LIST.GRID',
    'SODR.CONFIRM_ORDER_LIST.FILTER',
    'SODR.CONFIRM_ORDER_LIST.BUTTONS',
  ],
})
@formatterCollections({
  code: ['sodr.confirmOrder', 'sodr.common', 'entity.order', 'entity.customer', 'entity.business'],
})
@connect(({ loading, confirmOrder }) => ({
  loadingList: loading.effects['confirmOrder/queryList'],
  confirming: loading.effects['confirmOrder/sure'],
  confirmOrder,
  supplierTenantId: getCurrentUser().organizationId,
}))
export default class ConfirmOrder extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedListRows: [],
      tenantId: getCurrentOrganizationId(),
      setting: '0',
    };
  }

  componentDidMount() {
    const {
      location: { state: { _back, statusCode } = {} },
      confirmOrder: { listPagination = {} },
      custLoading,
    } = this.props;
    if (_back !== -1) {
      this.props.dispatch({
        type: 'confirmOrder/init',
      });
      if (statusCode && this.filterForm) {
        this.filterForm.setFieldsValue({ statusCode });
      }
    }
    if (!custLoading) this.handleSearch(_back === -1 ? listPagination : undefined);
    this.fetchSettings();
  }

  componentDidUpdate(prevProps) {
    const {
      custLoading,
      location: { state: { _back, statusCode } = {} },
      confirmOrder: { listPagination = {} },
    } = this.props;
    const statusCodeChange = prevProps.location.state?.statusCode !== statusCode && statusCode;
    const custLoadingChange = prevProps.custLoading !== custLoading && !custLoading;
    if (custLoadingChange || statusCodeChange) {
      const initSearch = _back === -1 ? listPagination : undefined;
      if (this.filterForm) {
        this.filterForm.setFieldsValue({ statusCode });
      }
      this.handleSearch({ ...initSearch });
    }
  }

  @Bind()
  handleTimeFormat(filterValues) {
    const { statusCode, ...otherValues } = filterValues;
    let initialStatus = {};
    switch (statusCode) {
      case 'confirmUpdateFlag0':
        initialStatus = { confirmUpdateFlag: 0 };
        break;
      case 'confirmUpdateFlag1':
        initialStatus = { confirmUpdateFlag: 1 };
        break;
      case 'DELIVERY_DATE_REJECT':
        initialStatus.statusCode = 'DELIVERY_DATE_REJECT';
        break;
      case 'PUBLISHED':
        initialStatus.statusCode = 'PUBLISHED';
        break;
      case 'CLOSED':
        initialStatus.statusCode = 'CLOSED';
        break;
      case 'cancelledFlag':
        initialStatus = { cancelledFlag: 1 };
        break;
      case 'publishCancelFlag':
        initialStatus = { publishCancelFlag: 1 };
        break;
      case 'CONFIRMED':
        initialStatus.statusCode = 'CONFIRMED';
        break;
      case 'CANCELTOBECOMFIRMED':
        initialStatus.statusCode = 'CANCELTOBECOMFIRMED';
        break;
      case 'CLOSETOBECOMFIRMED':
        initialStatus.statusCode = 'CLOSETOBECOMFIRMED';
        break;
      default:
        initialStatus = {};
        break;
    }
    const {
      releaseDateStart,
      releaseDateEnd,
      erpCreationDateStart,
      erpCreationDateEnd,
      confirmDateStart,
      confirmDateEnd,
    } = filterValues;
    return {
      ...otherValues,
      ...initialStatus,
      releaseDateStart: releaseDateStart ? releaseDateStart.format(DATETIME_MIN) : undefined,
      releaseDateEnd: releaseDateEnd ? releaseDateEnd.format(DATETIME_MIN) : undefined,
      erpCreationDateStart: erpCreationDateStart
        ? erpCreationDateStart.format(DATETIME_MIN)
        : undefined,
      erpCreationDateEnd: erpCreationDateEnd ? erpCreationDateEnd.format(DATETIME_MIN) : undefined,
      confirmDateStart: confirmDateStart ? confirmDateStart.format(DATETIME_MIN) : undefined,
      confirmDateEnd: confirmDateEnd ? confirmDateEnd.format(DATETIME_MIN) : undefined,
    };
  }

  /**
   * fetchDetailHeader - 查询配置中心
   */
  @Bind()
  fetchSettings() {
    const { dispatch } = this.props;
    dispatch({
      type: 'confirmOrder/fetchSettings',
    }).then((res) => {
      if (res) {
        this.setState({
          setting: res['010219'],
          // setest: res['010210'],
        });
      }
    });
  }

  /**
   * 查询订单确认列表
   * @param {Object} page 查询字段
   */
  @Bind()
  handleSearch(page = {}, sorter, isChangePage = false) {
    const {
      dispatch,
      supplierTenantId,
      confirmOrder: {
        listPagination: { total },
      },
    } = this.props;
    const { tenantId } = this.state;
    const filterValues =
      (this.filterForm && filterNullValueObject(this.filterForm.getFieldsValue())) || {};
    const fields = this.handleTimeFormat(filterValues);
    const payload = {
      page,
      tenantId,
      supplierTenantId,
      ...fields,
      customizeUnitCode: 'SODR.CONFIRM_ORDER_LIST.GRID,SODR.CONFIRM_ORDER_LIST.FILTER',
      sort: sorter,
      asyncCountFlag: 'DEFAULT',
      ...(isChangePage ? { oldTotalElements: total } : null),
    };
    dispatch({
      type: 'confirmOrder/queryList',
      payload,
    }).then((res) => {
      if (res && res.needCountFlag === 'Y') {
        dispatch({
          type: 'confirmOrder/queryListPage',
          payload,
        });
      }
    });
    this.setState({ selectedListRows: [] }, () => {
      setTimeout(() => {
        this.forceUpdate();
      }, 600);
    });
  }

  // 跳转详情
  @Bind()
  onHandleToDetail(poHeaderId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sodr/confirm-order/detail/${poHeaderId}`,
      })
    );
  }

  /**
   * 批量查询列表页详情附件--订单确认/反馈
   */
  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  handleSure() {
    const { selectedListRows, setting } = this.state;
    const {
      dispatch,
      confirmOrder: { orderList },
    } = this.props;
    const selectedRowKeys = selectedListRows.map((item) => item.poHeaderId);
    const poHeaderList = orderList.filter((item) => selectedRowKeys.indexOf(item.poHeaderId) >= 0);
    const uuidList = selectedListRows
      .filter((n) => n.supplierAttachmentUuid)
      .map((n) => n.supplierAttachmentUuid);
    const uuidNull = selectedListRows
      .filter((n) => !n.supplierAttachmentUuid)
      .map((item) => item.displayPoNum);
    const uuidJson = uuidNull.toString();
    // const uuids = uuidList.includes(null) || uuidList.includes(undefined);
    const eSignList = selectedListRows.filter(
      (n) => n.electricSignFlag === 1 && n.statusCode === 'CONFIRMED'
    );
    const handleComfirm = throttle(
      () => {
        if (eSignList.length) {
          notification.warning({
            message: intl
              .get('sodr.common.view.message.esignWarning')
              .d(`所选单据包含电子签章订单，请进入明细界面进行电子签章签署`),
          });
        }
        // else if (uuids && setting === '1') {
        //   notification.warning({
        //     message: intl
        //       .get('sodr.common.view.message.uuidNotNull', { uuidJson: `${uuidJson}` })
        //       .d(`订单:${uuidJson}附件不能为空`),
        //   });
        // }
        else if (setting === '1') {
          if (uuidList.length > 0) {
            dispatch({
              type: 'confirmOrder/searchUuid',
              payload: { uuidList, bucketName: BUCKET_NAME },
            }).then((res) => {
              const uuidType = [];
              if (res) {
                forEach(res, (value, key) => {
                  if (!value) {
                    uuidType.push(key);
                  }
                });
                const uuidArr = uuidType.map((n) => ({
                  supplierAttachmentUuid: n,
                }));
                if (!isEmpty(uuidType) && setting === '1') {
                  const uuidName = unionWith(selectedListRows, uuidArr, (row, uuid) => {
                    return row.supplierAttachmentUuid === uuid.supplierAttachmentUuid;
                  });
                  const uuidNulls = uuidName.map((item) => item.displayPoNum).concat(uuidNull);
                  const uuidJsons = uniqWith(uuidNulls).toString();
                  notification.warning({
                    description: intl
                      .get(`sodr.common.view.message.accessoryNotNull1`, { poNum: uuidJsons })
                      .d(`订单:[${uuidJsons}]附件不能为空`),
                    style: {
                      width: 1000,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      // whiteSpace: 'nowrap',
                    },
                  });
                } else {
                  dispatch({
                    type: 'confirmOrder/sure',
                    payload: {
                      poHeaderList,
                    },
                  }).then((rec) => {
                    if (rec) {
                      this.handleSearch();
                      this.setState({ selectedListRows: [] });
                      notification.success();
                    }
                  });
                }
              }
            });
          } else {
            notification.warning({
              message: intl
                .get('sodr.common.view.message.uuidNotNull', { uuidJson: `${uuidJson}` })
                .d(`订单:${uuidJson}附件不能为空`),
            });
          }
        } else {
          dispatch({
            type: 'confirmOrder/sure',
            payload: {
              poHeaderList,
            },
          }).then((rec) => {
            if (rec) {
              this.handleSearch();
              this.setState({ selectedListRows: [] });
              notification.success();
            }
          });
        }
      },
      THROTTLE_TIME,
      { trailing: false }
    );
    if (selectedRowKeys.length > 0) {
      dispatch({
        type: 'confirmOrder/getFeedbackVerificationList',
        payload: { poHeaderList: selectedListRows },
      }).then((res) => {
        if (!isEmpty(res)) {
          const newArray = res.split(',');
          const messageNumber = newArray.join(', ');
          const getBoldText = (val) => <span style={{ fontWeight: 900 }}>{val}</span>;
          Modal.confirm({
            title: intl.get(`${messagePrompt}.backConfirmOrder`).d('是否反馈/确认订单'),
            content: (
              <div>
                <div>
                  {intl
                    .getHTML('sodr.common.model.common.feedbackForList', {
                      canceltobecomfirmed: intl
                        .get('sodr.common.model.common.canceltobecomfirmed')
                        .d('取消待确认'),
                      closetobecomfirmed: intl
                        .get('sodr.common.model.common.closetobecomfirmed')
                        .d('关闭待确认'),
                    })
                    .d(
                      <span>
                        以下订单含有<span style={{ fontWeight: 900 }}>取消待确认</span>或者
                        <span style={{ fontWeight: 900 }}>关闭待确认</span>的订单信息，确认反馈会将
                        <span style={{ fontWeight: 900 }}>取消待确认</span>或者
                        <span style={{ fontWeight: 900 }}>关闭待确认</span>
                        的订单行同时进行确认，请确定是否继续确认反馈？
                      </span>
                    )}
                </div>
                <br />
                {getBoldText(messageNumber)}
              </div>
            ),
            width: 560,
            onOk: handleComfirm,
          });
        } else {
          handleComfirm();
        }
      });
    }
  }

  /**
   * 选中行改变回调
   * @param {Array} newSelectedRowKeys
   * @param {Object} newSelectedRows
   */
  @Bind()
  handleListRowSelectChange(newSelectedRowKeys, newSelectedRows) {
    this.setState({ selectedListRows: newSelectedRows });
  }

  render() {
    const { selectedListRows, tenantId } = this.state;
    const {
      custLoading,
      loadingList,
      confirming,
      customizeTable,
      supplierTenantId,
      customizeFilterForm,
      confirmOrder: { listPagination, orderList, investigationTypes, processStatusList, enumMap },
      customizeBtnGroup,
    } = this.props;
    const selectedRowKeys = selectedListRows.map((item) => item.poHeaderId);
    const filterValues =
      (this.filterForm && filterNullValueObject(this.filterForm.getFieldsValue())) || {};
    const fields = this.handleTimeFormat(filterValues);
    const listRowSelection = {
      selectedRowKeys,
      onChange: this.handleListRowSelectChange,
    };
    const filterProps = {
      enumMap,
      investigationTypes,
      processStatusList,
      customizeFilterForm,
      onFilterChange: this.handleSearch,
      onRef: (node) => {
        this.filterForm = node.props.form;
      },
    };
    const listProps = {
      customizeTable,
      pagination: listPagination,
      dataSource: orderList,
      loading: loadingList,
      editLine: this.editLine,
      searchPaging: this.handleSearch,
      handleToDetail: this.onHandleToDetail,
      rowSelection: listRowSelection,
    };
    const otherButtonProps = {
      icon: 'export',
      type: 'default',
    };

    return (
      <React.Fragment>
        <Spin spinning={custLoading}>
          <Header title={intl.get(`${messagePrompt}.headerTitle`).d('订单确认')}>
            {/* <Button onClick={this.searchUuid}>
            {intl.get(`${messagePrompt}.confirms`).d('校验')}
          </Button> */}
            {customizeBtnGroup({ code: 'SODR.CONFIRM_ORDER_LIST.BUTTONS' }, [
              <ExcelExport
                data-name="export"
                otherButtonProps={otherButtonProps}
                requestUrl={`${SRM_SPUC}/v1/${tenantId}/po-header/export-confirm-po-list`}
                queryParams={{ supplierTenantId, ...fields }}
              />,
              <ExcelExportPro
                data-name="exportPro"
                templateCode="SRM_SODR_CONFIRM_PO_HEADER" // 导出模板编码
                buttonText={intl.get(`hzero.common.button.newExport`).d('(新)导出')} // 导出按钮文本
                otherButtonProps={{
                  icon: 'unarchive',
                  permissionList: [
                    {
                      code: 'srm.po-admin.so.confirm-order.ps.button.newexport',
                      type: 'c7n-pro',
                      meaning: '订单确认-新版导出',
                    },
                  ],
                }}
                requestUrl={`${SRM_SPUC}/v1/${tenantId}/po-header/export-confirm-po-list/new-module`}
                queryParams={{ supplierTenantId, ...fields }}
              />,
              <Button
                data-name="sure"
                type="primary"
                onClick={this.handleSure}
                icon="check"
                loading={confirming}
                disabled={isArray(selectedRowKeys) && isEmpty(selectedRowKeys)}
              >
                {intl.get(`${messagePrompt}.backConfirm`).d('反馈/确认')}
              </Button>,
            ])}
          </Header>
          <Content>
            <Search {...filterProps} />
            <List {...listProps} />
          </Content>
        </Spin>
      </React.Fragment>
    );
  }
}
