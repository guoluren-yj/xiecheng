import React, { useMemo, useState, useCallback } from 'react';
import { isEmpty, pickBy } from 'lodash';
import { observer, useComputed } from 'mobx-react-lite';
import { Modal, Form, Lov, TextArea, DataSet } from 'choerodon-ui/pro';
import { routerRedux } from 'dva/router';

import DynamicButtons from '_components/DynamicButtons';
import PermissionButton from '_components/PermissionButton';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';

import { toSuspend, referenceWhitelist } from '@/services/spcm/workspaceService';
import { transferSourceResults } from '@/services/commonServices';

import showManuallyModal from './Modal/ManuallyModal';

// 转交弹窗 DataSet
const createTransferDs = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'transferUser',
      label: intl.get('spcm.workspace.view.model.scux.trip.transferUser').d('新合同签订人'),
      type: 'object',
      required: true,
      lovCode: 'SPRM.PURCHASE_AGENT',
      transformRequest: (value) => value.purchaseAgentCode,
    },
    {
      name: 'purchaseAgentId',
      type: 'string',
      bind: 'transferUser.purchaseAgentId',
    },
    {
      name: 'transferReason',
      label: intl.get('spcm.workspace.view.model.scux.trip.transferReason').d('转交说明'),
      type: 'string',
      required: true,
    },
  ],
});

