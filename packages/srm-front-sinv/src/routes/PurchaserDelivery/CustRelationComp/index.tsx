/**
 * index.js 关联单据
 * @date: 2024-01-29
 * @author: zuoxiangyu <xaingyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2024, Hand
 */
import React, { FC, Fragment, useMemo } from 'react';
// import { compose } from 'lodash';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { TableBoxSizing } from 'choerodon-ui/pro/lib/table/enum';
import { DataSet, Table } from 'choerodon-ui/pro';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections.js';
import { useMount } from '@/utils/utils';
import { indexDataSet } from '@/routes/components/CustomFormAndTableWrapper';

import { lineDataColumns } from './_utils';
import { lineColumns, queryingNodeData } from './methods';

interface IndexProps {
  disabled?: boolean,
  className?: string;
  history?: any,
  asnLineId: string,
  dataSet?: DataSet,
  customizeTable:any,

}
interface PropsParams {
  history?: any,
  asnLineId: string,
  customizeTable:any,
}

const Index: FC<IndexProps> = (props: PropsParams) => {
  const { history, asnLineId, customizeTable } = props;
  const {
    nodeColumns = [],
  } = lineColumns(history);
  const nodeDs = useMemo(() => new DataSet(indexDataSet({
    componentData: nodeColumns,
    read: queryingNodeData,
    selection: false,
    pageSize: 20,
    paging: true,
  })), []);
  useMount(() => {
    // queryList();
    nodeDs.setQueryParameter('params', {
      asnLineId,
    });
    nodeDs.query();
  }, []);

  // const queryList = async() => {
  //   const res = await queryingNodeData(asnLineId) || {content: []};
  //   nodeDs.loadData(res?.content);
  // };

  return (
    <Fragment>
      <div style={{ height: 'calc(100vh - 245px)' }}>
        {customizeTable(
          {
            code: `SINV.PURCHASER_DELIVERY_LIST.CARDS`,
            dataSet: nodeDs,
            __force_record_to_update__: true,
          },
          <Table
            dataSet={nodeDs}
            boxSizing={TableBoxSizing.wrapper}
            style={{ maxHeight: `calc(100% - 22px)` }}
            columns={lineDataColumns(nodeColumns)}
          />
        )}
      </div>
    </Fragment>
  );
};


export default WithCustomize({
    unitCode: ['SINV.PURCHASER_DELIVERY_LIST.CARDS'],
    queryMethod: 'POST',
})(
  formatterCollections({
    code: [
      'sinv.common',
      'hzero.common',
      'slod.deliveryWorkbench',
      'slod.common',
      'sinv.deliveryCreation',
      'sinv.receiptWorkbench',
      'sinv.receiptExecution',
    ],
  })(Index)
  );