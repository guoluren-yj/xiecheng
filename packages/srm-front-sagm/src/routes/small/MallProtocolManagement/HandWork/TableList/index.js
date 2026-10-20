import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { isEmpty, isNumber, isBoolean } from 'lodash';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { Lov, Table, DataSet, Button, DatePicker } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';
import ImportButton from 'components/Import';
import { Button as PermissionButton } from 'components/Permission';

import ViewLadder from '@/components/ViewLadder';
import { precisionEditor, precisionRender, numberChange } from '@/utils/precision';

import { openUnitTree, openRegionTree } from '@/utils/tree';
import c7nModal from '@/utils/c7nModal';
import { getCustDimColumns, withCustomDimension } from '@/utils/customDimension';
import PriceLib from '@/routes/sagm/PriceLib';
import { openCatalog } from '@/routes/pageTree';
import BatchLine from '../BatchLine';
import getBatchDs from '../BatchLine/batchDs';
import {
  unitPriceChange,
  taxPriceChange,
  taxChange,
  currencyChange,
  getTaxPrice,
  getUnitPrice,
} from '../fieldChange';

// 如果是数字则返回false,否则通过isEmpty判断
const isNoValue = (value) => {
  if (isNumber(value) || isBoolean(value)) {
    return false;
  }
  return isEmpty(value);
};

