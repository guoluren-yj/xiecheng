import React, { useMemo, useEffect } from 'react';
import { compose } from 'lodash';
import moment from 'moment';
import { Button, Attachment, DataSet, Form, TextArea, Tabs } from 'choerodon-ui/pro';
import qs from 'qs';
import { Observer } from 'mobx-react';
import { observer } from 'mobx-react-lite';
import { observable } from 'mobx';

import RenderForm from '@/routes/components/RenderForm';
import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import { openApproveModal } from '_components/ApproveModal';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import DynamicButtons from '_components/DynamicButtons';
import c7nModal from '@/utils/c7nModal';
import { handleCancel, fetchApproveRecord } from '@/services/oms/applyWorkBenchService';
import { getResponse } from 'utils/utils';
import { Button as PermissionButton } from 'components/Permission';
import ApproveRecord from '_components/ApproveRecord';
import AlertTips from '@/components/AlertTips';
import remote from 'hzero-front/lib/utils/remote';
import { handleRevokeApprove } from '@/utils/utils';

import { baseDs, tableDs } from './ds';
import { baseDsFields, tableDsFields } from './dataSource';
import OperationRecord from './operation';

import styles from './index.less';

const PRIVATE_BUCKET = window.$$env.PRIVATE_BUCKET || 'private-bucket';
const permissionText = 'srm.mall.tenant.mall-request.workbench.button';

