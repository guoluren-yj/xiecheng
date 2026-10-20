import React, { useCallback, useContext } from 'react';
import { AFBasic } from '_components/AFCards';
import DynamicButtons from '_components/DynamicButtons';
import { throttle } from 'lodash';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import { Text } from 'choerodon-ui';
import { Modal } from 'choerodon-ui/pro';

import useOperationRecordModal from '@/routes/components/OperationRecord/useModal';
import OperationRecord from '@/routes/ssrc/InquiryHallNew/RFDetail/OperationRecord';

import { StoreContext } from '../store/StoreProvider';

const { openModal } = useOperationRecordModal();

// 头信息基础卡片
const BasicCard = observer(() => {
  const {
    commonDs: { headerDs } = {},
    customizeBtnGroup,
    clarifyId,
    getCustomizeUnitCode,
    customizeCommon,
  } = useContext(StoreContext);

  // 打开操作记录弹框
  const handleShowOperationRecordModal = useCallback(
    throttle(() => {
      const { sourceId, sourceType } = headerDs?.current?.get(['sourceId', 'sourceType']) || {};

      // I\P
      if (['RFI', 'RFP'].includes(sourceType)) {
        handleOpenOperation({ sourceId, sourceType });
        return;
      }
      // 询价\招标
      openModal({
        rfxHeaderId: sourceId,
      });
    }, 500),
    [clarifyId]
  );

  // 操作记录弹框
  const handleOpenOperation = ({ sourceId, sourceType } = {}) => {
    const operationProps = {
      rfHeaderId: sourceId,
      rfTitle:
        sourceType === 'RFP'
          ? intl.get(`ssrc.rfDetail.view.title.RFP`).d('方案征询书')
          : intl.get(`ssrc.rfDetail.view.title.RFI`).d('信息征询书'),
    };

    Modal.open({
      key: Modal.key(),
      title: intl.get(`ssrc.common.view.title.operationRecord`).d('操作记录'),
      children: <OperationRecord {...operationProps} />,
      style: { width: '720px' },
      drawer: true,
      closable: true,
      okButton: false,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      cancelProps: {
        color: 'primary',
      },
    });
  };

  // 基础卡片字段配置
  const afFieldsConfig = {
    clarifyTitleAndNum: {
      render({ record }) {
        const { title, clarifyNum } = record?.get(['title', 'clarifyNum']) || {};
        return title || clarifyNum ? (
          <Text>{`${title}${clarifyNum ? `-${clarifyNum}` : clarifyNum}`}</Text>
        ) : null;
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
        code: getCustomizeUnitCode('afCardButtons'),
        pro: true,
        btnType: 'c7n-pro',
      },
      <DynamicButtons buttons={getApprovalButtons} />
    );
  };

  return customizeCommon(
    {
      code: getCustomizeUnitCode('afCard'),
      processUnitTag: 'AF-BASIC',
    },
    <AFBasic
      dataSet={headerDs}
      titleField="clarifyTitleAndNum"
      normalFields={['submittedByUserName', 'submittedDate']}
      tagFields={['sourceCategoryMeaning']}
      contentBottomRender={renderApprovalHeaderButton}
      fieldsConfig={afFieldsConfig}
    />
  );
});

export default BasicCard;
