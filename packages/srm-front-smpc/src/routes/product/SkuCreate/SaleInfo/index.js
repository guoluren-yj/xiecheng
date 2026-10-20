import React from 'react';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';
import { Tag } from 'choerodon-ui';
import uuidv4 from 'uuid/v4';
import { Table, Button, Lov, Select, DataSet, Tooltip } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import c7nModal from '@/utils/c7nModal';
import { openUnitTree, openRegionTree } from '@/utils/tree';
import { getCustDimColumns, withCustomDimension } from '@/utils/customDimension';
import { openLadderPrice, openTextArea } from '../../SkuWorkbench/drawers';
import {
  deleteSales,
  validSales,
  inValidSales,
  fetchSales,
  getPriceInfo,
} from '../../SkuWorkbench/api';
import { getMappingDataByAttr } from '../api';
import { precisionEditor } from '../../utilsApi/precision';
import Info from '../Info';
import {
  taxChange,
  currencyChange,
  unitPriceChange,
  taxPriceChange,
  ladderChange,
} from './fieldChange';
import customStore from '../customStore';
import { mountCustomizeCom } from '../SkuInfo/funcs';
import { importPriceDs } from '../ds';
import ImportPrice from './ImportPrice';
import styles from './index.less';

const BatchBtn = observer((props) => {
  const { dataSet, children, disabled, dynamicDisbale = (e) => e, ...others } = props;
  const _disabled = disabled || dynamicDisbale(dataSet.selected);
  return (
    <Button funcType="flat" color="primary" disabled={_disabled} {...others}>
      {children}
    </Button>
  );
});

@withCustomDimension(true)
export default class SkuTable extends React.Component {
  state = { mappingLoading: false, priceIncludeTaxEditable: true };

  defaultMappingData = {};

  isJson = (res) => {
    let result;
    try {
      result = JSON.parse(res);
    } catch (e) {
      return false;
    }
    return typeof result === 'object' && typeof result !== 'string';
  };

  componentDidMount() {
    const { customHelpByItem, skuRecord } = this.props;
    this.fetchMappingDataByAttr();
    this.fetchPriceInfo();
    this.handleReceiveCreate();
    // 强行挂载物料信息（58集团二开需求： 根据物料信息的个性化字段配置价格信息列字段的fx）
    mountCustomizeCom({
      code: 'ITEM_INFO',
      wrapperName: 'helpItemInfo',
      dataSet: customHelpByItem(skuRecord),
    });
  }

  fetchMappingDataByAttr = async () => {
    const { skuRecord } = this.props;
    const skuAttrs = skuRecord.get('skuAttrList') || [];
    const skuExtends = skuRecord.get('skuAttrExtendList') || [];
    this.setState({ mappingLoading: true });
    const res = getResponse(await getMappingDataByAttr([...skuAttrs, ...skuExtends]));
    if (res) {
      const { tax, uom, currency } = res;
      // if (errorMsg) this.setState({ errorMsg });
      const { mappingData: taxId, taxRate } = tax || {};
      const { mappingData: uomId, mappingDataName: uomName, uomPrecision } = uom || {};
      const { mappingData: currencyId, mappingDataName: currencyName, defaultPrecision } =
        currency || {};
      this.defaultMappingData = {
        taxId,
        tax: taxRate,
        uomId,
        uomName,
        uomPrecision,
        currencyId,
        currencyName,
        defaultPrecision,
      };
    }
    this.setState({ mappingLoading: false });
  };

