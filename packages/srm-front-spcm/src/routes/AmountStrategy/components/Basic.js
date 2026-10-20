/*
 * @Date: 2024-06-07 15:57:54
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import GeneralForm from '@/routes/components/GeneralForm';
import StatusTag from '../../components/StatusTag';

const Basic = ({ dataSet, isEdit }) => {
  const fields = [
    {
      name: 'strategyNum',
    },
    {
      name: 'strategyName',
    },
    {
      name: 'strategyStatus',
      renderer: ({ value, record }) => (
        <StatusTag text={record.get('strategyStatusMeaning')} value={value} />
      ),
    },
    {
      name: 'versionNumber',
    },
    {
      name: 'createdByName',
    },
    {
      name: 'creationDate',
    },
    {
      name: 'lastUpdateDate',
    },
  ];
  return <GeneralForm dataSet={dataSet} isEdit={isEdit} fields={fields} />;
};

export default Basic;
