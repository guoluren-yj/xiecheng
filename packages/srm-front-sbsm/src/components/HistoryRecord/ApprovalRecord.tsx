import React, { useState, useCallback, useEffect } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { Collapse, Spin } from 'choerodon-ui';
import { isEmpty, groupBy, isArray, isNil } from 'lodash';
import type { TransportType } from 'choerodon-ui/dataset/data-set/Transport';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { queryUnifyIdpValue } from 'services/api';
import ApproveRecord from '_components/ApproveRecord';
import classNames from 'classnames';

import emptySvg from '../../assets/empty.svg';

import styles from './index.less';

const { Panel } = Collapse;

export interface ApprovalRecordProps {
  // 数据源
  dataSource?: Record<string, any>;
  // 查询请求的 axios 配置或 url 字符串
  readTransport: TransportType,
  // 分类值集编码
  categoryLovCode: string;
}

// 审批记录
const ApprovalRecord = (props: ApprovalRecordProps) => {

  const { dataSource, readTransport, categoryLovCode } = props;
  const [loading, setLoading] = useState(true);
  const [approvalData, setApprovalData] = useState<any[]>([]);


  const handleInit = useCallback(async () => {
    try {
      const promiseList = [queryUnifyIdpValue(categoryLovCode)];
      if (isNil(dataSource)) {
        const approvalDs = new DataSet({
          paging: false,
          autoQuery: false,
          queryParameter: { size: 0 },
          transport: {
            read: readTransport,
          },
        });
        promiseList.push(approvalDs.query());
      }
      const [nodeDataRes, approvalDataMap = dataSource] = (await Promise.all(promiseList));
      const nodeData = getResponse(nodeDataRes);
      if (!isEmpty(nodeData) && !isEmpty(approvalDataMap)) {
        const approvalList = isArray(approvalDataMap) ? groupBy(approvalDataMap, 'categoryCode') : approvalDataMap;
        const newData = Object.entries(approvalList)
          .reduce((previousValue: any[], [key, value]: any) => {
            const latestId = value[0].id;
            // 打平同一个流程分类中的 historicTaskExtList，手动赋值 nodeStatusCode（组件阶段状态标签颜色需要）
            const historicTaskExtList = value.reduce((previousValue: any[], { historicTaskExtList = [] }: any) => {
              return previousValue.concat(historicTaskExtList.map(item => ({ ...item, nodeStatusCode: item.action })));
            }, []);
            // 将两个数据按照对应的流程分类编码进行合并
            const findNodeItem = nodeData.find((item) => item.value === key);
            const filledValue = findNodeItem ? [{ ...findNodeItem, latestId, historicTaskExtList }] : [];
            return previousValue.concat(filledValue);
          }, [])
          // 前端按照最新的节点id进行排序
          .sort((a, b) => Number(b.latestId) - Number(a.latestId));
        setApprovalData(newData);
      }
    } finally {
      setLoading(false);
    }
  }, [dataSource, readTransport, categoryLovCode]);

  useEffect(() => {
    handleInit();
  }, [handleInit]);

  const defaultActiveKey = approvalData.map(item => item.value);

  if (loading) return <Spin />;

  return (
    <div className={classNames(styles['apporval-wrapper'], {[styles['apporval-wrapper-empty']]: approvalData.length === 0})}>
      {approvalData.length > 0 ? (
        <Collapse ghost expandIconPosition="text-right" defaultActiveKey={defaultActiveKey}>
          {approvalData.map((item) => {
            const { value, meaning, historicTaskExtList } = item || {};
            return (
              <Panel header={meaning} key={value}>
                <ApproveRecord data={historicTaskExtList} />
              </Panel>
            );
          })}
        </Collapse>
      ) : (
        <div className={styles['empty-apporval-wrapper']}>
          <img src={emptySvg} />
          <div>{intl.get('hzero.common.message.data.none').d('暂无数据')}</div>
        </div>
      )}
    </div>
  );
};

export default ApprovalRecord;
