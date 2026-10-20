/**
 * HeaderInfo - 详情头信息
 * @date: 2020-12-29
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React from 'react';
import { Form, Output, Spin } from 'choerodon-ui/pro';

const HeaderInfo = ({ dataSet, customizeForm, custLoading }) => {
  const itemList = [
    { name: 'reqNumber' },
    { name: 'reqStatus' },
    { name: 'creationDate' },
    { name: 'creator' },
    { name: 'unitNameLov', textField: 'unitName', valueField: 'unitId' },
    { name: 'reqTypeCode' },
    { name: 'supplierNum' },
    { name: 'supplierName' },
    { name: 'supplierTypeCode' },
    { name: 'idNum' },
    { name: 'passport' },
    { name: 'unifiedSocialCode' },
    { name: 'organizingInstitutionCode' },
    { name: 'dunsCode' },
    { name: 'businessRegistrationNumber' },
    { name: 'remark' },
    {
      name: 'externalSystemCodeLov',
      textField: 'externalSystemName',
      valueField: 'externalSystemCode',
    },
    {
      name: 'enabledFlag',
    },
    { name: 'termId', textField: 'termName', valueField: 'termId' },
    { name: 'paymentTypeCode', textField: 'typeName', valueField: 'paymentTypeCode' },
  ];

  return (
    <Spin dataSet={dataSet}>
      {customizeForm(
        {
          code: 'SSLM.EASY_SUPPLIER_WAREHOUSE.BASIC_INFO',
          enableCreate: false,
          labelLayout: 'vertical',
          enableReLoad: false,
          readOnly: true,
        },
        <Form
          dataSet={dataSet}
          columns={3}
          custLoading={custLoading}
          labelLayout="vertical"
          className="c7n-pro-vertical-form-display"
        >
          {itemList.map(n => {
            const ComponentType = Output;
            return React.createElement(
              ComponentType,
              Object.assign(
                {},
                {
                  name: n.name,
                  readOnly: true,
                  displayOutput: true,
                  border: false,
                  renderer: () => {
                    const data = dataSet.current && dataSet.current.toData();
                    if (data) {
                      if (n.valueField) {
                        return (
                          <div
                            style={{
                              color:
                                (data[`${n.valueField}Flag`] === 'UPDATE' ||
                                  data.objectFlag === 'CREATE') &&
                                'red',
                            }}
                          >
                            {data[`${n.textField}`] || data[`${n.valueField}`] || '-'}
                          </div>
                        );
                      } else {
                        return (
                          <div
                            style={{
                              color:
                                (data[`${n.name}Flag`] === 'UPDATE' ||
                                  data.objectFlag === 'CREATE') &&
                                'red',
                            }}
                          >
                            {data[`${n.name}Meaning`] || data[`${n.name}`] || '-'}
                          </div>
                        );
                      }
                    }
                  },
                }
              )
            );
          })}
        </Form>
      )}
    </Spin>
  );
};

export default HeaderInfo;
