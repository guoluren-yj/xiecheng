/*
 * index - 需求维护明细页面
 * @date: 2019-01-25
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Spin, Collapse, Icon, Modal } from 'hzero-ui';
import { Modal as C7nModal } from 'choerodon-ui/pro';
import { connect } from 'dva';
import { isEmpty, isArray, isFunction } from 'lodash';
import classnames from 'classnames';
import { Bind, Debounce, Throttle } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import querystring from 'querystring';
import moment from 'moment';

import { PRIVATE_BUCKET } from '_utils/config';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Header, Content } from 'components/Page';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import {
  getResponse,
  createPagination,
  getEditTableData,
  filterNullValueObject,
  getCurrentTenant,
  // addItemToPagination,
} from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { DETAIL_DEFAULT_CLASSNAME, DEFAULT_DATETIME_FORMAT, DATETIME_MIN } from 'utils/constants';
import cuxRemote from 'hzero-front/lib/utils/remote';

import { Button as PermissionButton } from 'components/Permission';
import {
  add,
  update,
  fetchDoExecute,
  fetchPermissions,
  fetchBasePrice,
  fetchConditionFields,
} from '@/services/purchaseRequisitionCreationService';

import { BudgetCheckTable } from '@/routes/components/BudgetCheckTable';
import OperationRecord from '../../components/OperationRecord/OperationRecord';
import DeliveryInformationHeader from './DeliveryInformationHeader';
import PurchaseRequestHeader from './PurchaseRequestHeader';
import BillingInformation from './BillingInformation';
// eslint-disable-next-line import/no-named-as-default
import PurchaseLineInfo from './PurchaseLineInfo';
import CancelModal from './CancelModal';
import styles from './index.less';

const { Panel } = Collapse;

const messagePrompt = 'sprm.purchaseReqCreation.view.message';
const titlePrompt = 'sprm.purchaseReqCreation.view.title';
const commonPrompt = 'sprm.common.model.common';
let formData = null;

@formatterCollections({
  code: [
    'sprm.purchaseRequisitionCreation',
    'sprm.purchaseReqCreation',
    'sprm.purchaseReqInquiry',
    'sinv.deliveryCreation',
    'sprm.common',
    'hzero.common',
    'entity.organization',
    'entity.attachment',
    'entity.company',
    'entity.business',
    'entity.item',
    'entity.roles',
  ],
})
@withCustomize({
  unitCode: [
    'SPRM.PURCHASE_REQUISITION_CREATION.DETAIL_LINE',
    'SPRM.PURCHASE_REQUISITION_CREATION.DETAIL_HEADER',
    'SPRM.PURCHASE_REQUISITION_CREATION.DETAIL.LINE_ECOMMERCE',
    'SPRM.PURCHASE_REQUISITION_CREATION.DELIVERYINFO',
    'SPRM.PURCHASE_REQUISITION_CREATION.DETAIL_PANEL',
    'SPRM.PURCHASE_REQUISITION_CREATION.DETAIL_BTN',
    'SPRM.PURCHASE_REQUISITION_CREATION.LINE_BTNS',
  ],
})
@cuxRemote(
  {
    code: 'SPRM_PURCHASE_CREATION_FUN_REMOTE',
    name: 'remote',
  },
  {
    process: {
      handleQueryPrice: undefined,
      addHeaderBtn: undefined,
      handleCuxInitHeader: undefined, // 三生需要根据路由等条件新增创建时，头默认值
      handleFuncPath: undefined, // 三生界面跳转
      handleCuxFormItem: undefined,
    },
  }
)
@connect(({ loading, purchaseRequisitionCreation }) => ({
  getHeaderAttachmentUuidLoading:
    loading.effects['purchaseRequisitionCreation/getHeaderAttachmentUuid'],
  submitDeliveryLoading:
    loading.effects['purchaseRequisitionCreation/singleSubmit'] ||
    loading.effects['purchaseRequisitionCreation/budgetCheck'],
  deleteDeliveryLoading: loading.effects['purchaseRequisitionCreation/delete'],
  cancelDeliveryLoading: loading.effects['purchaseRequisitionCreation/cancel'],
  fetchOperationRecordListLoading:
    loading.effects['purchaseRequisitionCreation/fetchOperationRecordList'],
  deletingLines: loading.effects['purchaseRequisitionCreation/deleteLines'],
  bindingUuid: loading.effects['purchaseRequisitionCreation/bindHeaderAttachmentUuid'],
  purchaseRequisitionCreation,
}))
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { prHeaderId } = querystring.parse(search.substr(1));
    const { match = {} } = this.props;
    const { params } = match;
    this.state = {
      isMatch: !!params.id,
      prHeaderId: params.id || prHeaderId,
      headerInfo: {}, // 头form数据源
      collapseKeys: [
        'orderHeaderInfo',
        'purchaseLineInfo',
        'deliveryInformationHeader',
        'billingInformation',
      ], // 打开的折叠面板key
      // listDataSource: [], // 表格数据源
      operationRecordModalVisible: false,
      cancelModalVisible: false,
      priceList: [], // 比价单
      headerLoading: true,
      tableLoading: false,
      permissonFlag: { externalAttachmentUuid: false },
      basePriceFlag: true,
      conditionFields: null,
      itemLimitRule: [],
    };
  }

  componentDidMount() {
    this.fetchCheckPermissions();
    fetchConditionFields([
      {
        fullPathCode: 'SITE.SPUC.PR.CREATION.ITEM_LIMIT',
      },
    ]).then((res) => {
      if (getResponse(res)) {
        this.setState(
          {
            conditionFields: res?.conditionLeftValueFields || [],
          },
          () => {
            console.log(res?.conditionLeftValueFields?.length === 0);
            if (res?.conditionLeftValueFields?.length === 0) {
              fetchDoExecute([
                {
                  fullPathCode: 'SITE.SPUC.PR.CREATION.ITEM_LIMIT',
                },
              ]).then((resulut) => {
                if (getResponse(resulut)) {
                  console.log(
                    resulut[0] ? JSON.parse(resulut[0])?.map((rule) => rule) : [],
                    'null'
                  );
                  this.setState({
                    itemLimitRule: resulut[0] ? JSON.parse(resulut[0])?.map((rule) => rule) : [],
                  });
                }
              });
            }
          }
        );
      }
    });
  }

  @Bind()
  process(type = '') {
    const headerInfo = this.header.getInfo();
    const { prHeaderId, prSourcePlatform, prStatusCode } = headerInfo;
    this.setState({ headerInfo });
    switch (type) {
      case 'finishHeader':
        this.line.fetchDetailList({}, { prHeaderId, prSourcePlatform, prStatusCode });
      // eslint-disable-next-line no-fallthrough
      default:
    }
  }

  @Bind()
  @Throttle(1000)
  fetchItemLimit(res) {
    const { conditionFields } = this.state;
    const { requestDate, ...ohter } = res;
    const newRes = {
      ...ohter,
      requestDate: requestDate ? requestDate.format(DEFAULT_DATETIME_FORMAT) : undefined,
    };
    if (JSON.stringify(newRes) !== formData) {
      let changeFlag = false;
      if (conditionFields !== null && isArray(conditionFields)) {
        if (isEmpty(conditionFields)) {
          return;
        }
        if (formData && newRes) {
          changeFlag = false;
          Object.keys(newRes).forEach((key) => {
            if (newRes[key] !== JSON.parse(formData)[key] && conditionFields.includes(key)) {
              changeFlag = true;
            }
          });
        }
      }
      formData = JSON.stringify(newRes);
      const parameterMap = {
        ...newRes,
        prLineList: undefined,
        addLineList: undefined,
        batchEditFieldMap: undefined,
      };
      Object.keys(parameterMap).forEach((key) => {
        if (typeof parameterMap[key] === 'object') {
          parameterMap[key] = undefined;
        }
      });
      if (conditionFields !== null && isArray(conditionFields) && changeFlag === false) {
        return;
      }
      setTimeout(
        fetchDoExecute([
          {
            fullPathCode: 'SITE.SPUC.PR.CREATION.ITEM_LIMIT',
            parameterMap,
          },
        ]).then((resulut) => {
          if (getResponse(resulut)) {
            console.log(
              resulut[0] ? JSON.parse(resulut[0])?.map((rule) => rule) : [],
              'parameterMap'
            );
            this.setState({
              // eslint-disable-next-line react/no-unused-state
              itemLimitRule: resulut[0] ? JSON.parse(resulut[0])?.map((rule) => rule) : [],
            });
          }
        }),
        50
      );
    }
  }

  // 校验数据是否必输.
  @Bind()
  async fetchCheckPermissions() {
    const buttonPermissionList = ['hzero.srm.requirement.prm.pr-creation.ps.external-attachment'];
    await fetchPermissions(buttonPermissionList).then((res) => {
      if (res && res[0]) {
        const permissonFlag = {};
        permissonFlag.externalAttachmentUuid = res[0].approve;
        // res.forEach(({ code, approve }) => {
        //   const codeSplice = code.substring(code.lastIndexOf('ps.create-') + 10, code.length); // strs.substring(obj.filename.lastIndexOf("a")+1,strs.length)
        //   permissonFlag[`${codeSplice}Permisson`] = approve || false;
        // });
        this.setState({ permissonFlag });
      }
    });
  }

  @Bind()
  getWarningStr(line = {}, title) {
    const renderExp = '、';
    const errorDate = intl.get('hzero.common.validation.notNull', { name: '' });

    const requiredLineErrs = [];

    const otherLineErrs = [];

    Object.values(line).forEach((item) => {
      const str = item.toString();
      let index = 0;
      index = str.indexOf(errorDate);
      if (index === -1) {
        otherLineErrs.push(`【${str}】`);
      } else {
        requiredLineErrs.push(`【${str.slice(0, index)}】`);
      }
    });
    return (
      (requiredLineErrs.length || otherLineErrs.length ? `${title}:` : '') +
      (requiredLineErrs.length > 0
        ? `${intl.get('hzero.common.validation.notNull', {
            name: requiredLineErrs.join(`${renderExp}`),
          })};`
        : '') +
      (otherLineErrs.length > 0 ? otherLineErrs.join(',') : '')
    );
  }

  // 校验行信息. 假如行没有填写返回{lineMessage},不报错返回prLineList
  @Bind()
  handleCheckLineData() {
    const {
      headerInfo: { whetherEnabledSecondaryUom },
    } = this.state;
    const listDataSource = this.line.handleLineData();
    listDataSource.forEach((e) => {
      console.log(e.$form.getFieldValue('itemId'));
      if (e.$form && !e.$form.getFieldValue('itemId')) {
        e.$form.setFieldsValue({ itemId: e.itemId });
      }
    });
    const prLineList = getEditTableData(listDataSource, ['prLineId', '_status'], {
      force: true,
    })?.map((item) => {
      const { neededDate, supplierList } = item;
      return {
        ...item,
        supplierList: !isArray(supplierList)
          ? item.newSupplierList
          : item.supplierList?.map((ele) => ({
              ...ele,
              // supplierCode: ele.supplierNum || ele.supplierCompanyNum || ele.supplierCode,
            })),
        secondaryUomId: whetherEnabledSecondaryUom ? item.secondaryUomId : item.uomId,
        secondaryQuantity: whetherEnabledSecondaryUom ? item.secondaryQuantity : item.quantity,
        secondaryTaxInUnitPrice: whetherEnabledSecondaryUom
          ? item.secondaryTaxInUnitPrice
          : item.taxIncludedUnitPrice,
        // taxIncludedUnitPrice: whetherEnabledSecondaryUom
        //   ? item.taxIncludedUnitPrice
        //   : item.taxIncludedUnitPrice,
        neededDate: neededDate ? moment(neededDate).format(DATETIME_MIN) : undefined,
      };
    });
    if (listDataSource.length > 0 && prLineList.length === 0) {
      const lineErrs = {};
      const temLineErrs = listDataSource?.map((item) => {
        return item.$form.getFieldsError();
      });
      temLineErrs.forEach((item) => {
        Object.assign(lineErrs, filterNullValueObject(item));
      });
      const lineMessage = this.getWarningStr(
        lineErrs,
        intl.get(`sprm.purchaseReqCreation.view.title.purchaseLineInfo`).d('采购申请行信息')
      );
      return { lineMessage, errorLine: 1 };
    }
    return prLineList;
  }

  saveDataAfter = (res = {}, enterPath) => {
    this.props.history.push({
      pathname: enterPath.cuxCreatePath || enterPath,
      search: `?prHeaderId=${res.prHeaderId}`,
    });
    this.setState({ prHeaderId: res.prHeaderId }, () => {
      this.header.fetchDetailHeader(true, res.prHeaderId);
    });
    notification.success();
  };

  /**
   * save - 保存明细数据
   * 保存明细头数据和行明细相关字段
   */
  @Bind()
  @Throttle(500)
  save(otherParams = {}) {
    const {
      location: { search },
      remote,
    } = this.props;
    const { isCopy = 0 } = querystring.parse(search.substr(1));
    const headerForm = this.header.handleHeaderSave();
    const headerInfo = this.header.getInfo();
    const { handleCuxAdd = undefined, handleFuncPath = undefined } = remote?.props?.process || {};
    const { prSourcePlatform = 'SRM', prHeaderId, invoiceAddressName } = headerInfo;
    if (headerInfo.cancelStatusCode === 'CANCELLED') {
      notification.error({
        message: intl
          .get(`${messagePrompt}.errorMessage`)
          .d('此申请已取消，请至采购申请查询界面查看申请状态。'),
      });
      return;
    }
    if (prSourcePlatform === 'SRM' && !prHeaderId) {
      headerForm.validateFields((errs, values) => {
        const headerData = { ...headerInfo, ...values, ...otherParams };
        if (!errs) {
          const enterPath = isFunction(handleFuncPath)
            ? handleFuncPath()
            : '/sprm/purchase-requisition-creation/detail';
          this.setState({ headerLoading: true }, () => {
            if (isFunction(handleCuxAdd)) {
              handleCuxAdd({
                ...headerData,
                requestDate: headerData.requestDate
                  ? headerData.requestDate.format(DEFAULT_DATETIME_FORMAT)
                  : undefined,
              })
                .then((res) => {
                  const data = getResponse(res);
                  if (data) {
                    this.saveDataAfter(data, enterPath);
                  }
                })
                .finally(() => {
                  this.setState({ headerLoading: false });
                });
            } else {
              add({
                ...headerData,
                requestDate: headerData.requestDate
                  ? headerData.requestDate.format(DEFAULT_DATETIME_FORMAT)
                  : undefined,
              })
                .then((res) => {
                  const data = getResponse(res);
                  if (data) {
                    this.saveDataAfter(data, enterPath);
                  }
                })
                .finally(() => {
                  this.setState({ headerLoading: false });
                });
            }
          });
        } else {
          const headerMessage = this.getWarningStr(
            filterNullValueObject(headerForm.getFieldsError()),
            intl.get(`${titlePrompt}.orderHeaderInfo`).d('采购申请头信息')
          );
          notification.warning({
            message: `${headerMessage}`,
          });
        }
      });
    } else {
      const prLineList = this.handleCheckLineData();
      headerForm.validateFields((errs, values) => {
        const { requestDate } = values;
        const billDate = this.billingInfo ? this.billingInfo.getData() : {};
        const headerData = {
          ...headerInfo,
          ...values,
          ...billDate,
          ...otherParams,
          invoiceAddress: values.invoiceAddress ? values.invoiceAddress : invoiceAddressName,
          isCopy,
          requestDate: requestDate ? requestDate.format(DEFAULT_DATETIME_FORMAT) : undefined,
          customizeUnitCode:
            prSourcePlatform !== 'E-COMMERCE'
              ? 'SPRM.PURCHASE_REQUISITION_CREATION.DETAIL_LINE,SPRM.PURCHASE_REQUISITION_CREATION.DETAIL_HEADER'
              : 'SPRM.PURCHASE_REQUISITION_CREATION.DETAIL.LINE_ECOMMERCE,SPRM.PURCHASE_REQUISITION_CREATION.DETAIL_HEADER',
          prLineList,
        };
        if (!errs && !prLineList.errorLine && billDate.error !== 1) {
          this.setState({ headerLoading: true }, () => {
            update(headerData).then((res) => {
              if (res) {
                if (res.messageFlag === 1) {
                  // 神威保存逻辑, 当数量不满足最小数量时,会有提醒.但是还是会去保存
                  notification.warning({ message: res.responseMsg });
                } else if (res?.failed) {
                  notification.error({ message: res.message });
                  this.setState({ headerLoading: false });
                  return;
                } else {
                  notification.success();
                }
                this.header.fetchDetailHeader();
                this.line.fetchDetailList();
              }
            });
          });
        } else {
          const headerMessage = this.getWarningStr(
            filterNullValueObject(headerForm.getFieldsError()),
            intl.get(`${titlePrompt}.orderHeaderInfo`).d('采购申请头信息')
          );
          const billDateMessage =
            billDate.error === 1
              ? this.getWarningStr(
                  filterNullValueObject(this.billingInfo.props.form.getFieldsError()),
                  intl.get(`${titlePrompt}.billDate`).d('开票信息')
                )
              : '';
          const { lineMessage = '' } = prLineList;
          notification.warning({
            message: `${headerMessage} ${lineMessage} ${billDateMessage}`,
          });
        }
      });
    }
  }

  /**
   * submit - 采购申请预提交，表单数据合法性验证，通过后提示弹框
   */
  @Bind()
  @Throttle(500)
  preSubmit() {
    const {
      dispatch,
      location: { search },
      submitDeliveryLoading,
    } = this.props;
    const prLineList = this.handleCheckLineData();
    const headerForm = this.header.handleHeaderSave();
    const headerInfo = this.header.getInfo();
    const listDataSource = this.line.handleLineData();
    const { freight, displayPrNum, prSourcePlatform } = headerInfo;
    if (headerInfo.cancelStatusCode === 'CANCELLED') {
      notification.error({
        message: intl
          .get(`${messagePrompt}.errorMessage`)
          .d('此申请已取消，请至采购申请查询界面查看申请状态。'),
      });
      return;
    }
    headerForm.validateFieldsAndScroll((errs, values) => {
      if (!errs && !prLineList.errorLine) {
        // 提示框 预提交
        if (listDataSource.length > 0) {
          // 提示信息
          let tipMessage = null;
          if (freight) {
            tipMessage = intl
              .get(`${messagePrompt}.preSubmit`, {
                displayPrNum,
              })
              .d(`采购申请${displayPrNum}的行单价将受运费影响产生变动，确定提交吗？`);
          }

          tipMessage = (
            <div>
              {tipMessage}
              {intl.get(`sprm.common.model.common.confirmSubmit`).d('请确认是否继续提交')}
              {/* <div>
                {intl
                  .get(`sprm.common.model.common.budgetCheckSubmit`)
                  .d('以下申请行已超预警线或超量占用，请确认是否继续提交？')}
              </div> */}
            </div>
          );

          if (prSourcePlatform === 'SRM') {
            const { isCopy = 0 } = querystring.parse(search.substr(1));
            const { invoiceAddressName } = headerInfo;
            const { requestDate } = values;
            dispatch({
              type: 'purchaseRequisitionCreation/budgetCheck',
              payload: [
                {
                  ...headerInfo,
                  ...values,
                  invoiceAddress: values.invoiceAddress
                    ? values.invoiceAddress
                    : invoiceAddressName,
                  isCopy,
                  requestDate: requestDate
                    ? requestDate.format(DEFAULT_DATETIME_FORMAT)
                    : undefined,
                  prLineList,
                },
              ],
            }).then((checkMsg) => {
              if (checkMsg) {
                // 预算不足的行
                const failedList = [];

                // 需要检查提示的行
                const checkList = [];

                checkMsg.forEach((header) => {
                  const lineList = header.prLineList;
                  if (!isEmpty(lineList)) {
                    lineList.forEach((line) => {
                      if (line?.failed === '1') {
                        failedList.push({
                          ...line,
                          displayPrNum: header.displayPrNum,
                        });
                      } else if (['02', '03'].includes(line.errorStatusCode)) {
                        checkList.push({
                          ...line,
                          displayPrNum: header.displayPrNum,
                        });
                      }
                    });
                  }
                });

                if (!isEmpty(failedList)) {
                  const prListStr = failedList
                    ?.map((e) => `${e.displayPrNum}|${e.lineNum}`)
                    .join(', ');
                  notification.error({
                    message:
                      intl.get(`${commonPrompt}.prNum`).d('采购申请编号') +
                      prListStr +
                      failedList[0].errorMessage,
                  });
                } else if (!isEmpty(checkList)) {
                  // 余额已超过预警线 或者  余额不足，未超过预算允差范围
                  C7nModal.open({
                    bodyStyle: { padding: '20px' },
                    drawer: true,
                    style: { width: '742px' },
                    closable: true,
                    title: intl.get(`${commonPrompt}.budgetCheckTip`).d('预算校验提示'),
                    border: true,
                    children: <BudgetCheckTable data={checkList} tipMessage={tipMessage} />,
                    okText: intl.get(`sprm.purchaseReqCreation.view.message.confirmOk`).d('确定'),
                    cancelText: intl
                      .get(`sprm.purchaseReqCreation.view.message.confirmCancelText`)
                      .d('取消'),
                    onOk: () => {
                      this.submit(values);
                    },
                  });
                } else {
                  Modal.confirm({
                    title: tipMessage,
                    onOk: () => this.submit(values),
                  });
                }
              }
            });
            return;
          }

          Modal.confirm({
            title: tipMessage,
            confirmLoading: submitDeliveryLoading,
            onOk: () => this.submit(values),
          });
        } else {
          notification.warning({
            message: intl
              .get(`${messagePrompt}.mustHaveLine`)
              .d('该采购申请未维护行信息，无法提交，请确认'),
          });
        }
      }
    });
  }

  /**
   *  提交采购申请单
   *
   * @param {*} [values={}] form 校验后的合法数据
   * @memberof Detail
   */
  @Bind()
  @Debounce(500)
  submit(otherParams = {}) {
    const {
      dispatch,
      location: { search },
      remote,
    } = this.props;
    const prLineList = this.handleCheckLineData();
    const headerForm = this.header.handleHeaderSave();
    const headerInfo = this.header.getInfo();
    const { isCopy = 0 } = querystring.parse(search.substr(1));
    const { prSourcePlatform, invoiceAddressName } = headerInfo;
    const { handleFuncPath = undefined } = remote?.props?.process || {};
    const backPath = isFunction(handleFuncPath)
      ? handleFuncPath()
      : '/sprm/purchase-requisition-creation/list';
    headerForm.validateFields((errs, values) => {
      const { requestDate } = values;
      const headerData = {
        ...headerInfo,
        ...values,
        ...otherParams,
        invoiceAddress: values.invoiceAddress ? values.invoiceAddress : invoiceAddressName,
        isCopy,
        requestDate: requestDate ? requestDate.format(DEFAULT_DATETIME_FORMAT) : undefined,
        customizeUnitCode:
          prSourcePlatform !== 'E-COMMERCE'
            ? 'SPRM.PURCHASE_REQUISITION_CREATION.DETAIL_LINE,SPRM.PURCHASE_REQUISITION_CREATION.DETAIL_HEADER'
            : 'SPRM.PURCHASE_REQUISITION_CREATION.DETAIL.LINE_ECOMMERCE,SPRM.PURCHASE_REQUISITION_CREATION.DETAIL_HEADER',
        prLineList,
      };
      if (!errs && !prLineList.errorLine) {
        dispatch({
          type: 'purchaseRequisitionCreation/singleSubmit',
          payload: { prHeaderList: headerData },
        }).then((res) => {
          if (res) {
            if (res.messageFlag === 1) {
              notification.warning({ message: res.responseMsg });
            } else {
              notification.success();
            }
            this.props.history.push(
              backPath.cuxBackPath || '/sprm/purchase-requisition-creation/list'
            );
          }
        });
      }
    });
  }

  /**
   * delete 删除采购申请
   */
  @Bind()
  @Throttle(500)
  delete() {
    const { dispatch, remote } = this.props;
    const headerInfo = this.header.getInfo();
    const { handleFuncPath } = remote?.props?.process || {};
    if (headerInfo.cancelStatusCode === 'CANCELLED') {
      notification.error({
        message: intl
          .get(`${messagePrompt}.errorMessage`)
          .d('此申请已取消，请至采购申请查询界面查看申请状态。'),
      });
      return;
    }
    const backPath = isFunction(handleFuncPath)
      ? handleFuncPath()
      : '/sprm/purchase-requisition-creation/list';
    Modal.confirm({
      title: intl.get(`${messagePrompt}.confirmDelete`).d('是否删除需求'),
      onOk: () => {
        dispatch({
          type: 'purchaseRequisitionCreation/delete',
          payload: {
            prHeaderDTOs: [headerInfo],
          },
        }).then((res) => {
          if (res) {
            notification.success();
            dispatch(routerRedux.push(backPath.cuxBackPath || backPath));
          }
        });
      },
    });
  }

  @Bind()
  cancel(cancelledRemark = '') {
    const { dispatch, remote } = this.props;
    const headerInfo = this.header.getInfo();
    const { handleFuncPath } = remote?.props?.process || {};
    if (headerInfo.cancelStatusCode === 'CANCELLED') {
      notification.error({
        message: intl
          .get(`${messagePrompt}.errorMessage`)
          .d('此申请已取消，请至采购申请查询界面查看申请状态。'),
      });
      return;
    }
    const backPath = isFunction(handleFuncPath)
      ? handleFuncPath()
      : '/sprm/purchase-requisition-creation/list';
    dispatch({
      type: 'purchaseRequisitionCreation/cancel',
      payload: {
        prHeaderDTOs: [{ ...headerInfo, cancelledRemark }],
      },
    }).then((res) => {
      if (res) {
        notification.success();
        dispatch(
          routerRedux.push({
            pathname: backPath.cuxBackPath || backPath,
          })
        );
      }
    });
  }

  @Bind()
  fetchOtherInfo() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'purchaseRequisitionCreation/fetchOtherInfo',
    });
  }

  /**
   * bindHeaderAttachmentUuid - 绑定头附件id
   * @param {!string} attachmentUuid - 附件uuid返回值
   */
  @Bind()
  bindHeaderAttachmentUuid(attachmentUuid, type) {
    const { dispatch } = this.props;
    const { prHeaderId } = this.state;
    dispatch({
      type:
        type === 'external'
          ? 'purchaseRequisitionCreation/bindExternalAttachmentUuid'
          : 'purchaseRequisitionCreation/bindHeaderAttachmentUuid',
      payload: {
        prHeaderId,
        attachmentUuid,
      },
    }).then((res) => {
      if (res) {
        this.header.fetchDetailHeader();
      }
    });
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  /**
   * afterOpenHeaderUploadModal - 头附件弹窗打开后判断是否获取uuid
   * @param {!Array<object>} attachmentUuid - 附件uuid
   */
  @Bind()
  afterOpenHeaderUploadModal(attachmentUuid) {
    // const { headerInfo = {} } = this.state;
    const headerInfo = this.header.getInfo();
    if (isEmpty(headerInfo.attachmentUuid)) {
      this.bindHeaderAttachmentUuid(attachmentUuid);
    }
  }

  @Bind()
  afterOpenExternalUpload(uuid) {
    const headerInfo = this.header.getInfo();
    if (isEmpty(headerInfo.externalAttachmentUuid)) {
      this.bindHeaderAttachmentUuid(uuid, 'external');
    }
  }

  /**
   * 查询操作记录列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleOperationRecordSearch(page = {}) {
    const { dispatch } = this.props;
    const { prHeaderId } = this.state;
    dispatch({
      type: 'purchaseRequisitionCreation/fetchOperationRecordList',
      payload: {
        prHeaderId,
        page,
      },
    }).then((result) => {
      if (result) {
        this.setState({
          operationRecordList: result.content,
          operationRecordPagination: createPagination(result),
        });
      }
    });
  }

  @Bind()
  handleModalVisible(modalVisible, flag) {
    this.setState({ [modalVisible]: !!flag });
  }

  @Bind()
  changeCompanyLov(currencyValues) {
    if (!isEmpty(currencyValues)) {
      this.setState(currencyValues);
    }
  }

  @Bind()
  openPriceCompare() {
    const { prHeaderId, priceList } = this.state;
    const detailUrl = `/sprm/purchase-requisition-creation/detail?prHeaderId=${prHeaderId}`;
    const router = {
      pathname: `/sprm/purchase-requisition-creation/price-list`,
      state: {
        detailUrl,
        priceList,
      },
    };
    this.props.history.push(router);
  }

  // 页面loading状态
  @Bind()
  togglePageLoading(isLoading = false) {
    this.setState({
      headerLoading: isLoading,
    });
  }

  @Bind()
  fetchBasePrice(companyId, prSourcePlatform) {
    if (companyId && prSourcePlatform === 'SRM') {
      fetchBasePrice({ companyId, prSourcePlatform }).then((res) => {
        this.setState({
          basePriceFlag: res,
        });
      });
    }
  }

  // 针对叮咚买菜的二开逻辑
  @Bind()
  notificationForMaterial(isHeadField = false) {
    const { tenantNum } = getCurrentTenant();
    // eslint-disable-next-line no-useless-return
    if (isHeadField && !this.state.prHeaderId) return;
    if (tenantNum === 'SRM-DDMC') {
      notification.warning({
        message: intl
          .get('sprm.purchaseReqCreation.notification.message.material')
          .d('已修改取价维度，请重新选择物料带出价格'),
      });
    }
  }

  render() {
    const {
      match = {},
      location,
      dispatch,
      deletingLines,
      purchaseRequisitionCreation,
      deleteDeliveryLoading = false,
      cancelDeliveryLoading = false,
      fetchOperationRecordListLoading = false,
      bindingUuid = false,
      submitDeliveryLoading = false,
      saveDetailLoading = false,
      customizeTable,
      customizeForm,
      customizeCollapse,
      customizeBtnGroup,
      remote,
    } = this.props;
    const {
      code,
      isMatch,
      operationRecordList,
      operationRecordPagination,
      operationRecordModalVisible,
      collapseKeys = [],
      priceList = [],
      itemLimitRule = [],
      cancelModalVisible,
      prHeaderId,
      headerInfo,
      headerLoading,
      tableLoading,
      permissonFlag,
      basePriceFlag,
    } = this.state;
    const {
      attachmentUuid,
      cancelStatusCode,
      prStatusCode,
      prSourcePlatform = 'SRM',
      externalAttachmentUuid,
      transactionMode,
    } = headerInfo;
    const operationRecordProps = {
      record: { prSourcePlatform: headerInfo.prSourcePlatform, prHeaderId: headerInfo.prHeaderId },
      pagination: operationRecordPagination,
      dataSource: operationRecordList,
      visible: operationRecordModalVisible,
      loading: fetchOperationRecordListLoading,
      handleOperationRecordSearch: this.handleOperationRecordSearch,
      hideModal: () => this.handleModalVisible('operationRecordModalVisible', false),
    };
    const { search = {} } = location;
    const { isCopy = 0 } = querystring.parse(search.substr(1));
    const EComAndRejectDisabled =
      (prSourcePlatform === 'E-COMMERCE' && prStatusCode === 'REJECTED') || isMatch;
    const renderFlag = [
      'SUBMIT_SYN',
      'CANCELLED',
      'CLOSED',
      'WORKFLOW_APPROVAL',
      'EXOSYS_APPROVAL',
      'SUBMITTED',
      'APPROVED',
    ].includes(prStatusCode);
    const headerInfoFormProps = {
      isMatch,
      isCopy,
      dispatch,
      prHeaderId,
      process: this.process,
      EComAndRejectDisabled,
      prSourcePlatform,
      onRef: (node) => {
        this.header = node;
      },
      remote,
      getlistData: this.line ? this.line.handleLineData : (e) => e,
      setOrgChange: this.line ? this.line.handleMaintain : (e) => e,
      setListData: this.line ? this.line.handleSetLineData : (e) => e,
      getlistUpdate: this.line ? this.line.getlistUpdate : (e) => e,
      afterOpenUploadModal: this.afterOpenHeaderUploadModal,
      customizeForm,
      headerChangeeLoading: this.togglePageLoading,
      fetchBasePrice: this.fetchBasePrice,
      fetchItemLimit: this.fetchItemLimit,
      notificationForMaterial: this.notificationForMaterial,
    };
    const billAndDeliveryProps = {
      headerRef: this.header ? this.header : {},
      headerForm: this.header ? this.header.props.form : {},
      customizeForm,
    };
    const listProps = {
      code,
      isMatch,
      dispatch,
      prStatusCode,
      prSourcePlatform,
      deletingLines,
      customizeTable,
      itemLimitRule,
      onSearch: this.fetchDetailList,
      onUpdateAllDate: this.fetchHeaderAndLine,
      unitFlagChange: this.unitFlagChange,
      onChangeListData: this.handleChangeList,
      onChangeHeader: this.handleChangeHeader,
      customizeForm,
      onChangeLineUpdate: () => {
        this.setState({ tableLoading: false });
      },
      onRef: (node) => {
        this.line = node;
      },
      headerForm: this.header ? this.header.props.form : {},
      headerRef: this.header ? this.header : {},
      deleteLines: this.deleteDetailLines,
      customizeBtnGroup,
      purchaseRequisitionCreation,
      basePriceFlag,
      remote,
      notificationForMaterial: this.notificationForMaterial,
    };
    const uploadModalProps = {
      btnText: intl.get(`entity.attachment.upload`).d('附件上传'),
      btnProps: {
        icon: 'upload',
        disabled: !prHeaderId || renderFlag,
      },
      showFilesNumber: true,
      attachmentUUID: attachmentUuid,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'sprm-pr',
      afterOpenUploadModal: this.afterOpenHeaderUploadModal,
    };
    const externalModalProps = {
      btnText: intl.get(`sprm.common.btn.externalAttachmentUuid`).d('外部附件'),
      btnProps: {
        icon: 'upload',
        disabled: !prHeaderId || renderFlag,
      },
      showFilesNumber: true,
      attachmentUUID: externalAttachmentUuid,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'sprm-pr',
      afterOpenUploadModal: this.afterOpenExternalUpload,
    };
    const tableNewLoading = this.line ? this.line.state.tableLoading : tableLoading;
    const { handleFuncPath = undefined } = remote?.props?.process || {};
    const backPath = isFunction(handleFuncPath)
      ? handleFuncPath()
      : '/sprm/purchase-requisition-creation/list';
    return (
      <Fragment>
        {match.path !== '/pub/sprm/purchase-requisition-creation/detail/:id' && (
          <Header
            title={intl.get(`sprm.purchaseReqCreation.view.title.purchaseMaintain`).d('需求维护')}
            backPath={backPath?.cuxBackPath || backPath}
          >
            <PermissionButton
              permissionList={[
                {
                  code: `hzero.srm.requirement.prm.pr-creation.ps.save`,
                  type: 'button',
                  meaning: '保存按钮权限',
                },
              ]}
              loading={
                headerLoading || tableNewLoading || saveDetailLoading || submitDeliveryLoading
              }
              onClick={() => this.save()}
              icon="save"
              color="primary"
              disabled={
                headerLoading ||
                tableNewLoading ||
                saveDetailLoading ||
                submitDeliveryLoading ||
                renderFlag
              }
            >
              {intl.get(`hzero.common.button.save`).d('保存')}
            </PermissionButton>

            <PermissionButton
              icon="check"
              loading={submitDeliveryLoading}
              onClick={this.preSubmit}
              disabled={
                !prHeaderId ||
                ['SUBMIT_SYNC', 'SUBMITTED', 'APPROVED'].includes(prStatusCode) ||
                headerLoading ||
                tableNewLoading ||
                saveDetailLoading ||
                renderFlag
              }
              permissionList={[
                {
                  code: `hzero.srm.requirement.prm.pr-creation.ps.submit`,
                  type: 'button',
                  meaning: '提交按钮权限',
                },
              ]}
            >
              {intl.get(`hzero.common.button.submit`).d('提交')}
            </PermissionButton>

            <PermissionButton
              permissionList={[
                {
                  code: `hzero.srm.requirement.prm.pr-creation.ps.cancel`,
                  type: 'button',
                  meaning: '取消按钮权限',
                },
              ]}
              loading={cancelDeliveryLoading}
              icon="rollback"
              disabled={
                renderFlag || prSourcePlatform === 'SRM' || transactionMode === 'TRIPARTITE'
              }
              onClick={() => this.handleModalVisible('cancelModalVisible', true)}
            >
              {intl.get(`hzero.common.button.cancel`).d('取消')}
            </PermissionButton>

            <PermissionButton
              permissionList={[
                {
                  code: `hzero.srm.requirement.prm.pr-creation.ps.delete`,
                  type: 'button',
                  meaning: '删除按钮权限',
                },
              ]}
              loading={deleteDeliveryLoading}
              icon="delete"
              disabled={
                !headerInfo?.prHeaderId ||
                prSourcePlatform !== 'SRM' ||
                renderFlag ||
                headerLoading ||
                tableNewLoading ||
                saveDetailLoading
              }
              onClick={this.delete}
            >
              {intl.get(`hzero.common.button.delete`).d('删除')}
            </PermissionButton>

            {cancelStatusCode !== 'CANCELLED' && <UploadModal {...uploadModalProps} />}
            {cancelStatusCode !== 'CANCELLED' && permissonFlag.externalAttachmentUuid && (
              <UploadModal {...externalModalProps} />
            )}
            {priceList.length > 0 && (
              <Button onClick={() => this.openPriceCompare()}>
                {intl.get(`${messagePrompt}.priceList`).d('比价单')}
              </Button>
            )}
            <Button
              loading={submitDeliveryLoading}
              icon="clock-circle-o"
              disabled={saveDetailLoading || headerLoading || tableNewLoading || !prHeaderId}
              onClick={() => this.handleModalVisible('operationRecordModalVisible', true)}
            >
              {intl.get(`hzero.common.button.operating`).d('操作记录')}
            </Button>
          </Header>
        )}
        <Content>
          <Spin
            spinning={headerLoading || saveDetailLoading || submitDeliveryLoading || bindingUuid}
            wrapperClassName={classnames(
              styles['purchase-requisition-creation-detail'],
              DETAIL_DEFAULT_CLASSNAME
            )}
          >
            {customizeCollapse(
              {
                code: 'SPRM.PURCHASE_REQUISITION_CREATION.DETAIL_PANEL',
              },
              <Collapse
                forceRender
                className="form-collapse"
                defaultActiveKey={collapseKeys}
                onChange={this.onCollapseChange}
              >
                <Panel
                  showArrow={false}
                  header={
                    <Fragment>
                      <h3>{intl.get(`${titlePrompt}.orderHeaderInfo`).d('采购申请头信息')}</h3>
                      <a>
                        {collapseKeys.includes('orderHeaderInfo')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')}
                      </a>
                      <Icon type={collapseKeys.includes('orderHeaderInfo') ? 'up' : 'down'} />
                    </Fragment>
                  }
                  key="orderHeaderInfo"
                >
                  <PurchaseRequestHeader {...headerInfoFormProps} />
                </Panel>
                {prSourcePlatform === 'E-COMMERCE' && (
                  <Panel
                    showArrow={false}
                    header={
                      <Fragment>
                        <h3>{intl.get(`${titlePrompt}.deliveryInfo`).d('收货/收单信息')}</h3>
                        <a>
                          {collapseKeys.includes('deliveryInformationHeader')
                            ? intl.get(`hzero.common.button.up`).d('收起')
                            : intl.get(`hzero.common.button.expand`).d('展开')}
                        </a>
                        <Icon
                          type={collapseKeys.includes('deliveryInformationHeader') ? 'up' : 'down'}
                        />
                      </Fragment>
                    }
                    key="deliveryInformationHeader"
                  >
                    <DeliveryInformationHeader {...billAndDeliveryProps} />
                  </Panel>
                )}
                {prSourcePlatform === 'E-COMMERCE' && (
                  <Panel
                    showArrow={false}
                    header={
                      <Fragment>
                        <h3>{intl.get(`${titlePrompt}.billingInfo`).d('开票信息')}</h3>
                        <a>
                          {collapseKeys.includes('billingInformation')
                            ? intl.get(`hzero.common.button.up`).d('收起')
                            : intl.get(`hzero.common.button.expand`).d('展开')}
                        </a>
                        <Icon type={collapseKeys.includes('billingInformation') ? 'up' : 'down'} />
                      </Fragment>
                    }
                    key="billingInformation"
                  >
                    <BillingInformation
                      {...billAndDeliveryProps}
                      onRef={(node) => {
                        this.billingInfo = node;
                      }}
                    />
                  </Panel>
                )}
                {((prSourcePlatform === 'SRM' && prHeaderId) || prSourcePlatform !== 'SRM') && (
                  <Panel
                    showArrow={false}
                    header={
                      <Fragment>
                        <h3>{intl.get(`${titlePrompt}.purchaseLineInfo`).d('采购申请行信息')}</h3>
                        <a>
                          {collapseKeys.includes('purchaseLineInfo')
                            ? intl.get(`hzero.common.button.up`).d('收起')
                            : intl.get(`hzero.common.button.expand`).d('展开')}
                        </a>
                        <Icon type={collapseKeys.includes('purchaseLineInfo') ? 'up' : 'down'} />
                      </Fragment>
                    }
                    key="purchaseLineInfo"
                    className="line"
                  >
                    <PurchaseLineInfo {...listProps} />
                  </Panel>
                )}
              </Collapse>
            )}
          </Spin>
          <OperationRecord {...operationRecordProps} />
          <CancelModal
            handleOk={this.cancel}
            cancelModalVisible={cancelModalVisible}
            onCancel={this.handleModalVisible}
          />
        </Content>
      </Fragment>
    );
  }
}
