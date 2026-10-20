import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { Table, Button, Modal, DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { noop, throttle, isEmpty } from 'lodash';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { getResponse, getCurrentTenant } from 'utils/utils';
import ExcelExportNew from 'hzero-front/lib/components/ExcelExportPro';
import { SRM_SSRC } from '_utils/config';

import { numberSeparatorRender } from '@/utils/renderer';

// import QuotationDetailModal from '@/routes/components/QuotationDetailCurrent/Supplier';
// import LadderPriceEditor from '@/routes/ssrc/components/LadderPrice/LadderPriceEditor';
import LadderPrice from '@/routes/ssrc/components/LadderPrice/WholeLadderPrice';

import {
  fetchConfigSheet,
  // fetchSourceSupplierRelativeConfig,
} from '@/services/inquiryHallNewService';

import SortByMaterialAndPrice from '../../components/SortByMaterialAndPrice';

import { itemLineDataSet } from '../Stores/itemLineDS';
import { supplierLineDS } from '../Stores/supplierLineDS';
import Items from './Items';
import Suppliers from './Suppliers';

import Styles from '../../Update/index.less';

const QuotationLineTable = (props) => {
  const {
    lineDS,
    customizeTable = noop,
    custLoading,
    organizationId,
    basicFormDS,
    getCustomizeUnitCode = () => {},
    doubleUnitFlag = false,
    rfxHeaderId,
    history,
    viewApplicationOrgModal,
    sslmLifeCycleFlag = true,
    remote,
  } = props;

  const [configSheet, setConfigSheet] = useState({});

  const purchaseTurnFlag = lineDS ? lineDS?.getState('purchaseTurnFlag') : 0;

  const hasTaxFlag = basicFormDS?.current?.get('benchmarkPriceType') === 'TAX_INCLUDED_PRICE';

  const currentModal = {}; // 防止多行多个组件实例打开多次

  useEffect(() => {
    fetchConfig();
  }, []);

  // 查询配置表
  const fetchConfig = async () => {
    let data = null;

    try {
      data = await fetchConfigSheet({
        configCode: 'sprm_old_ui_config',
        organizationId,
        data: {
          tenant: getCurrentTenant().tenantNum,
        },
      });
      data = getResponse(data);
      if (!data) {
        return;
      }

      setConfigSheet({
        configSheet: { sprmOldUiConfig: !isEmpty(data) },
      });
    } catch (e) {
      throw e;
    }
  };

  const linktoPrNumDetail = useCallback(
    (record = {}, prHeaderId) => {
      if (!prHeaderId) {
        return;
      }

      const { sprmOldUiConfig = false } = configSheet || {};
      const { prSourcePlatform } = record.get(['prSourcePlatform']);
      const isErp = prSourcePlatform && prSourcePlatform.toLowerCase() === 'erp';
      let pathUrl = null;

      if (!sprmOldUiConfig) {
        // 记录一个标识, 实现跳转的采购申请工作台明细后,点击返回按钮，返回采购申请工作台主页面的【整单-全部】页签
        // 需要去采购申请工作台去适配此方案
        // NOTE window.ssrc.directionToPurchasePlatform = 'inquiryHallNewUpdate,inquiryHallNewDetail';
        window.ssrcDirectionToPurchasePlatformSymbol = 'inquiryHallNewUpdate';

        // 采购申请工作台
        pathUrl = isErp
          ? `/sprm/purchase-platform/erp-detail/${prHeaderId}`
          : `/sprm/purchase-platform/noerp-detail/${prHeaderId}`;
      } else {
        pathUrl = isErp
          ? `/sprm/purchase-requisition-inquiry/erp-detail/${prHeaderId}`
          : `/sprm/purchase-requisition-inquiry/not-erp-detail/${prHeaderId}`;
      }

      history.push({
        pathname: pathUrl,
      });
    },
    [history, configSheet]
  );

  /**
   * render price or amount by double unit flag
   * */
  const renderPriceOrAmount = useCallback(
    (record, baseField, secondaryField, precissionType = null) => {
      if (!record || !baseField || !secondaryField) {
        return '';
      }
      let currentValue = null;
      const field = !doubleUnitFlag ? baseField : secondaryField;
      currentValue = record.get(field);
      const precision = precissionType ? record.getState(precissionType) : null;
      return numberSeparatorRender(currentValue, precision);
    },
    [doubleUnitFlag]
  );

  // 适应范围查看
  const viewItemLineApplicationOrgModal = (record = {}) => {
    const { rfxLineItemId, applicationScopeFlag = 0 } = record?.get([
      'rfxLineItemId',
      'applicationScopeFlag',
    ]);
    viewApplicationOrgModal({
      sourceLineItemId: rfxLineItemId,
      applicationScopeFlag,
    });
  };

  // 价格标红
  const priceRedRender = ({ value, name, record }) => {
    const colorRemote = remote
      ? remote?.process('SSRC_WHOLE_OFFLINE_ENTRY_DETAIL_PROCESS_PRICE_COLOR', 'red')
      : 'red';
    const dom = (
      <span style={record.get('priceRedFlag') === 1 ? { color: colorRemote } : null}>
        {numberSeparatorRender(value)}
      </span>
    );
    const a = doubleUnitFlag && hasTaxFlag && name === 'currentQuotationSecPrice';
    const b = !doubleUnitFlag && hasTaxFlag && name === 'currentQuotationPrice';
    const c = doubleUnitFlag && !hasTaxFlag && name === 'netSecondaryPrice';
    const d = !doubleUnitFlag && !hasTaxFlag && name === 'netPrice';
    if (a || b || c || d) return dom;
    return numberSeparatorRender(value);
  };

  const columns = useMemo(
    () =>
      [
        {
          name: 'suggestedFlag',
          width: 80,
          renderer: ({ value }) => yesOrNoRender(value),
          lock: 'left',
          align: 'center',
        },
        doubleUnitFlag
          ? {
              name: 'currentQuotationSecPrice',
              width: 150,
              renderer: (record) => priceRedRender(record),
            }
          : null,
        {
          name: 'currentQuotationPrice',
          width: 150,
          renderer: (record) => priceRedRender(record),
        },
        {
          name: 'localLnQuotationPrice',
          width: 150,
          renderer: ({ record, name }) =>
            renderPriceOrAmount(record, name, 'localLnQuotationSecPrice'),
        },
        doubleUnitFlag
          ? {
              name: 'netSecondaryPrice',
              width: 150,
              renderer: (record) => priceRedRender(record),
            }
          : null,
        {
          name: 'netPrice',
          width: 150,
          renderer: (record) => priceRedRender(record),
        },
        {
          name: 'localLnNetPrice',
          width: 150,
          renderer: ({ record, name }) => renderPriceOrAmount(record, name, 'localLnNetSecPrice'),
        },
        {
          name: 'currentQuotationQuantity',
          width: 150,
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        doubleUnitFlag
          ? {
              name: 'currentQuotationSecQuantity',
              width: 150,
              renderer: ({ value }) => numberSeparatorRender(value),
            }
          : null,
        {
          name: 'totalAmount',
          width: 150,
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        {
          name: 'netAmount',
          width: 150,
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        {
          name: 'taxRate',
          width: 100,
          renderer: ({ record }) => {
            return record.get('taxIdMeaning');
          },
          align: 'right',
        },
        {
          width: 150,
          name: 'demandDate',
        },
        {
          name: 'priceBatchQuantity',
          width: 150,
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        {
          name: 'currentDeliveryCycle',
          width: 150,
        },
        {
          name: 'currentExpiryDateFrom',
          width: 180,
        },
        {
          name: 'currentExpiryDateTo',
          width: 180,
        },
        {
          name: 'stageDescription',
          width: 180,
        },
        {
          name: 'currentAttachmentUuid',
          width: 140,
        },
        {
          name: 'supplierCompanyNum',
          width: 150,
        },
        {
          name: 'priceCoefficient',
          width: 100,
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        {
          name: 'weightPrice',
          width: 140,
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        {
          name: 'supplierCompanyName',
        },
        {
          name: 'currentPerNetPrice',
          width: 140,
          renderer: ({ record, name }) =>
            renderPriceOrAmount(record, name, 'currentPerNetSecPrice'),
        },
        {
          name: 'currentPerTaxIncludedPrice',
          width: 140,
          renderer: ({ record, name }) =>
            renderPriceOrAmount(record, name, 'currentPerTaxInclSecPrice'),
        },
        {
          name: 'referencePrice',
          width: 140,
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        {
          name: 'differentPrice',
          width: 140,
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        {
          name: 'taxIncludedFlag',
          width: 140,
          renderer: ({ value }) => yesOrNoRender(value),
        },
        {
          name: 'paymentTermName',
          width: 140,
        },
        {
          name: 'paymentTypeName',
          width: 140,
        },
        {
          name: 'quotationCurrencyCode',
          width: 120,
        },
        {
          name: 'exchangeRate',
          width: 140,
        },
        {
          name: 'estimatedPrice',
          width: 140,
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        {
          name: 'netEstimatedPrice',
          width: 140,
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        {
          name: 'estimatedAmount',
          width: 140,
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        {
          name: 'netEstimatedAmount',
          width: 140,
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        {
          name: 'currentQuotationRemark',
          width: 180,
        },
        {
          name: 'rfxLineItemNum',
          width: 80,
          lock: 'left',
        },
        {
          name: 'ouName',
          width: 160,
        },
        {
          name: 'invOrganizationName',
          width: 160,
        },
        {
          name: 'itemCode',
          width: 160,
        },
        {
          name: 'itemName',
          width: 160,
        },
        {
          name: 'itemCategoryName',
          width: 160,
        },
        {
          name: 'uomName',
          width: 160,
        },
        doubleUnitFlag
          ? {
              name: 'secondaryUomName',
              width: 150,
            }
          : null,
        {
          name: 'origin',
          width: 160,
        },
        {
          name: 'currentPromisedDate',
          width: 180,
        },
        {
          name: 'rfxQuantity',
          width: 140,
          renderer: ({ record, value }) =>
            doubleUnitFlag && record.get('itemId')
              ? numberSeparatorRender(value)
              : numberSeparatorRender(value, record.getState('uom_precision')),
        },
        doubleUnitFlag
          ? {
              name: 'secondaryQuantity',
              width: 140,
              renderer: ({ record, value }) =>
                numberSeparatorRender(value, record.getState('uom_precision')),
            }
          : null,
        {
          name: 'minPurchaseQuantity',
          width: 140,
          renderer: ({ value, record }) =>
            numberSeparatorRender(value, record.getState('uom_precision')),
        },
        {
          name: 'minPackageQuantity',
          width: 140,
          renderer: ({ value, record }) =>
            numberSeparatorRender(value, record.getState('uom_precision')),
        },
        {
          renderer: ({ value }) => yesOrNoRender(value),
          name: 'freightIncludedFlag',
          width: 150,
        },
        {
          name: 'freightAmount',
          width: 140,
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        {
          name: 'quotedDate',
          width: 180,
        },
        {
          name: 'specs',
          width: 150,
        },
        {
          name: 'allottedQuantity',
          width: 140,
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        doubleUnitFlag
          ? {
              name: 'allottedSecondaryQuantity',
              width: 140,
              renderer: ({ value }) => numberSeparatorRender(value),
            }
          : null,
        {
          name: 'allottedRatio',
          width: 140,
        },
        {
          name: 'suggestedRemark',
          width: 150,
        },
        purchaseTurnFlag // 是否申请转询价
          ? {
              name: 'prNum',
              width: 150,
              renderer: ({ record, value }) => {
                const { prData, prHeaderId } = record.get(['prData', 'prHeaderId']);

                if (prHeaderId) {
                  if (prData) {
                    return JSON.parse(prData).map((prItem) => {
                      return (
                        <a onClick={() => linktoPrNumDetail(record, prItem.prHeaderId)}>
                          {`${prItem.displayPrNum}|${prItem.displayLineNum}`}{' '}
                        </a>
                      );
                    });
                  } else {
                    return <a onClick={() => linktoPrNumDetail(record, prHeaderId)}>{value}</a>;
                  }
                } else {
                  return value;
                }
              },
            }
          : null,
        {
          name: 'applicationScopeFlag',
          width: 100,
          renderer: ({ record }) => {
            const { rfxLineItemId = null, applicationScopeFlag = 0 } = record?.get([
              'rfxLineItemId',
              'applicationScopeFlag',
            ]);

            return (
              <a
                disabled={!applicationScopeFlag || !rfxLineItemId}
                onClick={() => viewItemLineApplicationOrgModal(record)}
              >
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.view`).d('查看')}
              </a>
            );
          },
        },
        {
          name: 'ladderInquiryFlag',
          width: 100,
          renderer: ({ value }) => yesOrNoRender(value),
        },
        {
          width: 120,
          name: 'ladderLevel',
          renderer: ({ record }) => {
            const { ladderInquiryFlag } = record.get(['ladderInquiryFlag']);

            const ladderVisibleFlag = ladderInquiryFlag === 1;

            return ladderVisibleFlag ? (
              <LadderPrice
                readOnly
                uiType="c7n-pro"
                // pageName="quotationHistory"
                headerDS={basicFormDS}
                record={record}
                doubleUnitFlag={doubleUnitFlag}
                organizationId={organizationId}
                currentModal={currentModal}
              />
            ) : null;
          },
        },
      ].filter(Boolean),
    [
      basicFormDS,
      doubleUnitFlag,
      customizeTable,
      purchaseTurnFlag,
      linktoPrNumDetail,
      renderPriceOrAmount,
      organizationId,
      currentModal,
    ]
  );

  // 物料与供应商查看
  const viewItemSupplier = useCallback(
    throttle(async () => {
      const commonProps = {
        organizationId,
        doubleUnitFlag,
        rfxHeaderId,
        custLoading,
        customizeTable,
        history,
        basicFormDS,
        sslmLifeCycleFlag,
      };

      const itemProps = {
        ...commonProps,
        purchaseTurnFlag,
        customizeUnitCode: getCustomizeUnitCode('itemTable'),
        linktoPrNumDetail,
        viewItemLineApplicationOrgModal,
      };
      const supplierProps = {
        ...commonProps,
        customizeUnitCode: getCustomizeUnitCode('supplierTable'),
      };

      const itemLineDS = new DataSet(itemLineDataSet(itemProps));
      const supplierDS = new DataSet(supplierLineDS(supplierProps));

      const modalKey = Modal.key();
      Modal.open({
        destroyOnClose: true,
        closable: true,
        key: modalKey,
        drawer: true,
        title: intl
          .get(`ssrc.inquiryHall.view.message.tab.itemDetailsAndSuppliers`)
          .d('物料与供应商'),
        children: (
          <div>
            <Items {...itemProps} itemLineDS={itemLineDS} />
            <Suppliers {...supplierProps} supplierDS={supplierDS} />
          </div>
        ),
        okCancel: false,
        style: { width: '1090px' },
      });
    }, 1200),
    [
      getCustomizeUnitCode,
      organizationId,
      doubleUnitFlag,
      rfxHeaderId,
      custLoading,
      customizeTable,
      history,
      linktoPrNumDetail,
      purchaseTurnFlag,
      viewItemLineApplicationOrgModal,
    ]
  );

  // 获取导出参数
  const getExportParams = useMemo(() => {
    return {
      // 新导出
      name: 'export',
      requestUrl: `${SRM_SSRC}/v1/${organizationId}/rfx/offline-whole/line-export?rfxHeaderId=${rfxHeaderId}`,
      queryParams: {
        rfxHeaderId,
      },
      templateCode: 'SSRC_OFFLINE_WHOLE_EXPORT',
      buttonText: intl.get('hzero.common.button.export').d('导出'),
      otherButtonProps: {
        icon: 'unarchive',
        type: 'c7n-pro',
        funcType: 'flat',
      },
    };
  }, [rfxHeaderId, organizationId]);

  // table buttons
  const getButtons = useCallback(() => {
    return [
      <Button
        name="itemSupplier"
        onClick={viewItemSupplier}
        icon="view_list-o"
        disabled={!lineDS?.length}
      >
        {intl.get('ssrc.inquiryHall.model.inquiryHall.button.itemsAndSuppliers').d('物料与供应商')}
      </Button>,
      <SortByMaterialAndPrice name="sortByPrice" lineDS={lineDS} detailFlag />,
      <ExcelExportNew {...getExportParams} />,
    ];
  }, [lineDS, viewItemSupplier, rfxHeaderId]);

  // line table
  const tableContent = useCallback(() => {
    return (
      <Table
        clearButton
        bordered
        custLoading={custLoading}
        dataSet={lineDS}
        rowKey="offlineQuoLineId"
        virtual={false}
        virtualCell={false}
        style={{ maxHeight: 'calc(100vh - 300px)' }}
        columns={columns}
        buttons={getButtons()}
      />
    );
  }, [custLoading, lineDS, columns, getButtons]);

  return (
    <div className={Styles['quotation-table']}>
      {customizeTable(
        { code: getCustomizeUnitCode('table'), buttonCode: getCustomizeUnitCode('tableButtons') },
        tableContent()
      )}
    </div>
  );
};

const hocComponent = (Com) => {
  return observer(Com);
};

export default hocComponent(QuotationLineTable);