  fetchPriceInfo = async () => {
    const { tableDs, skuRecord } = this.props;
    const params = {
      companyId: skuRecord.get('companyId'),
      supplierCompanyId: skuRecord.get('supplierCompanyId'),
    };
    const response = getResponse(await getPriceInfo(params));
    if (response) {
      if (this.isJson(response) && JSON.parse(response).failed) {
        notification.error({ message: JSON.parse(response).message });
        return false;
      }
      // 根据价格规则判断协议价格（含税||未税）的可编辑性
      const flag = response === 'TAX_INCLUDED_PRICE';
      this.setState({ priceIncludeTaxEditable: flag }, () => {
        tableDs.forEach((f) => {
          const { quotationFlag, agreementSourceFrom } = f.get([
            'quotationFlag',
            'agreementSourceFrom',
          ]);
          f.init('quotationFlag', agreementSourceFrom === 'PRICE' ? quotationFlag : flag ? 1 : 0);
        });
      });
    }
  };

  handleCreate = () => {
    const { priceIncludeTaxEditable } = this.state;
    const { tableDs, isAttrMapping } = this.props;
    // if (errorMsg && isAttrMapping) notification.warning({ message: errorMsg });
    tableDs.create(
      {
        allUnitFlag: 1,
        allRegionFlag: 1,
        freeShippingFlag: 1,
        skuPriceStatus: 'NEW',
        updateFlag: 1,
        quotationFlag: priceIncludeTaxEditable ? 1 : 0,
        _uuid: uuidv4(),
        ...(isAttrMapping ? this.defaultMappingData : {}),
      },
      0
    );
  };

  // 引用价格
  handleImportPrice() {
    const { isSup, skuRecord, tableDs, supplierCompanyId } = this.props;
    const { itemId } = skuRecord.get(['itemId']);
    const excludeLineIds = tableDs.reduce(
      (pre, record) =>
        record.get('agreementLineId') ? [...pre, record.get('agreementLineId')] : pre,
      []
    );
    const priceDs = new DataSet(
      importPriceDs({ isSup, itemId, supplierCompanyId, excludeLineIds })
    );
    c7nModal({
      title: intl.get('smpc.product.button.importPrice').d('引用价格'),
      style: { width: 1080 },
      children: <ImportPrice dataSet={priceDs} />,
      onOk: () => {
        priceDs.selected.forEach((record) => {
          const {
            unitPrice: agreementPrice,
            taxPrice: agreementTaxedPrice,
            postageId: shippingRuleId,
            postageName,
            allRegionFlag,
            agreementRegionDTOList = [],
            allUnitFlag,
            agreementUnitDTOList = [],
            agreementLadders,
            sourceFrom,
          } = record.get([
            'unitPrice',
            'taxPrice',
            'postageId',
            'postageName',
            'allRegionFlag',
            'agreementRegionDTOList',
            'allUnitFlag',
            'agreementUnitDTOList',
            'agreementLadders',
            'sourceFrom',
          ]);
          record.set({
            agreementPrice,
            agreementTaxedPrice,
            skuPriceStatus: 'NEW',
            skuPriceStatusMeaning: intl.get('smpc.product.view.create').d('新建'),
            shippingRuleId,
            shippingRuleName: postageName || intl.get('small.common.view.free').d('包邮'), // 运费规则
            skuSalesLadders: agreementLadders,
            agreementSourceFrom: sourceFrom,
            [allRegionFlag === 0 && 'skuSalesRegions']: agreementRegionDTOList, // 送货区域
            [allUnitFlag === 0 && 'skuSalesUnits']: agreementUnitDTOList.map((n) => ({
              ...n,
              unitCodeName: `${n.unitCode}-${n.unitName}`,
            })), // 可采买组织
          });
        });
        tableDs.unshift(...priceDs.selected);
      },
    });
  }

  handleReceiveCreate = () => {
    const { tableDs } = this.props;
    const { priceIncludeTaxEditable } = this.state;
    const isReceive = customStore.getState('isReceive');
    if (tableDs && tableDs.length < 1 && isReceive) {
      tableDs.create({
        allUnitFlag: 1,
        allRegionFlag: 1,
        freeShippingFlag: 1,
        // skuPriceStatus: 'NEW',
        updateFlag: 1,
        agreementTaxedPrice: 0,
        agreementPrice: 0,
        quotationFlag: priceIncludeTaxEditable ? 1 : 0,
        _uuid: uuidv4(),
      });
    }
  };

