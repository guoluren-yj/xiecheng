import React, { useEffect, useState, useRef } from 'react';
import { Form, Select, Table, Spin, DataSet, Button } from 'choerodon-ui/pro';
// import { observer } from 'mobx-react-lite';

import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';

import Card from '../SkuCreate/Card';
import { saleSpecsFormDs } from '../SkuCreate/ds';
import SaleSpecsForm from '../SkuCreate/SkuInfo/SaleSpecsForm';
import { fetchTypeSpecs } from '../SkuCreate/api';
import { setAttrFields, contactAttrs, getAttrFields } from '../SkuCreate/reverseAttrField';
import { skuDs, composeDs } from './composeDs';
import { getComposeSpu } from './api';
import confirm from './confirm';

// // 重置属性
// const resetFields = {
//   attrType: 1,
//   attrValueId: undefined,
//   attrValueCode: undefined,
//   attrValueName: undefined,
//   description: undefined,
// };

// 自定义字段改变
const customFieldChange = (fieldRef, fieldProps = {}) => {
  const { name, ...others } = fieldProps;
  const field = fieldRef.getField(name);
  if (!field) {
    fieldRef.addField(name, {
      required: true,
      textField: 'attrValueName',
      valueField: 'attrValueId',
      type: 'object',
      ...others,
    });
  } else {
    field.set('required', true);
  }
};

// 根据销售规格获取自定义列
const getColumnsBySpecs = (ds, list) => {
  if (!ds || !list.length) {
    return [];
  }

  const columns = [];

  const handleChange = ({ record, spuAttr, value, oldValue }) => {
    const { attrId } = spuAttr;

    const allAttrs = [];
    let repeatFlag = false;
    ds.forEach((d) => {
      let allAttr = '';
      let allAttrFlag = true;
      columns.forEach((_f) => {
        if (d.get(_f.name)) {
          const { attrValueId } = d.get(_f.name);
          allAttr = `${allAttr}_${attrValueId}`;
        } else {
          allAttrFlag = false;
        }
      });
      if (allAttrFlag) {
        if (allAttrs.includes(allAttr)) {
          repeatFlag = true;
          return false;
        } else {
          allAttrs.push(allAttr);
        }
      }
    });
    // 如果重复 则将值还原为上次值
    if (repeatFlag) {
      notification.warning({
        message: intl.get('smpc.product.view.attrRepeatMsg').d('有相同属性值的SKU已存在'),
      });
      record.set(`spec_${attrId}`, oldValue);
      return false;
    } else {
      // const current = value || { ...resetFields };
      // const skuAttr = { ...spuAttr, ...current };
      // const changeAttrList = attrsKey => {
      //   const data = record.get(attrsKey) || [];
      //   const ind = data.findIndex(f => (f.attrId || f.attrName) === skuAttr.attrId);
      //   if (ind !== -1) {
      //     data[ind] = { ...data[ind], ...skuAttr, attrType: 1, skuAttrId: null };
      //   } else {
      //     data.push({ ...skuAttr, attrType: 1 });
      //   }
      //   record.set(attrsKey, data);
      // };
      // skuSpecsList
      // changeAttrList('skuSpecsList');
      record.set(`spec_${attrId}`, value);
    }
    // setSkuName(spuName, record, columns);
  };
  list.forEach((f) => {
    const { attrId, attributeName, skuAttrId, attrValLov = [] } = f;
    customFieldChange(ds, { label: attributeName, name: `spec_${attrId}` });
    ds.records.forEach((r) => {
      const { skuAttrList, skuAttrExtendList } = r.toJSONData();
      const attrList = contactAttrs(skuAttrList, skuAttrExtendList);
      // const defaultSku = skuAttrList.find( sku => sku.attrId === attrId);
      // const defaultField = defaultSku ? attrValLov.find(a => a.skuId === defaultSku.skuId) : undefined;
      const initAttrVal = attrValLov.find((_f) => {
        return attrList.some((s) => {
          const { attrValueId } = getAttrFields(s);
          return _f.attrValueId === attrValueId;
        });
      });
      r.init(`spec_${attrId}`, initAttrVal);
      customFieldChange(r, {
        label: attributeName,
        name: `spec_${attrId}`,
        dynamicProps: {
          disabled: ({ record }) => skuAttrId && record.get('skuId'),
        },
      });
    });
    if (!columns.some((s) => s.name === `spec_${attrId}`)) {
      columns.push({
        name: `spec_${attrId}`,
        width: 140,
        editor: (record) => {
          return (
            <Select
              record={record}
              options={new DataSet({ paging: false, data: attrValLov || [] })}
              onChange={(value, oldValue) => handleChange({ record, spuAttr: f, value, oldValue })}
            />
          );
        },
      });
    }
  });
  return columns;
};

