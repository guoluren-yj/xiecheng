import { Modal, DataSet, Table, Attachment } from 'choerodon-ui/pro';
import { Steps, Tag, Tooltip, Icon } from 'choerodon-ui';
import { routerRedux } from 'dva/router';
import React, { Fragment, memo, useCallback } from 'react';
import intl from 'utils/intl';
import querystring from 'querystring';
import { compose, isNumber, isEmpty, isFunction } from 'lodash';
import { yesOrNoRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getCurrentTenant, getResponse } from 'utils/utils';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import DocFlow from '_components/DocFlow';
import classnames from 'classnames';

import BudgetModal from 'srm-front-sbud/lib/routes/BudgetOccupiedModal';

import '../index.less';
// import { mutiLineRender } from './util.js';
import {
  fetchExecutionLink,
  fetchUomControl,
  fetchDocLinkControl,
} from '@/services/purchaseRequisitionAssignmentService';
import { cnfModified } from '@/services/purchaseRequisitionCancelService.js';
import { fetchSettingTableNew } from '@/services/purchaseExecutionService';
import ViewFilter from '@/routes/components/ViewFilter';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import { customDs } from './../../PurchaseDetail/componentDs';
// import CustomSpecModal from '../../components/CustomSpecModal';
import { UrgentFlag } from '../../components/UrgentFlag';
import ContectDoc from './ContectDoc';
import { colorRender } from './../util';
import PriceListModal from '../../components/PriceListModal';
// const { FilterBar } = Table;

