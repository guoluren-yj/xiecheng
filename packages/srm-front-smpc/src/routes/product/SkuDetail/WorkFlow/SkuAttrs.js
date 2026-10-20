import React, { useMemo, useEffect, useContext, useState, useRef } from 'react';
import { Collapse } from 'choerodon-ui';
import { DataSet } from 'choerodon-ui/pro';
import { isArray } from 'lodash';

import intl from 'utils/intl';
import { Content } from 'components/Page';
import Card from '../Card';
import FormPro from '../FormPro';
import { renderFlowCompare } from '../renderCompare';
import customStore from '../customStore';
import SkuContext from '../skuContext';

const { Panel } = Collapse;

export default function SkuAttr(props) {
  const { customizeForm } = customStore.getCustFuncs();
  const { title, skuDataSets, keyList = [], specsData, attrIdList, changeFlag } = props;
  const [skuDs] = skuDataSets;
  const { skuAttrList = [], skuAttrExtendList = [], brandName, model, packingList } = skuDs?.current
    ? skuDs.current.toData()
    : {};

  const { onlyShowUpdateItem } = useContext(SkuContext);
  const areNumRef = useRef(0);
  const [, refresh] = useState(false);

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

  useEffect(() => {
    baseAttrDs.create({ brandName, model, packingList });
  }, [brandName, model, packingList]);

  // 判断属性是否为销售属性：品牌、型号
  function baseIsSale(attributeCode) {
    const list = skuAttrList || [];
    return list.some((s) => s.attributeCode === attributeCode && s.attrType === 1);
  }

  const fieldsRenderer = ({
    value,
    name,
    _keyList = attrIdList,
    getLastVersionValue,
    oldValue,
  }) => {
    return renderFlowCompare({
      value,
      name,
      keyList: _keyList,
      getLastVersionValue: (() => {
        if (changeFlag) {
          return (
            getLastVersionValue ||
            (() => {
              if (_keyList.includes(name)) {
                return oldValue;
              }
            })
          );
        }
      })(),
    });
  };

  const attrMap = [
    { attrType: 2, title: intl.get('smpc.product.view.baseInfoAttr').d('基本属性') },
    { attrType: 1, title: intl.get('smpc.product.view.saleAttr').d('销售属性') },
    { attrType: 3, title: intl.get('smpc.product.view.specAttr').d('规格属性') },
  ];

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

  const getBaseAttrLastVersionValue = (name) => {
    const oldSkuInfo = skuDataSets?.[1]?.current;
    if (keyList.includes(name)) {
      return oldSkuInfo.get(name);
    }
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

  const filterFields = (fields = []) => {
    let _fields = fields;
    if (onlyShowUpdateItem) {
      _fields = fields.filter(
        (f) => keyList.concat(attrIdList).includes(f.name) && f.show !== false
      );
      if (!_fields.length) {
        areNumRef.current += 1;
        if (areNumRef.current === 3) {
          refresh((p) => !p);
        }
      }
      return _fields;
    } else {
      areNumRef.current = 0;
    }
    return _fields.filter((f) => f.show !== false);
  };

  const getFields = (attrType) => {
    const attrs = getAttrs(attrType, skuAttrList, skuAttrExtendList);
    let oldAttrs = [];
    if (changeFlag) {
      const oldSkuInfo = skuDataSets[1];
      const {
        skuAttrList: oldSku = [],
        skuAttrExtendList: oldSkuAttrExtend = [],
      } = oldSkuInfo?.current ? oldSkuInfo.current?.get(['skuAttrList', 'skuAttrExtendList']) : {};
      oldAttrs = getAttrs(attrType, oldSku, oldSkuAttrExtend);
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
              getLastVersionValue: () => getBaseAttrLastVersionValue(name),
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
              getLastVersionValue: () => getBaseAttrLastVersionValue(name),
            }),
        },
        {
          name: 'packingList',
          // label: intl.get('smpc.product.view.packingList').d('包装规格（清单）'),
          renderer: ({ value, name }) =>
            fieldsRenderer({
              value,
              name,
              _keyList: keyList,
              getLastVersionValue: () => getBaseAttrLastVersionValue(name),
            }),
        },
      ].concat(baseFields);
      const customAttrIsUpdate = keyList?.some((s) => fields.some((f) => f.name === s));
      return [filterFields(fields), baseIsUpdate || customAttrIsUpdate];
    }
    return [filterFields(baseFields), baseIsUpdate];
  };
  return areNumRef.current === 3 ? (
    ''
  ) : (
    <Content>
      <div className="sku-attrs-wrapper">
        <Collapse defaultActiveKey={['1']} bordered={false} expandIconPosition="text-right">
          <Panel header={title} key="1">
            {attrMap.map((m) => {
              const [fields] = getFields(m.attrType);
              // 无变更项隐藏
              return onlyShowUpdateItem && fields.length === 0 ? (
                ''
              ) : (
                <Card
                  title={m.title}
                  key={m.attrType}
                  // dot={
                  //   showHistory && !isHistory && isUpdate
                  //     ? intl.get('smpc.product.view.hasInfoChange').d('有信息更新')
                  //     : ''
                  // }
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
          </Panel>
        </Collapse>
      </div>
    </Content>
  );
}
