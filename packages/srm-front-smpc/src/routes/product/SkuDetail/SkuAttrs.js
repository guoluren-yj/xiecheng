import React, { useMemo, useEffect } from 'react';
// import { Tag } from 'choerodon-ui';
import { DataSet } from 'choerodon-ui/pro';
import { isArray } from 'lodash';

import intl from 'utils/intl';
import Card from './Card';
import FormPro from './FormPro';
import renderCompare from './renderCompare';
import customStore from './customStore';

export default function SkuAttr(props) {
  const baseAttrDs = useMemo(
    () =>
      new DataSet({
        fields: [
          {
            name: 'brandName',
            label: intl.get('smpc.product.view.brand').d('品牌'),
          },
          {
            name: 'model',
            label: intl.get('smpc.product.view.model').d('型号'),
          },
          {
            name: 'packingList',
            label: intl.get('smpc.product.view.packingList').d('包装规格（清单）'),
          },
        ],
      }),
    []
  );
  const { customizeForm } = customStore.getCustFuncs();
  const { id, title, skuDs, keyList, specsData, isHistory, showHistory, attrIdList } = props;
  const { skuAttrList = [], skuAttrExtendList = [], brandName, model, packingList } = skuDs?.current
    ? skuDs.current.toData()
    : {};

  // 判断属性是否为销售属性：品牌、型号
  function baseIsSale(attributeCode) {
    const list = skuAttrList || [];
    return list.some((s) => s.attributeCode === attributeCode && s.attrType === 1);
  }

  useEffect(() => {
    baseAttrDs.create({ brandName, model, packingList });
  }, [brandName, model, packingList]);

  const fieldsRenderer = ({ value, name, _keyList = attrIdList }) =>
    renderCompare({ value, name, isHistory, showHistory, keyList: _keyList });

  const attrMap = [
    {
      attrType: 2,
      title: intl.get('smpc.product.view.baseInfoAttr').d('基本属性'),
    },
    { attrType: 3, title: intl.get('smpc.product.view.specAttr').d('规格属性') },
    { attrType: 1, title: intl.get('smpc.product.view.saleAttr').d('销售属性') },
  ];

  const uniqueValue = (value, code, name) => {
    switch (code) {
      case '000000000008': // 税率
        return fieldsRenderer({ name, value: value ? `${value}%` : '' });
      case '000000000006': // 重量
        return fieldsRenderer({ name, value: value ? value.split(',').join('') : '' });
      case '000000000007': // 包装尺寸
        return fieldsRenderer({ name, value: value ? `${value.split(',').join(' x ')} mm` : '' });
      default:
        return fieldsRenderer({ name, value });
    }
  };

  const multiValue = (values = []) => {
    return (
      <div style={{ color: '#333333' }}>
        {/* {values.map((i) => {
          return (
            <Tag color="rgba(0,0,0,0.08)" style={{ color: '#333333', marginRight: 4 }}>
              {i || ''}
            </Tag>
          );
        })} */}
        {values.join(',')}
      </div>
    );
  };

  const valueRender = (attr) => {
    const { attrId, attrName, attrValue, attrValues, attributeCode, operationType } = attr;
    const name = attrId || attrName;
    if (operationType === 0 && isArray(attrValues)) {
      return multiValue(attrValues);
    }
    const value = attrValue || attrValues?.attrValueName || attrValues?.description;
    return uniqueValue(value, attributeCode, name);
  };

  const getFields = (attrType) => {
    const attrs = [];
    (specsData || []).forEach((f) => {
      const attr = (skuAttrList || []).filter((v) => v.attrId === f.attrId);
      const _attrType = (attr[0] || {}).attrType || (f.baseAttrFlag ? 2 : 0);
      if (_attrType === attrType) {
        const attrValues =
          attrType !== 1 && f.operationType === 0
            ? attr.map((i) => i.attrValueName || i.description)
            : attr[0] || {};
        attrs.push({ ...f, attrValues });
      }
    });
    if (skuAttrExtendList) {
      skuAttrExtendList.forEach((f) => {
        if (f.attrType === attrType) {
          attrs.push(f);
        }
      });
    }
    const baseFields = attrs.map((attr) => {
      const { attrId, attrName, attributeName, attributeCode } = attr;
      return {
        name: attrId || attrName,
        key: attrId || attrName,
        label: attrName || attributeName,
        show: ['000000000001', '000000000002'].includes(attributeCode)
          ? baseIsSale(attributeCode)
          : true,
        renderer: () => valueRender(attr),
      };
    });
    const baseIsUpdate = (attrIdList || []).some((s) => baseFields.some((f) => f.key === s));
    if (attrType === 2) {
      const fields = [
        {
          name: 'brandName',
          show: !baseIsSale('000000000001'),
          // label: intl.get('smpc.product.view.brand').d('品牌'),
          renderer: ({ value, name }) => fieldsRenderer({ value, name, _keyList: keyList }),
        },
        {
          name: 'model',
          show: !baseIsSale('000000000002'),
          // label: intl.get('smpc.product.view.model').d('型号'),
          renderer: ({ value, name }) => fieldsRenderer({ value, name, _keyList: keyList }),
        },
        {
          name: 'packingList',
          // label: intl.get('smpc.product.view.packingList').d('包装规格（清单）'),
          renderer: ({ value, name }) => fieldsRenderer({ value, name, _keyList: keyList }),
        },
      ].concat(baseFields);
      const customAttrIsUpdate = keyList?.some((s) => fields.some((f) => f.name === s));
      return [fields, baseIsUpdate || customAttrIsUpdate];
    }
    return [baseFields, baseIsUpdate];
  };

  return (
    <div className="sku-attrs-wrapper" id={id}>
      <div className="sku-card-title">{title}</div>
      {attrMap.map((m) => {
        const [fields, isUpdate] = getFields(m.attrType);
        return (
          <Card
            title={m.title}
            key={m.attrType}
            dot={
              showHistory && !isHistory && isUpdate
                ? intl.get('smpc.product.view.hasInfoChange').d('有信息更新')
                : ''
            }
          >
            {fields.length > 0 ? (
              <FormPro
                style={{ marginLeft: -8 }}
                readOnly
                dataSet={m.attrType === 2 ? baseAttrDs : undefined}
                fields={fields}
                columns={3}
                customizeForm={m.attrType === 2 ? customizeForm : undefined}
                customizeCode={customStore.getCustomCode('SKU_ATTR')}
              />
            ) : (
              <div className="sku-attrs-none" style={{ marginLeft: -8 }}>
                {intl.get('smpc.product.view.noAttrF').d('暂无属性')}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
