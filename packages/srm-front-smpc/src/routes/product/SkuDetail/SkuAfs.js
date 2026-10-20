import React from 'react';
import intl from 'utils/intl';

import FormPro from './FormPro';
import renderCompare from './renderCompare';
import customStore from './customStore';

export default function SkuAfs(props) {
  const { id, title, dataSet, keyList, isHistory, showHistory } = props;

  const isReceive = customStore.getState('isReceive');

  const _afs = {
    returnDuration: 7,
    changeDuration: 15,
    qualityDuration: undefined,
    instruction: '',
    returnSpecial: 2,
    changeSpecial: 2,
    afterSaleSpecial: 0,
  };

  const fieldsRenderer = ({ value, name }) =>
    renderCompare({ value, name, isHistory, showHistory, keyList });

  const renderReturn = ({ record, name }) => {
    const { returnSpecial, returnDuration } = (record && record.get('afterSale')) || _afs;
    const value =
      returnSpecial === 2
        ? intl.get('smpc.product.view.noLimitRefunds').d('该商品支持不限次数退货')
        : returnSpecial === 1
        ? intl.get('smpc.product.view.noRefunds').d('特殊商品，一经签收不予退货')
        : intl
            .get('smpc.product.view.returnDuration', { name: returnDuration })
            .d(`确认收货后${returnDuration}天内出现质量问题可申请退货`);
    return fieldsRenderer({ value, name });
  };

  const renderChange = ({ record, name }) => {
    const { changeSpecial, changeDuration } = (record && record.get('afterSale')) || _afs;
    const value =
      changeSpecial === 2
        ? intl.get('smpc.product.view.noLimitExchange').d('该商品支持不限次数换货')
        : changeSpecial === 1
        ? intl.get('smpc.product.view.noExchange').d('特殊商品，一经签收不予换货')
        : intl
            .get('smpc.product.view.changeDuration', { name: changeDuration })
            .d(`确认收货后${changeDuration}天内出现质量问题可申请换货`);
    return fieldsRenderer({ value, name });
  };

  return (
    <div className="sku-afs-wrapper" id={id}>
      <div className="sku-card-title">{title}</div>
      <FormPro
        dataSet={dataSet}
        readOnly
        columns={3}
        fields={[
          { name: 'returnSpecial', renderer: renderReturn },
          { name: 'changeSpecial', renderer: renderChange, show: !isReceive },
          {
            name: 'qualityDuration',
            show: !isReceive,
            renderer: ({ record, name }) => {
              const { qualityDuration } = (record && record.get('afterSale')) || _afs;
              const value = qualityDuration
                ? intl
                    .get('smpc.product.view.qualityDuration', { name: qualityDuration })
                    .d(`质保限期${qualityDuration}个月`)
                : undefined;
              return fieldsRenderer({ value, name });
            },
          },
          {
            name: 'instruction',
            show: !isReceive,
            renderer: ({ record, name }) => {
              const { instruction: value } = (record && record.get('afterSale')) || _afs;
              return fieldsRenderer({ value, name });
            },
          },
        ].filter((f) => f.show !== false)}
      />
    </div>
  );
}
