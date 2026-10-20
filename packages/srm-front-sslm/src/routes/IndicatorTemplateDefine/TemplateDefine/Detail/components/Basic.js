/*
 * @Date: 2023-10-18 16:25:24
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import GeneralForm from '@/routes/components/GeneralForm';

const Basic = ({ dataSet, isEdit, remote }) => {
  const fields = [
    {
      name: 'evalTplCode',
    },
    {
      name: 'evalTplName',
    },
    {
      name: 'evalTplType',
      componentType: 'SELECT',
    },
    {
      name: 'versionNum',
    },
    {
      name: 'creationDate',
    },
  ];
  return (
    <>
      <GeneralForm dataSet={dataSet} isEdit={isEdit} fields={fields} />
      {remote &&
        remote.render &&
        remote.render('SSLM.INDICATORTEMPLATEDEFINE.CUSTOMFORM', <></>, { dataSet, isEdit })}
    </>
  );
};

export default Basic;