function ReadPage(props) {
  const activeKey = observable.box('0');
  const handleChangeTab = (tabkey) => activeKey.set(tabkey);
  const {
    requestId,
    sourceFrom = 'order',
    wflApproveFlag,
    wflRevokeApproveFlag,
    taskId,
    processInstanceId,
  } = qs.parse(props.location.search.substr(1));
  const baseDS = useMemo(() => new DataSet(baseDs()), []);
  const skuDS = useMemo(() => new DataSet(tableDs()), []);
  const renderFields = useMemo(() => baseDsFields().filter(i => (i.type !== 'attachment' && !i.bind)), []);

  useEffect(() => {
    baseDS.setQueryParameter('requestId', requestId);
    skuDS.setQueryParameter('requestId', requestId);
    baseDS.query();
    skuDS.query();
  }, [requestId]);

  async function handleToCancel() {
    const headData = baseDS.current.toData();
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
    c7nModal({
      title: intl.get('smodr.apply.view.cancelReason').d('取消原因'),
      children: (
        <Form labelLayout='float' dataSet={ds}>
          <TextArea name='cancelReason' resize='both' />
        </Form>
      ),
      style: { width: 380 },
      onOk: async () => {
        const flag = await ds.validate();
        const cancelReason = ds.current?.get('cancelReason');
        if (flag) {
          const res = getResponse(await handleCancel({ ...headData, cancelReason }));
          if (res) {
            props.history.push('/s2-mall/oms/request-workBench');
          }
        } else {
          return false;
        }
      },
    });
  }

  const handleOperation = async () => {
    const data = baseDS.toData();
    const res = await fetchApproveRecord(data);
    let approveRecord = [];
    if (res) {
      const { workflowApproveResponseDTOList = [] } = res?.[data?.[0]?.requestCode] || {};
      const list = workflowApproveResponseDTOList?.reduce((p, c) => {
        const { historicTaskExtList, historicTaskList } = c;
        return p.concat(historicTaskExtList || []).concat(historicTaskList || []);
      }, []) || [];
      // 时间降序
      approveRecord = list.sort((a, b) => {
        const v = moment(a.endTime).isBefore(b.endTime);
        return v ? +v : +v - 1;
      });
    }
    const modal = c7nModal({
      title: intl.get('smodr.apply.view.operaRecord').d('操作记录'),
      children: (
        approveRecord.length > 0 ?
          (
            <Observer>
              {() => (
                <Tabs defaultActiveKey={activeKey.get()} activeKey={activeKey.get()} onChange={handleChangeTab}>
                  <Tabs.TabPane
                    tab={intl.get('smodr.common.view.operateRecord').d('操作记录')}
                    key='0'
                  >
                    <div style={{ marginTop: '8px' }}>
                      <OperationRecord requestId={requestId} goBack={() => handleChangeTab('1')} />
                    </div>
                  </Tabs.TabPane>
                  <Tabs.TabPane
                    tab={intl.get('smodr.common.view.approveRecord').d('审批记录')}
                    key='1'
                  >
                    <ApproveRecord data={approveRecord} />
                  </Tabs.TabPane>
                </Tabs>
              )}
            </Observer>
          ) :
          (<OperationRecord requestId={requestId} />)
      ),
      style: { width: '742px' },
      footer: <Button color='primary' onClick={() => modal?.close()}>{intl.get('smodr.apply.view.close').d('关闭')}</Button>,
    });
  };

  const HeaderBtn = observer(({ ds }) => {
    const { customizeBtnGroup } = props;
    const status = ds.current?.get('requestStatus');
    const btns = [
      {
        name: 'cancelBtn',
        btnType: 'c7n-pro',
        child: intl.get('smodr.apply.view.cancel').d('取消'),
        btnProps: {
          onClick: () => handleToCancel(status),
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'cancel',
        },
        // () => {
        //   return <Button type='c7n-pro' icon='cancel' onClick={handleToCancel} funcType='flat'>{}</Button>;
        //   // ['NEW', 'REJECTED', 'SUBMITTED'].includes(baseDS?.current?.get('requestStatus')) &&
        // },
      },
    ];
    return (
      <>
        {customizeBtnGroup(
          {
            code: 'SMODR.REQUEST.DETAIL.BTNS.GROUP',
            pro: true,
          },
          <DynamicButtons buttons={btns} />
        )}
      </>
    );
  });

  const { remote: remoteRender } = props;
  const cuxProps = {
    baseDS,
    skuDS,
    props,
  };
  return (
    <>
      <Header
        title={intl.get('smodr.apply.view.applyDetail').d('申请详情')}
        backPath={sourceFrom === 'order' ? '/s2-mall/oms/request-workBench/list' : ''}
      >
        {+wflApproveFlag === 1 && (
          <Button
            icon='authorize'
            color='primary'
            onClick={() => {
              openApproveModal({
                modalProps: {
                  closable: true,
                },
                taskId,
                processInstanceId,
                onSuccess: () => {
                  props.history.push('/s2-mall/oms/request-workBench');
                },
              });
            }}
          >
            {intl.get('hzero.common.button.approval').d('审批')}
          </Button>
        )}
        {+wflRevokeApproveFlag === 1 && (
          <Button
            icon='reply'
            funcType='flat'
            onClick={() => handleRevokeApprove(baseDS.current.get('requestCode'), () => props.history.push('/s2-mall/oms/request-workBench'))}
          >
            {intl.get('hzero.common.button.revokeApproval').d('撤销审批')}
          </Button>
        )}
        {remoteRender.render('CONFIRM_PROCESSING_BUTTON', '', cuxProps)}
        <Button icon="operation_service_request" funcType="flat" onClick={handleOperation}>
          {intl.get('smodr.apply.view.operaRecord').d('操作记录')}
        </Button>
        {sourceFrom === 'order' && (
          <>
            {/* 二开隐藏编辑按钮  */}
            {remoteRender.render(
              'EDIT_BUTTON',
              <Observer>
                {() => {
                  return (
                    ['ACCEPTING'].includes(baseDS?.current?.get('requestStatus')) && (
                      <Button
                        icon="mode_edit"
                        onClick={() =>
                          props.history.push(
                            `/s2-mall/oms/request-workBench/detail-edit?requestId=${requestId}`
                          )
                        }
                        funcType="flat"
                      >
                        {intl.get('smodr.apply.view.edit').d('编辑')}
                      </Button>
                    )
                  );
                }}
              </Observer>,
              ''
            )}
            <Observer>
              {() => {
                return (
                  ['ACCEPTING', 'RETURNED'].includes(baseDS?.current?.get('requestStatus')) && (
                    <PermissionButton
                      type='c7n-pro'
                      icon='cancel'
                      funcType='flat'
                      onClick={handleToCancel}
                      permissionList={[
                        {
                          code: `${permissionText}.info.cancel`,
                          type: 'button',
                          meaning: intl.get('smodr.apply.view.titleDetail').d('商城申请详情') -
                            intl.get('smodr.apply.view.permissionCancelDetail').d('取消按钮'),
                        },
                      ]}
                    >
                      {intl.get('smodr.apply.view.cancel').d('取消')}
                    </PermissionButton>
                  ));
              }}
            </Observer>
            <HeaderBtn ds={baseDS} />
          </>
        )
        }
      </Header>
      <AlertTips
        message={intl.get('smodr.apply.view.tips').d('因受商品数量、收货地址、拆单规则等影响，本阶段无法估算准确的附加费金额，故当前总金额不包含此部分，请以转单后订单金额为准')}
      />
      <Content style={{ padding: 0, marginBottom: '8x' }} className={styles['apply-workbench']}>
        <div style={{ padding: '20px' }}>
          <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>{intl.get('smodr.apply.view.baseInfo').d('基本信息')}</div>
          <RenderForm
            columns={3}
            dataSet={baseDS}
            code='SMODR.REQUEST.DETAIL.BASE.INFO'
            fields={renderFields}
            customizeForm={props.customizeForm}
          />
        </div>
        <div style={{ height: '8px', width: '100%', background: '#f4f5f7' }} />
        <div style={{ padding: '20px' }}>
          <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>{intl.get('smodr.apply.view.skuInfo').d('商品信息')}</div>
          {props.customizeTable(
            {
              code: 'SMODR.REQUEST.DETAIL.SKU.INFO',
              readOnly: true,
            },
            (
              <SearchBarTable
                dataSet={skuDS}
                searchCode='SMODR.REQUEST.DETAIL.SKU.SEARCHBAR1'
                columns={tableDsFields().filter(i => i.columns !== false)}
                style={{ maxHeight: 430 }}
                cacheState
                searchBarConfig={{
                  expandable: false,
                  closeFilterSelector: true,
                }}
              />
            )
          )}
        </div>
        <div style={{ height: '8px', width: '100%', background: '#f4f5f7' }} />
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex' }}>
            <div style={{ flex: 1, paddingRight: 20 }}>
              <div className="order-product-info" id="ACC_INFO">
                {intl.get('smodr.orderDetail.model.accessoryInner').d('内部附件')}
              </div>
              <Attachment
                readOnly
                showHistory
                dataSet={baseDS}
                name='attachmentUuid'
                bucketName={PRIVATE_BUCKET}
                labelLayout='float'
                label={intl.get('smodr.orderDetail.model.purchaseAttachment').d('采购方附件')}
              />
            </div>
            <div style={{ paddingLeft: 16, borderLeft: '1px dashed rgba(0,0,0,0.16)', flex: 1 }}>
              <div className="order-product-info" id="ACC_INF_OUT">
                {intl.get('smodr.orderDetail.model.accessoryOutter').d('外部附件')}
              </div>
              <Attachment
                readOnly
                showHistory
                dataSet={baseDS}
                name="outerAttachmentUuid"
                bucketName={PRIVATE_BUCKET}
                labelLayout="float"
                label={intl.get('smodr.orderDetail.model.purchaseAttachment').d('采购方附件')}
              />
            </div>
          </div>
        </div>
      </Content>
    </>
  );
}

export default compose(
  formatterCollections({
    code: ['smodr.orderDetail', 'smodr.apply', 'smodr.common'],
  }),
  withCustomize({
    unitCode: ['SMODR.REQUEST.DETAIL.BASE.INFO', 'SMODR.REQUEST.DETAIL.SKU.INFO', 'SMODR.REQUEST.DETAIL.BTNS.GROUP'],
  }),
  remote({
    code: 'SMODR_APPLYWORKBENCH_READONLYPAGE',
    name: 'remote',
  })
)(ReadPage);
