import React, { useMemo, useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Icon, Alert } from 'choerodon-ui';
import BigNumber from 'bignumber.js';
import {
  DataSet,
  Modal,
  TextField,
  Form,
  Lov,
  DatePicker,
  Output,
  Select,
  TextArea,
  NumberField,
  Tooltip,
} from 'choerodon-ui/pro';

import intl from 'utils/intl';
// import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { checkPermission } from 'services/api';
import PopoverField from '@/components/PopoverField';
import { openUnitTree, openRegionTree } from '@/utils/tree';
import { getCustDimColumns, withCustomDimension } from '@/utils/customDimension';
import { caculateNoTaxPrice, caculateTaxPrice } from '../utils';
import { skuInfoDs, saleInfoDs } from './ds';
import openLadderPrice from './ladderPrice';
import { PrecisionField } from '../../utilsApi/precision';
import { NewLabelSelect, getLabelOptions, getOptionDisabled } from './label';
import styles from './style.less';

const modalProps = {
  movable: false,
  closable: true,
  mask: true,
  maskClosable: false,
  destroyOnClose: true,
  drawer: true,
  okText: intl.get('hzero.common.button.save').d('保存'),
};

const PRICEINFO_PERMISSION_CODE = 'smpc.sku-workbench-pur.create.button.priceinfo';

const unitCode = [
  'SMPC.WORKBENCH_PUR.EDIT_BATCH.MAPPING_INFO', // 0
  'SMPC.WORKBENCH_SUP.EDIT_BATCH.MAPPING_INFO', // 1
  'SMPC.WORKBENCH_PUR.EDIT_BATCH.OTHER_INFO', // 2
  'SMPC.WORKBENCH_SUP.EDIT_BATCH.OTHER_INFO', // 3
  'SMPC.WORKBENCH_PUR.EDIT_BATCH.PRICE_INFO', // 4
  'SMPC.WORKBENCH_SUP.EDIT_BATCH.PRICE_INFO', // 5
  'SMPC.WORKBENCH_PUR.EDIT_BATCH.ADD.PRICE_INFO', // 6
  'SMPC.WORKBENCH_SUP.EDIT_BATCH.ADD.PRICE_INFO', // 7
];

const Card = (props) => {
  const { title, children, extra } = props;
  return (
    <div className={styles['sku-card-container']}>
      <div className="sku-card-head">
        <span className="sku-card-title">{title}</span>
        {extra && <span className="sku-card-extra">{extra}</span>}
      </div>
      <div className="sku-card-body">{children}</div>
    </div>
  );
};

/**
 * 根据税率和未税单价计算含税单价
 */
function handleUnitPriceToTaxPrice(val, record, precision) {
  const _tax = new BigNumber(record.get('tax')) || 0;
  const _value = new BigNumber(val) || 0;
  const taxPrice = caculateTaxPrice(_value, _tax, precision);
  record.set('agreementTaxedPrice', taxPrice);
}

/**
 * 根据税率和含税单价计算未税单价
 */
function handleTaxPriceToUnitPrice(val, record, precision) {
  const _tax = new BigNumber(record.get('tax')) || 0;
  const _value = new BigNumber(val) || 0;
  const unitPrice = caculateNoTaxPrice(_value, _tax, precision);
  record.set('agreementPrice', unitPrice);
}

function ladderChange(record, ladders) {
  const firstLadder = (ladders || [])[0];
  if (record.get('priceType') === 'LADDER_PRICE' && firstLadder) {
    record.set('agreementPrice', firstLadder.unitPrice);
    record.set('agreementTaxedPrice', firstLadder.taxPrice);
  }
}