  handleDelete = async () => {
    const { tableDs, onDelete = (e) => e } = this.props;
    const records = tableDs.selected.filter((f) => !f.get('salesId'));
    const deleteRecords = tableDs.selected.filter((f) => f.get('salesId'));
    tableDs.remove(records);
    if (deleteRecords.length > 0) {
      const deleteData = deleteRecords.map((m) => {
        return { salesId: m.get('salesId') };
      });
      const res = getResponse(await deleteSales(deleteData));
      if (res) {
        notification.success();
        tableDs.remove(deleteRecords);
        onDelete(deleteData);
      }
    }
  };

  handleSetLadders = (record) => {
    const { noEdit, isEdit } = this.props;
    const ladders = record.get('skuSalesLadders') || [];
    const isAgreementSourceFrom = record.get('agreementSourceFrom') === 'PRICE';
    const tax = record.get('tax');
    const { priceIncludeTaxEditable } = this.state;
    openLadderPrice({
      tax,
      isPriceRule: true,
      priceIncludeTaxEditable,
      readOnly: !isEdit || noEdit || isAgreementSourceFrom,
      data: ladders,
      uomPrecision: record.get('uomPrecision'),
      defaultPrecision: record.get('defaultPrecision'),
      onSave: (skuSalesLadders) => {
        record.set('skuSalesLadders', skuSalesLadders);
        ladderChange(record, skuSalesLadders);
      },
    });
  };

  // 判断列是否可编辑
  isEditPriceLine() {
    // const { skuPriceStatus, agreementLineId } = record.toData();
    // return !(skuPriceStatus === 'NEW' && agreementLineId && agreementLineId !== -1);
    return true;
  }

  renderTagColor = (status) => {
    if (
      ['NEW', 'WAITING_VALID', 'WAITING_APPROVE', 'WAITING', 'WORKFLOW_WAITING'].includes(status)
    ) {
      return 'orange';
    } else if (['VALID', 'APPROVED'].includes(status)) {
      return 'green';
    } else if (['VALID_ERROR', 'REJECT'].includes(status)) {
      return 'red';
    } else {
      return 'gray';
    }
  };

