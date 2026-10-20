/**
 * DocRelation
 * 关联单据
 * @date: 2021-12-10
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useState, useEffect, useCallback } from 'react';
import { TabsPosition } from 'choerodon-ui/lib/tabs/enum';
import { Tabs, Spin } from 'choerodon-ui';
import { Attachment, DataSet, Table, Tooltip} from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { TableBoxSizing } from 'choerodon-ui/pro/lib/table/enum';

import intl from 'utils/intl';
import { queryNodeRelDocInfo } from './docFlowService';

// FlowChart interface
interface DocRelationProps {
  remote: {
    process: Function;
  };
  tableName: string;
  tablePk: string;
  currentOrganizationId: number;
}

// NodeRelDocInfoRow interface
interface NodeRelDocInfoRow {
  fieldCode: string;
  fieldMeaning: string;
  fieldValue: string;
}

// DocRelationLi interface
interface DocRelationLi {
  nodeName: string;
  quantity: number;
  nodeRelDocInfo: Array<Array <NodeRelDocInfoRow>>;
}

const { TabPane } = Tabs;

function DocRelation (props: DocRelationProps) {

  const { tableName, tablePk, currentOrganizationId, remote } = props;
  const [docRelationLoading, handleDocRelationLoading] = useState(true);
  const [docRelationList, setDocRelationList] = useState([]);

  useEffect(() => {
    handleDocRelationLoading(true);
    queryNodeRelDocInfo({
      tableName,
      tablePk,
      currentOrganizationId,
    }).then((res) => {
      if(getResponse(res)) {
        setDocRelationList(res || []);
      }
    }).finally(() => handleDocRelationLoading(false));
  }, []);

  /**
   * 动态渲染关联单据表格
   * 数据是二维数组， 直接拿 [0][0] 来生成表头， 然后二次循环生成表格数据
   * @param nodeRelDocInfo 渲染表格数据
   * @returns
   */
  const renderDocTable = (nodeRelDocInfo) => {
    // 暂时给格式为 any
    const fields = [] as any;
    const columns = [] as any;
    const data = [] as any;
    for (let i = 0; i < nodeRelDocInfo.length; i++) {
      const currentRow = nodeRelDocInfo[i];
      const dataCell = {};
      for (let j = 0; j < currentRow.length; j++) {
        if(i === 0) {
          if(currentRow[j]?.attachmentFlag === 1){
            fields.push({
              name: currentRow[j].fieldCode,
              label: currentRow[j].fieldMeaning,
              type: 'attachment',
              bucketName: currentRow[j].bucketCode,
            });
          }else{
            fields.push({
              name: currentRow[j].fieldCode,
              label: currentRow[j].fieldMeaning,
              type: 'string',
            });
          }

          if(currentRow[j]?.attachmentFlag === 1){
            columns.push({
              name: currentRow[j].fieldCode,
              // dataIndex: currentRow[j].fieldCode,
              // key: currentRow[j].fieldCode,
              // title: currentRow[j].fieldMeaning,
              renderer: ({value}) => (
                <Attachment
                  readOnly
                  labelLayout={LabelLayout.float}
                  viewMode="popup"
                  value={value}
                  bucketName={currentRow[j].bucketCode}
                />
              ),
            });
          }else{
            columns.push({
              name: currentRow[j].fieldCode,
              // dataIndex: currentRow[j].fieldCode,
              // key: currentRow[j].fieldCode,
              // title: currentRow[j].fieldMeaning,
            });
          }
        }
        dataCell[currentRow[j].fieldCode] = currentRow[j].fieldValue;
      }
      data.push(dataCell);
    }
    const lineDs = new DataSet({
      selection: false,
      pageSize: 20,
      fields,
    });
    lineDs?.loadData(data);
    return (
      <div style={{
        height: 'calc(100vh - 210px)',
      }}
      >
        <Table
          dataSet={lineDs}
          boxSizing={TableBoxSizing.wrapper}
          style={{ maxHeight: `calc(100% - 22px)` }}
          // filterBar={false}
          // dataSource={data}
          columns={remote ? remote.process('DOC_FLOW_PROCESS_COLUMNS', columns, { nodeRelDocInfo, lineDs }) :columns}
          customizable
          customizedCode="new-node-receiptManageConfig-workbench"
        />
      </div>

    );
  };

  /**
   * 渲染关联单据tabs
   */
  const renderDocRelation = useCallback((docRelationList) => {
    if(docRelationList.length > 0) {
      return (
        <Tabs className='doc-flow-relation-tab' tabPosition={TabsPosition.left}>
          {docRelationList.map((li: DocRelationLi) => {
            return (
              <TabPane tab={`${li.nodeName}  ${li.quantity}`}>
                {renderDocTable(li.nodeRelDocInfo)}
              </TabPane>
            );
          })}
        </Tabs>
      );
    } else {
      return <div className='doc-flow-relation-emptyText'>{intl.get('component.docFlow.Table.emptyText').d('暂无数据')}</div>;
    }

  }, [docRelationList]);

  return (
    <Spin spinning={docRelationLoading}>
      <div className='doc-flow-relation-table'>
        {renderDocRelation(docRelationList)}
      </div>
    </Spin>
  );
}

export default DocRelation;