function getSaleFields({ record, editMode, custDimFields = [] }) {
  const { uomPrecision, defaultPrecision } = record.get(['uomPrecision', 'defaultPrecision']);
  const dimFields = custDimFields.map((m) => ({
    ...m,
    Field: m.FormField,
    fieldProps: { colSpan: 2, ...(m.fieldProps || {}) },
  }));

  const batchPriceField = {
    name: 'priceBatchQuantity',
    Field: NumberField,
    fieldProps: {
      colSpan: 2,
    },
  };

  const fields = [
    {
      name: 'uomLov',
      Field: Lov,
      fieldProps: { colSpan: 2, clearButton: false },
      show: editMode !== 'update',
    },
    {
      name: 'currencyLov',
      Field: Lov,
      fieldProps: {
        colSpan: 2,
        clearButton: false,
        onChange: (item) => {
          const { defaultPrecision: precision } = item || {};
          const tax = record.get('tax');
          const skuSalesLadders = record.get('skuSalesLadders') || [];
          if (precision >= 0 && skuSalesLadders.length > 0) {
            const newList = skuSalesLadders.map((m) => {
              const ladderTaxPrice = caculateTaxPrice(m.unitPrice || 0, tax || 0, precision);
              return { ...m, taxPrice: ladderTaxPrice };
            });
            record.set('skuSalesLadders', newList);
            ladderChange(record, newList);
          }
        },
      },
      show: editMode !== 'update',
    },
    {
      name: 'taxLov',
      Field: Lov,
      fieldProps: {
        colSpan: 2,
        searchable: false,
        clearButton: false,
        onChange: (lovRecord) => {
          const item = lovRecord || {};
          const unitPrice = record.get('agreementPrice') || 0;
          const taxPrice = record.get('agreementTaxedPrice') || 0;
          if (unitPrice) {
            handleUnitPriceToTaxPrice(unitPrice, record);
          } else if (taxPrice) {
            handleTaxPriceToUnitPrice(taxPrice, record, defaultPrecision);
          }
          const skuSalesLadders = record.get('skuSalesLadders');
          if (skuSalesLadders && skuSalesLadders.length > 0 && item.taxRate) {
            const newList = skuSalesLadders.map((m) => {
              const ladderTaxPrice = caculateTaxPrice(m.unitPrice || 0, item.taxRate || 0, record);
              return { ...m, taxPrice: ladderTaxPrice };
            });
            record.set('skuSalesLadders', newList);
            ladderChange(record, newList);
          }
        },
      },
      show: editMode !== 'update',
    },
    {
      name: 'priceType',
      Field: Select,
      fieldProps: { colSpan: 2 },
      show: editMode !== 'update',
    },
    {
      name: 'skuSalesLadders',
      Field: Output,
      show: record.get('priceType') === 'LADDER_PRICE',
      fieldProps: {
        colSpan: 2,
        renderer: () => (
          <a
            onClick={() =>
              openLadderPrice({
                tax: record.get('tax'),
                data: record.get('skuSalesLadders'),
                uomPrecision,
                defaultPrecision,
                title: intl.get('smpc.product.model.matainLadderPrice').d('维护阶梯价格'),
                onSave: (ladders) => {
                  record.set('skuSalesLadders', ladders);
                  ladderChange(record, ladders);
                },
              })
            }
          >
            <Icon type="mode_edit" style={{ fontSize: '14px', margin: '0 4px 4px 0' }} />
            {intl.get('smpc.product.model.matainLadderPrice').d('维护阶梯价格')}
          </a>
        ),
      },
    },
    {
      name: 'agreementTaxedPrice',
      Field: PrecisionField,
      show: editMode !== 'update',
      fieldProps: {
        colSpan: 2,
        record,
        type: 'currency',
        precision: defaultPrecision,
        onChange: (val) => handleTaxPriceToUnitPrice(val, record, defaultPrecision),
      },
    },
    {
      name: 'agreementPrice',
      Field: PrecisionField,
      show: editMode !== 'update',
      fieldProps: {
        colSpan: 2,
        record,
        type: 'currency',
        precision: defaultPrecision,
        onChange: (val) => handleUnitPriceToTaxPrice(val, record, defaultPrecision),
      },
    },
    // {
    //   name: 'freeShippingFlag',
    //   Field: Select,
    //   fieldProps: { clearButton: editMode !== 'update' },
    // },
    {
      name: 'freightLov',
      Field: Lov,
    },
    {
      name: 'installLov',
      Field: Lov,
    },
    {
      name: 'validDateFrom',
      Field: DatePicker,
    },
    {
      name: 'validDateTo',
      Field: DatePicker,
    },
    {
      name: 'orderQuantity',
      Field: PrecisionField,
      fieldProps: { record, precision: uomPrecision },
    },
    {
      name: 'minPackageQuantity',
      Field: PrecisionField,
      fieldProps: { record, precision: uomPrecision },
    },
    {
      name: 'skuSalesRegions',
      Field: Lov,
      fieldProps: {
        colSpan: 2,
        onClick: () => openRegionTree({ record, name: 'skuSalesRegions' }),
      },
    },
    {
      name: 'skuSalesUnits',
      Field: Lov,
      fieldProps: {
        colSpan: 2,
        onClick: () => openUnitTree({ record, name: 'skuSalesUnits' }),
      },
    },
    {
      name: 'priceSourceFromNum',
    },
    {
      name: 'priceSourceFromLnNum',
    },
    {
      name: 'deliveryDay',
      Field: NumberField,
    },
    {
      name: 'guaranteeDay',
      Field: NumberField,
    },
    {
      name: 'remark',
      Field: TextArea,
      fieldProps: { colSpan: 2, resize: 'vertical' },
    },
  ];
  const batchPriceInsertIdx =
    editMode === 'create'
      ? fields.findIndex((f) => f.name === 'agreementPrice') + 1
      : fields.findIndex((f) => f.name === 'freightLov');
  fields.splice(batchPriceInsertIdx, 0, batchPriceField);
  const insertIndex =
    editMode === 'create' ? fields.findIndex((f) => f.name === 'skuSalesUnits') + 1 : fields.length;
  fields.splice(insertIndex, 0, ...dimFields);
  return fields.filter((f) => f.show || !('show' in f));
}

