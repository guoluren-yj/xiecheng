import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { DataSet, Modal, Attachment, Row, Col } from 'choerodon-ui/pro';
import { Spin, Collapse, Icon } from 'hzero-ui';
import { compose, isEmpty, throttle } from 'lodash';
import BigNumber from 'bignumber.js';
import { math } from 'choerodon-ui/dataset';
import { observer } from 'mobx-react-lite';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { SRM_SPUC } from '_utils/config';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';

import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import DynamicButtons from '_components/DynamicButtons';
import qs from 'querystring';
import remote from 'hzero-front/lib/utils/remote';

import { headerInfo, lineInfo, batchMaintenance } from './store';
import PurchaseRequestHeader from './PurchaseRequestHeader';
import PurchaseLineInfo from './PurchaseLineInfo';
import {
  formatAumont,
  handleBudgetVerification,
  validateLineCalculate,
  queryCommonDoubleUomConfig,
  showLineDsErrors,
} from '@/routes/components/utils';
import {
  saveWarn,
  saveDetail,
  submitDetail,
  addNewSubmitDetail,
  deleteSheetDelivery,
  fetchNewPriceLibData,
} from '@/services/orderWorkspaceService';
import { sourcingResults } from './store/sourcingResultsDs';
import styles from './header.less';