const { Step } = Steps;
const organizationId = getCurrentOrganizationId();
// const commonPrompt = 'sprm.common.model.common';
const Index = ({
  lineDs,
  customizeTabPane,
  customizeTable,
  tableDisplay,
  setTableDisplay,
  dispatch,
  location,
  handleLinkOtherUrl,
  cuxDisplayNumStyle,
  remote,
}) => {
  // React.useMemo(() => {
  // const [tableDisplay, setDisplayStatus] = useState('flat');
  // const [customVisable, setCustomVisable] = React.useState(false);
  // const [specsJsonType, setSpecsJsonType] = React.useState('custom');
  // const [customData, setCustomData] = React.useState([]);
  // const [priceHiddenFlag, setPriceHiddenFlag] = useState(null);
  const [productPlaceConfig, setProductPlaceConfig] = React.useState(0);
  const [uomControl, setUomControl] = React.useState(0); // 双单位控制.开启后原单位,数量不可编辑
  const [docLinkControl, setDocLinkControl] = React.useState({ displayDocFlow: 1, displayDoc: 0 }); // 单据流-业务规则控制.开启后单据流才展示
  const [priceListModalVisible, setPriceListModalVisible] = React.useState(false);
  const [priceData, setPriceData] = React.useState([]);
  const [isOldUser, setIsOldUser] = React.useState(false);
  const [isShowBudgetModal, setShowBudgetModal] = React.useState(false);
  const [init, setInit] = React.useState(false);
  const customtableDs = new DataSet({
    ...customDs(),
  });

  React.useEffect(() => {
    getExecutionLink();
    queryUomControl();
    queryBudgetModalShow();
    queryDocLinkControl();
    fetchConfigProductSheetCon();
  }, []);

  // 获取是否开启双单位控制
  const queryUomControl = async () => {
    await fetchUomControl({ moduleCode: 'SPRM' }).then((res) => {
      const result = getResponse(res);
      if (result) {
        setUomControl(result?.SPRM);
        lineDs.setState('uomControl', result?.SPRM || 0);
      }
    });
  };

  // 获取是否开启单据流
  const queryDocLinkControl = async () => {
    await fetchDocLinkControl({ businessModule: 'SPRM' }).then((res) => {
      const result = getResponse(res);
      if (result && !isEmpty(result)) {
        setDocLinkControl(result);
      }
    });
  };

  const queryBudgetModalShow = async () => {
    await cnfModified({ fullPathCode: 'SITE.SPRM.PR_EXPORT_BUDGET_TEMPLATE' }).then((res) => {
      const result = getResponse(res);
      if (result) {
        setShowBudgetModal(true);
      }
    });
  };

  const getExecutionLink = () => {
    fetchExecutionLink({ tenantNum: getCurrentTenant().tenantNum }).then((res) => {
      const result = getResponse(res);
      if (result && !isEmpty(result.content)) {
        setIsOldUser(true);
      }
    });
  };

  // 配置表配置显示
  const fetchConfigProductSheetCon = async () => {
    await fetchSettingTableNew({
      organizationId: getCurrentOrganizationId(),
      tenantNum: getCurrentTenant().tenantNum,
      tableCode: 'sprm_pr_execute_select_product_place_order_tenant',
    }).then((res) => {
      const result = getResponse(res);
      if (!result) {
        return;
      }
      setProductPlaceConfig(!isEmpty(result));
    });
  };

  // 跳转详情
  const handleJumpDetail = useCallback((record, type) => {
    // const { prSourcePlatform, prHeaderId, prSourcePlatformMeaning } = record.toData();
    const search = type === 'edit' ? { type } : {};
    // 二开界面新跳转路由
    const pathCux = isFunction(handleLinkOtherUrl)
      ? handleLinkOtherUrl({ prHeaderId: record.get('prHeaderId'), type: 'query', location }) || {}
      : {};
    if (pathCux && pathCux?.pathname) {
      dispatch(
        routerRedux.push({
          pathname: pathCux?.pathname,
          search: pathCux?.search,
        })
      );
    } else {
      dispatch(
        routerRedux.push({
          pathname:
            record.get('prSourcePlatform') === 'ERP'
              ? `/sprm/purchase-platform/erp-detail/${record.get('prHeaderId')}`
              : `/sprm/purchase-platform/noerp-detail/${record.get('prHeaderId')}`,
          state: {
            prSourcePlatformCode: record.get('prSourcePlatform'),
            prSourcePlatformMeaning: record.get('prSourcePlatformMeaning'),
          },
          search: querystring.stringify(search),
        })
      );
    }
  }, []);

  const openModal = (val, name) => {
    customtableDs.loadData(val ? JSON.parse(val) : []);
    const customColumns =
      name === 'custom'
        ? [
          {
            name: 'componentName',
          },
          {
            name: 'cpValue',
            renderer: ({ value, record }) =>
              ['IMAGE', 'UPLOAD'].includes(record.get('componentType')) ? (
                <Attachment
                  readOnly
                  labelLayout="float"
                  viewMode="popup"
                  value={value}
                  bucketName="private-bucket"
                />
              ) : (
                value
              ),
          },
        ]
        : [
          {
            name: 'pName',
          },
          {
            name: 'pValue',
          },
        ];
    Modal.open({
      title:
        name === 'custom'
          ? intl.get(`sprm.common.model.common.customSpecsJson`).d('定制品属性')
          : intl.get(`sprm.common.model.common.productSpecsJson`).d('商品属性'),
      closable: true,
      drawer: true,
      children: <Table dataSet={customtableDs} columns={customColumns} />,
      onOk: () => { },
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: (okBtn) => okBtn,
    });
  };

  const lineColumns = React.useMemo(() => {
    let columns = [];
    columns = [
      {
        name: 'prLineStatusCode',
        width: 110,
        renderer: ({ value, record }) => colorRender(value, record.get('prLineStatusCodeMeaning')),
      },
      {
        name: 'displayPrNum',
        width: 165,
        renderer: ({ value, record }) => (
          <a
            onClick={() => handleJumpDetail(record)}
            style={record.get('urgentFlag') === 1 ? cuxDisplayNumStyle || {} : {}}
          >
            {`${value}-${record.get('displayLineNum')}`}
            {record.get('urgentFlag') === 1 && <UrgentFlag />}
          </a>
        ),
      },
      {
        name: 'checkContectDoc',
        width: 120,
        hidden: ![1, '1'].includes(docLinkControl.displayDoc),
        renderer: ({ record }) => {
          const statusList = record
            ?.get('prExecutePointVOList')
            ?.filter((item) => item?.executeStatus !== 'NOT_STARTED');
          if (
            !(
              record.get('downsStreamQuantity') ||
              record.get('sourceDownsStreamQuantity') ||
              statusList?.length !== 0
            )
            // record.get('contractQuantity') ||
            // record.get('orderQuantity') ||
            // record.get('projectQuantity') ||
            // record.get('rfxQuantity') ||
            // record.get('bidQuantity')
          ) {
            return undefined;
          } else {
            return (
              <a onClick={() => fetchLineDetail(record)}>
                {intl.get('sprm.common.modal.checkContectDoc').d('查看执行单据')}
              </a>
            );
          }
        },
      },
      {
        name: 'docFlow',
        width: 100,
        hidden: ![1, '1'].includes(docLinkControl.displayDocFlow),
        renderer: ({ record }) => (
          <div style={{ height: '100%', display: 'flex' }}>
            <DocFlow
              tableName="sprm_pr_line"
              tablePk={record.get('prLineId')}
              buttonType="button"
            />
          </div>
        ),
      },
      { name: 'secondaryTaxInUnitPrice' },
      { name: 'secondaryUomId', renderer: ({ record }) => record.get('secondaryUomCodeAndName') },
      { name: 'secondaryQuantity' },
      {
        name: 'itemCode',
        width: 180,
        tooltip: 'overflow',
        renderer: ({ value, record }) => {
          if (value) {
            return `${value}-${record.get('itemName')}`;
          } else {
            return record.get('itemName');
          }
        },
      },
      {
        name: 'quantity',
        width: 80,
      },
      {
        name: 'prSourcePlatformMeaning',
        width: 100,
      },
      {
        name: 'notExecutionQuantity',
        width: 80,
        renderer: ({ value, record }) => {
          return isNumber(record.get('uomPrecision')) && value
            ? value.toFixed(record.get('uomPrecision'))
            : value;
        },
      },
      {
        name: 'autoAssignedFlag',
        width: 80,
        renderer: ({ value }) => {
          if (value || value === 0) {
            return (
              <Tag className={value === 1 ? 'c7n-tag-green' : 'c7n-tag-red'} style={{ border: 0 }}>
                {value === 1
                  ? intl.get(`sprm.common.model.successStatus`).d('成功')
                  : intl.get(`sprm.common.model.errorStatus`).d('失败')}
              </Tag>
            );
          } else {
            return null;
          }
        },
      },
      {
        name: 'prExecutePointVOListOld',
        width: 220,
        renderer: ({ record }) => {
          const value = record.get('prExecutePointVOList') || [];
          return value
            ?.filter((ele) => ele.executeStatus !== 'NOT_STARTED' && ele.executeStatus)
            ?.map((ele) => {
              const styleColor =
                ele?.executeStatus === 'FINISHED' ? 'c7n-tag-green' : 'c7n-tag-yellow';
              return (
                <Tag className={classnames(styleColor)} style={{ border: 0 }}>
                  {ele.executePointMeaning}
                  {/* 对账，开票需要校验数量是否存在。付款仅需要状态判断 */}
                  {(['paymentStatus'].includes(ele.executePoint) ||
                    (ele.executePoint === 'billStatus' && !record.get('billQuantity')) ||
                    (ele.executePoint === 'reconciliationStatus' &&
                      !record.get('reconciliationQuantity'))) && (
                      <Tooltip
                        title={intl
                          .get('sprm.common.model.prExecutePointVOList.moneyTag')
                          .d('按金额结算，存在有效执行单据')}
                      >
                        <Icon
                          type="help"
                          style={{ position: 'relative', bottom: '2px', paddingLeft: '2px' }}
                        />
                      </Tooltip>
                    )}
                </Tag>
              );
            });
        },
      },
      {
        name: 'prExecutePointVOList',
        width: 220,

        renderer: ({ value }) => {
          const list = value.filter(
            (ele) => ele.executeStatus !== 'NOT_STARTED' && ele.executeStatus
          );

          const lastDom = list?.length ? list?.length - 1 : -1;
          const lastDomObj = lastDom !== -1 ? list[lastDom] : {};
          return lastDom !== -1 ? (
            <Steps
              type="popup"
              headerText={lastDomObj?.executePointMeaning}
              status={lastDomObj?.executeStatus === 'FINISHED' ? 'finish' : 'process'}
            >
              {list.map((e) => (
                <Step
                  title={e.executePointMeaning}
                  status={e.executeStatus === 'FINISHED' ? 'finish' : 'process'}
                />
              ))}
            </Steps>
          ) : null;
        },
      },
      {
        name: 'projectStatus',
        width: 120,
        renderer: ({ value, record }) => {
          const currentStatus =
            record
              .get('prExecutePointVOList')
              .find((ele) => ele.executePoint === 'projectStatus') ||
            record.get('prExecutePointVOList');
          if (currentStatus.executeStatusMeaning) {
            return currentStatus.executePoint !== 'NOT_STARTED'
              ? colorRender(value, currentStatus.executeStatusMeaning)
              : currentStatus.executeStatusMeaning;
          } else {
            return colorRender(value, currentStatus[0].executeStatusMeaning);
          }
        },
      },
      {
        name: 'projectQuantity',
        width: 120,
      },
      {
        name: 'rfxStatus',
        width: 120,
        // renderer: ({ value, record }) => (
        //   <Tag color={colorStatus(value)} >
        //     {record.get('rfxStatusMeaning')}
        //   </Tag>
        // ),
        renderer: ({ value, record }) => {
          const currentStatus =
            record.get('prExecutePointVOList').find((ele) => ele.executePoint === 'rfxStatus') ||
            record.get('prExecutePointVOList');
          if (currentStatus.executeStatusMeaning) {
            return currentStatus.executePoint !== 'NOT_STARTED'
              ? colorRender(value, currentStatus.executeStatusMeaning)
              : currentStatus.executeStatusMeaning;
          } else {
            return colorRender(value, currentStatus[0].executeStatusMeaning);
          }
        },
      },
      {
        name: 'rfxQuantity',
        width: 120,
      },
      {
        name: 'bidStatus',
        width: 120,
        renderer: ({ value, record }) => {
          const currentStatus =
            record.get('prExecutePointVOList').find((ele) => ele.executePoint === 'bidStatus') ||
            record.get('prExecutePointVOList');
          if (currentStatus.executeStatusMeaning) {
            return currentStatus.executePoint !== 'NOT_STARTED'
              ? colorRender(value, currentStatus.executeStatusMeaning)
              : currentStatus.executeStatusMeaning;
          } else {
            return colorRender(value, currentStatus[0].executeStatusMeaning);
          }
        },
      },
      {
        name: 'bidQuantity',
        width: 120,
      },

      {
        name: 'contractStatus',
        width: 120,
        renderer: ({ value, record }) => {
          const currentStatus =
            record
              .get('prExecutePointVOList')
              .find((ele) => ele.executePoint === 'contractStatus') ||
            record
              .get('prExecutePointVOList')
              .find((ele) => ele.executePoint === 'contractSimpleStatus') ||
            record.get('prExecutePointVOList');
          if (currentStatus.executeStatusMeaning) {
            return currentStatus.executePoint !== 'NOT_STARTED'
              ? colorRender(value, currentStatus.executeStatusMeaning)
              : currentStatus.executeStatusMeaning;
          } else {
            return colorRender(value, currentStatus[0].executeStatusMeaning);
          }
        },
      },
      {
        name: 'contractQuantity',
        width: 100,
      },
      {
        name: 'orderStatus',
        width: 120,
        renderer: ({ value, record }) => {
          const currentStatus =
            record.get('prExecutePointVOList').find((ele) => ele.executePoint === 'orderStatus') ||
            record.get('prExecutePointVOList');
          if (currentStatus.executeStatusMeaning) {
            return currentStatus.executePoint !== 'NOT_STARTED'
              ? colorRender(value, currentStatus.executeStatusMeaning)
              : currentStatus.executeStatusMeaning;
          } else {
            return colorRender(value, currentStatus[0].executeStatusMeaning);
          }
        },
      },
      {
        name: 'orderQuantity',
        width: 100,
      },
      {
        name: 'deliveryStatus',
        width: 120,
        renderer: ({ value, record }) => {
          const currentStatus =
            record
              .get('prExecutePointVOList')
              .find((ele) => ele.executePoint === 'deliveryStatus') ||
            record.get('prExecutePointVOList');
          if (currentStatus.executeStatusMeaning) {
            return currentStatus.executePoint !== 'NOT_STARTED'
              ? colorRender(value, currentStatus.executeStatusMeaning)
              : currentStatus.executeStatusMeaning;
          } else {
            return colorRender(value, currentStatus[0].executeStatusMeaning);
          }
        },
      },
      {
        name: 'deliveryQuantity',
        width: 100,
      },
      {
        name: 'contractFrameworkStatus',
        width: 120,
        renderer: ({ value, record }) => {
          const currentStatus =
            record
              .get('prExecutePointVOList')
              .find((ele) => ele.executePoint === 'contractFrameworkStatus') ||
            record.get('prExecutePointVOList');
          if (currentStatus.executeStatusMeaning) {
            return currentStatus.executePoint !== 'NOT_STARTED'
              ? colorRender(value, currentStatus.executeStatusMeaning)
              : currentStatus.executeStatusMeaning;
          } else {
            return colorRender(value, currentStatus[0].executeStatusMeaning);
          }
        },
      },
      {
        name: 'contractFrameworkQuantity',
        width: 100,
      },
      {
        name: 'slodStatus',
        width: 120,
        renderer: ({ value, record }) => {
          const currentStatus =
            record.get('prExecutePointVOList').find((ele) => ele.executePoint === 'slodStatus') ||
            record.get('prExecutePointVOList');
          if (currentStatus.executeStatusMeaning) {
            return currentStatus.executePoint !== 'NOT_STARTED'
              ? colorRender(value, currentStatus.executeStatusMeaning)
              : currentStatus.executeStatusMeaning;
          } else {
            return colorRender(value, currentStatus[0].executeStatusMeaning);
          }
        },
      },
      {
        name: 'slodQuantity',
        width: 100,
      },
      {
        name: 'receiptStatus',
        width: 120,
        renderer: ({ value, record }) => {
          const currentStatus =
            record
              .get('prExecutePointVOList')
              .find((ele) => ele.executePoint === 'receiptStatus') ||
            record.get('prExecutePointVOList');
          if (currentStatus.executeStatusMeaning) {
            return currentStatus.executePoint !== 'NOT_STARTED'
              ? colorRender(value, currentStatus.executeStatusMeaning)
              : currentStatus.executeStatusMeaning;
          } else {
            return colorRender(value, currentStatus[0].executeStatusMeaning);
          }
        },
      },
      {
        name: 'receiptQuantity',
        width: 100,
      },
      !isOldUser && {
        name: 'sourceOccupiedQuantity',
      },
      !isOldUser && {
        name: 'orderOccupiedQuantity',
      },
      !isOldUser && {
        name: 'restSourceQuantity',
      },
      !isOldUser && {
        name: 'restPoQuantity',
      },
      !isOldUser && {
        name: 'secondLevelStrategyCode',
      },
      !isOldUser && {
        name: 'orderExecuteStatus',
        renderer: ({ value, record }) =>
          colorRender(value, record.get('orderExecuteStatusMeaning')),
      },
      !isOldUser && {
        name: 'sourceExecuteStatus',
        renderer: ({ value, record }) =>
          colorRender(value, record.get('sourceExecuteStatusMeaning')),
      },
      {
        name: 'closeQuantity',
        width: 100,
      },
      {
        name: 'sourceCloseQuantity',
        width: 100,
      },
      {
        name: 'currentCloseQuantity',
        width: 100,
      },
      {
        name: 'currentSourceCloseQuantity',
        width: 100,
      },
      {
        name: 'downsStreamQuantity',
        width: 100,
      },
      {
        name: 'sourceDownsStreamQuantity',
        width: 100,
      },
      {
        name: 'billStatus',
        width: 120,
        renderer: ({ value, record }) => {
          const currentStatus =
            record.get('prExecutePointVOList').find((ele) => ele.executePoint === 'billStatus') ||
            record.get('prExecutePointVOList');
          if (currentStatus.executeStatusMeaning) {
            return currentStatus.executePoint !== 'NOT_STARTED'
              ? colorRender(value, currentStatus.executeStatusMeaning)
              : currentStatus.executeStatusMeaning;
          } else {
            return colorRender(value, currentStatus[0].executeStatusMeaning);
          }
        },
      },
      {
        name: 'billQuantity',
        width: 100,
      },
      {
        name: 'reconciliationStatus',
        width: 120,
        renderer: ({ value, record }) => {
          const currentStatus =
            record
              .get('prExecutePointVOList')
              .find((ele) => ele.executePoint === 'reconciliationStatus') ||
            record.get('prExecutePointVOList');
          if (currentStatus.executeStatusMeaning) {
            return colorRender(value, currentStatus.executeStatusMeaning);
          } else {
            return colorRender(value, currentStatus[0].executeStatusMeaning);
          }
        },
      },
      {
        name: 'reconciliationQuantity',
        width: 100,
      },
      {
        name: 'paymentStatus',
        width: 120,
        renderer: ({ value, record }) => {
          const currentStatus =
            record
              .get('prExecutePointVOList')
              .find((ele) => ele.executePoint === 'paymentStatus') ||
            record.get('prExecutePointVOList');
          if (currentStatus.executeStatusMeaning) {
            return colorRender(value, currentStatus.executeStatusMeaning);
          } else {
            return colorRender(value, currentStatus[0].executeStatusMeaning);
          }
        },
      },
      {
        name: 'paymentQuantity',
        width: 100,
      },
      {
        name: 'title',
        width: 100,
        tooltip: 'overflow',
      },
      {
        name: 'prTypeName',
        width: 100,
      },
      { name: 'headerPrRequestedName', width: 100 },
      { name: 'requestDate', width: 100 },
      { name: 'creatorName', width: 100 },
      {
        name: 'creationDate',
        width: 150,
      },
      {
        name: 'companyName',
        width: 150,
      },
      {
        name: 'ouName',
        width: 150,
      },
      {
        name: 'purchaseOrgName',
        width: 150,
      },
      {
        name: 'headerPurchaseAgentName',
        width: 120,
      },
      {
        name: 'unitName',
        width: 100,
      },
      {
        name: 'originalCurrency',
        width: 100,
      },
      // {
      //  name: 'amount',
      //  width: 150,
      //  renderer: ({ record, text }) =>
      //      record.get('headerPriceHiddenFlag') === 1 ? record.toData().amountMeaning : text,
      //  },
      {
        name: 'localCurrency',
      },
      // {
      //   name: 'headerLocalCurrencyNoTaxSum',
      //   width: 150,
      //   renderer: ({ text, record }) =>
      //     record.get('linePriceHiddenFlag') === 1
      //       ? record.get('localCurrencyNoTaxSumMeaning')
      //       : text,
      // },
      { name: 'headerRemark', width: 120 },
      { name: 'prNum', width: 150 },
      { name: 'lotNum', width: 150 },
      // { name: 'headerReceiverContactName' },
      // { name: 'headerReceiverAddressName' },
      // {
      //   name: 'headerReceiverAddressName',
      //   width: 100,
      //   tooltip: 'overflow',
      // },
      {
        name: 'headerUrgentFlag',
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'headerUrgentDate',
      },
      {
        name: 'closeStatusCode',
        renderer: ({ value, record }) => colorRender(value, record.get('closeStatusMeaning')),
      },
      {
        name: 'cancelStatusCode',
        renderer: ({ value, record }) => colorRender(value, record.get('cancelStatusMeaning')),
      },
      { name: 'invOrganizationName', width: 150 },
      { name: 'inventoryName', width: 150 },
      {
        name: 'productNum',
        width: 100,
      },
      {
        name: 'productName',
        width: 100,
      },
      { name: 'thirdSkuCode', width: 120 },
      { name: 'thirdSkuName', width: 120 },
      {
        name: 'catalogName',
        width: 100,
      },
      { name: 'productBrand', width: 100 },
      { name: 'productModel', width: 100 },
      { name: 'packingList', width: 100 },
      {
        name: 'itemModel',
        width: 100,
      },
      {
        name: 'itemSpecs',
        width: 100,
      },
      {
        name: 'categoryName',
        width: 120,
      },
      {
        name: 'uomName',
        width: 120,
        renderer: ({ record }) => record.get('uomCodeAndName'),
      },
      {
        name: 'purchaseAgentName',
        width: 120,
      },
      {
        name: 'neededDate',
        width: 120,
      },
      {
        name: 'linePrRequestedName',
        width: 120,
      },
      {
        name: 'taxIncludedUnitPrice',
        width: 150,
        renderer: ({ text, record }) => {
          return record.get('linePriceHiddenFlag') === 1
            ? record.get('taxIncludedUnitPriceMeaning')
            : text;
        },
      },
      {
        name: 'taxIncludedLineAmount',
        width: 150,
        renderer: ({ text, record }) => {
          return record.get('linePriceHiddenFlag') === 1
            ? record.get('taxIncludedLineAmountMeaning')
            : text;
        },
      },
      {
        name: 'taxIncludedBudgetUnitPrice',
        renderer: ({ text, record }) => {
          return record.get('linePriceHiddenFlag') === 1
            ? record.get('taxIncludedBudgetUnitPriceMeaning')
            : text;
        },
        width: 150,
      },
      {
        name: 'budgetAccountName',
        width: 100,
      },
      {
        name: 'budgetIoFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'expBearDep',
        width: 120,
      },
      {
        name: 'costName',
        width: 120,
      },
      {
        name: 'accountSubjectName',
        width: 120,
      },
      {
        name: 'wbsCode',
        width: 120,
      },
      {
        name: 'projectNum',
        width: 120,
      },
      {
        name: 'projectName',
        width: 120,
      },
      {
        name: 'defaultOrderingAddress',
        width: 120,
      },
      {
        name: 'defaultContactPhone',
        width: 120,
      },
      {
        name: 'defaultContactPerson',
        width: 120,
      },
      {
        name: 'skuType',
        width: 120,
      },
      {
        name: 'customUomName',
        width: 100,
      },
      {
        name: 'customQuantity',
        width: 100,
      },
      {
        name: 'packageQuantity',
        width: 100,
      },
      {
        name: 'customSpecsJson',
        width: 100,
        renderer: ({ value }) => {
          return value ? (
            <a onClick={() => openModal(value, 'custom')}>
              {intl.get(`sprm.common.model.common.customSpecsJson`).d('定制品属性')}
            </a>
          ) : null;
        },
      },
      {
        name: 'productSpecsJson',
        width: 100,
        renderer: ({ value }) => {
          return value ? (
            <a onClick={() => openModal(value, 'product')}>
              {intl.get(`sprm.common.model.common.productSpecsJson`).d('商品属性')}
            </a>
          ) : null;
        },
      },
      {
        name: 'priceList', // 比价单
        width: 100,
        // eslint-disable-next-line no-unused-vars
        renderer: ({ value, name, record }) => {
          return (
            <a
              onClick={() => {
                // openPriceListModal(value, name, record);
                const data =
                  record && record?.get('productCompareJson')
                    ? JSON.parse(record && record?.get('productCompareJson'))
                    : [];
                setPriceData(data);
                setPriceListModalVisible(true);
              }}
            >
              {intl.get(`sprm.purchaseReqCreation.view.message.priceList`).d('比价单')}
            </a>
          );
        },
      },
      {
        name: 'projectTaskId',
        width: 100,
      },
      { name: 'transferredProjectFlag', renderer: ({ value }) => yesOrNoRender(Number(value)) },
      // {
      //   name: 'closeStatusMeaning',
      //   width: 100,
      // },
      // {
      //   name: 'cancelStatusMeaning',
      //   width: 100,
      // },
    ];

    if (isShowBudgetModal) {
      columns.push({
        name: 'budgetShowModal',
        width: 100,
        renderer: ({ record }) => (
          <BudgetModal documentType="PR" docLineId={record.get('prLineId')} />
        ),
      });
    }
    const uomControlFilterList =
      uomControl === 1 ? [] : ['secondaryUomId', 'secondaryTaxInUnitPrice', 'secondaryQuantity'];
    const defaultContactList = productPlaceConfig
      ? []
      : ['defaultOrderingAddress', 'defaultContactPerson', 'defaultContactPhone'];

    const filterdColums = columns.filter(
      (ele) => ![...uomControlFilterList, ...defaultContactList].includes(ele.name)
    );
    return remote.process('SPRM_PURCHASE_PLAFORM_PROCESS_COLUMNS', filterdColums, { currentType: 'allByExecutionStatus' });
  });

  const cuxFieldProps = remote.process(
    'SPRM_PURCHASE_PLAFORM_PROCESS_FIELDPROPS',
    {
      tempkey: { lovPara: { tenantId: organizationId } },
      executorBys: { lovPara: { tenantId: organizationId } },
      companyId: { lovPara: { tenantId: organizationId } },
      ouId: { lovPara: { tenantId: organizationId }, lovCode: 'SPFM.USER_AUTH.OU' },
      wbsCode: { lovPara: { tenantId: organizationId } },
      expBearDep: { lovPara: { tenantId: organizationId, unitTypeCode: 'D' } },
      costId: { lovPara: { tenantId: organizationId } },
      projectTaskId: { lovPara: { tileFlag: 1 } },
    },
    { currentType: 'allByExecutionStatus' }
  );

  // const mutiStatusRender = (value) => {
  //   if (value.length < 3) {
  //     return value.map((ele) => (
  //       <p style={{ height: ' 18px', margin: 0, lineHeight: '18px' }}>
  //         {ele.executePointMeaning === 'NOT_STARTED' ? (
  //           ''
  //         ) : (
  //           <div>
  //             <span className="multiLineLabel">{ele.executePointMeaning}</span>
  //             {ele.executeStatusMeaning}
  //           </div>
  //         )}
  //         {ele.executeStatusMeaning}
  //       </p>
  //     ));
  //   } else {
  //     const statusSecond = value.slice(0, 2);
  //     const renderPart = (contentItems, overFlag) =>
  //       overFlag ? (
  //         <div className="over-content">
  //           {contentItems &&
  //             contentItems.length &&
  //             contentItems.map((item) => (
  //               <div className="moreContent">
  //                 <span className="multiLineLabel">{item.executePointMeaning}</span>
  //                 {item.executeStatusMeaning}
  //               </div>
  //             ))}
  //         </div>
  //       ) : (
  //         contentItems &&
  //         contentItems.length &&
  //         contentItems.map((item) => (
  //           <div>
  //             <span className="multiLineLabel">{item.executePointMeaning}</span>
  //             {item.executeStatusMeaning}
  //           </div>
  //         ))
  //       );
  //     const otherItem = value.slice(2);
  //     return (
  //       <Fragment>
  //         {renderPart(statusSecond)}
  //         <Popover placement="right" content={renderPart(otherItem, true)}>
  //           <span className="ellipsis">. . .</span>
  //         </Popover>
  //       </Fragment>
  //     );
  //   }
  // };

  const hiddenExecutionStatus = (record, name) => {
    const prExecutePointVOList = record.get('prExecutePointVOList');
    if (prExecutePointVOList?.length) {
      if (prExecutePointVOList.find((ele) => ele.executePoint.includes(name))) {
        return false;
      }
    }
    return true;
  };

  const renderStatusTag = (record, name) => {
    const prExecutePointVOList = record.get('prExecutePointVOList');
    let text = '';
    let tagStatus;
    if (prExecutePointVOList?.length) {
      prExecutePointVOList.find((ele) => {
        if (ele.executePoint.includes(name)) {
          text = ele.executeStatusMeaning;
          tagStatus = ele.executeStatus;
          return true;
        } else {
          return false;
        }
      });
    }
    return colorRender(tagStatus, text);
  };

  const wholeColumns = React.useMemo(() => {
    // const colorStatus = (value) =>
    //   value === 'NOT_STARTED' ? 'rgba(0,0,0,0.25)' : value === 'FINISHED' ? '#47B881' : '#FCA000';

    const columns = [
      {
        name: 'docInfoGroup',
        header: intl.get(`sprm.common.model.common.docInfoGroup`).d('采购申请单号信息'),
        aggregation: true,
        align: 'left',
        children: [
          {
            name: 'displayPrNum',
            header: intl.get(`sprm.common.model.common.prNum`).d('采购申请编号'),
            width: 100,
          },
          {
            name: 'title',
            header: intl.get(`sprm.common.model.common.purchaseTitle`).d('采购申请标题'),
            width: 100,
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
            width: 150,
          },
          {
            name: 'ouName',
            width: 150,
          },
          {
            name: 'purchaseOrgName',
            width: 150,
          },
        ],
      },
      {
        name: 'createInfoGroup',
        header: intl.get(`sprm.common.model.common.createInfoGroup`).d('创建信息'),
        aggregation: true,
        align: 'left',
        children: [
          {
            name: 'creationDate',
            width: 140,
          },
          {
            name: 'creatorName',
            width: 100,
          },
          {
            name: 'unitName',
            width: 100,
          },
          {
            name: 'headerPrRequestedName',
            width: 100,
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
            name: 'invOrganizationName',
            width: 100,
          },
          {
            name: 'displayLineNum',
            width: 100,
          },
          {
            name: 'quantity',
            width: 100,
          },
          {
            name: 'uomName',
            width: 100,
            renderer: ({ record }) => record.get('uomCodeAndName'),
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
            header: intl.get(`sprm.common.model.common.itemCode`).d('物料编码'),
            width: 120,
          },
          {
            name: 'itemName',
            width: 100,
          },
          {
            name: 'categoryName',
            width: 100,
          },
          {
            name: 'productNum',
            width: 100,
          },
          {
            name: 'productName',
            width: 100,
          },
          {
            name: 'catalogName',
            width: 100,
          },
          { name: 'productBrand', width: 100 },
          { name: 'productModel', width: 100 },
          { name: 'packingList', width: 100 },
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
            name: 'originalCurrency',
            header: intl.get(`sprm.common.model.common.currency`).d('币种'),
            width: 100,
          },
          {
            name: 'taxIncludedUnitPrice',
            renderer: ({ text, record }) => {
              return record.get('linePriceHiddenFlag') === 1
                ? record.get('taxIncludedUnitPriceMeaning')
                : text;
            },
            width: 100,
          },
          {
            name: 'taxIncludedLineAmount',
            renderer: ({ text, record }) => {
              return record.get('linePriceHiddenFlag') === 1
                ? record.get('taxIncludedLineAmountMeaning')
                : text;
            },
            width: 100,
          },
        ],
      },
      {
        name: 'executionStatusGroup',
        width: 110,
        aggregation: true,
        header: intl.get(`sprm.common.model.prExecutePoint`).d('执行状态'),
        align: 'left',
        children: [
          {
            name: 'docFlow',
            header: intl.get(`sprm.common.model.common.docFlow`).d('单据流'),
            hidden: ![1, '1'].includes(docLinkControl.displayDocFlow),
            // hiddenInAggregation: record => hiddenExecutionStatus(record, 'docFlow'),
            renderer: ({ record }) => {
              if (record.get('occupiedQuantity') === 0) {
                return undefined;
              } else {
                return (
                  <div style={{ height: '100%', display: 'flex' }}>
                    <DocFlow
                      tableName="sprm_pr_line"
                      tablePk={record.get('prLineId')}
                      buttonType="button"
                    />
                  </div>
                );
              }
            },
          },
          {
            name: 'project',
            header: intl.get('sprm.purchasePlatform.title.project').d('寻源立项'),
            hiddenInAggregation: (record) => hiddenExecutionStatus(record, 'project'),
            renderer: ({ record, name }) => renderStatusTag(record, name),
          },
          {
            name: 'rfx',
            header: intl.get('sprm.purchasePlatform.title.rfx').d('询报价'),
            hiddenInAggregation: (record) => hiddenExecutionStatus(record, 'rfx'),
            renderer: ({ record, name }) => renderStatusTag(record, name),
          },
          {
            name: 'bid',
            header: intl.get('sprm.purchasePlatform.title.bid').d('招投标'),
            hiddenInAggregation: (record) => hiddenExecutionStatus(record, 'bid'),
            renderer: ({ record, name }) => renderStatusTag(record, name),
          },
          {
            name: 'contact',
            header: intl.get('sprm.purchasePlatform.title.contact').d('协议'),
            hiddenInAggregation: (record) => hiddenExecutionStatus(record, 'contact'),
            renderer: ({ record, name }) => renderStatusTag(record, name),
          },
          {
            name: 'order',
            header: intl.get('sprm.purchasePlatform.title.order').d('订单'),
            hiddenInAggregation: (record) => hiddenExecutionStatus(record, 'order'),
            renderer: ({ record, name }) => renderStatusTag(record, name),
          },
          {
            name: 'delivery',
            header: intl.get('sprm.purchasePlatform.title.asn').d('送货'),
            hiddenInAggregation: (record) => hiddenExecutionStatus(record, 'delivery'),
            renderer: ({ record, name }) => renderStatusTag(record, name),
          },
          {
            name: 'receipt',
            header: intl.get('sprm.purchasePlatform.title.rcv').d('收货'),
            hiddenInAggregation: (record) => hiddenExecutionStatus(record, 'receipt'),
            renderer: ({ record, name }) => renderStatusTag(record, name),
          },
          {
            name: 'bill',
            header: intl.get('sprm.purchasePlatform.title.invoice').d('开票'),
            hiddenInAggregation: (record) => hiddenExecutionStatus(record, 'bill'),
            renderer: ({ record, name }) => renderStatusTag(record, name),
          },
          {
            name: 'reconciliation',
            header: intl.get('sprm.purchasePlatform.title.reconciliation').d('对账'),
            hiddenInAggregation: (record) => hiddenExecutionStatus(record, 'reconciliation'),
            renderer: ({ record, name }) => renderStatusTag(record, name),
          },
          {
            name: 'payment',
            header: intl.get('sprm.purchasePlatform.title.payment').d('付款'),
            hiddenInAggregation: (record) => hiddenExecutionStatus(record, 'payment'),
            renderer: ({ record, name }) => renderStatusTag(record, name),
          },
        ],
        renderer: ({ record, text }) => {
          const prExecutePointVOList = record.get('prExecutePointVOList');
          const executeLenght = prExecutePointVOList?.length;
          if (executeLenght) {
            if (executeLenght > 2) {
              return text;
            } else {
              return colorRender('PENDING', prExecutePointVOList[0].executeStatusMeaning);
            }
          } else {
            return '-';
          }
        },
      },
    ];

    let notOtherFileds = [];
    columns.forEach((ele) => {
      if (ele.children) {
        notOtherFileds = notOtherFileds.concat(ele.children.map((e) => e.name));
      }
    });

    const otherFileds = lineColumns.filter((ele) => !notOtherFileds.includes(ele.name));

    columns.push({
      name: 'otherGzuop',
      width: 110,
      aggregation: true,
      header: intl.get(`sprm.common.model.common.otherGzuop`).d('其他聚合组'),
      align: 'left',
      children: otherFileds,
    });

    return columns;
  });

  const fetchLineDetail = (record) => {
    const amountActiveTab = {
      reconciliationStatus: record.get('reconciliationAmount') > 0,
      paymentStatus: record.get('paymentAmount') > 0,
    };
    const activeTab = record.get('prExecutePointVOList')
      ? record
        .get('prExecutePointVOList')
        ?.filter(
          (ele) =>
            (ele.executeStatus && ele.executeStatus !== 'NOT_STARTED') ||
            amountActiveTab[ele.executePoint]
        )
        ?.map((ele) => ele.executePoint)
      : [];
    // prSourcePlatform
    return Modal.open({
      key: Modal.key(),
      drawer: true,
      title: intl.get('sprm.common.modal.contectDoc').d('关联单据'),
      bodyStyle: { padding: 0 },
      children: (
        <ContectDoc
          {...{
            customizeTabPane,
            customizeTable,
            prLineId: record.get('prLineId'),
            currentRecord: record,
            cuxQueryParams: lineDs.getState('cuxQueryParams') || {},
            record,
            activeTab,
            priceHiddenFlag: lineDs.current ? lineDs.current.get('linePriceHiddenFlag') : undefined,
          }}
        />
      ),
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: () => { },
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: (okBtn) => okBtn,
      style: { width: '1090px' },
    });
  };

  const handleQuery = ({ params = {} }) => {
    const clearParams = {}; // 清理
    const { _back } = location?.state || {};
    // eslint-disable-next-line no-unused-expressions
    const dataObj = lineDs.queryDataSet?.current?.toData() || {};
    if (dataObj) {
      for (const key in dataObj) {
        if (
          ![
            'multiSelectHeaderNums',
            'multiSelectHeaderAndLineNums',
            'purchasePlatformPrLineStatusCodeList',
            'supplierCompanyId',
            'supplierId',
          ].includes(key)
        ) {
          // 排除掉自定义的查询条件
          if (!Object.prototype.hasOwnProperty.call(params, key)) {
            clearParams[key] = undefined;
          }
        }
      }
    }

    // eslint-disable-next-line no-unused-expressions
    lineDs.queryDataSet.current
      ? lineDs.queryDataSet.current.set({
        ...params,
        ...clearParams,
      })
      : lineDs.queryDataSet.loadData([
        {
          ...params,
          ...clearParams,
        },
      ]);

    if (_back === -1 && !init) {
      lineDs.query(lineDs.currentPage);
    } else {
      lineDs.query();
    }
    setInit(true);
  };

  const onChangeField = ({ name, value, record }) => {
    if (name === 'tempkey') {
      if (record.getField(name)?.get('lovCode') === 'SSLM.SUPPLIER_CHOOSE') {
        // eslint-disable-next-line no-unused-expressions
        lineDs.queryDataSet?.current?.set({
          supplierCompanyId: value?.supplierCompanyIds,
          supplierId: value?.extSupplierIds,
        });
      } else {
        // eslint-disable-next-line no-unused-expressions
        lineDs.queryDataSet?.current?.set({
          supplierCompanyId: value?.supplierCompanyId,
          supplierId: value?.supplierId,
        });
      }
    } else if (!value) {
      // eslint-disable-next-line no-unused-expressions
      lineDs.queryDataSet?.current?.set({ [name]: undefined });
    }
  };

  const resetQueryDs = () => {
    // eslint-disable-next-line no-unused-expressions
    lineDs.queryDataSet?.current.reset();
  };

  return (
    <Fragment>
      <div style={{ height: 'calc(100vh - 254px)' }}>
        {
          // tableDisplay === 'flat' &&
          customizeTable(
            {
              code: 'SPRM.PURCHASE_PLAFORM_EXECUTION.LIST',
            },
            <SearchBarTable
              style={{ maxHeight: 'calc(100% - 22px)' }}
              aggregation={tableDisplay !== 'flat'}
              dataSet={lineDs}
              columns={tableDisplay === 'flat' ? lineColumns : wholeColumns}
              data={[]}
              cacheState
              virtual
              virtualSpin
              virtualCell
              pagination={{
                pageSizeOptions: ['10', '20', '50', '100', '200'],
              }}
              showAllPageSelectionButton
              // className="exrcution-table"
              searchBarConfig={{
                right: {
                  render: () => (
                    <ViewFilter tableDisplay={tableDisplay} setDisplayStatus={setTableDisplay} />
                  ),
                },
                left: {
                  render: () => (
                    <MutlTextFieldSearch
                      name="multiSelectHeaderAndLineNums"
                      dataSet={lineDs}
                      placeholder={intl
                        .get('sprm.common.modal.enterPrNumOrLineNum')
                        .d('请输入采购申请单号-行号')}
                    />
                  ),
                },
                editorProps: {
                  prStatusCode: {
                    optionsFilter: (options) => !['EXOSYS_APPROVAL'].includes(options.get('value')),
                  },
                  orderStatus: {
                    optionsFilter: (options) =>
                      isOldUser ? options.data.value !== 'CLOSED' : true,
                  },
                  bidStatus: {
                    optionsFilter: (options) =>
                      isOldUser ? options.data.value !== 'CLOSED' : true,
                  },
                  rfxStatus: {
                    optionsFilter: (options) =>
                      isOldUser ? options.data.value !== 'CLOSED' : true,
                  },
                  projectStatus: {
                    optionsFilter: (options) =>
                      isOldUser ? options.data.value !== 'CLOSED' : true,
                  },
                  contractFrameworkStatus: {
                    optionsFilter: (options) =>
                      isOldUser ? options.data.value !== 'CLOSED' : true,
                  },
                  contractStatus: {
                    optionsFilter: (options) =>
                      isOldUser ? options.data.value !== 'CLOSED' : true,
                  },
                  executionStrategyCode: {
                    optionsFilter: (options) =>
                      isOldUser
                        ? options.data.value !== 'BEFORE_SOURCE_AFTER_ORDER' &&
                        options.data.value !== 'SOURCE_AND_ORDER'
                        : true,
                  },
                },
                fieldProps: cuxFieldProps,
                onQuery: handleQuery,
                onClear: resetQueryDs,
                onReset: resetQueryDs,
                onFieldChange: onChangeField,
              }}
              onAggregationChange={(_aggregation) => setTableDisplay(_aggregation)}
              searchCode="SPRM.PURCHASE_PLAFORM_EXECUTION.FLATSEARCHBAR"
              queryFieldsLimit={3}
            />
          )
        }
      </div>
      {priceListModalVisible && (
        <PriceListModal
          visible={priceListModalVisible}
          onClose={() => {
            setPriceListModalVisible(false);
          }}
          data={priceData}
        />
      )}
    </Fragment>
  );
};

