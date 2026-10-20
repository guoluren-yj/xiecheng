import React, { useContext, useMemo, useCallback } from 'react';
import { Text } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { noop, throttle } from 'lodash';

import { AFBasic } from '_components/AFCards';
import DynamicButtons from '_components/DynamicButtons';
import intl from 'utils/intl';
import useOperationRecordModal from '@/routes/components/OperationRecord/useModal';

import { StoreContext } from '../store/StoreProvider';

const { openModal } = useOperationRecordModal();

const HeaderInfo = () => {
  const {
    commonDs: { basicFormDs },
    customizeCommon = noop,
    customizeBtnGroup = noop,
    getCustomizeUnitCode = noop,
  } = useContext(StoreContext);

  // 基础卡片字段配置
  const afFieldsConfig = {
    sourceNumTitle: {
      render({ record }) {
        if (record) {
          const { clarifyNotifyTitle, clarifyNotifyNum } = record?.get([
            'clarifyNotifyTitle',
            'clarifyNotifyNum',
          ]);
          return (
            <Text style={{ maxWidth: '350px' }}>{`${clarifyNotifyTitle}-${clarifyNotifyNum}`}</Text>
          );
        }
        return '';
      },
    },
  };

  // 操作记录
  const handleShowOperationRecordModal = useCallback(
    throttle(() => {
      openModal({
        rfxHeaderId: basicFormDs?.current?.get('sourceHeaderId'),
      });
    }, 500),
    [basicFormDs?.current]
  );

  // 按钮组
  const getApprovalButtons = useMemo(() => {
    return [
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
  }, []);

  const renderApprovalHeaderButton = () => {
    return (
      <div className="content-bottom-render">
        {customizeBtnGroup(
          {
            code: getCustomizeUnitCode('buttons'),
            pro: true,
            btnType: 'c7n-pro',
          },
          <DynamicButtons buttons={getApprovalButtons} />
        )}
      </div>
    );
  };

  return (
    <React.Fragment>
      {customizeCommon(
        {
          code: getCustomizeUnitCode('headerInfo'),
          processUnitTag: 'AF-BASIC',
        },
        <AFBasic
          dataSet={basicFormDs}
          titleField="sourceNumTitle"
          tagFields={['clarifyNotifyTypeMeaning']}
          normalFields={['submittedByName']}
          contentBottomRender={renderApprovalHeaderButton}
          fieldsConfig={afFieldsConfig}
        />
      )}
    </React.Fragment>
  );
};

export default observer(HeaderInfo);
