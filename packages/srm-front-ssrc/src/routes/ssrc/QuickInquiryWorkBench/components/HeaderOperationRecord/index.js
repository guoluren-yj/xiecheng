import React, { useCallback, useState, useEffect, memo, useImperativeHandle, useRef } from 'react';
import { isEmpty } from 'lodash';
import { Button, Modal } from 'choerodon-ui/pro';

import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { queryIdpValue } from 'services/api';
import intl from 'utils/intl';

import QuickInquiryFilter from '@/routes/components/OperationRecordFilter/QuickInquiryFilter';
import commonStyles from '@/routes/ssrc/common.less';
import OperationRecordExport from '@/routes/components/OperationRecordExport';

import OperationRecord from '../../../components/OperationComponent';

// 操作记录内容
const OperationRecordContent = memo(({ rfqHeaderId, handleOperationRef }) => {
  const [actionEnum, setActionEnum] = useState({}); // 操作集合
  const currentFilterParamsRef = useRef({});

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

  const fetchActionInfo = useCallback(() => {
    // 获取值集中的icon和记录类型documentName
    queryIdpValue('SSRC_QUICK_HEADER_OPERATION').then((res) => {
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

  // 暴露子组件的api给父组件使用
  useImperativeHandle(
    handleOperationRef,
    () => ({
      getFilterParams,
    }),
    [currentFilterParamsRef?.current]
  );

  const getFilterParams = () => {
    const { currentFilterParams } = currentFilterParamsRef?.current || {};

    return currentFilterParams;
  };

  const props = {
    actionEnum,
    fieldsConfig,
    FilterComp: (ds) => {
      if (!ds) return null;
      // 筛选器查询
      const filterQuery = (filterParams) => {
        ds.setQueryParameter('filterParams', filterParams);
        currentFilterParamsRef.current.currentFilterParams = filterParams;
        ds.query();
      };
      return <QuickInquiryFilter headerOperationFlag onQuery={filterQuery} />;
    },
    readTransport: ({ dataSet }) => {
      const { queryParameter: { filterParams } = {} } = dataSet;
      return {
        url: `/ssrc/v1/${getCurrentOrganizationId()}/quick-header-actions/view/list`,
        method: 'POST',
        data: { rfqHeaderId, ...(filterParams || {}) },
      };
    },
  };

  return !isEmpty(actionEnum) && <OperationRecord {...props} />;
});

// 列表-快速询价批次单头操作记录
const HeaderOperationRecord = memo(({ buttonProps, headerRecord, handleOperationRef }) => {
  if (!headerRecord) return null;
  const handleHeaderOperationRecords = () => {
    // 获取最新rfqQuotationId
    const rfqHeaderId = headerRecord?.get('rfqHeaderId');
    if (!rfqHeaderId) return;
    return Modal.open({
      drawer: true,
      key: 'quick-inquiry-header-operation-records',
      title: intl.get('hzero.common.button.operating').d('操作记录'),
      className: commonStyles['ssrc-medium-modal'],
      children: (
        <OperationRecordContent rfqHeaderId={rfqHeaderId} handleOperationRef={handleOperationRef} />
      ),
      okCancel: false,
      destroyOnClose: true,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      footer: (okBtn) => {
        return (
          <>
            {okBtn}
            <OperationRecordExport
              sourceId={rfqHeaderId}
              type="QUICK_RFQ_HEADER"
              operationRef={handleOperationRef}
            />
          </>
        );
      },
    });
  };

  return (
    <Button onClick={handleHeaderOperationRecords} {...(buttonProps || {})}>
      {intl.get('ssrc.quickInquiry.quickReply.view.message.title.operationRecord').d('操作记录')}
    </Button>
  );
});

export { OperationRecordContent };

export default HeaderOperationRecord;
