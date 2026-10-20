/*
 * @Description: 风险扫描方案模板管理
 * @Author: lqx(qingxiang.luo@going-link.com)
 * @Date: 2025-01-02 16:23:11
 * @Last Modified by: lqx(qingxiang.luo@going-link.com)
 * @Last Modified time: 2025-03-30 00:07:42
 */

import React, { useEffect } from 'react';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import { Header } from 'components/Page';
import { DataSet, Table, Button, Modal } from 'choerodon-ui/pro';
// import notification from 'utils/notification';

import StaticSearchBar from '@/components/StaticSearchBar';
import { getResponse } from '@/utils/utils';
import { fetchUpdateConfig } from '@/services/riskScanConfig/schemeTemplateService';

import { TemplateListDS } from './stores/schemeTemplateDS';
import { getQueryConfig } from './queryConfig';
import styles from './index.less';

const MonitorBusiness = (props) => {
  const { history } = props;
  const { listDS } = props.valueDs;

  useEffect(() => {}, []);

  const classMap = {
    0: styles['status-disabled'],
    1: styles['status-enabled'],
  };

  const columns = () => {
    return [
      {
        name: 'enabledFlag',
        align: 'left',
        width: 100,
        renderer: ({ value }) => {
          const classes = classMap[value];
          return (
            <span className={classes}>
              {value === 0
                ? intl.get('hzero.common.status.disabled').d('禁用')
                : intl.get('hzero.common.status.enable').d('启用')}
            </span>
          );
        },
      },
      {
        name: 'planNumber',
        width: 200,
        renderer: ({ text, record }) => {
          return <a onClick={() => handleEdit(record, 'view')}>{text}</a>;
        },
      },
      {
        name: 'planName',
        width: 200,
      },
      {
        name: 'tenantNum',
      },
      {
        name: 'tenantName',
      },
      {
        name: 'lastUpdateDate',
        width: 180,
      },
      {
        name: 'lastUpdatedUserName',
      },
      {
        header: intl.get('hzero.common.button.operator').d('操作'),
        name: 'operation',
        renderer: ({ record }) => {
          const enabledFlag = record?.get('enabledFlag');
          const tenantId = record?.get('tenantId');
          return (
            <span className="action-link">
              <a onClick={() => handleEdit(record, 'edit')}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              {![0, '0'].includes(tenantId) ? (
                <a onClick={() => handleEnabled(record)}>
                  {enabledFlag === 0
                    ? intl.get('hzero.common.status.enable').d('启用')
                    : intl.get('hzero.common.status.disabled').d('禁用')}
                </a>
              ) : null}
            </span>
          );
        },
      },
    ].filter(Boolean);
  };

  const getFilters = () => {
    return { ...getQueryConfig() };
  };

  const handleFilterQueryAll = ({ params }) => {
    listDS.queryDataSet.data = [{ ...params }];
    listDS.query();
  };

  const handleEnabled = async (record) => {
    const obj = record?.toData() ?? {};

    const { enabledFlag } = obj || {};

    Modal.confirm({
      title: intl.get('hzero.common.message.confirm').d('提示'),
      key: 'enabledConfirm',
      children: (
        <div>
          {enabledFlag === 0
            ? intl.get('sdat.schemeTemplate.view.title.confirmEnabled').d('是否确认启用')
            : intl.get('sdat.schemeTemplate.view.title.confirmDisabled').d('是否确认禁用')}
        </div>
      ),
    }).then(async (button) => {
      if (button === 'ok') {
        const flagValue = enabledFlag === 0 ? 1 : 0;
        const res = await fetchUpdateConfig({
          ...obj,
          enabledFlag: flagValue,
        });
        if (getResponse(res)) {
          listDS.query();
        }
      }
    });
  };

  const handleCreate = () => {
    history.push('/sdat/platform/risk-scheme-template/create');
  };

  const handleEdit = (record, type) => {
    const riskPlanId = record?.get('riskPlanId') ?? '';
    const tenantName = record?.get('tenantName') ?? '';

    if (riskPlanId) {
      history.push(
        `/sdat/platform/risk-scheme-template/detail/${riskPlanId}/${type}/${tenantName}`
      );
    }
  };

  return (
    <div className={styles['monitor-business-basic']}>
      <Header
        title={intl.get('sdat.schemeTemplate.view.header.riskSchemeTemplate').d('风险扫描方案模板')}
      >
        <Button
          icon="add"
          funcType="flat"
          color="primary"
          onClick={handleCreate}
          style={{ color: '#fff' }}
        >
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
      </Header>
      <div className={styles['monitor-business-content']}>
        <StaticSearchBar
          cacheState
          clearButton
          searchCode="SDAT.RISK_SCHEME_TEMPLATE_SEARCH_BAR"
          filters={getFilters()}
          dataSet={[listDS]}
          onQuery={handleFilterQueryAll}
          showLoading={false}
        />
        <div style={{ height: 'calc(100vh - 300px)' }}>
          <Table
            border={false}
            dataSet={listDS}
            queryBar="none"
            columns={columns()}
            autoHeight={{ type: 'maxHeight', diff: 40 }}
            customizable
            customizedCode="SDAT.RISK_SCHEME_TEMPLATE_LIST"
          />
        </div>
      </div>
    </div>
  );
};

export default formatterCollections({
  code: ['sdat.schemeTemplate'],
})(
  withProps(
    () => {
      const listDS = new DataSet(TemplateListDS());
      const valueDs = {
        listDS,
      };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(MonitorBusiness)
);
