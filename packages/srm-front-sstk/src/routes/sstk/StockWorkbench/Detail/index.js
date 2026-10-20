import React, { useMemo, useState, useEffect, useCallback } from 'react';
import qs from 'querystring';
import { Form, Attachment, Button } from 'choerodon-ui/pro';
import { flowRight } from 'lodash';
import classNames from 'classnames';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { PRIVATE_BUCKET } from '_utils/config';
import remoteFunc from 'hzero-front/lib/utils/remote';
import notification from 'utils/notification';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import PrintProButton from 'srm-front-boot/lib/components/PrintProButton';
import { openApproveModal } from '_components/ApproveModal';

import { HeadButton } from '@/components/CommonButtons';
import { confirm } from '@/utils/c7nModal';
import { openRecordTabs } from '@/utils/drawer/commonDrawer';
import stockRecordRender from '../record/stockRecord';
import BaseInfo from './BaseInfo';
import OrderLine from './OrderLine';
import { useInitStore, handleOrderOperate, handleInOrOutStock } from './func';
import {
  detailCodes,
  inOrderCodes,
  outOrderCodes,
  transferOrderCodes,
  getLineSearchbarCode,
} from './custoCode';
import { fetchDeleteOrder } from '../api';
import { handleRevokeApprove } from '../../utils';

import styles from './index.less';

const organizationId = getCurrentOrganizationId();
const SRM_STCK = '/stck';

