/* eslint-disable no-param-reassign */
import React from 'react';
import intl from 'utils/intl';
import { Table, Modal } from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';
import StaticSearchBar from '@/components/StaticSearchBar';
import { fetchRemoveMonitor, fetchAddBusiness } from '@/services/riskControl/monitorManageService';
import { getQueryConfig } from './queryConfig';

import styles from './commonTable.less';

let isCanClick = true;

export default function CommonTable({
  dataSet,
  customizedCode,
  searchCode,
  pkgType,
  domesticForeignRelation,
  callBackForRefresh = () => {},
  callBackSaveParams = () => {},
}) {
  const handleAddMonitor = record => {
    const obj = record?.toData() ?? {};
    if (!isCanClick) return;
    isCanClick = false;
    try {
      fetchAddBusiness({
        dataPacket: pkgType,
        domesticForeignRelation: domesticForeignRelation === 'DOMESTIC' ? 1 : 0,
        enterpriseList: [{ ...obj, enterpriseCode: obj.socialCode }],
      }).then(res => {
        isCanClick = true;
        if (getResponse(res)) {
          callBackForRefresh();
        }
      });
    } catch (error) {
      isCanClick = true;
    } finally {
      isCanClick = true;
    }
  };

  const handleRemoveMonitor = record => {
    const obj = record?.toData() ?? {};

    Modal.confirm({
      title: intl.get('hzero.common.message.confirm').d('提示'),
      children: (
        <div>
          {intl.get('sdat.riskScanConfig.view.message.removeMonitorConfirm').d('确定移除监控吗？')}
        </div>
      ),
    }).then(btn => {
      if (btn === 'ok' && isCanClick) {
        isCanClick = false;
        try {
          fetchRemoveMonitor([
            {
              ...obj,
            },
          ]).then(res => {
            isCanClick = true;
            if (getResponse(res)) {
              callBackForRefresh();
            }
          });
        } catch (error) {
          isCanClick = true;
        } finally {
          isCanClick = true;
        }
      }
    });
  };

  const classMap = {
    1: styles['text-actived'],
    0: styles['text-disabled'],
  };

  const columns = () => {
    return [
      {
        name: 'effectiveFlag',
        renderer: ({ value, text }) => {
          return <span className={classMap[value]}>{text}</span>;
        },
        width: 120,
      },
      {
        name: 'enterpriseName',
      },
      {
        name: 'socialCode',
      },
      {
        name: 'expireTime',
        width: 200,
      },
      {
        name: 'userName',
      },
      {
        name: 'operation',
        header: intl.get(`sdat.riskScanConfig.model.operation`).d('操作'),
        renderer: ({ record }) => {
          const effectiveFlag = record.get('effectiveFlag') ?? '';
          return [0, '0'].includes(effectiveFlag) ? (
            <>
              <a onClick={() => handleAddMonitor(record)}>
                {intl.get('sdat.riskScanConfig.view.title.addMonitor').d('添加监控')}
              </a>
              <a onClick={() => handleRemoveMonitor(record)} style={{ marginLeft: '10px' }}>
                {intl.get('sdat.riskScanConfig.view.title.removeMonitor').d('移除监控')}
              </a>
            </>
          ) : null;
        },
      },
    ];
  };

  const getFilters = () => {
    return { ...getQueryConfig() };
  };

  const handleFilterQueryAll = ({ params }) => {
    dataSet.queryDataSet.data = [
      {
        ...params,
        // dateRange_range: '',
        customizeFilterComparison: '',
        customizeOrderField: params?.customizeOrderField
          ?.replaceAll('dateRange', 'creationDate')
          ?.replaceAll(':', ','),
      },
    ];
    dataSet.setQueryParameter(
      'sort',
      params?.customizeOrderField?.replaceAll('dateRange', 'creationDate')?.replaceAll(':', ',') ??
        'creationDate,desc'
    );
    dataSet.setQueryParameter('pkgType', pkgType);
    dataSet.query().then(() => {
      const queryParams = dataSet.queryDataSet?.toData()[0] ?? {};
      callBackSaveParams(pkgType, queryParams);
    });
  };

  return (
    <>
      <StaticSearchBar
        cacheState
        clearButton
        searchCode={searchCode}
        filters={getFilters()}
        dataSet={[dataSet]}
        onQuery={handleFilterQueryAll}
        showLoading={false}
        fieldProps={{}}
      />
      <div style={{ height: 'calc(100vh - 432px)', overflow: 'hidden' }}>
        <Table
          dataSet={dataSet}
          columns={columns()}
          queryBar="none"
          autoHeight={{ type: 'maxHeight', diff: 40 }}
          customizable
          customizedCode={customizedCode}
        />
      </div>
    </>
  );
}
