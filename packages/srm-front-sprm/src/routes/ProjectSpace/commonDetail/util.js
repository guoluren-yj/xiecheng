import React from 'react';
import classnames from 'classnames';
import { Tag } from 'choerodon-ui';

const colorTagRender = ({ record, name, value }) => {
  let styleColor = 'c7n-tag-green';
  if (['NEW', 'IN_PROGRESS', 'APPROVING', 'CANCELING', 'PART_PROCESSED'].includes(value)) {
    styleColor = 'c7n-tag-yellow';
  }
  if (['TERMINATED', 'INVALID', 'CANCELED', 'CLOSED'].includes(value)) {
    styleColor = 'c7n-tag-gray';
  }
  if (['APPROVAL_REJECTED'].includes(value)) {
    styleColor = 'c7n-tag-red';
  }
  if (['COMPLETED', 'UNCANCELLED'].includes(value)) {
    styleColor = 'c7n-tag-green';
  }
  return (
    value && (
      <Tag className={classnames(styleColor)} style={{ border: 0 }}>
        {record.get(`${name}Meaning`)}
      </Tag>
    )
  );
};

export { colorTagRender };
