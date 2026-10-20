/*
 * Personal - 登记信息- 个人
 * @Date: 2023-04-06 14:36:15
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { isFunction } from 'lodash';
import { Form, Output } from 'choerodon-ui/pro';
import { handleExtTextRenderIntercept } from '@/routes/components/utils';

const Personal = ({
  dataSet,
  custLoading,
  customizeForm,
  handleCompareRender,
  customizeUnitCode,
  handleFieldProp = () => {},
}) => {
  const fields = [
    {
      name: 'certificationType',
      type: 'select',
    },
    {
      name: 'domesticForeignRelation',
      type: 'select',
    },
    {
      name: 'companyName',
    },
    {
      name: 'registeredCountryId',
      displayField: 'registeredCountryName',
    },
    {
      name: 'regionPathName',
    },
    {
      name: 'addressDetail',
      newLine: true,
      colSpan: 2,
    },
    {
      name: 'phone',
    },
    {
      name: 'email',
    },
  ].map(field => {
    const { type, displayField, hidden, ...others } = field;
    const { name: fileName } = others;
    return {
      renderer: ({ value, record, name }) =>
        handleCompareRender({ value, record, name, type, displayField }),
      ...(isFunction(handleFieldProp)
        ? handleFieldProp({ currentRecord: dataSet && dataSet.current, fileName, hidden })
        : { hidden }),
      ...others,
    };
  });

  return customizeForm(
    {
      code: customizeUnitCode,
      readOnly: true,
      extTextRenderIntercept: handleExtTextRenderIntercept,
    },
    <Form
      columns={3}
      dataSet={dataSet}
      custLoading={custLoading}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
    >
      {fields.map(field => (
        <Output {...field} />
      ))}
    </Form>
  );
};

export default Personal;
