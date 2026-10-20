import React, { useCallback, useContext } from 'react';
import { AFBasic } from '_components/AFCards';
import DynamicButtons from '_components/DynamicButtons';
import { throttle } from 'lodash';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import { Text } from 'choerodon-ui';

import useOperationRecordModal from '@/routes/components/ProjectOperationRecord/useModal';

import { StoreContext } from '../store/StoreProvider';

const { openModal } = useOperationRecordModal();

// 头信息基础卡片
const BasicCard = observer(() => {
  const {
    commonDs: { headerDs } = {},
    customizeBtnGroup,
    sourceProjectId,
    getCustomizeUnitCode,
    customizeCommon,
  } = useContext(StoreContext);

  // 打开操作记录弹框
  const handleShowOperationRecordModal = useCallback(
    throttle(() => {
      openModal({
        sourceProjectId,
      });
    }, 500),
    [sourceProjectId]
  );

  // 基础卡片字段配置
  const afFieldsConfig = {
    sourceProjectNameAndNum: {
      render({ record }) {
        const { sourceProjectName, sourceProjectNum } =
          record?.get(['sourceProjectName', 'sourceProjectNum']) || {};
        return sourceProjectName || sourceProjectNum ? (
          <Text>
            {`${sourceProjectName}${sourceProjectNum ? `-${sourceProjectNum}` : sourceProjectNum}`}
          </Text>
        ) : null;
      },
    },
    sourceProjectCreatedByName: {
      render({ record }) {
        return record?.get('createdByName') || null;
      },
    },
  };

  const getApprovalButtons = [
    {
      name: 'operationRecord',
      btnType: 'c7n-pro',
      child: intl.get(`ssrc.inquiryHall.view.message.button.record`).d('操作记录'),
      btnProps: {
        icon: 'operation_service_request',
        onClick: handleShowOperationRecordModal,
        funcType: 'flat',
        style: { color: '#1d2129' },
      },
    },
  ];

  // 头信息卡片按钮
  const renderApprovalHeaderButton = () => {
    return customizeBtnGroup(
      {
        code: getCustomizeUnitCode('headerAfCardButtons'),
        pro: true,
        btnType: 'c7n-pro',
      },
      <DynamicButtons buttons={getApprovalButtons} />
    );
  };

  return customizeCommon(
    {
      code: getCustomizeUnitCode('headerAfCard'),
      processUnitTag: 'AF-BASIC',
    },
    <AFBasic
      dataSet={headerDs}
      titleField="sourceProjectNameAndNum"
      normalFields={['sourceProjectCreatedByName', 'creationDate']}
      contentBottomRender={renderApprovalHeaderButton}
      fieldsConfig={afFieldsConfig}
    />
  );
});

export default BasicCard;