@withCustomDimension(true)
export default class TableInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      priceRule: '',
    };
  }

  queryDs = new DataSet({
    fields: [
      {
        name: 'itemName',
        type: 'string',
        label: intl.get('small.common.model.itemCodeAndName').d('物料编码/名称'),
      },
      {
        name: 'effectiveFlag',
        type: 'number',
        lookupCode: 'SMAL.AGREEMENT_LINE_STATUS',
        label: intl.get('hzero.common.status').d('状态'),
      },
      {
        name: 'catalogId',
        type: 'object',
        label: intl.get('small.common.view.catalog').d('目录'),
        lovCode: 'SMPC.CATALOG_THREE',
        lovPara: { tenantId: getCurrentOrganizationId() },
        textField: 'catalogName',
        valueField: 'catalogId',
        transformRequest: (val) => (val || {}).catalogId,
      },
    ],
  });

  static getDerivedStateFromProps(nextProps, prevState) {
    const { priceRule } = nextProps;
    if (priceRule !== prevState.priceRule) {
      return {
        priceRule,
      };
    }
    return null;
  }

  // 暂时性优化，选择性渲染表格
  shouldComponentUpdate(nextProps) {
    const {
      agreementId: prevAgreementId,
      custLoading: prevCustLoading,
      priceRule: prevPriceRule,
      custDimensions,
    } = this.props;
    const { agreementId, custLoading, priceRule, custDimensions: prevCustDimensions } = nextProps;
    const isUpdate =
      prevAgreementId !== agreementId ||
      prevCustLoading !== custLoading ||
      prevPriceRule !== priceRule ||
      custDimensions !== prevCustDimensions;
    return isUpdate;
  }

  /**
   * 新建
   */
  @Bind()
  handleAddLine() {
    const { tableDs, supplierTenantId } = this.props;
    const tenantId = getCurrentOrganizationId();
    tableDs.create({ tenantId, supplierTenantId, allRegionFlag: 1, allUnitFlag: 1 }, 0);
  }

  @Bind
  handleAddPriceLib() {
    const { tableDs, initData } = this.props;
    const modal = PriceLib.create({
      filterDs: tableDs,
      filterData: initData,
      afterSuccess: (data) => {
        if (tableDs && data.length > 0) {
          data.forEach((item) => {
            tableDs.create(item, 0);
          });
        }
        modal.close();
      },
    });
  }

  /**
   * 删除
   */
  @Bind()
  handleDelLine(selectData) {
    const { tableDs } = this.props;
    const savedRecords = selectData.filter((f) => f.get('agreementLineId'));
    tableDs.remove(selectData.filter((f) => !f.get('agreementLineId')));
    if (savedRecords.length > 0) {
      tableDs.delete(savedRecords).then(() => {
        tableDs.query(tableDs.currentPage, undefined, true);
      });
    }
  }

  // 物料带出目录，带出分类
  @Bind()
  handleItemChange(item, record) {
    const { getCatalogByItem = (e) => e } = this.props;
    record.set('itemLov', {
      id: item.id,
      itemId: item.itemId,
      itemCode: item.itemCode,
    });
    let cId = record.get('itemCategoryId'); // categoryId
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
      getCatalogByItem([{ itemId: item.itemId, itemCategoryId: cId }]).then((res) => {
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
  @Bind()
  handleCateChange(itemCategoryId, record) {
    const itemId = record.get('itemId');
    if (itemId || itemCategoryId) {
      const { getCatalogByItem = (e) => e } = this.props;
      getCatalogByItem([{ itemCategoryId, itemId }]).then((res) => {
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

  handleBatchLine = () => {
    const { tableDs, isDisabled, supplierTenantId, onShowLadderPrice = (e) => e } = this.props;
    const batchDs = new DataSet(getBatchDs(isDisabled, supplierTenantId));
    const [record] = tableDs.selected;
    c7nModal({
      title: intl.get('small.common.button.batchUpdate').d('批量维护'),
      style: { width: 380 },
      onOk: () => this.handleBatchOk(batchDs),
      children: (
        <BatchLine
          initInfo={record.toData()}
          dataSet={batchDs}
          isPriceLib={isDisabled}
          onShowLadderPrice={onShowLadderPrice}
          priceRule={this.state.priceRule}
        />
      ),
    });
  };

  precisionIsChange = ({ data, record, precisionName }) => {
    const { [precisionName]: nextPrecision } = data;
    const prevPrecision = record.get(precisionName);
    // 需要进行精度控制的情况，有原精度，精度未发生更新
    if (isNoValue(nextPrecision) && !isNoValue(prevPrecision)) {
      return prevPrecision;
    }
    return nextPrecision;
  };

  // 精度控制
  precisionChangeField = ({ record, name, value, data, precisionName }, callback = (e) => e) => {
    const precision = this.precisionIsChange({ data, record, precisionName });
    if (isNoValue(precision)) {
      record.set(name, value);
      return false;
    }
    const resValue = numberChange({ name, value, record, precision });
    callback({ value: resValue, record, precision });
  };

  isDateRange = ({ record, name, value }) => {
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

  batchRules = {
    // 阶梯价格
    agreementLadders: ({ data, name, value, record }) => {
      const pricePrecision = this.precisionIsChange({
        data,
        record,
        precisionName: 'defaultPrecision',
      });
      const quantityPrecision = this.precisionIsChange({
        data,
        record,
        precisionName: 'uomPrecision',
      });
      if (isNoValue(pricePrecision) && isNoValue(quantityPrecision)) {
        record.set(name, value);
        return false;
      }

      const { priceRule } = this.state;
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

      const { priceRule } = this.state;
      const priceEditable = priceRule === 'TAX_INCLUDED_PRICE';
      const changeField = priceEditable ? 'taxPrice' : 'unitPrice';

      const { tax: nextTax, taxPrice } = data;
      const prevTax = record.get('tax');
      const taxIsChange = !isNoValue(nextTax) && !isNoValue(prevTax);
      const precision = this.precisionIsChange({ data, record, precisionName: 'defaultPrecision' }); // 需要重新计算

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
    validDateFrom: this.isDateRange,
    // 有效期至
    validDateTo: this.isDateRange,

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
      const { isDisabled } = this.props; // 来源于价格库
      const editFlag = record.get('companyAssignEditFlag');
      const effectiveFlag = record.get('effectiveFlag');
      const readOnly = effectiveFlag === -1 || (isDisabled && editFlag !== -1);
      if (!readOnly) {
        record.set(name, value);
        record.set('allUnitFlag', data.allUnitFlag);
      }
    },
    // agreementQuantity
    agreementQuantity: (params) =>
      this.precisionChangeField({ ...params, precisionName: 'uomPrecision' }),
    // orderQuantity
    orderQuantity: (params) =>
      this.precisionChangeField({ ...params, precisionName: 'uomPrecision' }),
    // minPackageQuantity
    minPackageQuantity: (params) =>
      this.precisionChangeField({ ...params, precisionName: 'uomPrecision' }),
    // purchaseQuantityLimit
    purchaseQuantityLimit: (params) =>
      this.precisionChangeField({ ...params, precisionName: 'uomPrecision' }),
    // purchaseAmountLimit
    purchaseAmountLimit: (params) =>
      this.precisionChangeField({ ...params, precisionName: 'financialPrecision' }),
  };

  handleBatchOk = async (batchDs) => {
    const { tableDs } = this.props;
    const flag = await batchDs.validate();
    const tableUpdateRecords = tableDs.selected;
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
            const fieldRuleSet = this.batchRules[field];
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
  };

  /**
   * 操作按钮
   */
  @Bind()
  getButtons() {
    const {
      tableDs,
      initData = {},
      invalidFlag,
      agreementId,
      handleImport = (e) => e,
      handleCreateProduct = (e) => e,
      path,
    } = this.props;
    const { sourceFrom } = initData;
    const DeleteButton = observer(({ dataSet }) => {
      return (
        <Button
          funcType="flat"
          icon="delete"
          color="primary"
          disabled={dataSet.selected.length === 0}
          onClick={() => this.handleDelLine(dataSet.selected)}
        >
          {intl.get('small.common.model.batchDelete').d('批量删除')}
        </Button>
      );
    });
    const UpdateButton = observer(({ dataSet }) => {
      return (
        <Button
          funcType="flat"
          color="primary"
          icon="application_allocation"
          disabled={dataSet.selected.length === 0}
          onClick={() => this.handleBatchLine()}
        >
          {intl.get('small.common.view.batchUpdate').d('批量维护')}
        </Button>
      );
    });
    const AddButton = observer(({ dataSet }) => {
      const createStatusList = dataSet.selected.filter((item) => item.status === 'add').length;
      return (
        <PermissionButton
          funcType="flat"
          type="c7n-pro"
          color="primary"
          icon="library_add-o"
          disabled={
            dataSet.selected.filter((i) => i.get('effectiveFlag') !== -1).length === 0 ||
            createStatusList > 0
          }
          permissionList={[
            {
              code: `sagm.protocol-management.button.skuNumber`,
              type: 'button',
              meaning: '商城协议管理-协议商品数量',
            },
          ]}
          onClick={() =>
            handleCreateProduct(
              dataSet.selected.filter((i) => i.get('effectiveFlag') !== -1).map((e) => e.toData())
            )
          }
        >
          {intl.get('small.common.model.batchCreateProducts').d('批量创建商品')}
        </PermissionButton>
      );
    });
    const buttons = [
      <Button
        funcType="flat"
        icon="archive"
        onClick={handleImport}
        disabled={!agreementId}
        name="batchImport"
      >
        {intl.get('small.common.button.batchImport').d('批量导入')}
      </Button>,
      <ImportButton
        name="bactImportNew"
        businessObjectTemplateCode="SMAL.AGREEMENT_LINE"
        refreshButton
        buttonText={intl.get('sagm.common.button.bactImportNew').d('(新)批量导入')}
        prefixPatch="/sagm"
        changeServicePrefix
        args={{
          agreementId,
          templateCode: 'SMAL.AGREEMENT_LINE',
          tenantId: getCurrentOrganizationId(),
        }}
        successCallBack={() => tableDs.query()}
        buttonProps={{
          disabled: !agreementId,
          icon: 'archive',
          color: 'primary',
          funcType: 'flat',
          permissionList: [
            {
              code: `${path}.button.import-new`,
              type: 'button',
              meaning: '商城协议管理-(新)协议行导入',
            },
          ],
        }}
      />,
      <Button
        name="createLine"
        funcType="flat"
        icon="playlist_add"
        onClick={sourceFrom === 'PRICE' ? this.handleAddPriceLib : this.handleAddLine}
        disabled={invalidFlag}
      >
        {intl.get('small.mallProtocolManagement.model.createLine').d('添加协议行')}
      </Button>,
      <AddButton dataSet={tableDs} name="batchCreateProducts" />,
      <UpdateButton dataSet={tableDs} name="batchUpdate" />,
      <DeleteButton dataSet={tableDs} name="batchDelete" />,
    ];
    return buttons;
  }

  /**
   * 返回列
   */
  @Bind()
  getColumns() {
    const {
      tableDs,
      isDisabled,
      invalidFlag,
      quoteType,
      initData,
      custDimensions,
      onShowTransfer = (e) => e,
      onShowLadderPrice = (e) => e,
    } = this.props;

    const { sourceFrom } = initData;
    const { priceRule } = this.state;
    const priceEditable = priceRule === 'TAX_INCLUDED_PRICE';
    const changeField = priceEditable ? 'taxPrice' : 'unitPrice';
    const custDimColumns = getCustDimColumns(tableDs, custDimensions, { sort: 26 });
    const columns = [
      {
        name: 'lineNum',
        width: 100,
        lock: 'left',
      },
      {
        name: 'itemLov',
        width: 150,
        lock: 'left',
        editor: (record) =>
          isDisabled ? (
            false
          ) : (
            <Lov
              onChange={(lovRecord) => {
                const item = lovRecord || {};
                this.handleItemChange(item, record);
              }}
            />
          ),
      },
      {
        title: intl.get('small.common.model.item.name').d('物料名称'),
        name: 'itemName',
        width: 150,
        editor: !isDisabled,
      },
      {
        name: 'itemCategoryLov',
        width: 150,
        editor: (record) =>
          isDisabled ? (
            false
          ) : (
            <Lov
              tableProps={{
                selectionMode: 'rowbox',
              }}
              onChange={(lovRecord) => {
                const item = lovRecord || {};
                this.handleCateChange(item.categoryId, record);
              }}
            />
          ),
      },
      {
        name: 'catalogLov',
        width: 150,
        editor: (record, name) => <Lov onClick={() => openCatalog({ record, name })} />,
      },
      {
        name: 'effectiveFlag',
        width: 100,
        renderer: ({ record }) => record.get('effectiveFlagMeaning'),
      },
      {
        width: 160,
        name: 'validDateFrom',
        editor: (record) =>
          isDisabled && record.get('manualEffectiveFlag') === 0 ? (
            false
          ) : (
            <DatePicker
              clearButton={false}
              // min={record.get('priceValidDateFrom') || moment()}
              max={record.get('validDateTo') || record.get('priceValidDateTo') || undefined}
            />
          ),
      },
      {
        width: 160,
        name: 'validDateTo',
        editor: (record) =>
          isDisabled && record.get('manualEffectiveFlag') === 0 ? (
            false
          ) : (
            <DatePicker
              clearButton={false}
              // min={record.get('validDateFrom') || record.get('priceValidDateFrom') || moment()}
              max={record.get('priceValidDateTo') || undefined}
            />
          ),
      },
      {
        name: 'uomLov',
        width: 140,
        editor: () => (isDisabled ? false : <Lov clearButton={false} />),
      },
      {
        name: 'taxLov',
        width: 140,
        editor: (record, name) =>
          isDisabled ? (
            false
          ) : (
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
          ),
      },
      {
        name: 'currencyLov',
        width: 140,
        editor: (record) =>
          isDisabled ? (
            false
          ) : (
            <Lov
              clearButton={false}
              onChange={(lovRecord) => currencyChange(record, lovRecord, changeField)}
            />
          ),
      },
      {
        name: 'priceType',
        width: 150,
        editor: !isDisabled,
      },
      {
        name: 'unitPrice',
        width: 150,
        editor: (record) => {
          if (isDisabled) return false;
          return (
            !priceEditable &&
            precisionEditor({
              record,
              name: 'unitPrice',
              type: 'currency',
              precision: record.get('defaultPrecision'),
              onChange: (value) => {
                unitPriceChange(value, record, record.get('defaultPrecision'));
              },
            })
          );
        },
        renderer: isDisabled ? (para) => precisionRender(para) : undefined,
      },
      // 含税价格
      {
        name: 'taxPrice',
        width: 150,
        editor: (record) => {
          if (isDisabled) return false;
          return (
            priceEditable &&
            precisionEditor({
              record,
              name: 'taxPrice',
              type: 'currency',
              precision: record.get('defaultPrecision'),
              onChange: (value) => {
                taxPriceChange(value, record, record.get('defaultPrecision'));
              },
            })
          );
        },
        renderer: isDisabled ? (para) => precisionRender(para) : undefined,
      },
      {
        name: 'priceBatchQuantity',
        width: 120,
        editor: () => !isDisabled,
      },
      {
        name: 'ladderFlag',
        width: 160,
        align: 'right',
        renderer: ({ record }) => {
          const { priceType } = record.toData();
          return priceType === 'LADDER_PRICE' ? (
            isDisabled || invalidFlag ? (
              <ViewLadder dataSource={record.get('agreementLadders') || []} />
            ) : (
              <a
                onClick={() => onShowLadderPrice(record.toData(), record)}
                disabled={!record.get('currencyCode')}
              >
                {intl.get('small.mallProtocolManagement.model.setLadderPrice').d('设置阶梯价格')}
              </a>
            )
          ) : (
            ''
          );
        },
      },
      {
        name: 'priceHiddenFlag',
        width: 160,
        editor: true,
        help: intl
          .get('small.common.view.hiddenPriceHelp')
          .d('开启隐藏价格则主站商品价格显示为***'),
      },
      {
        name: 'postageLov',
        width: 150,
        editor: (record, name) => (
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
        ),
      },
      {
        name: 'installLov',
        width: 150,
        editor: true,
      },
      {
        name: 'agreementQuantity',
        width: 150,
        editor: (record) =>
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
        editor: (record) => {
          const field = record.getField('deliverRegionLov') || {};
          return (
            <Lov
              onClick={() =>
                openRegionTree({ record, readOnly: field.readOnly, name: 'deliverRegionLov' })
              }
            />
          );
        },
      },
      {
        width: 220,
        name: 'buyOrganizationLov',
        editor: (record) => {
          const field = record.getField('buyOrganizationLov') || {};
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
        name: 'priceSourceFromNum',
        width: 130,
        editor: true,
      },
      {
        name: 'priceSourceFromLnNum',
        width: 130,
        editor: true,
      },
      ...custDimColumns,
      {
        title: intl.get('small.common.model.deliveryDay').d('供货周期（天）'),
        name: 'deliveryDay',
        width: 150,
        editor: true,
      },
      {
        title: intl.get('small.common.model.guaranteeDay').d('质保期（天）'),
        name: 'guaranteeDay',
        width: 150,
        editor: true,
      },
      quoteType === 'price' || sourceFrom === 'PRICE'
        ? {
            title: intl.get('small.common.model.priceFromNum').d('价格编号'),
            name: 'priceLibNumber',
            width: 150,
          }
        : '',
      {
        name: 'remarkMeaning',
        width: 150,
        editor: true,
      },
      {
        width: 130,
        name: 'operation',
        renderer: ({ record }) => (
          <span className="action-link">
            <a onClick={() => this.handleDelLine([record])} disabled={invalidFlag}>
              {intl.get('hzero.common.button.delete').d('删除')}
            </a>
            {record.get('agreementLineId') && (
              <a onClick={() => onShowTransfer(record.toData())}>
                {intl.get('small.common.model.product').d('商品')}({record.get('detailsFlag')})
              </a>
            )}
          </span>
        ),
      },
    ];
    return columns;
  }

  render() {
    const { tableDs, customizeTable, initData, agreementId } = this.props;
    const { sourceFrom } = initData;
    const buttons = this.getButtons();
    const columns = this.getColumns();
    if (agreementId) {
      tableDs.queryDataSet = this.queryDs;
      tableDs.paging = true;
    }

    return (
      <React.Fragment>
        {customizeTable(
          {
            code:
              sourceFrom === 'PRICE'
                ? 'SMAL.AGREEMENT_MANAGEMENT.IMOIRT_PRICE_LIB_NEW'
                : 'SMAL.AGREEMENT_MANAGEMENT.IMPORT_MANUAL_NEW',
            buttonCode: 'SMAL.AGREEMENT_MANAGEMENT.LINE.TABLE.BTNS',
          },
          <Table
            virtual
            virtualCell
            style={{ maxHeight: 450 }}
            key={sourceFrom}
            buttons={buttons}
            columns={columns}
            columnResizable
            dataSet={tableDs}
            showCachedSelection
          />
        )}
      </React.Fragment>
    );
  }
}
