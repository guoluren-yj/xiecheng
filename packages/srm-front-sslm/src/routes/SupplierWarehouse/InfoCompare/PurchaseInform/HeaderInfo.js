/**
 * HeaderInfo - 采购财务头信息
 * @date: 2020-12-29
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React from 'react';
import { Form, Output, Spin } from 'choerodon-ui/pro';
import intl from 'utils/intl';

const HeaderInfo = ({ dataSet, customizeForm, custLoading, code = '' }) => {
  const itemList = [
    { name: 'programmeGroups' },
    { name: 'schemeGroup' },
    { name: 'accountGroup', textField: 'accountGroupMeaning', valueField: 'accountGroup' },
    {
      name: 'reconciliationAccount',
      textField: 'reconciliationAccountMeaning',
      valueField: 'reconciliationAccount',
    },
    { name: 'ouId', textField: 'ouCode', valueField: 'ouId' },
    { name: 'termId', textField: 'termName', valueField: 'termId' },
    {
      name: 'frozenFlag',
      renderer: ({ value, record }) => {
        const data = (record && record.toData()) || {};
        return (
          <div
            style={{
              color: (data.frozenFlagFlag === 'UPDATE' || data.objectFlag === 'CREATE') && 'red',
            }}
          >
            {value
              ? intl.get('hzero.common.status.yes').d('是')
              : intl.get('hzero.common.status.no').d('否')}
          </div>
        );
      },
    },
    { name: 'paymentFrozen' },
  ];

  return (
    <Spin dataSet={dataSet}>
      {customizeForm(
        {
          code,
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
          style={{ marginBottom: 16 }}
        >
          {itemList.map(n => {
            const { name, textField, valueField, ...others } = n;
            const ComponentType = Output;
            return React.createElement(
              ComponentType,
              Object.assign(
                {},
                {
                  name: n.name,
                  readOnly: true,
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
                  ...others,
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
