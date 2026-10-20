import React, { Fragment } from 'react';
import { statusTagRender } from '../../Components/StatusTag';

export function statusLabelTagRender(rendererProps) {
  const { dataSet, name } = rendererProps;
  return (
    <Fragment>
      <span className="status-label">{dataSet?.getField(name)?.get('label')}：</span>
      {statusTagRender(rendererProps)}
    </Fragment>
  );
};

export function purchaserConfirmByNameRender(rendererProps) {
  const { text, record } = rendererProps;
  const account = record?.get('purchaserConfirmByAccount');
  return text && account ? `${text}(${account})` : text;
};