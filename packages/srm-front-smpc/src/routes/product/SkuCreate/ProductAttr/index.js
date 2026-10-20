import React, { Component } from 'react';
import { CheckBox, Form, TextField, Select } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { TopSection, SecondSection } from '_components/Section';

import BaseAttrs from './BaseAttrs';
import SpecAttrs from './SpecAttrs';
import customStore from '../customStore';

import styles from './index.less';

export default class ProductAttr extends Component {
  renderInputAttr = (item) => {
    const { attributeName, attrValueName, description, attrName, attrValue } = item;
    const label = attributeName || attrName;
    const value = attrValueName || description || attrValue;
    return <TextField label={label} value={value} disabled />;
  };

  attr = {
    brand: '000000000001',
    model: '000000000002',
    isBrand(attr) {
      return attr?.attributeCode === this?.brand;
    },
    isModel(attr) {
      return attr?.attributeCode === this?.model;
    },
  };

  render() {
    const {
      specAttrsDs,
      baseAttrsDs,
      customAttrDs,
      saleAttrRecords,
      allSkuDs,
      isReceive,
    } = this.props;
    const { customizeForm, getHocInstance } = customStore.getCustFuncs();

    const brandHidden = saleAttrRecords.some((s) => this.attr.isBrand(s));
    const modelHidden = saleAttrRecords.some((s) => this.attr.isModel(s));

    return (
      <div className={styles['production-wrap']}>
        <TopSection getHocInstance={getHocInstance} code={customStore.getCustomCode('ATTR_CARD')}>
          <SecondSection
            code="baseAttr"
            title={intl.get('smpc.productPublish.message.baseAttr').d('基础属性')}
          >
            {customizeForm(
              { code: customStore.getCustomCode('SKU_ATTRS') },
              <Form labelLayout="float" dataSet={customAttrDs} style={{ marginBottom: 14 }}>
                {!brandHidden &&
                  (!isReceive ? (
                    <TextField name="brandName" />
                  ) : (
                    <Select
                      name="brandName"
                      searchable
                      combo
                      searchMatcher="attrValueName"
                      placeholder={intl
                        .get('smpc.product.view.chooseInputValuesName', {
                          name: intl.get('smpc.product.view.brand').d('品牌'),
                        })
                        .d(`可输入或选择${intl.get('smpc.product.view.brand').d('品牌')}`)}
                    />
                  ))}
                {!modelHidden && <TextField name="model" />}
                <TextField name="packingList" />
              </Form>
            )}
            <BaseAttrs dataSet={baseAttrsDs} style={{ marginBottom: 16 }} />
          </SecondSection>
          <SecondSection
            code="specAttr"
            title={intl.get('smpc.productPublish.message.specification').d('规格属性')}
          >
            <SpecAttrs dataSet={specAttrsDs} />
          </SecondSection>
          {saleAttrRecords.length > 0 && (
            <SecondSection
              code="saleAttr"
              title={intl.get('smpc.productPublish.message.saleAttr').d('销售属性')}
            >
              <Form labelLayout="float">{saleAttrRecords.map(this.renderInputAttr)}</Form>
            </SecondSection>
          )}
        </TopSection>
        <CheckBox dataSet={allSkuDs} name="allSkuFlag" style={{ marginTop: 16 }}>
          {intl.get('smpc.product.model.setAllSku').d('应用至全部SKU')}
        </CheckBox>
      </div>
    );
  }
}
