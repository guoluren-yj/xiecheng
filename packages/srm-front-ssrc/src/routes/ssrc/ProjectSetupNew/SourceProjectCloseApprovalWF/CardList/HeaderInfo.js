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
const HeaderInfoCmp = observer(() => {
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
    sourceProjectName: {
      render({ value }) {
        return value && <Text style={{ maxWidth: '350px' }}>{value}</Text>;
      },
    },
    closeTag: {
      withoutBg: true,
      render({ value }) {
        return (
          value && (
            <div style={{ backgroundColor: 'rgba(240,84,52,.1)', padding: '1px 4px' }}>
              <span style={{ color: '#f05434' }}>
                <Text style={{ maxWidth: '100px' }}>{value}</Text>
              </span>
            </div>
          )
        );
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
        code: getCustomizeUnitCode('headerBtn'),
        pro: true,
        btnType: 'c7n-pro',
      },
      <DynamicButtons buttons={getApprovalButtons} />
    );
  };

  return customizeCommon(
    {
      code: getCustomizeUnitCode('headerInfoAFBasic'),
      processUnitTag: 'AF-BASIC',
    },
    <AFBasic
      dataSet={headerDs}
      titleField="sourceProjectName"
      tagFields={['closeTag', 'projectFromMeaning']}
      normalFields={['createdByName', 'createUnitName']}
      contentBottomRender={renderApprovalHeaderButton}
      fieldsConfig={afFieldsConfig}
    />
  );
});

export default HeaderInfoCmp;
