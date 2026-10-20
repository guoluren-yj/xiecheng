import React from 'react';
import { Button, TextArea, Form, DataSet } from 'choerodon-ui/pro';
import { Tag, Icon } from 'choerodon-ui';
import qs from 'qs';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { openApproveModal } from '_components/ApproveModal';
import ApproveRecordSimple from '_components/ApproveRecordSimple';
import DocFlow from '_components/DocFlow';
import { SMALL_ORDER } from '_utils/config';
import { fetchOnlyCount } from '@/utils/commonApi';
import { useRenderTag } from '@/hooks/useRenderTag';
import c7nModal from '@/utils/c7nModal';
import { Button as PermissionButton } from 'components/Permission';
import { handleRevokeApprove } from '@/utils/utils';
import { handleSubmit, handleCancel, handleLineCancel } from '@/services/oms/applyWorkBenchService';

import StatusDetail from './statusDetail';
import Relevance from './relevance';

import styles from './index.less';

const organizationId = getCurrentOrganizationId();

const permissionText = 'srm.mall.tenant.mall-request.workbench.button';

const tabList = () => {
  const _list = [
    {
      tab: intl.get('smodr.apply.view.whole').d('整单'),
      key: 'whole',
      panes: [
        {
          tab: intl.get('smodr.apply.view.waitSubmit').d('待提交'),
          key: 'waitSubmit',
          parentKey: 'whole',
          customizedCode: "SMODR.APPLY.WORKBENCH.WAITSUBMIT",
          queryUrl: `${SMALL_ORDER}/v1/${organizationId}/mall-requests/list`,
          searchCode: 'SMODR.REQUEST.TABLE.WHOLE.NEW.QUERY',
          params: { omsStatusGroupCode: 'ACCEPTING' },
          customizedTableCode: 'SMODR.REQUEST.TABLE.REQUEST.WHOLE',
        },
        {
          tab: intl.get('smodr.apply.view.approving').d('审批中'),
          key: 'approving',
          parentKey: 'whole',
          customizedCode: "SMODR.APPLY.WORKBENCH.APPROVING",
          queryUrl: `${SMALL_ORDER}/v1/${organizationId}/mall-requests/list`,
          searchCode: 'SMODR.REQUEST.TABLE.WHOLE.OTHER',
          params: { omsStatusGroupCode: 'SUBMITTED' },
          customizedTableCode: 'SMODR.REQUEST.TABLE.REQUEST.WHOLE',
        },
        {
          tab: intl.get('smodr.apply.view.waitDone').d('待执行'),
          key: 'waitDone',
          parentKey: 'whole',
          customizedCode: "SMODR.APPLY.WORKBENCH.WAITDONE",
          queryUrl: `${SMALL_ORDER}/v1/${organizationId}/mall-requests/list`,
          searchCode: 'SMODR.REQUEST.TABLE.WHOLE.OTHER',
          params: { omsStatusGroupCode: 'APPROVED' },
          customizedTableCode: 'SMODR.REQUEST.TABLE.REQUEST.WHOLE',
        },
        {
          tab: intl.get('smodr.apply.view.all').d('全部'),
          key: 'wholeAll',
          parentKey: 'whole',
          customizedCode: "SMODR.APPLY.WORKBENCH.WHOLEALL",
          queryUrl: `${SMALL_ORDER}/v1/${organizationId}/mall-requests/list`,
          searchCode: 'SMODR.REQUEST.TABLE.WHOLE.QUERY',
          customizedTableCode: 'SMODR.REQUEST.TABLE.REQUEST.WHOLE',
        },
      ],
    },
    {
      tab: intl.get('smodr.apply.view.detail').d('明细'),
      key: 'detail',
      panes: [
        {
          tab: intl.get('smodr.apply.view.cancancel').d('可取消'),
          key: 'cancel',
          parentKey: 'detail',
          queryUrl: `${SMALL_ORDER}/v1/${organizationId}/mall-request-entrys/list`,
          searchCode: 'SMODR.REQUEST.TABLE.DETAIL.CAN.CANCEL.QUERY',
          params: { omsStatusGroupCode: 'CAN_CANCEL' },
          customizedTableCode: 'SMODR.REQUEST.TABLE.CANCEL',
        },
        {
          tab: intl.get('smodr.apply.view.execute').d('执行中'),
          key: 'execute',
          parentKey: 'detail',
          queryUrl: `${SMALL_ORDER}/v1/${organizationId}/mall-request-entrys/list`,
          searchCode: 'SMODR.REQUEST.TABLE.DETAIL.OTHER',
          params: { omsStatusGroupCode: 'CONVERSION_PROCESSING' },
          customizedTableCode: 'SMODR.REQUEST.TABLE.EXECUTE',
        },
        {
          tab: intl.get('smodr.apply.view.all').d('全部'),
          key: 'detailAll',
          parentKey: 'detail',
          queryUrl: `${SMALL_ORDER}/v1/${organizationId}/mall-request-entrys/list`,
          searchCode: 'SMODR.REQUEST.TABLE.DETAIL.QUERY',
          customizedTableCode: 'SMODR.REQUEST.TABLE.REQUEST.DETAIL',
        },
      ],
    },
  ];
  return _list.map(group => {
    return {
      ...group,
      panes: group.panes.map(pane => ({
        ...pane,
        queryCount: async () => {
          const res = getResponse(await fetchOnlyCount(pane.queryUrl, pane.params));
          if (res) {
            return res;
          }
          return {};
        },
      })),
    };
  });
};

