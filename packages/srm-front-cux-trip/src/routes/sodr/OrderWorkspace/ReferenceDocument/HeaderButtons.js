import React, { useState, useCallback } from 'react';
import { Button, Modal, DataSet, Form, Lov, TextArea } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { isArray, isEmpty } from 'lodash';

import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import DynamicButtons from '_components/DynamicButtons';

import {
  check,
  pendingFlag,
  sourePending,
  soureCancelPending,
  createCombineOrder,
  createCombineProtocol,
  poFromPrLineNewCheck,
} from '@/services/sodr/cuxOrderWorkspaceService';
import { transferSourceResults } from '@/services/commonServices';

const THROTTLE_TIME = 1500;

// 转交弹窗 DataSet
const createTransferDs = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'transferUser',
      label: intl.get('sodr.workspace.view.model.scux.trip.transferUser').d('新合同签订人'),
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
      label: intl.get('sodr.workspace.view.model.scux.trip.transferReason').d('转交说明'),
      type: 'string',
      required: true,
    },
  ],
});

const HeaderButtons = observer((props) => {
  const { purchaseRequestDs, sourcingResultsDs, purchaseAgreementDs, activeKey, history } = props;

  const [loadings, setLoadings] = useState({});

  const loading = (state = {}) => {
    setLoadings((preState) => ({ ...preState, ...state }));
  };

  const loadingDs = (_ds, flag) => {
    // eslint-disable-next-line no-param-reassign
    _ds.status = !!flag === true ? 'submitting' : 'ready';
  };

  const goDetail = (poHeaderId, poSourcePlatform, sourceBillTypeCode, state = {}) => {
    const options = {
      state,
      // search: stringify(search),
    };
    const pathConfig = [
      {
        source: 'PURCHASE_ORDER',
        path: `/sodr/order-workspace/detail/created-manually/${poHeaderId}`,
      },
      {
        source: 'PURCHASE_REQUEST',
        path: `/sodr/order-workspace/detail/purchase-request/${poHeaderId}`,
      },
      {
        source: 'SOURCE',
        path: `/sodr/order-workspace/detail/sourcing-results/${poHeaderId}`,
      },
      {
        source: 'CONTRACT_ORDER',
        path: `/sodr/order-workspace/detail/purchase-agreement/${poHeaderId}`,
      },
    ];
    switch (poSourcePlatform) {
      case 'E-COMMERCE':
        options.pathname = `/sodr/order-workspace/detail/ecommerce-request/${poHeaderId}`;
        break;
      case 'CATALOGUE':
        options.pathname = `/sodr/order-workspace/detail/catalogue-request/${poHeaderId}`;
        break;
      default:
        // SRM || SHOP || ERP
        options.pathname = (pathConfig.find((i) => i.source === sourceBillTypeCode) || {}).path;
    }
    if (!options.pathname) return;
    if (history) {
      history.push(options);
    }
  };

  // 引用采购申请创建（明细）
  const handleCreate = async () => {
    const data = purchaseRequestDs.toJSONData();
    if (isEmpty(data)) {
      notification.error({
        message: intl.get(`hzero.common.validation.atLeast`).d('请至少选择一条数据'),
      });
    }
    const status = await Promise.all(purchaseRequestDs.selected.map((i) => i.validate(true)));
    if (status.findIndex((i) => !i) === -1) {
      const checkResponse = getResponse(await check({ sourceCode: 'PURCHASE_REQUEST' }));
      const validateRes = getResponse(await poFromPrLineNewCheck(data));
      if (!validateRes) return;
      const { poCreatePopUpFlag, poCreateErrorMsg } = validateRes;
      if (poCreatePopUpFlag === 1) {
        const validateModalRes = await Modal.confirm({
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: poCreateErrorMsg,
          okText: intl.get('sodr.workspace.view.button.createPO').d('新建订单'),
        });
        if (validateModalRes !== 'ok') return;
      }
      const resLineCreate = await purchaseRequestDs.setState('submitType', 'create').submit();
      if (resLineCreate && !resLineCreate.failed) {
        const { content } = resLineCreate;
        const { poHeaderId, poSourcePlatform, sourceBillTypeCode } = isArray(content)
          ? content[0]
          : content;
        notification.success();
        if (checkResponse === 0 || (checkResponse === 1 && content.length === 1)) {
          purchaseRequestDs.query();
          goDetail(poHeaderId, poSourcePlatform, sourceBillTypeCode);
        } else if (checkResponse === 1 && content.length > 1) {
          purchaseRequestDs.query();
          goDetail(poHeaderId, poSourcePlatform, sourceBillTypeCode, {
            initPoDataList: content,
          });
        }
      }
    }
  };

  // 引用寻源结果创建
  const handleSourcing = async () => {
    Promise.all(sourcingResultsDs.selected.map((i) => i.validate(true))).then(async (status) => {
      if (status.findIndex((i) => !i) === -1) {
        const checkResponse = getResponse(await check({ sourceCode: 'SOURCE' }));
        if (checkResponse === 1) {
          const data = sourcingResultsDs.toJSONData();
          loadingDs(sourcingResultsDs, true);
          const response = getResponse(await createCombineOrder(data, { poWorkbenchFlag: 1 }));
          loadingDs(sourcingResultsDs, false);
          if (response && !response.failed) {
            sourcingResultsDs.query();
            const { poHeaderId, poSourcePlatform, sourceBillTypeCode, cacheKey } = response[0];
            goDetail(
              poHeaderId,
              poSourcePlatform,
              sourceBillTypeCode,
              response.length > 1
                ? {
                    cacheKey,
                  }
                : undefined
            );
          }
        } else if (checkResponse === 0) {
          const response = await sourcingResultsDs.submit();
          if (response && response.success) {
            const { poHeaderId, poSourcePlatform, sourceBillTypeCode } = response.content[0];
            sourcingResultsDs.query();
            goDetail(poHeaderId, poSourcePlatform, sourceBillTypeCode);
          }
        }
      }
    });
  };

  // 引用寻源结果暂挂/取消暂挂
  const handleSourceHold = async () => {
    const data = sourcingResultsDs.toJSONData();
    const zero = data.every((i) => i.pendingFlag === 0);
    const one = data.every((i) => i.pendingFlag === 1);
    if (!zero && !one) {
      return notification.warning({
        message: intl
          .get('sodr.workspace.view.message.checkHold')
          .d('勾选行暂挂标识不一致,请检查!'),
      });
    }
    loading({ handleSourceHold: true });
    loadingDs(sourcingResultsDs, true);
    const formatData = data.map((n) => ({
      tenantId: n.tenantId,
      pendingFlag: n.pendingFlag === 1 ? 0 : 1,
      type: 'SOURCE',
      executeType: 'PO',
      resultId: n.resultId,
      sourceContractConfigId: n.sourceContractConfigId,
      poSourceContractConfigObjectVersionNumber: n.poSourceContractConfigObjectVersionNumber,
    }));
    const result = getResponse(await (zero ? sourePending : soureCancelPending)(formatData));
    loading({ handleSourceHold: false });
    loadingDs(sourcingResultsDs, false);
    if (result) {
      notification.success();
      sourcingResultsDs.query();
      sourcingResultsDs.batchUnSelect(sourcingResultsDs.selected);
    }
  };

  // 引用采购协议暂挂/取消暂挂
  const handleAgreementHold = async () => {
    const data = purchaseAgreementDs.toJSONData();
    const zero = data.every((i) => i.pendingFlag === 0);
    const one = data.every((i) => i.pendingFlag === 1);
    if (!zero && !one) {
      return notification.warning({
        message: intl
          .get('sodr.workspace.view.message.checkHold')
          .d('勾选行暂挂标识不一致,请检查!'),
      });
    }
    loading({ handleAgreementHold: true });
    loadingDs(purchaseAgreementDs, true);
    const formatData = data.map((n) => ({
      tenantId: n.tenantId,
      pendingFlag: n.pendingFlag === 1 ? 0 : 1,
      type: 'CONTRACT',
      pcSubjectId: n.pcSubjectId,
      sourceContractConfigId: n.sourceContractConfigId,
      poSourceContractConfigObjectVersionNumber: n.poSourceContractConfigObjectVersionNumber,
    }));
    const result = getResponse(await pendingFlag(formatData));
    loading({ handleAgreementHold: false });
    loadingDs(purchaseAgreementDs, false);
    if (result) {
      notification.success();
      purchaseAgreementDs.query();
      purchaseAgreementDs.batchUnSelect(purchaseAgreementDs.selected);
    }
  };

  // 引用采购协议创建
  const handleAgreement = async () => {
    loadingDs(purchaseAgreementDs, true);
    await new Promise((resolve) => setTimeout(resolve, 10));
    Promise.all(purchaseAgreementDs.selected.map((i) => i.validate(true))).then(async (status) => {
      loadingDs(purchaseAgreementDs, false);
      if (status.findIndex((i) => !i) === -1) {
        loadingDs(purchaseAgreementDs, true);
        const checkResponse = getResponse(await check({ sourceCode: 'CONTRACT_ORDER' }));
        loadingDs(purchaseAgreementDs, false);
        if (checkResponse === 1) {
          const data = purchaseAgreementDs.toJSONData();
          loadingDs(purchaseAgreementDs, true);
          const response = getResponse(await createCombineProtocol(data, { poWorkbenchFlag: 1 }));
          loadingDs(purchaseAgreementDs, false);
          if (response && !response.failed) {
            const { poHeaderId, poSourcePlatform, sourceBillTypeCode, cacheKey } =
              response[0] || response;
            purchaseAgreementDs.query();
            goDetail(
              poHeaderId,
              poSourcePlatform,
              sourceBillTypeCode,
              response.length > 1
                ? {
                    cacheKey,
                  }
                : undefined
            );
          }
        } else if (checkResponse === 0) {
          const response = await purchaseAgreementDs.submit();
          if (response && response.success) {
            const { poHeaderId, poSourcePlatform, sourceBillTypeCode } = response.content[0];
            purchaseAgreementDs.query();
            goDetail(poHeaderId, poSourcePlatform, sourceBillTypeCode);
          }
        }
      }
    });
  };

  // 转交
  const handleTransfer = useCallback(
    ({ dataSet }) => {
      if (!dataSet || !activeKey) return;
      const selectedRows = dataSet.selected;
      const ds = new DataSet(createTransferDs());
      const lineFields = {
        cuxPurchaseRequest: ['prHeaderId', 'prNum', 'lineNum'],
        cuxPurchaseAgreement: ['pcHeaderId', 'pcNum', 'lineNum'],
        cuxSourcingResults: ['resultId', 'sourceNum', 'itemNum'],
      };
      const type = {
        cuxPurchaseRequest: 'sprm',
        cuxPurchaseAgreement: 'spcm',
        cuxSourcingResults: 'ssrc',
      };
      Modal.open({
        key: Modal.key(),
        title: intl.get('sodr.workspace.view.title.scux.trip.transfer').d('转交'),
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
            const [docId, documentNum, itemNum] = lineFields[activeKey].map((field) =>
              r.get(field)
            );
            return {
              actionType: type[activeKey],
              docId,
              documentNumber: `${documentNum}-${itemNum}`,
              ...(data || {}),
            };
          });
          loadingDs(dataSet, true);
          try {
            const res = await transferSourceResults(submitData);
            if (getResponse(res)) {
              notification.success();
              dataSet.query();
              dataSet.unSelectAll();
              dataSet.clearCachedSelected();
              return true;
            };
            return false;
          } finally {
            loadingDs(dataSet, false);
          }
        },
      });
    },
    [activeKey]
  );

  const getBtns = (key) => {
    let Buttons;
    switch (key) {
      case 'cuxPurchaseRequest':
        Buttons = observer(({ dataSet }) => {
          const buttons = [
            {
              name: 'create',
              btnComp: Button,
              type: 'c7n-pro',
              child: intl.get('hzero.common.button.create').d('新建'),
              btnProps: {
                wait: THROTTLE_TIME,
                type: 'c7n-pro',
                color: 'primary',
                disabled: !dataSet.selected.length,
                loading: purchaseRequestDs.status !== 'ready',
                onClick: handleCreate,
                permissionList: [
                  {
                    code: 'srm.po-admin.po.order-workspace.ps.button.refbilldetailspurrqs.create',
                    type: 'c7n-pro',
                    meaning: '订单工作台-引用单据明细-采购申请-新建',
                  },
                ],
              },
            },
            {
              name: 'cuxTransfer',
              child: intl.get('sodr.workspace.view.button.scux.trip.transfer').d('转交'),
              btnProps: {
                type: 'c7n-pro',
                loading: purchaseRequestDs.status !== 'ready',
                disabled: !dataSet.selected.length,
                onClick: () => handleTransfer({ dataSet }),
              },
            },
          ];
          return <DynamicButtons buttons={buttons} defaultBtnType="c7n-pro" />;
        });
        return <Buttons dataSet={purchaseRequestDs} />;
      case 'cuxSourcingResults':
        Buttons = observer(({ dataSet }) => {
          const data = dataSet.toJSONData();
          const hasDifferent = data.every((i) => i.pendingFlag === 0);
          return [
            <Button
              wait={THROTTLE_TIME}
              color="primary"
              // icon="add"
              type="c7n-pro"
              disabled={!dataSet.selected.length}
              loading={sourcingResultsDs.status === 'submitting' || loadings.handleSourceHold}
              onClick={handleSourcing}
              permissionList={[
                {
                  code: 'srm.po-admin.po.order-workspace.ps.button.refbilldetailssource.create',
                  type: 'c7n-pro',
                  meaning: '订单工作台-引用单据明细-寻源申请-新建',
                },
              ]}
            >
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>,
            hasDifferent ? (
              <Button
                wait={THROTTLE_TIME}
                type="c7n-pro"
                disabled={!dataSet.selected.length}
                loading={loadings.handleSourceHold || sourcingResultsDs.status === 'submitting'}
                onClick={handleSourceHold}
              >
                {intl.get('sodr.workspace.view.button.hold').d('暂挂')}
              </Button>
            ) : (
              <Button
                wait={THROTTLE_TIME}
                type="c7n-pro"
                disabled={!dataSet.selected.length}
                loading={loadings.handleSourceHold || sourcingResultsDs.status === 'submitting'}
                onClick={handleSourceHold}
              >
                {intl.get('sodr.workspace.view.button.cancelHold').d('取消暂挂')}
              </Button>
            ),
            <Button
              wait={THROTTLE_TIME}
              type="c7n-pro"
              disabled={!dataSet.selected.length}
              loading={loadings.handleSourceHold || sourcingResultsDs.status === 'submitting'}
              onClick={() => handleTransfer({ dataSet })}
            >
              {intl.get('sodr.workspace.view.button.scux.trip.transfer').d('转交')}
            </Button>,
          ];
        });
        return <Buttons dataSet={sourcingResultsDs} />;
      case 'cuxPurchaseAgreement':
        Buttons = observer(({ dataSet }) => {
          const data = dataSet.toJSONData();
          const hasDifferent = data.every((i) => i.pendingFlag === 0);
          return [
            <Button
              wait={THROTTLE_TIME}
              color="primary"
              type="c7n-pro"
              disabled={!dataSet.selected.length}
              loading={purchaseAgreementDs.status === 'submitting' || loadings.handleAgreementHold}
              onClick={handleAgreement}
              permissionList={[
                {
                  code: 'srm.po-admin.po.order-workspace.ps.button.refbilldetailsagree.create',
                  type: 'c7n-pro',
                  meaning: '订单工作台-引用单据明细-采购协议-新建',
                },
              ]}
            >
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>,
            hasDifferent ? (
              <Button
                wait={THROTTLE_TIME}
                type="c7n-pro"
                disabled={!dataSet.selected.length}
                loading={
                  loadings.handleAgreementHold || purchaseAgreementDs.status === 'submitting'
                }
                onClick={handleAgreementHold}
              >
                {intl.get('sodr.workspace.view.button.hold').d('暂挂')}
              </Button>
            ) : (
              <Button
                wait={THROTTLE_TIME}
                type="c7n-pro"
                disabled={!dataSet.selected.length}
                loading={
                  loadings.handleAgreementHold || purchaseAgreementDs.status === 'submitting'
                }
                onClick={handleAgreementHold}
              >
                {intl.get('sodr.workspace.view.button.cancelHold').d('取消暂挂')}
              </Button>
            ),
            <Button
              wait={THROTTLE_TIME}
              type="c7n-pro"
              disabled={!dataSet.selected.length}
              loading={loadings.handleAgreementHold || purchaseAgreementDs.status === 'submitting'}
              onClick={() => handleTransfer({ dataSet })}
            >
              {intl.get('sodr.workspace.view.button.scux.trip.transfer').d('转交')}
            </Button>,
          ];
        });
        return <Buttons dataSet={purchaseAgreementDs} />;
      default:
        return null;
    }
  };

  return getBtns(activeKey);
});

export default formatterCollections({
  code: ['sodr.workspace', 'sodr.common'],
})(HeaderButtons);
