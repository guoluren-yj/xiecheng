import React, { useMemo } from 'react';
import qs from 'querystring';
import { Tag, Tabs } from 'choerodon-ui';
import classNames from 'classnames';
import { DataSet, Button, Icon, Spin } from 'choerodon-ui/pro';
import SearchBarTable from '_components/SearchBarTable';
import { flowRight } from 'lodash';

import intl from 'utils/intl';
import { filterNullValueObject, getResponse } from 'utils/utils';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';

import { StatusTag } from '@/routes/sstk/components/Tag';
import { openStockTimelineRecord } from '@/utils/drawer/commonDrawer';
import { strategyRecordRender } from '@/utils/record/recordRender';
import { getOptions } from '../utils';
import { handleOpenBatchDefine, openItemRageModal } from './drawer';
import configListDs from './store/configListDs';
import { fetchSubStrategy, fetchPublishStrategy, fetchUnlock, fetchCancelPublish } from './api';

import './index.less';

const { TabPane } = Tabs;

function StockStrategyConfig(props) {

  const { history: { push } } = props;

  const listDs = useMemo(() => new DataSet(configListDs()), []);

  const handleOpenDetail = (record, readOnly = false) => {
    const status = readOnly ? 'read' : 'edit';
    push({
      pathname: `/sstk/stock-strategy-config/detail/${status}`,
      search: qs.stringify(filterNullValueObject({
        strategyId: record && record.get('strategyId'),
      })),
    });
  };

  const handlePublish = async (record) => {
    if (!(record.get('lines') || []).length) {
      notification.warning({
        message: intl.get('sstk.stockConfig.view.publishInfo').d('批次维度不可为空，请添加批次维度'),
      });
      return;
    }
    const res = getResponse(await fetchPublishStrategy(record.toData()));
    if (res) {
      notification.success();
      listDs.query(listDs.currentPage);
    }
  };

  const unlock = async (record) => {
    const res = getResponse(await fetchUnlock(record.toData()));
    if (res) {
      notification.success();
      listDs.query(listDs.currentPage).then(() => {
        // 展开当前行
        Object.assign(listDs.find(f => f.get('strategyId') === record.get('strategyId')), { isExpanded: true });
      });
    }
  };

  const cancelPublish = async (record) => {
    const res = getResponse(await fetchCancelPublish(record.toData()));
    if (res) {
      notification.success();
      listDs.query(listDs.currentPage);
    }
  };

  // NEW - 未发布   RELEASED - 已发布
  const actionRender = ({ record }) => {
    const { statusCode, strategyId, strategyName, maxVersionFlag } = record.get(['statusCode', 'strategyId', 'strategyName', 'maxVersionFlag']);
    // 已发布且不存在更大版本批次可解锁；仅最新版本可编辑发布
    const actions = [
      // 非已发布
      {
        text: intl.get('hzero.common.button.edit').d('编辑'),
        event: () => handleOpenDetail(record),
        show: statusCode === 'NEW' && maxVersionFlag,
      },
      // 已发布的策略
      {
        text: intl.get('sstk.stockConfig.button.unlock').d('解锁'),
        show: statusCode === 'RELEASED',
        event: () => unlock(record),
        disabled: !maxVersionFlag,
      },
      // 非已发布
      {
        text: intl.get('sstk.stockConfig.button.publish').d('发布'),
        show: statusCode === 'NEW' && maxVersionFlag,
        event: () => handlePublish(record),
      },
      {
        text: intl.get('sstk.stockConfig.view.maintainItemRange').d('维护物料范围'),
        show: statusCode === 'RELEASED' && maxVersionFlag,
        event: () => openItemRageModal(strategyId, '', 'edit'),
      },
      {
        text: intl.get('sstk.common.view.cancelPublish').d('取消发布'),
        show: statusCode === 'RELEASED',
        event: () => cancelPublish(record),
      },
      {
        text: intl.get('hzero.common.button.operating').d('操作记录'),
        event: () => openStockTimelineRecord(strategyId, strategyName, strategyRecordRender),
      },
    ];
    return getOptions(actions, 3);
  };
  const treeLoadData = async ({ record, dataSet }) => {
    if (!record.children) {
      const params = {
        strategyCode: record.get('strategyCode'),
        strategyId: record.get('strategyId'),
      };
      record.setState('loading', true);
      const result = getResponse(await fetchSubStrategy(params));
      if (result) {
        record.setState('loading', false);
        dataSet.appendData(result);
      }
    }
  };
  const expandIcon = ({ prefixCls, expanded, expandable, record, onExpand }) => {
    const iconPrefixCls = `${prefixCls}-expand-icon`;
    const classString = classNames(iconPrefixCls, {
      [`${iconPrefixCls}-expanded`]: expanded,
    });
    // 一个策略只会存在一个已发布版本，放在树形列表首位
    if (record.get('childrenFlag')) {
      if (record.getState('loading')) {
        // 自定义状态渲染
        return <Spin delay={200} size="small" />;
      }
      return (
        <Icon
          type="baseline-arrow_right"
          className={classString}
          onClick={onExpand}
          tabIndex={expandable ? 0 : -1}
          style={{ marginTop: 5 }}
        />
      );
    }
    return <span className={classString} style={{ display: 'inline-block', width: 20 }} />;
  };
  const columns = useMemo(() => [
    {
      name: 'statusCode',
      minWidth: 100,
      width: 100,
      className: 'statusCode-column',
      headerClassName: 'statusCode-column-header',
      renderer: ({ record }) => <StatusTag published={record.get('statusCode') === 'RELEASED'} />,
    },
    {
      name: 'action',
      width: 150,
      renderer: actionRender,
    },
    {
      name: 'strategyCode',
      width: 150,
      renderer: ({ record, value }) => (
        <a
          onClick={() => handleOpenDetail(record, true)}
        >
          {value}
        </a>
      ),
    },
    {
      name: 'strategyName',
      width: 150,
    },
    {
      name: 'batchDimension',
      renderer: ({ record }) => {
        return (record.get('lines') || []).map(m => <Tag className='dimension-tag' key={m.dimensionId}>{m.dimensionName}</Tag>);
      },
    },
    {
      name: 'creator',
      width: 120,
    },
    {
      name: 'creationDate',
      width: 150,
    },
    {
      name: 'versionNum',
      width: 100,
    },
  ], []);
  return (
    <>
      <Header title={intl.get('sstk.stockConfig.view.title').d('库存管理配置')}>
        <Button icon="add" color="primary" onClick={() => handleOpenDetail(null)}>
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
        <Button funcType='flat' icon='settings' onClick={() => handleOpenBatchDefine()}>
          {intl.get('sstk.stockConfig.button.batchDimensionManage').d('批次维度管理')}
        </Button>
      </Header>
      <Content className='stock-config'>
        <Tabs>
          <TabPane tab={intl.get('sstk.stockConfig.view.tab.batchConfig').d('批次配置')}>
            <div style={{ height: 'calc(100vh - 192px)' }}>
              <SearchBarTable
                style={{ maxHeight: 'calc(100% - 22px)' }}
                mode="tree"
                treeLoadData={treeLoadData}
                indentSize={18}
                expandIcon={expandIcon}
                customizedCode='SSTK.STOCK_STRATEGY_CONFIG.LIST.TABLE'
                searchCode='SSTK.STOCK_STRATEGY_CONFIG.LIST.SEARCHBAR'
                rowHeight={32}
                dataSet={listDs}
                columns={columns}
              />
            </div>
          </TabPane>
        </Tabs>
      </Content>
    </>
  );
}

export default flowRight(
  formatterCollections({
    code: ['hzero.common', 'sstk.stockConfig', 'sstk.common', 'sagm.common'],
  })
)(StockStrategyConfig);