const handleToSubmit = async (record, dataSet) => {
  const data = record.toData();
  const res = getResponse(await handleSubmit({ ...data }));
  if (res) {
    dataSet.query();
  }
};

const handleToCancel = async (record, dataSet, type) => {
  const ds = new DataSet({
    autoCreate: true,
    selection: false,
    fields: [{
      name: 'cancelReason',
      label: intl.get('smodr.apply.view.cancelReason').d('取消原因'),
      type: 'string',
      required: true,
    }],
  });
  const canCloseQuantity = record.get('canCloseQuantity');
  c7nModal({
    title: intl.get('smodr.apply.view.cancelReason').d('取消原因'),
    children: (
      <div>
        {record.get('canCloseQuantity') > 0 && (
          <>
            <div style={{ color: '#F46C0E', padding: '10px 20px', background: 'rgba(242,128,26,0.1)', display: 'flex', marginBottom: '20px' }}>
              <Icon type='error' style={{ marginRight: '8px', fontSize: '16px', position: 'relative', top: '1px' }} />
              {intl.get('smodr.apply.view.cancelTipss', { value: canCloseQuantity }).d(`
              申请行状态为【执行中】，仅支持取消未执行部分的申请，未执行部分数量为【${canCloseQuantity}】，是否确认取消？`)}
            </div>
          </>
        )}
        <Form labelLayout='float' dataSet={ds} style={{ margin: '20px 12px' }}>
          <TextArea name='cancelReason' resize='both' />
        </Form>
      </div>
    ),
    style: { width: 380 },
    bodyStyle: { padding: 0 },
    onOk: async () => {
      const flag = await ds.validate();
      const cancelReason = ds.current?.get('cancelReason');
      const data = record.toData();
      if (flag) {
        if (type === 'detail') {
          const res = getResponse(await handleLineCancel({ mallRequestEntryViewDTOList: [{ ...data, cancelReason }] }));
          if (res) {
            dataSet.query();
          }
        } else {
          const res = getResponse(await handleCancel({ ...data, cancelReason }));
          if (res) {
            dataSet.query();
          }
        }
      } else {
        return false;
      }
    },
  });
};

// const handleDetailCancel = async (record, dataSet) => {
//   const data = record.toData();
//   if (res) {
//     dataSet.query();
//   }
// };

const handleBill = (record) => {
  const modal = c7nModal({
    title: intl.get('smodr.apply.view.relevance').d('关联单据'),
    children: <Relevance recordData={record} />,
    style: { width: 380 },
    footer: <Button color='primary' onClick={() => modal?.close()}>{intl.get('smodr.apply.view.close').d('关闭')}</Button>,
  });
};

