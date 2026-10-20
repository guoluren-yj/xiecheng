import React, { useState, useCallback, useEffect } from 'react';
import { Collapse, Spin } from 'choerodon-ui';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { queryUnifyIdpValue } from 'services/api';
import ApproveRecord from '_components/ApproveRecord';

import { fetchApprovalData } from '../../utils/api';
import styles from '../index.less';

const { Panel } = Collapse;

export interface ApprovalRecordProps {
  // 单据 ID
  documentId?: string | number;
  // 单据类型
  documentType?: string;
  // 数据源
  dataSource?: Record<string, any>;
}

// 审批记录
const ApprovalRecord = (props: ApprovalRecordProps) => {

  const { documentId, documentType, dataSource } = props;
  const [loading, setLoading] = useState(true);
  const [approvalData, setApprovalData] = useState<any[]>([]);

  const handleInit = useCallback(async () => {
    try {
      const [nodeData, approvalDataMap] = (await Promise.all([
        queryUnifyIdpValue('SQAM.PROCESS_DEFINITION'),
        // 如果父组件已查询过数据源无需重复查询
        dataSource || fetchApprovalData({ primaryId: documentId, documentType }),
      ])).map(item => getResponse(item));
      if (!isEmpty(nodeData) && !isEmpty(approvalDataMap)) {
        const newData = Object.entries(approvalDataMap)
          .reduce((previousValue: any[], [key, value]: any) => {
            const latestId = value[0].id;
            // 打平同一个流程分类中的 historicTaskExtList，手动赋值 nodeStatusCode（组件阶段状态标签颜色需要）
            // eslint-disable-next-line no-shadow
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
  }, [documentId, documentType, dataSource]);

  useEffect(() => {
    handleInit();
  }, [handleInit]);

  const defaultActiveKey = approvalData.map(item => item.value);

  if (loading) return <Spin />;

  return (
    <div className={styles['apporval-wrapper']}>
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
          <span>{intl.get('sqam.common.view.message.noData').d('暂无数据')}</span>
        </div>
      )}
    </div>
  );
};

export default ApprovalRecord;
