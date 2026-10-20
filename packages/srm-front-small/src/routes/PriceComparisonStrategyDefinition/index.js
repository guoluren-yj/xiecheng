import React, { useMemo } from 'react';
import intl from 'utils/intl';
import { compose, isEmpty } from 'lodash';
import { Tag, Alert } from 'choerodon-ui';
import { DataSet, Table, Button, Modal } from 'choerodon-ui/pro';

import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';

import {
  unlockStrategy,
  publishStrategy,
  fetchStrategyEnableApi,
} from '@/services/priceComparisonStrategyDefinitionService';

import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { Tooltip } from 'hzero-ui';

import HistoryVersion from './HistoryVersion';
import { tableDataSet } from './tableDs';

import style from './index.less';

// 状态Tag
export const showStatusTag = (status, statusMeaning) => {
  switch (status) {
    // 已发布
    case 'PUBLISHED':
      return (
        <Tag
          style={{
            border: 'none',
          }}
          color='green'
        >
          <span>{statusMeaning}</span>
        </Tag>
      );
    // 未发布
    case 'UNPUBLISHED':
      return (
        <Tag
          color='yellow'
          style={{
            border: 'none',
          }}
        >
          <span style={{ color: 'rgb(248, 141, 16)' }}>{statusMeaning}</span>
        </Tag>
      );
    // 已禁用
    case 'Z-DISABLED':
      return (
        <Tag
          color='red'
          style={{
            border: 'none',
          }}
        >
          <span>{statusMeaning}</span>
        </Tag>
      );
    default:
      return '';
  }
};
const PriceComparisonStrategyDefinition = props => {

  const tableDs = useMemo(() => new DataSet(tableDataSet()), []);

  // 解锁
  const handleUnlock = async (record, copyFlag=false) => {
    const res = getResponse(await unlockStrategy(record.compareRuleHeaderId));
    if (res && res.failed) {
      notification.error({
        message: res && res.message,
      });
    } else {
      notification.success();
      await tableDs.query();
      const unPublishRecord = tableDs.records.find(r=> r.get('status') === 'UNPUBLISHED');
      if(!copyFlag && unPublishRecord){
        props.history.push({
          pathname: `/small/price-comparison-strategy-definition/${ unPublishRecord?.get(
            'compareRuleHeaderId'
          )}/0`,
        });
      }
    }
  };

  // 发布
  const handlePublish = async record => {
    const params = {
      ...record.toData(),
    };
    const res = getResponse(await publishStrategy(params));
    if (res && res.failed) {
      notification.error({
        message: res && res.message,
      });
    } else {
      tableDs.query();
    }
  };

  const handleEnableFlag = async record => {
    const res = getResponse(await fetchStrategyEnableApi(record.get('compareRuleHeaderId')));
    if (res && res.failed) {
      notification.error({
        message: res && res.message,
      });
    } else {
      tableDs.query();
    }
  };

  const columns = [
    {
      header: (
        <div>
          {intl.get(`small.common.model.status`).d('状态')}
        </div>
      ),
      headerStyle: { paddingLeft: 52 },
      name: 'status',
      align: 'left',
      width: 180,
      renderer: ({ record }) => {
        const { status, statusMeaning } = record.data;
        return showStatusTag(status, statusMeaning);
      },
    },
    {
      name: 'edit',
      width: 230,
      // lock: 'right',
      renderer: ({ record, dataSet }) => {
        return (
          <span className={style["action-link"]}>
            {record.get('preDefineFlag') && (
              <Tooltip
                title={dataSet.length > 1 ? intl.get('small.comparePrice.view.copyTip').d('已有自定义策略，不可复制') : ''}
                placement='top'
              >
                <Button
                  color="primary"
                  funcType="link"
                  disabled={dataSet.length > 1}
                  onClick={() => {
                    handleUnlock(record.data, true);
                  }}
                >
                  { intl.get('small.common.button.copy').d('复制')}
                </Button>
              </Tooltip>
            )}
            {record.get('status') === 'UNPUBLISHED' && !record.get('preDefineFlag') && (
              <>
                <Button
                  color="primary"
                  funcType="link"
                  onClick={() => {
                    const parentRecord = record.parent;
                    if(!isEmpty(parentRecord) && parentRecord.get('status') === 'Z-DISABLED'){
                      Modal.confirm({
                        title: intl.get('small.common.model.tips').d('提示'),
                        children: intl.get('small.comparePrice.view.publishTip').d('当前策略为禁用状态，发布后策略会变更为已发布状态，确认发布新版本吗？'),
                        onOk: async () => {
                          await handlePublish(record);
                        },
                      });
                    }else{
                      handlePublish(record);
                    }
                  }}
                >
                  {intl.get('small.common.button.handle.publish').d('发布')}
                </Button>
                <Button
                  color="primary"
                  funcType="link"
                  onClick={() =>
                    props.history.push({
                      pathname: `/small/price-comparison-strategy-definition/${record?.get(
                        'compareRuleHeaderId'
                      )}/0`,
                    })
                  }
                >
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </Button>
              </>
            )}
            { record.get('customFlag') && !record.get('preDefineFlag') && !record.children && (
              <Button
                color="primary"
                funcType="link"
                onClick={() => {
                    handleUnlock(record.data);
                  }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </Button>
            )}
            { record.get('customFlag') && !record.get('preDefineFlag') && (
              <Button
                color="primary"
                funcType="link"
                onClick={() => handleEnableFlag(record)}
              >
                { record.get('status') === 'Z-DISABLED' ? intl.get('small.common.model.enable').d('启用')
                  : intl.get('small.common.model.disable').d('禁用')}
              </Button>
            )}
            { !isEmpty(record.get('historyList')) &&
              <HistoryVersion history={props.history} buttonProps={{funcType: 'link'}} historyVersionList={record.get('historyList')} />
            }
          </span>
        );
      },
    },
    {
      name: 'compareRuleCode',
      width: 240,
      renderer: ({ record }) => {
        return (
          <span>
            <a
              onClick={() =>
                props.history.push(`/small/price-comparison-strategy-definition/${record?.get(
                  'compareRuleHeaderId'
                )}/1?hasHistoryFlag=${!isEmpty(record.get('historyList'))}`)
              }
            >
              {record.get('compareRuleCode') || '-'}
            </a>
          </span>
        );
      },
    },
    {
      name: 'compareRuleName',
      width: 320,
    },
    {
      name: 'displayVersion',
      width: 100,
      align: 'right',
      renderer: ({ record }) => {
        return (
          <>
            {record.get('subVersion')}
          </>
        );
      },
    },
    {
      name: 'strategyTypeMeaning',
      width: 120,
      renderer: ({ record }) => {
        return (
          <Tag
            color={record.get('preDefineFlag') ? 'gray' : 'blue'}
            style={{
              border: 'none',
            }}
          >
            {record.get('strategyTypeMeaning')}
          </Tag>
        );
      },
    },
  ];
  return (
    <>
      <Header title={intl.get(`small.comparePrice.view.title`).d('比价策略定义')} />
      <Content>

        <Alert
          className={style['change-tips']}
          message={intl.get('small.comparePrice.view.tips').d('比价策略默认手动比价，且不自动生成比价单，若与用户需求一致，请勿做任何操作。反之可复制预定义策略并在复制的策略中进行定义。自定义策略发布后，预定义策略失效。')}
          type="info"
          showIcon
          closable
          banner
        />

        <div style={{ maxHeight: `calc(100vh - 185px)` }}>
          <Table
            dataSet={tableDs}
            customizable
            customizedCode="column-group"
            columns={columns}
            mode="tree"
            selectionMode="click"
            pagination={false}
            style={{ maxHeight: `calc(100% - 45px)` }}
          />
        </div>

      </Content>
    </>
  );
};

export default compose(
  formatterCollections({
    code: ['small.comparePrice', 'small.common'],
  })
)(PriceComparisonStrategyDefinition);
