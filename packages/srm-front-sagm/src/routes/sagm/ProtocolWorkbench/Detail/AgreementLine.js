import React, { useMemo, useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import qs from 'qs';
import { Lov, DatePicker, DataSet, Button, Table } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import moment from 'moment';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { isEmpty, isNumber, isBoolean, flowRight } from 'lodash';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import ImportButton from 'components/Import';
import SearchBarTable from '_components/SearchBarTable';
import {
  unitPriceChange,
  taxPriceChange,
  taxChange,
  currencyChange,
  getTaxPrice,
  getUnitPrice,
} from '@/routes/small/MallProtocolManagement/HandWork/fieldChange';
import { fetchGroupCatalog, createProduct } from '@/services/mallProtocolManagementService';
import { precisionEditor, precisionRender, numberChange } from '@/utils/precision';
import { openUnitTree, openRegionTree } from '@/utils/tree';
import { checkPermission } from 'services/api';
import c7nModal from '@/utils/c7nModal';
import { getCustDimColumns, withCustomDimension } from '@/utils/customDimension';

import BatchLine from '@/routes/small/MallProtocolManagement/HandWork/BatchLine';
import getBatchDs from '@/routes/small/MallProtocolManagement/HandWork/BatchLine/batchDs';
import { openCatalog } from '@/routes/pageTree';
import PriceLib from '@/routes/sagm/PriceLib';
import { Button as PermissionButton } from 'components/Permission';
import {
  openTransferModal,
  effectiveFlagRender,
  buyOrganizationRender,
  regionRender,
} from '../renderUtils';
import { openLadderPrice } from '../drawer/priceDrawer';
import { PERMISSION_PROTOCOL_WORKBENCH_SKU_NUMBER } from '../../const/permissionCode';
import { workBenchFormUnitCode } from '../../const/uniCode';
import { openProductModal, viewHistoryProduct } from './agmLineFuncs';

const searchBarCode = 'SAGM.WORKBENCH.AGREEMENT_LINE';

const ObserverBtn = observer(({ icon, ds, text, filter, permission, ...others }) => {
  let disabled = ds.selected.length === 0;
  if (filter) {
    const noEffect = ds.selected.filter((i) => i.get('effectiveFlag') !== -1).length === 0;
    const hasNew = ds.selected.some((i) => !i.get('agreementLineId'));
    disabled = noEffect || hasNew;
  }
  const ButtonRef = permission ? PermissionButton : Button;
  return (
    <ButtonRef funcType="flat" type="c7n-pro" icon={icon} disabled={disabled} {...others}>
      {text}
    </ButtonRef>
  );
});

const AgreementLine = observer((props) => {
  const {
    customizeTable,
    readOnly,
    dataSet,
    authorityDataSet,
    sourceFrom,
    priceRule,
    agreementId,
    supplierTenantId,
    isHistory,
    agreementStatus,
    priceLibParams,
    path,
    workFlowBackPath,
    custDimensions,
  } = props;
  const organizationId = useMemo(() => getCurrentOrganizationId(), []);
  const isPriceLib = sourceFrom === 'PRICE';
  const customizedCode =
    sourceFrom === 'PRICE' ? workBenchFormUnitCode.lib_line : workBenchFormUnitCode.manual_line;
  // const isTerminate = agreementStatus === 'TERMINATED';
  const [skuApprove, setSkuApprove] = useState(true);

  useEffect(() => {
    hasSkuPermission();
    return () => {
      dataSet.removeEventListener('load');
    };
  }, []);

  useEffect(() => {
    if (readOnly) {
      dataSet.selection = false;
    } else {
      dataSet.selection = 'multiple';
      dataSet.addEventListener('load', () => {
        dataSet.validate(); // 触发页面初次加载区域失效校验
      });
    }
  });

  const hasSkuPermission = async () => {
    const res = await checkPermission([PERMISSION_PROTOCOL_WORKBENCH_SKU_NUMBER]);
    const isApprove = ((res || [])[0] || {}).approve;
    setSkuApprove(isApprove);
  };

  function query() {
    dataSet.setQueryParameter('agreementId', agreementId);
    dataSet.query(dataSet.currentPage);
  }

  /**
   * 新建协议
   */
  function handleCreate() {
    // 来源于价格库， 打开弹窗
    if (isPriceLib) {
      const modal = PriceLib.create({
        filterDs: dataSet,
        filterData: priceLibParams,
        afterSuccess: (data) => {
          handleFromPrice(data);
          modal.close();
        },
      });
    } else {
      dataSet.create(
        { tenantId: organizationId, supplierTenantId, allRegionFlag: 1, allUnitFlag: 1 },
        0
      );
    }
  }

  function handleFromPrice(data) {
    const ds = dataSet;
    if (ds && data.length > 0) {
      data.forEach((item) => {
        ds.create(item, 0);
      });
    }
  }

  // 数字布尔值为有值
  function isNoValue(value) {
    if (isNumber(value) || isBoolean(value)) {
      return false;
    }
    return isEmpty(value);
  }

  const precisionIsChange = ({ data, record, precisionName }) => {
    const { [precisionName]: nextPrecision } = data;
    const prevPrecision = record.get(precisionName);
    // 需要进行精度控制的情况，有原精度，精度未发生更新
    if (isNoValue(nextPrecision) && !isNoValue(prevPrecision)) {
      return prevPrecision;
    }
    return nextPrecision;
  };

  const isDateRange = ({ record, name, value }) => {
    const min = record.get('priceValidDateFrom');
    const max = record.get('priceValidDateTo');
    const isUpdateDate = record.get('manualEffectiveFlag') !== 0;
    if (min && moment(min) > moment(value)) {
      return false;
    }
    if (max && moment(max) < moment(value)) {
      return false;
    }
    if (isUpdateDate) record.set(name, value);
  };

  // 精度控制
  const precisionChangeField = (
    { record, name, value, data, precisionName },
    callback = (e) => e
  ) => {
    const precision = precisionIsChange({ data, record, precisionName });
    if (isNoValue(precision)) {
      record.set(name, value);
      return false;
    }
    const resValue = numberChange({ name, value, record, precision });
    callback({ value: resValue, record, precision });
  };

  const batchRules = {
    // 阶梯价格
    agreementLadders: ({ data, name, value, record }) => {
      const pricePrecision = precisionIsChange({
        data,
        record,
        precisionName: 'defaultPrecision',
      });
      const quantityPrecision = precisionIsChange({
        data,
        record,
        precisionName: 'uomPrecision',
      });
      if (isNoValue(pricePrecision) && isNoValue(quantityPrecision)) {
        record.set(name, value);
        return false;
      }

      const priceEditable = priceRule === 'TAX_INCLUDED_PRICE';
      const changeField = priceEditable ? 'taxPrice' : 'unitPrice';

      const newValue = value.map((m) => {
        const { unitPrice, taxPrice, ladderFrom, ladderTo } = m;
        const pricePrecisionChange = isNoValue(pricePrecision);
        const prices = {};
        if (!pricePrecisionChange) {
          if (changeField === 'unitPrice') {
            prices.taxPrice = getTaxPrice({
              tax: data.tax,
              precision: pricePrecision,
              unitPrice,
            });
          } else {
            prices.unitPrice = getUnitPrice({
              tax: data.tax,
              precision: pricePrecision,
              taxPrice,
            });
          }
        }

        const newLadderFrom = isNoValue(quantityPrecision)
          ? ladderFrom
          : numberChange({ value: ladderFrom, precision: quantityPrecision });
        const newLadderTo = isNoValue(quantityPrecision)
          ? ladderTo
          : numberChange({ value: ladderTo, precision: quantityPrecision });
        return {
          ...m,
          ...prices,
          ladderFrom: newLadderFrom,
          ladderTo: newLadderTo,
        };
      });
      record.set(name, newValue);
    },
    // 未税单价
    unitPrice: ({ data, name, value, record }) => {
      // 有旧税率，无新税率，需要重新计算

      const priceEditable = priceRule === 'TAX_INCLUDED_PRICE';
      const changeField = priceEditable ? 'taxPrice' : 'unitPrice';

      const { tax: nextTax, taxPrice } = data;
      const prevTax = record.get('tax');
      const taxIsChange = !isNoValue(nextTax) && !isNoValue(prevTax);
      const precision = precisionIsChange({ data, record, precisionName: 'defaultPrecision' }); // 需要重新计算

      const tax = taxIsChange ? nextTax : prevTax;

      // 不需要重新计算
      if (!taxIsChange && isNoValue(precision)) {
        record.set(name, value);
        record.set('taxPrice', taxPrice);
        return false;
      }
      // 重新计算
      record.set(changeField, data[changeField]);
      if (changeField === 'unitPrice') {
        unitPriceChange(value, record, precision, tax);
      } else {
        taxPriceChange(taxPrice, record, precision, tax);
      }
    },
    taxPrice: true,

    // 有效期从
    validDateFrom: isDateRange,
    // 有效期至
    validDateTo: isDateRange,

    allUnitFlag: true,
    allRegionFlag: true,
    // 送货区域
    deliverRegionLov: ({ record, name, value, data }) => {
      if (record.get('effectiveFlag') !== -1) {
        record.set(name, value);
        record.set('allRegionFlag', data.allRegionFlag);
      }
    },
    // 采买组织
    buyOrganizationLov: ({ record, name, value, data }) => {
      const editFlag = record.get('companyAssignEditFlag');
      const effectiveFlag = record.get('effectiveFlag');
      const _readOnly = effectiveFlag === -1 || (isPriceLib && editFlag !== -1);
      if (!_readOnly) {
        record.set(name, value);
        record.set('allUnitFlag', data.allUnitFlag);
      }
    },
    // agreementQuantity
    agreementQuantity: (params) =>
      precisionChangeField({ ...params, precisionName: 'uomPrecision' }),
    // orderQuantity
    orderQuantity: (params) => precisionChangeField({ ...params, precisionName: 'uomPrecision' }),
    // minPackageQuantity
    minPackageQuantity: (params) =>
      precisionChangeField({ ...params, precisionName: 'uomPrecision' }),
    // purchaseQuantityLimit
    purchaseQuantityLimit: (params) =>
      precisionChangeField({ ...params, precisionName: 'uomPrecision' }),
    // purchaseAmountLimit
    purchaseAmountLimit: (params) =>
      precisionChangeField({ ...params, precisionName: 'financialPrecision' }),

    // isFree: ({ value, name, record }) => {
    //   if (value) {
    //     record.set(name, value);
    //     record.set('postageLov', null);
    //     record.set('postageId', null);
    //     record.set('postageName', null);
    //   }
    // },

    // postageId: ({ value, name, data, record }) => {
    //   const { isFree, postageName } = data;
    //   if (!isFree) {
    //     record.set(name, value);
    //     record.set('isFree', false);
    //     record.set('postageName', postageName);
    //     record.set('postageLov', { postageId: value, postageName });
    //   }
    // },
    // postageLov: true,
    // postageName: true,
  };

  // 物料带出目录，带出分类
  function handleItemChange(item, record) {
    record.set('itemLov', {
      id: item.id,
      itemId: item.itemId,
      itemCode: item.itemCode,
    });
    let cId = record.get('itemCategoryId');
    record.set('itemName', item.itemName);
    if (item.itemId) {
      cId = item.categoryId;
      if (item.categoryId) {
        record.set('itemCategoryLov', {
          categoryId: cId,
          categoryCode: item.categoryCode,
          categoryName: item.categoryName,
        });
      } else {
        record.set('itemCategoryLov', null);
      }
    } else record.set('itemCategoryLov', null);
    if (item.primaryUomId && item.uomName && item.uomCode) {
      record.set('uomLov', {
        uomId: item.uomId,
        uomCode: item.uomCode,
        uomName: item.uomName,
        uomPrecision: item.uomPrecision,
        uomCodeAndName: item.uomCodeAndName,
      });
    }
    if (item.itemId || cId) {
      fetchGroupCatalog([{ itemId: item.itemId, itemCategoryId: cId }]).then((res) => {
        const { catalogs = [] } = (res || [])[0] || {};
        const catalog = (catalogs || [])[0];
        if (catalog) {
          record.set('catalogLov', {
            catalogId: catalog.catalogId,
            catalogName: catalog.catalogName,
          });
        }
      });
    } else {
      record.set('catalogLov', null);
    }
  }

  /**
   * 物料分类带出目录
   */
  const handleCateChange = async (itemCategoryId, record) => {
    const itemId = record.get('itemId');
    if (itemId || itemCategoryId) {
      const res = getResponse(await fetchGroupCatalog([{ itemCategoryId, itemId }]));
      const { catalogs = [] } = (res || [])[0] || {};
      const catalog = (catalogs || [])[0];
      if (catalog) {
        record.set('catalogLov', {
          catalogId: catalog.catalogId,
          catalogName: catalog.catalogName,
        });
      }
    } else {
      record.set('catalogLov', null);
    }
  };

  /**
   * 批量删除
   */
  const handleDelLine = (selectData) => {
    const savedRecords = selectData.filter((f) => f.get('agreementLineId'));
    dataSet.remove(selectData.filter((f) => !f.get('agreementLineId')));
    if (savedRecords.length > 0) {
      dataSet
        .delete(savedRecords, {
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: intl.get('sagm.common.modal.confirm.content').d('是否确定删除?'),
        })
        .then(() => {
          dataSet.query(dataSet.currentPage, undefined, true);
        });
    }
    // 待后端
    // if(savedRecords.length > 0) {
    //   confirm({
    //     content: intl.get('sagm.common.modal.confirm.content').d('是否确定删除?'),
    //     onOk: () => {
    //       savedRecords.forEach(r => Object.assign(r, {status: 'add'}));
    //       dataSet.remove(savedRecords);
    //       console.log(1, dataSet.toData());
    //     },
    //   });
    // }
  };

  // 基于物料批量创建商品
  async function handleProductOK(params = {}) {
    const list = dataSet.selected
      .filter((i) => i.get('effectiveFlag') !== -1)
      .map((e) => e.toData());
    const { categoryId, content } = params;
    const res = getResponse(
      await createProduct({
        cid: categoryId,
        agreementSkuDTO: {
          agreementLineList: list,
          details: content,
        },
      })
    );
    if (res) {
      notification.success();
      dataSet.unSelectAll();
      dataSet.query(dataSet.currentPage);
    }
  }

  /**
   * 通用导入
   */
  function handleImport() {
    const {
      history: { push = (e) => e },
    } = props;
    push({
      pathname: `/sagm/sagm-protocol-workbench/data-import/SMAL.AGREEMENT_LINE`,
      search: qs.stringify({
        action: intl.get('small.common.button.batchImport').d('批量导入'),
        backPath: `/sagm/sagm-protocol-workbench/detail/edit?agreementId=${agreementId}`,
        args: JSON.stringify({
          agreementId,
          templateCode: 'SMAL.AGREEMENT_LINE',
          tenantId: organizationId,
        }),
      }),
    });
  }

  // 批量编辑保存，更新协议行
  async function handleBatchOk(batchDs) {
    const flag = await batchDs.validate();
    const tableUpdateRecords = dataSet.selected;
    if (flag) {
      const {
        // postageLov,
        allRegionFlag,
        allUnitFlag,
        deliverRegionLov,
        buyOrganizationLov,
        ...others
      } = batchDs.current.toData();
      const allRegion = {
        regionId: 'ALL',
        regionCode: 'ALL',
        regionName: intl.get('small.common.model.allAreas').d('所有区域'),
      };
      const allUnit = {
        unitId: 'ALL',
        // unitCode: 'ALL',
        unitName: intl.get('small.common.model.allOrganizations').d('所有组织'),
        unitCodeName: intl.get('small.common.model.allOrganizations').d('所有组织'),
      };
      const batchLine = {
        ...others,
        allUnitFlag,
        allRegionFlag,
        deliverRegionLov: allRegionFlag ? [allRegion] : deliverRegionLov,
        buyOrganizationLov: allUnitFlag ? [allUnit] : buyOrganizationLov,
      };
      const { priceType, agreementLadders } = batchLine;
      if (priceType === 'LADDER_PRICE' && isNoValue(agreementLadders)) {
        notification.warning({
          message: intl.get('hzero.common.validation.notNull', {
            name: intl.get('small.common.model.ladderPrice').d('阶梯价格'),
          }),
        });
        return false;
      }
      runInAction(() => {
        tableUpdateRecords.forEach((record) => {
          Object.keys(batchLine).forEach((field) => {
            const fieldRuleSet = batchRules[field];
            const fieldValue = batchLine[field];
            if (fieldRuleSet && typeof fieldRuleSet === 'function' && !isNoValue(fieldValue)) {
              fieldRuleSet({ data: batchLine, record, value: fieldValue, name: field });
            }
            if (!fieldRuleSet && !isNoValue(fieldValue)) {
              record.set(field, batchLine[field]);
            }
          });
        });
      });
      return true;
    } else {
      return false;
    }
  }

  /**
   * 批量编辑
   */
  function handleBatchLine() {
    const batchDs = new DataSet(getBatchDs(isPriceLib, supplierTenantId));
    const [record] = dataSet.selected;
    const priceEditable = priceRule === 'TAX_INCLUDED_PRICE';
    const changeField = priceEditable ? 'taxPrice' : 'unitPrice';
    c7nModal({
      title: intl.get('small.common.button.batchUpdate').d('批量维护'),
      style: { width: 380 },
      onOk: () => handleBatchOk(batchDs),
      children: (
        <BatchLine
          initInfo={record.toData()}
          dataSet={batchDs}
          isPriceLib={isPriceLib}
          onShowLadderPrice={() =>
            openLadderPrice({
              readFields: [changeField],
              data: batchDs.current.get('agreementLadders'),
              tax: batchDs.current.get('tax'),
              uomPrecision: record.get('uomPrecision'),
              defaultPrecision: record.get('defaultPrecision'),
              onSave: (data) => onSave(batchDs.current, data),
            })
          }
          priceRule={priceRule}
        />
      ),
    });
  }

  function onSave(record, data) {
    record.set('agreementLadders', data);
    record.set('ladderFlag', data.length === 0 ? 0 : 1);
    const firstLadder = (data || [])[0];
    if (record.get('priceType') === 'LADDER_PRICE' && firstLadder) {
      record.set('unitPrice', firstLadder.unitPrice);
      record.set('taxPrice', firstLadder.taxPrice);
    }
  }

  const columns = useMemo(() => {
    const priceEditable = priceRule === 'TAX_INCLUDED_PRICE';
    const changeField = priceEditable ? 'taxPrice' : 'unitPrice';
    const isPriceLibRead = readOnly || isPriceLib;
    const custDimColumns = getCustDimColumns(dataSet, custDimensions, {
      readOnly,
      sort: 26,
    });
    const _columns = [
      {
        name: 'effectiveFlag',
        width: 100,
        renderer: ({ record }) =>
          !record.get('agreementId')
            ? '-'
            : effectiveFlagRender({ record, text: record.get('effectiveFlagMeaning') }),
      },
      {
        name: 'lineNum',
        width: 100,
      },
      {
        name: 'itemLov',
        width: 150,
        editor: (record) => {
          if (isPriceLibRead) return false;
          return (
            <Lov
              clearButton={false}
              onChange={(lovRecord) => {
                const item = lovRecord || {};
                handleItemChange(item, record);
              }}
            />
          );
        },
      },
      {
        title: intl.get('small.common.model.item.name').d('物料名称'),
        name: 'itemName',
        width: 150,
        editor: !isPriceLibRead,
      },
      {
        name: 'itemCategoryLov',
        width: 150,
        editor: (record) => {
          if (isPriceLibRead) return false;
          return (
            <Lov
              clearButton={false}
              tableProps={{ selectionMode: 'rowbox' }}
              onChange={(lovRecord) => {
                const item = lovRecord || {};
                handleCateChange(item.categoryId, record);
              }}
            />
          );
        },
      },
      {
        name: 'catalogLov',
        width: 150,
        editor: (record) => {
          if (readOnly) return false;
          return <Lov onClick={() => openCatalog({ record, name: 'catalogLov' })} />;
        },
      },
      // {
      //   name: 'validDate',
      //   width: 220,
      //   editor: (record) => {
      //     if (readOnly || (isPriceLib && record.get('manualEffectiveFlag') === 0)) return false;
      //     return (
      //       <DatePicker
      //         clearButton={false}
      //         placeholder={[
      //           intl.get('small.common.model.dateFrom').d('有效期从'),
      //           intl.get('small.common.model.dateTo').d('有效期至'),
      //         ]}
      //         // 1.6.3 支持
      //         filter={(currentDate, selected, mode, rangeTarget, rangeValue) => {
      //           if (!currentDate) return true;
      //           const [startValue, endValue] = Array.isArray(rangeValue) ? rangeValue : [];
      //           const { priceValidDateFrom, priceValidDateTo } = record.get([
      //             'priceValidDateFrom',
      //             'priceValidDateTo',
      //           ]);
      //           const _endValue = endValue || priceValidDateTo || undefined;
      //           const _startValue = startValue || priceValidDateFrom;
      //           console.log(999, currentDate, rangeTarget, endValue, priceValidDateTo)
      //           // 光标停留在start
      //           // 最小值：价格库 有效期从 >= 价格库有效期从
      //           // 最大值：手工新建有效期从 <= 有效期至， 价格库 有效期从 <= 有效期至 || 价格库有效期至
      //           if (rangeTarget === 0 && _endValue) {
      //             console.log(1, endValue, priceValidDateTo)
      //             return (
      //               (currentDate.isBefore(_endValue) || currentDate.isSame(_endValue)) &&
      //               (currentDate.isAfter(priceValidDateFrom) ||
      //                 currentDate.isSame(priceValidDateFrom))
      //             );
      //           }
      //           // 关闭停留在在end,
      //           // 最小值：手工新建有效期至 >= 有效期从， 价格库 有效期至 >= 有效期从 || 价格库有效期从
      //           // 最大值：价格库 有效期至 <= 价格库有效期至
      //           else if (rangeTarget === 1 && _startValue) {
      //             console.log(2)
      //             return (
      //               (currentDate.isAfter(_startValue) || currentDate.isSame(_startValue)) &&
      //               (currentDate.isBefore(priceValidDateTo) || currentDate.isSame(priceValidDateTo))
      //             );
      //           }
      //           return true;
      //         }}
      //       />
      //     );
      //   },
      // },
      {
        width: 160,
        name: 'validDateFrom',
        editor: (record) => {
          if (readOnly || (isPriceLib && record.get('manualEffectiveFlag') === 0)) return false;
          return (
            <DatePicker
              clearButton={false}
              // min={record.get('priceValidDateFrom') || moment()}
              max={record.get('validDateTo') || record.get('priceValidDateTo') || undefined}
            />
          );
        },
      },
      {
        width: 160,
        name: 'validDateTo',
        editor: (record) => {
          if (readOnly || (isPriceLib && record.get('manualEffectiveFlag') === 0)) return false;
          return (
            <DatePicker
              clearButton={false}
              // min={record.get('validDateFrom') || record.get('priceValidDateFrom') || moment()}
              max={record.get('priceValidDateTo') || undefined}
            />
          );
        },
      },
      {
        name: 'uomLov',
        width: 140,
        editor: !isPriceLibRead && <Lov clearButton={false} />,
      },
      {
        name: 'taxLov',
        width: 140,
        align: 'right',
        editor: (record, name) => {
          if (isPriceLibRead) return false;
          return (
            <Lov
              clearButton={false}
              // restrict="0-9."
              searchable={false}
              onChange={(lovRecord) => {
                const item = lovRecord || {};
                record.set(name, {
                  taxId: item.taxId,
                  taxRate: item.taxRate,
                });
                taxChange(record, item, changeField);
              }}
            />
          );
        },
      },
      {
        name: 'currencyLov',
        width: 140,
        editor: (record) => {
          if (isPriceLibRead) return false;
          return (
            <Lov
              clearButton={false}
              onChange={(lovRecord) => currencyChange(record, lovRecord, changeField)}
            />
          );
        },
      },
      {
        name: 'priceType',
        width: 150,
        editor: !isPriceLibRead,
      },
      {
        name: 'unitPrice',
        width: 150,
        editor: (record) => {
          if (isPriceLibRead || priceEditable) return false;
          return precisionEditor({
            record,
            name: 'unitPrice',
            type: 'currency',
            precision: record.get('defaultPrecision'),
            onChange: (value) => {
              unitPriceChange(value, record, record.get('defaultPrecision'));
            },
          });
        },
        renderer: isPriceLibRead ? (para) => precisionRender(para) : undefined,
      },
      // 含税价格
      {
        name: 'taxPrice',
        width: 150,
        editor: (record) => {
          if (isPriceLibRead || !priceEditable) return false;
          return precisionEditor({
            record,
            name: 'taxPrice',
            type: 'currency',
            precision: record.get('defaultPrecision'),
            onChange: (value) => {
              taxPriceChange(value, record, record.get('defaultPrecision'));
            },
          });
        },
        renderer: isPriceLibRead ? (para) => precisionRender(para) : undefined,
      },
      {
        name: 'priceBatchQuantity',
        width: 120,
        editor: () => !isPriceLibRead,
      },
      {
        name: 'ladderFlag',
        width: 160,
        align: 'left',
        renderer: ({ record }) => {
          const { priceType, agreementLadders, agreementLadderHiss } = record.get([
            'priceType',
            'agreementLadders',
            'agreementLadderHiss',
          ]);
          return priceType === 'LADDER_PRICE' ? (
            <a
              onClick={() =>
                openLadderPrice({
                  readOnly: isPriceLibRead,
                  readFields: [changeField],
                  data: agreementLadders || agreementLadderHiss,
                  uomPrecision: record.get('uomPrecision'),
                  defaultPrecision: record.get('defaultPrecision'),
                  tax: record.get('tax'),
                  // 保存协议信息时，真正保存阶梯价
                  onSave: (data) => onSave(record, data),
                })
              }
              disabled={!record.get('currencyCode')}
            >
              {readOnly
                ? intl.get('hzero.common.button.look').d('查看')
                : intl.get('hzero.common.edit').d('编辑')}
            </a>
          ) : (
            '-'
          );
        },
      },
      {
        name: 'priceHiddenFlag',
        width: 160,
        editor: !readOnly,
        renderer: ({ record, value }) => {
          return (
            <div className="price-hidden-column">
              <span className="tag" style={{ backgroundColor: value ? '#3AB344' : '#F05434' }} />
              {record.get('priceHiddenFlagMeaning')}
            </div>
          );
        },
        help: intl
          .get('small.common.view.hiddenPriceHelp')
          .d('开启隐藏价格则主站商品价格显示为***'),
      },
      {
        name: 'postageLov',
        width: 150,
        editor: (record, name) => {
          if (readOnly) return false;
          return (
            <Lov
              clearButton={false}
              onChange={(lovRecord) => {
                const item = lovRecord || { postageId: -1 };
                record.set(name, {
                  postageId: item.postageId,
                  postageName: item.postageName,
                });
              }}
            />
          );
        },
      },
      {
        name: 'installLov',
        width: 150,
        editor: () => {
          if (readOnly) return false;
          return true;
        },
      },
      {
        name: 'agreementQuantity',
        width: 150,
        editor: (record) =>
          !readOnly &&
          precisionEditor({
            record,
            name: 'agreementQuantity',
            precision: record.get('uomPrecision'),
          }),
      },
      {
        name: 'orderQuantity',
        width: 150,
        editor: (record) =>
          !readOnly &&
          precisionEditor({
            record,
            name: 'orderQuantity',
            precision: record.get('uomPrecision'),
          }),
      },
      {
        name: 'minPackageQuantity',
        width: 150,
        editor: (record) =>
          !readOnly &&
          precisionEditor({
            record,
            name: 'minPackageQuantity',
            precision: record.get('uomPrecision'),
          }),
      },
      {
        name: 'purchaseQuantityLimit',
        width: 150,
        editor: (record) =>
          !readOnly &&
          precisionEditor({
            record,
            name: 'purchaseQuantityLimit',
            precision: record.get('uomPrecision'),
          }),
      },
      {
        name: 'purchaseAmountLimit',
        width: 150,
        editor: (record) =>
          !readOnly &&
          precisionEditor({
            record,
            type: 'currency',
            name: 'purchaseAmountLimit',
            precision: record.get('financialPrecision'),
          }),
      },
      {
        width: 220,
        name: 'deliverRegionLov',
        show: !readOnly,
        editor: (record) => {
          const field = record.getField('deliverRegionLov') || {};
          if (readOnly) return false;
          return (
            <Lov
              onClick={() =>
                openRegionTree({ record, readOnly: field.readOnly, name: 'deliverRegionLov' })
              }
            />
          );
        },
        renderer: ({ record, text, value }) => {
          if (!readOnly) return text;
          const { allRegionFlag, allRegionFlagMeaning } = record.get([
            'allRegionFlag',
            'allRegionFlagMeaning',
          ]);
          return allRegionFlag ? allRegionFlagMeaning : <span>{value.regionName}</span>;
        },
      },
      {
        width: 220,
        name: 'deliverRegion',
        show: readOnly,
        title: intl.get('small.common.model.postRegion').d('送货区域'),
        renderer: regionRender,
      },
      {
        width: 220,
        name: 'buyOrganizationLov',
        show: !readOnly,
        editor: (record) => {
          const field = record.getField('buyOrganizationLov') || {};
          if (readOnly) return false;
          return (
            <Lov
              onClick={() =>
                openUnitTree({
                  record,
                  readOnly: field.readOnly,
                  name: 'buyOrganizationLov',
                })
              }
            />
          );
        },
      },
      {
        width: 220,
        title: intl.get('small.common.model.canBuyOrganization').d('可采买组织'),
        name: 'buyOrganization',
        show: readOnly,
        renderer: buyOrganizationRender,
      },
      {
        name: 'priceSourceFromNum',
        width: 130,
        editor: !readOnly,
      },
      {
        name: 'priceSourceFromLnNum',
        width: 130,
        editor: !readOnly,
      },
      ...custDimColumns,
      {
        title: intl.get('small.common.model.deliveryDay').d('供货周期（天）'),
        name: 'deliveryDay',
        width: 150,
        editor: !readOnly,
      },
      {
        title: intl.get('small.common.model.guaranteeDay').d('质保期（天）'),
        name: 'guaranteeDay',
        width: 150,
        editor: !readOnly,
      },
      {
        title: intl.get('small.common.model.priceFromNum').d('价格编号'),
        name: 'priceLibNumber',
        width: 150,
        show: isPriceLib,
      },
      {
        name: 'remarkMeaning',
        width: 150,
        editor: !readOnly,
      },
      {
        width: 100,
        name: 'operation',
        lock: 'right',
        renderer: ({ record }) => {
          if (!record.get('agreementLineId')) {
            return '-';
          }
          const status = readOnly ? 'read' : 'edit';
          const backPath =
            workFlowBackPath ||
            `/sagm/sagm-protocol-workbench/detail/${status}?agreementId=${agreementId}`;
          const num = record.get('detailsFlag');
          const updateSku = !workFlowBackPath && agreementStatus !== 'DELETED'; // 除了工作流 和 已删除协议， 其他状态都可以更改协议商品
          return (
            <Button
              funcType="link"
              onClick={() =>
                isHistory
                  ? viewHistoryProduct(record.toData())
                  : // : readOnly
                    // ? viewProduct(record.toData(), backPath)
                    openTransferModal(
                      record.toData(),
                      backPath,
                      () => {
                        query();
                        authorityDataSet.query();
                      },
                      skuApprove,
                      !updateSku // readOnly
                    )
              }
            >
              {intl.get('small.common.model.productManage', { value: num }).d(`商品管理(${num})`)}
            </Button>
          );
        },
      },
    ].filter((f) => f.show || !('show' in f));
    return _columns;
  }, [priceRule, readOnly, sourceFrom, custDimensions, isHistory, agreementStatus]);

  const buttons = useMemo(() => {
    const BatchCreate = (
      <ObserverBtn
        name="batchAddSku"
        text={intl.get('sagm.common.view.button.batchAddSku').d('批量新增商品')}
        icon="playlist_add"
        permission
        permissionList={[
          {
            code: `sagm-protocol-workbench.button.skuNumber`,
            type: 'button',
            meaning: '商城协议工作台-协议商品数量',
          },
        ]}
        onClick={() =>
          openProductModal({
            handleProductOK,
            catalogId: (
              dataSet.selected
                .filter((i) => i.get('effectiveFlag') !== -1)
                .map((e) => e.toData())[0] || {}
            ).catalogId,
          })
        }
        ds={dataSet}
        filter
      />
    );
    // 历史协议
    if (readOnly || workFlowBackPath) return [];
    // 是否有生效和待生效行
    // if (readOnly) return [BatchCreate];
    return [
      agreementId && (
        <Button funcType="flat" icon="archive" onClick={handleImport} name="batchImport">
          {intl.get('small.mallProtocolManagement.view.btn.batchImport').d('批量导入')}
        </Button>
      ),
      agreementId && (
        <ImportButton
          name="bactImportNew"
          businessObjectTemplateCode="SMAL.AGREEMENT_LINE"
          refreshButton
          changeServicePrefix
          buttonText={intl.get('sagm.common.button.bactImportNew').d('(新)批量导入')}
          prefixPatch="/sagm"
          args={{
            agreementId,
            templateCode: 'SMAL.AGREEMENT_LINE',
            tenantId: organizationId,
          }}
          successCallBack={() => dataSet.query()}
          buttonProps={{
            icon: 'archive',
            color: 'primary',
            funcType: 'flat',
            permissionList: [
              {
                code: `${path}.button.import-new`,
                type: 'button',
                meaning: '商城协议工作台-(新)协议行导入',
              },
            ],
          }}
        />
      ),
      <Button funcType="flat" icon="playlist_add" onClick={handleCreate} name="createLine">
        {intl.get('small.mallProtocolManagement.view.btn.createLine').d('添加协议行')}
      </Button>,
      agreementId && BatchCreate,
      <ObserverBtn
        name="batchUpdate"
        text={intl.get('small.mallProtocolManagement.view.btn.batchSelectUpdate').d('勾选批量编辑')}
        icon="mode_edit"
        onClick={handleBatchLine}
        ds={dataSet}
      />,
      <ObserverBtn
        name="batchDelete"
        text={intl.get('small.mallProtocolManagement.view.btn.batchDelete').d('批量删除')}
        icon="delete_sweep"
        onClick={() => handleDelLine(dataSet.selected)}
        ds={dataSet}
      />,
    ];
  }, [agreementId, readOnly, dataSet.selected, priceRule]);

  const MyTable = agreementId ? (
    <SearchBarTable
      dataSet={dataSet}
      columns={columns}
      searchCode={searchBarCode}
      buttons={buttons}
      style={{ maxHeight: 450 }}
      virtual
      virtualCell
      showCachedSelection={!readOnly}
      searchBarConfig={{
        closeFilterSelector: true,
        defaultExpand: false,
        expandable: !readOnly,
        fieldProps: {
          catalogId: { lovPara: { tenantId: organizationId } },
        },
      }}
    />
  ) : (
    <Table
      dataSet={dataSet}
      columns={columns}
      buttons={buttons}
      style={{ maxHeight: 450 }}
      virtual
      virtualCell
    />
  );
  return customizeTable(
    {
      code: customizedCode,
      readOnly,
      buttonCode: 'SAGM.WORKBENCH.LINE.TABLE.BTNS',
    },
    MyTable
  );
});

export default flowRight(withRouter, withCustomDimension(true))(AgreementLine);
