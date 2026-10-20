/*
 * @Description: 适用范围
 * @Author: yan.xie <yan.xie@gong-link.com>
 * @Date: 2023-03-01 12:57:20
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2023, Hand
 */
import React, { useState, useContext, useCallback } from 'react';
import { observer } from 'mobx-react';
import
{
  DataSet,
  Table,
} from 'choerodon-ui/pro';
import { Tabs, Radio } from 'choerodon-ui';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { TableProps } from 'choerodon-ui/pro/lib/table/Table';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { isEmpty } from 'lodash';
import classnames from 'classnames';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';

import Styles from '../../../common.less';
import { Store } from '../Detail/stores';
import DimensionLine from './DimensionLine';
import { getQueryDataApi } from '../utils/api';
import { queryLineDS } from '../Detail/stores/mainDS';
import { DimensionType } from '../../../BasicConfiguration/utils/type';


const { TabPane } = Tabs;


const ApplyRange = observer((props) =>
{
  const { setBubblePrompt } = props;
  const { applyRangeDs, ruleDs, customizeTable, remoteProps } = useContext(Store); // 维护视图Ds

  const [groupActiveKey, setGroupActiveKey] = useState(0);
  const [tabActiveKey, setTabActiveKey] = useState('maintain');
  const [queryProps, setQueryProps] = useState({ dataSet: [] as any as DataSet, columns: [] as ColumnProps[] } as TableProps); // 存储查询视图的ds和columns

  const handleChangeModeInfo = useCallback(
    async (e) =>
    {
      const tabValue = e.target.value;
      if (tabValue === 1)
      {
        // 如果维维护视图数据，或者校验不通过，则不允许切换查询视图
        const effectData = applyRangeDs.toData().filter(data =>
        {
          const newData = Object.assign({}, data);
          // 过滤无效字段
          delete newData.__dirty;
          delete newData.dimensionType;
          delete newData.dimensionDefinitionId;
          return !isEmpty(newData);
        });
        if (applyRangeDs.length === 0 || effectData.length === 0)
        {
          notification.warning({
            message: intl.get(`spfp.ruleMaintenance.view.warning.maintenanceView`).d('请先填写维护视图数据'),
          });
          return;
        }
        // 校验保存维护视图数据
        const validateFlag = await applyRangeDs.validate();
        if (!validateFlag) return false;
        const res = await applyRangeDs.submit();
        // 重新查询维护视图列表
        const ruleId = ruleDs?.current?.get('ruleId');
        if (res && ruleId)
        {
          // 动态渲染查询视图表格
          // 1.获取labels
          const labelRes = await getQueryDataApi(ruleId);
          if (getResponse(labelRes))
          {
            const { labels = [] } = labelRes || {};
            if (labels && labels.length > 0)
            {
              // 显示埋点
              const showLabels = remoteProps ? remoteProps.process('SPFP.RULE_REBATE_DETAIL_CUX.DIMENSIONCODE_LABELS', labels, { ruleDs }) : labels;
              // columns
              const queryColumns = showLabels.map((fieldObj) =>
              {
                const { dimensionCode, dimensionOperation } = fieldObj || {};
                if (['NOT_EQUALS', 'NOT_IN'].includes(dimensionOperation))
                {
                  return {
                    name: dimensionCode,
                    width: 150,
                    help: intl.get(`spfp.common.title.message.notTipBackgroundColor`).d('红色字体表示不等于关系，即当前维度值不包含下述罗列值'),
                    renderer: ({ value }) => (<span style={{ color: 'red' }}>{value}</span>),
                  };
                }
                return {
                  name: dimensionCode,
                  width: 150,
                };

              });
              const fields = showLabels.map(fieldObj =>
              {
                const { dimensionCode, dimensionName } = fieldObj || {};
                return {
                  name: dimensionCode,
                  type: FieldType.string,
                  label: dimensionName,
                };
              });
              // 动态获取查询视图的dataSet
              const queryDs = new DataSet(queryLineDS(fields, ruleId));
              // 动态的获取查询视图的数据
              queryDs.query();
              setQueryProps({
                dataSet: queryDs,
                columns: queryColumns,
              });
              setTabActiveKey(e.target.value === 1 ? 'query' : 'maintain');
              setGroupActiveKey(() => e.target.value);
            }
          }
        }
      } else
      {
        // 重新查询维护视图列表
        applyRangeDs.query();
        setTabActiveKey(e.target.value === 1 ? 'query' : 'maintain');
        setGroupActiveKey(() => e.target.value);

      }
    },
    [setTabActiveKey, setGroupActiveKey, applyRangeDs, setQueryProps, ruleDs, remoteProps],
  );

  return (
    <div className={classnames(Styles['spfp-detailDrawer-content'], Styles['spfp-detailDrawer-content-tab'])}>
      <div className="spfp-reconciliation-mode spfp-reconciliation-tab">
        <Radio.Group value={groupActiveKey} onChange={handleChangeModeInfo}>
          <Radio.Button value={0}>
            {intl.get(`spfp.ruleMaintenance.view.title.create.maintenanceView`).d('维护视图')}
          </Radio.Button>
          <Radio.Button value={1}>
            {intl.get(`spfp.ruleMaintenance.view.title.create.queryView`).d('查询视图')}
          </Radio.Button>
        </Radio.Group>
      </div>
      <Tabs
        activeKey={tabActiveKey}
        animated
      >
        <TabPane key={Number(groupActiveKey) === 1 ? 'query' : 'maintain'}>
          {
            tabActiveKey === 'maintain'
              ? (
                <DimensionLine
                  dataSet={applyRangeDs}
                  dimensionType={DimensionType.apply}
                  setBubblePrompt={setBubblePrompt}
                />
              )
              :
              (
                <div style={{ height: 'calc(100vh - 300px)' }}>
                  {customizeTable(
                    { code: 'SSPFP.RULE_DISCOUNT_DETAIL.APPLY_RANGE_LIST' },
                    <Table {...queryProps} style={{ maxHeight: 'calc(100% - 35px)' }} />
                  )}
                </div>
              )
          }
        </TabPane>
      </Tabs>
    </div>
  );
});

export default ApplyRange;
