/* eslint-disable no-param-reassign */
import React, { useCallback } from 'react';
import { Button } from 'choerodon-ui/pro';
// import { c7nModal } from '@/routes/components/CustomSpecsModal';
import intl from 'utils/intl';
// import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';
// import notification from 'utils/notification';
// import { saveInventoryList } from '@/services/inventoryManageService';
// import LineDetail from './List/LineDetail';

function useLineModal(ConfigDs, history, handleEnableFlagChange) {
  return useCallback(({ record }) => {
    const { strategyHeaderId, processFactory } = record.get(['strategyHeaderId', 'processFactory']);
    ConfigDs.setState('processFactory', processFactory);
    const showRecordModal = () => {
      history.push({
        pathname: '/sinv/inventoryManageConfig/detail',
        search: `strategyHeaderId=${strategyHeaderId}&processFactory=${processFactory}&edit=1&onback=1`,
      });
      // return c7nModal({
      //   style: { width: 742 },
      //   title: `${intl.get(`sinv.common.model.common.InventoryDetail`).d('委外协同类型明细')}`,
      //   children: (
      //     <LineDetail
      //       WeekDs={WeekDs}
      //       ConfigDs={ConfigDs}
      //       HeaderDetailDs={HeaderDetailDs}
      //       strategyHeaderId={strategyHeaderId}
      //       processFactory={processFactory}
      //       PermissionCompDS={PermissionCompDS}
      //     />
      //   ),
      //   onOk: async () => {
      //     const HeaderFlag = await HeaderDetailDs.validate();
      //     const lineFlag = await ConfigDs.validate();
      //     const autoFlag = processFactory === 1 ? await WeekDs.validate() : true;
      //     if (!HeaderFlag || !lineFlag || !autoFlag) return false;
      //     if (HeaderFlag && lineFlag && autoFlag) {
      //       HeaderDetailDs.status = 'submitting';
      //       PermissionCompDS.status = 'submitting';
      //       ConfigDs.status = 'submitting';
      //       WeekDs.status = 'submitting';
      //       const params = {
      //         // ...AutoDs.current.toData(),
      //         ...HeaderDetailDs?.current?.toData(),
      //         stockOutStrategyLines: ConfigDs.map((i) => i.toJSONData()).map((x) => ({
      //           ...x,
      //           strategyHeaderId,
      //           tenantId: getCurrentOrganizationId(),
      //         })),
      //         stockOutStockMappingList:
      //           processFactory === 1
      //             ? WeekDs.map((i) => i.toJSONData()).map((x) => ({
      //                 ...x,
      //                 strategyHeaderId,
      //                 tenantId: getCurrentOrganizationId(),
      //               }))
      //             : [],
      //       };
      //       const res = await saveInventoryList(params);
      //       if (getResponse(res)) {
      //         // HeaderDetailDs.status = 'ready';
      //         notification.success();
      //         AutoDs.reset();
      //         ConfigDs.removeAll(true);
      //         WeekDs.removeAll(true);
      //         ListDs.query();
      //         return true;
      //       }
      //       HeaderDetailDs.status = 'ready';
      //       PermissionCompDS.status = 'ready';
      //       ConfigDs.status = 'ready';
      //       WeekDs.status = 'ready';
      //       return false;
      //     }
      //   },
      // });
    };
    return (
      // <a onClick={showRecordModal}>
      //   {' '}
      //   {intl.get(`sinv.common.model.common.InventoryDetailShow`).d('明细维护')}
      // </a>
      <div>
        <Button
          style={{ marginRight: '8px' }}
          color="primary"
          funcType="link"
          onClick={showRecordModal}
        >
          {intl.get('hzero.common.view.button.edit').d('编辑')}
        </Button>
        {[0].includes(record?.get('enableFlag')) && (
          <Button color="primary" funcType="link" onClick={() => handleEnableFlagChange(record, 1)}>
            {intl.get('hzero.common.bomViewStatus.enable').d('启用')}
          </Button>
        )}
        {[1].includes(record?.get('enableFlag')) && (
          <Button color="primary" funcType="link" onClick={() => handleEnableFlagChange(record, 0)}>
            {intl.get('hzero.common.status.disabled').d('禁用')}
          </Button>
        )}
      </div>
    );
  }, []);
}

function useYesOrNoRender() {
  return useCallback(({ value }) => {
    return yesOrNoRender(+value);
  }, []);
}

export { useLineModal, useYesOrNoRender };
