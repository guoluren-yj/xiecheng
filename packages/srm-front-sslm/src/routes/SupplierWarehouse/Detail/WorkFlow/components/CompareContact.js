/**
 * Contact - 联系人
 * @date: 2020-12-29
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React from 'react';
import { isNil } from 'lodash';
import { Table, Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import { renderStatus } from '../utils';

function formatInternationalTel(
  internationalTelMeaning,
  phone,
  internationalTelMeaningOld,
  mobilephoneOld,
  objectFlag
) {
  let value = phone;
  if (internationalTelMeaning && phone) {
    value = (
      <span>
        <Tooltip
          title={`${intl
            .get('sslm.supplierWarehouse.view.beforeUpdate')
            .d('修改前')}: ${internationalTelMeaningOld || '-'}`}
        >
          {internationalTelMeaning}
        </Tooltip>
        |
        <Tooltip
          title={`${intl
            .get('sslm.supplierWarehouse.view.beforeUpdate')
            .d('修改前')} : ${mobilephoneOld || '-'}`}
        >
          {phone}
        </Tooltip>
      </span>
    );
  }
  return objectFlag === 'UPDATE' ? (
    <span>{value || '-'}</span>
  ) : internationalTelMeaning && phone ? (
    <span style={{ textDecoration: objectFlag === 'DELETE' && 'line-through' }}>
      {internationalTelMeaning} | {phone}
    </span>
  ) : (
    '-'
  );
}

const CompareContact = ({ dataSet, customizeTable, custLoading, code, onlyShowChange }) => {
  const columns = [
    {
      name: 'objectFlag',
      renderer: ({ value }) => renderStatus(value),
    },
    {
      name: 'name',
      width: 150,
    },
    // {
    //   name: 'gender',
    //   width: 100,
    // },
    {
      name: 'idType',
      width: 150,
    },
    {
      name: 'idNumber',
      width: 150,
    },
    {
      name: 'department',
      width: 150,
    },
    {
      name: 'position',
      width: 150,
    },
    {
      name: 'contactType',
      width: 150,
    },
    {
      name: 'mobilephone',
      width: 200,
      renderer: ({ record = {} }) => {
        const {
          data: {
            internationalTelMeaning,
            mobilephone,
            internationalTelMeaningOld,
            mobilephoneOld,
          } = {},
        } = record;
        const data = record.toData();
        return (
          <div
            style={{
              color:
                data.mobilephoneFlag === 'UPDATE' ||
                (data.internationalTelCodeFlag === 'UPDATE' && data.objectFlag !== 'CREATE')
                  ? 'red'
                  : '',
            }}
          >
            {formatInternationalTel(
              internationalTelMeaning,
              mobilephone,
              internationalTelMeaningOld,
              mobilephoneOld,
              data.objectFlag
            )}
          </div>
        );
      },
    },
    {
      name: 'mail',
      width: 200,
    },
    {
      name: 'officePhone',
      width: 150,
    },
    {
      name: 'defaultFlag',
      width: 150,
      renderer: ({ value, record }) => {
        const data = record.toData();
        return (
          <div
            style={{
              color: data.defaultFlagFlag === 'UPDATE' && data.objectFlag !== 'CREATE' ? 'red' : '',
            }}
          >
            {data.defaultFlagFlag === 'UPDATE' && data.objectFlag !== 'CREATE' ? (
              <Tooltip
                title={`${intl.get('sslm.supplierWarehouse.view.beforeUpdate').d('修改前')}:${
                  !isNil(record.get('defaultFlagOld'))
                    ? yesOrNoRender(record.get('defaultFlagOld'))
                    : '-'
                }`}
              >
                {isNil(value) ? '-' : yesOrNoRender(value)}
              </Tooltip>
            ) : isNil(value) ? (
              '-'
            ) : (
              yesOrNoRender(value)
            )}
          </div>
        );
      },
    },
    {
      name: 'remark',
      width: 150,
    },
    {
      name: 'enabledFlag',
      width: 100,
      renderer: ({ value, record }) => {
        const data = record.toData();
        return (
          <div
            style={{
              color: data.enabledFlagFlag === 'UPDATE' && data.objectFlag !== 'CREATE' ? 'red' : '',
              textDecoration: data.objectFlag === 'DELETE' && 'line-through',
            }}
          >
            {data.enabledFlagFlag === 'UPDATE' && data.objectFlag !== 'CREATE' ? (
              <Tooltip
                title={`${intl.get('sslm.supplierWarehouse.view.beforeUpdate').d('修改前')}:${
                  !isNil(record.get('enabledFlagOld'))
                    ? yesOrNoRender(record.get('enabledFlagOld'))
                    : '-'
                }`}
              >
                {isNil(value) ? '-' : yesOrNoRender(value)}
              </Tooltip>
            ) : isNil(value) ? (
              '-'
            ) : (
              yesOrNoRender(value)
            )}
          </div>
        );
      },
    },
  ].map(n => ({
    renderer: ({ record }) => {
      const data = record.toData();
      return (
        <div
          style={{
            color: data[`${n.name}Flag`] === 'UPDATE' && data.objectFlag !== 'CREATE' && 'red',
          }}
        >
          {data[`${n.name}Flag`] === 'UPDATE' && data.objectFlag !== 'CREATE' ? (
            <Tooltip
              title={`${intl.get('sslm.supplierWarehouse.view.beforeUpdate').d('修改前')}:${data[
                `${n.name}MeaningOld`
              ] ||
                data[`${n.name}Old`] ||
                '-'}`}
            >
              {data[`${n.name}Meaning`] || data[`${n.name}`] || '-'}
            </Tooltip>
          ) : (
            data[`${n.name}Meaning`] || data[`${n.name}`] || '-'
          )}
        </div>
      );
    },
    ...n,
  }));
  return customizeTable(
    {
      code, // 单元编码，必传
      readOnly: true,
    },
    <Table
      dataSet={dataSet}
      columns={columns}
      pagination={!onlyShowChange}
      custLoading={custLoading}
      onRow={({ record }) => ({
        style: {
          color:
            record.get('objectFlag') === 'CREATE' ||
            (record.get('objectFlag') === 'DELETE' && 'red'),
          textDecoration: record.get('objectFlag') === 'DELETE' && 'line-through',
          textDecorationThickness: '2px',
        },
      })}
    />
  );
};

export default CompareContact;
