import React, {useMemo, useEffect} from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import intl from 'hzero-front/lib/utils/intl';
import { TableBoxSizing } from 'choerodon-ui/pro/lib/table/enum';

import indexDataSet, {lineDataColumns} from '@/components/CustomWrapperDs';
import { queryList, handleOpenLineLink } from './methods';

const ExecutionRecord = (props) => {
    const {nodeTemplateCode = null, nodeConfigId= null, doubleUnitEnabled} = props;
    const columns = [
        {
            name: 'createdName',
            type: 'string',
            label: intl.get('slod.common.model.receipt.createdName').d('操作人'),
        },
        {
            name: 'creationDate',
            type: 'string',
            width: 150,
            label: intl.get('slod.common.model.receipt.creationDate').d('时间'),
        },
        {
            name: 'processTypeMeaning',
            type: 'string',
            label: intl.get('slod.common.model.receipt.processTypeMeaning').d('类型'),
        },
        {
            name: 'processStatusMeaning',
            type: 'string',
            label: intl.get('slod.common.model.receipt.processStatusMeaning').d('执行状态'),
            renderer: ({ value, record }) => {
                const processStatus = record?.get('processStatus') || null;
                const _color = { 1: "yellow", 2: "green", 3: "red"};
                return (
                  <Tag color={_color[processStatus]} style={{ border: 'none' }}>
                    {value}
                  </Tag>
                  );
            },
        },
        {
            name: 'processRemark',
            type: 'string',
            width: 150,
            label: intl.get('slod.common.model.receipt.processRemark').d('结果'),
        },
        {
            name: 'batchNum',
            type: 'string',
            width: 150,
            label: intl.get('slod.common.model.receipt.batchNum').d('批次号'),
        },
        {
            name: 'link',
            type: 'string',
            label: intl.get('slod.common.model.receipt.link').d('超链接'),
            renderer: ({ record }) => {
                const linkProps = {
                    nodeConfigId,
                    nodeTemplateCode,
                    doubleUnitEnabled,
                    recordHeaderId: record?.get('recordHeaderId') || null,
                };
                if (record?.get('processStatus') === 3) {
                    return (
                      <a onClick={() => handleOpenLineLink(linkProps)}>{intl.get('slod.common.model.receipt.errorMessage').d('错误信息')}</a>
                      );
                }
                return '-';
            },
        },
    ];
    const indexDs = useMemo(() => new DataSet(indexDataSet({
        componentData: columns,
        queryParams: null,
        selection: false,
        pageSize: 20,
        paging: true,
        read: ()=> queryList({nodeTemplateCode, nodeConfigId}),
    })), []);

    useEffect(() => {
        indexDs.query();
    }, []);

    return (
      <div style={{ height: 'calc(100vh - 160px)' }}>
        <Table
          virtual
          virtualCell
          dataSet={indexDs}
          columns={lineDataColumns(columns)}
          boxSizing={TableBoxSizing.wrapper}
          style={{ maxHeight: `calc(100% - 25px)` }}
        />
      </div>
    );
};

export default ExecutionRecord;