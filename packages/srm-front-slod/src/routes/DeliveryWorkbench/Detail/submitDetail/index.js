/*
 * @Description: 发货工作台
 * @Date: 2021-12-09 10:38:14
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import React, {
  Fragment,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useLayoutEffect,
  useRef,
} from 'react';
import { DataSet, Spin, Modal, Tooltip } from 'choerodon-ui/pro';
import { Collapse, Alert } from 'choerodon-ui';
import { connect } from 'dva';
import CommonImport from 'hzero-front/lib/components/Import';
import formatterCollections from 'utils/intl/formatterCollections';
import qs from 'querystring';
// import classnames from 'classnames';
import cuxRemote from 'hzero-front/lib/utils/remote';
import { useDoubleUomConfig } from '@/routes/components/utils';
import DynamicButtons from 'srm-front-boot/lib/components/DynamicButtons';
import { Header, Content } from 'components/Page';
import { compose, isEmpty, isNil, isFunction } from 'lodash';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import notification from 'utils/notification';
import request from 'hzero-front/lib/utils/request';
import { SRM_SLOD } from '_utils/config';
import OperationRecord from '_components/OperationRecord';
import SrmOperationRecord from '_components/SrmOperationRecord';
import Affix from '@/components/AffixDetail';
import { numText } from '@/utils/utils';
import { detailCustomizeUnitCodes } from '../../globalFunction';
import {
  handleDelete,
  handleSave,
  handleSubmit,
  handleLineDel,
  handLineBuilder,
} from '@/services/DeliveryWorkbenchServices';
import {
  HeaderInfo,
  AsnHeaderShipmentsInfo,
  AsnHeaderReceivingInfo,
  AttachmentList,
} from './datailHeaderInfo';
import { headerInfoDataSet, attachmentDataSet } from './store/headerInfoDS';
import { lineListDataSet } from './store/lineListDS';
import asnLineItemDs from '../../commonDs/asnLineItemDs';
import AsnLineItemTable from '../../commonDs/asnLineItemTable';
import LineList from './detailLineList';
import { lineSelectedCancelSelected } from '../../components/utils';
import UniqueLineList from '../../components/uniqueModule/uniqueLineList';
// import styles from '../index.less';
import '@/routes/index.less';
import { fetchConfigSheet } from '@/services/commonService';

const STAGE_CODE = 'SUBMIT';
const tenantId = getCurrentOrganizationId();

const { Panel } = Collapse;

const DetailIndex = (props) => {
  const {
    location: { search },
    history,
    customizeBtnGroup,
    doubleUnitEnabled,
    customizeCollapse,
    remote,
  } = props;
  // isRoleWorkbench 是否走角色工作台 不为空走角色工作台
  const { from, nodeTemplateCode, nodeConfigId, headerId, isRoleWorkbench } = qs.parse(
    search.substr(1)
  );

  const { handleInfoDataUpdate, beforeSubmitFn } = remote.props?.process || {};

  // labelLineRef: 唯一标签的回调
  // tableLineRef: 清除行查询条件的回调函数
  const tableLineRef = useRef();
  const labelLineRef = useRef({});
  const [waitCustomize, setWaitCustomize] = useState(true);
  const [lineType, useQueryList] = useState('left');
  const [btnLineFlag, useTypeFlag] = useState(true);
  const [statusCode, useStatus] = useState();
  const [businessKey, useBusinessKey] = useState();
  const tplInfo = useMemo(() => ({ current: null }), []);
  const [cuzeDom, setOpen] = useState(false);
  const [nodeConfigName, setNodeConfigName] = useState('...');
  const [alertFlag, setAlertFlag] = useState(false); // 提示是否显示
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
        remote
          ? remote.process(
              'SLOD_DELIVERYWORKBENCH_DETAILS_SUBMITDETAILS_REMOTE_PROCESS_FORM_DS',
              headerInfoDataSet({
                ..._object,
                setAlertFlag,
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
              }),
              {
                headerId,
                nodeTemplateCode,
              }
            )
          : headerInfoDataSet({
              ..._object,
              setAlertFlag,
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
              'SLOD_DELIVERYWORKBENCH_DETAILS_SUBMITDETAILS_REMOTE_PROCESS_LINE_DS',
              lineListDataSet({
                ..._object,
                unitCode: detailCustomizeUnitCodes(nodeTemplateCode, ['line']),
              }),
              {
                nodeTemplateCode,
              }
            )
          : lineListDataSet({
              ..._object,
              unitCode: detailCustomizeUnitCodes(nodeTemplateCode, ['line']),
            })
      ),
    [headerId]
  );
  lineDs.setState({ doubleUnitEnabled });
  const lineItemDs = useMemo(
    () =>
      new DataSet(
        asnLineItemDs({
          ..._object,
          unitCode: detailCustomizeUnitCodes(nodeTemplateCode, ['line-item']),
        })
      ),
    [headerId]
  );

  const [menuLoading, useMenuLoading] = useState(false); // 菜单加载loading

  const otherCustCode = detailCustomizeUnitCodes(nodeTemplateCode, [
    'header',
    'line',
    'btn-sub',
    'unique',
  ]);
  const asnCustCode = detailCustomizeUnitCodes(nodeTemplateCode, [
    'header',
    'shipment',
    'receiving',
    'line',
    'line-item',
    'batch',
    'attachment',
    'btn-sub',
  ]);
  const receiptsCod = ['UNIQUE_LABEL'].includes(nodeTemplateCode) ? 'LABEL' : nodeTemplateCode;

  useEffect(() => {
    fetchConfig();
    if (!waitCustomize && !isEmpty(tplInfo.current)) handleQuery();
    formDs.setState('lineDs', lineDs);
  }, [headerId, waitCustomize, tplInfo.current, handleInfoDataUpdate]);

  useEffect(() => {
    if (!props.custLoading) {
      const list = Object.keys(props.custConfig);
      const useCustFlag = list.includes('SLOD.DELIVERY__WORKBENCH_ASN_A.COLLAPSE_SUBMIT');
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
              setWaitCustomize(false);
              setTimeout(() => loadingFlag(false), 500);
              // setOpen(true);
            });
        } else {
          const unitCodes = (nodeTemplateCode === 'ASN' ? asnCustCode : otherCustCode)?.split(',');
          props.queryUnitConfig(undefined, null, unitCodes).then(() => {
            setWaitCustomize(false);
            setTimeout(() => loadingFlag(false), 500);
          });
        }
        return res;
      }
      return {};
    });
  }, [headerId]);

  // 查询配置表逻辑
  const fetchConfig = async () => {
    const res = await fetchConfigSheet({
      configCode: 'sinv_asn_logistics_information_phone_no_need',
    });
    if (getResponse(res)) {
      if (!isEmpty(res)) {
        formDs.setState('configSheetFlag', true);
      }
    }
  };

  const handleQuery = useCallback(() => {
    try {
      loadingFlag(true);
      lineDs.setState({ fieldMapValues: undefined });
      lineDs.setState({ batchData: {} });
      formDs.setQueryParameter('params', {
        headerId,
        campKey: 'p',
        nodeConfigId,
        nodeTemplateCode,
        // customizeUnitCode: unitCode,
      });
      lineDs.setQueryParameter('params', {
        headerId,
        campKey: 'p',
        nodeConfigId,
        nodeTemplateCode,
        // customizeUnitCode: unitCode,
        editableFlag: lineType === 'left' && isNil(isRoleWorkbench) ? 1 : null,
      });
      lineItemDs.setQueryParameter('params', {
        headerId,
        nodeConfigId,
        nodeTemplateCode,
        customizeUnitCode: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_ITEM_LIST`,
      });
      formDs.setQueryParameter('tplInfo', tplInfo.current);
      lineDs.setQueryParameter('tplInfo', tplInfo.current);
      lineItemDs.setQueryParameter('tplInfo', tplInfo.current);
      if (nodeTemplateCode === 'ASN') {
        formDs.query().then((res) => {
          if (res) {
            useStatus(res.statusCode);
            if (res.expressNum || res.logisticsCompanyCode) {
              setAlertFlag(true);
            } else {
              setAlertFlag(false);
            }
            setNodeConfigName(res.nodeConfigName);
            useBusinessKey(res.businessKey);
            attachmentDs.loadData([res]);
          }
        });
        lineDs.query().then((res) => {
          if (getResponse(res)) {
            if (res.content.length === 0) {
              useQueryList('right');
              useTypeFlag(false);
              lineDs.setQueryParameter('params', {
                headerId,
                campKey: 'p',
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
            useBusinessKey(res.businessKey);
          }
        });
        lineDs.query().then((res) => {
          if (getResponse(res)) {
            if (res.content.length === 0) {
              useQueryList('right');
              useTypeFlag(false);
              lineDs.setQueryParameter('params', {
                headerId,
                campKey: 'p',
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
      lineDs.clearCachedSelected();
      lineDs.unSelectAll();
      setTimeout(() => loadingFlag(false), 500);
    }
  }, []);

  // 页面loading
  const loadingFlag = (type) => {
    useMenuLoading(type); // loading
  };

  // 保存提交参数数据提取公共数据
  const onHandleWrapperAcquisitionData = () => {
    let objectData = {};
    const basicInfoProps = {
      campKey: 'p',
      nodeConfigId,
      nodeTemplateCode,
      operationType: 'detail',
      tplInfo: tplInfo.current || {},
      unitCode: nodeTemplateCode === 'ASN' ? asnCustCode : otherCustCode,
    };
    const batchData = lineDs.getState('batchData') || {};
    const basicData = {
      ...formDs?.current?.toData(),
      deliveryLineDTOList: lineDs?.toJSONData()?.map((m) => ({
        ...m,
        inventoryId: m._inventoryId || m.inventoryId,
        locationId: m._locationId || m.locationId,
      })),
    };
    switch (nodeTemplateCode) {
      case 'PLAN':
        objectData = {
          ...basicInfoProps,
          data: { ...basicData, ...formDs?.current?.toJSONData() },
        };
        break;
      case 'LABEL':
        objectData = {
          ...basicInfoProps,
          data: { ...basicData, ...formDs?.current?.toJSONData() },
        };
        break;
      case 'ASN':
        objectData = {
          ...basicInfoProps,
          data: {
            ...basicData,
            ...attachmentDs?.current?.toJSONData(),
            asnItemLineList: lineItemDs?.toJSONData(),
          },
        };
        break;
      case 'UNIQUE_LABEL':
        objectData = {
          ...basicInfoProps,
          data: {
            ...basicData,
            ...formDs?.current?.toJSONData(),
            labelLineExtList: labelLineRef.current.lableLineDs.toJSONData(),
          },
        };
        break;
      default:
        objectData = { ...basicInfoProps, ...formDs?.current?.toJSONData() };
    }
    return isEmpty(batchData)
      ? objectData
      : {
          ...objectData,
          data: Object.assign(objectData.data, {
            batchEditLineDTO: { ...batchData },
            customizeUnitCode:
              nodeTemplateCode !== 'ASN'
                ? `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_HEADER`
                : `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_HEADER,SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_SHIPMENTS,SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_DELIVERY`,
          }),
        };
  };

  // 删除
  const handleDeleteList = async () => {
    const headerInfo = formDs?.toData();
    const params = { headerInfo, nodeTemplateCode, nodeConfigId, campKey: 'p' };
    if (!formDs?.current?.get('_token')) {
      return;
    }
    const code = numText(receiptsCod);
    const text = formDs?.current?.get(code);
    Modal.confirm({
      contentStyle: { width: '550px' },
      title: intl.get('slod.deliveryWorkbench.view.message.help').d('提示'),
      children: (
        <div>
          <span>
            {intl.get('slod.deliveryWorkbench.view.message.deliveryDelete').d(`确认删除`)}
          </span>
          <span>{`${nodeConfigName}${text}`}</span>
          <span> ？</span>
        </div>
      ),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: async () => {
        try {
          loadingFlag(true);
          const res = await handleDelete(params);
          if (getResponse(res)) {
            notification.success();
            history.push({
              pathname: `/slod/delivery-workbench/list`,
            });
          }
        } catch (e) {
          throw e;
        } finally {
          loadingFlag(false);
        }
      },
    });
  };

  // 保存
  // labelLineRef: 唯一标签的回调
  // tableLineRef: 清除行查询条件的回调函数
  const handleSaveList = async () => {
    const asnFlag = await Promise.all([
      formDs.validate(),
      lineDs.validate(),
      lineItemDs.validate(),
      attachmentDs.validate(),
    ]);
    const onFlag = await Promise.all([
      formDs.validate(),
      lineDs.validate(),
      nodeTemplateCode === 'UNIQUE_LABEL' ? labelLineRef?.current?.lableLineDs?.validate() : true,
    ]);
    const params = onHandleWrapperAcquisitionData();
    const flag = (['ASN'].includes(nodeTemplateCode) ? asnFlag : onFlag).every(
      (item) => item === true
    );
    if (flag && formDs?.current?.get('_token')) {
      try {
        loadingFlag(true);
        const res = await handleSave(params);
        if (getResponse(res)) {
          notification.success();
          loadingFlag(false);
          if (nodeTemplateCode === 'UNIQUE_LABEL' && labelLineRef?.current) {
            // eslint-disable-next-line no-unused-expressions
            labelLineRef?.current?.lableLineDs?.query();
          }
          if (tableLineRef?.current) {
            // eslint-disable-next-line no-unused-expressions
            tableLineRef?.current?.onResetLineChange();
          }
          handleQuery();
        }
      } catch (e) {
        throw e;
      } finally {
        loadingFlag(false);
      }
    } else {
      loadingFlag(false);
    }
  };

  // 提交
  const handleSubmitList = async () => {
    const asnFlag = await Promise.all([
      formDs.validate(),
      lineDs.validate(),
      lineItemDs.validate(),
      attachmentDs.validate(),
    ]);
    const params = onHandleWrapperAcquisitionData();
    const onFlag = await Promise.all([
      formDs.validate(),
      lineDs.validate(),
      nodeTemplateCode === 'UNIQUE_LABEL' ? labelLineRef?.current?.lableLineDs?.validate() : true,
    ]);
    const flag = (['ASN'].includes(nodeTemplateCode) ? asnFlag : onFlag).every(
      (item) => item === true
    );
    const validateFlag = await (remote
      ? remote.process(
          'SLOD_DELIVERYWORKBENCH_DETAILS_SUBMITDETAILS_REMOTE_PROCESS_SUBMIT_VALIDATE',
          true,
          {
            flag,
            formDs,
            lineDs,
            lineItemDs,
            attachmentDs,
            lableLineDs: labelLineRef?.current?.lableLineDs,
            nodeTemplateCode,
          }
        )
      : true);
    if (!validateFlag) return;
    if (flag && formDs?.current?.get('_token')) {
      // 添加弱校验埋点
      if (isFunction(beforeSubmitFn)) {
        const result = await beforeSubmitFn({ formDs, lineDs, lineItemDs, attachmentDs, params });
        if (!result) return false;
      }
      loadingFlag(true);
      try {
        const res = await handleSubmit(params);
        if (getResponse(res)) {
          notification.success();
          history.push({
            pathname: `/slod/delivery-workbench/list`,
          });
        }
      } catch (e) {
        throw e;
      } finally {
        loadingFlag(false);
      }
    } else {
      loadingFlag(false);
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
      campKey: 'p',
    };
    const deleteFn = async (message) => {
      try {
        dataSet.setState({ params });
        const { selected } = dataSet;
        const res = await dataSet.delete(selected, message);
        if (getResponse(res)) {
          dataSet.setState({ batchData: {} });
          dataSet.setState({ fieldMapValues: undefined });
          dataSet.clearCachedSelected();
          dataSet.unSelectAll();
          formDs.query(undefined, undefined, true).then((result) => {
            if (getResponse(result) && nodeTemplateCode === 'ASN') {
              attachmentDs.loadData([result], undefined, true);
            }
          });
          dataSet.query(undefined, undefined, true);
          if (nodeTemplateCode === 'ASN') lineItemDs.query(undefined, undefined, true);
          if (nodeTemplateCode === 'UNIQUE_LABEL' && labelLineRef.current) {
            labelLineRef.current.lableLineDs.query(undefined, undefined, true);
          }
        }
      } catch (e) {
        throw e;
      }
    };
    if (deleteFlag) {
      const result = await handleLineDel(params, true);
      if (!isEmpty(result)) {
        const _textNum = (result || []).map((item) => `【${item}】`);
        const displayNum = _textNum.join(',') || '';
        const message = {
          title: intl.get('slod.deliveryWorkbench.view.message.sureDelete').d('确定要删除数据?'),
          children: intl
            .get(`slod.deliveryWorkbench.view.message.deleteAffirmModal`, {
              num: `${displayNum}${intl
                .get('slod.deliveryWorkbench.view.message.nodeCreates')
                .d('需按整单创建')}【${nodeConfigName}】`,
            })
            .d(`单据{num}，如需删除，则系统会将该单据对应所有行进行删除操作`),
        };
        deleteFn(message);
      } else {
        const message = {
          title: intl.get('slod.deliveryWorkbench.view.message.help').d('提示'),
          children: intl.get('slod.deliveryWorkbench.view.message.orderDel').d(`确认删除选中行？`),
        };
        deleteFn(message);
      }
    } else {
      dataSet.remove(select);
      lineSelectedCancelSelected(dataSet, nodeTemplateCode, lineList);
    }
  };

  //   try {
  //     dataSet.setState({ params });
  //       const { selected } = dataSet;
  //      const res = await dataSet.delete(selected, {
  //         title: intl.get('slod.deliveryWorkbench.view.message.help').d('提示'),
  //         children: intl.get('slod.deliveryWorkbench.view.message.orderDel').d(`确认删除选中行？`),
  //      });
  //     if (getResponse(res)) {
  //       lineDs.setState({ batchData: {} });
  //       lineDs.setState({ fieldMapValues: undefined });
  //       lineDs.clearCachedSelected();
  //       lineDs.unSelectAll();
  //       formDs.query().then((result) => {
  //         if (getResponse(result) && nodeTemplateCode === 'ASN') {
  //           attachmentDs.loadData([result]);
  //         };
  //       });
  //       lineDs.query();
  //       if (nodeTemplateCode === 'ASN') lineItemDs.query();
  //       if (nodeTemplateCode === 'UNIQUE_LABEL' && labelLineRef.current) labelLineRef.current.lableLineDs.query();
  //     };
  //   }catch (e) {
  //     throw e;
  //   }
  // };

  const loadingDs = (_ds, flag) => {
    // eslint-disable-next-line no-param-reassign
    _ds.status = !!flag === true ? 'submitting' : 'ready';
  };

  // 勾选唯一标签
  const lineBuilder = async (select, dataSet) => {
    const headerInfo = formDs?.current?.toData();
    const lineList = select.map((item) => item.toJSONData());
    const addFlag = lineList.every((i) => i.planLineId !== null);
    Promise.all(select.map((i) => i.validate(true))).then(async (status) => {
      loadingDs(dataSet, false);
      if (status.findIndex((sta) => !sta) === -1) {
        loadingDs(dataSet, true);
        const params = {
          ...headerInfo,
          nodeTemplateCode,
          nodeConfigId,
          campKey: 'p',
          labelLineVOList: lineList.map((ele) => {
            return {
              ...ele,
              inventoryId: ele._inventoryId || ele.inventoryId,
              locationId: ele._locationId || ele.locationId,
            };
          }),
        };
        if (addFlag) {
          const res = await handLineBuilder(params, tplInfo?.current);
          if (getResponse(res)) {
            lineDs.setState({ fieldMapValues: undefined });
            lineDs.setState({ batchData: {} });
            lineDs.clearCachedSelected();
            lineDs.unSelectAll();
            formDs.query();
            dataSet.query();
            if (nodeTemplateCode && nodeTemplateCode === 'UNIQUE_LABEL' && labelLineRef.current) {
              labelLineRef.current.lableLineDs.query();
            }
          }
          loadingDs(dataSet, false);
        } else {
          loadingDs(dataSet, false);
          notification.warning({
            message: intl
              .get('slod.deliveryWorkbench.view.title.lineBuilder')
              .d('勾选行中包含新拆分行'),
          });
        }
      }
    });
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
    lineDs.setState({ MarkerType: type });
    lineDs.setQueryParameter('params', {
      headerId,
      campKey: 'p',
      nodeConfigId,
      nodeTemplateCode,
      editableFlag: type === 'left' ? 1 : null,
    });
    lineDs.query().then((res) => {
      if (getResponse(res)) {
        if (res.content.length === 0) {
          useQueryList('right');
          useTypeFlag(false);
          lineDs.setQueryParameter('params', {
            headerId,
            campKey: 'p',
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
          businessKey={businessKey}
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
          lookupCode="SLOD.DELIVERY_RECORD_TYPE_DOCFLOW"
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
    const btns = [
      {
        name: 'submit',
        child: (name) => name || intl.get('hzero.common.button.submit').d('提交'),
        btnProps: {
          color: 'primary',
          icon: 'check',
          type: 'c7n-pro',
          // funcType: 'flat',
          loading: menuLoading,
          disabled: lineType === 'right' || !formDs?.current?.get('_token'),
          onClick: () => handleSubmitList(),
        },
      },
      {
        name: 'save',
        child: (name) => name || intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          icon: 'save',
          type: 'c7n-pro',
          funcType: 'flat',
          loading: menuLoading,
          disabled: lineType === 'right' || !formDs?.current?.get('_token'),
          onClick: () => handleSaveList(),
        },
      },
      {
        name: 'delete',
        child: (name) => name || intl.get(`hzero.common.button.delete`).d('删除'),
        btnProps: {
          icon: 'delete',
          loading: menuLoading,
          type: 'c7n-pro',
          funcType: 'flat',
          disabled: !formDs?.current?.get('_token'),
          onClick: () => handleDeleteList(),
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
      ['ASN'].includes(nodeTemplateCode) && {
        name: 'linkImport',
        child: (name) =>
          name ||
          intl.get(`slod.deliveryWorkbench.model.common.linkImport`).d('行链接字段1数据导入'),
        btnComp: CommonImport,
        childFor: 'buttonText',
        btnProps: {
          buttonProps: {
            icon: 'archive',
            type: 'c7n-pro',
            funcType: 'flat',
          },
          refreshButton: true,
          prefixPatch: SRM_SLOD,
          args: {
            tenantId,
            campKey: 'p',
            nodeConfigId,
            asnHeaderId: headerId,
            templateCode: 'SLOD.ASN.LINE_EXT_BATCH_IMPORT',
            customizeUnitCode: 'SLOD.DELIVERY__WORKBENCH_ASN_A.BTN_LINE_DETAIL',
          },
          customeImportTemplate: {
            method: 'GET',
            templateCode: 'SLOD_ASN_LINE_EXT_IMPORT_TEMP',
            requestUrl: `${SRM_SLOD}/v1/${getCurrentOrganizationId()}/delivery/asn/${nodeConfigId}/detail/line/${headerId}/export-submit?campKey=p`,
          },
          buttonText: (
            <Tooltip
              placement="bottom"
              title={intl
                .get('hzero.common.viewTitle.linkImportNewTip')
                .d('若存在多次导入，每一次导入皆按单据行全量覆盖更新')}
            >
              {name ||
                intl.get(`slod.deliveryWorkbench.model.common.linkImport`).d('行链接字段1数据导入')}
            </Tooltip>
          ),
          businessObjectTemplateCode: 'SLOD.ASN.LINE_EXT_BATCH_IMPORT',
          // successCallBack: () => dataSet.query(),
        },
      },
    ];
    return remote
      ? remote.process('SLOD.DETAIL_SUBMIT_HEADER_BUTTONS', btns, {
          formDs,
          lineDs,
          attachmentDs,
          nodeConfigId,
          nodeTemplateCode,
          camp: 'PURCHASER',
        })
      : btns;
  };

  const buttons = headerBtns();
  const basicProps = {
    formDs,
    lineDs,
    remote,
    lineType,
    headerId,
    statusCode,
    btnLineFlag,
    lineItemDs,
    nodeConfigId,
    attachmentDs,
    nodeTemplateCode,
    tplInfo: tplInfo.current || {},
    unitCode: nodeTemplateCode === 'ASN' ? asnCustCode : otherCustCode,
    customizeForm: props.customizeForm,
    customizeTable: props.customizeTable,
    customizeBtnGroup: props.customizeBtnGroup,
    handleSaveList,
    loadingFlag,
    queryList: (type) => queryList(type),
    lineDelete: (a, b) => lineDelete(a, b),
    lineBuilder: (a, b) => lineBuilder(a, b),
    doubleUnitEnabled,
  };

  const lineItemProps = {
    customizeTable: props.customizeTable,
    lineItemDs,
    nodeTemplateCode,
  };

  const uniqueProps = {
    campKey: 'p',
    headerId,
    lineDs,
    modalType: true,
    tplInfo: tplInfo.current || {},
    customizeTable: props.customizeTable,
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
        backPath="/slod/delivery-workbench/list"
        onBack={() => onBack()}
      >
        {customizeBtnGroup(
          { code: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.BTN_DETAIL_A`, pro: true },
          <DynamicButtons buttons={buttons} maxNum={5} defaultBtnType="c7n-pro" />
        )}
      </Header>
      <Content
        className="customize-wrap"
        wrapperClassName="content-wrap"
        id="delivery-workspace-detail-containe"
      >
        <Spin spinning={waitCustomize || menuLoading} wrapperClassName={DETAIL_DEFAULT_CLASSNAME}>
          {customizeCollapse(
            {
              code: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.COLLAPSE_SUBMIT`,
            },
            <Collapse
              trigger="text-icon"
              ghost
              expandIconPosition="text-right"
              defaultActiveKey={linkKeys}
            >
              <Panel
                forceRender
                hidden={!nodeTemplateCode}
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
                {alertFlag ? (
                  <Alert
                    banner
                    type="info"
                    style={{
                      marginBottom: '16px',
                    }}
                    message={intl
                      .get(`slod.common.view.message.addLogistics.titleTooltip`)
                      .d(
                        '提示：为配合第三方物流公司升级查询服务，让您更精准地获取物流信息，建议您维护收货信息区域中的“联系人电话” 信息，感谢您的理解'
                      )}
                  />
                ) : null}
                <AsnHeaderReceivingInfo {...basicProps} />
              </Panel>
              <Panel
                forceRender
                hidden={!nodeTemplateCode}
                key="list"
                id="delivery-workSpace-detail-content-list"
                header={intl.get(`slod.deliveryWorkbench.view.title.lineList`).d('明细信息')}
              >
                <LineList ref={tableLineRef} {...basicProps} />
              </Panel>
              <Panel
                forceRender
                hidden={nodeTemplateCode !== 'UNIQUE_LABEL'}
                key="uniqueLineList"
                id="delivery-workSpace-detail-content-uniqueLineList"
                header={intl.get(`slod.deliveryWorkbench.view.title.uniqueLine`).d('唯一标签行')}
              >
                <UniqueLineList ref={labelLineRef} {...uniqueProps} />
              </Panel>
              <Panel
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
      'sinv.receiptWorkbench',
      'sinv.receiptExecution',
    ],
  }),
  cuxRemote(
    {
      code: 'SLOD_DELIVERYWORKBENCH_DETAILS_SUBMITDETAILS_REMOTE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
      name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
    },
    {
      process: {
        handleInfoDataUpdate: undefined,
        beforeSubmitFn: undefined,
      },
    }
  ),
  connect(({ deliveryWorkbench = {}, user = {} }) => ({
    deliveryWorkbench,
    user,
  }))
)(DetailIndex);
