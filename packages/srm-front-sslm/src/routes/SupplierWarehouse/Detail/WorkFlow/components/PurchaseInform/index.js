/* eslint-disable react/jsx-wrap-multilines */
/**
 * PurchaseInform - 采购财务
 * @date: 2020-12-29
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Fragment } from 'react';
import { Table, Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { TopSection, SecondSection } from '_components/Section';
import { renderStatus } from '../../utils';

import HeaderInfo from './HeaderInfo';

const ComparePurchaseInform = ({
  headerDs,
  lineDs,
  customizeTable,
  customizeForm,
  custLoading,
  headerCode = '',
  lineCode = '',
  onlyShowChange,
}) => {
  const columns = [
    {
      name: 'objectFlag',
      renderer: ({ value }) => renderStatus(value),
    },
    {
      name: 'organizationCode',
      width: 200,
      renderer: ({ record }) => {
        const data = record.toData();
        return (
          <div
            style={{
              color:
                data.organizationCodeFlag === 'UPDATE' && data.objectFlag !== 'CREATE' ? 'red' : '',
            }}
          >
            {data.organizationCodeFlag === 'UPDATE' && data.objectFlag !== 'CREATE' ? (
              <Tooltip
                title={`${intl
                  .get('sslm.supplierWarehouse.view.beforeUpdate')
                  .d('修改前')}:${data.organizationCodeOld || '-'}`}
              >
                {data.organizationCode}
              </Tooltip>
            ) : (
              data.organizationCode
            )}
          </div>
        );
      },
    },
    {
      name: 'organizationName',
      width: 200,
    },
    {
      name: 'purchaseAgentId',
      width: 200,
      renderer: ({ record }) => {
        const data = record.toData();
        return (
          <div
            style={{
              color:
                data.purchaseAgentIdFlag === 'UPDATE' && data.objectFlag !== 'CREATE' ? 'red' : '',
            }}
          >
            {data.purchaseAgentIdFlag === 'UPDATE' && data.objectFlag !== 'CREATE' ? (
              <Tooltip
                title={`${intl
                  .get('sslm.supplierWarehouse.view.beforeUpdate')
                  .d('修改前')}:${data.purchaseAgentNameOld || '-'}`}
              >
                {data.purchaseAgentName || '-'}
              </Tooltip>
            ) : (
              data.purchaseAgentName || '-'
            )}
          </div>
        );
      },
    },
    {
      name: 'termId',
      width: 200,
      renderer: ({ record }) => {
        const data = record.toData();
        return (
          <div
            style={{
              color: data.termIdFlag === 'UPDATE' && data.objectFlag !== 'CREATE' ? 'red' : '',
            }}
          >
            {data.termIdFlag === 'UPDATE' && data.objectFlag !== 'CREATE' ? (
              <Tooltip
                title={`${intl
                  .get('sslm.supplierWarehouse.view.beforeUpdate')
                  .d('修改前')}:${data.termNameOld || '-'}`}
              >
                {data.termName || '-'}
              </Tooltip>
            ) : (
              data.termName || '-'
            )}
          </div>
        );
      },
    },
    {
      name: 'typeCode',
      width: 200,
      renderer: ({ record }) => {
        const data = record.toData();
        return (
          <div
            style={{
              color: data.typeCodeFlag === 'UPDATE' && data.objectFlag !== 'CREATE' ? 'red' : '',
            }}
          >
            {data.typeCodeFlag === 'UPDATE' && data.objectFlag !== 'CREATE' ? (
              <Tooltip
                title={`${intl
                  .get('sslm.supplierWarehouse.view.beforeUpdate')
                  .d('修改前')}:${data.typeNameOld || '-'}`}
              >
                {data.typeName}
              </Tooltip>
            ) : (
              data.typeName || '-'
            )}
          </div>
        );
      },
    },
    {
      name: 'tradeTerms',
      width: 200,
    },
    {
      name: 'tradeTermsSite',
      width: 100,
    },
    {
      name: 'currencyCode',
      width: 100,
      renderer: ({ record }) => {
        const data = record.toData();
        return (
          <div
            style={{
              color:
                data.currencyCodeFlag === 'UPDATE' && data.objectFlag !== 'CREATE' ? 'red' : '',
            }}
          >
            {data.currencyCodeFlag === 'UPDATE' && data.objectFlag !== 'CREATE' ? (
              <Tooltip
                title={`${intl.get('sslm.supplierWarehouse.view.beforeUpdate').d('修改前')}:${
                  data.currencyNameOld
                } || '-`}
              >
                {data.currencyName || '-'}
              </Tooltip>
            ) : (
              data.currencyName || '-'
            )}
          </div>
        );
      },
    },
    {
      name: 'reconciliationAccount',
      width: 200,
      renderer: ({ record }) => {
        const data = record.toData();
        return (
          <div
            style={{
              color:
                data.reconciliationAccountFlag === 'UPDATE' && data.objectFlag !== 'CREATE'
                  ? 'red'
                  : '',
            }}
          >
            {data.reconciliationAccountFlag === 'UPDATE' && data.objectFlag !== 'CREATE' ? (
              <Tooltip
                title={`${intl
                  .get('sslm.supplierWarehouse.view.beforeUpdate')
                  .d('修改前')}:${data.reconciliationAccountMeaningOld || '-'}`}
              >
                {data.reconciliationAccountMeaning || '-'}
              </Tooltip>
            ) : (
              data.reconciliationAccountMeaning || '-'
            )}
          </div>
        );
      },
    },
    {
      name: 'sortNumber',
      width: 200,
    },
    {
      name: 'frozenFlag',
      width: 200,
      renderer: ({ value, record }) => {
        const data = record.toData();
        return (
          <div
            style={{
              color: data.frozenFlagFlag === 'UPDATE' && data.objectFlag !== 'CREATE' ? 'red' : '',
            }}
          >
            {data.frozenFlagFlag === 'UPDATE' && data.objectFlag !== 'CREATE' ? (
              <Tooltip
                title={`${intl.get('sslm.supplierWarehouse.view.beforeUpdate').d('修改前')}:${
                  record.get('frozenFlagOld') !== undefined
                    ? record.get('masterFlagOld')
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

  return (
    <Fragment>
      <TopSection>
        <SecondSection
          title={<div>{intl.get('spfm.enterprise.view.message.header').d('采购财务/信息头')}</div>}
        >
          <HeaderInfo
            code={headerCode}
            dataSet={headerDs}
            customizeForm={customizeForm}
            custLoading={custLoading}
            onlyShowChange={onlyShowChange}
          />
        </SecondSection>
        <SecondSection
          title={<div>{intl.get('spfm.enterprise.view.message.line').d('采购财务/信息行')}</div>}
        >
          {customizeTable(
            {
              code: lineCode,
              readOnly: true,
            },
            <Table
              dataSet={lineDs}
              columns={columns}
              custLoading={custLoading}
              pagination={!onlyShowChange}
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
          )}
        </SecondSection>
      </TopSection>
    </Fragment>
  );
};

export default ComparePurchaseInform;
