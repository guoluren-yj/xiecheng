import React, { useCallback, useState, useEffect, memo } from 'react';
import { isEmpty } from 'lodash';

import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { queryIdpValue } from 'services/api';

import QuickInquiryFilter from '@/routes/components/OperationRecordFilter/QuickInquiryFilter';

import OperationRecord from '../../../components/OperationComponent';

const fieldsConfig = {
  userName: {
    alias: 'processUserName',
  },
  typeCode: {
    alias: 'processOperation',
  },
  typeName: {
    alias: 'processOperationMeaning',
  },
  time: {
    alias: 'processDate',
  },
  remark: {
    alias: 'processRemark',
  },
  camp: {
    alias: 'processType',
  },
  loginName: {
    alias: 'processLoginName',
  },
};

const QuotationOperation = ({ rfqQuotationId, handleOperationRef }) => {
  const [actionEnum, setActionEnum] = useState({}); // 操作集合

  const fetchActionInfo = useCallback(() => {
    // 获取值集中的icon和记录类型documentName
    queryIdpValue('SSRC_QUICK_OPERATION').then((res) => {
      const response = getResponse(res);
      if (response) {
        const actionMap = {};
        response.forEach(({ value, tag, description }) => {
          actionMap[value] = {
            icon: tag,
            documentName: description,
          };
        });
        setActionEnum(actionMap);
      }
    });
  }, [setActionEnum]);

  useEffect(() => {
    fetchActionInfo();
  }, [fetchActionInfo]);

  const props = {
    actionEnum,
    fieldsConfig,
    handleOperationRef,
    FilterComp: (ds) => {
      if (!ds) return null;
      // 筛选器查询
      const filterQuery = (filterParams) => {
        ds.setQueryParameter('filterParams', filterParams);
        ds.query();
      };
      return <QuickInquiryFilter onQuery={filterQuery} />;
    },
    readTransport: ({ dataSet }) => {
      const { queryParameter: { filterParams } = {} } = dataSet;
      return {
        url: `/ssrc/v1/${getCurrentOrganizationId()}/purchase/quick-actions/view/list`,
        method: 'POST',
        data: { rfqQuotationId, ...(filterParams || {}) },
      };
    },
  };

  return !isEmpty(actionEnum) && <OperationRecord {...props} />;
};

export default memo(QuotationOperation);
