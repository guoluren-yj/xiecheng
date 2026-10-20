/* eslint-disable no-dupe-keys */
/**
 * CreateIndex - 创建开票通知
 * @date: 2019-10-17
 * @author:ZJC <junchao.zhou@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Modal, Tooltip, Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import moment from 'moment';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import qs from 'querystring';
import { Button as PermissionButton } from 'components/Permission';
import intl from 'utils/intl';
import remote from 'hzero-front/lib/utils/remote';
import {
  filterNullValueObject,
  getCurrentOrganizationId,
  getUserOrganizationId,
} from 'utils/utils';
import { SRM_FINANCE } from '_utils/config';
import EditTable from 'components/EditTable';
import notification from 'utils/notification';
import { Content, Header } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import { yesOrNoRender, dateRender } from 'utils/renderer';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import formatterCollections from 'utils/intl/formatterCollections';

import { thousandBitSeparator, thousandBitSeparatorCut } from '@/routes/utils';
import FilterForm from './FilterForm';
import ActionHistory from './actionHistory';

const promptCode = 'sfin.invoiceBill';
const { confirm } = Modal;
// 创建开票通知-表格个性化
// const hcuzCode = 'SFIN.CREATE_INVOICE_NOTIFICATION_LIST.GRID';
@remote({
  code: 'SFIN_CREATE_INVOICE_NOTIFICATION_CUX',
  name: 'remote',
})
@formatterCollections({
  code: [
    'hzero.common',
    'entity.company',
    'sfin.invoiceBill',
    'entity.roles',
    'entity.business',
    'sodr.common',
    'entity.item',
    'smdm.materiel',
    'sodr.quotePurchase',
  ],
})
@withCustomize({
  unitCode: [
    'SFIN.CREATE_INVOICE_NOTIFICATION_LIST.FILTER',
    'SFIN.CREATE_INVOICE_NOTIFICATION_LIST.GRID',
    'SFIN.CREATE_INVOICE_NOTIFICATION_LIST.HEAD_BUTTON',
  ],
})
@connect(({ loading, bill, user: { currentUser } }) => ({
  bill,
  currentUser,
  organizationId: getCurrentOrganizationId(),
  supplierOrganizationId: getUserOrganizationId(),
  loading:
    loading.effects['bill/createNotificationSearch'] ||
    loading.effects['bill/createNotificationCreateBillAll'] ||
    loading.effects['bill/createAcceptanceCreateBill'] ||
    loading.effects['bill/createNotificationCreateBill'] ||
    loading.effects['bill/createValidateBill'],
}))
export default class NoConsignmentSale extends PureComponent {
  constructor(props) {
    super(props);
    // eslint-disable-next-line no-unused-expressions
    this.filterRef;
    this.state = {
      // selectedRowKeys: [],
      visible: false,
      data: {},
      initedLoading: true,
      businessTypeValueDefault: '',
      businessTypeMeaningDefault: '',
      initLoadData: true,
    };
  }

  componentDidMount() {
    this.queryFlagList();
    this.querydateRange();
    this.chooseInterface();
    // this.handleSearchWork(); 交由个性化配置查询完成后进行
    const { onRef } = this.props;
    if (onRef) onRef(this);
    window.addEventListener('message', this.customizeBtnRefresh);
  }

  componentDidUpdate(prevProps, prevState) {
    const { custConfig } = this.props;
    const { businessTypeValueDefault, businessTypeMeaningDefault } = this.state;
    // 业务规则查询完成时触发
    const initChanged = this.state.initedLoading === false && prevState.initedLoading === true;
    // 个性化完成时触发
    const custChanged = prevProps.custLoading === true && this.props.custLoading === false;
    const { fields = [] } = custConfig?.['SFIN.CREATE_INVOICE_NOTIFICATION_LIST.FILTER'] || {};
    if (
      (initChanged && this.props.custLoading === false && !isEmpty(fields)) ||
      (custChanged && this.state.initedLoading === false)
    ) {
      // 获取业务类别默认值
      const businessTypeObj = fields.find((item) => item.fieldCode === 'businessType');
      const { defaultValue: cuszDateRangeDefault } =
        fields.find((item) => item.fieldCode === 'dateRange') || {};
      const { defaultValue, defaultValueMeaning } = businessTypeObj || {};
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState(
        {
          cuszDateRangeDefault,
          businessTypeValueDefault: defaultValue || businessTypeValueDefault,
          businessTypeMeaningDefault: defaultValueMeaning || businessTypeMeaningDefault,
        },
        () => {
          this.handleSearchWork();
        }
      );
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({ type: 'bill/updateState', payload: { createRowKeys: [], createRows: [] } });
    window.removeEventListener('message', this.customizeBtnRefresh);
  }

  // 接收二开项目监听事件的刷新
  customizeBtnRefresh = (e) => {
    if (e?.origin === window.location.origin) {
      if (e?.data === 'create_inv_notification_refresh') {
        this.handleSearchWork();
      } else if (e?.data === 'create_inv_notification_forceUpdate') {
        this.forceUpdate();
      }
    }
  };

  /**
   * 保存选中的行
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows 行数据
   */
  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    const {
      dispatch,
      bill: { workData },
    } = this.props;
    const { content = [] } = workData;
    const { form } = this.filterForm.props;
    const businessType = form?.getFieldValue('businessType');
    const rowKey = businessType === 'ACCEPT' ? 'acceptListLineId' : 'rcvTrxLineId';
    const newContent = content.map((item) => {
      const { _status, ...record } = item;
      return selectedRowKeys.includes(item[rowKey]) ? { ...record, _status: 'update' } : record;
    });
    dispatch({
      type: 'bill/updateState',
      payload: {
        createRowKeys: selectedRowKeys,
        createRows: selectedRows,
        workData: { ...workData, content: newContent },
      },
    });
  }

  // @Bind()
  // getCheckboxProps(record) {
  //   if (this.state.selectedRowKeys.length >= 500) {
  //     if (this.state.selectedRowKeys.indexOf(record.rcvTrxLineId) !== -1) {
  //       return {
  //         disabled: false,
  //       };
  //     } else {
  //       return {
  //         disabled: true,
  //       };
  //     }
  //   } else {
  //     return {
  //       disabled: false,
  //     };
  //   }
  // }

  /**
   * 查询是否值集
   */
  @Bind()
  queryFlagList() {
    const { dispatch } = this.props;
    dispatch({ type: 'bill/queryFlagList' });
  }

  /**
   * 查询对账事务日期范围值集
   */
  @Bind()
  querydateRange() {
    const { dispatch } = this.props;
    dispatch({ type: 'bill/fetchdateRange' });
  }

  // 接口调用条件
  @Bind()
  chooseInterface() {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'bill/defaultFetchBusinessType',
      payload: { organizationId },
    }).then((res = {}) => {
      if (res) {
        this.setState({
          businessTypeValueDefault: res.businessType,
          businessTypeMeaningDefault: res.businessTypeMeaning,
          initedLoading: false,
        });
        // this.handleSearchWork();
      }
    });
  }

  /**
   * 查询事务行数据
   * @param {object} params - 查询参数
   */
  @Bind()
  handleSearchWork(params = {}, _, sort = {}, clearSort = false) {
    if (clearSort) {
      const notes = Array.from(document.getElementsByClassName('on'));
      for (const v of notes) {
        v.className = v.className.replace('on', 'off');
      }
    }
    const {
      dispatch,
      organizationId,
      bill: { workPagination = {}, workData = {} },
      remote: remoteProps,
    } = this.props;
    const { form } = this.filterForm.props;
    const { dateRange, businessType, trxDateFrom, trxDateTo, ...formValues } = isUndefined(form)
      ? {}
      : filterNullValueObject(form.getFieldsValue());
    const filterValues = {
      ...formValues,
      businessType,
      trxDateFrom: trxDateFrom ? trxDateFrom.format(DATETIME_MIN) : undefined,
      trxDateTo: trxDateTo ? trxDateTo.format(DATETIME_MAX) : undefined,
    };
    const pagination = isEmpty(params) ? workPagination : params;
    const paginationParams = remoteProps
      ? remoteProps.process('SFIN_CREATE_INVOICE_NOTIFICATION_CUX_PAGINATION', pagination, {
          pagination,
          workData,
        })
      : pagination;
    dispatch({
      type:
        businessType === 'ACCEPT' ? 'bill/fetchAcceptanceForm' : 'bill/createNotificationSearch',
      payload: {
        sort,
        organizationId,
        businessType,
        page: paginationParams,
        ...filterValues,
        customizeUnitCode:
          'SFIN.CREATE_INVOICE_NOTIFICATION_LIST.FILTER,SFIN.CREATE_INVOICE_NOTIFICATION_LIST.GRID',
      },
    }).then((res = {}) => {
      if (res) {
        const newContent = (res.content || []).map((item) => {
          return {
            ...item,
            trxType:
              businessType === 'ACCEPT'
                ? `${intl.get('sfin.invoiceBill.model.invoiceBill.AcceptHeader').d('验收单')}`
                : item.trxType,
            orderTypeName:
              businessType === 'ACCEPT'
                ? `${intl.get('sfin.invoiceBill.model.invoiceBill.agreement').d('协议')}`
                : item.orderTypeName,
          };
        });
        dispatch({
          type: 'bill/updateState',
          payload: {
            workData: { ...workData, content: newContent },
          },
        });
        this.setState({ initLoadData: false });
      }
    });
  }

  /**
   * 计算table列宽度
   * @param {Array} columns 列
   * @param {Number} fixWidth 固定列宽度
   */
  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    const { form } = this.filterForm ? this.filterForm.props : {};
    const formValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    const filterValues = {
      ...formValues,
      trxDateFrom: formValues.trxDateFrom && moment(formValues.trxDateFrom).format(DATETIME_MIN),
      trxDateTo: formValues.trxDateTo && moment(formValues.trxDateTo).format(DATETIME_MAX),
      customizeUnitCode:
        'SFIN.CREATE_INVOICE_NOTIFICATION_LIST.FILTER,SFIN.CREATE_INVOICE_NOTIFICATION_LIST.GRID',
    };
    return filterValues;
  }

  /**
   * 创建开票通知
   */
  @Bind()
  handleCreateBill() {
    const {
      dispatch,
      history,
      organizationId,
      bill: { createRowKeys, createRows },
    } = this.props;
    const { form } = this.filterForm.props;
    const { displayReverseFlag, businessType } = isUndefined(form)
      ? {}
      : filterNullValueObject(form.getFieldsValue());
    const acceptListLineIds = createRows.map((item) => item.acceptListLineId);
    confirm({
      title: intl.get(`${promptCode}.view.message.confirm.create`).d('是否生成开票申请单?'),
      // content: '',
      onOk: () => {
        return dispatch({
          type: 'bill/createValidateBill',
          payload: { organizationId, trxLineIds: createRowKeys },
        }).then((response) => {
          if (response && response.validatedCode === 'INFO') {
            confirm({
              title: response.msg,
              // content: '',
              onOk: () => {
                return dispatch({
                  type:
                    businessType === 'ACCEPT'
                      ? 'bill/createAcceptanceCreateBill'
                      : 'bill/createNotificationCreateBill',
                  payload:
                    businessType === 'ACCEPT'
                      ? { organizationId, acceptListLineIds, displayReverseFlag }
                      : {
                          organizationId,
                          trxLineIds: createRowKeys,
                          displayReverseFlag,
                          businessType,
                        },
                }).then((res) => {
                  if (!isEmpty(res)) {
                    if (res.length === 1 || businessType === 'ACCEPT') {
                      const { billHeader: { billHeaderId } = {} } =
                        businessType === 'ACCEPT' ? res : res[0];
                      // 清空勾选存下的 row
                      dispatch({
                        type: 'bill/updateState',
                        payload: { createRowKeys: [], createRows: [], billList: [] },
                      });
                      notification.success();
                      history.push({
                        pathname: `/sfin/create-invoice-notification/detail/${billHeaderId}`,
                        search: qs.stringify({ status: 'create' }),
                      });
                    } else {
                      dispatch({
                        type: 'bill/updateState',
                        payload: {
                          createRowKeys: [],
                          createRows: [],
                          billList: res.map((item) => item.billHeader || {}),
                        },
                      });
                      history.push({
                        pathname: `/sfin/create-invoice-notification/detail-list`,
                      });
                    }
                  } else {
                    notification.success();
                    this.handleSearchWork();
                  }
                });
              },
            });
          }
          if (response && response.validatedCode === 'SUCCESS') {
            return dispatch({
              type:
                businessType === 'ACCEPT'
                  ? 'bill/createAcceptanceCreateBill'
                  : 'bill/createNotificationCreateBill',
              payload:
                businessType === 'ACCEPT'
                  ? { organizationId, acceptListLineIds, displayReverseFlag }
                  : { organizationId, trxLineIds: createRowKeys, displayReverseFlag, businessType },
            }).then((res) => {
              if (res) {
                if (!isEmpty(res)) {
                  if (res.length === 1 || businessType === 'ACCEPT') {
                    const { billHeader: { billHeaderId } = {} } =
                      businessType === 'ACCEPT' ? res : res[0];
                    // 清空勾选存下的 row
                    dispatch({
                      type: 'bill/updateState',
                      payload: { createRowKeys: [], createRows: [], billList: [] },
                    });
                    notification.success();
                    history.push({
                      pathname: `/sfin/create-invoice-notification/detail/${billHeaderId}`,
                      search: qs.stringify({ status: 'create' }),
                    });
                  } else {
                    dispatch({
                      type: 'bill/updateState',
                      payload: {
                        createRowKeys: [],
                        createRows: [],
                        billList: res.map((item) => item.billHeader || {}),
                      },
                    });
                    history.push({
                      pathname: `/sfin/create-invoice-notification/detail-list`,
                    });
                  }
                } else {
                  notification.success();
                  this.handleSearchWork();
                }
              }
            });
          }
          if (response && response.validatedCode === 'WIATING_CONFIRM') {
            confirm({
              title: response.msg,
              onOk: () => {
                return dispatch({
                  type:
                    businessType === 'ACCEPT'
                      ? 'bill/createAcceptanceCreateBill'
                      : 'bill/createNotificationCreateBill',
                  payload:
                    businessType === 'ACCEPT'
                      ? { organizationId, acceptListLineIds, displayReverseFlag }
                      : {
                          organizationId,
                          trxLineIds: createRowKeys,
                          displayReverseFlag,
                          businessType,
                        },
                }).then((res) => {
                  if (!isEmpty(res)) {
                    if (res.length === 1 || businessType === 'ACCEPT') {
                      const { billHeader: { billHeaderId } = {} } =
                        businessType === 'ACCEPT' ? res : res[0];
                      // 清空勾选存下的 row
                      dispatch({
                        type: 'bill/updateState',
                        payload: { createRowKeys: [], createRows: [], billList: [] },
                      });
                      notification.success();
                      history.push({
                        pathname: `/sfin/create-invoice-notification/detail/${billHeaderId}`,
                        search: qs.stringify({ status: 'create' }),
                      });
                    } else {
                      dispatch({
                        type: 'bill/updateState',
                        payload: {
                          createRowKeys: [],
                          createRows: [],
                          billList: res.map((item) => item.billHeader || {}),
                        },
                      });
                      history.push({
                        pathname: `/sfin/create-invoice-notification/detail-list`,
                      });
                    }
                  } else {
                    notification.success();
                    this.handleSearchWork();
                  }
                });
              },
            });
          }
        });
      },
    });
  }

  /**
   * 移除或撤销事务行
   * @param {Boolean} flag true 移除
   */
  @Bind()
  handleRemoveOrNot(flag, needInvoiceFlag, notNeedInvoiceFlag) {
    const {
      dispatch,
      organizationId,
      bill: { createRowKeys, createRows },
    } = this.props;
    const { form } = this.filterForm.props;
    const { businessType } = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    const acceptListLineIds = createRows.map((item) => item.acceptListLineId);
    if (!isEmpty(needInvoiceFlag) && !isEmpty(notNeedInvoiceFlag)) {
      if (flag) {
        notification.warning({
          message: intl
            .get(`${promptCode}.view.message.notification.needInvoice`)
            .d('勾选的数据中存在已移除数据'),
        });
      } else {
        notification.warning({
          message: intl
            .get(`${promptCode}.view.message.notification.notNeedInvoice`)
            .d('勾选的数据中存在未移除数据'),
        });
      }
    } else {
      const interfaceName = flag ? 'un-need-invoice' : 'need-invoice';
      const confirmTitle = flag
        ? intl.get(`${promptCode}.view.message.confirm.unInvoice`).d('是否确认移除?')
        : intl.get(`${promptCode}.view.message.confirm.invoice`).d('是否确认撤销移除?');
      confirm({
        title: confirmTitle,
        // content: '',
        onOk: () => {
          if (businessType === 'ACCEPT') {
            if (flag) {
              dispatch({
                type: 'bill/removeAcceptance',
                payload: { interfaceName, acceptListLineIds, organizationId },
              }).then((res) => {
                if (res) {
                  notification.success();
                  this.handleSearchWork();
                  dispatch({
                    type: 'bill/updateState',
                    payload: { createRowKeys: [], createRows: [] },
                  });
                }
              });
            } else {
              dispatch({
                type: 'bill/returnAcceptance',
                payload: { interfaceName, acceptListLineIds, organizationId },
              }).then((res) => {
                if (res) {
                  notification.success();
                  this.handleSearchWork();
                  dispatch({
                    type: 'bill/updateState',
                    payload: { createRowKeys: [], createRows: [] },
                  });
                }
              });
            }
          } else {
            dispatch({
              type: 'bill/removeInvoiceOrNot',
              payload: { interfaceName, createRowKeys, organizationId },
            }).then((res) => {
              if (res) {
                notification.success();
                this.handleSearchWork();
                dispatch({
                  type: 'bill/updateState',
                  payload: { createRowKeys: [], createRows: [] },
                });
              }
            });
          }
        },
      });
    }
  }

  /**
   * 全选创建
   *
   */
  @Bind()
  handleCheckAll() {
    const { dispatch, history, organizationId } = this.props;
    const { form } = this.filterForm.props;
    const formValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    const { businessType } = formValues;
    confirm({
      title: intl.get(`${promptCode}.view.message.confirm.checkAll`).d('是否全部勾选创建?'),
      onOk: () => {
        dispatch({
          type: 'bill/createNotificationCreateBillAll',
          payload: {
            organizationId,
            trxLineIds: [],
            ...formValues,
            trxDateFrom:
              formValues.trxDateFrom && moment(formValues.trxDateFrom).format(DATETIME_MIN),
            trxDateTo: formValues.trxDateTo && moment(formValues.trxDateTo).format(DATETIME_MAX),
            customizeUnitCode:
              'SFIN.CREATE_INVOICE_NOTIFICATION_LIST.FILTER,SFIN.CREATE_INVOICE_NOTIFICATION_LIST.GRID',
          },
        }).then((response) => {
          if (!isEmpty(response)) {
            if (response.length === 1 || businessType === 'ACCEPT') {
              let billHeaderId = null;
              if (businessType === 'ACCEPT') {
                billHeaderId = response.billHeader ? response.billHeader.billHeaderId : null;
              } else {
                const { failed = 0, message = '' } = response[0];
                if (Number(failed) === 1) {
                  return notification.warning({
                    message,
                    duration: 10,
                    className: 'warning-box',
                  });
                }
                billHeaderId = response[0].billHeader ? response[0].billHeader.billHeaderId : null;
              }
              // let billHeaderId = null;
              // billHeaderId = response[0].billHeader ? response[0].billHeader.billHeaderId : null;
              notification.success();
              history.push({
                pathname: `/sfin/create-invoice-notification/detail/${billHeaderId}`,
                search: qs.stringify({ status: 'create' }),
              });
            } else {
              dispatch({
                type: 'bill/updateState',
                payload: {
                  billList: response.map((item) => item.billHeader || {}),
                },
              });
              history.push({
                pathname: `/sfin/create-invoice-notification/detail-list`,
              });
            }
          } else {
            this.handleSearchWork();
          }
        });
      },
    });
  }

  @Bind
  handleOperationRecord(record) {
    this.setState({
      visible: true,
      data: record,
    });
  }

  @Bind
  hideModal(flag) {
    this.setState({
      visible: flag,
    });
  }

  @Bind
  ListColumns() {
    const columns = [
      {
        title: intl.get(`${promptCode}.model.invoiceBill.trxAndLineNum`).d('事务编号|行号'),
        dataIndex: 'trxAndLineNum',
        width: 120,
        fixed: 'left',
      },
      {
        title: intl.get('entity.item.code').d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
        fixed: 'left',
        sorter: true,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.itemName`).d('物料描述'),
        dataIndex: 'itemName',
        width: 150,
        fixed: 'left',
        sorter: true,
      },
      {
        title: intl.get('smdm.materiel.model.materiel.commonName').d('通用名'),
        dataIndex: 'commonName',
        width: 120,
        fixed: 'left',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.specificationsAndModel`).d('规格型号'),
        dataIndex: 'specificationsAndModel',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.unit`).d('单位'),
        dataIndex: 'unit',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceQuantityAvailable`).d('可开票数量'),
        dataIndex: 'invoiceQuantityAvailable',
        width: 120,
        render: (text) => thousandBitSeparator(text),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.businessType`).d('业务类别'),
        dataIndex: 'businessTypeMeaning',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.netPrice`).d('不含税单价'),
        dataIndex: 'netPrice',
        align: 'right',
        width: 120,
        render: (text, record) =>
          record.priceShieldFlag === 1
            ? record.netPriceMeaning
            : thousandBitSeparatorCut(record.netPrice, record.pricePrecision),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.unitPriceBatch`).d('每'),
        dataIndex: 'unitPriceBatch',
        width: 75,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.netAmount`).d('不含税金额'),
        dataIndex: 'netAmount',
        align: 'right',
        width: 120,
        render: (text, record) =>
          record.priceShieldFlag === 1
            ? record.netAmountMeaning
            : thousandBitSeparator(record.netAmount, record.amountPrecision),
      },
      {
        title: `${intl.get(`${promptCode}.model.invoiceBill.taxRate`).d('税率')}（%）`,
        dataIndex: 'taxRate',
        width: 120,
        sorter: true,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxIncludedPrice`).d('含税单价'),
        dataIndex: 'taxIncludedPrice',
        align: 'right',
        width: 120,
        render: (text, record) =>
          record.priceShieldFlag === 1
            ? record.taxIncludedPriceMeaning
            : thousandBitSeparatorCut(record.taxIncludedPrice, record.pricePrecision),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxIncludedAmount`).d('含税金额'),
        dataIndex: 'taxIncludedAmount',
        align: 'right',
        width: 120,
        render: (text, record) =>
          record.priceShieldFlag === 1
            ? record.taxIncludedAmountMeaning
            : thousandBitSeparator(record.taxIncludedAmount, record.amountPrecision),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxAmount`).d('税额'),
        dataIndex: 'taxAmount',
        align: 'right',
        width: 120,
        render: (text, record) =>
          record.priceShieldFlag === 1
            ? record.taxAmountMeaning
            : thousandBitSeparator(record.taxAmount, record.amountPrecision),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.currencyCode`).d('币种'),
        dataIndex: 'currencyCode',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.trxType`).d('事务类型'),
        dataIndex: 'trxType',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.parentNumber`).d('父事务编号|行号'),
        dataIndex: 'parentNumber',
        width: 130,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.asnNumAndAsnLineNum`).d('送货单号|行号'),
        dataIndex: 'asnNumAndAsnLineNum',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.poNumAndLineNum`).d('订单号|行号'),
        dataIndex: 'poNumAndLineNum',
        width: 120,
        sorter: true,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.displayLine`).d('发运行'),
        dataIndex: 'displayLineLocationNum',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.displayReleaseNum`).d('发放号'),
        dataIndex: 'displayReleaseNum',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.orderTypeName`).d('订单类型'),
        dataIndex: 'orderTypeName',
        width: 100,
        sorter: true,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.company`).d('公司'),
        dataIndex: 'companyName',
        width: 120,
        sorter: true,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierNum`).d('供应商编码'),
        dataIndex: 'supplierNum',
        width: 120,
        sorter: true,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierName`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 180,
        sorter: true,
      },
      {
        title: intl.get('entity.business.tag').d('业务实体'),
        dataIndex: 'ouName',
        width: 120,
        sorter: true,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.purchaseOrgName`).d('采购组织'),
        dataIndex: 'purchaseOrgName',
        width: 120,
        sorter: true,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.organizationName`).d('库存组织'),
        dataIndex: 'organizationName',
        width: 120,
        sorter: true,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.inventoryName`).d('库房'),
        dataIndex: 'inventoryName',
        width: 120,
        sorter: true,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.purAgentName`).d('采购员'),
        dataIndex: 'purAgentName',
        width: 120,
        sorter: true,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierSiteName`).d('供应商地点'),
        dataIndex: 'supplierSiteName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.trxYear`).d('事务年度'),
        dataIndex: 'trxYear',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.partnerName`).d('出票方'),
        dataIndex: 'partnerName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.sourceCode`).d('数据来源代码'),
        dataIndex: 'sourceCode',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.externalSystemCode`).d('外部来源系统代码'),
        dataIndex: 'externalSystemCode',
        width: 140,
      },
      {
        title: intl
          .get(`${promptCode}.model.invoiceBill.sourceOrderTypeName`)
          .d('对账数据来源单据类型'),
        dataIndex: 'sourceOrderTypeNameMeaing',
        width: 140,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.trxDate`).d('事务日期'),
        dataIndex: 'trxDate',
        width: 120,
        render: dateRender,
        sorter: true,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.needInvoiceFlag`).d('移除标识'),
        dataIndex: 'needInvoiceFlag',
        width: 90,
        render: (text, { undoRemoveFlag }) => {
          if (!undoRemoveFlag) {
            return text === 1 ? yesOrNoRender(0) : yesOrNoRender(1);
          }
          return (
            <span>
              {text === 1 ? yesOrNoRender(0) : yesOrNoRender(1)}
              &nbsp;&nbsp;&nbsp;&nbsp;
              <Tooltip
                placement="topRight"
                title={intl
                  .get(`${promptCode}.model.invoiceBill.undoRemoveFlag`)
                  .d('该数据进行过移除，请注意！')}
              >
                <Icon type="exclamation-circle-o" style={{ color: 'red' }} />
              </Tooltip>
            </span>
          );
        },
      },
      {
        title: intl.get(`hzero.common.button.operating`).d('操作记录'),
        width: 100,
        fixed: 'right',
        name: 'taxInvoiceLineId',
        render: (record) => {
          if (!record.rcvTrxLineId) {
            return '-';
          }
          return (
            <a color="#29BECE" onClick={() => this.handleOperationRecord(record)}>
              {intl.get(`hzero.common.button.operating`).d('操作记录')}
            </a>
          );
        },
      },
    ];
    return columns;
  }

  @Bind()
  handleFilterRef(ref) {
    this.filterRef = ref;
  }

  // 提交
  render() {
    const {
      loading,
      organizationId,
      supplierOrganizationId,
      currentUser: { id },
      bill: {
        workData: { content = [] },
        workPagination = {},
        createRowKeys,
        flagList = [],
        createRows = [],
        dateRange = [],
      },
      dispatch,
      history,
      customizeFilterForm,
      customizeTable,
      customizeBtnGroup,
      remote: remoteProps,
    } = this.props;
    const customizeUnitCode =
      'SFIN.CREATE_INVOICE_NOTIFICATION_LIST.FILTER,SFIN.CREATE_INVOICE_NOTIFICATION_LIST.GRID';
    const {
      sourceCodeValue,
      businessTypeValueDefault,
      businessTypeMeaningDefault,
      visible,
      data,
      cuszDateRangeDefault,
      initLoadData,
    } = this.state;
    const { form } = isUndefined(this.filterForm) ? {} : this.filterForm.props;
    const businessType = isUndefined(form) ? {} : form.getFieldValue('businessType');
    const needInvoiceFlag = createRows.filter((o) => o.needInvoiceFlag === 1);
    const notNeedInvoiceFlag = createRows.filter((o) => o.needInvoiceFlag === 0);
    const filterProps = {
      dispatch,
      userId: id,
      organizationId,
      supplierOrganizationId,
      flagList,
      dateRange,
      sourceCodeValue,
      businessTypeValueDefault,
      businessTypeMeaningDefault,
      onSearch: this.handleSearchWork,
      onRef: (ref) => {
        this.filterForm = ref;
      },
      cuszDateRangeDefault,
      customizeFilterForm,
      initLoadData,
    };
    const rowSelection = {
      selectedRowKeys: createRowKeys,
      onChange: this.onSelectChange,
      // getCheckboxProps: this.getCheckboxProps,
    };
    const columns = this.ListColumns();
    const actionHistory = {
      visible,
      data,
      hideModal: this.hideModal,
    };
    const pageCuxOptions = remoteProps
      ? remoteProps.process(
          'SFIN_CREATE_INVOICE_NOTIFICATION_CUX_PAGEOPTIONS',
          {},
          { workPagination, content }
        )
      : {};
    const btns = [
      <Button
        icon="plus"
        type="primary"
        name="create"
        disabled={isEmpty(createRowKeys)}
        loading={loading}
        onClick={this.handleCreateBill}
      >
        {intl.get('hzero.common.button.create').d('新建')}
      </Button>,
      <ExcelExport
        name="export"
        requestUrl={`${SRM_FINANCE}/v1/${organizationId}/bill/purchase-trx-line/export?customizeUnitCode=${customizeUnitCode}`}
        queryParams={this.handleGetFormValue()}
        otherButtonProps={{ icon: 'export', type: 'default' }}
      />,
      <PermissionButton
        icon="close-square-o"
        name="remove"
        disabled={isEmpty(createRowKeys) || isEmpty(needInvoiceFlag)}
        onClick={() => this.handleRemoveOrNot(true, needInvoiceFlag, notNeedInvoiceFlag)}
        permissionList={[
          {
            code: `srm.finance.purchase-bill.inform-create.ps.button.remove`,
            type: 'button',
          },
        ]}
        loading={loading}
      >
        {intl.get(`${promptCode}.view.option.remove`).d('移除')}
      </PermissionButton>,
      <PermissionButton
        icon="close-square-o"
        name="notRemove"
        disabled={isEmpty(createRowKeys) || isEmpty(notNeedInvoiceFlag)}
        onClick={() => this.handleRemoveOrNot(false, needInvoiceFlag, notNeedInvoiceFlag)}
        permissionList={[
          {
            code: `srm.finance.purchase-bill.inform-create.ps.button.notremove`,
            type: 'button',
          },
        ]}
        loading={loading}
      >
        {intl.get(`${promptCode}.view.option.notRemove`).d('撤销移除')}
      </PermissionButton>,
      <PermissionButton
        name="checkAll"
        loading={loading}
        onClick={this.handleCheckAll}
        permissionList={[
          {
            code: `srm.finance.purchase-bill.inform-create.ps.create.checkall`,
            type: 'button',
          },
        ]}
      >
        {intl.get(`${promptCode}.view.option.checkAll`).d('全选创建')}
      </PermissionButton>,
    ].filter((item) => item);
    const allBtns = remoteProps ? remoteProps.process('SFIN_CREATE_INVOICE_NOTIFICATION_CUX_HEADERBUTTON', btns, {
      organizationId,
      form,
      history,
      loading,
      onSearch: this.handleSearchWork
    }) : btns;
    console.log(allBtns);
    
    return (
      <React.Fragment>
        <Header
          title={intl.get(`${promptCode}.view.message.createBillNotification`).d('创建开票通知')}
        >
          {customizeBtnGroup(
            {
              code: 'SFIN.CREATE_INVOICE_NOTIFICATION_LIST.HEAD_BUTTON',
            },
            [...allBtns],
          )}
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          {customizeTable(
            { code: 'SFIN.CREATE_INVOICE_NOTIFICATION_LIST.GRID' },
            <EditTable
              resizable
              bordered
              loading={loading}
              rowKey={businessType === 'ACCEPT' ? 'acceptListLineId' : 'rcvTrxLineId'}
              columns={columns}
              dataSource={content}
              pagination={{ ...workPagination, ...pageCuxOptions }}
              rowSelection={rowSelection}
              onChange={this.handleSearchWork}
              scroll={{ x: this.scrollWidth(columns, 900), y: 'calc(100vh - 422px)' }}
            />
          )}
          {visible && <ActionHistory {...actionHistory} />}
        </Content>
      </React.Fragment>
    );
  }
}
