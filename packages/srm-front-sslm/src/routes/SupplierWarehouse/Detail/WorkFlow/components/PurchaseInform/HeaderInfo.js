/**
 * HeaderInfo - 采购财务头信息
 * @date: 2020-12-29
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React from 'react';
import { Form, Output, Spin, Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';

const HeaderInfo = ({ dataSet, customizeForm, custLoading, code = '', onlyShowChange }) => {
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
            {data.frozenFlagFlag === 'UPDATE' || data.objectFlag === 'CREATE' ? (
              <Tooltip
                title={`${intl.get('sslm.supplierWarehouse.view.beforeUpdate').d('修改前')}:${
                  record.get('frozenFlagOld') !== undefined
                    ? record.get('frozenFlagOld')
                      ? intl.get('hzero.common.status.yes').d('是')
                      : intl.get('hzero.common.status.no').d('否')
                    : '-'
                }`}
              >
                {value
                  ? intl.get('hzero.common.status.yes').d('是')
                  : intl.get('hzero.common.status.no').d('否')}
              </Tooltip>
            ) : value ? (
              intl.get('hzero.common.status.yes').d('是')
            ) : (
              intl.get('hzero.common.status.no').d('否')
            )}
          </div>
        );
      },
    },
    { name: 'paymentFrozen' },
  ].filter(n => {
    const data = dataSet.current && dataSet.current.toData();
    if (data) {
      return n.valueField
        ? data[`${n.valueField}Flag`] === 'UPDATE' ||
            data.objectFlag === 'CREATE' ||
            !onlyShowChange
        : data[`${n.name}Flag`] === 'UPDATE' || data.objectFlag === 'CREATE' || !onlyShowChange;
    }
    return true;
  });

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
          useWidthPercent
          dataSet={dataSet}
          columns={3}
          custLoading={custLoading}
          labelLayout="vertical"
          className="c7n-pro-vertical-form-display"
          style={{ marginBottom: 16, padding: '16px 20px 20px 20px' }}
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
                            {data[`${n.valueField}Flag`] === 'UPDATE' ||
                            data.objectFlag === 'CREATE' ? (
                              <Tooltip
                                title={`${intl
                                  .get('sslm.supplierWarehouse.view.beforeUpdate')
                                  .d('修改前')}:${data[`${n.textField}Old`] ||
                                  data[`${n.valueField}Old`] ||
                                  '-'}`}
                              >
                                {data[`${n.textField}`] || data[`${n.valueField}`] || '-'}
                              </Tooltip>
                            ) : (
                              data[`${n.textField}`] || data[`${n.valueField}`] || '-'
                            )}
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
                            {data[`${n.name}Flag`] === 'UPDATE' || data.objectFlag === 'CREATE' ? (
                              <Tooltip
                                title={`${intl
                                  .get('sslm.supplierWarehouse.view.beforeUpdate')
                                  .d('修改前')}:${data[`${n.name}MeaningOld`] ||
                                  data[`${n.name}Old`] ||
                                  '-'}`}
                              >
                                {data[`${n.name}Meaning`] || data[`${n.name}`] || '-'}
                              </Tooltip>
                            ) : (
                              data[`${n.name}Meaning`] || data[`${n.name}`]
                            )}
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