const organizationId = getCurrentOrganizationId();
const { Panel } = Collapse;
const C7nPurchasingRequisition = (props) => {
  const {
    history,
    cuxRemote,
    location: { search },
    customizeForm,
    customizeTable,
    customizeBtnGroup,
  } = props;
  const { poHeaderId, sourcePage, entrance } = qs.parse(search.substr(1));
  const [allState, setAllState] = useState({
    collapseKeys: ['orderHeaderInfo', 'orderLineInfo'], // 打开的折叠面板key
  });
  const [loadings, setLoadings] = useState({});
  const [isValidId, setValid] = useState(false);
  const setState = (curr = {}) => setAllState((prev) => ({ ...prev, ...curr }));

  const useSetstate = (state = {}) => {
    [headerInfoDs, lineInfoDs, batchMaintenanceDs].forEach((i) => {
      i.setState(state);
    });
  };

  const loading = (state = {}) => {
    setLoadings((preState) => ({ ...preState, ...state }));
  };

  // 初始Ds
  const headerInfoDs = useMemo(
    () =>
      new DataSet({
        ...headerInfo(),
        transport: {
          read: ({ dataSet }) => {
            return {
              url: `${SRM_SPUC}/v1/${organizationId}/po-header/${poHeaderId}/detail`,
              method: 'GET',
              transformResponse(res) {
                const data = JSON.parse(res);
                // 个性化的默认值逻辑导致无法通过 record.getPristineValue 来判断原始值是否有值， 临时使用此方式
                dataSet.setState('response', data);
                return JSON.parse(res);
              },
            };
          },
        },
      }),
    []
  );
  const lineInfoDs = useMemo(
    () =>
      new DataSet({
        ...lineInfo(),
        transport: {
          read: ({ dataSet }) => {
            return {
              url: `${SRM_SPUC}/v1/${organizationId}/po-line/${poHeaderId}/detail`,
              method: 'GET',
              transformResponse(res) {
                // 个性化的默认值逻辑导致无法通过 record.getPristineValue 来判断原始值是否有值， 临时使用此方式
                const data = JSON.parse(res)?.content || [];
                const responseMap = new Map();
                data.forEach((i) => {
                  responseMap.set(i.poLineId, i);
                });
                dataSet.setState({ responseMap });
                return JSON.parse(res);
              },
            };
          },
          destroy: ({ data }) => {
            const newData = data.map((i) => ({
              ...i,
              versionNum: i.locationVersionNumber,
              canCreateAsnFlag: 0,
              tenantId: organizationId,
            }));
            return {
              url: `${SRM_SPUC}/v1/${organizationId}/po-header/delete`,
              method: 'DELETE',
              data: newData,
            };
          },
        },
      }),
    []
  );
  const batchMaintenanceDs = useMemo(
    () =>
      new DataSet({
        ...batchMaintenance(headerInfoDs, lineInfoDs),
      }),
    [poHeaderId, headerInfoDs, lineInfoDs]
  );
  const sourcingResultsDs = useMemo(() => new DataSet(sourcingResults()), []);

  useEffect(() => {
    useSetstate({
      loading,
      lineInfoDs,
      headerInfoDs,
      batchMaintenanceDs,
      doubleUnitEnabled: 0,
      handleIncludedPriceFcous,
    });
    fetchDetailHeader();
  }, []);

  // const formatQueryData = (list = []) => {
  //   if (isEmpty(list)) return;
  //   const fieldsMap = {
  //     supplierCompanyId: 'supplierCompanyName',
  //     companyId: 'companyName',
  //     purchaseAgentId: 'purchaseAgentIds',
  //     invOrganizationId: 'invOrganizationIds',
  //     sourceNum: 'sourceNum',
  //   };
  //   const oldData = sourcingResultsDs.queryDataSet.current.toJSONData();
  //   const queryData = {};
  //   list.forEach((i) => {
  //     queryData[fieldsMap[i.viewField]] = {
  //       value: i.viewValue,
  //       code: i.viewCode,
  //       meaning: i.viewMeaning,
  //     };
  //   });
  //   sourcingResultsDs.queryDataSet.loadData([{ ...oldData, ...queryData }]);
  // };

  const fetchDetailHeader = (cache) => {
    loading({ all: true });
    queryCommonDoubleUomConfig({ moduleCode: 'RFX' }).then((res) =>
      useSetstate({
        doubleUnitEnabled: Number(res),
      })
    );
    headerInfoDs.query(undefined, undefined, cache).then((res) => {
      loading({ all: false });
      setValid(Boolean(res?.poHeaderId));
      if (getResponse(res)) {
        lineInfoDs.query(undefined, undefined, cache);
        // formatQueryData(res.mergeField);
      }
    });
  };

  const onCollapseChange = (collapseKeys) => {
    setState({
      collapseKeys,
    });
  };

  const handleBackParent = () => {
    let router; // 默认返回订单维护
    if (entrance === 'maintain') {
      router = '/sodr/purchase-order-maintain/list';
    } else {
      switch (sourcePage) {
        case 'pageRequest': // 采购申请
          router = '/sodr/purchase-order-maintain/quote-purchase-requisition/list';
          break;
        case 'pageOrder': // 手工创建订单
          router = '/sodr/purchase-order-maintain/list';
          break;
        case 'pageSource': // 寻源
          router = '/sodr/purchase-order-maintain/source-from-requisition/list';
          break;
        case 'pageConract': // 协议
          router = '/sodr/purchase-order-maintain/purchase/list';
          break;
        default:
          router = '/sodr/purchase-order-maintain/list';
          break;
      }
    }
    return router;
  };

  /**
   * 原币含税单价获取焦点事件
   * @param {object[]} record - 当前行的数据
   * @param {object[]} dataList - 选中物料带出的数据
   */
  const handleIncludedPriceFcous = useCallback((record) => {
    const newPriceLibFlag = headerInfoDs?.getState('newPriceLibFlag');
    const { poHeaderDetailDTO = {} } = getValues();
    const values = record.toJSONData() || {};
    const { prLineId, ...others } = values;
    const poLineDetailDTOs = [
      {
        ...others,
        poLineId: record.status === 'add' ? -1 : record.get('poLineId'),
      },
    ];
    if (newPriceLibFlag === 1 && values.itemCode && values.freeFlag !== 1) {
      loading({ handleIncludedPriceFcous: true });
      fetchNewPriceLibData({
        poHeaderDetailDTO,
        poLineDetailDTOs,
      }).then((res) => {
        loading({ handleIncludedPriceFcous: false });
        if (res && !isEmpty(res) && (values.priceLibraryId || res.priceLibId)) {
          const {
            uomId,
            uomCode,
            uomName,
            uomCodeAndName,
            currencyCode,
            taxId,
            taxRate,
            netPrice,
            priceLibId,
            taxIncludedPrice,
            unitPriceBatch,
            holdPcHeaderId,
            holdPcLineId,
            contractNum,
            benchmarkPriceType,
            ladderPriceLibId,
            ladderQuotationFlag,
            sourceFrom, // 价格来源
            sourceFromLnId, // 报价行id
            sourceFromLnNum, // 价格来源单据行号
            sourceFromNum, // 价格来源单据号 | 寻源单号
            defaultPrecision,
          } = res;
          record.set({
            uomId: {
              uomId,
              uomName,
              uomCode,
              uomCodeAndName,
              // || formatUom(uomCode, uomName)
            },
            currencyCode: currencyCode ? { currencyCode, defaultPrecision } : undefined,
            taxId: {
              taxId,
              taxRate,
            },
            unitPrice: netPrice,
            enteredTaxIncludedPrice: taxIncludedPrice,
            unitPriceBatch,
            priceLibraryId: priceLibId,
            priceTaxId: taxId,
            contractNum: { contractNum },
            defaultPrecision,
            originUnitPrice: benchmarkPriceType === 'NET_PRICE' ? netPrice : taxIncludedPrice,
            holdPcHeaderId,
            holdPcLineId,
            benchmarkPriceType,
            ladderPriceLibId,
            ladderQuotationFlag,
            priceSource: sourceFrom,
            priceSourceNum: sourceFromNum,
            priceSourceLineNum: sourceFromLnNum,
            priceLineId: sourceFromLnId,
          });
        }
      });
    }
  }, []);

  /**
   * 设置价格
   */
  const setPrice = useCallback((ds) => {
    const { selected } = ds;
    if (isEmpty(selected)) return;
    const val = selected[0].toJSONData();
    const record = lineInfoDs.current;
    if (val && val.priceLibId) {
      const {
        uomId,
        uomName,
        uomCodeAndName,
        currencyCode,
        taxId,
        taxRate,
        netPrice,
        priceLibId,
        taxIncludedPrice,
        unitPriceBatch,
        holdPcHeaderId,
        holdPcLineId,
        contractNum,
        benchmarkPriceType,
        ladderPriceLibId,
        ladderQuotationFlag,
        ladderPriceLibList = [],
        sourceFrom, // 价格来源
        sourceFromLnId, // 报价行id
        sourceFromLnNum, // 价格来源单据行号
        sourceFromNum, // 价格来源单据号 | 寻源单号
        defaultPrecision,
      } = val;
      const quantity = record.get('quantity');
      const ladderPriceRecord = ladderPriceLibList.find(
        (item) =>
          math.gte(new BigNumber(quantity), new BigNumber(item.ladderFrom)) &&
          (math.lt(new BigNumber(quantity, new BigNumber(item.ladderTo))) ||
            math.lt(new BigNumber(quantity, new BigNumber(Infinity))))
      );
      const unitPrice = formatAumont(
        ladderPriceRecord ? ladderPriceRecord.ladderNetPrice : netPrice,
        defaultPrecision
      );
      const enteredTaxIncludedPrice = formatAumont(
        ladderPriceRecord ? ladderPriceRecord.ladderPrice : taxIncludedPrice,
        defaultPrecision
      );
      record.set({
        uomId: {
          uomId,
          uomName,
          uomCodeAndName,
        },
        // uomName,
        // currencyCode,
        currencyCode: currencyCode ? { currencyCode, defaultPrecision } : undefined,
        defaultPrecision,
        // taxId,
        // taxRate,
        taxId: {
          taxId,
          taxRate,
        },
        unitPrice,
        enteredTaxIncludedPrice,
        unitPriceBatch,
        priceLibraryId: priceLibId,
        priceTaxId: taxId,
        // contractNum,
        contractNum: { contractNum },
        originUnitPrice: benchmarkPriceType === 'NET_PRICE' ? unitPrice : enteredTaxIncludedPrice,
        holdPcHeaderId,
        holdPcLineId,
        benchmarkPriceType,
        ladderPriceLibId,
        ladderQuotationFlag,
        priceSource: sourceFrom,
        priceSourceNum: sourceFromNum,
        priceSourceLineNum: sourceFromLnNum,
        priceLineId: sourceFromLnId,
      });
    }
  }, []);

  const getValues = useCallback(() => {
    const poHeaderDetailDTO = {
      ...headerInfoDs.toJSONData()[0],
    };
    const poLineDetailDTOs = lineInfoDs.toJSONData();
    // const fieldMap = lineInfoDs.getState('fieldMap');
    const values = {
      poHeaderDetailDTO,
      poLineDetailDTOs,
    };
    // if (fieldMap) {
    //   values.fieldMap = {
    //     ...fieldMap,
    //   };
    // }
    return values;
  }, []);

  const handleDelete = () => {
    const { poHeaderDetailDTO } = getValues();
    Modal.confirm({
      children: intl.get(`sodr.workspace.view.message.confirmDestroy`).d('是否确认删除订单'),
      onOk: throttle(
        () => {
          loading({ handleDelete: true });
          deleteSheetDelivery([poHeaderDetailDTO]).then((res) => {
            loading({ handleDelete: false });
            if (getResponse(res)) {
              notification.success();
              history.push({
                pathname: handleBackParent(),
              });
            }
          });
        },
        THROTTLE_TIME,
        { trailing: false }
      ),
    });
  };

  const getCustomizeCode = () => {
    let code;
    const { poSourcePlatform } = headerInfoDs.toJSONData()[0];
    switch (poSourcePlatform) {
      case 'ERP':
        code = 'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_ERP';
        break;
      // case 'E-COMMERCE':
      //   code = 'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_EC';
      // break;
      case 'SRM':
        code = 'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION';
        break;
      case 'SHOP':
        code = 'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION';
        break;
      // case 'CATALOGUE':
      //   code = 'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_CATALOGUE';
      // break;
      default:
        code = null;
        break;
    }
    return code;
  };

  const handleSaveOrSubmit = (type) => {
    const { poHeaderDetailDTO, poLineDetailDTOs } = getValues();
    const customizeUnitCode = `${getCustomizeCode()},SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST`;
    const { unSaveEnable } = headerInfoDs.toJSONData()[0] || {};
    const validateList = unSaveEnable ? [headerInfoDs] : [headerInfoDs, lineInfoDs];
    const data = unSaveEnable ? { poHeaderDetailDTO } : { poHeaderDetailDTO, poLineDetailDTOs };
    if (!validateLineCalculate({ data: lineInfoDs, type: 'c7n' })) return;
    Promise.all(validateList.map((i) => i.validate())).then((status) => {
      if (status.findIndex((i) => !i) === -1) {
        if (type === 'save') {
          loading({ handleSave: true });
          const payload = { data, customizeUnitCode };
          const callback = () => {
            saveDetail(payload).then((res) => {
              loading({ handleSave: false });
              if (getResponse(res)) {
                notification.success();
                fetchDetailHeader();
                if (res.errorMsg) {
                  Modal.info({
                    children: res.errorMsg,
                    className: styles['detail-save-confirm-modal'],
                    title: intl.get('hzero.common.message.confirm.title').d('提示'),
                  });
                }
                if (res.maintainErrorMsg) {
                  Modal.info({
                    children: res.maintainErrorMsg,
                    className: styles['detail-save-confirm-modal'],
                    title: intl.get('hzero.common.message.confirm.title').d('提示'),
                  });
                }
              }
            });
          };
          saveWarn(payload).then((ras) => {
            if (!getResponse(ras)) {
              loading({ handleSave: false });
              return false;
            }
            if (getResponse(ras)?.value) {
              Modal.confirm({
                children: ras?.message,
                className: styles['detail-save-confirm-modal'],
                title: intl.get('hzero.common.message.confirm.title').d('提示'),
                okText: intl.get('hzero.common.button.sure').d('确定'),
                cancelText: intl.get('hzero.common.button.cancel').d('取消'),
                onOk: throttle(callback, THROTTLE_TIME, { trailing: false }),
              });
            } else {
              callback();
            }
          });
        } else {
          loading({ submitDetail: true });
          addNewSubmitDetail(data).then((ras) => {
            loading({ submitDetail: false });
            if (getResponse(ras)) {
              const budgetVerificationData = [
                {
                  ...data.poHeaderDetailDTO,
                  saveFlag: 1,
                  viewCode: 'PENDING_DETAIL_VIEW',
                  poLineExpVOList: data.poLineDetailDTOs,
                },
              ];
              const onOk = () => {
                loading({ submitDetail: true });
                submitDetail({ data, customizeUnitCode }).then((response) => {
                  loading({ submitDetail: false });
                  if (getResponse(response)) {
                    notification.success();
                    history.push({
                      pathname: handleBackParent(),
                    });
                  }
                });
              };
              if (getResponse(ras).value) {
                Modal.confirm({
                  className: styles['batch-submit-modal'],
                  title: getResponse(ras).message,
                  okText: intl.get('hzero.common.button.sure').d('确定'),
                  cancelText: intl.get('hzero.common.button.cancel').d('取消'),
                  onOk: throttle(
                    () =>
                      handleBudgetVerification(budgetVerificationData, onOk, {
                        loading,
                        key: 'submitDetail',
                      }),
                    THROTTLE_TIME,
                    { trailing: false }
                  ),
                });
              } else {
                handleBudgetVerification(budgetVerificationData, onOk, {
                  loading,
                  key: 'submitDetail',
                });
              }
            }
          });
        }
      } else {
        showLineDsErrors(lineInfoDs);
      }
    });
  };

  const btnLoading = useMemo(
    () =>
      loadings.all ||
      loadings.handleSave ||
      loadings.handleDelete ||
      loadings.submitDetail ||
      lineInfoDs.status !== 'ready' ||
      headerInfoDs.status !== 'ready',
    [loadings, lineInfoDs.status, headerInfoDs.status]
  );

  const headerBtnsRender = useMemo(() => {
    const { unSaveEnable, statusCode } = headerInfoDs.toJSONData()[0] || {};
    const btns = [
      {
        name: 'save',
        btnType: 'c7n-pro',
        child: intl.get(`hzero.common.button.save`).d('保存'),
        btnProps: {
          wait: THROTTLE_TIME,
          icon: 'save',
          color: 'primary',
          disabled: !poHeaderId,
          onClick: () => handleSaveOrSubmit('save'),
          loading: btnLoading,
        },
      },
      unSaveEnable === 0 && {
        btnType: 'c7n-pro',
        name: 'check',
        child: intl.get(`hzero.common.button.submit`).d('提交'),
        btnProps: {
          wait: THROTTLE_TIME,
          icon: 'check',
          onClick: () => handleSaveOrSubmit('submit'),
          loading: btnLoading,
        },
      },
      // {
      //   name: 'outUuid',
      //   btnComp: UploadModal,
      //   btnProps: {
      //     btnProps: {
      //       icon: 'upload',
      //       disabled: !poHeaderId,
      //     },
      //     btnText: intl.get(`sodr.quotePurchase.view.message.outUuid`).d('外部附件'),
      //     showFilesNumber: true,
      //     attachmentUUID: allState.attachmentUuid,
      //     bucketName: BUCKET_NAME,
      //     bucketDirectory: 'sodr-order',
      //     afterOpenUploadModal: afterOpenHeaderUploadModal,
      //   },
      // },
      // {
      //   name: 'innerUuid',
      //   btnComp: UploadModal,
      //   btnProps: {
      //     btnProps: {
      //       icon: 'upload',
      //       disabled: !poHeaderId,
      //     },
      //     btnText: intl.get(`sodr.quotePurchase.view.message.innerUuid`).d('内部附件'),
      //     showFilesNumber: true,
      //     attachmentUUID: allState.purchaserInnerAttachmentUuid,
      //     bucketName: BUCKET_NAME,
      //     bucketDirectory: 'sodr-order',
      //     afterOpenUploadModal: afterOpenHeaderUploadModalLoad,
      //   },
      // },
      {
        name: 'outUuid',
        btnComp: Attachment,
        child: intl.get(`sodr.quotePurchase.view.message.outUuid`).d('外部附件'),
        btnProps: {
          dataSet: headerInfoDs,
          disabled: btnLoading || !poHeaderId || !isValidId,
          name: 'attachmentUuid',
          viewMode: 'popup',
          color: 'default',
          icon: 'attach_file',
          funcType: 'raised',
        },
      },
      {
        name: 'innerUuid',
        btnComp: Attachment,
        child: intl.get(`sodr.quotePurchase.view.message.innerUuid`).d('内部附件'),
        btnProps: {
          dataSet: headerInfoDs,
          disabled: btnLoading || !poHeaderId || !isValidId,
          name: 'purchaserInnerAttachmentUuid',
          viewMode: 'popup',
          color: 'default',
          icon: 'attach_file',
          funcType: 'raised',
        },
      },
      statusCode !== 'REJECTED' && {
        name: 'delete',
        child: intl.get(`hzero.common.button.delete`).d('删除'),
        btnProps: {
          icon: 'delete',
          onClick: handleDelete,
          loading: btnLoading,
        },
      },
    ];
    return btns.reverse();
  }, [isValidId, btnLoading]);

  const { collapseKeys } = allState;
  const { sourceBillTypeCode, unSaveEnable } = headerInfoDs.toJSONData()[0] || {};
  return (
    <Fragment>
      <Header
        backPath={handleBackParent()}
        title={intl.get('sodr.quotePurchase.view.message.purchaseOrderMaintain').d('订单维护')}
      >
        {customizeBtnGroup(
          { code: 'SODR.ORDER_CREATE_LINE_LIST.SOURCE_BTNS', pro: true },
          <DynamicButtons buttons={headerBtnsRender} />
        )}
      </Header>
      <Content>
        {sourceBillTypeCode === 'PURCHASE_REQUEST' && [1, 2].includes(unSaveEnable) && (
          <p className={styles['order-top-title']}>
            <span />
            {intl
              .get(`sodr.quotePurchase.view.message.saveBeforeOperation`)
              .d('请先保存订单头信息，再操作订单行信息')}
          </p>
        )}
        <Spin spinning={false} wrapperClassName={DETAIL_DEFAULT_CLASSNAME}>
          <Collapse
            className="form-collapse"
            defaultActiveKey={collapseKeys}
            onChange={onCollapseChange}
          >
            <Panel
              showArrow={false}
              header={
                <Fragment>
                  <h3>
                    {intl.get(`sodr.quotePurchase.view.message.orderHeaderInfo`).d('订单头信息')}
                  </h3>
                  <a>
                    {collapseKeys.includes('orderHeaderInfo')
                      ? intl.get('hzero.common.button.up').d('收起')
                      : intl.get('hzero.common.button.expand').d('展开')}
                  </a>
                  <Icon type={collapseKeys.includes('orderHeaderInfo') ? 'up' : 'down'} />
                </Fragment>
              }
              key="orderHeaderInfo"
            >
              <Row>
                <Col span={18}>
                  <PurchaseRequestHeader ds={headerInfoDs} customizeForm={customizeForm} />
                </Col>
              </Row>
            </Panel>
            <Panel
              showArrow={false}
              header={
                <Fragment>
                  <h3>
                    {intl
                      .get(`sodr.quotePurchaseRequisition.view.message.orderLineInfo`)
                      .d('订单行信息')}
                  </h3>
                  <a>
                    {collapseKeys.includes('orderLineInfo')
                      ? intl.get('hzero.common.button.up').d('收起')
                      : intl.get('hzero.common.button.expand').d('展开')}
                  </a>
                  <Icon type={collapseKeys.includes('orderLineInfo') ? 'up' : 'down'} />
                </Fragment>
              }
              key="orderLineInfo"
            >
              <PurchaseLineInfo
                ds={lineInfoDs}
                poHeaderId={poHeaderId}
                loadings={loadings}
                getValues={getValues}
                setPrice={setPrice}
                customizeForm={customizeForm}
                customizeTable={customizeTable}
                // priceUpdateList={priceUpdateList}
                fetchDetailHeader={fetchDetailHeader}
                batchMaintenanceDs={batchMaintenanceDs}
                handleIncludedPriceFcous={handleIncludedPriceFcous}
                loading={loading}
                sourcingResultsDs={sourcingResultsDs}
                history={history}
                cuxRemote={cuxRemote}
              />
            </Panel>
          </Collapse>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  withRouter,
  withCustomize({
    unitCode: [
      'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_ERP',
      // 'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_EC',
      // 'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_CATALOGUE',
      'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION',
      'SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST',
      'SODR.ORDER_CREATE_LINE_LIST.PROPOSED.PRICE',
      'SODR.ORDER_CREATE_LINE_LIST.SOURCE_BTNS',
      'SODR.PURCHASE_SOURCE_LIST.FILTER',
      'SODR.PURCHASE_SOURCE_LIST.LINE',
      'SODR.ORDER_CREATE_LINE_LIST.BATCH_SRM',
    ],
  }),
  remote({
    code: 'SODR.ORDER_MAINTENANCE_SEARCHFORTHESOURCE_C7N',
    name: 'cuxRemote',
  }),
  formatterCollections({
    code: [
      'sodr.quotePurchaseRequisition',
      'sprm.purchaseReqCreation',
      'sodr.quotePurchase',
      'ssrc.priceLibrary',
      'entity.attachment',
      'sodr.workspace',
      'hpfm.employee',
      'srm.common',
      'entity.tenant',
      'sodr.common',
      'sprm.common',
      'sodr.view',
      'sodr.orderMaintain',
      'entity.company',
      'entity.roles',
    ],
  }),
  observer
)(C7nPurchasingRequisition);