const handleCheckStatus = (record) => {
  const modal = c7nModal({
    title: intl.get('smodr.apply.view.statusDetails').d('查看执行状态'),
    children: <StatusDetail recordData={record} />,
    style: { width: 742 },
    footer: <Button color='primary' onClick={() => modal?.close()}>{intl.get('smodr.apply.view.close').d('关闭')}</Button>,
  });
};

const colorList = [
  { colorType: 'success', matchList: ['APPROVED', 'CONVERSION_COMPLETED', 'SUBMITTED'] },
  { colorType: 'failed', matchList: ['REJECTED', 'RETURNED'] },
  { colorType: 'invalid', matchList: ['CANCELED', 'WITHDRAWN'] },
  { colorType: 'warning', matchList: [] },
];

const dsFieldsMap = (key) => ({
  'whole': [
    {
      name: 'requestStatusMeaning',
      type: 'string',
      label: intl.get('smodr.apply.model.status').d('状态'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('smodr.apply.model.operation').d('操作'),
      filter: ['wholeAll', 'approving'].includes(key),
    },
    {
      name: 'requestCode',
      type: 'string',
      label: intl.get('smodr.apply.model.applyCode').d('商城申请编码'),
    },
    // {
    //   name: 'sourceFromMeaning',
    //   type: 'string',
    //   label: intl.get('smodr.apply.model.billSource').d('单据来源'),
    // },
    {
      name: 'sourceFromSystemMeaning',
      label: intl.get('smodr.common.model.sourceFromSystemMeaning').d('来源系统'),
    },
    {
      name: 'requestTypeMeaning',
      type: 'string',
      label: intl.get('smodr.apply.model.billApplyType').d('申请类型'),
    },
    {
      name: 'currencyName',
      type: 'string',
      label: intl.get('smodr.apply.model.currency').d('币种'),
    },
    {
      name: 'requestAmountMeaning',
      type: 'string',
      label: intl.get('smodr.apply.model.applyAmount').d('申请总额'),
    },
    {
      name: 'handleAgentByName',
      type: 'string',
      label: intl.get('smodr.apply.model.handleByName').d('受理人'),
    },
    {
      name: 'createdByName',
      type: 'string',
      label: intl.get('smodr.apply.model.creationPeople').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('smodr.apply.model.creationDate').d('创建时间'),
    },
  ].filter(i => i.filter !== false),
  'detail': [
    {
      name: 'lineStatusMeaning',
      type: 'string',
      label: intl.get('smodr.apply.model.status').d('状态'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('smodr.apply.model.operation').d('操作'),
      filter: key === 'detailAll',
    },
    {
      name: 'requestCodeLine',
      type: 'string',
      label: intl.get('smodr.apply.model.applyCodeLine').d('商城申请编码-行号'),
    },
    {
      name: 'docFlow',
      label: intl.get('smodr.apply.model.docFlow').d('单据流'),
      filter: key === 'detailAll',
    },
    {
      name: 'processInfoList',
      type: 'string',
      label: intl.get('smodr.apply.model.executeStatus').d('执行状态'),
      filter: key === 'EXECUTE',
    },
    {
      name: 'skuCode',
      type: 'string',
      label: intl.get('smodr.apply.model.skuCode').d('商品编码'),
    },
    {
      name: 'skuName',
      type: 'string',
      label: intl.get('smodr.apply.model.skuName').d('商品名称'),
    },
    {
      name: 'itemCode',
      type: 'string',
      label: intl.get('smodr.apply.model.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get('smodr.apply.model.itemName').d('物料名称'),
    },
    {
      name: 'quantityMeaning',
      type: 'string',
      label: intl.get('smodr.apply.model.quantity').d('数量'),
      align: 'right',
    },
    {
      name: 'uomName',
      type: 'string',
      label: intl.get('smodr.apply.model.uomName').d('单位'),
    },
    {
      name: 'unitPriceMeaning',
      type: 'string',
      label: intl.get('smodr.apply.model.priceTax').d('预估单价(含税)'),
    },
    {
      name: 'per',
      type: 'number',
      label: intl.get('smodr.apply.model.per').d('每'),
      // filter: key === 'detailAll',
    },
    {
      name: 'amountMeaning',
      type: 'string',
      label: intl.get('smodr.apply.model.amountTax').d('预估行金额(含税)'),
    },
    {
      name: 'currencyName',
      type: 'string',
      label: intl.get('smodr.apply.model.currency').d('币种'),
    },
    {
      name: 'sourceTypeMeaning',
      type: 'string',
      label: intl.get('smodr.apply.model.source').d('来源渠道'),
    },
    {
      name: 'sourceOrderCode',
      label: intl.get('smodr.apply.model.sourceOrderCode').d('来源单据号'),
    },
    {
      name: 'skuTypeMeaning',
      type: 'string',
      label: intl.get('smodr.apply.model.skuType').d('商品类型'),
    },
    {
      name: 'agreementBusinessTypeMeaning',
      type: 'string',
      label: intl.get('smodr.apply.model.agreeType').d('协议类型'),
    },
    {
      name: 'requestByName',
      type: 'string',
      label: intl.get('smodr.apply.model.applyPeople').d('申请人'),
    },
    {
      name: 'createdByName',
      type: 'string',
      label: intl.get('smodr.apply.model.creationPeople').d('创建人'),
    },
    {
      name: 'purchaseCompanyName',
      type: 'string',
      label: intl.get('smodr.apply.model.purchase').d('采购方'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('smodr.apply.model.supplier').d('供应商'),
    },
  ].filter(i => i.filter !== false),
});

const columnsMap = (key, history, aggregation, showDocFlow) => ({
  whole: [
    {
      name: 'requestStatusMeaning',
      renderer: ({ record, text }) => {
        const { color, initStyle } = useRenderTag(colorList, record?.get('requestStatus'));
        return (
          <Tag color={color} style={initStyle}>
            {text}
          </Tag>
        );
      },
    },
    {
      name: 'operation',
      width: 180,
      align: 'left',
      className: aggregation ? '' : styles['action-link-btns'],
      filter: ['wholeAll', 'approving'].includes(key),
      command: ({ record, dataSet }) => [
        !!record.get('wflApproveFlag') && (
          <Button
            color="primary"
            funcType="link"
            onClick={() => {
              openApproveModal({
                modalProps: {
                  closable: true,
                },
                taskId: record.get('taskId'),
                processInstanceId: record.get('processInstanceId'),
                onSuccess: () => dataSet.query(dataSet.currentPage),
              });
            }}
          >
            {intl.get('hzero.common.button.approval').d('审批')}
          </Button>
        ),
        !!record.get('wflRevokeApproveFlag') && (
          <Button
            color="primary"
            funcType="link"
            onClick={() =>
              handleRevokeApprove(record.get('requestCode'), () =>
                dataSet.query(dataSet.currentPage)
              )
            }
          >
            {intl.get('hzero.common.button.revokeApproval').d('撤销审批')}
          </Button>
        ),
        ['ACCEPTING'].includes(record.get('requestStatus')) && (
          <PermissionButton
            type="c7n-pro"
            onClick={() =>
              history.push(
                `/s2-mall/oms/request-workBench/detail-edit?requestId=${record.get('requestId')}`
              )
            }
            color="primary"
            funcType="link"
            permissionList={[
              {
                code: `${permissionText}.edit.whole`,
                type: 'button',
                meaning:
                  intl.get('smodr.apply.view.title').d('商城申请工作台') -
                  intl.get('smodr.apply.view.permissionEdit').d('编辑按钮'),
              },
            ]}
          >
            {intl.get('smodr.apply.view.edit').d('编辑')}
          </PermissionButton>
        ),
        ['ACCEPTING'].includes(record.get('requestStatus')) && (
          <PermissionButton
            type="c7n-pro"
            color="primary"
            onClick={() => handleToSubmit(record, dataSet)}
            funcType="link"
            wait={1000}
            waitType="throttle"
            permissionList={[
              {
                code: `${permissionText}.submit.whole`,
                type: 'button',
                meaning:
                  intl.get('smodr.apply.view.title').d('商城申请工作台') -
                  intl.get('smodr.apply.view.permissionSubmit').d('整单提交按钮'),
              },
            ]}
          >
            {intl.get('smodr.apply.view.submit').d('提交')}
          </PermissionButton>
        ),
        ['ACCEPTING', 'RETURNED'].includes(record.get('requestStatus')) && ( // 已提交也可取消
          <PermissionButton
            type="c7n-pro"
            color="primary"
            funcType="link"
            onClick={() => handleToCancel(record, dataSet, 'whole')}
            permissionList={[
              {
                code: `${permissionText}.cancel.whole`,
                type: 'button',
                meaning:
                  intl.get('smodr.apply.view.title').d('商城申请工作台') -
                  intl.get('smodr.apply.view.permissionWholeCancel').d('整单取消按钮'),
              },
            ]}
          >
            {intl.get('smodr.apply.view.cancel').d('取消')}
          </PermissionButton>
        ),
      ],
    },
    {
      name: 'requestCode',
      width: 180,
      renderer: ({ text, record }) => {
        // 全部页签-受理中的订单 进入详情只读再编辑
        const edit = ['ACCEPTING'].includes(record.get('requestStatus')) && key !== 'wholeAll';
        const {
          requestId,
          revokeFlag,
          wflApproveFlag,
          wflRevokeApproveFlag,
          taskId,
          processInstanceId,
        } = record.get([
          'requestId',
          'revokeFlag',
          'wflApproveFlag',
          'wflRevokeApproveFlag',
          'taskId',
          'processInstanceId',
        ]);
        const query = qs.stringify({
          requestId,
          revokeFlag,
          wflApproveFlag,
          wflRevokeApproveFlag,
          taskId,
          processInstanceId,
        });
        return (
          <a
            onClick={() =>
              history.push(
                `/s2-mall/oms/request-workBench/${edit ? 'detail-edit' : 'detail-read'}?${query}`
              )
            }
          >
            {text}
          </a>
        );
      },
    },
    {
      name: 'approvalProgress',
      width: 180,
      filter: ['approving'].includes(key), // 审批中展示审批进度
      header: intl.get('smodr.common.view.approvalProgress').d('审批进度'),
      renderer: ({ record }) =>
        isEmpty(record.get('simpleApprovalHistory')) ? (
          '-'
        ) : (
          <ApproveRecordSimple data={record.get('simpleApprovalHistory') || []} />
        ),
    },
    // {
    //   name: 'sourceFromMeaning',
    //   type: 'string',
    //   label: intl.get('smodr.apply.model.billSource').d('单据来源'),
    // },
    {
      name: 'sourceFromSystemMeaning',
    },
    {
      name: 'requestTypeMeaning',
    },
    {
      name: 'currencyName',
    },
    {
      name: 'requestAmountMeaning',
      align: 'right',
    },
    {
      name: 'handleAgentByName',
    },
    {
      name: 'createdByName',
    },
    {
      name: 'creationDate',
      width: 140,
    },
  ].filter(i => i.filter !== false),
  detail: [
    {
      name: 'lineStatusMeaning',
      renderer: ({ record, text }) => {
        const { color, initStyle } = useRenderTag(colorList, record?.get('lineStatus'));
        return (
          <Tag color={color} style={initStyle}>
            {text}
          </Tag>
        );
      },
    },
    {
      name: 'operation',
      align: 'left',
      className: aggregation ? '' : styles['action-link-btns'],
      filter: key === 'detailAll',
      width: aggregation ? 100 : 200,
      command: ({ record, dataSet }) => [
        <Button onClick={() => handleCheckStatus(record)} color="primary" funcType="link">
          {intl.get('smodr.apply.view.checkStatus').d('查看执行状态')}
        </Button>,
        showDocFlow.displayDoc && (
          <Button onClick={() => handleBill(record)} color="primary" funcType="link">
            {intl.get('smodr.apply.view.relevance').d('关联单据')}
          </Button>
        ),
        ((['RETURNED', 'APPROVED', 'ACCEPTING'].includes(record.get('lineStatus')) &&
          record.get('sourceType') === 'MANUAL') ||
          (record.get('sourceType') === 'CATA' &&
            ['ACCEPTING', 'RETURNED'].includes(record.get('lineStatus'))) ||
          (record.get('sourceType') === 'MANUAL' &&
            record.get('lineStatus') === 'CONVERSION_PROCESSING' &&
            record.get('canCloseQuantity') !== 0)) && (
            <PermissionButton
              type="c7n-pro"
              color="primary"
              funcType="link"
              onClick={() => handleToCancel(record, dataSet, 'detail')}
              permissionList={[
              {
                code: `${permissionText}.cancel.detail`,
                type: 'button',
                meaning:
                  intl.get('smodr.apply.view.title').d('商城申请工作台') -
                  intl.get('smodr.apply.view.permissionLineCancel').d('明细取消按钮'),
              },
            ]}
            >
              {intl.get('smodr.apply.view.cancel').d('取消')}
            </PermissionButton>
        ),
      ],
    },
    {
      name: 'applyInfo',
      title: intl.get('smodr.orderLine.view.applyInfo').d('申请信息'),
      width: 300,
      children: [
        {
          name: 'requestCodeLine',
          defaultWidth: 200,
          renderer: ({ text, record }) => {
            return (
              <a
                onClick={() =>
                  history?.push(
                    `/s2-mall/oms/request-workBench/detail-read?requestId=${record?.get(
                      'requestId'
                    )}`
                  )
                }
                color="primary"
              >
                {text}
              </a>
            );
          },
        },
        {
          name: 'agreementBusinessTypeMeaning',
        },
        {
          name: 'requestByName',
        },
        {
          name: 'createdByName',
        },
      ],
    },
    {
      name: 'docFlow',
      width: 100,
      className: styles['detail-docFlow-column'],
      filter: key === 'detailAll',
      hidden: !showDocFlow.displayDocFlow,
      renderer: ({ record }) =>
        record.get('documentFlowFlag') ? (
          <DocFlow
            tableName="s2ful_mall_request_entry"
            tablePk={record.get('requestEntryId')}
            buttonType="button"
            buttonText={intl.get('smodr.apply.model.docFlow').d('单据流')}
          />
        ) : (
          <span>-</span>
        ),
    },
    {
      name: 'skuInfo',
      title: intl.get('smodr.orderLine.view.skuInfo').d('商品信息'),
      width: 200,
      children: [
        {
          name: 'skuCode',
          width: 120,
        },
        {
          name: 'skuName',
          width: 200,
        },
        {
          name: 'skuTypeMeaning',
        },
      ],
    },
    {
      name: 'processInfoList',
      filter: key === 'EXECUTE',
      renderer: ({ value }) => {
        const renderList = value?.map(i => (
          <Tag style={{ backgroundColor: 'transparent' }} color="gray">
            {i.executeDocTypeMeaning}
          </Tag>
        ));
        return renderList;
      },
    },
    {
      name: 'itemInfo',
      title: intl.get('smodr.orderLine.view.itemInfo').d('物料信息'),
      width: 200,
      children: [
        {
          name: 'itemCode',
        },
        {
          name: 'itemName',
        },
        {
          name: 'quantityMeaning',
          align: 'right',
        },
        {
          name: 'uomName',
        },
      ],
    },
    {
      name: 'priceInfo',
      title: intl.get('smodr.orderLine.view.priceInfo').d('金额信息'),
      width: 200,
      children: [
        {
          name: 'unitPriceMeaning',
          align: 'right',
          width: 120,
        },
        {
          name: 'amountMeaning',
          align: 'right',
          width: 120,
        },
        {
          name: 'currencyName',
          type: 'string',
          label: intl.get('smodr.apply.model.currency').d('币种'),
        },
        {
          name: 'per',
          // filter: key === 'detailAll',
        },
      ].filter(c => c.filter !== false),
    },
    {
      name: 'personInfo',
      title: intl.get('smodr.orderLine.view.personInfo').d('交易双方信息'),
      minWidth: 200,
      children: [
        {
          name: 'purchaseCompanyName',
          width: 180,
        },
        {
          name: 'supplierCompanyName',
          width: 180,
        },
      ],
    },
    {
      name: 'sourceInfo',
      title: intl.get('smodr.orderLine.view.sourceInfo').d('来源信息'),
      width: 200,
      children: [
        {
          name: 'sourceTypeMeaning',
        },
        { name: 'sourceOrderCode' },
      ],
    },
  ].filter(i => i.filter !== false),
});

export { tabList, dsFieldsMap, columnsMap };
