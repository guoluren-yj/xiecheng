import React, { useMemo, useEffect, useState } from 'react';
import { Collapse } from 'choerodon-ui';
import { DataSet } from 'choerodon-ui/pro';
import { isArray } from 'lodash';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { Content } from 'components/Page';
import FormPro from '../SkuDetail/FormPro';
import { renderFlowCompare } from '../SkuDetail/renderCompare';

import { fetchTypeSpecs } from '../SkuCreate/api';

const { Panel } = Collapse;

export default function SkuAttr(props) {
  const { title, sku, keyList = [], attrIdList = [] } = props;
  const {
    skuAttrList = [],
    skuAttrExtendList = [],
    brandName,
    model,
    packingList,
    categoryId,
    sourceFrom = 'CATA',
  } = sku || {};
  const [specsData, setSpecData] = useState([]);

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
        ],
      }),
    []
  );

  useEffect(() => {
    if (sourceFrom === 'CATA') {
      baseAttrDs.create({ brandName, model, packingList });
    }
  }, [brandName, model, packingList, sourceFrom]);

  useEffect(() => {
    if (categoryId && sourceFrom === 'CATA') {
      fetchSpecsData();
    }
  }, [categoryId, sourceFrom]);

  async function fetchSpecsData() {
    const data = getResponse(await fetchTypeSpecs({ categoryId })) || [];
    setSpecData(data);
  }

  // 判断属性是否为销售属性：品牌、型号
  function baseIsSale(attributeCode) {
    const list = skuAttrList || [];
    return list.some((s) => s.attributeCode === attributeCode && s.attrType === 1);
  }

  const fieldsRenderer = ({ value, name }) => {
    return renderFlowCompare({
      value,
      name,
    });
  };

  const attrMap = [
    {
      attrType: 2,
      title: intl.get('smpc.product.view.baseInfoAttr').d('基本属性'),
      attrKey: 'baseAttr',
    },
    {
      attrType: 1,
      title: intl.get('smpc.product.view.saleAttr').d('销售属性'),
      attrKey: 'saleAttr',
    },
    {
      attrType: 3,
      title: intl.get('smpc.product.view.specAttr').d('规格属性'),
      attrKey: 'specAttr',
    },
  ];

  const ecAttrMap = [
    {
      attrType: 2,
      attrKey: 'baseAttr',
    },
  ];

  const newAttrMap = sourceFrom !== 'CATA' ? ecAttrMap : attrMap;

  const getCustomValue = (code, value) => {
    if (!value) return '';
    switch (code) {
      case '000000000008':
        return `${value}%`;
      case '000000000006':
        return value.split(',').join('');
      case '000000000007':
        return `${value.split(',').join(' x ')} mm`;
      default:
        return value;
    }
  };

  const uniqueValue = (value, oldValue, code, name) => {
    return fieldsRenderer({
      name,
      value: getCustomValue(code, value),
      oldValue: getCustomValue(code, oldValue),
    });
  };

  const getAttrValue = (attr = {}) => {
    const { attrValue, attrValues, operationType } = attr;
    // 规格属性有多选
    if (operationType === 0 && isArray(attrValues)) {
      return attrValues.join(',');
    }
    const value = attrValue || attrValues?.attrValueName || attrValues?.description;
    return value;
  };

  const valueRender = (attr, oldAttrs) => {
    const { attrId, attrName, attributeCode } = attr;
    const name = attrId || attrName;
    const oldAttr = oldAttrs.find((a) => (a.attrId || a.attrName) === name) || {};
    const value = getAttrValue(attr);
    const oldValue = getAttrValue(oldAttr);
    return uniqueValue(value, oldValue, attributeCode, name);
  };

  const getAttrs = (attrType, _skuAttrList, _skuAttrExtendList) => {
    const attrs = [];
    (specsData || []).forEach((f) => {
      const attr = (_skuAttrList || []).filter((v) => v.attrId === f.attrId);
      const _attrType = (attr[0] || {}).attrType || (f.baseAttrFlag ? 2 : 0);
      if (_attrType === attrType) {
        const attrValues =
          attrType !== 1 && f.operationType === 0
            ? attr.map((i) => i.attrValueName || i.description)
            : attr[0] || {};
        attrs.push({ ...f, attrValues });
      }
    });
    if (_skuAttrExtendList) {
      _skuAttrExtendList.forEach((f) => {
        if (f.attrType === attrType) {
          attrs.push(f);
        }
      });
    }
    return attrs;
  };

  const getEcFields = () => {
    const fields = [...(skuAttrList || []), ...(skuAttrExtendList || [])];
    const attrData = {};
    fields.forEach((attr) => {
      const { attrCode, attrName, attrValueName, attrValue, description } = attr;
      attrData[attrCode || attrName] = attrValueName || description || attrValue;
      baseAttrDs.addField(attrCode || attrName, { label: attrName });
    });
    baseAttrDs.loadData([attrData], 1, false);
    return fields.map((attr) => ({
      name: attr.attrCode || attr.attrName,
      key: attr.attrId || attr.attrName,
    }));
  };

  const getFields = (attrType) => {
    if (sourceFrom !== 'CATA') {
      return [getEcFields()];
    }
    const attrs = getAttrs(attrType, skuAttrList, skuAttrExtendList);
    const oldAttrs = [];
    const baseFields = attrs.map((attr) => {
      const { attrId, attrName, attributeName, attributeCode } = attr;
      return {
        name: attrId || attrName,
        key: attrId || attrName,
        label: attrName || attributeName,
        show: ['000000000001', '000000000002'].includes(attributeCode)
          ? baseIsSale(attributeCode)
          : true,
        renderer: () => valueRender(attr, oldAttrs),
      };
    });
    const baseIsUpdate = (attrIdList || []).some((s) => baseFields.some((f) => f.key === s));
    if (attrType === 2) {
      const fields = [
        {
          name: 'brandName',
          show: !baseIsSale('000000000001'),
          // label: intl.get('smpc.product.view.brand').d('品牌'),
          renderer: ({ value, name }) =>
            fieldsRenderer({
              value,
              name,
              _keyList: keyList,
            }),
        },
        {
          name: 'model',
          show: !baseIsSale('000000000002'),
          // label: intl.get('smpc.product.view.model').d('型号'),
          renderer: ({ value, name }) =>
            fieldsRenderer({
              value,
              name,
              _keyList: keyList,
            }),
        },
      ].concat(baseFields);
      const customAttrIsUpdate = keyList?.some((s) => fields.some((f) => f.name === s));
      return [fields, baseIsUpdate || customAttrIsUpdate];
    }
    return [baseFields, baseIsUpdate];
  };

  return (
    <Content>
      <div className="sku-attrs-wrapper">
        <Collapse
          bordered={false}
          expandIconPosition="text-right"
          defaultActiveKey={newAttrMap.map((m) => m.attrKey)}
        >
          {newAttrMap.map((m) => {
            const [fields] = getFields(m.attrType);
            return (
              <Panel
                header={
                  <span className="part-title">{title + (m.title ? `-${m.title}` : '')}</span>
                }
                key={m.attrKey}
              >
                {fields.length > 0 ? (
                  <FormPro
                    readOnly
                    dataSet={m.attrType === 2 ? baseAttrDs : undefined}
                    fields={fields}
                    columns={3}
                  />
                ) : (
                  <div className="sku-attrs-none">
                    {intl.get('smpc.product.view.noAttrF').d('暂无属性')}
                  </div>
                )}
              </Panel>
            );
          })}
        </Collapse>
      </div>
    </Content>
  );
}
