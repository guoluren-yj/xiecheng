/* eslint-disable eqeqeq */
/* eslint-disable no-param-reassign */
/**
 * 风险定义页面
 */
import React, { useEffect, useRef, useState, useMemo } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import { connect } from 'dva';
import { Tag } from 'choerodon-ui';
import { DataSet, Table, Modal, Button } from 'choerodon-ui/pro';
import { Button as PermissionButton } from 'components/Permission';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';

import { getResponse } from '@/utils/utils';
import StaticSearchBar from '@/components/StaticSearchBar';
import { fetchUpdateEnabled, getThemeList } from '@/services/riskDefinitionService';

import { DefinitionListDS, ConfigListDS } from './stores/riskDefinitionDS';
import { getQueryConfig } from './queryConfig';
import ViewConfig from './ViewConfig';

import styles from './index.less';

let saveKey = 1;

const RiskDefinition = (props) => {
  const { definitionListDS, history } = props;

  const configListDS = useMemo(() => new DataSet(ConfigListDS()), []);

  const [themeList, setThemeList] = useState([]);

  let allSearchBarRef = useRef(null);

  useEffect(() => {
    definitionListDS.addEventListener('load', loadEvent);
    getThemeList().then((res) => {
      if (getResponse(res) && res.length) {
        const themeObj = {};
        const data = res.map((item) => item.themeCode);
        res.forEach((item) => {
          themeObj[item.themeCode] = item.themeName;
        });
        setThemeList(data || []);
      }
    });

    return () => {
      definitionListDS.removeEventListener('load', loadEvent);
      definitionListDS.data = [];
      definitionListDS.reset();
      definitionListDS.clearCachedSelected();
    };
  }, []);

  const loadEvent = ({ dataSet }) => {
    dataSet.forEach((rcd) => {
      if ([1, '1'].includes(rcd.get('enableFlag'))) {
        rcd.selectable = false;
      }
    });
  };

  /**
   * 新建操作
   */
  const handleCreate = async () => {
    history.push(
      '/sdat/risk-control-workbench/risk-definition/detail/add/create/create/selfCode/create'
    );
  };

  /**
   * 编辑操作
   * @param {*} record
   */
  const handleEditItem = async (record, flag) => {
    history.push(
      `/sdat/risk-control-workbench/risk-definition/detail/${record.get(
        'defineId'
      )}/edit/edit/${record.get('groupCode')}/${flag}`
    );
  };

  /**
   * 查看操作
   */
  const handleViewItem = (record) => {
    history.push(
      `/sdat/risk-control-workbench/risk-definition/view/${record.get('defineId')}/${record.get(
        'groupCode'
      )}`
    );
  };

  /**
   * 启用禁用操作
   * @param {object} item
   */
  const handleEnabledItem = async (item) => {
    const obj = item?.toData() ?? {};
    if (saveKey === 1) {
      saveKey = 0;
      fetchUpdateEnabled({
        ...obj,
        enableFlag: [0, '0', 2, '2'].includes(obj.enableFlag) ? '1' : '0',
      }).then((res) => {
        saveKey = 1;
        if (getResponse(res)) {
          definitionListDS.query();
        }
      });
    }
  };

  /**
   * 删除单条数据
   * @param {*} record
   */
  const handleDeleteItem = async (record) => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: (
        <div>
          {intl.get('sdat.riskControl.view.message.isConfirmDeleteItem').d('是否确认删除当前数据')}
        </div>
      ),
    }).then(async (button) => {
      if (button === 'ok') {
        definitionListDS.delete([record], false);
      }
    });
  };

  const handleViewConfig = (record) => {
    let modal = null;

    const defineId = record?.get('defineId') ?? '';
    const groupCode = record?.get('groupCode') ?? '';

    const handleCloseModal = () => {
      if (modal) {
        modal.close();
      }
    };

    modal = Modal.open({
      title: intl.get('sdat.riskDefinition.view.title.configList').d('处置规则配置'),
      children: (
        <ViewConfig configListDS={configListDS} defineId={defineId} groupCode={groupCode} />
      ),
      closable: true,
      drawer: true,
      style: { width: '1200px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.close`).d('关闭')}
          </Button>
        </div>
      ),
    });
  };

  const columns = () => {
    return [
      {
        name: 'enableFlag',
        renderer: ({ text }) => {
          return text === '1' ? (
            <Tag className={styles['risk-definition-status-tag-enabled']}>
              {intl.get('sdat.common.model.status.enable').d('启用')}
            </Tag>
          ) : text === '0' ? (
            <Tag className={styles['risk-definition-status-tag-disabled']}>
              {intl.get('sdat.common.model.status.disable').d('禁用')}
            </Tag>
          ) : (
            <Tag className={styles['risk-definition-status-tag-draft']}>
              {intl.get('sdat.common.view.title.create').d('新建')}
            </Tag>
          );
        },
      },
      { name: 'defineName' },
      { name: 'scope' },
      themeList.indexOf('externalRisk') !== -1 && { name: 'outerCount' },
      themeList.indexOf('businessRisk') !== -1 && { name: 'businessCount' },
      themeList.indexOf('disasterRisk') !== -1 && { name: 'disasterCount' },
      { name: 'updateName' },
      { name: 'updateTime', width: 200 },
      {
        name: 'operation',
        width: 220,
        renderer: ({ record }) => {
          const value = record.get('enableFlag');
          return (
            <span className="action-link">
              {[0, '0', 2, '2'].includes(value) ? (
                <PermissionButton
                  permissionList={[{ code: 'risk-control-workbench.api.riskDefinition-edit' }]}
                  type="text"
                  onClick={() => handleEditItem(record, 'edit')}
                >
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </PermissionButton>
              ) : (
                <PermissionButton
                  permissionList={[{ code: 'risk-control-workbench.api.riskDefinition-view' }]}
                  type="text"
                  onClick={() => handleViewItem(record)}
                >
                  {intl.get('hzero.common.button.view').d('查看')}
                </PermissionButton>
              )}

              {[0, '0', 2, '2'].includes(value) ? (
                <PermissionButton
                  permissionList={[{ code: 'risk-control-workbench.api.riskDefinition-enabled' }]}
                  type="text"
                  style={{ marginLeft: '16px' }}
                  onClick={() => handleEnabledItem(record)}
                >
                  {intl.get('hzero.common.model.status.enable').d('启用')}
                </PermissionButton>
              ) : (
                <PermissionButton
                  permissionList={[{ code: 'risk-control-workbench.api.riskDefinition-disabled' }]}
                  type="text"
                  style={{ marginLeft: '16px' }}
                  onClick={() => handleEnabledItem(record)}
                >
                  {intl.get('hzero.common.model.status.disable').d('禁用')}
                </PermissionButton>
              )}

              {[0, '0', 2, '2'].includes(value) ? (
                <PermissionButton
                  permissionList={[{ code: 'risk-control-workbench.api.riskDefinition-delete' }]}
                  type="text"
                  style={{ marginLeft: '16px' }}
                  onClick={() => handleDeleteItem(record)}
                >
                  {intl.get('sdat.riskDefinition.view.button.delete').d('删除')}
                </PermissionButton>
              ) : null}

              {[1, '1'].includes(value) ? (
                <PermissionButton
                  permissionList={[{ code: 'risk-control-workbench.api.ruleDeal' }]}
                  type="text"
                  style={{ marginLeft: '16px' }}
                  onClick={() => handleViewConfig(record)}
                >
                  {intl.get('sdat.riskDefinition.view.button.dealConfig').d('处置规则配置')}
                </PermissionButton>
              ) : null}
            </span>
          );
        },
      },
    ].filter(Boolean);
  };

  const handleClear = () => {
    if (allSearchBarRef && allSearchBarRef.setField) {
      allSearchBarRef.setField('companyName', '');
      allSearchBarRef.setField('scope', '');
    }
  };

  const getFilters = () => {
    return { ...getQueryConfig() };
  };

  const handleFilterQueryAll = ({ params }) => {
    const timeRange = params?.dateRange_range?.split(',') ?? [];
    const startDate = timeRange && timeRange.length && timeRange[0] ? `${timeRange[0]}` : '';
    const endDate = timeRange && timeRange.length > 1 && timeRange[1] ? `${timeRange[1]}` : '';
    definitionListDS.queryDataSet.data = [
      {
        ...params,
        startDate,
        endDate,
        dateRange_range: '',
        customizeOrderField: params?.customizeOrderField?.replaceAll('dateRange', 'lastUpdateDate'),
      },
    ];
    definitionListDS.setQueryParameter(
      'sort',
      params?.customizeOrderField?.replaceAll('dateRange', 'lastUpdateDate') ??
        'lastUpdateDate:desc'
    );
    definitionListDS.query();
  };

  return (
    <div className={styles['risk-definition-basic-content']}>
      <Header
        title={intl.get('sdat.riskDefinition.view.title.riskDefinition').d('风险定义')}
        backPath="/sdat/risk-control-workbench/list"
      >
        <PermissionButton
          permissionList={[{ code: 'risk-control-workbench.api.riskDefinition-create' }]}
          icon="add"
          type="c7n-pro"
          color="primary"
          onClick={handleCreate}
        >
          {intl.get('hzero.common.button.create').d('新建')}
        </PermissionButton>
      </Header>
      <Content>
        <div className={styles['risk-def-search-basic-panel']}>
          <StaticSearchBar
            cacheState
            clearButton
            onRef={(ref) => {
              allSearchBarRef = ref;
            }}
            searchCode="SDAT.RISK_CONTROL_DEFINITION_SEARCH_BAR"
            filters={getFilters()}
            dataSet={[definitionListDS]}
            onQuery={handleFilterQueryAll}
            onClear={handleClear}
            onReset={handleClear}
            showLoading={false}
            fieldProps={{}}
          />
        </div>
        <div style={{ height: 'calc(100vh - 240px)', overflow: 'hidden' }}>
          <div style={{ height: 'calc(100vh - 250px)' }}>
            <Table
              dataSet={definitionListDS}
              columns={columns()}
              queryBar="none"
              autoHeight={{ type: 'maxHeight', diff: 40 }}
              customizable
              customizedCode="SDAT.RISK_DEFINITION_LIST_TABLE"
            />
          </div>
        </div>
      </Content>
    </div>
  );
};

export default connect((state) => state)(
  formatterCollections({
    code: ['sdat.riskDefinition', 'sdat.riskControl', 'sdat.common'],
  })(
    withProps(
      () => {
        const definitionListDS = new DataSet(DefinitionListDS());

        return {
          definitionListDS,
        };
      },
      { cacheState: true, keepOriginDataSet: true } // 缓存数据状态+保持原来的DataSet对象
    )(RiskDefinition)
  )
);