const HeaderButtons = observer((props) => {
  const { sourcingResultsDs, extractConfig, dispatch } = props;

  const [btnLoading, setBtnLoading] = useState(false);
  const { enableSmartContract, enableOnlineAttachmentContract } = extractConfig || {};

  const selectedRows = useComputed(() => sourcingResultsDs?.selected || []);

  const hasDifferent = useComputed(() => {
    if (sourcingResultsDs) {
      return sourcingResultsDs?.records.every((i) => i.get('contractPendingFlag') === '0');
    }
  });

  /**
   * 查询是否在【引用寻源结果列表个性化字段填充协议头字段】-白名单中，不在白名单则去掉扩展字段
   */
  const handleSourceResultDTOs = async (selRows) => {
    const res = getResponse(await referenceWhitelist());
    // Y-在白名单，无需去掉扩展字段，N-不在白名单，需要去掉扩展字段。
    if (res === 'N') {
      // 过滤掉所有扩展字段
      return {
        sourceResultDTOs: selRows.map((row) =>
          pickBy(row, (val, key) => !key.includes('attribute'))
        ),
      };
    } else if (res) {
      return {
        sourceResultDTOs: selRows,
      };
    }
    return false;
  };

  // 新建
  const handleCreate = async () => {
    setBtnLoading(true);
    const selRows = sourcingResultsDs?.selected.map((item) => item.toData());
    // 建议，不要在这里做判断，把类型传到MODAL里面，请modal里面做判断，请求不同的接口
    if (selRows.length === 0) {
      notification.error({
        message: intl
          .get('spcm.workspace.view.title.noSelectReferenceDocument')
          .d('没有勾选相应的引用单据'),
      });
      setBtnLoading(false);
      return;
    }

    // 并单规则检验
    const res = await dispatch({
      type: 'workSpace/sourceCreate',
      payload: {
        type: 'sourcingResults',
        body: selRows,
      },
    });

    if (res) {
      let payload = {};
      // 去除适用范围
      const filterSelectedRows = res.map((i) => {
        const { sourceAppScopeLineDTOs, ...others } = i;
        return {
          ...others,
          sourceAppScopeLineDTOs: null,
        };
      });
      payload = await handleSourceResultDTOs(filterSelectedRows || []);
      if (!payload) {
        setBtnLoading(false);
        return false;
      }
      const modalRes = await Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: intl
          .get('spcm.scux.view.message.title.cux.trip.referenceDocConfirmCreate')
          .d(
            '合同正式签署前，请务必按照公司流程规范，提交至法务部进行法律风险审核，并咨询财务部进行税务及资金条款审核。'
          ),
      });
      if (modalRes !== 'ok') {
        setBtnLoading(false);
        return false;
      }
      dispatch({
        type: 'workSpace/updateState',
        payload,
      });
      if (enableSmartContract || enableOnlineAttachmentContract) {
        showManuallyModal({
          enableSmartContract,
          dispatch,
          referenceKey: 'sourcingResults',
          referenceFlag: true,
          _linkFlag: true,
          payload,
        });
      } else {
        dispatch(
          routerRedux.push({
            pathname: `/spcm/contract-workspace/create`,
          })
        );
      }
    }
    setBtnLoading(false);
  };

  // 引用寻源结果暂挂/取消暂挂
  const handleHold = () => {
    const one = selectedRows.every((item) => item.get('contractPendingFlag') === '1');
    const zero = selectedRows.every((item) => item.get('contractPendingFlag') === '0');
    if (!one && !zero) {
      return notification.warning({
        message: intl
          .get('sodr.sourceFrom.view.message.checkMark')
          .d('勾选行暂挂标识不一致,请检查!'),
      });
    }
    setBtnLoading(true);
    const resultList = selectedRows.map((r) => {
      return {
        ...r.toData(),
        suspendFlag: r.get('contractPendingFlag') === '1' ? '0' : '1',
      };
    });
    return toSuspend(resultList)
      .then((res) => {
        if (getResponse(res)) {
          notification.success();
          sourcingResultsDs.query();
          sourcingResultsDs.batchUnSelect(sourcingResultsDs.selected);
        }
      })
      .finally(() => {
        setBtnLoading(false);
      });
  };

  // 转交
  const handleTransfer = useCallback(() => {
    const ds = new DataSet(createTransferDs());
    Modal.open({
      key: Modal.key(),
      title: intl.get('spcm.workspace.view.title.scux.trip.transferContract').d('转交'),
      drawer: true,
      style: { width: 480 },
      destroyOnClose: true,
      children: (
        <Form dataSet={ds} labelLayout="float" columns={1}>
          <Lov name="transferUser" />
          <TextArea name="transferReason" resize="vertical" />
        </Form>
      ),
      onOk: async () => {
        const validate = await ds.validate();
        if (!validate) {
          return false;
        }
        const data = ds.toData()[0];
        const submitData = selectedRows.map((r) => {
          const { resultId, sourceNum, itemNum } =
            r.get(['resultId', 'sourceNum', 'itemNum']) || {};
          return {
            actionType: 'contract',
            docId: resultId,
            documentNumber: `${sourceNum}-${itemNum}`,
            ...(data || {}),
          };
        });
        setBtnLoading(true);
        const res = await transferSourceResults(submitData);
        setBtnLoading(false);
        if (getResponse(res)) {
          notification.success();
          sourcingResultsDs.query();
          sourcingResultsDs.unSelectAll();
          sourcingResultsDs.clearCachedSelected();
          return true;
        }
        return false;
      },
    });
  }, [selectedRows, sourcingResultsDs]);

  const btnList = useMemo(() => {
    return [
      {
        name: 'create',
        child: intl.get('spcm.common.button.create').d('新建'),
        btnProps: {
          color: 'primary',
          loading: btnLoading,
          disabled: isEmpty(selectedRows) && selectedRows.length === 0,
          onClick: () => handleCreate(),
          type: 'c7n-pro',
        },
      },
      hasDifferent && {
        name: 'hold',
        btnComp: PermissionButton,
        child: intl.get(`hzero.common.button.hold`).d('暂挂'),
        btnProps: {
          type: 'c7n-pro',
          loading: btnLoading,
          disabled: selectedRows.length === 0,
          onClick: handleHold,
          permissionList: [
            {
              code: 'srm.pc-admin.pc-purchaser.workspace2.ps.suspend',
              type: 'button',
              meaning: '暂挂',
            },
          ],
        },
      },
      !hasDifferent && {
        name: 'cancelHold',
        btnComp: PermissionButton,
        child: intl.get(`hzero.common.button.cancelHold`).d('取消暂挂'),
        btnProps: {
          type: 'c7n-pro',
          loading: btnLoading,
          disabled: selectedRows.length === 0,
          onClick: handleHold,
          permissionList: [
            {
              code: 'srm.pc-admin.pc-purchaser.workspace2.ps.cancel-suspend',
              type: 'button',
              meaning: '取消暂挂',
            },
          ],
        },
      },
      {
        name: 'cuxTransfer',
        child: intl.get('spcm.workspace.view.button.scux.trip.transfer').d('转交'),
        btnProps: {
          type: 'c7n-pro',
          loading: btnLoading,
          disabled: selectedRows.length === 0,
          onClick: handleTransfer,
        },
      },
    ].filter(Boolean);
  }, [selectedRows, btnLoading, hasDifferent, handleHold, handleCreate, handleTransfer]);
  return <DynamicButtons buttons={btnList} defaultBtnType="c7n-pro" />;
});

export default HeaderButtons;
