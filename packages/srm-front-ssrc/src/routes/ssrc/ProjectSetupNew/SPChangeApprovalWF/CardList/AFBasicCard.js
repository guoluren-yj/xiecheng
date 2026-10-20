import React, { useCallback, useContext } from 'react';
import { AFBasic } from '_components/AFCards';
import DynamicButtons from '_components/DynamicButtons';
import { throttle } from 'lodash';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import { Text, Tabs } from 'choerodon-ui';

import useOperationRecordModal from '@/routes/components/ProjectOperationRecord/useModal';

import { StoreContext } from '../store/StoreProvider';

import Style from '../index.less';

const { openModal } = useOperationRecordModal();

const { TabPane } = Tabs;

// 头信息基础卡片
const BasicCard = observer((props) => {
  const {
    commonDs: { headerDs } = {},
    customizeBtnGroup,
    sourceProjectId,
    getCustomizeUnitCode,
    customizeCommon,
  } = useContext(StoreContext);

  const { handleChangeTab } = props;

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
    return (
      <div className={Style['ssrc-sp-af-buttons-wrapper']}>
        {customizeBtnGroup(
          {
            code: getCustomizeUnitCode('headerAfCardButtons'),
            pro: true,
            btnType: 'c7n-pro',
          },
          <DynamicButtons buttons={getApprovalButtons} />
        )}
        <div className={Style['ssrc-sp-af-right-buttons']}>
          <Tabs
            onChange={handleChangeTab}
            type="second-level"
            tabBarStyle={{ border: 'none', marginBottom: 0 }}
          >
            <TabPane
              tab={intl
                .get('ssrc.projectSetup.view.button.spChange.showChangeData')
                .d('展示变更后数据')}
              key="allChange"
            />
            <TabPane
              tab={intl
                .get('ssrc.projectSetup.view.button.spChange.showOnlyChangeData')
                .d('仅展示变更项')}
              key="onlyChange"
            />
          </Tabs>
        </div>
      </div>
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