function Detail(props) {
  const {
    location: { search = '', pathname },
    match: {
      params: { status },
    },
    history: { push },
    customizeTable,
    customizeForm,
    remote,
  } = props;
  // 单据类型 入库(IN) 出库(OUT) 调拨(TRANSFER)
  const {
    inOutHeaderId,
    type = '',
    backPath,
    wflApproveFlag,
    wflRevokeApproveFlag,
    taskId,
    processInstanceId,
    businessKey,
  } = qs.parse(search.substr(1));
  const isPub = pathname.includes('pub');
  const [readOnly, setReadOnly] = useState(status === 'read' || isPub);
  const [{ operateType, statusCode, headerId, deleteFlag }, setOrderInfo] = useState({
    operateType: type,
    headerId: inOutHeaderId,
    statusCode: '',
  });
  const prefix =
    operateType === 'IN'
      ? intl.get('sstk.common.view.prefix.in').d('入库单')
      : operateType === 'OUT'
        ? intl.get('sstk.common.view.prefix.out').d('出库单')
        : intl.get('sstk.common.view.prefix.transfer').d('调拨单');

  const title = readOnly
    ? `${prefix}${intl.get('sstk.common.view.title.suffix.detail').d('详情')}`
    : headerId
      ? `${intl.get('hzero.common.button.edit').d('编辑')}${prefix}`
      : `${intl.get('hzero.common.button.create').d('新建')}${prefix}`;

  const dsMap = useInitStore({ inOutHeaderId: headerId, readOnly, operateType, remote });
  const { baseInfoDs, orderLineDs } = dsMap;

  useEffect(() => {
    initData();
  }, [headerId, readOnly, operateType]);

  // 各版块高度撑满可视区域
  useEffect(() => {
    getDetailHeight();
  });

  const getDetailHeight = () => {
    const dom = document.getElementsByClassName(styles['stock-order-detail'])[0];
    const rectInfo = dom?.getBoundingClientRect();
    if (rectInfo.bottom <= document.body.clientHeight) {
      dom.classList.add(styles['auto-height']);
    }
  };

  const initData = async () => {
    // 工作流 url上无单据类型
    baseInfoDs.setQueryParameter('customizeUnitCode', getCustomCode());
    orderLineDs.setQueryParameter(
      'customizeUnitCode',
      `${getCustomCode('line')}, ${getLineSearchbarCode(operateType)}`
    );
    if (isPub && !operateType) {
      baseInfoDs.setQueryParameter('inOutHeaderId', headerId);
      await baseInfoDs.query();
      setOrderInfo(pre => ({ ...pre, ...baseInfoDs.current.toData() }));
      return;
    }
    if (headerId) {
      baseInfoDs.setQueryParameter('inOutHeaderId', headerId);
      await baseInfoDs.query();
      setOrderInfo(pre => ({ ...pre, ...baseInfoDs.current.toData() }));
      orderLineDs.setQueryParameter('inOutHeaderId', headerId);
      await orderLineDs.query();
    }
  };

  const handleDeleteOrder = () => {
    confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      content: intl.get('sstk.stockWorkbench.view.confirm.deleteOrder').d(`请确认是否删除库存单？`),
      onOk: async () => {
        const res = getResponse(await fetchDeleteOrder(baseInfoDs.current.toData()));
        if (res) {
          notification.success();
          push('/sstk/stock-workbench/list');
        }
      },
    });
  };

  const getCustomCode = useCallback(
    (codeType = 'header') => {
      const code =
        operateType === 'IN'
          ? inOrderCodes
          : operateType === 'OUT'
            ? outOrderCodes
            : transferOrderCodes;
      return codeType === 'header' ? code.header : code.line;
    },
    [operateType]
  );

  // const handlePrint = async () => {
  //   const res = getResponse(await fetchPrint(inOutHeaderId));
  //   if (res) {
  //     const file = new Blob([res], { type: 'application/pdf' });
  //     const fileUrl = URL.createObjectURL(file);
  //     const printWindow = window.open(fileUrl);
  //     if (printWindow) {
  //       printWindow.print();
  //     }
  //   }
  // };

  const headerBtns = useMemo(() => {
    if (isPub) return [
      {
        show: headerId,
        comp: (
          <HeadButton
            name="operateRecord"
            icon="operation_service_request"
            funcType="flat"
            onClick={() =>
              openRecordTabs({
                headerRecord: baseInfoDs.current,
                operateArg: {
                  url: `/stck/v1/${getCurrentOrganizationId()}/in-out-order-records/list`,
                  queryParams: {
                    inOutHeaderId: headerId,
                  },
                  operateRenderer: stockRecordRender,
                },
              })
            }
          >
            {intl.get('hzero.common.button.operating').d('操作记录')}
          </HeadButton>
        ),
      },
    ].map(m => m.comp);
    if (deleteFlag) return '';
    const btns = [
      {
        show: +wflApproveFlag,
        comp: (
          <Button
            icon="authorize"
            color="primary"
            onClick={() => {
              openApproveModal({
                modalProps: {
                  closable: true,
                },
                taskId,
                processInstanceId,
                onSuccess: () => {
                  push(backPath);
                },
              });
            }}
          >
            {intl.get('hzero.common.button.approval').d('审批')}
          </Button>
        ),
      },
      {
        show: +wflRevokeApproveFlag,
        comp: (
          <Button
            icon="reply"
            funcType="flat"
            onClick={() => handleRevokeApprove(businessKey, () => push(backPath))}
          >
            {intl.get('hzero.common.button.revokeApproval').d('撤销审批')}
          </Button>
        ),
      },
      {
        // 编辑状态的 新建、审批拒绝
        show: headerId && !readOnly && ['NEW', 'REJECTED'].includes(statusCode),
        comp: (
          <HeadButton
            name="submit"
            icon="check"
            color="primary"
            bindBtn={['save', 'delete']}
            dataSet={baseInfoDs}
            delay={600}
            onClick={() =>
              handleOrderOperate({ baseInfoDs, orderLineDs, operateType }, 'submit', () => {
                push('/sstk/stock-workbench/list');
              })
            }
          >
            {intl.get('hzero.common.button.submit').d('提交')}
          </HeadButton>
        ),
      },
      // 新建状态
      {
        show: !headerId || (headerId && !readOnly && statusCode === 'NEW'),
        comp: (
          <HeadButton
            name="save"
            icon="save"
            funcType="flat"
            bindBtn={['submit', 'delete']}
            dataSet={baseInfoDs}
            onClick={() =>
              handleOrderOperate({ baseInfoDs, orderLineDs, operateType }, 'save', async res => {
                const { inOutHeaderId: id } = res || {};
                setOrderInfo(pre => ({ ...pre, headerId: id }));
                initData();
              })
            }
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </HeadButton>
        ),
      },
      {
        //  新建、审批拒绝
        show: readOnly && headerId && ['NEW', 'REJECTED'].includes(statusCode),
        comp: (
          <HeadButton
            name="edit"
            icon="mode_edit"
            funcType="flat"
            onClick={() => {
              // push({
              //   pathname: `/sstk/stock-workbench/detail/edit`,
              //   search: qs.stringify({
              //     inOutHeaderId: headerId,
              //     backPath: `/sstk/stock-workbench/list`,
              //     type: operateType,
              //   }),
              // });
              setReadOnly(false);
            }}
          >
            {intl.get('hzero.common.button.edit').d('编辑')}
          </HeadButton>
        ),
      },
      {
        // 新建、审批拒绝
        show: headerId && ['NEW', 'REJECTED'].includes(statusCode),
        comp: (
          <HeadButton
            name="delete"
            icon="delete"
            funcType="flat"
            dataSet={baseInfoDs}
            onClick={handleDeleteOrder}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </HeadButton>
        ),
      },
      {
        // 出库单 && 已审批
        show: headerId && statusCode === 'APPROVED' && operateType === 'OUT',
        comp: (
          <HeadButton
            dataSet={baseInfoDs}
            name="outStock"
            icon="check"
            color="primary"
            onClick={() => handleInOrOutStock('out', headerId, initData)}
          >
            {intl.get('sstk.stockWorkbench.view.button.outStock').d('确认出库')}
          </HeadButton>
        ),
      },
      {
        // 入库单 && 已审批
        show: headerId && (statusCode === 'APPROVED' && operateType === 'IN'),
        comp: (
          <HeadButton
            dataSet={baseInfoDs}
            name="inStock"
            icon="check"
            color="primary"
            onClick={() => handleInOrOutStock('in', headerId, initData)}
          >
            {intl.get('sstk.stockWorkbench.view.button.inStock').d('确认入库')}
          </HeadButton>
        ),
      },
      {
        // 调拨单 && 已审批
        show: headerId && (statusCode === 'APPROVED' && operateType === 'TRANSFER'),
        comp: (
          <HeadButton
            dataSet={baseInfoDs}
            name="inStock"
            icon="check"
            color="primary"
            onClick={() => handleInOrOutStock('transfer', headerId, initData)}
          >
            {intl.get('sstk.stockWorkbench.view.button.transferFinished').d('调拨完成')}
          </HeadButton>
        ),
      },
      {
        show: headerId,
        comp: (
          <HeadButton
            name="operateRecord"
            icon="operation_service_request"
            funcType="flat"
            onClick={() =>
              openRecordTabs({
                headerRecord: baseInfoDs.current,
                operateArg: {
                  url: `/stck/v1/${getCurrentOrganizationId()}/in-out-order-records/list`,
                  queryParams: {
                    inOutHeaderId: headerId,
                  },
                  operateRenderer: stockRecordRender,
                },
              })
            }
          >
            {intl.get('hzero.common.button.operating').d('操作记录')}
          </HeadButton>
        ),
      },
      {
        show:
          headerId && readOnly && ['APPROVED', 'COMPLETE', 'WORKFLOW_WAITING'].includes(statusCode),
        comp: (
          <PrintProButton
            name="print"
            buttonText={intl.get('hzero.common.button.print').d('打印')}
            buttonProps={{
              icon: 'print',
              type: 'c7n-pro',
              funcType: 'flat',
            }}
            requestUrl={`${SRM_STCK}/v1/${organizationId}/in-out-order-headers/print-order?customizeUnitCode=${getCustomCode()},${getCustomCode(
              'line'
            )}`}
            method="POST"
            data={[inOutHeaderId]}
          />
        ),
      },
    ];
    return btns.filter(f => f.show || !('show' in f)).map(m => m.comp);
  }, [readOnly, headerId, statusCode, operateType, deleteFlag]);

  const contents = useMemo(
    () =>
      [
        {
          key: 'base-info',
          title: intl.get('sstk.stockWorkbench.view.baseInfo').d('基础信息'),
          comp: BaseInfo,
          // show: type !== 'TRANSFER',
          props: {
            readOnly,
            remote,
            dataSet: baseInfoDs,
            orderLineDs,
            operateType,
            customizeForm,
            customizeCode: getCustomCode(),
          },
        },
        {
          key: 'order-line',
          title: intl.get('sstk.stockWorkbench.view.orderLine').d('库存单据行'),
          show: headerId,
          comp: OrderLine,
          props: {
            readOnly,
            remote,
            inOutHeaderId: headerId,
            orderLineDs,
            baseInfoDs,
            operateType,
            customizeTable,
            customizeCode: getCustomCode('line'),
          },
        },
        {
          key: 'attachment',
          show: headerId,
          title: intl.get('sstk.stockWorkbench.view.batchConfig').d('附件'),
          comp: () => {
            return (
              <Form dataSet={baseInfoDs} style={{ width: '50%' }} labelLayout="float">
                <Attachment
                  name="attachmentUuid"
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="sstk-stock"
                  // accept={['.rar', '.zip', '.doc', '.docx', '.pdf', '.png']}
                  // help={intl
                  //   .get('hzero.common.view.title.enableFile')
                  //   .d('支持文件类型： .rar .zip .doc .docx .pdf .png')}
                  readOnly={readOnly}
                />
              </Form>
            );
          },
          props: {
            readOnly,
            orderLineDs,
          },
        },
      ].filter(f => f.show || !('show' in f)),
    [readOnly, headerId, operateType, baseInfoDs.current, isPub]
  );
  return (
    <>
      <Header title={title} backPath={backPath}>
        {remote.render('HEADER_BTNS', headerBtns, {
          operateType,
          statusCode,
          orderLineDs,
          baseInfoDs,
        })}
      </Header>
      <Content className={classNames(styles['stock-order-detail'])}>
        {contents.map((m, idx) => (
          <>
            <div className={styles['part-content-divider']} style={{ height: idx === 0 ? 0 : 8 }} />
            <Content key={m.id} className={styles['part-content']}>
              <div id={m.id} className={styles['content-title']}>
                {m.title}
              </div>
              {m.comp ? <m.comp {...m.props} /> : m.title}
            </Content>
          </>
        ))}
      </Content>
    </>
  );
}

export default flowRight(
  /**
   * 1. 优品道入库单行增加新字段，确认入库逻辑变更 mall-7370
   */
  remoteFunc({
    code: 'STOCK_WORK_BENCH',
    name: 'remote',
  }),
  formatterCollections({
    code: ['hzero.common', 'sstk.stockWorkbench', 'sstk.common', 'sagm.common', 'smpc.product'],
  }),
  withCustomize({ unitCode: detailCodes })
)(Detail);
