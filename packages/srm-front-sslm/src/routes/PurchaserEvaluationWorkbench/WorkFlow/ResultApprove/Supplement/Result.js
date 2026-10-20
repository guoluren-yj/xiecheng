/*
 * Result - 评估结果
 * @Date: 2024-02-06 11:06:45
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Form, Spin } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import FormField from '@/routes/components/FormField';

const Result = observer(({ dataSet, customizeForm, custLoading, customizeCode }) => {
  const fields = [
    {
      name: 'finalScore',
      componentType: 'INPUTENUMBER',
    },
    {
      name: 'grade',
      componentType: 'TextField',
    },
    {
      name: 'resultsFlag',
      componentType: 'Select',
    },
    {
      name: 'opinion',
      componentType: 'TEXTAREA',
      newLine: true,
      rows: 3,
      cols: 2,
      colSpan: 2,
      resize: 'vertical',
    },
    {
      name: 'userNames',
      componentType: 'Lov',
      newLine: true,
    },
    {
      name: 'resultLinkUuid',
      componentType: 'Attachment',
      newLine: true,
      colSpan: 3,
    },
  ];

  return (
    <Spin dataSet={dataSet}>
      {customizeForm(
        {
          code: customizeCode,
        },
        <Form columns={3} dataSet={dataSet} labelLayout="float" custLoading={custLoading}>
          {fields.map(field => {
            return <FormField isEdit key={field.name} {...field} />;
          })}
        </Form>
      )}
    </Spin>
  );
});

export default Result;
