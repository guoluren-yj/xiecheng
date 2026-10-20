import React, {
  useContext,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useState,
  useImperativeHandle,
} from 'react';
import intl from 'utils/intl';
import { Badge } from 'choerodon-ui';
import { Table, Pagination, Select, TextField, CheckBox, Lov } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { runInAction } from 'mobx';
import { isEmpty, noop } from 'lodash';

import notification from 'utils/notification';
import SupplierLov from 'srm-front-boot/lib/components/SupplierLov';
import { amountCalculation } from 'srm-front-boot/lib/utils/utils';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import { fetchSourceRFSupplierRelativeConfig } from '@/services/inquiryHallNewService';
// import { queryPrecision } from '@/services/commonService';
import { saveOfflineSupplierReply } from '@/services/rfService';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import { numberSeparatorRender } from '@/utils/renderer';
import { calculateBasicQty, amountCalcType } from '@/utils/utils';

import LadderPrice from '@/routes/ssrc/components/RFLadderPrice';

import RenderButtons from './TableButton';
import Store from '../store/index';
import styles from './index.less';

const SupplierReply = observer(
  ({
    rightTableDsMap,
    dataSource = [],
    initFetchSupplier = noop,
    pagination,
    getParams,
    emptyQuotationDs,
    parentRef,
    doubleUnitFlag = false,
    setLoading = noop,
  }) => {
    const supplierInfoTableRef = useRef(null);
    const supplierReplyTableRef = useRef(null);
    const quotationRef = useRef(null);
    const refObj = useRef({});
    const refList = useRef([]);
    const [size, setSize] = useState('');

    useImperativeHandle(parentRef, () => ({
      handleTableScrollLeft,
      size,
    }));

    const {
      commonDs: { basicFormDs, supplierInfoDs, supplierReplyDs },
      routerParams: { rfHeaderId, sourceCategory },
      customizeTable,
    } = useContext(Store);

    // 滚动事件
    const handleTableScrollLeft = useCallback(
      (scrollLeft, id = '') => {
        refList.current.forEach((item) => {
          if (item !== id && refObj.current?.[item]) {
            // eslint-disable-next-line no-unused-expressions
            refObj.current?.[item].setScrollLeft(scrollLeft);
          }
          // eslint-disable-next-line no-unused-expressions
          quotationRef.current?.setScrollLeft(scrollLeft);
        });
      },
      [quotationRef.current, refList.current, refObj.current]
    );

    const [caclRule, setCaclRule] = useState(null); // 业务规则定义-金额计算方式

    useEffect(() => {
      initCalcType();
    }, [basicFormDs?.current]);

    const initCalcType = async () => {
      const tenantId = basicFormDs?.current?.get('tenantId');
      if (!tenantId) return;

      const result =
        (await amountCalcType({
          purTenantId: tenantId,
          organizationId: getCurrentOrganizationId(),
          supplierFlag: 1,
        })) || [];
      setCaclRule(result?.[0]);
    };

    // 供应商lov属性
    const getSupplierLovProps = (options = {}) => {
      const supplierLovProps = {
        clearButton: false,
        modalProps: {
          style: { maxWidth: '1500px', width: '1000px' },
          onOk: newBulkAddSupplier,
        },
        beforeQuery: fetchSourceSupplierRelativeConfigData,
      };

      return {
        queryData: { companyId: basicFormDs?.current?.get('companyId') }, // 初始化查询参数 body payload
        ...supplierLovProps,
        ...options,
      };
    };

    // 供应商lov回调
    const newBulkAddSupplier = () => {
      const CurrentRecord = supplierInfoDs?.current;
      const data = CurrentRecord?.toData();
      const { supplierLov = [] } = data || {};

      if (isEmpty(supplierLov)) {
        notification.warning({
          message: intl
            .get('hzero.common.message.confirm.selected.atLeast')
            .d('请至少选择一行数据'),
        });
        return false;
      }

      const {
        supplierId = null,
        supplierNum = null,
        supplierName = null,
        supplierCompanyId = null,
        supplierCompanyName = null,
        supplierCompanyNum = null,
        name = null,
        mobilephone = null,
        mail = null,
        internationalTelCode = null,
      } = supplierLov || {};

      if (!supplierCompanyId && !supplierId) {
        notification.warning({
          message: intl.get('hzero.common.notification.warn').d('操作异常'),
        });
        return false;
      }
      CurrentRecord.set({
        supplierCompanyName: supplierCompanyName || supplierName,
        supplierCompanyNum: supplierCompanyNum || supplierNum,
        supplierCompanyId,
        contactName: name,
        contactPhone: mobilephone,
        contactMail: mail,
        internationalTelCode,
      });
    };

    const fetchSourceSupplierRelativeConfigData = async () => {
      const params = {
        organizationId: getCurrentOrganizationId(),
        sourceHeaderId: rfHeaderId,
        sourceFrom: 'RF_OFFLINE',
        sourceCategory,
      };
      let result = {};
      try {
        result = await fetchSourceRFSupplierRelativeConfig(params);
        result = getResponse(result);
        if (!result) {
          return;
        }

        const {
          reviewStatusList = null,
          existSuppliers = null,
          itemCategoryIds = null,
          sourceCode = null,
          erpFlag = null,
          excludeSuppliers = null,
          srmFlag = null,
        } = result;

        result = {
          defaultQueryItemCategoryIds: formatListToString(itemCategoryIds),
          supplyReviewStatus: formatListToString(reviewStatusList),
          sourceCode,
          erpFlag,
          srmFlag,
          excludeSupplierDetailDTOS: excludeSuppliers,
          chooseDetailDTOS:
            basicFormDs?.current?.get('sourceMethod') === 'INVITE' ? existSuppliers : null, // 维护，过程控制-反选供应商，线下正选供应商
        };
      } catch (e) {
        throw e;
      }

      return result || {};
    };

    const formatListToString = (list = null) => {
      if (isEmpty(list)) {
        return null;
      }

      return list.join(',');
    };

    // 可供数量计算
    const changeQty = useCallback(
      async ({ record, line, type }) => {
        // 在这个地方单独计算数量是因为精度组件会触发两次ds的update
        const secondaryQuantity = record.get('validQuotationSecQuantity');
        if (record.get('itemId') && doubleUnitFlag) {
          if (record.get('secondaryUomId')) {
            const res = await calculateBasicQty({
              secondaryQuantity,
              itemId: record.get('itemId'),
              businessKey: record.get('rfxLineItemId') || record.id,
              doublePrimaryUomId: record.get('uomId'),
              secondaryUomId: record.get('secondaryUomId'),
              tenantId: basicFormDs?.current?.get('tenantId'),
            });
            if (type === 'validQuotationQuantity') {
              record.set(type, res ?? '');
            } else {
              line.set(type, res ?? '');
            }
          }
        } else if (type === 'validQuotationQuantity') {
          record.set(type, secondaryQuantity ?? '');
        } else {
          line.set(type, secondaryQuantity ?? '');
        }

        dynamicChangePriceByPriceType(record);
      },
      [doubleUnitFlag, basicFormDs?.current]
    );

    // 勾选放弃行回调
    const giveUpQuotationLine = useCallback((val = 0, record = {}) => {
      if (val) {
        record.set({
          // abandonedFlag: 0,
          validQuotationPrice: null,
          validQuotationSecPrice: null,
          validNetSecondaryPrice: null,
          validNetPrice: null,
          taxIncludedFlag: 0,
          taxId: null,
          validQuotationSecQuantity: null,
          validQuotationQuantity: null,
          priceBatchQuantity: null,
          attachmentUuid: null,
          netAmount: null,
          totalAmount: null,
        });
      }
    }, []);

    // 改变价格后统一数据处理
    const changePriceGetCommonProps = (record) => {
      if (!record) {
        return;
      }

      const {
        taxRate,
        taxIncludedFlag,
        validQuotationQuantity,
        validQuotationSecQuantity,
        benchmarkPriceType,
        financialPrecision,
        defaultPrecision,
        priceBatchQuantity,
        taxRateType,
      } =
        record?.get([
          'taxIncludedFlag',
          'taxRate',
          'validQuotationQuantity',
          'validQuotationSecQuantity',
          'benchmarkPriceType',
          'financialPrecision',
          'defaultPrecision',
          'priceBatchQuantity',
          'taxRateType',
        ]) || {};

      // const pristineTaxRate = record.getPristineValue('taxRate');
      const taxPriceFlag = benchmarkPriceType && benchmarkPriceType === 'TAX_INCLUDED_PRICE';
      const COMMONS = {
        hasTax: taxPriceFlag,
        hasMount: true,
        financialPrecision,
        defaultPrecision,
        caclRule,
        each: priceBatchQuantity,
        taxRateType,
      };

      const CurrentQuotationQuantity = !doubleUnitFlag
        ? validQuotationQuantity
        : validQuotationSecQuantity;
      const taxRateNew = taxIncludedFlag ? taxRate ?? undefined : undefined;
      COMMONS.quantity = CurrentQuotationQuantity;
      COMMONS.taxRate = taxRateNew ?? 0;

      if (!CurrentQuotationQuantity) {
        COMMONS.stageRule = 'noQuantity';
      }

      return COMMONS;
    };

    // 改变含税后，计算价格
    const handleChangeQuotationPrice = (record) => {
      if (!record) {
        return;
      }

      let currentQuotationPrice = record.get('validQuotationPrice');
      if (doubleUnitFlag) {
        currentQuotationPrice = record.get('validQuotationSecPrice');
      }

      const CommonProps = changePriceGetCommonProps(record) || {};
      const CurrentPriceCOMMONS = {};
      CurrentPriceCOMMONS.taxUnitPrice = currentQuotationPrice;
      const COMMONS = { ...CommonProps, ...CurrentPriceCOMMONS };
      const { calcNetUnitPrice, calcTaxAmount, calcNetAmount } = amountCalculation(COMMONS) || {};

      const priceValueObject = {
        validNetPrice: calcNetUnitPrice,
        totalAmount: calcTaxAmount,
        netAmount: calcNetAmount,
      };

      if (doubleUnitFlag) {
        priceValueObject.validNetSecondaryPrice = calcNetUnitPrice;
      }

      record.set(priceValueObject);
    };

    // change net price
    const handleChangeNetPrice = (record) => {
      if (!record) {
        return;
      }

      const { validNetPrice, validNetSecondaryPrice } = record.get([
        'validNetPrice',
        'validNetSecondaryPrice',
      ]);

      let netPrice = validNetPrice;
      if (doubleUnitFlag) {
        netPrice = validNetSecondaryPrice;
      }

      const CommonProps = changePriceGetCommonProps(record) || {};
      const CurrentPriceCOMMONS = {};
      CurrentPriceCOMMONS.netUnitPrice = netPrice;
      const COMMONS = { ...CommonProps, ...CurrentPriceCOMMONS };

      const { calcTaxUnitPrice, calcTaxAmount, calcNetAmount } = amountCalculation(COMMONS) || {};

      const priceValueObject = {
        validQuotationPrice: calcTaxUnitPrice,
        totalAmount: calcTaxAmount,
        netAmount: calcNetAmount,
      };

      if (doubleUnitFlag) {
        priceValueObject.validQuotationSecPrice = calcTaxUnitPrice;
      }

      record.set(priceValueObject);
    };

    const dynamicChangePriceByPriceType = (record) => {
      if (!record) {
        return;
      }

      const benchmarkPriceType = record.get('benchmarkPriceType');
      const taxPriceFlag = benchmarkPriceType && benchmarkPriceType === 'TAX_INCLUDED_PRICE';
      if (taxPriceFlag) {
        handleChangeQuotationPrice(record);
      } else {
        handleChangeNetPrice(record);
      }
    };

    // change tax
    const handleChangeTax = (data, record) => {
      const { taxRate = null, taxId = null, taxRateType = null } = data || {};
      record.set('taxId', { taxId, taxRate });
      record.set({
        taxRateType,
      });

      dynamicChangePriceByPriceType(record);
    };

    // 改变可供数量
    const changeQuantity = (record) => {
      dynamicChangePriceByPriceType(record);
    };

    // 含税标识
    const changeTaxInclude = (value, record) => {
      if (value === 0) {
        record.set({
          taxId: null,
          taxRate: null,
          taxRateType: null,
        });
      }
      dynamicChangePriceByPriceType(record);
    };

    const columns = useMemo(() => {
      return [
        {
          name: 'rfLineItemNum',
        },
        basicFormDs?.current?.get('subjectMatterRule') === 'PACK'
          ? {
              name: 'sectionCode',
            }
          : null,
        basicFormDs?.current?.get('subjectMatterRule') === 'PACK'
          ? {
              name: 'sectionName',
            }
          : null,
        {
          name: 'itemCode',
        },
        {
          name: 'itemName',
        },
        {
          name: 'abandonedFlag',
          editor: (record) => {
            return <CheckBox onChange={(val) => giveUpQuotationLine(val, record)} />;
          },
        },
        doubleUnitFlag
          ? {
              name: 'validQuotationSecPrice',
              editor: (record) => {
                return (
                  <C7nPrecisionInputNumber
                    name="validQuotationSecPrice"
                    record={record}
                    currency="currencyCode"
                    headerRecord={supplierReplyDs?.records?.find(
                      (item) => item?.get('quotationHeaderId') === record?.get('quotationHeaderId')
                    )}
                    onChange={() => handleChangeQuotationPrice(record)}
                  />
                );
              },
              renderer: ({ value, record }) =>
                numberSeparatorRender(
                  value,
                  record.get('defaultPrecision') ?? record.getState('currency_precision')
                ),
            }
          : null,
        doubleUnitFlag
          ? {
              name: 'validNetSecondaryPrice',
              editor: (record) => {
                return (
                  <C7nPrecisionInputNumber
                    name="validNetSecondaryPrice"
                    record={record}
                    currency="currencyCode"
                    headerRecord={supplierReplyDs?.records?.find(
                      (item) => item?.get('quotationHeaderId') === record?.get('quotationHeaderId')
                    )}
                    onChange={() => handleChangeNetPrice(record)}
                  />
                );
              },
              renderer: ({ value, record }) =>
                numberSeparatorRender(
                  value,
                  record.get('defaultPrecision') ?? record.getState('currency_precision')
                ),
            }
          : null,
        {
          name: 'validQuotationPrice',
          editor: (record) => {
            return (
              <C7nPrecisionInputNumber
                name="validQuotationPrice"
                record={record}
                currency="currencyCode"
                headerRecord={supplierReplyDs?.records?.find(
                  (item) => item?.get('quotationHeaderId') === record?.get('quotationHeaderId')
                )}
                onChange={() => handleChangeQuotationPrice(record)}
              />
            );
          },
          renderer: ({ value, record }) =>
            numberSeparatorRender(
              value,
              record.get('defaultPrecision') ?? record.getState('currency_precision')
            ),
        },
        {
          name: 'validNetPrice',
          editor: (record) => {
            return (
              <C7nPrecisionInputNumber
                name="validNetPrice"
                record={record}
                currency="currencyCode"
                headerRecord={supplierReplyDs?.records?.find(
                  (item) => item?.get('quotationHeaderId') === record?.get('quotationHeaderId')
                )}
                onChange={() => handleChangeNetPrice(record)}
              />
            );
          },
          renderer: ({ value, record }) =>
            numberSeparatorRender(
              value,
              record.get('defaultPrecision') ?? record.getState('currency_precision')
            ),
        },
        {
          name: 'taxIncludedFlag',
          editor: (record) => {
            return (
              <CheckBox
                name="taxIncludedFlag"
                record={record}
                onChange={(e) => changeTaxInclude(e, record)}
              />
            );
          },
        },
        {
          name: 'taxId',
          align: 'right',
          editor: (record) => {
            return (
              <Lov
                name="taxId"
                record={record}
                onChange={(data) => handleChangeTax(data, record)}
              />
            );
          },
        },
        doubleUnitFlag
          ? {
              name: 'validQuotationSecQuantity',
              editor: (record) => {
                return (
                  <C7nPrecisionInputNumber
                    name="validQuotationSecQuantity"
                    record={record}
                    uom="secondaryUomId"
                    onBlur={(val) =>
                      changeQty({ e: val, record, line: {}, type: 'validQuotationQuantity' })
                    }
                  />
                );
              },
              renderer: ({ value, record }) =>
                numberSeparatorRender(value, record.getState('uom_precision')),
            }
          : null,
        {
          name: 'validQuotationQuantity',
          editor: (record) => {
            return (
              <C7nPrecisionInputNumber
                name="validQuotationQuantity"
                record={record}
                uom="uomId"
                onChange={() => changeQuantity(record)}
              />
            );
          },
          renderer: ({ value, record }) =>
            doubleUnitFlag && record.get('itemId')
              ? numberSeparatorRender(value)
              : numberSeparatorRender(value, record.getState('uom_precision')),
        },
        {
          name: 'ladderLevel',
          renderer: ({ record, dataSet }) => {
            const Props = {
              record,
              page: supplierReplyDs.currentPage,
              pageSize: supplierReplyDs.pageSize,
              doubleUnitFlag,
              sourceCategory,
              onSave: handleSave,
              onQuery: initFetchSupplier,
              current: basicFormDs?.current,
              disabled:
                record.get('abandonedFlag') ||
                dataSet.getState('offlineReplyStatus') === 'NOT_REPLIED',
            };
            return (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <LadderPrice {...Props} />
                {record.get('ladderInquiryRequireFlag') &&
                dataSet.getState('offlineReplyStatus') !== 'NOT_REPLIED' &&
                !record.get('abandonedFlag') ? (
                  <Badge status="error" style={{ marginLeft: '2px' }} />
                ) : null}
              </div>
            );
          },
        },
        {
          name: 'totalAmount',
          renderer: ({ value }) => numberSeparatorRender(value),
          align: 'right',
        },
        {
          name: 'netAmount',
          renderer: ({ value }) => numberSeparatorRender(value),
          align: 'right',
        },
        doubleUnitFlag
          ? {
              name: 'secondaryUomName',
            }
          : null,
        {
          name: 'uomName',
        },
        {
          name: 'itemCategoryName',
        },
        doubleUnitFlag
          ? {
              name: 'secondaryQuantity',
            }
          : null,
        {
          name: 'demandQuantity',
        },
        {
          name: 'priceBatchQuantity',
          editor: true,
        },
        {
          name: 'demandDate',
        },
        {
          name: 'attachmentUuid',
          editor: true,
        },
      ].filter(Boolean);
    }, [
      basicFormDs?.current,
      doubleUnitFlag,
      supplierReplyDs,
      sourceCategory,
      initFetchSupplier,
      handleSave,
      caclRule,
    ]);

    const supplierInfoColumns = useMemo(() => {
      const restProps = getSupplierLovProps();
      const children = [
        {
          name: 'supplierLov',
          width: basicFormDs?.current?.get('lineItemsFlag') ? 260 : null,
          editor: (
            <SupplierLov {...restProps} dataSet={supplierInfoDs}>
              {intl
                .get('ssrc.inquiryHall.model.inquiryHall.button.bulkAddSupplier')
                .d('批量添加供应商')}
            </SupplierLov>
          ),
        },
        {
          name: 'contactName',
          editor: true,
          width: basicFormDs?.current?.get('lineItemsFlag') ? 260 : null,
        },
        {
          name: 'contactMail',
          editor: true,
          width: basicFormDs?.current?.get('lineItemsFlag') ? 260 : 150,
        },
        {
          name: 'supplierCompanyName',
          editor: true,
          width: basicFormDs?.current?.get('lineItemsFlag') ? 260 : 150,
        },
        {
          name: 'contactPhone',
          width: 260,
          editor: (record) => {
            const region = (
              <Select
                clearButton={false}
                record={record}
                name="internationalTelCode"
                style={{ height: '20px' }}
              />
            );
            return (
              <TextField
                addonBefore={region}
                addonBeforeStyle={{
                  border: 'none',
                  padding: 0,
                  width: '100px',
                }}
                style={{ border: 'none', padding: 0 }}
              />
            );
          },
          renderer: ({ record, text }) =>
            [
              record.getField('internationalTelCode')?.getText(record.get('internationalTelCode')),
              text,
            ]
              .filter(Boolean)
              .join(' | '),
        },
      ];
      return basicFormDs?.current?.get('lineItemsFlag')
        ? [
            {
              name: 'supplierInfoGroup1',
              aggregation: true,
              header: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierInfo`).d('供应商信息'),
              aggregationLimit: 9,
              width: 260,
              children,
            },
          ]
        : children;
    }, [basicFormDs?.current]);

    // 回复状态下拉选择
    // const handleReplyStatusSelect = (value, record) => {
    //   rightTableDsMap.get(record.get('quotationHeaderId')).setState('offlineReplyStatus', value);
    // if (value === 'NOT_REPLIED') {
    //   rightTableDsMap.get(record.get('quotationHeaderId')).records.forEach((ele) => {
    //     ele.set({
    //       // abandonedFlag: 0,
    //       validQuotationPrice: null,
    //       validQuotationSecPrice: null,
    //       validNetSecondaryPrice: null,
    //       validNetPrice: null,
    //       // taxIncludedFlag: 0,
    //       // taxId: null,
    //       validQuotationSecQuantity: null,
    //       validQuotationQuantity: null,
    //       priceBatchQuantity: null,
    //       attachmentUuid: null,
    //     });
    //   });
    // } else {
    //   rightTableDsMap
    //     .get(record.get('quotationHeaderId'))
    //     .query(rightTableDsMap.get(record.get('quotationHeaderId')).currentPage);
    // }
    // };

    // change currency
    const changeCurrency = (data, record) => {
      const { defaultPrecision, financialPrecision } = data || {};
      const currentItemDS = rightTableDsMap.get(record.get('quotationHeaderId'));
      if (!currentItemDS?.length) {
        return;
      }

      currentItemDS.setState('changeCurrencyCacheCalcInfo', {
        defaultPrecision,
        financialPrecision,
        dynamicChangePriceByPriceType,
      });

      runInAction(() => {
        currentItemDS.forEach((line) => {
          if (!line) {
            return;
          }

          line.set({ defaultPrecision, financialPrecision });
          dynamicChangePriceByPriceType(line);
        });
      });
    };

    const supplierReplyColumns = useMemo(() => {
      const children = [
        // {
        //   name: 'offlineReplyStatus',
        //   width: 160,
        //   editor: (record) => (
        //     <Select
        //       name="offlineReplyStatus"
        //       record={record}
        //       onChange={(value) => handleReplyStatusSelect(value, record)}
        //     />
        //   ),
        // },
        {
          name: 'currencyLov',
          editor: (record) => {
            return (
              <Lov
                name="currencyLov"
                record={record}
                onChange={(value) => changeCurrency(value, record)}
              />
            );
          },
          width: 160,
        },
        sourceCategory === 'RFP'
          ? {
              name: 'techAttachmentUuid',
              editor: true,
              width: 160,
              tooltip: 'none',
            }
          : {
              name: 'rfiAttachmentUuid',
              editor: true,
              width: 160,
              tooltip: 'none',
            },
        sourceCategory === 'RFP'
          ? {
              name: 'businessAttachmentUuid',
              editor: true,
              width: 160,
              tooltip: 'none',
            }
          : null,
      ].filter(Boolean);
      return basicFormDs?.current?.get('lineItemsFlag')
        ? [
            {
              name: 'supplierReplyGroup1',
              aggregation: true,
              header: intl.get(`ssrc.rf.view.card.title.supliierReply`).d('供应商回复'),
              aggregationLimit: 9,
              width: 160,
              children,
            },
          ]
        : children.map((item) => {
            return {
              ...item,
              width: null,
            };
          });
    }, [supplierReplyTableRef, sourceCategory, basicFormDs?.current]);

    const getRef = (node, id) => {
      refObj.current[id] = node;
      if (!refList.current.includes(id)) {
        refList.current = [...refList.current, id];
      }
    };

    // 列回调事件
    const handleColumnResize = useCallback(
      (column, width, type = 'quotation') => {
        if (type === 'supplierInfo') {
          // eslint-disable-next-line no-unused-expressions
          supplierInfoTableRef.current?.setColumnWidth(
            width,
            basicFormDs?.current.get('lineItemsFlag') ? column.key : column.name
          );
        } else if (type === 'supplierReply') {
          // eslint-disable-next-line no-unused-expressions
          supplierReplyTableRef.current?.setColumnWidth(
            width,
            basicFormDs?.current.get('lineItemsFlag') ? column.key : column.name
          );
        } else if (type === 'quotation') {
          refList.current.forEach((item) => {
            if (refObj.current?.[item]) {
              // eslint-disable-next-line no-unused-expressions
              refObj.current?.[item].setColumnWidth(width, column.name);
            }
          });
        }
      },
      [
        supplierInfoTableRef.current,
        supplierReplyTableRef.current,
        refObj.current,
        refList.current,
        basicFormDs?.current,
      ]
    );

    const handlePagination = async (page, pageSize) => {
      const { pageSize: prePageSize } = pagination || {};
      setSize(pageSize);
      setLoading(true);
      const params = getParams();
      const res = await saveOfflineSupplierReply(params);
      if (getResponse(res)) {
        await initFetchSupplier(pageSize !== prePageSize ? 0 : page - 1, pageSize);
      }
      setLoading(false);
      handleTableScrollLeft(0);
    };

    const handleSave = async () => {
      setLoading(true);
      const params = getParams();
      const res = await saveOfflineSupplierReply(params);
      setLoading(false);
      return getResponse(res);
      // await saveOfflineSupplierReply(params);
    };

    // 渲染报价表格,为了提升勾选的性能
    const renderQuotationTable = useMemo(() => {
      return !isEmpty(dataSource) ? (
        dataSource.map((item, i) => {
          return (
            <div className={styles['offline-reply-right-content']} key={item.quotationHeaderId}>
              {customizeTable(
                {
                  code: `SSRC.INQUIRY_HALL_OFFLINE_REPLY_ENTRY.QUOTATION_LINE_${sourceCategory}`,
                  dataSet: rightTableDsMap.get(item.quotationHeaderId),
                  namespace: item.quotationHeaderId,
                },
                <Table
                  ref={(node) => getRef(node, item.quotationHeaderId)}
                  style={{ height: 199 }}
                  showHeader={i === 0}
                  dataSet={rightTableDsMap.get(item.quotationHeaderId)}
                  columns={columns}
                  customizable
                  customizedCode={`SSRC.INQUIRY_HALL_OFFLINE_REPLY_ENTRY.QUOTATION_LINE_${sourceCategory}`}
                  pagination={{
                    showSizeChanger: false,
                  }}
                  onScrollLeft={(scrollLeft) =>
                    handleTableScrollLeft(scrollLeft, item.quotationHeaderId)
                  }
                />
              )}
              {i === dataSource.length - 1 && (
                <div style={{ border: '0.1px solid #e5e7ec', marginTop: '1.2px' }} />
              )}
            </div>
          );
        })
      ) : (
        <>
          {customizeTable(
            {
              code: `SSRC.INQUIRY_HALL_OFFLINE_REPLY_ENTRY.QUOTATION_LINE_${sourceCategory}`,
              dataSet: emptyQuotationDs,
            },
            <Table
              dataSet={emptyQuotationDs}
              columns={columns}
              customizable
              customizedCode={`SSRC.INQUIRY_HALL_OFFLINE_REPLY_ENTRY.QUOTATION_LINE_${sourceCategory}`}
              pagination={false}
            />
          )}
        </>
      );
    }, [
      dataSource,
      rightTableDsMap,
      handleTableScrollLeft,
      getRef,
      sourceCategory,
      refList?.current,
      refObj?.current,
      columns,
    ]);

    // 渲染固定表头表格,为了提升勾选的性能
    const renderCopyTable = useMemo(() => {
      return (
        <div className={styles['offline-reply-again']}>
          <div className={styles['offline-reply-again-left']}>
            {customizeTable(
              {
                code: `SSRC.INQUIRY_HALL_OFFLINE_REPLY_ENTRY.SUPPLIER_LIST_${sourceCategory}`,
                dataSet: supplierInfoDs,
              },
              <Table
                aggregation={!!basicFormDs?.current?.get('lineItemsFlag')}
                onColumnResize={({ column, width }) =>
                  handleColumnResize(column, width, 'supplierInfo')
                }
                customizable
                columnResizable={!basicFormDs?.current?.get('lineItemsFlag')}
                customizedCode={`SSRC.INQUIRY_HALL_OFFLINE_REPLY_ENTRY.SUPPLIER_LIST_${sourceCategory}`}
                pagination={false}
                dataSet={supplierInfoDs}
                columns={supplierInfoColumns}
                onCustomizedChange={(customize) => {
                  if (supplierInfoTableRef.current && supplierInfoTableRef.current.tableStore) {
                    supplierInfoTableRef.current.tableStore.customized = customize;
                    supplierInfoTableRef.current.tableStore.initColumns();
                  }
                }}
              />
            )}
            {customizeTable(
              {
                code: `SSRC.INQUIRY_HALL_OFFLINE_REPLY_ENTRY.QUOTATION_HEADER_${sourceCategory}`,
                dataSet: supplierReplyDs,
              },
              <Table
                aggregation={!!basicFormDs?.current?.get('lineItemsFlag')}
                onColumnResize={({ column, width }) =>
                  handleColumnResize(column, width, 'supplierReply')
                }
                customizable
                columnResizable={!basicFormDs?.current?.get('lineItemsFlag')}
                customizedCode={`SSRC.INQUIRY_HALL_OFFLINE_REPLY_ENTRY.QUOTATION_HEADER_${sourceCategory}`}
                pagination={false}
                dataSet={supplierReplyDs}
                columns={supplierReplyColumns}
                onCustomizedChange={(customize) => {
                  if (supplierReplyTableRef.current && supplierReplyTableRef.current.tableStore) {
                    supplierReplyTableRef.current.tableStore.customized = customize;
                    supplierReplyTableRef.current.tableStore.initColumns();
                  }
                }}
              />
            )}
          </div>
          <div className={styles['offline-reply-again-right']}>
            {basicFormDs?.current?.get('lineItemsFlag') && !isEmpty(dataSource)
              ? customizeTable(
                  {
                    code: `SSRC.INQUIRY_HALL_OFFLINE_REPLY_ENTRY.QUOTATION_LINE_${sourceCategory}`,
                    dataSet: emptyQuotationDs,
                  },
                <Table
                  ref={quotationRef}
                  dataSet={emptyQuotationDs}
                  columns={columns}
                  showSelectionCachedButton
                  pagination={false}
                  onColumnResize={({ column, width }) =>
                      handleColumnResize(column, width, 'quotation')
                    }
                  customizable
                  customizedCode={`SSRC.INQUIRY_HALL_OFFLINE_REPLY_ENTRY.QUOTATION_LINE_${sourceCategory}`}
                  onCustomizedChange={(customize) => {
                      if (refObj.current) {
                        dataSource.forEach((item) => {
                          refObj.current[item.quotationHeaderId].tableStore.customized = customize;
                          refObj.current[item.quotationHeaderId].tableStore.initColumns();
                        });
                      }
                    }}
                />
                )
              : null}
          </div>
        </div>
      );
    }, [
      refObj,
      supplierInfoDs,
      supplierReplyDs,
      handleColumnResize,
      dataSource,
      emptyQuotationDs,
      basicFormDs?.current,
      caclRule,
    ]);

    const handleScrollTop = useCallback(
      (scrollTop, type) => {
        if (!basicFormDs?.current?.get('lineItemsFlag')) {
          if (type === 'supplierInfo') {
            // eslint-disable-next-line no-unused-expressions
            supplierReplyTableRef.current?.setScrollTop(scrollTop);
          } else if (type === 'supplierReply') {
            // eslint-disable-next-line no-unused-expressions
            supplierInfoTableRef.current?.setScrollTop(scrollTop);
          }
        }
      },
      [basicFormDs?.current]
    );

    return (
      <React.Fragment>
        <RenderButtons initFetchSupplier={initFetchSupplier} size={size} />
        <div className={styles['offline-reply-wrap']}>
          {!isEmpty(dataSource) && basicFormDs?.current?.get('lineItemsFlag')
            ? renderCopyTable
            : null}
          <div
            className={
              !isEmpty(dataSource) && basicFormDs?.current?.get('lineItemsFlag')
                ? styles['offline-reply-table-card']
                : styles['offline-reply-table-card-empty']
            }
          >
            <div className={styles['offline-reply-table-card-left']}>
              {customizeTable(
                {
                  code: `SSRC.INQUIRY_HALL_OFFLINE_REPLY_ENTRY.SUPPLIER_LIST_${sourceCategory}`,
                  dataSet: supplierInfoDs,
                },
                <Table
                  aggregation={!!basicFormDs?.current?.get('lineItemsFlag')}
                  onRow={() => ({
                    style: {
                      height: 249,
                    },
                  })}
                  style={{
                    maxHeight: !basicFormDs?.current?.get('lineItemsFlag')
                      ? 'calc(100vh - 260px)'
                      : null,
                    width: !basicFormDs?.current?.get('lineItemsFlag') ? '65%' : null,
                  }}
                  columnResizable={!basicFormDs?.current?.get('lineItemsFlag')}
                  customizable
                  customizedCode={`SSRC.INQUIRY_HALL_OFFLINE_REPLY_ENTRY.SUPPLIER_LIST_${sourceCategory}`}
                  ref={supplierInfoTableRef}
                  pagination={false}
                  dataSet={supplierInfoDs}
                  columns={supplierInfoColumns}
                  onScrollTop={(scrollTop) => handleScrollTop(scrollTop, 'supplierInfo')}
                />
              )}
              {customizeTable(
                {
                  code: `SSRC.INQUIRY_HALL_OFFLINE_REPLY_ENTRY.QUOTATION_HEADER_${sourceCategory}`,
                  dataSet: supplierReplyDs,
                },
                <Table
                  aggregation={!!basicFormDs?.current?.get('lineItemsFlag')}
                  onRow={() => ({
                    style: {
                      height: 249,
                    },
                  })}
                  style={{
                    maxHeight: !basicFormDs?.current?.get('lineItemsFlag')
                      ? 'calc(100vh - 260px)'
                      : null,
                    width: !basicFormDs?.current?.get('lineItemsFlag') ? '35%' : null,
                  }}
                  className={styles['offline-reply-table-card-second-table']}
                  columnResizable={!basicFormDs?.current?.get('lineItemsFlag')}
                  customizable
                  customizedCode={`SSRC.INQUIRY_HALL_OFFLINE_REPLY_ENTRY.QUOTATION_HEADER_${sourceCategory}`}
                  ref={supplierReplyTableRef}
                  pagination={false}
                  dataSet={supplierReplyDs}
                  columns={supplierReplyColumns}
                  onScrollTop={(scrollTop) => handleScrollTop(scrollTop, 'supplierReply')}
                />
              )}
            </div>
            <div className={styles['offline-reply-table-card-right']}>
              {basicFormDs?.current?.get('lineItemsFlag') ? renderQuotationTable : null}
            </div>
          </div>
        </div>
        <Pagination
          className={styles['offline-reply-pagination']}
          {...pagination}
          pageSizeOptions={['2', '10', '20', '50']}
          onChange={handlePagination}
        />
      </React.Fragment>
    );
  }
);

export default SupplierReply;
