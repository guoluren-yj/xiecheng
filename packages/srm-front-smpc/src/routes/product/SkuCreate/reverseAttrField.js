import { isNumber } from 'lodash';

// customAttrId, customAttrValueId,作为自定义属性的锚

// 后端字段转换前端统一字段
const getAttrFields = (attr) => {
  if (attr.attributeCode && attr.attrValueCode) {
    return attr;
  } else if (attr.attributeCode && !attr.attrValueCode) {
    return {
      ...attr,
      attrValueId: attr.description,
      attrValueName: attr.description,
    };
  } else {
    return {
      ...attr,
      attrId: attr.attrName,
      attributeName: attr.attrName,
      attrValueId: attr.attrValue,
      attrValueName: attr.attrValue,
      skuAttrId: attr.attrExtendId,
    };
  }
};

// 前端字段转换后端统一字段
const setAttrFields = (attr) => {
  const _attr = attr;
  delete _attr.attrLov;
  delete _attr.attrValLov;
  if (attr.attributeCode && attr.attrValueCode) {
    return attr;
  } else if (attr.attributeCode && !attr.attrValueCode) {
    return {
      ...attr,
      attrValueId: null,
      attrValueCode: null,
      attrValueName: null,
      description: attr.attrValueName || attr.description, // 自定义值
    };
  } else {
    return {
      attrType: attr.attrType,
      attrOrderSeq: attr.attrOrderSeq,
      valueOrderSeq: attr.valueOrderSeq,
      customAttrId: attr.customAttrId,
      customAttrValueId: attr.customAttrValueId,
      attrName: attr.attributeName || attr.attrName,
      attrValue: attr.attrValueName || attr.attrValue,
      attrExtendId: attr.attrExtendId || attr.skuAttrId,
    };
  }
};

// 合并已有属性、扩展属性
const contactAttrs = (hasAttrs, extendsAttrs) => {
  return [...(hasAttrs || []), ...(extendsAttrs || [])];
};

// 解离已有属性、扩展属性
const splitAttrs = (attrs) => {
  const hasAttrs = [];
  const extendsAttrs = [];
  (attrs || []).forEach((f) => {
    if (f.attributeCode) {
      hasAttrs.push(f);
    } else {
      extendsAttrs.push(f);
    }
  });
  return [hasAttrs, extendsAttrs];
};

const sortByOrderSeq = (list, orderSeqField = 'orderSeq') => {
  list.sort((next, current) => {
    const nOrder = next[orderSeqField];
    const cOrder = current[orderSeqField];
    if (!isNumber(nOrder) && !isNumber(cOrder)) {
      return 0;
    } else if (!isNumber(nOrder)) return 1;
    else if (!isNumber(cOrder)) return -1;
    // 升序
    else return nOrder - cOrder;
  });
  return list;
};

export { getAttrFields, setAttrFields, contactAttrs, splitAttrs, sortByOrderSeq };