// 获取销售规格
const getSpuAttrs = (list = []) => {
  const spuAttrList = [];
  const spuAttrExtendList = [];
  list.forEach((item) => {
    const { attrValLov, ...m } = item;
    (attrValLov || []).forEach((n) => {
      const attr = { ...setAttrFields({ ...m, ...n }), attrType: 1 };
      if (item.attributeCode) {
        spuAttrList.push(attr);
      } else {
        spuAttrExtendList.push(attr);
      }
    });
  });

  return [spuAttrList, spuAttrExtendList];
};

const getSkuAttrs = (sku, specs) => {
  const skuAttrList = [];
  const skuAttrExtendList = [];
  specs.forEach((item) => {
    const skuAttr = sku[`spec_${item.attrId}`];
    const finAttr = { ...setAttrFields({ ...item, ...skuAttr }), attrType: 1 };
    if (item.attributeCode) {
      skuAttrList.push(finAttr);
    } else {
      skuAttrExtendList.push(finAttr);
    }
  });
  return { ...sku, skuAttrList, skuAttrExtendList };
};

// spu销售属性
let specAttrs = [];

export default function SkuCompose(props) {
  const { skus, modal, showSuggestionText, afterSuccess = (e) => e } = props;
  const [{ categoryId }] = skus;
  const [loading, setLoading] = useState(false);
  const [specs, setSpecs] = useState([]);
  const [dynamicColumns, setDynamicColumns] = useState([]);
  const dsMap = useRef({
    formDs: new DataSet(composeDs()),
    skuTableDs: new DataSet(skuDs()),
    saleSpecsDs: new DataSet(saleSpecsFormDs(categoryId, specs)),
  });
  const { saleSpecsDs, skuTableDs, formDs } = dsMap.current;

  async function fetchSpecs() {
    setLoading(true);
    const res = getResponse(await fetchTypeSpecs({ categoryId }));
    setLoading(false);
    if (res) {
      // dsMap.current.saleSpecsDs = new DataSet(saleSpecsFormDs(categoryId, res));
      initSaleSpecsForm(res);
      setSpecs(res);
    }
  }

  function initSaleSpecsForm(specsArr) {
    const skuList = [];
    const list = [];
    dsMap.current.saleSpecsDs = new DataSet(saleSpecsFormDs(categoryId, specsArr));
    skus.forEach((sku) => {
      const { skuAttrList, skuAttrExtendList } = sku;
      const saleAttr = contactAttrs(skuAttrList, skuAttrExtendList).filter((f) => f.attrType === 1);
      skuList.push(...saleAttr);
    });
    skuList.forEach((_attr) => {
      const attr = getAttrFields(_attr);
      const find = list.find((f) => f.attrId === attr.attrId);
      if (find) {
        if (!find.attrValLov.some((f) => f.attrValueId === attr.attrValueId)) {
          find.attrValLov.push(attr);
        }
      } else {
        list.push({ ...attr, attrValLov: [attr] });
      }
    });
    list.forEach((attr) => {
      const findSpec = specs.find((f) => f.attrId === attr.attrId) || {};
      dsMap.current.saleSpecsDs.create({ ...findSpec, ...attr });
    });
  }

  function getColumns() {
    return [
      { name: 'displayOrderSeq', width: 70, align: 'left' },
      { name: 'skuCode', width: 120 },
      { name: 'skuName', minWidth: 120 },
      { name: 'itemCode', width: 120, renderer: ({ value }) => value || '-' },
      { name: 'itemName', minWidth: 120, renderer: ({ value }) => value || '-' },
      ...dynamicColumns,
    ];
  }

  async function handleRefreshSaleSpecs() {
    const flag = await saleSpecsDs.validate();
    if (flag) {
      const saleSpecs = saleSpecsDs.toJSONData();
      const saleCount = saleSpecs.reduce((count, attr) => count * attr.attrValLov.length, 1);
      if (saleCount < skus.length) {
        notification.warning({
          message: intl
            .get('smpc.product.view.message.saleSpecsCountNo')
            .d('您配置的销售规格不能完全覆盖将要组合的商品，请继续配置！'),
        });
        return false;
      }
      const saleSpecColumns = getColumnsBySpecs(skuTableDs, saleSpecs);
      specAttrs = saleSpecs;
      setDynamicColumns(saleSpecColumns);
    }
  }

  function handleDeleteSpec(record) {
    const attrId = record.get('attrId');
    const skuList = skuTableDs.toData();
    const isHas = skuList.some((s) => s[`spec_${attrId}`]);
    if (attrId && isHas) {
      notification.warning({
        message: intl.get('smpc.product.view.onlyDelNoVal').d('只能删除没有被SKU引用的销售规格'),
      });
      return false;
    } else {
      saleSpecsDs.remove(record);
      const field = skuTableDs.getField(`spec_${attrId}`);
      if (field) {
        field.set('required', false);
      }
      const saleSpecColumns = dynamicColumns.filter((f) => f.name !== `spec_${attrId}`);
      setDynamicColumns(saleSpecColumns);
    }
  }

  async function handleCompose() {
    const flag = await formDs.validate();
    const skuFlag = await skuTableDs.validate();
    if (flag && skuFlag) {
      confirm({
        title: intl.get('smpc.product.view.title.skuMerge').d('商品合并确认'),
        content: intl
          .get('smpc.product.view.message.skuMergeConfirm')
          .d('该操作将重新组合商品，是否确认继续操作？'),
        onOk: async () => {
          const mainSkuId = formDs.current.get('skuId');
          const skuList = skuTableDs.toJSONData();
          const [spuAttrList, spuAttrExtendList] = getSpuAttrs(specAttrs);
          const spu = {
            mainSkuId,
            spuAttrList,
            spuAttrExtendList,
            skuList: skuList.map((m) => getSkuAttrs(m, specAttrs)),
          };
          const res = getResponse(await getComposeSpu(spu));
          if (res) {
            notification.success();
            afterSuccess();
            modal.close();
          }
        },
      });
    }
    return false;
  }

  useEffect(() => {
    fetchSpecs();
    skus.forEach((f) => {
      skuTableDs.create({ ...f });
    });
    modal.handleOk(() => handleCompose());
  }, []);

  // 组合按钮点击状态
  useEffect(() => {
    const composeDisabled = dynamicColumns.length === 0;
    modal.update({ okProps: { disabled: composeDisabled } });
  }, [dynamicColumns]);

  return (
    <Spin spinning={loading}>
      <Card title={intl.get('smpc.product.view.title.choosePrimarySku').d('选择组合的主商品')}>
        <Form labelLayout="float" dataSet={formDs}>
          <Select
            name="skuId"
            clearButton={false}
            options={new DataSet({ paging: false, data: skus })}
          />
        </Form>
      </Card>
      <SaleSpecsForm
        showSuggestionText={showSuggestionText}
        isAddSpec
        addPlacement="right"
        tableDs={skuTableDs}
        dataSet={saleSpecsDs}
        deleteSpec={handleDeleteSpec}
      />
      <Card title={intl.get('smpc.product.view.title.assignSaleSpec').d('分配销售规格')}>
        <Table
          dataSet={skuTableDs}
          buttons={[
            <Button icon="replay" onClick={handleRefreshSaleSpecs}>
              {intl.get('smpc.product.view.button.refreshSaleSpecs').d('更新销售规格')}
            </Button>,
          ]}
          columns={getColumns()}
        />
      </Card>
    </Spin>
  );
}
