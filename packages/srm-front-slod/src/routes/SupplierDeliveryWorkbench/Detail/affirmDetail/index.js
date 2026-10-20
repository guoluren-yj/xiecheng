/*
 * @Description: 发货工作台
 * @Date: 2021-12-09 10:38:14
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment, useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { DataSet, Spin, Modal } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import qs from 'querystring';
import { connect } from 'dva';

import { useDoubleUomConfig } from '@/routes/components/utils';
import { Collapse } from 'choerodon-ui';
import DynamicButtons from 'srm-front-boot/lib/components/DynamicButtons';
import { Header, Content } from 'components/Page';
import { compose, isEmpty } from 'lodash';
import cuxRemote from 'hzero-front/lib/utils/remote';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import notification from 'utils/notification';
// import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import request from 'hzero-front/lib/utils/request';
import { SRM_SLOD } from '_utils/config';
import OperationRecord from '_components/OperationRecord';
import SrmOperationRecord from '_components/SrmOperationRecord';

import { numText } from '@/utils/utils';
import { handleAffirm, handleClose } from '@/services/DeliveryWorkbenchServices';
import { detailCustomizeUnitCodes } from '../../globalFunction';
import Affix from '@/components/AffixDetail';
import {
  HeaderInfo,
  AsnHeaderShipmentsInfo,
  AsnHeaderReceivingInfo,
  AttachmentList,
} from './datailHeaderInfo';
import { lineSelectedCancelSelected } from '../../components/utils';
import { headerInfoDataSet, attachmentDataSet } from './store/headerInfoDS';
import { lineListDataSet } from './store/lineListDS';
import asnLineItemDs from '../../commonDs/asnLineItemDs';
import AsnLineItemTable from '../../commonDs/asnLineItemTable';
import LineList from './detailLineList';
import ChatCmp from '../../../../components/Chat'; // 聊天组件

import '@/routes/index.less';

const { Panel } = Collapse;

const DetailIndex = (props) => {
  const {
    remote,
    location: { search },
    history,
    customizeBtnGroup,
    doubleUnitEnabled,
    customizeCollapse,
  } = props;
  const {
    from = '',
    nodeTemplateCode = '',
    nodeConfigId = null,
    headerId = null,
    customizeCode = '',
  } = qs.parse(search.substr(1));
  const { handleInfoDataUpdate } = remote.props?.process || {};

  const STAGE_CODE = 'SUBMIT';
  const lineId = {
    LABEL: 'labelLineId',
    PLAN: 'planLineId',
    ASN: 'asnLineId',
    UNIQUE_LABEL: 'labelLineId',
  };
  const _object = {
    nodeTemplateType: nodeTemplateCode,
    id: lineId[nodeTemplateCode],
    unitLineCode: detailCustomizeUnitCodes(nodeTemplateCode, ['line']),
    doubleUnitEnabled,
  };
  const formDs = useMemo(
    () =>
      new DataSet(
        headerInfoDataSet({
          ..._object,
          unitCode:
            nodeTemplateCode === 'ASN'
              ? detailCustomizeUnitCodes(nodeTemplateCode, [
                  'header',
                  'shipment',
                  'receiving',
                  'attachment',
                ])
              : detailCustomizeUnitCodes(nodeTemplateCode, ['header']),
          handleInfoDataUpdate,
        })
      ),
    [headerId, handleInfoDataUpdate]
  );
  const attachmentDs = useMemo(
    () =>
      new DataSet(
        attachmentDataSet({
          ..._object,
          unitCode: detailCustomizeUnitCodes(nodeTemplateCode, ['attachment']),
        })
      ),
    [headerId]
  );
  const lineDs = useMemo(
    () =>
      new DataSet(
        remote
          ? remote.process(
              'SLOD_SUPPLIER_AFFIRMDETAILS_DETAIL_REMOTE_PROCESS_LINE_DS',
              lineListDataSet({
                ..._object,
                unitCode: detailCustomizeUnitCodes(nodeTemplateCode, ['line']),
              }),
              { props }
            )
          : lineListDataSet({
              ..._object,
              unitCode: detailCustomizeUnitCodes(nodeTemplateCode, ['line']),
            })
      ),
    [headerId]
  );
  const lineItemDs = useMemo(() => new DataSet(asnLineItemDs(_object)), [headerId]);
  lineDs.setState({ doubleUnitEnabled });
  attachmentDs.setState({ formDs });
  const tableLineRef = useRef();
  const [waitCustomize, setWaitCustomize] = useState(true);
  const [menuLoading, useMenuLoading] = useState(false); // 菜单加载loading
  const [lineType, useQueryList] = useState('left');
  const [btnLineFlag, useTypeFlag] = useState(true);
  const [statusCode, useStatus] = useState();
  const tplInfo = useMemo(() => ({ current: null }), []);
  const changeStatus = nodeTemplateCode === 'PLAN' || nodeTemplateCode === 'ASN'; // TODO:变更需求标识
  const [nodeConfigName, setNodeConfigName] = useState('...');
  const [cuzeDom, setOpen] = useState(true);
  const otherCustCode = detailCustomizeUnitCodes(nodeTemplateCode, [
    'header',
    'line',
    'btn-afi',
    'batch-btn',
    'batch-btn-aff',
  ]);
  const asnCustCode = detailCustomizeUnitCodes(nodeTemplateCode, [
    'header',
    'shipment',
    'receiving',
    'line',
    'line-item',
    'attachment',
    'btn-afi',
  ]);

  const receiptsCod = ['UNIQUE_LABEL'].includes(nodeTemplateCode) ? 'LABEL' : nodeTemplateCode;

  useEffect(() => {
    if (!waitCustomize && !isEmpty(tplInfo.current)) handleQuery();
    formDs.setState('lineDs', lineDs);
  }, [headerId, waitCustomize, tplInfo.current, handleInfoDataUpdate]);

  useEffect(() => {
    if (!props.custLoading) {
      const list = Object.keys(props.custConfig);
      const useCustFlag = list.includes('SLOD.DELIVERY__WORKBENCH_ASN_A.COLLAPSE_AFFIRM');
      setOpen(useCustFlag);
    }
  }, [props.custLoading, tplInfo.current]);

  useLayoutEffect(() => {
    loadingFlag(true);
    setWaitCustomize(true);
    const templateInfoPromise = request(`${SRM_SLOD}/v1/customize/template-cusz`, {
      method: 'POST',
      body: {
        templateCuszMethodCode: `SLOD_SHIP_WORKSPACE_${nodeTemplateCode}_DETAIL`,
        businessParam: {
          nodeConfigId,
          node: nodeTemplateCode,
          deliveryHeaderId: headerId,
        },
      },
    }).then((res) => {
      if (getResponse(res)) {
        tplInfo.current = {
          ...res,
          cuszTplStageCode: STAGE_CODE,
          cuszTplPageCode: 'DELIVERY_WORKBENCH.DETAIL',
        };
        if (res.useTemplateCusz) {
          props
            .queryTemplateConfig(templateInfoPromise, {
              stageCode: STAGE_CODE,
              pageCode: 'DELIVERY_WORKBENCH.DETAIL',
            })
            .then(() => {
              setTimeout(() => loadingFlag(false), 500);
              setWaitCustomize(false);
            });
        } else {
          const unitCodes = (nodeTemplateCode === 'ASN' ? asnCustCode : otherCustCode)?.split(',');
          props.queryUnitConfig(undefined, null, unitCodes).then(() => {
            setTimeout(() => loadingFlag(false), 500);
            setWaitCustomize(false);
          });
        }
        return res;
      }
      return {};
    });
  }, [headerId]);

  const handleQuery = () => {
    try {
      loadingFlag(true);
      formDs.setQueryParameter('params', {
        campKey: 's',
        headerId,
        nodeConfigId,
        nodeTemplateCode,
      });
      lineDs.setQueryParameter('params', {
        campKey: 's',
        headerId,
        nodeConfigId,
        nodeTemplateCode,
        editableFlag: lineType === 'left' ? 2 : null,
      });
      lineItemDs.setQueryParameter('params', {
        headerId,
        nodeConfigId,
        nodeTemplateCode,
        customizeUnitCode: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_ITEM_LIST`,
      });
      formDs.setQueryParameter('tplInfo', tplInfo?.current);
      lineDs.setQueryParameter('tplInfo', tplInfo?.current);
      lineItemDs.setQueryParameter('tplInfo', tplInfo?.current);
      if (nodeTemplateCode === 'ASN') {
        formDs.query().then((res) => {
          useStatus(res.statusCode);
          setNodeConfigName(res.nodeConfigName);
          attachmentDs.loadData([res]);
        });
        lineDs.query().then((res) => {
          if (getResponse(res)) {
            if (res.content.length === 0) {
              useQueryList('right');
              useTypeFlag(false);
              lineDs.setQueryParameter('params', {
                campKey: 's',
                headerId,
                nodeConfigId,
                nodeTemplateCode,
              });
              lineDs.query();
            }
          }
        });
        lineItemDs.query();
      } else {
        formDs.query().then((res) => {
          if (getResponse(res)) {
            useStatus(res.statusCode);
            setNodeConfigName(res.nodeConfigName);
          }
        });
        lineDs.query().then((res) => {
          if (getResponse(res)) {
            if (res.content.length === 0) {
              useQueryList('right');
              useTypeFlag(false);
              lineDs.setQueryParameter('params', {
                campKey: 's',
                headerId,
                nodeConfigId,
                nodeTemplateCode,
              });
              lineDs.query();
            }
          }
        });
      }
    } catch (e) {
      throw e;
    } finally {
      setTimeout(() => loadingFlag(false), 500);
    }
  };

  // 页面loading
  const loadingFlag = (type) => {
    useMenuLoading(type); // loading
  };

  // 综合事件
  const handleAllList = async (type) => {
    // 区分当前确认或者拒绝按钮分开校验字段
    if (type === 'affirm') {
      // eslint-disable-next-line no-unused-expressions
      formDs?.current?.set({ affirmOrClose: 1 });
    } else {
      // eslint-disable-next-line no-unused-expressions
      formDs?.current?.set({ affirmOrClose: 0 });
    }
    const validateLine = await Promise.all(lineDs.selected.map((i) => i.validate(true)));
    const listFlag = validateLine.every((item) => item === true);
    const lineList = lineDs.selected.map((item) => item.toJSONData());
    const headerFlag = await formDs.validate(); // 基础信息字段校验
    const lineFlag = isEmpty(lineDs.selected) ? await lineDs.validate() : listFlag; // 明细信息字段校验
    const uuidFlag = await attachmentDs.validate();
    const operationType = 'detail';
    const hdKey = lineList.length === 0 ? 'left' : 'right'; // 整单
    const paramsBabelPlan = {
      ...formDs?.current?.toData(),
      ...formDs?.current?.toJSONData(),
      deliveryLineDTOList: lineDs?.toJSONData(),
    };
    const paramsAsn = {
      ...formDs?.current?.toData(),
      ...attachmentDs?.current?.toJSONData(),
      deliveryLineDTOList: lineDs?.toJSONData(),
      asnItemLineList: lineItemDs?.toData(),
    };
    const headerInfo =
      lineList.length === 0 ? (nodeTemplateCode === 'ASN' ? paramsAsn : paramsBabelPlan) : lineList;
    const params = {
      hdKey,
      campKey: 's',
      headerInfo,
      nodeConfigId,
      operationType,
      nodeTemplateCode,
      num: lineList.length,
      tplInfo: tplInfo.current || {},
      unitCode: nodeTemplateCode === 'ASN' ? asnCustCode : otherCustCode,
    };
    const flag =
      nodeTemplateCode === 'ASN' ? headerFlag && lineFlag && uuidFlag : headerFlag && lineFlag;
    if (flag && formDs?.current?.get('_token')) {
      if (type === 'affirm') {
        if (remote?.event) {
          const beforRes = await remote?.event?.fireEvent('cuxIsConfirmFn', {
            formDs,
            lineDs,
            attachmentDs,
            lineItemDs,
            nodeTemplateCode,
            asnCustCode,
            otherCustCode,
            nodeConfigId,
            tplInfo,
          });
          if (!beforRes) return false;
        }
        try {
          loadingFlag(true);
          const res = await handleAffirm(params);
          if (getResponse(res)) {
            notification.success();
            if (lineList.length === 0) {
              history.push({
                pathname: `/slod/supplier-delivery-workbench/list`,
              });
            } else {
              if (tableLineRef?.current) {
                // eslint-disable-next-line no-unused-expressions
                tableLineRef?.current?.onResetLineChange();
              }
              handleQuery();
            }
          }
        } finally {
          loadingFlag(false);
        }
        return;
      }
      const code = numText(receiptsCod);
      const text = formDs?.current?.get(code);
      Modal.confirm({
        contentStyle: { width: '550px' },
        title: intl.get('slod.deliveryWorkbench.view.message.help').d('提示'),
        children: (
          <div>
            <span>{intl.get('slod.deliveryWorkbench.view.message.sureCloses').d('是否拒绝')}</span>
            <span>{`${nodeConfigName}${text}`}</span>
            {'?'}
          </div>
        ),
        okText: intl.get('hzero.common.button.sure').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: async () => {
          try {
            loadingFlag(true);
            const res = await handleClose(params);
            if (getResponse(res)) {
              notification.success();
              if (lineList.length === 0) {
                history.push({
                  pathname: `/slod/supplier-delivery-workbench/list`,
                });
              } else {
                if (tableLineRef?.current) {
                  // eslint-disable-next-line no-unused-expressions
                  tableLineRef?.current?.onResetLineChange();
                }
                handleQuery();
              }
            }
          } finally {
            loadingFlag(false);
          }
        },
      });
    }
  };

  const lineDelete = async (select, dataSet) => {
    const lineList = select.map((item) => item.toJSONData());
    const deleteFlag = lineList.some((i) => i[lineId[nodeTemplateCode]]);
    const selectData = lineList.filter((item) => item[lineId[nodeTemplateCode]]);
    const params = {
      nodeTemplateCode,
      nodeConfigId,
      selectData,
      campKey: 's',
    };
    if (deleteFlag) {
      try {
        dataSet.setState({ params });
        const { selected } = dataSet;
        const res = await dataSet.delete(selected, {
          title: intl.get('slod.deliveryWorkbench.view.message.help').d('提示'),
          children: intl.get('slod.deliveryWorkbench.view.message.orderDel').d(`确认删除选中行？`),
        });
        if (getResponse(res)) {
          formDs.query(undefined, undefined, true);
          dataSet.query(undefined, undefined, true);
        }
      } catch (err) {
        throw err;
      }
    } else {
      dataSet.remove(select);
      lineSelectedCancelSelected(dataSet, nodeTemplateCode, lineList);
    }
  };

  const onBack = () => {
    history.replace({
      from,
      nodeCode: nodeTemplateCode,
      nodeId: nodeConfigId,
    });
  };

  const queryList = (type) => {
    if (tableLineRef?.current) {
      lineDs.queryDataSet.current.set({
        itemCodeOrName: null,
      });
      // eslint-disable-next-line no-unused-expressions
      tableLineRef?.current?.onResetLineChange();
    }
    useQueryList(type);
    lineDs.setQueryParameter('params', {
      campKey: 's',
      headerId,
      nodeConfigId,
      nodeTemplateCode,
      editableFlag: type === 'left' ? 2 : null,
    });
    lineDs.query().then((res) => {
      if (getResponse(res)) {
        if (res.content.length === 0) {
          useQueryList('right');
          lineDs.setQueryParameter('params', {
            campKey: 's',
            headerId,
            nodeConfigId,
            nodeTemplateCode,
          });
          lineDs.query();
        }
      }
    });
  };

  const headerBtns = () => {
    const template =
      nodeTemplateCode === 'UNIQUE_LABEL' ? 'LABEL'.toLowerCase() : nodeTemplateCode?.toLowerCase();
    const BtnOption = (btns) => {
      return (
        <OperationRecord
          type="c7n-pro"
          btnType="button"
          color="#000"
          funcType={btns?.inMenuItem ? 'link' : 'flat'}
          icon={!btns?.inMenuItem && 'assignment'}
          tableName={`slod_${template}_header`}
          tablePk={headerId}
          commentRecordFlag
          commentStartFlag
          needMerge
          btnText={btns?.buttonText}
          lovParams={{
            nodeTemplateCode,
            deliveryHeaderId: headerId,
            tableName: `slod_${template}_header`,
            tablePk: headerId,
          }}
          exportParams={{
            nodeTemplateCode,
            deliveryHeaderId: headerId,
            tableName: `slod_${template}_header`,
            tablePk: headerId,
          }}
          lookupCode="SLOD.DELIVERY_RECORD_TYPE_LOCAL"
          templateCode={`SRM_C_SLOD_DELIVERY_RECORD_${template?.toUpperCase()}`}
          exportUrl={`${SRM_SLOD}/v1/${getCurrentOrganizationId()}/delivery/${nodeTemplateCode}/delivery-record/docflow/export`}
        />
      );
    };
    const BtnOptionBd = (btns) => {
      return (
        <SrmOperationRecord
          type="c7n-pro"
          btnType="button"
          color="#000"
          funcType={btns?.inMenuItem ? 'link' : 'flat'}
          icon={!btns?.inMenuItem && 'assignment'}
          btnText={
            btns?.buttonText ||
            intl.get('slod.deliveryWorkbench.model.view.btnText').d('操作记录（本地）')
          }
          url={`${SRM_SLOD}/v1/${getCurrentOrganizationId()}/delivery/${nodeTemplateCode}/delivery-record`}
          operationParams={{
            deliveryHeaderId: headerId,
          }}
          commentRecordFlag
          commentStartFlag
          needMerge
          exportParams={{
            deliveryHeaderId: headerId,
          }}
          lovParams={{ nodeTemplateCode, deliveryHeaderId: headerId }}
          lookupCode="SLOD.DELIVERY_RECORD_TYPE_LOCAL"
          templateCode={`SRM_C_SLOD_DELIVERY_RECORD_${template?.toUpperCase()}_LOCAL`}
          exportUrl={`${SRM_SLOD}/v1/${getCurrentOrganizationId()}/delivery/${nodeTemplateCode}/delivery-record/local/export`}
        />
      );
    };
    const ChatCmps = (btns) => {
      return (
        <ChatCmp
          type="c7n-pro"
          btnType="button"
          color="#000"
          campKey="s"
          loading={menuLoading}
          id={headerId}
          nodeConfigId={nodeConfigId}
          btnText={btns?.buttonText}
          nodeTemplateCode={nodeTemplateCode}
          icon={!btns?.inMenuItem && 'headset'}
          funcType={btns?.inMenuItem ? 'link' : 'flat'}
          companyId={formDs?.current?.get('supplierCompanyId')}
        />
      );
    };
    const btns = [
      {
        name: 'affirm',
        child: (name) => name || intl.get('slod.deliveryWorkbench.model.view.affirm').d('确认'),
        btnProps: {
          color: 'primary',
          icon: 'check',
          type: 'c7n-pro',
          // funcType: 'flat',
          loading: menuLoading,
          disabled: lineType === 'right' || !formDs?.current?.get('_token'),
          onClick: () => handleAllList('affirm'),
        },
      },
      {
        name: 'close',
        child: (name) => name || intl.get('slod.deliveryWorkbench.model.view.close').d('拒绝'),
        btnProps: {
          icon: 'close',
          type: 'c7n-pro',
          funcType: 'flat',
          loading: menuLoading,
          disabled: lineType === 'right' || !formDs?.current?.get('_token'),
          onClick: () => handleAllList('close'),
        },
      },
      {
        name: 'operating',
        child: (name) => name || intl.get('hzero.common.button.operatRecord').d('操作记录'),
        childFor: 'buttonText',
        btnComp: BtnOption,
      },
      {
        name: 'srmOperating',
        childFor: 'buttonText',
        child: (name) =>
          name || intl.get('slod.deliveryWorkbench.model.view.btnText').d('操作记录（本地）'),
        btnComp: BtnOptionBd,
      },
      {
        name: 'onlineChat',
        child: (name) =>
          name || intl.get('sinv.receiptWorkbench.view.title.detail.onlineChat').d('在线沟通'),
        childFor: 'buttonText',
        btnComp: ChatCmps,
      },
    ];
    return remote
      ? remote.process('SLOD.DETAIL_CONFIRM_HEADER_BUTTONS', btns, {
          formDs,
          lineDs,
          attachmentDs,
          nodeConfigId,
          nodeTemplateCode,
          camp: 'SUPPLIER',
        })
      : btns;
  };

  const buttons = headerBtns();
  const basicProps = {
    formDs,
    lineDs,
    remote,
    headerId,
    lineType,
    statusCode,
    btnLineFlag,
    lineItemDs,
    attachmentDs,
    nodeConfigId,
    customizeCode,
    nodeTemplateCode,
    tplInfo: tplInfo.current || {},
    customizeForm: props.customizeForm,
    customizeTable: props.customizeTable,
    customizeBtnGroup: props.customizeBtnGroup,
    queryList: (type) => queryList(type),
    lineDelete: (a, b) => lineDelete(a, b),
    changeStatus,
    doubleUnitEnabled,
  };

  const lineItemProps = {
    customizeTable: props.customizeTable,
    lineItemDs,
    nodeTemplateCode,
  };
  const linkKeys = useMemo(
    () => [
      'basicInfo',
      'receipShipment',
      'receipReceiving',
      'list',
      'asnLineItemTable',
      'receipAttachment',
    ],
    []
  );
  return (
    <Fragment>
      {nodeTemplateCode === 'ASN' && <Affix linkKeys={linkKeys} />}
      <Header
        title={`${intl
          .get('slod.deliveryWorkbench.model.common.editTitle')
          .d('编辑')}-${nodeConfigName}`}
        backPath="/slod/supplier-delivery-workbench/list"
        onBack={() => onBack()}
      >
        {customizeBtnGroup(
          {
            code: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.BTN_DETAIL_B`,
            pro: true,
          },
          <DynamicButtons
            buttons={buttons}
            maxNum={5}
            defaultBtnType="c7n-pro"
            permissions={[
              {
                code: ['ASN'].includes(nodeTemplateCode)
                  ? 'srm.logistics.delivery.supplier.work.bench.button.detail.onlinechat'
                  : ['LABEL'].includes(nodeTemplateCode)
                  ? 'srm.logistics.delivery.supplier.work.bench.button.detail.label.onlinechat'
                  : ['PLAN'].includes(nodeTemplateCode)
                  ? `srm.logistics.delivery.supplier.work.bench.button.detail.plan.onlinechat`
                  : 'srm.logistics.delivery.supplier.work.bench.button.detail.unique.label.onlinechat',
                name: 'onlineChat',
              },
            ]}
          />
        )}
      </Header>
      <Content
        className="customize-wrap"
        wrapperClassName="content-wrap"
        id="delivery-workspace-detail-containe"
      >
        <Spin spinning={waitCustomize} wrapperClassName={DETAIL_DEFAULT_CLASSNAME}>
          {customizeCollapse(
            {
              code: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.COLLAPSE_AFFIRM`,
            },
            <Collapse
              trigger="text-icon"
              ghost
              expandIconPosition="text-right"
              defaultActiveKey={linkKeys}
            >
              <Panel
                forceRender
                key="basicInfo"
                id="delivery-workSpace-detail-content-basicInfo"
                header={intl
                  .get(`slod.deliveryWorkbench.view.title.receipHeaderInfo`)
                  .d('基本信息')}
              >
                <HeaderInfo {...basicProps} />
              </Panel>
              <Panel
                forceRender
                hidden={nodeTemplateCode !== 'ASN'}
                key="receipShipment"
                id="delivery-workSpace-detail-content-receipShipment"
                header={intl
                  .get(`slod.deliveryWorkbench.view.title.receipShipmentsHeaderInfo`)
                  .d('发货信息')}
              >
                <AsnHeaderShipmentsInfo {...basicProps} />
              </Panel>
              <Panel
                forceRender
                hidden={nodeTemplateCode !== 'ASN'}
                key="receipReceiving"
                id="delivery-workSpace-detail-content-receipReceiving"
                header={intl
                  .get(`slod.deliveryWorkbench.view.title.receipReceivingHeaderInfo`)
                  .d('收货信息')}
              >
                <AsnHeaderReceivingInfo {...basicProps} />
              </Panel>
              <Panel
                forceRender
                key="list"
                id="delivery-workSpace-detail-content-list"
                header={intl.get(`slod.deliveryWorkbench.view.title.lineList`).d('明细信息')}
              >
                <LineList ref={tableLineRef} {...basicProps} />
              </Panel>
              <Panel
                forceRender
                hidden={!cuzeDom}
                key="asnLineItemTable"
                id="delivery-workSpace-detail-content-asnLineItemTable"
                header={intl
                  .get(`slod.deliveryWorkbench.view.title.lineItemList`)
                  .d('明细信息-物料汇总')}
              >
                <AsnLineItemTable {...lineItemProps} />
              </Panel>
              <Panel
                forceRender
                hidden={nodeTemplateCode !== 'ASN'}
                key="receipAttachment"
                id="delivery-workSpace-detail-content-receipAttachment"
                header={intl
                  .get(`slod.deliveryWorkbench.view.title.receipAttachment`)
                  .d('附件信息')}
              >
                <AttachmentList {...basicProps} />
              </Panel>
            </Collapse>
          )}
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  useDoubleUomConfig(),
  WithCustomize({ isTemplate: true }),
  formatterCollections({
    code: [
      'sinv.common',
      'hzero.common',
      'slod.deliveryWorkbench',
      'slod.common',
      'sinv.deliveryCreation',
      'sinv.receiptExecution',
      'sinv.receiptWorkbench',
    ],
  }),
  connect(({ deliveryWorkbench = {}, user = {} }) => ({
    deliveryWorkbench,
    user,
  })),
  cuxRemote(
    {
      code: 'SLOD_SUPPLIER_AFFIRMDETAILS_DETAIL_REMOTE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
      name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
    },
    {
      process: {
        handleInfoDataUpdate: undefined,
      },
      events: {
        cuxIsConfirmFn: (e) => e,
      },
    }
  )
)(DetailIndex);