  @Bind()
  getColumns() {
    const { tableDs, skuRecord, isSup, isEdit, custDimensions, remote } = this.props;
    const { priceIncludeTaxEditable } = this.state;
    const changeField = priceIncludeTaxEditable ? 'agreementTaxedPrice' : 'agreementPrice';
    const isReceive = customStore.getState('isReceive');
    const custDimColumns = !isReceive
      ? getCustDimColumns(tableDs, custDimensions, { sort: 17 })
      : [];
    const columns = [
      {
        name: 'skuPriceStatusMeaning',
        width: 130,
        tooltip: 'none',
        show: !isReceive,
        renderer: ({ value, record }) => {
          const status = record.get('skuPriceStatus');
          return (
            <Tag color={this.renderTagColor(status)} border={false}>
              {value}
            </Tag>
          );
        },
      },
      {
        name: 'shelfErrorMessageMeaning',
        width: 130,
        show: !isReceive,
      },
      {
        name: 'uomLov',
        width: 140,
        editor: (record) => this.isEditPriceLine(record) && <Lov clearButton={false} />,
      },
      {
        name: 'taxLov',
        width: 140,
        editor: (record, name) =>
          this.isEditPriceLine(record) && (
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
          this.isEditPriceLine(record) && (
            <Lov
              clearButton={false}
              onChange={(lovRecord) => currencyChange(record, lovRecord, changeField)}
            />
          ),
      },
      // 协议价格含税
      {
        name: 'agreementTaxedPrice',
        width: 120,
        editor: (record) => {
          return (
            priceIncludeTaxEditable &&
            this.isEditPriceLine(record) &&
            precisionEditor({
              record,
              type: 'currency',
              name: 'agreementTaxedPrice',
              precision: record.get('defaultPrecision'),
              onChange: (value) => {
                taxPriceChange(value, record, record.get('defaultPrecision'));
              },
            })
          );
        },
      },
      // 协议价格不含税
      {
        name: 'agreementPrice',
        width: 120,
        editor: (record) => {
          return (
            this.isEditPriceLine(record) &&
            !priceIncludeTaxEditable &&
            precisionEditor({
              record,
              type: 'currency',
              name: 'agreementPrice',
              precision: record.get('defaultPrecision'),
              onChange: (value) => {
                unitPriceChange(value, record, record.get('defaultPrecision'));
              },
            })
          );
        },
      },
      {
        name: 'priceBatchQuantity',
        width: 120,
        editor: true,
        show: !isReceive,
      },
      {
        name: 'priceType',
        width: 120,
        show: !isReceive,
        editor: (record) => {
          return this.isEditPriceLine(record) && <Select clearButton={false} />;
        },
      },
      {
        name: 'skuSalesLadders',
        width: 120,
        show: !isReceive,
        renderer: ({ record }) => {
          return record.get('priceType') === 'LADDER_PRICE' ? (
            <a disabled={!record.get('currencyId')} onClick={() => this.handleSetLadders(record)}>
              {record.get('agreementSourceFrom') === 'PRICE'
                ? intl.get('smpc.product.model.viewLadderPriceSet').d('查看阶梯价格')
                : isEdit
                ? intl.get('smpc.product.model.ladderPriceSet').d('设置阶梯价格')
                : intl.get('smpc.product.model.viewLadderPriceSet').d('查看阶梯价格')}
            </a>
          ) : (
            '-'
          );
        },
      },
      {
        name: 'priceHiddenFlag',
        width: 150,
        show: !isReceive,
        editor: (record) => {
          return this.isEditPriceLine(record) && <Select clearButton={false} />;
        },
      },
      {
        name: 'validDateFrom',
        width: 120,
        show: !isReceive,
        editor: (record) => this.isEditPriceLine(record),
      },
      {
        name: 'validDateTo',
        width: 120,
        show: !isReceive,
        editor: (record) => this.isEditPriceLine(record),
      },
      {
        name: 'freightLov',
        width: 140,
        show: !isReceive,
        editor: (record) => this.isEditPriceLine(record) && <Lov clearButton={false} />,
      },
      {
        name: 'installLov',
        width: 140,
        show: !isReceive,
        editor: (record) => this.isEditPriceLine(record) && <Lov clearButton={false} />,
      },
      {
        name: 'orderQuantity',
        width: 120,
        show: !isReceive,
        editor: (record) => {
          return (
            this.isEditPriceLine(record) &&
            precisionEditor({
              record,
              type: 'number',
              name: 'orderQuantity',
              precision: record.get('uomPrecision'),
            })
          );
        },
      },
      {
        name: 'minPackageQuantity',
        width: 130,
        show: !isReceive,
        editor: (record) => {
          return (
            this.isEditPriceLine(record) &&
            precisionEditor({
              record,
              type: 'number',
              name: 'minPackageQuantity',
              precision: record.get('uomPrecision'),
            })
          );
        },
      },
      {
        name: 'skuSalesRegions',
        width: 150,
        show: !isReceive,
        editor: (record, name) => {
          const field = record.getField(name) || {};
          return (
            this.isEditPriceLine(record) && (
              <Lov
                onClick={() =>
                  openRegionTree({
                    record,
                    name: 'skuSalesRegions',
                    readOnly: field.readOnly,
                  })
                }
              />
            )
          );
        },
      },
      {
        name: 'skuSalesUnits',
        width: 150,
        show: !isReceive,
        editor: (record, name) => {
          const field = record.getField(name) || {};
          return (
            this.isEditPriceLine(record) && (
              <Lov
                onClick={() =>
                  openUnitTree({
                    record,
                    name: 'skuSalesUnits',
                    readOnly: field.readOnly,
                  })
                }
              />
            )
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
        name: 'priceLibNumber',
        width: 150,
        show: !isSup && !isReceive,
        header: intl.get('smpc.product.view.useProceLinNum').d('引用价格库编码'),
      },
      {
        name: 'deliveryDay',
        width: 150,
        show: !isReceive,
        editor: (record) => this.isEditPriceLine(record),
      },
      {
        name: 'guaranteeDay',
        width: 150,
        show: !isReceive,
        editor: (record) => this.isEditPriceLine(record),
      },
      {
        name: 'remarkMeaning',
        width: 150,
        show: !isReceive,
        editor: (record) => this.isEditPriceLine(record),
      },
      {
        name: 'option',
        width: 80,
        lock: 'right',
        show: !isSup && isEdit && !isReceive,
        renderer: ({ record }) => {
          const { skuPriceStatus, agreementLineId, salesId, logicDeleteFlag } = record.toData();
          if (logicDeleteFlag) return;
          const skuId = skuRecord.get('skuId');
          const shelfApi = async (api, param) => {
            const params = record.toJSONData();
            delete params.skuSalesUnits;
            delete params.skuSalesRegions;
            tableDs.status = 'loading';
            const res = getResponse(await api([{ ...params, ...param, skuId }]));
            tableDs.status = 'ready';
            const reSetMethod = tableDs.dirty ? 'set' : 'init';
            if (res) {
              notification.success();
              tableDs.status = 'loading';
              const sales = getResponse(await fetchSales({ skuId }));
              const initSales = skuRecord.get('skuSalesInfos') || [];
              const equalFn = (m) => {
                return salesId || m.salesId
                  ? salesId === m.salesId
                  : m.agreementLineId === agreementLineId;
              };
              const findIt = sales.find(equalFn);
              if (findIt) {
                const updateFields = [
                  'skuPriceStatus',
                  'skuPriceStatusMeaning',
                  'shelfErrorMessageMeaning',
                ];
                const updateLine = {};
                updateFields.forEach((name) => {
                  record.init(name, findIt[name]);
                  updateLine[name] = findIt[name];
                });
                const newInitSales = initSales.map((m) =>
                  equalFn(m) ? { ...m, ...updateLine } : m
                );
                skuRecord[reSetMethod]('skuSalesInfos', newInitSales);
              } else {
                // 未找到删除
                tableDs.remove([record]);
                const skuSalesInfos = skuRecord.get('skuSalesInfos') || [];
                // 外面也删除该行
                const filterSales = skuSalesInfos.filter((f) => !equalFn(f));
                skuRecord[reSetMethod]('skuSalesInfos', filterSales);
              }
              tableDs.status = 'ready';
              // record.set('skuPriceStatus');
            }
          };

          const invalidOpt = (
            <Button
              funcType="link"
              onClick={() => {
                openTextArea({
                  title: intl.get('smpc.product.view.manualInvalid').d('手动失效'),
                  name: 'validRemark',
                  label: intl.get('smpc.product.view.invalidReason').d('失效原因'),
                  maxLength: 100,
                  onOk: (param) => shelfApi(inValidSales, param),
                });
              }}
            >
              {intl.get('smpc.product.view.invalid').d('失效')}
            </Button>
          );

          const validOpt = (
            <Button
              funcType="link"
              onClick={() =>
                openTextArea({
                  title: intl.get('smpc.product.view.manualValid').d('手动生效'),
                  name: 'validRemark',
                  label: intl.get('smpc.product.view.validReason').d('生效原因'),
                  maxLength: 100,
                  onOk: (param) => shelfApi(validSales, param),
                })
              }
            >
              {intl.get('smpc.product.view.effect').d('生效')}
            </Button>
          );

          const optionsMap = {
            // 生效
            VALID: invalidOpt,
            // 待生效
            WAITING_VALID: validOpt,
            // 失效
            INVALID: validOpt,
            // 生效失败
            VALID_ERROR: validOpt,
          };
          return optionsMap[skuPriceStatus];
        },
      },
    ];
    const newColumns = remote.process(
      'PRICE_INFO_COLUMNS',
      columns.filter((f) => f.show !== false),
      {
        columns,
        skuRecord,
        isSup,
      }
    );
    return newColumns;
  }

  // 永祥二开： 供应商新增按钮隐藏
  getButtons = () => {
    const {
      remote,
      isSup,
      isAttrMapping,
      path,
      tableDs,
      skuRecord,
      supplierCompanyId,
    } = this.props;
    const { mappingLoading } = this.state;
    const { itemId } = skuRecord.get(['itemId']);
    const btns = [
      <Button
        funcType="flat"
        color="primary"
        icon="playlist_add"
        name="create" // 勿改， 永祥二开供应商需隐藏新建按钮
        onClick={this.handleCreate}
        disabled={isAttrMapping ? mappingLoading : false}
      >
        {intl.get('smpc.product.model.addPriceLine').d('新增价格行')}
      </Button>,
      <Tooltip
        title={
          !(itemId && supplierCompanyId)
            ? intl.get('smpc.product.view.itemTips').d('请先维护物料和供应商')
            : null
        }
      >
        <Button
          funcType="flat"
          color="primary"
          icon="playlist_add"
          onClick={() => this.handleImportPrice()}
          disabled={!(itemId && supplierCompanyId)}
        >
          {intl.get('smpc.product.button.importPrice').d('引用价格')}
        </Button>
      </Tooltip>,
      <BatchBtn
        icon="delete_sweep"
        dataSet={tableDs}
        path={path}
        dynamicDisbale={(data) => {
          return data.length === 0;
        }}
        onClick={this.handleDelete}
      >
        {intl.get('smpc.product.button.batchDelete').d('批量删除')}
      </BatchBtn>,
      // <BatchBtn dataSet={tableDs} icon="close" disabled={noEdit} onClick={this.handleUnShelf}>
      //   {intl.get('smpc.product.view.invalid').d('失效')}
      // </BatchBtn>,
      // <BatchBtn dataSet={tableDs} icon="check" disabled={noEdit} onClick={this.handleUnShelf}>
      //   {intl.get('smpc.product.view.effect').d('生效')}
      // </BatchBtn>,
    ];
    return remote.process('PRICE_INFO_BTNS', btns, {
      isSup,
      tableDs,
    });
  };

  render() {
    const { tableDs, noEdit, isEdit } = this.props;
    const { customizeTable } = customStore.getCustFuncs();
    const isReceive = customStore.getState('isReceive');
    // 平台价格不可编辑
    const columns = this.getColumns();
    if (tableDs && isReceive) {
      tableDs.selection = false;
    }
    return (
      <div className={styles['sale-info']}>
        {noEdit && (
          <Info
            style={{ marginBottom: 16 }}
            message={intl
              .get('smpc.product.view.auth.priceInfo')
              .d('根据采购方业务配置，不支持供应商新建/编辑价格信息相关内容')}
          />
        )}
        {tableDs &&
          customizeTable(
            {
              code: customStore.getCustomCode('SALE_INFO'),
            },
            <Table
              buttons={noEdit || isReceive || !isEdit ? [] : this.getButtons()}
              dataSet={tableDs}
              columns={columns}
              style={{ maxHeight: `calc(100vh - ${noEdit || isReceive || !isEdit ? 170 : 200}px)` }}
              onRow={({ record }) => {
                return {
                  style: record.get('repeatError') ? { backgroundColor: '#FEF4F2' } : {},
                };
              }}
            />
          )}
      </div>
    );
  }
}
