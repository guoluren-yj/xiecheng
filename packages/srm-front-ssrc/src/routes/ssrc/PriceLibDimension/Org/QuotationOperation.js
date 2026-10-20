import React, { useCallback, useState, useEffect, memo } from 'react';
import { isEmpty } from 'lodash';
import { useDataSet } from 'choerodon-ui/pro';

import { getCurrentOrganizationId } from 'utils/utils';
import FilterBar from '_components/FilterBarTable/FilterBar';

import { getSearchDs } from '@/routes/spc/components/OperationRecord/getSearchDS';
import { OperationComponent } from '../components';

const fieldsConfig = {
  userName: {
    alias: 'realName',
  },
  typeCode: {
    alias: 'actionCode',
  },
  typeName: {
    alias: 'actionName',
  },
  time: {
    alias: 'creationDate',
  },
  remark: {
    alias: 'actionDetail',
  },
};

const QuotationOperation = ({
  onRef,
  showFlag,
  documentId,
  documentType,
  queryParams,
  operationType,
}) => {
  const [actionEnum, setActionEnum] = useState({}); // 操作集合
  const [hasData, setHasData] = useState(false); // 初次查询时是否有数据

  let operateRef = null;

  const fetchActionInfo = useCallback(() => {
    // 获取值集中的icon和记录类型documentName
    // queryIdpValue('SSRC_QUICK_OPERATION').then((res) => {
    const response = [
      {
        value: 'RELEASE',
        tag: 'publish2',
      },
      {
        value: 'NEW',
        tag: 'add',
      },
      {
        value: 'DISABLE',
        tag: 'not_interested',
      },
      {
        value: 'ENABLE',
        tag: 'finished',
      },
      {
        value: 'UPDATE',
        tag: 'mode_edit',
      },
    ];
    const actionMap = {};
    response.forEach(({ value, tag, description }) => {
      actionMap[value] = {
        icon: tag,
        documentName: description,
      };
    });
    setActionEnum(actionMap);
    // });
  }, [setActionEnum]);

  useEffect(() => {
    fetchActionInfo();
  }, [fetchActionInfo]);

  // 筛选器ds
  const searchDs = useDataSet(() => getSearchDs(documentId, documentType), [
    documentId,
    documentType,
  ]);

  // 筛选器触发的查询
  const handleQuery = ({ params = {} } = {}) => {
    const { operateTime, ...others } = params;
    const newOperateTime = operateTime?.split(',') || [];
    const operateDs = operateRef && operateRef.dataSet;
    if (operateDs) {
      operateDs.setQueryParameter('queryParams', {
        ...others,
        operateTimeFrom: newOperateTime[0],
        operateTimeTo: newOperateTime[1],
      });
      operateDs.query();
    }
  };

  const props = {
    actionEnum,
    setHasData,
    fieldsConfig,
    operationType,
    handleRef: (ref) => {
      operateRef = ref;
    },
    readTransport: {
      url: `/spc/v1/${getCurrentOrganizationId()}/price-lib-tmpl-actions/list`,
      method: 'GET',
      params: queryParams,
    },
  };

  return (
    !isEmpty(actionEnum) && (
      <>
        {showFlag && hasData && (
          <FilterBar
            onRef={onRef}
            dataSet={[searchDs]}
            autoQuery={false}
            expandable={false}
            defaultExpand={false}
            onQuery={handleQuery}
          />
        )}
        <OperationComponent {...props} />
      </>
    )
  );
};

export default memo(QuotationOperation);
