/* eslint-disable no-param-reassign */
import React, { useMemo, useEffect, useState } from 'react';
import { compose } from 'lodash';
import { Button, Attachment, DataSet, Form, TextField, Lov, TextArea, Modal, DateTimePicker } from 'choerodon-ui/pro';
import qs from 'qs';
import { observer, useLocalStore } from 'mobx-react-lite';
import { Observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import notification from 'utils/notification';
import SearchBarTable from '_components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';
import c7nModal from '@/utils/c7nModal';
import { handleSave, handleSubmit, handleCancel, handleSendBack, receiveConfirm, handleLineDelete } from '@/services/oms/applyWorkBenchService';
import { getResponse } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { Button as PermissionButton } from 'components/Permission';
import AlertTips from '@/components/AlertTips';

import { baseDs, tableDs, editDs, receiveDs } from './ds';
import { tableDsFields } from './dataSource';
import EditForm from './editForm';
import ReceiveForm from './receiveForm';

import styles from './index.less';

const PRIVATE_BUCKET = window.$$env.PRIVATE_BUCKET || 'private-bucket';
const permissionText = 'srm.mall.tenant.mall-request.workbench.button';

function EditPage(props) {
  const { customizeTable, customizeForm } = props;

  let ReceiveModal = null;

  const { requestId } = qs.parse(props.location.search.substr(1));
  const [{ sourceFromCode }, setHeaderInfo] = useState({});
  const baseDS = useMemo(() => new DataSet(baseDs()), []);
  const skuDS = useMemo(() => new DataSet(tableDs('edit')), []);
  const store = useLocalStore(() => ({
    type: undefined,
    sourceFromCode: '',
    // agreementType: undefined,
    setType: (data) => {
      store.type = data.type;
      // store.agreementType = data.agreementType;
    },
    setHeaderInfo: (data) => {
      store.sourceFromCode = data.sourceFromCode;
    },
  }), store);

  useEffect(() => {
    initData();
  }, [requestId]);

  async function initData(cache = true) {
    baseDS.setQueryParameter('requestId', requestId);
    skuDS.setQueryParameter('requestId', requestId);
    const baseData = await baseDS.query();
    setHeaderInfo(pre => ({ ...pre, sourceFromCode: baseData.sourceFromCode }));
    skuDS.query(skuDS.currentPage, null, cache);
  }
  const handleData = async (type) => {
    const headData = baseDS.current.toData();
    const lineData = skuDS.toJSONData();
    let flag = false;
    flag = await skuDS.validate();
    if (flag) {
      if (type === 'submit') {
        baseDS.setState('save_loading', true);
        const res = getResponse(await handleSubmit({ ...headData, mallRequestEntryViewDTOList: lineData }));
        if (res) {
          props.history.push('/s2-mall/oms/request-workBench');
        } else {
          baseDS.setState('save_loading', false);
        }
      } else if (type === 'save') {
        baseDS.setState('save_loading', true);
        const res = getResponse(await handleSave({ ...headData, mallRequestEntryViewDTOList: lineData }));
        if (res) {
          notification.success();
          initData(false);
        } else {
          baseDS.setState('save_loading', false);
        }
      }
    }
  };

  const handleBack = () => {
    const headData = baseDS.current.toData();
    const ds = new DataSet({
      autoCreate: true,
      selection: false,
      fields: [{
        name: 'returnReason',
        label: intl.get('smodr.apply.view.backReason').d('退回原因'),
        type: 'string',
        required: true,
      }],
    });
    c7nModal({
      title: intl.get('smodr.apply.view.backReason').d('退回原因'),
      children: (
        <Form labelLayout='float' dataSet={ds}>
          <TextArea name='returnReason' resize='both' />
        </Form>
      ),
      style: { width: 380 },
      onOk: async () => {
        const flag = await ds.validate();
        const returnReason = ds.current?.get('returnReason');
        if (flag) {
          const res = getResponse(await handleSendBack({ ...headData, returnReason }));
          if (res) {
            props.history.push('/s2-mall/oms/request-workBench');
          }
        } else {
          return false;
        }
      },
    });
  };

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

  async function handleDelete() {
    const allSelectFlag = skuDS.selected.length === skuDS.totalCount;
    if (allSelectFlag) {
      notification.warning({ message: intl.get('smodr.apply.view.selectSomeNoDel').d('不支持删除全部申请行，请重新确认!') });
      return;
    }
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('smodr.apply.view.selectSome').d('是否确认删除勾选的申请行，删除后不可恢复。'),
      onOk: async () => {
        // 这个条件貌似不会进来了
        // if (allSelectFlag) {
        //   const headData = baseDS.current.toData();
        //   const res = getResponse(await handleCancel({ ...headData }));
        //   if (res) {
        //     props.history.push('/s2-mall/oms/request-workBench');
        //   }
        // } else {
        const data = skuDS.selected.map(i => i.toData());
        const realData = data.filter(i => i.requestEntryId);
        const falseData = skuDS.selected.filter(i => !i.get('requestEntryId'));
        skuDS.remove(falseData);
        if (realData.length > 0) {
          const res = getResponse(await handleLineDelete({ mallRequestEntryViewDTOList: realData }));
          if (res) {
            skuDS.unSelectAll();
            skuDS.clearCachedSelected();
            initData();
          }
        }
        // }
      },
    });
  }

  function getType(selData) {
    const typeArr = ['EC', 'CATA', 'MANUAL'];
    const type = typeArr.find(l => selData.find(line => line.sourceType === l));
    store.setType({ type });
    // if (selData.find(line => line.sourceType === 'EC')) {
    //   store.setType({ type: 'EC' });
    // } else if (selData.find(line => line.sourceType === 'CATA')) {
    //   store.setType({ type: 'CATA' });
    // } else if (selData.find(line => line.sourceType === 'MANUAL')) {
    //   store.setType({ type: 'MANUAL' });
    // }
  }

  const handleToReceive = (receiveDS, record) => {
    Modal.confirm({
      title: intl.get('smodr.apply.view.changeReceiveConfirm').d('转领用确认'),
      children: <div>{intl.get('smodr.apply.view.changeReceiveTip').d('转领用操作不可逆，确认将该申请行类型调整为领用吗？')}</div>,
      onOk: async () => {
        const data = receiveDS.current?.toData();
        const { skuId, skuCode, ...rest } = record.toData();
        const res = getResponse(await receiveConfirm({
          ...rest, ...data, unitPrice: data.unitPrice || 0,
        }));
        if (res && !res.failed) {
          notification.success();
          initData();
        }
        ReceiveModal.close();
      },
    });
  };

  function handleReceive(record) {
    const receiveDS = new DataSet(receiveDs(record));
    ReceiveModal = c7nModal({
      title: intl.get('smodr.apply.view.changeReceive').d('转领用'),
      children: <ReceiveForm dataSet={receiveDS} recordData={record} customizeForm={customizeForm} />,
      style: { width: 742 },
      onOk: async () => {
        const flag = await receiveDS.validate();
        if (flag) {
          handleToReceive(receiveDS, record);
          return false;
        } else {
          return false;
        }
      },
    });
  };

  const batchEdit = () => {
    const count = skuDS.selected.length;
    const selectFlag = count > 0;
    const selData = skuDS?.selected?.map(i => i?.toData());
    if (count === 0) {
      getType(skuDS?.filter(item => item?.get('lineStatus') !== 'CANCELED').map((i => i?.toData())));
    } else {
      getType(selData);
    }
    const editDS = new DataSet(editDs(store.type));
    const title = selectFlag ? intl.get('smodr.apply.view.selectEdit', { value: count }).d(`已勾选${count}条数据进行批量编辑`) : intl.get('smodr.apply.view.allEdit').d('针对全部数据进行批量编辑');
    c7nModal({
      title: intl.get('smodr.apply.view.batcnEdit').d('批量编辑'),
      children: <EditForm skuDS={skuDS} selectFlag={selectFlag} ds={editDS} title={title} type={store} />,
      style: { width: 380 },
      bodyStyle: { padding: 0 },
      onOk: () => {
        const editData = editDS.toJSONData()[0] || {};
        const data = selectFlag ? skuDS.selected : skuDS;
        data.forEach(i => {
          if (i.get('lineStatus') !== 'CANCELED') {
            i.set(editData);
          }
        });
        // if (selectFlag) {
        //   skuDS.selected.forEach(i => {
        //     i.set(editData);
        //     // keys.forEach(r => {
        //     //   i.set(r, editData[r]);
        //     // });
        //   });
        // } else {
        //   skuDS.forEach(i => {
        //     if (i.get('lineStatus') !== 'CANCELED') {
        //       i.set(editData);
        //     }
        // keys.forEach(r => {
        //   // 已取消的行不可改动
        //   if (i.get('lineStatus') !== 'CANCELED') {
        //     i.set(r, editData[r]);
        //   }
        // });
        // });
        // }
      },
    });
  };

  const handleCopy = () => {
    const copyData = skuDS.selected.map(i => i.toData());
    copyData.reverse().forEach((item) => {
      const newItem = {
        ...item,
        copyRequestEntryId: item.requestEntryId || item.copyRequestEntryId,
        requestEntryId: null,
        lineStatus: 'ACCEPTING',
        lineStatusMeaning: intl.get('smodr.apply.view.acceptance').d('受理中'),
      };
      skuDS.create(newItem, 0);
    });
  };

  const ObserverBtn = observer(() => {
    const data = skuDS.selected.map(i => i.toData());
    const flag = data.find(item => item.sourceType !== 'MANUAL');
    return (
      <PermissionButton
        type='c7n-pro'
        disabled={skuDS?.selected?.length === 0 || flag}
        icon='baseline-file_copy'
        color='primary'
        funcType='flat'
        onClick={handleCopy}
        wait={1000}
        waitType="throttle"
        permissionList={[
          {
            code: `${permissionText}.info.copy.entry`,
            type: 'button',
            meaning:
              intl.get('smodr.apply.view.titleDetail').d('商城申请详情') -
              intl.get('smodr.apply.view.permissionCopyLine').d('申请行复制按钮'),
          },
        ]}
      >
        {intl.get('smodr.apply.view.cpoy').d('复制')}
      </PermissionButton>
    );
  }
  );

  const ObserverDelBtn = observer(({ ds }) => {
    // const data = ds.selected.map(i => i.toJSONData());
    // const flag = data.find(item => item.sourceType === 'EC');
    return (
      <PermissionButton
        type='c7n-pro'
        disabled={ds?.selected?.length === 0}
        icon='delete_sweep'
        color='primary'
        funcType='flat'
        onClick={handleDelete}
        wait={1000}
        waitType="throttle"
        permissionList={[
          {
            code: `${permissionText}.info.delete.entry`,
            type: 'button',
            meaning:
              intl.get('smodr.apply.view.titleDetail').d('商城申请详情') -
              intl.get('smodr.apply.view.permissionDeleteLine').d('申请行删除按钮'),
          },
        ]}
      >
        {intl.get('smodr.common.view.batchDelete').d('批量删除')}
      </PermissionButton>
    );
  });

  const btns = [
    <ObserverBtn />,
    <PermissionButton
      type='c7n-pro'
      icon='mode_edit'
      color='primary'
      funcType='flat'
      onClick={batchEdit}
      wait={1000}
      waitType="throttle"
      permissionList={[
        {
          code: `${permissionText}.info.batch.edit.entry`,
          type: 'button',
          meaning:
            intl.get('smodr.apply.view.titleDetail').d('商城申请详情') -
            intl.get('smodr.apply.view.permissionBatcnEdit').d('申请行批量编辑按钮'),
        },
      ]}
    >
      {intl.get('smodr.apply.view.batcnEdit').d('批量编辑')}
    </PermissionButton>,
    <ObserverDelBtn ds={skuDS} />,
  ];

  return (
    <>
      <Header title={intl.get('smodr.apply.view.editDetail').d('编辑申请')} backPath='/s2-mall/oms/request-workBench/list'>
        <PermissionButton
          type='c7n-pro'
          icon='check_circle'
          color='primary'
          onClick={() => handleData('submit')}
          wait={1000}
          waitType="throttle"
          permissionList={[
            {
              code: `${permissionText}.info.submit`,
              type: 'button',
              meaning:
                intl.get('smodr.apply.view.titleDetail').d('商城申请详情') -
                intl.get('smodr.apply.view.permissionSubmitDetail').d('提交按钮'),
            },
          ]}
        >
          {intl.get('smodr.apply.view.submit').d('提交')}
        </PermissionButton>
        <Button
          icon='save'
          funcType='flat'
          wait={1000}
          waitType="throttle"
          onClick={() => handleData('save')}
        >{intl.get('smodr.apply.view.save').d('保存')}
        </Button>
        {sourceFromCode !== 'EXTERNAL_SYSTEM' && (
          <Observer>
            {() => {
              return (baseDS?.current?.get('requestStatus') === 'ACCEPTING') && (
                <PermissionButton
                  type='c7n-pro'
                  icon='reply'
                  funcType='flat'
                  wait={1000}
                  waitType="throttle"
                  onClick={() => handleBack()}
                  permissionList={[
                    {
                      code: `${permissionText}.info.return`,
                      type: 'button',
                      meaning:
                        intl.get('smodr.apply.view.titleDetail').d('商城申请详情') -
                        intl.get('smodr.apply.view.permissionReplyDetail').d('退回按钮'),
                    },
                  ]}
                >
                  {intl.get('smodr.apply.view.sendBack').d('退回')}
                </PermissionButton>
              );
            }}
          </Observer>
        )}
        <Observer>
          {() => {
            return ['ACCEPTING', 'RETURNED'].includes(baseDS?.current?.get('requestStatus')) && (
              <PermissionButton
                type='c7n-pro'
                icon='cancel'
                funcType='flat'
                onClick={() => handleToCancel()}
                wait={1000}
                waitType="throttle"
                permissionList={[
                  {
                    code: `${permissionText}.info.cancel`,
                    type: 'button',
                    meaning:
                      intl.get('smodr.apply.view.titleDetail').d('商城申请详情') -
                      intl.get('smodr.apply.view.permissionCancelDetail').d('取消按钮'),
                  },
                ]}
              >
                {intl.get('smodr.apply.view.cancel').d('取消')}
              </PermissionButton>
            );
          }}
        </Observer>
        {/* <Button icon='operation_service_request' funcType='flat'>{intl.get('smodr.apply.view.operaRecord').d('操作记录')}</Button> */}
      </Header>
      <AlertTips
        message={intl.get('smodr.apply.view.tips').d('因受商品数量、收货地址、拆单规则等影响，本阶段无法估算准确的附加费金额，故当前总金额不包含此部分，请以转单后订单金额为准')}
      />
      <Content style={{ padding: 0, marginBottom: '8px' }} className={styles['apply-workbench']}>
        <div style={{ padding: '20px' }}>
          <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>{intl.get('smodr.apply.view.baseInfo').d('基本信息')}</div>
          {
            customizeForm({
              code: 'SMODR.REQUEST.DETAIL.BASE.INFO',
            },
              <Form
                labelLayout='float'
                columns={3}
                dataSet={baseDS}
                useWidthPercent
              >
                <TextField name='requestCode' disabled />
                <TextField name='requestTypeMeaning' disabled />
                <TextField name='sourceFromMeaning' disabled />
                <TextField name='sourceFromSystemMeaning' disabled />
                <TextField name='requestAmountMeaning' disabled />
                <TextField name='currencyName' disabled />
                <Lov name='handleAgentByNameLov' />
                <Lov name='handleByNameLov' />
                <TextField name='createdByName' disabled />
                <DateTimePicker name='requestDate' disabled />
                <TextArea name='remark' colSpan={2} rows={3} newLine resize="both" />
              </Form>
            )
          }
        </div>
        <div style={{ height: '8px', width: '100%', background: '#f4f5f7' }} />
        <div style={{ padding: '20px' }}>
          <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>{intl.get('smodr.apply.view.skuInfo').d('商品信息')}</div>
          {
            customizeTable(
              {
                code: 'SMODR.REQUEST.DETAIL.SKU.INFO',
              },
              <SearchBarTable
                dataSet={skuDS}
                searchCode='SMODR.REQUEST.DETAIL.SKU.SEARCHBAR1'
                columns={tableDsFields('edit', handleReceive, sourceFromCode).filter(i => i.columns !== false)}
                buttons={btns}
                style={{ maxHeight: 450 }}
                searchBarConfig={{
                  defaultExpand: false,
                  closeFilterSelector: true,
                }}
              />
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
                showHistory
                dataSet={baseDS}
                name='attachmentUuid'
                bucketName={PRIVATE_BUCKET}
                bucketDirectory='smodr'
                labelLayout='float'
                label={intl.get('smodr.orderDetail.model.purchaseAttachment').d('采购方附件')}
              />
            </div>
            <div style={{ paddingLeft: 16, borderLeft: '1px dashed rgba(0,0,0,0.16)', flex: 1 }}>
              <div className="order-product-info" id="ACC_INF_OUT">
                {intl.get('smodr.orderDetail.model.accessoryOutter').d('外部附件')}
              </div>
              <Attachment
                showHistory
                dataSet={baseDS}
                name="outerAttachmentUuid"
                bucketName={PRIVATE_BUCKET}
                bucketDirectory='smodr'
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
    code: ['smodr.orderDetail', 'smodr.apply', 'smodr.common', 'hzero.common'],
  }),
  withRouter,
  withCustomize({
    unitCode: ['SMODR.REQUEST.DETAIL.BASE.INFO', 'SMODR.REQUEST.DETAIL.SKU.INFO', 'SMODR.REQUEST.DETAIL.RECEIVE.INFO'],
  }),
)(EditPage);
