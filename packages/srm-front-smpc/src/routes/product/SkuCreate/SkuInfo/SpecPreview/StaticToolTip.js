import React, { useMemo } from 'react';
// import { Icon } from 'choerodon-ui';
import { DataSet, Form, Select, Icon } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import defaultImg from '@/assets/sku_default.svg';
import OverflowTip from '@/components/OverflowTip';

import { saleSpecsFormDs } from '../../ds';
import MoreSelect from '../../MoreSelect';

import styles from './styles.less';
import './reset.less';

const getSpecsRes = () => [
  {
    attrId: 'color',
    attributeName: intl.get('smpc.workbench.view.specPreview.color').d('颜色'),
    attrValLov: [
      {
        attrValueId: 'black',
        attrValueName: intl.get('smpc.workbench.view.color.black').d('黑色'),
      },
      {
        attrValueId: 'white',
        attrValueName: intl.get('smpc.workbench.view.color.white').d('白色'),
      },
    ],
  },
  {
    attrId: 'size',
    attributeName: intl.get('smpc.workbench.view.specPreview.model').d('型号'),
    attrValLov: [
      {
        attrValueId: 'bigSize',
        attrValueName: intl.get('smpc.workbench.view.color.bigSize').d('大号'),
      },
      {
        attrValueId: 'middleSize',
        attrValueName: intl.get('smpc.workbench.view.color.middleSize').d('中号'),
      },
    ],
  },
];
export default function StaticToolTip() {
  const virtualDs = useMemo(() => new DataSet(saleSpecsFormDs(undefined)), []);
  virtualDs.loadData(getSpecsRes());
  const click = (e) => {
    e.stopPropagation(); // 阻止冒泡触发按钮的onClick
  };
  return (
    <div id="staticSpec" className={styles['static-spec-preview']} onClick={click}>
      <p>
        {intl
          .get('smpc.product.view.specPreview.infoTotal')
          .d('销售规格配置适用于将属性相同属性值不同的商品聚合浏览场景')}
      </p>
      <p>
        {intl
          .get('smpc.product.view.specPreview.exampleDesc')
          .d('例如：白色、黑色上衣，可通过配置【颜色】销售规格实现商品详情页切换浏览不同颜色上衣')}
      </p>
      <p className="example">
        {intl.get('smpc.product.view.specPreview.example').d('销售规格配置示例')}
      </p>
      <div className="form-spec">
        {virtualDs.map((record, index) => (
          <div className="sale-specs-line">
            <Form record={record} labelLayout="float" columns={2} style={{ margin: 0 }}>
              <Select
                combo
                searchable
                name="attrObj"
                disabled
                style={{ width: '100%' }}
                optionsFilter={(r) => {
                  const attrId = record.get('attrId');
                  const repeat = Array.from(virtualDs.records).some((_r) => {
                    return r.get('attrId') !== attrId && _r.get('attrId') === r.get('attrId');
                  });
                  return !repeat;
                }}
              />
              <MoreSelect
                id={`sale_spec_${index}`}
                name="attrValues"
                record={record}
                searchable
                style={{ width: '100%' }}
                onOption={() => {
                  return { disabled: true };
                }}
              />
            </Form>
          </div>
        ))}
      </div>
      <p className="example-display">
        {intl.get('smpc.product.view.specPreview.displayExample').d('商城展示示例')}
      </p>
      <div className="display-wrap">
        <div className="display-image">
          <img className="big-image" src={defaultImg} alt="specView" />
          <div className="small-images">
            <Icon type="navigate_before" />
            <div className="images">
              {[1, 2, 3].map((m) => (
                <img className="small-image" src={defaultImg} alt="specView" key={m} />
              ))}
            </div>
            <Icon type="navigate_next" />
          </div>
        </div>
        <div className="right-detail" id="rightDetail">
          <div className="skeleton">
            <div className="item item-1" />
            <div className="item item-2" />
            <div className="item item-3" />
          </div>
          <div className="spec-list">
            {getSpecsRes().map((item) => (
              <div className="spec-item" key={item.attrId}>
                <span className="label">
                  <OverflowTip>{item.attributeName}</OverflowTip>
                </span>
                <div className="values">
                  {item.attrValLov.map((m, idx) => (
                    <span key={m.attrValueId} className={`value ${!idx ? 'active' : ''}`}>
                      <OverflowTip>{m.attrValueName}</OverflowTip>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
