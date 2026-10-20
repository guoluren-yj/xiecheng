import React, { Component } from 'react';
import { Tooltip, Lov, Button, Modal } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { isEmpty, isNil, isFunction } from 'lodash';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { yesOrNoRender } from 'utils/renderer';
import notification from 'utils/notification';
import { routerRedux } from 'dva/router';
import { getResponse, getCurrentTenant, getCurrentOrganizationId } from 'utils/utils';
import {
  fetchSettings,
  checkOrderRule,
  poFromPrLineNewCheck,
  lineCreate,
  updateSupplier,
  fetchOrderConfig,
} from '@/services/purchaseExecutionService';
import ReferPrice from '@/routes/components/ReferPrice';
import ReferPriceProduct from '@/routes/components/ReferPriceProduct';
import SupplierModal from '../components/SupplierModal';
import ViewFilter from '@/routes/components/ViewFilter';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import ChangeOrderCodeRender from '@/routes/components/ChangeOrderCodeRender';
import OutsourcingBom from '../../NewPurchaseDetail/components/OutsourcingBom';

import urgentImg from '@/assets/icon-expedited.svg';

const commonPrompt = 'sprm.common.model.common';
const organizationId = getCurrentOrganizationId();
@formatterCollections({
  code: ['sprm.common', 'smdm.common', 'sodr.workspace', 'ssrc.priceLibrary'],
})
export default class TransferOrder extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      setting: '0',
      tableDisplay: 'flat',
    };
  }

  @Bind()
  setDisplayStatus(tableDisplay) {
    this.setState({
      tableDisplay,
    });
  }

  // 渲染状态列
  @Bind()
  isEnabledRender({ value }) {
    const btns = [];
    btns.push(yesOrNoRender(Number(value)));
    return btns;
  }

  componentDidMount() {
    this.fetchSettings();
  }

  @Bind()
  handleOrderCreate() {
    return new Promise(async (resolve) => {
      const { orderLineDs, clearSelectAll, changeTabNum, remote } = this.props;
      const { selected } = orderLineDs;
      const validateFlag = await orderLineDs.validate();
      const validateArray = [];
      const { orderCreateCheck } = remote?.props?.process || {};
      selected.forEach(async (ele) => {
        const recordErrorMsg = ele.getValidationErrors()?.map((item) => item.errors[0]);
        validateArray.push(...recordErrorMsg);
      });
      const errorMsgList = [];

      const data = orderLineDs.selected?.map((ele) => {
        const newDate = ele.toJSONData();
        return { ...newDate };
      });
      if (isEmpty(data)) {
        notification.error({
          message: intl.get(`hzero.common.validation.atLeast`).d('请至少选择一条数据'),
        });
        resolve();
        return;
      }
      if (remote) {
        const beforeCreateCheck = await remote.event.fireEvent('beforeCreateCheck', {
          currentListDs: orderLineDs,
          currentPage: 'orderCheck',
        });
        if (beforeCreateCheck === false) {
          return false;
        }
      }
      if (validateArray.length > 0 && !validateFlag) {
        const errorTpye = validateArray?.map((ele) => ele.ruleName);
        const aa = Array.from(new Set(errorTpye));
        aa.forEach((e) => {
          const aaa = validateArray.filter((item) => item.ruleName === e);
          if (e === 'valueMissing') {
            const zzz = Array.from(new Set(aaa?.map((item) => item.injectionOptions.label)));
            errorMsgList.push(
              intl.get('hzero.common.validation.notNull', {
                name: zzz.join('，'),
              })
            );
          } else {
            aaa.forEach((item) => {
              errorMsgList.push(item.validationMessage);
            });
          }
        });
        notification.error({ message: errorMsgList.join('；') });
        resolve();
        return false;
      }

      const orderCreate = async () => {
        const validateRes = getResponse(await poFromPrLineNewCheck(data));
        if (!validateRes) {
          resolve();
          return;
        }
        const { poCreatePopUpFlag, poCreateErrorMsg } = validateRes || {};
        if (poCreatePopUpFlag === 1) {
          const validateModalRes = await Modal.confirm({
            children: poCreateErrorMsg,
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            okText: intl.get('sodr.workspace.view.button.createPO').d('新建订单'),
          });
          if (validateModalRes !== 'ok') {
            resolve();
            return;
          }
        }
        const result = getResponse(await checkOrderRule({ sourceCode: 'PURCHASE_REQUEST' }));
        if (result === 1) {
          if (data.length > 0) {
            await lineCreate(data).then((res) => {
              if (res?.failed) {
                notification.error({ message: res.message });
                resolve();
              }
              if (res && res.length > 1) {
                notification.success();
                const { poHeaderId, poSourcePlatform } = res[0];
                this.handleToDetail(poHeaderId, poSourcePlatform, {
                  linkIds: res,
                  linkFlag: 1,
                  prNumList: data.map((e) => `${e.prNum}-${e.displayLineNum}`),
                });
              } else if (res && !res.failed && res.length === 1) {
                const { poHeaderId, poSourcePlatform } = res[0];
                notification.success();
                this.handleToDetail(poHeaderId, poSourcePlatform, {
                  linkIds: res,
                  prNumList: data.map((e) => `${e.prNum}-${e.displayLineNum}`),
                });
              }
              clearSelectAll(orderLineDs);
              orderLineDs.query().then(() => {
                changeTabNum({ orderCount: orderLineDs.totalCount });
              });
              resolve();
            });
          }
        } else if (result === 0) {
          if (data.length > 0) {
            lineCreate(data).then((res) => {
              if (res?.failed) {
                notification.error({ message: res.message });
                resolve();
              }
              if (res && !res.failed && res[0]) {
                const { poHeaderId, poSourcePlatform } = res[0];
                orderLineDs.query().then(() => {
                  changeTabNum({ orderCount: orderLineDs.totalCount });
                });
                this.handleToDetail(poHeaderId, poSourcePlatform, {
                  linkIds: res,
                  prNumList: data.map((e) => `${e.prNum}-${e.displayLineNum}`),
                });
                clearSelectAll(orderLineDs);
                notification.success();
                resolve();
              }
            });
          }
        } else {
          resolve();
        }
      };

      if (isFunction(orderCreateCheck)) {
        const flag = await orderCreateCheck({ data });
        if (flag) {
          orderCreate();
        } else {
          resolve();
        }
      } else {
        orderCreate();
      }
    });
  }

  /**
   * 跳转到详情页
   * @param {String} headerId
   */
  @Bind()
  handleToDetail(headerId, source, linkIdsFlag = {}) {
    // 存放首次加载价格库查询标识
    const { dispatch } = this.props;
    const { linkFlag, linkIds = [], prNumList } = linkIdsFlag || {};
    const itemKey = `sodr.quotePurchaseRequisition.${Math.random()}`;
    window.sessionStorage.setItem(itemKey, 1);
    // 获取老订单工作台配置表信息
    fetchOrderConfig({
      tenantNum: getCurrentTenant().tenantNum,
    }).then((res) => {
      const result = getResponse(res);
      if (result && !isEmpty(result)) {
        const menuLeafNodes = window?.dvaApp?._store?.getState()?.global?.menuLeafNode || [];
        const linkRouteFlag = menuLeafNodes.some(
          (node) => node.functionMenuCode === 'srm.po-admin.po.po-change'
        );
        if (!linkRouteFlag) {
          const prListStr = prNumList?.join(',') || '';
          notification.warning({
            message: intl
              .get('sprm.common.model.outMenu.errorLink', { prNumList })
              .d(
                `【${prListStr}】单据已创建成功，由于当前角色无对应菜单权限，无法跳转至对应菜单，请添加权限后再操作。`
              ),
          });
        } else if (linkFlag === 1) {
          const poHeaderList = linkIds?.map((n) => n.poHeaderId)?.join(',');
          dispatch(
            routerRedux.push({
              pathname: `/sodr/purchase-order-maintain/quote-purchase-requisition/tab-line-newCreation`,
              search: `?poHeaderId=${poHeaderList}&cacheKey=${linkIds[0]?.cacheKey}&source=newRequisition&sourcePage=pageRequest&poSourcePlatform=${source}`,
            })
          );
        } else if (source === 'CATALOGUE') {
          dispatch(
            routerRedux.push({
              pathname: `/sodr/purchase-order-maintain/quote-purchase-requisition/line-creation`,
              search: `?poHeaderId=${headerId}&source=requisition&itemKey=${itemKey}&poSourcePlatform=${source}`,
            })
          );
        } else if (source === 'SRM' || source === 'ERP' || source === 'SHOP') {
          dispatch(
            routerRedux.push({
              pathname: `/sodr/purchase-order-maintain/quote-purchase-requisition/line-newCreation`,
              search: `?poHeaderId=${headerId}&source=newRequisition&sourcePage=pageRequest&poSourcePlatform=${source}`,
            })
          );
        } else if (source === 'E-COMMERCE') {
          dispatch(
            routerRedux.push({
              pathname: `/sodr/purchase-order-maintain/quote-purchase-requisition/sheet-creation`,
              search: `?poHeaderId=${headerId}&source=requisition&itemKey=${itemKey}&poSourcePlatform=${source}`,
            })
          );
        }
      } else {
        const menuLeafNodes = window?.dvaApp?._store?.getState()?.global?.menuLeafNode || [];
        const linkRouteFlag = menuLeafNodes.some(
          (node) => node.functionMenuCode === 'srm.po-admin.po.order-workspace'
        );
        if (!linkRouteFlag) {
          const prListStr = prNumList?.join(',') || '';
          notification.warning({
            message: intl
              .get('sprm.common.model.outMenu.errorLink', { prNumList: prListStr })
              .d(
                `【${prListStr}】单据已创建成功，由于当前角色无对应菜单权限，无法跳转至对应菜单，请添加权限后再操作。`
              ),
          });
        } else if (source === 'CATALOGUE') {
          dispatch(
            routerRedux.push({
              pathname: `/sodr/order-workspace/detail/catalogue-request/${headerId}`,
              state: { initPoDataList: linkIds },
            })
          );
        } else if (source === 'SRM' || source === 'ERP' || source === 'SHOP') {
          dispatch(
            routerRedux.push({
              pathname: `/sodr/order-workspace/detail/purchase-request/${headerId}`,
              state: { initPoDataList: linkIds },
            })
          );
        } else if (source === 'E-COMMERCE') {
          dispatch(
            routerRedux.push({
              pathname: `/sodr/order-workspace/detail/ecommerce-request/${headerId}`,
              state: { initPoDataList: linkIds },
            })
          );
        }
      }
    });
    // if (source === 'ERP' || source === 'SRM' || source === 'SHOP') {
    //   dispatch(
    //     routerRedux.push({
    //       pathname: `/sodr/purchase-order-maintain/quote-purchase-requisition/line-newCreation`,
    //       search: `?poHeaderId=${headerId}&source=newRequisition&sourcePage=pageRequest`,
    //     })
    //   );
    // } else {
    //   // 旧版采购申请转订单页面跳转逻辑
    //   dispatch(
    //     routerRedux.push({
    //       pathname: `/sodr/purchase-order-maintain/quote-purchase-requisition/line-creation`,
    //       search: `?poHeaderId=${headerId}&source=requisition&itemKey=${itemKey}`,
    //     })
    //   );
    // }
  }

  /**
   * fetchDetailHeader - 查询配置中心
   */
  @Bind()
  fetchSettings() {
    fetchSettings().then((res) => {
      if (res) {
        this.setState({
          setting: res['000112'] || '0',
        });
      }
    });
  }

  /**
   * 控制弹窗的显示和隐藏
   * @param {String} modalVisible
   * @param {Boolean} flag
   * @memberof Detail
   */
  @Bind()
  handleModalVisible(modalVisible, flag) {
    this.setState({ [modalVisible]: !!flag });
  }

  @Bind()
  changeSupplier(dataList) {
    const { orderLineDs, remote } = this.props;
    const { updateSupplierCb } = remote?.props?.process || {};
    const currentDate = orderLineDs.current;
    const { setting } = this.state;
    if (dataList) {
      const {
        supplierCompanyId,
        supplierCompanyNum,
        supplierCompanyName,
        unitPrice,
        uomId,
        uomName,
        currencyCode,
        taxId,
        taxRate,
        enteredTaxIncludedPrice,
        netPrice,
        priceLibId,
        priceLibraryId,
        taxIncludedPrice,
        unitPriceBatch,
        holdPcHeaderId,
        holdPcLineId,
        contractNum,
        supplierName,
        supplierId,
        supplierNum,
        benchmarkPriceType,
        ladderPriceLibId,
        ladderQuotationFlag,
        productEcSourceFrom,
        ecLimitQuantity,
        skuId,
        marketPrice,
        prPriceSource,
        prPriceSourceMeaning,
      } = dataList;
      // eslint-disable-next-line no-unused-expressions
      currentDate?.set({
        selectSupplierCompanyId: supplierCompanyId,
        selectSupplierCode: supplierCompanyNum,
        selectSupplierCompanyName: supplierCompanyName,
        noUnitPrice: unitPrice,
        selectLocalSupplierCode: isNil(supplierCompanyId) ? null : supplierNum,
        selectLocalSupplierId: isNil(supplierId) ? null : supplierId,
        selectLocalSupplierName: isNil(supplierCompanyId) ? null : supplierName,
        marketPrice,
        skuId,
        productEcSourceFrom,
        priceSource:
          prPriceSource === 'MANUALLY_E-COMMERCE_PRODUCT' ? 'E-COMMERCE_PRODUCT' : prPriceSource,
        priceSourceMeaning: prPriceSourceMeaning,
        priceProductId: skuId,
        priceEcPlatformCode: productEcSourceFrom,
        ecLimitQuantity,
      });
      if (isFunction(updateSupplierCb)) {
        updateSupplierCb(currentDate, dataList || {}, 'orderSingleGetSupplier');
      }
      if (
        priceLibId &&
        ((setting === '1' && uomId === currentDate?.get('uomId')) || setting === '0')
      ) {
        // eslint-disable-next-line no-unused-expressions
        currentDate?.set({
          uomId,
          uomName,
          currencyCode,
          taxId,
          taxRate,
          noUnitPrice: netPrice,
          unitPrice: netPrice,
          priceLibraryId,
          priceLibId,
          taxIncludedPrice: enteredTaxIncludedPrice || taxIncludedPrice,
          unitPriceBatch,
          holdPcHeaderId,
          holdPcLineId,
          contractNum,
          benchmarkPriceType,
          ladderPriceLibId,
          ladderQuotationFlag,
          originUnitPrice: benchmarkPriceType === 'NET_PRICE' ? netPrice : taxIncludedPrice,
          enteredTaxIncludedPrice: enteredTaxIncludedPrice || taxIncludedPrice,
          selectLocalSupplierCode: isNil(supplierId) ? null : supplierNum,
          selectLocalSupplierId: isNil(supplierId) ? null : supplierId,
          selectLocalSupplierName: isNil(supplierId) ? null : supplierName,
        });
      }
    } else {
      // eslint-disable-next-line no-unused-expressions
      currentDate?.set({
        selectSupplierCompanyId: null,
        selectSupplierCode: null,
        selectSupplierCompanyName: null,
        noUnitPrice: null,
        selectLocalSupplierId: null,
        selectLocalSupplierCode: null,
        selectLocalSupplierName: null,
        priceLibraryId: null,
      });
    }
  }

  @Bind()
  async handleClearSupplier() {
    const { orderLineDs } = this.props;
    const { selected = [] } = orderLineDs || {};
    if (isEmpty(selected)) {
      notification.error({
        message: intl.get(`hzero.common.validation.atLeast`).d('请至少选择一条数据'),
      });
      return;
    }
    selected.forEach((i) => {
      i.set({
        supplierLov: null,
        netPrice: null,
        noUnitPrice: null,
        skuId: null,
        uomId: null,
        uomName: null,
        uomCodeAndName: null,
        currencyCode: null,
        taxId: null,
        taxRate: null,
        unitPrice: null,
        priceLibId: null,
        taxIncludedPrice: null,
        taxIncludedUnitPrice: null,
        platformSupplierId: null,
        unitPriceBatch: null,
        holdPcHeaderId: null,
        holdPcLineId: null,
        contractNum: null,
        benchmarkPriceType: null,
        ladderPriceLibId: null,
        ladderQuotationFlag: null,
        originUnitPrice: null,
        enteredTaxIncludedPrice: null,
        selectSupplierCompanyId: null,
        selectSupplierCode: null,
        selectSupplierCompanyName: null,
        selectLocalSupplierId: null,
        selectLocalSupplierCode: null,
        selectLocalSupplierName: null,
        productEcSourceFrom: null,
        marketPrice: null,
        priceSource: null,
        priceSourceMeaning: null,
        priceProductId: null,
        priceEcPlatformCode: null,
        ecLimitQuantity: null,
        selectSupplierTenantId: null,
      });
    });
  }

  @Bind()
  async handleUpdateSupplier() {
    const { orderLineDs, remote } = this.props;
    const { updateSupZmn, updateSupplierCb } = remote?.props?.process || {};
    const data = orderLineDs?.selected?.map((ele) => {
      const newDate = ele.toJSONData();
      return { ...newDate };
    });
    if (isEmpty(data)) {
      notification.error({
        message: intl.get(`hzero.common.validation.atLeast`).d('请至少选择一条数据'),
      });
      return;
    }
    const res = await updateSupplier(data);
    if (getResponse(res)) {
      if (isFunction(updateSupZmn)) {
        await updateSupZmn(res);
        orderLineDs.query();
      }
      orderLineDs.selected.forEach((i) => {
        const currentLine = res.find((t) => t.prLineId === i.get('prLineId'));
        const {
          uomId,
          uomName,
          uomCodeAndName,
          currencyCode,
          taxId,
          taxRate,
          netPrice,
          priceLibId,
          priceLibraryId,
          taxIncludedPrice,
          unitPriceBatch,
          holdPcHeaderId,
          holdPcLineId,
          contractNum,
          benchmarkPriceType,
          ladderPriceLibId,
          ladderQuotationFlag,
          enteredTaxIncludedPrice,
          selectSupplierCompanyId,
          selectSupplierCode,
          selectSupplierCompanyName,
          selectLocalSupplierId,
          selectLocalSupplierCode,
          selectLocalSupplierName,
          selectSupplierTenantId,
          productEcSourceFrom,
          ecLimitQuantity,
          skuId,
          marketPrice,
          prPriceSource,
          prPriceSourceMeaning,
        } = currentLine || {};
        if (currentLine) {
          i.set({
            skuId,
            uomId,
            uomName,
            uomCodeAndName,
            currencyCode,
            taxId,
            taxRate,
            noUnitPrice: netPrice,
            unitPrice: netPrice,
            priceLibId,
            taxIncludedPrice: enteredTaxIncludedPrice,
            taxIncludedUnitPrice: enteredTaxIncludedPrice || taxIncludedPrice,
            platformSupplierId: selectSupplierCompanyId,
            unitPriceBatch,
            holdPcHeaderId,
            holdPcLineId,
            contractNum,
            benchmarkPriceType,
            ladderPriceLibId,
            ladderQuotationFlag,
            originUnitPrice: benchmarkPriceType === 'NET_PRICE' ? netPrice : taxIncludedPrice,
            enteredTaxIncludedPrice,
            selectSupplierCompanyId,
            selectSupplierCode,
            selectSupplierCompanyName,
            selectLocalSupplierId,
            selectLocalSupplierCode,
            selectLocalSupplierName,
            productEcSourceFrom,
            marketPrice,
            priceSource:
              prPriceSource === 'MANUALLY_E-COMMERCE_PRODUCT'
                ? 'E-COMMERCE_PRODUCT'
                : prPriceSource,
            priceSourceMeaning: prPriceSourceMeaning,
            priceProductId: skuId,
            priceEcPlatformCode: productEcSourceFrom,
            ecLimitQuantity,
            selectSupplierTenantId,
            supplierLov: {
              selectSupplierTenantId,
              priceLibId,
              priceLibraryId,
              supplierTenantId: selectSupplierTenantId,
              supplierCompanyId: selectSupplierCompanyId,
              supplierCompanyNum: selectSupplierCode,
              supplierCompanyName: selectSupplierCompanyName,
              displaySupplierCompanyName: selectSupplierCompanyName || selectLocalSupplierName,
              selectLocalSupplierId,
              displaySupplierCompanyId: selectLocalSupplierId,
              displaySupplierCompanyNum: selectLocalSupplierCode,
              selectLocalSupplierName,
              netPrice,
            },
          });
          if (isFunction(updateSupplierCb)) {
            updateSupplierCb(i, currentLine || {}, 'orderBtnGetSupplier');
          }
        }
      });

      notification.success();
    }
  }

  @Bind()
  handleQuery({ params = {} }) {
    const { orderLineDs, location = {}, remote } = this.props;
    const { cuxOrderMutiData = [] } = remote?.props?.process || {};
    const { _back } = location?.state || {};
    const { customizeOrderField = undefined } = params;
    const clearParams = {}; // 清理

    // eslint-disable-next-line no-unused-expressions
    const dataObj = orderLineDs.queryDataSet?.current?.toData() || {};
    const cuxMuliCode = cuxOrderMutiData?.map((ele) => ele.code) || [];
    if (dataObj) {
      for (const key in dataObj) {
        if (
          ![
            'multiSelectHeaderNums',
            'multiSelectHeaderAndLineNums',
            'supplierCompanyId',
            'supplierId',
            'localSupplierIds',
            'platformSupplierIds',
            ...cuxMuliCode,
          ].includes(key)
        ) {
          // 排除掉自定义的查询条件
          if (!Object.prototype.hasOwnProperty.call(params, key)) {
            clearParams[key] = undefined;
          }
        }
      }
    }
    orderLineDs.setQueryParameter('customizeOrderField', customizeOrderField);

    // eslint-disable-next-line no-unused-expressions
    orderLineDs.queryDataSet.current
      ? orderLineDs.queryDataSet.current.set({
          ...params,
          ...clearParams,
        })
      : orderLineDs.queryDataSet.loadData([
          {
            ...params,
            ...clearParams,
          },
        ]);

    if (_back === -1) {
      orderLineDs.query(orderLineDs.currentPage);
    } else {
      orderLineDs.query();
    }
  }

  @Bind()
  onChangeField({ name, value, record }) {
    const { orderLineDs } = this.props;
    if (name === 'tempKey') {
      if (record.getField(name)?.get('lovCode') === 'SSLM.SUPPLIER_CHOOSE') {
        // eslint-disable-next-line no-unused-expressions
        orderLineDs.queryDataSet?.current?.set({
          supplierCompanyId: value?.supplierCompanyIds,
          supplierId: value?.extSupplierIds,
        });
      } else {
        // eslint-disable-next-line no-unused-expressions
        orderLineDs.queryDataSet?.current?.set({
          supplierCompanyId: value?.supplierCompanyId,
          supplierId: value?.supplierId,
        });
      }
    } else if (name === 'supplierList') {
      if (record.getField(name)?.get('lovCode') === 'SSLM.SUPPLIER_CHOOSE') {
        const localSupplierIds = [];
        const platformSupplierIds = [];
        (value || []).forEach((ele) => {
          const { supplierCompanyIds, extSupplierIds } = ele;
          if (extSupplierIds) {
            localSupplierIds.push(extSupplierIds);
          } else {
            platformSupplierIds.push(supplierCompanyIds);
          }
        });
        // eslint-disable-next-line no-unused-expressions
        orderLineDs.queryDataSet?.current?.set({
          localSupplierIds: isEmpty(localSupplierIds) ? undefined : localSupplierIds.join(','),
          platformSupplierIds: isEmpty(platformSupplierIds)
            ? undefined
            : platformSupplierIds.join(','),
        });
      } else {
        const localSupplierIds = [];
        const platformSupplierIds = [];
        (value || []).forEach((ele) => {
          const { supplierCompanyId, supplierId } = ele;
          if (supplierId) {
            localSupplierIds.push(supplierId);
          } else {
            platformSupplierIds.push(supplierCompanyId);
          }
        });
        // eslint-disable-next-line no-unused-expressions
        orderLineDs.queryDataSet?.current?.set({
          localSupplierIds: isEmpty(localSupplierIds) ? undefined : localSupplierIds.join(','),
          platformSupplierIds: isEmpty(platformSupplierIds)
            ? undefined
            : platformSupplierIds.join(','),
        });
      }
    } else if (!value) {
      // eslint-disable-next-line no-unused-expressions
      orderLineDs.queryDataSet?.current?.set({ [name]: undefined });
    }
  }

  @Bind()
  resetQueryDs() {
    const { orderLineDs } = this.props;
    // eslint-disable-next-line no-unused-expressions
    orderLineDs.queryDataSet?.current?.reset();
  }

  render() {
    const { tableDisplay } = this.state;
    const { orderLineDs, customizeTable, uomControl, remote, productPlaceConfig } = this.props; // customizeTable
    const {
      cuxOrderMutiData = [],
      cuxReferPriceLable = '',
      cuxSupplierModalCols = undefined,
      updateSupplierCb = undefined,
      cuxShowLink = undefined,
    } = remote?.props?.process || {};
    const normalColumns = [
      {
        name: 'docInfoGroup',
        header: intl.get(`sprm.common.model.common.docInfoGroup`).d('采购申请单号信息'),
        aggregation: true,
        align: 'left',
        children: [
          {
            name: 'prNum',
            width: 160,
            renderer: ({ value, record }) => (
              <div className="row-agent-column">
                {`${value}-${record.get('displayLineNum')}`}
                {record.get('urgentFlag') === 1 ? (
                  <Tooltip title={intl.get(`${commonPrompt}.urgent`).d('申请加急')}>
                    <img src={urgentImg} alt="img" />
                  </Tooltip>
                ) : null}
              </div>
            ),
          },
          {
            name: 'prNumLink',
            width: 180,
            title: intl.get(`${commonPrompt}.prNum`).d('采购申请编号'),
            renderer: ({ record }) => {
              const menuLeafNodes = window?.dvaApp?._store?.getState()?.global?.menuLeafNode || [];
              const disabledBtnFlag = menuLeafNodes.findIndex(
                (node) => node.functionMenuCode === 'hzero.srm.requirement.prm.pr-platform'
              );
              const { dispatch } = this.props;
              return (
                <Button
                  onClick={() => {
                    dispatch(
                      routerRedux.push({
                        pathname: `/sprm/purchase-platform/noerp-detail/${record.get(
                          'prHeaderId'
                        )}`,
                      })
                    );
                  }}
                  funcType="link"
                  color="primary"
                  disabled={disabledBtnFlag === -1}
                >
                  {`${record.get('prNum')}`}
                </Button>
              );
            },
          },
          { width: 120, name: 'prTypeName' },
          {
            name: 'prSourcePlatformMeaning',
            width: 100,
          },
          {
            name: 'prRequestedName',
            width: 120,
            renderer: ({ value, record }) =>
              record.get('prRequestedNum') ? `${record.get('prRequestedNum')}-${value}` : value,
          },
        ],
      },
      {
        name: 'purInfoGroup',
        header: intl.get(`sprm.common.model.common.purInfoGroup`).d('采买组织信息'),
        aggregation: true,
        align: 'left',
        children: [
          {
            name: 'companyName',
            width: 200,
          },
          {
            name: 'ouName',
            width: 200,
          },
          {
            name: 'purchaseOrgName',
            width: 200,
          },
          {
            name: 'invOrganizationName',
            width: 200,
          },
          {
            name: 'purchaseAgentId',
            width: 120,
          },
        ],
      },
      {
        name: 'lineInfoGroup',
        header: intl.get(`sprm.common.model.common.lineInfoGroup`).d('行信息'),
        aggregation: true,
        align: 'left',
        width: 180,
        children: [
          {
            name: 'lineNum',
            width: 100,
            renderer: ({ record }) => record.get('displayLineNum'),
          },
          {
            name: 'quantity',
            width: 120,
          },
          {
            name: 'uomName',
            width: 120,
            renderer: ({ record }) =>
              record.get('uomCodeAndName') ? record.get('uomCodeAndName') : record.get('uomName'),
          },

          {
            name: 'prLineUomCodeAndName',
            width: 120,
            renderer: ({ record }) =>
              record.get('prLineUomCodeAndName')
                ? record.get('prLineUomCodeAndName')
                : record.get('prLineUomName'),
          },
          {
            name: 'neededDate',
            width: 150,
          },
        ],
      },
      {
        name: 'productInfoGroup',
        header: intl.get(`sprm.common.model.common.productInfoGroup`).d('物料/商品信息'),
        aggregation: true,
        align: 'left',
        children: [
          {
            name: 'itemCode',
            width: 120,
          },
          {
            name: 'itemName',
            width: 120,
          },
          {
            name: 'categoryName',
            width: 120,
          },
          {
            name: 'productNum',
            width: 120,
          },
          {
            name: 'productName',
            width: 120,
          },
          {
            name: 'catalogName',
            width: 120,
          },
          {
            name: 'itemModel',
            width: 100,
          },
          {
            name: 'itemSpecs',
            width: 100,
          },
        ],
      },
      {
        name: 'orderInfoGroup',
        header: intl.get(`sprm.common.model.common.orderInfoGroup`).d('下单信息'),
        aggregation: true,
        align: 'left',
        children: [
          {
            name: 'supplierLov',
            width: 120,
            editor: (record) => {
              const renderFlag = ['SRM', 'ERP'].includes(record.get('prSourcePlatform'));
              if (renderFlag && productPlaceConfig) {
                return false;
              } else if (['SRM', 'ERP', 'SHOP'].includes(record.get('prSourcePlatform'))) {
                return <Lov name="supplierLov" onChange={this.changeSupplier} />;
              } else {
                return renderFlag;
              }
            },
            renderer: ({ record }) => {
              if (['SRM', 'ERP', 'SHOP'].includes(record.get('prSourcePlatform'))) {
                return record.get('selectDisplaySupplierCompanyName');
              } else {
                return null;
              }
            },
          },
          {
            name: 'thisOrderQuantity',
            width: 120,
            editor: (record) => {
              return !!orderLineDs.selected.includes(record);
            },
          },
          {
            name: 'ecLimitQuantity',
            width: 120,
          },
          {
            name: 'restPoQuantity',
            width: 120,
          },
          {
            width: 120,
            name: 'supplierCode',
          },
          {
            width: 120,
            name: 'supplierName',
          },
          {
            name: 'receiverAddress',
            width: 150,
          },
        ],
      },
      {
        name: 'amountInfoGroup',
        header: intl.get(`sprm.common.model.common.amountInfoGroup`).d('单价/金额信息'),
        aggregation: true,
        align: 'left',
        width: 180,
        children: [
          {
            name: 'referencePriceDisplayFlag',
            width: 120,
            renderer: ({ value, record }) => {
              if (
                value &&
                productPlaceConfig &&
                ['ERP', 'SRM'].includes(record?.get('prSourcePlatform'))
              ) {
                return (
                  <ReferPriceProduct
                    currentRecord={record}
                    cuxLable={cuxReferPriceLable}
                    customizeTable={customizeTable}
                    cusCode="SPRM.PURCHASE_EXECUTION.C7NLADDERPRICEMODAL"
                  />
                );
              } else if (value || isFunction(cuxShowLink)) {
                return (
                  <ReferPrice
                    currentRecord={record}
                    cuxLable={cuxReferPriceLable}
                    cuxShowLink={cuxShowLink}
                    customizeTable={customizeTable}
                    cusCode="SPRM.PURCHASE_EXECUTION.C7NLADDERPRICEMODAL"
                  />
                );
              } else {
                return null;
              }
            },
            // return value === true ? (
            //   <ReferPrice
            //     currentRecord={record}
            //     cuxLable={cuxReferPriceLable}
            //     customizeTable={customizeTable}
            //     cusCode="SPRM.PURCHASE_EXECUTION.C7NLADDERPRICEMODAL"
            //   />
            // ) : null;
            // },
          },
          {
            name: 'noUnitPrice',
            width: 120,
          },
          {
            name: 'currencyCode',
            width: 120,
          },
          {
            width: 120,
            name: 'taxIncludedUnitPrice',
          },
        ],
      },
      {
        name: 'executionInfoGroup',
        header: intl.get(`sprm.common.model.common.executionInfoGroup`).d('执行信息'),
        aggregation: true,
        align: 'left',
        width: 180,
        children: [
          {
            name: 'urgentFlag',
            width: 100,
            renderer: this.isEnabledRender,
          },
          {
            name: 'executorName',
            width: 100,
          },
          {
            name: 'urgentDate',
            width: 150,
          },
          {
            name: 'occupiedQuantity',
            width: 120,
          },
          {
            width: 120,
            name: 'changeOrderCode',
            renderer: ({ value, record }) => ChangeOrderCodeRender({ record, value }),
          },
          {
            name: 'downsStreamQuantity',
            width: 150,
          },
          {
            name: 'sourceDownsStreamQuantity',
            width: 120,
          },
        ],
      },
      {
        name: 'projectInfoGroup',
        header: intl.get(`sprm.common.model.common.projectInfoGroup`).d('项目信息'),
        aggregation: true,
        align: 'left',
        children: [
          {
            name: 'projectCategoryMeaning',
            width: 120,
          },
          {
            name: 'pcNum',
            width: 120,
          },
        ],
      },
      {
        name: 'otherInfoGroup',
        header: intl.get(`sprm.common.model.common.otherInfoGroup`).d('其他信息'),
        aggregation: true,
        align: 'left',
        children: [
          {
            name: 'commonName',
            width: 120,
          },
          {
            name: 'surfaceTreatFlag',
            width: 100,
            renderer: ({ value }) => (value ? this.isEnabledRender : null),
          },
          {
            name: 'remark',
            width: 120,
          },
        ],
      },
      {
        name: 'secondaryUomId',
        renderer: ({ record }) => record.get('secondaryUomCodeAndName'),
      },
      { name: 'secondaryTaxInUnitPrice', width: 120 },
      { name: 'secondaryQuantity', width: 120 },
      {
        width: 120,
        name: 'projectTaskId',
      },
      {
        name: 'defaultOrderingAddress',
        width: 120,
      },
      {
        width: 120,
        name: 'priceSource',
      },
      {
        width: 120,
        name: 'priceEcPlatformCode',
      },
      {
        name: 'chooseSupplier',
        width: 120,
        editor: false,
        renderer: ({ record }) => {
          if (['SRM', 'ERP'].includes(record.get('prSourcePlatform')) && productPlaceConfig) {
            return (
              <SupplierModal
                currentRecord={record}
                sourceType="order"
                updateSupplierCb={updateSupplierCb}
                cuxSupplierModalCols={cuxSupplierModalCols}
              />
            );
          } else if (['SRM', 'ERP'].includes(record.get('prSourcePlatform'))) {
            return record.get('selectDisplaySupplierCompanyName');
          } else {
            return null;
          }
        },
      },
      {
        name: 'outsourcingBomFlag',
        width: 150,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'outsourcingBom',
        width: 150,
        renderer: ({ record }) =>
          record?.get('outsourcingBomFlag') ? (
            <OutsourcingBom
              record={record}
              readOnly
              customizeTable={customizeTable}
              custCode="SPRM.PURCHASE_PLAFORM_QUERY.OUTSOURCINGBOM"
            />
          ) : null,
      },
    ];

    const baseUomInfo =
      uomControl?.SPRM === 1 || uomControl?.SODR === 1
        ? []
        : ['secondaryUomId', 'secondaryTaxInUnitPrice', 'secondaryQuantity'];

    const productPriceList = productPlaceConfig
      ? []
      : ['defaultOrderingAddress', 'chooseSupplier', 'prPriceSource', 'productEcSourceFrom'];

    const {
      cuxPoColumns,
      initCuxPageSize = ['10', '20', '50', '100', '200'],
      cuxInitLovQueryParams = undefined,
    } = remote?.props?.process || {};
    const columns = isFunction(cuxPoColumns) ? cuxPoColumns({ normalColumns }) : normalColumns;
    const cuxLovParams = isFunction(cuxInitLovQueryParams)
      ? cuxInitLovQueryParams({ type: 'order' })
      : {};
    return (
      <div style={{ height: 'calc(100vh - 254px)' }}>
        {customizeTable(
          {
            code: 'SPRM.PURCHASE_EXECUTION_ALL.ORDER_LIST',
            dataSet: orderLineDs,
          },
          <SearchBarTable
            style={{ maxHeight: 'calc(100% - 22px)' }}
            aggregation={tableDisplay !== 'flat'}
            searchCode="SPRM.PURCHASE_EXECUTION_ALL.ORDER_FILTER"
            columns={columns.filter(
              (ele) => ![...baseUomInfo, ...productPriceList].includes(ele.name)
            )}
            dataSet={orderLineDs}
            cacheState
            virtual
            virtualCell
            virtualSpin
            pagination={{
              pageSizeOptions: initCuxPageSize || ['10', '20', '50', '100', '200'],
            }}
            searchBarConfig={{
              right: {
                render: () => (
                  <ViewFilter
                    tableDisplay={tableDisplay}
                    setDisplayStatus={this.setDisplayStatus}
                  />
                ),
              },
              left: {
                render: () => (
                  <div>
                    <MutlTextFieldSearch
                      name="multiSelectHeaderAndLineNums"
                      dataSet={orderLineDs}
                      placeholder={intl
                        .get('sprm.common.modal.enterPrNumOrLineNum')
                        .d('请输入采购申请单号-行号')}
                    />
                    {cuxOrderMutiData?.map((ele) => (
                      <span style={{ marginLeft: '8px' }}>
                        <MutlTextFieldSearch
                          name={ele?.code}
                          dataSet={orderLineDs}
                          style={{ marginLeft: '10px' }}
                          placeholder={ele?.placeholder ? ele?.placeholder() : ''}
                        />
                      </span>
                    ))}
                  </div>
                ),
              },
              fieldProps: {
                tempKey: { lovPara: { tenantId: organizationId } },
                supplierList: { lovPara: { tenantId: organizationId } },
                ...cuxLovParams,
              },
              onFieldChange: this.onChangeField,
              onQuery: this.handleQuery,
              onClear: this.resetQueryDs,
              onReset: this.resetQueryDs,
            }}
            onAggregationChange={(_aggregation) => this.setDisplayStatus(_aggregation)}
          />
        )}
      </div>
    );
  }
}