const PriceInfo = withCustomDimension(true)(
  observer((props) => {
    const [editMode, setEditMode] = useState('update');
    const {
      updateSaleDs,
      createSaleDs,
      onChangeMode = (e) => e,
      customizeForm,
      customizeCode,
      addCustomizeCode,
      custDimensions,
    } = props;
    const extra = (
      <PopoverField
        type="select"
        defaultValue="update"
        clearButton={false}
        onChange={(val) => {
          setEditMode(val);
          onChangeMode(val);
        }}
        label={intl.get('smpc.product.view.editMode').d('编辑方式')}
        options={[
          { meaning: intl.get('smpc.product.model.add').d('新增'), value: 'create' },
          { meaning: intl.get('smpc.product.model.update').d('修改'), value: 'update' },
        ]}
      />
    );

    const getForm = (dataSet) => {
      const custDimFields = getCustDimColumns(dataSet, custDimensions, {
        sort: 15,
        formField: true,
        valueAllFlag: editMode === 'create',
      });
      return (
        <Form dataSet={dataSet} labelLayout="float" columns={2}>
          {getSaleFields({ record: dataSet.current, editMode, custDimFields }).map((m) => {
            const { name, fieldProps = {}, Field = TextField } = m;
            return <Field name={name} {...fieldProps} />;
          })}
        </Form>
      );
    };
    return (
      <Card title={intl.get('smpc.product.view.priceInfo').d('价格信息')} extra={extra}>
        {editMode === 'update' && (
          <Alert
            className={styles['update-price-alert']}
            type="warning"
            message={intl
              .get('smpc.product.view.message.updatePriceInfo')
              .d('商品存在的价格信息将会被修改')}
            showIcon
            iconType="info"
            style={{ border: 'none', color: '#fca000', marginBottom: 16 }}
          />
        )}
        {editMode === 'update'
          ? customizeForm({ code: customizeCode }, getForm(updateSaleDs))
          : customizeForm({ code: addCustomizeCode }, getForm(createSaleDs))}
      </Card>
    );
  })
);

const permissions = {};

const BatchContent = withCustomize({ unitCode })((props) => {
  const {
    skuDs,
    updateSaleDs,
    createSaleDs,
    onChangeMode,
    isSup,
    supplier,
    multipleSupplier,
    multipleSuppliers,
    saleInfoFlag,
    customizeForm,
  } = props;

  const [priceEditPermission, setPermission] = useState(permissions[PRICEINFO_PERMISSION_CODE]);

  async function getSalePermission() {
    const res = getResponse(await checkPermission([PRICEINFO_PERMISSION_CODE]));
    if (res) {
      const { approve } = res[0];
      permissions[PRICEINFO_PERMISSION_CODE] = approve;
      setPermission(approve);
    }
  }

  useEffect(() => {
    if (!isSup && !(PRICEINFO_PERMISSION_CODE in permissions)) {
      getSalePermission();
    }
  }, []);

  const labelOptions = useMemo(() => getLabelOptions(supplier), []);

  return (
    <div className={styles['batch-sku-container']}>
      <Card title={intl.get('smpc.product.view.mappingInfo').d('映射信息')}>
        {customizeForm(
          { code: unitCode[isSup ? 1 : 0] },
          <Form dataSet={skuDs} labelLayout="float">
            <Lov name="catalogLov" />
            {!isSup && <Lov name="itemLov" />}
            {!isSup && <TextField name="itemName" />}
            {!isSup && <Lov name="itemCategoryLov" tableProps={{ selectionMode: 'rowbox' }} />}
          </Form>
        )}
      </Card>
      <Card title={intl.get('smpc.product.view.stockInfo').d('库存信息')}>
        <Form dataSet={skuDs} labelLayout="float" columns={2}>
          <Select name="stockOpt" clearButton={false} />
          <NumberField name="replenishmentStock" step={1} />
          <NumberField name="warningStock" step={1} colSpan={2} />
        </Form>
      </Card>
      <Card title={intl.get('smpc.product.model.otherInfo').d('其他信息')}>
        {customizeForm(
          { code: unitCode[isSup ? 3 : 2] },
          <Form dataSet={skuDs} labelLayout="float" columns={2}>
            <NewLabelSelect
              name="labels"
              colSpan={2}
              isSup={isSup}
              supplier={supplier}
              multipleSupplier={multipleSupplier}
              multipleSuppliers={multipleSuppliers}
              options={labelOptions}
              onOption={({ record }) => {
                return { disabled: getOptionDisabled(multipleSuppliers, record) };
              }}
            />
            {!isSup && [
              <NumberField
                step={1}
                colSpan={2}
                name="weightScore"
                placeholder={intl.get('smpc.product.modal.weightScore').d('权重分')}
                addonAfter={
                  <Tooltip
                    title={intl
                      .get('smpc.product.view.message.weightScore')
                      .d('权重分越高的商品在主站搜索排序中越靠前')}
                    placement="top"
                  >
                    <Icon type="help" style={{ fontSize: '14px' }} />
                  </Tooltip>
                }
              />,
              <Select name="newCustomFlag" />,
              <Select name="customTemplateCode" />,
            ]}
            <TextArea name="shelfRemark" resize="vertical" colSpan={2} />
          </Form>
        )}
      </Card>
      {!saleInfoFlag && (isSup || priceEditPermission) && (
        <PriceInfo
          updateSaleDs={updateSaleDs}
          createSaleDs={createSaleDs}
          onChangeMode={onChangeMode}
          customizeForm={customizeForm}
          customizeCode={unitCode[isSup ? 5 : 4]}
          addCustomizeCode={unitCode[isSup ? 7 : 6]}
        />
      )}
    </div>
  );
});

