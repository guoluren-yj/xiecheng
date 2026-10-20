import React, { useMemo, useEffect } from 'react';
import { Tabs, Timeline, Icon, Collapse } from 'choerodon-ui';
import { DataSet, Spin, Table } from 'choerodon-ui/pro';
import type { Record } from 'choerodon-ui/dataset';
import { observer } from 'mobx-react-lite';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';

import { tableData } from './dataSourceDs';
import { actionTypeGetActionIcon } from './utils';
import { ModalContentProps } from './interfaceAll';
import './index.less';

const { TabPane } = Tabs;
const { Item } = Timeline;
const { Panel } = Collapse;

const columns = [
  {
    name: 'processUserIdMeaning',
  },
  {
    name: 'processDate',
  },
  {
    name: 'processStatusMeaning',
  },
  {
    name: 'remark',
  },
];

function ModalContent(props: ModalContentProps) {
  const { modalContentType, tableUrl, statusIconTypes, tableOtherParams, recordName} = props;

  const tableDataDs = useMemo(() => new DataSet(tableData()), []);

  useEffect(() => {
    tableDataDs.setQueryParameter('url', tableUrl);
    tableDataDs.setQueryParameter('parmasOther', tableOtherParams);
    tableDataDs.query();
  }, []);

  /**
   * processedByName - 操作人
   * processStatusMeaning  - 操作动作
   * name | recordName - 具体名称【比如单据名称，模块名称】 recordName: 自定义名称
   * processDate：操作时间
   */

  const renderActionHeader = (record: Record) => {
    const {processStatus='', processedByName='', processStatusMeaning='', name} = record.get(['processStatus', 'processedByName', 'processStatusMeaning', 'name', 'processDate']);
    return (
      // eslint-disable-next-line react/jsx-filename-extension
      <>
        <Icon
          type={
            actionTypeGetActionIcon(processStatus, statusIconTypes) || 'disabled_by_default'
          }
        />
        <div className="actionTab-header">
          <span className='action-name'>{processedByName}</span>
          <span className="action-words">{processStatusMeaning}{intl.get('scux.operationRecordNew.model.le').d('了')}</span>
          <span style={{fontSize: '13px'}}>【{name || recordName}】</span>
        </div>
      </>
    );
  };

  const renderActionDetail = (record: Record) => {
    return (
      <div className="action-words" style={{marginLeft: '16px'}}>
        <span>{intl.get('scux.operationRecordNew.model.remark').d('备注')}</span>
        <span>{record.get('remark')}</span>
      </div>
    );
  };

  const OperationRender = observer((props1: {dataSet: DataSet}) => {
    return (
      <Spin dataSet={props1.dataSet}>
        <Timeline className='common-timeline-sitf'>
          {props1.dataSet.map((record: Record) => {
            const {processDate, remark} = record.get(['processDate', 'remark']);
            return (
              <Item color='#E5E5E5'>
                <Collapse bordered={false} expandIconPosition="right">
                  <Panel header={renderActionHeader(record)} key={record.get('id')} showArrow={!isEmpty(remark)} disabled={isEmpty(remark)}>
                    {renderActionDetail(record)}
                  </Panel>
                  <div className="action-words" style={{marginLeft: '33px', paddingBottom: '10px', borderBottom: '0.01rem solid #e0e0e0'}}>{processDate}</div>
                </Collapse>
              </Item>
            );
          })}
        </Timeline>
      </Spin>
    );
  });

  return modalContentType === 'notabs' ? (
    <Table dataSet={tableDataDs} columns={columns} />
  ) : (
    <Tabs>
      <TabPane tab={intl.get('scux.operationRecordNew.view.title.operation.record').d('操作记录')}>
        <OperationRender dataSet={tableDataDs} />
      </TabPane>
    </Tabs>
  );
}

export default ModalContent;
