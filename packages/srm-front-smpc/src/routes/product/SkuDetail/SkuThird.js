import React from 'react';
import FormPro from './FormPro';
import renderCompare from './renderCompare';

export default function SkuThird(props) {
  const { id, title, dataSet, isHistory, showHistory, keyList } = props;
  const fieldsRenderer = ({ value, name }) =>
    renderCompare({ value, name, isHistory, showHistory, keyList });
  return (
    <div className="sku-third-wrapper" id={id}>
      <div className="sku-card-title">{title}</div>
      <FormPro
        readOnly
        dataSet={dataSet}
        columns={3}
        fields={[
          { name: 'supplierItemCode', renderer: fieldsRenderer },
          { name: 'supplierItemName', renderer: fieldsRenderer },
          { name: 'manufacturerItemCode', renderer: fieldsRenderer },
          { name: 'manufacturerItemName', renderer: fieldsRenderer },
          { name: 'manufacturerInfo', renderer: fieldsRenderer },
        ]}
      />
    </div>
  );
}