// 批量维护
export default async function openBatchSku({
  isSup,
  suppIds,
  // precision,
  approveType,
  supplier,
  multipleSupplier,
  multipleSuppliers,
  onSave = (e) => e,
}) {
  const skuDs = new DataSet(skuInfoDs());
  const supplierTenantId = [...new Set(suppIds)].length < 2 ? suppIds[0] : undefined;
  const updateSaleDs = new DataSet(saleInfoDs(supplierTenantId));
  const createSaleDs = new DataSet(saleInfoDs(supplierTenantId));
  updateSaleDs.create({ updateFlag: 1, editMode: 'update' });
  createSaleDs.create({
    allUnitFlag: 1,
    allRegionFlag: 1,
    orderQuantity: 1,
    minPackageQuantity: 1,
    shippingRuleId: -1,
    updateFlag: 1,
    editMode: 'create',
  });

  const filterInfos = approveType || [];

  const saleInfoFlag = filterInfos.includes('SALE_INFO');

  let editMode = 'update';

  const contentProps = {
    skuDs,
    updateSaleDs,
    createSaleDs,
    isSup,
    supplier,
    multipleSupplier,
    multipleSuppliers,
    saleInfoFlag,
    onChangeMode: (mode) => {
      editMode = mode;
    },
  };

  Modal.open({
    title: intl.get('smpc.product.model.batchMatain').d('批量维护'),
    ...modalProps,
    key: 'smpcBatchEdit',
    style: { width: 380 },
    onOk: async () => {
      const saleDs = editMode === 'update' ? updateSaleDs : createSaleDs;
      const valid = await skuDs.validate();
      const saleFlag = await saleDs.validate();
      if (!valid || !saleFlag) return false;
      let isBatchSku = false;
      skuDs.forEach((f) => {
        if (f.dirty) {
          f.set('updateFlag', 1);
          isBatchSku = true;
        }
      });
      let isBatchSale = false;
      saleDs.forEach((f) => {
        if (f.dirty) isBatchSale = true;
      });
      if (!isBatchSku && !isBatchSale) return true;
      const infos = skuDs.toJSONData();
      if (!isBatchSale) {
        infos[0].salesInfoInsertFlag = null; // 没有价格信息将这个字段置为null
        return onSave(infos[0]);
      } else {
        infos[0].salesInfoInsertFlag = editMode === 'update' ? 0 : 1; // 修改为0，新增为1
        const saleInfos = saleDs.toJSONData();
        const {
          allUnitFlag,
          allRegionFlag,
          skuSalesUnits,
          skuSalesRegions,
          shippingRuleId,
        } = saleInfos[0];
        const saleInfo = {
          ...saleInfos[0],
          skuSalesUnits: allUnitFlag || skuSalesUnits.length < 1 ? undefined : skuSalesUnits,
          skuSalesRegions:
            allRegionFlag || skuSalesRegions.length < 1 ? undefined : skuSalesRegions,
          freeShippingFlag: shippingRuleId === -1 ? 1 : 0,
        };
        return onSave(infos[0], saleInfo);
      }
    },
    children: <BatchContent {...contentProps} />,
  });
}