export default memo(
  compose(
    // withCustomize({
    //   unitCode: [
    //     'SPRM.PURCHASE_PLAFORM_EXECUTION.TAB',
    //     'SPRM.PURCHASE_PLAFORM_EXECUTION.ASN_LINE',
    //     'SPRM.PURCHASE_PLAFORM_EXECUTION.BID_LIST',
    //     'SPRM.PURCHASE_PLAFORM_EXECUTION.CONTRACT_LIST',
    //     'SPRM.PURCHASE_PLAFORM_EXECUTION.INVOICE_LIST',
    //     'SPRM.PURCHASE_PLAFORM_EXECUTION.LIST',
    //     'SPRM.PURCHASE_PLAFORM_EXECUTION.ORDER_LIST',
    //     'SPRM.PURCHASE_PLAFORM_EXECUTION.PROJECT_LIST',
    //     'SPRM.PURCHASE_PLAFORM_EXECUTION.REC_LINE',
    //     'SPRM.PURCHASE_PLAFORM_EXECUTION.RFX_LIST',
    //     'SPRM.PURCHASE_PLAFORM_EXECUTION.SETTLE_LIST',
    //   ],
    // }),
    formatterCollections({
      code: [
        'sprm.common',
        'sprm.purchaseRequisitionInquiry',
        'sprm.purchaseRequisitionAssign',
        'component.docFlow',
      ],
    })
  )(Index)
);
