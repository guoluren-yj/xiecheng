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
  useLayoutEffect,
  useCallback,
  useRef,
} from 'react';
import { DataSet, Spin, Modal, Button, Dropdown, Menu } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { Collapse, Icon, Alert } from 'choerodon-ui';
import { Tooltip } from 'hzero-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import qs from 'querystring';
import { connect } from 'dva';

import intl from 'utils/intl';
import cuxRemote from 'hzero-front/lib/utils/remote';
import { checkPrintWindow, getPdfPreviewUrl } from 'srm-front-boot/lib/utils/utils';
import { Header, Content } from 'components/Page';
import { compose, isEmpty, isNil, isString, isFunction } from 'lodash';
import DynamicButtons from 'srm-front-boot/lib/components/DynamicButtons';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
// import { Button as PermissionButton } from 'hzero-front/lib/components/Permission';
import { openApproveModal } from '_components/ApproveModal';

import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import notification from 'utils/notification';
import request from 'hzero-front/lib/utils/request';
import { SRM_SLOD } from '_utils/config';
import OperationRecord from '_components/OperationRecord';
import SrmOperationRecord from '_components/SrmOperationRecord';
import PrintProButton from 'srm-front-boot/lib/components/PrintProButton';
import { useDoubleUomConfig } from '@/routes/components/utils';
import { exportRender, detailCustomizeUnitCodes } from '../../globalFunction';

import Affix from '@/components/AffixDetail';
import {
  handleOff,
  handleCancel,
  handleRecall,
  handleAllSave,
  fetchLogistics,
  handleDetailPrint,
  handleRefreshLogistics,
  // handleRecordLogistics,
  queryChangeFields,
  handleAllChange,
  handWorkFlowSave,
  queryHistoryTag,
  queryChangeConfiguration,
  handleRevokeApprovalChange,
} from '@/services/DeliveryWorkbenchServices';
import {
  HeaderInfo,
  AsnHeaderShipmentsInfo,
  AsnHeaderReceivingInfo,
  AttachmentList,
} from './datailHeaderInfo';
import { headerInfoDataSet, attachmentDataSet, logisticsDataSet } from './store/headerInfoDS';
import { lineListDataSet } from './store/lineListDS';
import LineList from './detailLineList';
import asnLineItemDs from '../../commonDs/asnLineItemDs';
import AsnLineItemTable from '../../commonDs/asnLineItemTable';
import LogisticsRecord from '@/components/LogisticInfo';
import { c7nModal } from '@/components/utils';
import ChatCmp from '../../../../components/Chat'; // 聊天组件
import '@/routes/index.less';
import { fetchConfigSheet } from '@/services/commonService';
import '../index.less';

const STAGE_CODE = 'SUBMIT';

const { Panel } = Collapse;
const DetailIndex = (props) => {
  const {
    onLoad,
    onFormLoaded,
    location: { search },
    match: { path = {} },
    history,
    remote,
    customizeBtnGroup,
    doubleUnitEnabled,
    customizeCollapse,
    workflowTemplateProps = {},
  } = props;
  // docFlow ===1 进入单据流页面
  const {
    from = '',
    nodeTemplateCode = null,
    nodeConfigId = null,
    headerId = null,
    change,
    docFlow = 0,
  } = qs.parse(search.substr(1));
  const { handleInfoDataUpdate, beforeSubmitFn } = remote.props?.process || {};
  // tableLineRef: 清除行查询条件的回调函数
  const tableLineRef = useRef();
  const sourceFromPub = useMemo(() => path.includes('pub'), [path]);
  const [logisticsData, setLogisticsData] = useState({});
  const [logLoading, setLogLoading] = useState(false);
  const [display, setDisplay] = useState(false);
  const [waitCustomize, setWaitCustomize] = useState(true);
  const [edit, useEdit] = useState(!isNil(change));
  const [changes, usehandleChange] = useState(change);
  const [businessKey, useBusinessKey] = useState();
  const [pageSetup, usePageSetup] = useState(false);
  const tplInfo = useMemo(() => ({ current: null }), []);
  const [nodeConfigName, setNodeConfigName] = useState('...');
  const [cuzeDom, setOpen] = useState(false);
  const [historyList, setHistory] = useState([]);
  const [histHidden, setHistHidden] = useState(true);
  const [histNewVersions, setVersions] = useState({});
  const [changeMarkFlag, setChangeMark] = useState(false);
  const [alertFlag, setAlertFlag] = useState(false); // 提示是否显示

  const lineId = {
    LABEL: 'labelLineId',
    PLAN: 'planLineId',
    ASN: 'asnLineId',
    UNIQUE_LABEL: 'labelLineId',
  };
  const _object = {
    change: !isNil(changes),
    nodeTemplateType: nodeTemplateCode,
    id: lineId[nodeTemplateCode],
    unitLineCode: detailCustomizeUnitCodes(nodeTemplateCode, ['line']),
    doubleUnitEnabled,
  };
  const logisticsDs = useMemo(() => new DataSet(logisticsDataSet()), []);
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
          setAlertFlag,
          handleInfoDataUpdate,
        })
      ),
    [headerId, handleInfoDataUpdate]
  );
  const attachmentDs = useMemo(
    () =>
      new DataSet(
        attachmentDataSet({
          nodeTemplateType: nodeTemplateCode,
          unitCode: detailCustomizeUnitCodes(nodeTemplateCode, ['attachment']),
        })
      ),
    [headerId]
  );
  const lineDs = useMemo(
    () =>
      new DataSet(
        remote
          ? remote?.process(
              'SLOD_DELIVERYWORKBENCH_DETAILS_ALLDETAILS_REMOTE_PROCESS_LINE_DS',
              lineListDataSet({
                ..._object,
                unitCode: detailCustomizeUnitCodes(nodeTemplateCode, ['line']),
              })
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
    'btn-all-edi',
    'btn-all-redy',
  ]);
  const asnCustCode = detailCustomizeUnitCodes(nodeTemplateCode, [
    'header',
    'shipment',
    'receiving',
    'line',
    'line-item',
    'attachment',
    'btn-all-edi',
    'btn-all-redy',
  ]);

  useEffect(() => {
    fetchConfig();
    if (!waitCustomize && !isEmpty(tplInfo.current)) handleQuery();
  }, [headerId, waitCustomize, tplInfo.current, handleInfoDataUpdate]);

  useEffect(() => {
    // 使用 onLoad 函.数注册 submit 回调函数
    if (sourceFromPub) {
      onLoad({
        submit: workFlowApproval,
      });
    }
  }, [onLoad, sourceFromPub, workFlowApproval]);

  useEffect(() => {
    if (!props.custLoading) {
      const list = Object.keys(props.custConfig);
      const useCustFlag = list.includes('SLOD.DELIVERY__WORKBENCH_ASN_A.COLLAPSE_ALL');
      setOpen(useCustFlag);
    }
  }, [props.custLoading, tplInfo.current]);

  useEffect(() => {
    if (!isNil(changes)) {
      formDs.setState('change', !isNil(changes));
      lineDs.setState('change', !isNil(changes));
      handleChangeFields();
      queryChangeConfiguration().then((res) => {
        setChangeMark(res);
      });
    }
  }, [changes]);

  const handleChangeFields = () => {
    // formDs.setState('change', true); // 开启头编辑
    queryChangeFields({ nodeTemplateCode, deliveryHeaderId: headerId, campKey: 'p' }).then(
      (res) => {
        if (getResponse(res)) {
          if (Array.isArray(res.header) && res.header.length) {
            res.header.forEach((i) => {
              formDs.setState(i, true); // 开启行编辑
            });
          }
          if (Array.isArray(res.line) && res.line.length) {
            res.line.forEach((i) => {
              lineDs.setState(i, true); // 开启行编辑
            });
          }
        }
      }
    );
  };

  const handleGetLogisticInfo = () => {
    if (nodeTemplateCode === 'ASN') {
      fetchLogistics({ headerId }).then((res) => {
        if (getResponse(res)) {
          setLogisticsData(res);
        }
      });
    }
  };

  useEffect(() => {
    handleGetLogisticInfo();
    // 查询历史版本信息
    if (['ASN', 'PLAN'].includes(nodeTemplateCode)) {
      queryHistoryTag({ nodeTemplateCode, headerId, campKey: 'p' }).then((res) => {
        if (getResponse(res)) {
          setHistory(res);
          if (isEmpty(res)) return;
          setVersions(res[0]);
        }
      });
    }
  }, []);

  useLayoutEffect(() => {
    loadingFlag(true);
    setWaitCustomize(true);
    const templateInfoPromise = request(`${SRM_SLOD}/v1/customize/template-cusz`, {
      method: 'POST',
      body: {
        templateCuszMethodCode: `SLOD_SHIP_WORKSPACE_${workflowTemplateProps?.nodeTemplateCode ||
          nodeTemplateCode}_DETAIL`,
        businessParam: {
          nodeConfigId,
          node: workflowTemplateProps?.nodeTemplateCode || nodeTemplateCode,
          deliveryHeaderId: headerId,
        },
      },
    }).then((res) => {
      if (getResponse(res)) {
        tplInfo.current = {
          ...res,
          cuszTplStageCode: STAGE_CODE,
          cuszTplPageCode: 'DELIVERY_WORKBENCH.DETAIL',
          templateCode: workflowTemplateProps?.templateCode || res.templateCode,
          templateVersion: workflowTemplateProps?.templateVersion || res.templateVersion,
        };
        if (res.useTemplateCusz) {
          const workflowParams = {
            stageCode: workflowTemplateProps?.stageCode,
            pageCode: workflowTemplateProps?.pageCode,
            templateCode: workflowTemplateProps?.templateCode,
            templateVersion: workflowTemplateProps?.templateVersion,
          };
          const deliveryparams = {
            stageCode: 'SUBMIT',
            pageCode: 'DELIVERY_WORKBENCH.DETAIL',
          };
          props
            .queryTemplateConfig(
              templateInfoPromise,
              workflowTemplateProps?.stageCode ? workflowParams : deliveryparams
            )
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

  const handleQuery = (params = {}) => {
    try {
      loadingFlag(true);
      formDs.setQueryParameter('params', {
        headerId: params?.historyId || headerId,
        campKey: 'p',
        nodeConfigId,
        nodeTemplateCode,
        allDetailFlag: 1,
        changeDataVersion: params?.changeDataVersion,
      });
      lineDs.setQueryParameter('params', {
        headerId: params?.historyId || headerId,
        campKey: 'p',
        nodeConfigId,
        nodeTemplateCode,
        changeDataVersion: params?.changeDataVersion,
      });
      lineItemDs.setQueryParameter('params', {
        headerId: params?.historyId || headerId,
        nodeConfigId,
        nodeTemplateCode,
        changeDataVersion: params?.changeDataVersion,
        customizeUnitCode: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_ITEM_LIST`,
      });
      formDs.setQueryParameter('tplInfo', tplInfo.current);
      lineDs.setQueryParameter('tplInfo', tplInfo.current);
      lineItemDs.setQueryParameter('tplInfo', tplInfo.current);
      if (nodeTemplateCode === 'ASN') {
        formDs.query().then((res) => {
          if (res) {
            if (res.expressNum || res.logisticsCompanyCode) {
              setAlertFlag(true);
            } else {
              setAlertFlag(false);
            }
            lineDs.setState('interactiveCampCode', res?.interactiveCampCode);
            useBusinessKey(res.businessKey);
            setNodeConfigName(res.nodeConfigName);
            attachmentDs.loadData([res]);
            logisticsDs.loadData([res]);
          }
        });
        lineDs.query().then(() => {
          if (sourceFromPub) {
            /**
              1.onFormLoaded 方法用于控制审批按钮是否可点击，传参 true 表示可点击
              2.注册了submit回调函数的话，onFormLoaded必传
              3.onFormLoaded应在表单加载完成后调用
              4.设置了customSubmit为true时，必须要调用onFormLoaded方法！
            */
            if (onFormLoaded) {
              onFormLoaded(true);
            }
          }
        });
        lineItemDs.query();
      } else {
        formDs.query().then((res) => {
          if (res) {
            lineDs.setState('interactiveCampCode', res?.interactiveCampCode);
            useBusinessKey(res.businessKey);
            setNodeConfigName(res.nodeConfigName);
          }
        });
        lineDs.query().then(() => {
          if (sourceFromPub) {
            /**
              1.onFormLoaded 方法用于控制审批按钮是否可点击，传参 true 表示可点击
              2.注册了submit回调函数的话，onFormLoaded必传
              3.onFormLoaded应在表单加载完成后调用
              4.设置了customSubmit为true时，必须要调用onFormLoaded方法！
            */
            if (onFormLoaded) {
              onFormLoaded(true);
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

  // 工作流审批通过方法
  const workFlowApproval = useCallback(() => {
    return new Promise(async (resolve, reject) => {
      const headerFlag = await formDs.validate();
      const lineFlag = await lineDs.validate();
      const uuidFlag = await attachmentDs.validate();
      const paramsBabelPlan = {
        ...formDs?.current?.toJSONData(),
        deliveryLineDTOList: lineDs?.toJSONData(),
      };
      const paramsAsn = {
        ...formDs?.current?.toJSONData(),
        ...attachmentDs?.current?.toJSONData(),
        deliveryLineDTOList: lineDs?.toJSONData(),
      };
      const headerInfo = nodeTemplateCode === 'ASN' ? paramsAsn : paramsBabelPlan;
      const param = {
        updateType: 1,
        unitCode: nodeTemplateCode === 'ASN' ? asnCustCode : otherCustCode,
        nodeTemplateCode,
        data: [headerInfo],
        tplInfo: tplInfo.current || {},
      };
      const flag =
        nodeTemplateCode === 'ASN' ? headerFlag && lineFlag && uuidFlag : headerFlag && lineFlag;
      if (flag) {
        const res = await handWorkFlowSave(param);
        if (res && res.failed) {
          notification.error({ message: res.message });
          reject();
        } else {
          resolve();
        }
      } else {
        reject();
      }
    });
  }, [workflowTemplateProps, lineDs, sourceFromPub]);

  const historyClick = (key) => {
    const historyId = key?.key.split(',').pop();
    const dataVersion = Number(key?.key?.split(',').shift() || null);
    // 判断当前点击的是不是最新版本 如果是 就给null
    handleQuery({
      historyId,
      changeDataVersion: histNewVersions?.dataVersion === dataVersion ? null : dataVersion,
    });
    // 最新版本为当前版本 可编辑
    if (histNewVersions?.dataVersion === dataVersion) setHistHidden(true);
    if (histNewVersions?.dataVersion !== dataVersion) setHistHidden(false);
  };

  // 保存-提交
  const handleSaveList = async () => {
    const headerFlag = await formDs.validate();
    const lineFlag = await lineDs.validate();
    const lineItemFlag = await lineItemDs.validate();
    const uuidFlag = await attachmentDs.validate();
    const paramsBabelPlan = {
      unitCode: nodeTemplateCode === 'ASN' ? asnCustCode : otherCustCode,
      campKey: 'p',
      nodeConfigId,
      nodeTemplateCode,
      tplInfo: tplInfo.current || {},
      data: {
        ...formDs?.current?.toData(),
        ...formDs?.current?.toJSONData(),
        deliveryLineDTOList: lineDs
          ?.toJSONData()
          ?.map((m) => ({ ...m, inventoryId: m._inventoryId, locationId: m._locationId })),
      },
    };
    const paramsAsn = {
      unitCode: nodeTemplateCode === 'ASN' ? asnCustCode : otherCustCode,
      campKey: 'p',
      nodeConfigId,
      nodeTemplateCode,
      tplInfo: tplInfo.current || {},
      data: {
        ...formDs?.current?.toData(),
        ...attachmentDs?.current?.toJSONData(),
        deliveryLineDTOList: lineDs
          ?.toJSONData()
          ?.map((m) => ({ ...m, inventoryId: m._inventoryId, locationId: m._locationId })),
        asnItemLineList: (isNil(changes) && lineItemDs?.toJSONData()) || [],
      },
    };
    const params = nodeTemplateCode && nodeTemplateCode === 'ASN' ? paramsAsn : paramsBabelPlan;
    const flag =
      nodeTemplateCode && nodeTemplateCode === 'ASN'
        ? headerFlag && lineFlag && lineItemFlag && uuidFlag
        : headerFlag && lineFlag;
    const validateFlag = await (remote
      ? remote.process('SLOD_ALL_DETAIL_REMOTE_PROCESS_SUBMIT_VALIDATE', true, {
          flag,
          formDs,
          lineDs,
          lineItemDs,
          attachmentDs,
          nodeTemplateCode,
        })
      : true);
    if (!validateFlag) return;
    if (flag && formDs?.current?.get('_token')) {
      // 添加弱校验埋点
      if (!isNil(change) && isFunction(beforeSubmitFn)) {
        const result = await beforeSubmitFn({ formDs, lineDs, lineItemDs, attachmentDs, params });
        if (!result) return false;
      }
      try {
        loadingFlag(true);
        const res = changes ? await handleAllChange(params) : await handleAllSave(params);
        if (getResponse(res)) {
          notification.success();
          if (!isNil(change)) {
            history.push({
              pathname: `/slod/delivery-workbench/list`,
            });
          } else {
            if (tableLineRef?.current) {
              // eslint-disable-next-line no-unused-expressions
              tableLineRef?.current?.onResetLineChange();
            }
            onBackBtnClick();
            handleQuery();
          }
        }
      } catch (e) {
        throw e;
      } finally {
        loadingFlag(false);
      }
    }
  };

  // 综合事件
  const handleAllList = async (type) => {
    const lineList = lineDs.selected
      .map((item) => item.toJSONData())
      ?.map((m) => ({ ...m, inventoryId: m._inventoryId, locationId: m._locationId }));
    const headerFlag = await formDs.validate();
    const lineFlag = await lineDs.validate();
    const operationType = 'detail';
    const hdKey = lineList.length === 0 ? 'left' : 'right'; // 整单
    const paramsBabelPlan = {
      ...formDs?.current?.toData(),
      ...formDs?.current?.toJSONData(),
      deliveryLineDTOList: lineDs
        .toJSONData()
        ?.map((m) => ({ ...m, inventoryId: m._inventoryId, locationId: m._locationId })),
    };
    const paramsAsn = {
      ...formDs?.current?.toData(),
      ...attachmentDs?.current?.toJSONData(),
      deliveryLineDTOList: lineDs
        ?.toJSONData()
        ?.map((m) => ({ ...m, inventoryId: m._inventoryId, locationId: m._locationId })),
    };
    const headerInfo =
      type === 'recall'
        ? nodeTemplateCode === 'ASN'
          ? paramsAsn
          : paramsBabelPlan
        : lineList.length === 0
        ? nodeTemplateCode === 'ASN'
          ? paramsAsn
          : paramsBabelPlan
        : lineList;
    const params = {
      hdKey,
      unitCode: nodeTemplateCode === 'ASN' ? asnCustCode : otherCustCode,
      campKey: 'p',
      operationType,
      headerInfo,
      nodeTemplateCode,
      nodeConfigId,
      tplInfo: tplInfo.current || {},
      num: lineList.length,
    };
    const flag = nodeTemplateCode === 'ASN' ? headerFlag && lineFlag : headerFlag && lineFlag;
    if (flag && formDs?.current?.get('_token')) {
      loadingFlag(true);
      try {
        // 仅关闭添加二次弹窗
        if (type === 'off') {
          const headerConfigName =
            nodeTemplateCode === 'ASN' ? paramsAsn.nodeConfigName : paramsBabelPlan.nodeConfigName;
          const tips = lineDs.selected.length
            ? lineList
                .map((i) => {
                  return ` ${headerConfigName}[${i?.displayLabelNum ||
                    i?.displayPlanNum ||
                    i?.displayAsnNum}-${i?.displayLabelLineNum ||
                    i?.displayPlanLineNum ||
                    i?.displayAsnLineNum}] `;
                })
                .join(',')
            : ` ${headerInfo?.nodeConfigName}[${headerInfo?.displayLabelNum ||
                headerInfo?.displayPlanNum ||
                headerInfo?.displayAsnNum}] `;
          Modal.confirm({
            contentStyle: { width: '550px' },
            // autoCenter: false,
            children: (
              <span>
                {intl.get('slod.deliveryWorkbench.model.view.sureClose').d('确定要关闭')}
                {tips}
                {'?'}
              </span>
            ),
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            okText: intl.get('hzero.common.button.sure').d('确定'),
            cancelText: intl.get('hzero.common.button.cancel').d('取消'),
            onOk: async () => {
              const res = await portEvent(type, params);
              if (getResponse(res)) {
                notification.success();
                if (lineList.length === 0) {
                  history.push({
                    pathname: `/slod/delivery-workbench/list`,
                  });
                } else {
                  if (tableLineRef?.current) {
                    // eslint-disable-next-line no-unused-expressions
                    tableLineRef?.current?.onResetLineChange();
                  }
                  handleQuery();
                }
              }
            },
            onCancel: () => {
              loadingFlag(false);
            },
          });
          return false;
        }
        const res = await portEvent(type, params);
        if (getResponse(res)) {
          notification.success();
          if (lineList.length === 0) {
            history.push({
              pathname: `/slod/delivery-workbench/list`,
            });
          } else {
            if (tableLineRef?.current) {
              // eslint-disable-next-line no-unused-expressions
              tableLineRef?.current?.onResetLineChange();
            }
            handleQuery();
          }
        }
      } catch (e) {
        throw e;
      } finally {
        loadingFlag(false);
      }
    }
  };

  // 提取所有接口事件
  const portEvent = async (type, params) => {
    let res;
    switch (type) {
      case 'off':
        res = await handleOff(params);
        break;
      case 'cancel':
        res = await handleCancel(params);
        break;
      case 'recall':
        res = await handleRecall(params);
        break;
      default:
        res = await handleOff(params);
        break;
    }
    return res;
  };

  const onBack = () => {
    history.replace({
      from,
      nodeCode: nodeTemplateCode,
      nodeId: nodeConfigId,
    });
  };

  const editPage = (flag) => {
    usePageSetup(true);
    useEdit(flag);
    handleQuery();
    setTimeout(() => usePageSetup(false));
  };

  const onHandleChange = () => {
    if (formDs?.current?.get('allowChangeFlag') === 0) {
      notification.warning({
        message: intl
          .get('slod.deliveryWorkbench.model.view.alterMessage')
          .d(
            '当前单据不符合可变更条件（单据状态为”已确认“且无变更中的行时，可执行单据变更），请检查。'
          ),
      });
      return;
    }
    editPage(true);
    usehandleChange('change');
  };

  const onBackBtnClick = () => {
    const lineFiles = [
      'quantity',
      'actualQuantity',
      'receiveAddress',
      'deliveryAddress',
      'plannedArrivalDate',
      'confirmArrivalDate',
      'purchaseLineRemark',
    ];
    lineFiles.forEach((i) => {
      lineDs.setState(i, false);
    });
    usePageSetup(true);
    editPage(false);
    usehandleChange(null);
    handleQuery();
    setTimeout(() => usePageSetup(false));
  };

  const handleOpenMap = () => {
    // const { logisticsTrackUrl } = logisticsData;
    setLogLoading(true);
    handleRefreshLogistics({ headerId, campKey: 'p' })
      .then((res) => {
        if (res && !res.failed) {
          // setLogisticsData({ ...logisticsData, ...res });
          c7nModal({
            okCancel: false,
            okText: intl.get('hzero.common.button.close').d('关闭'),
            style: { width: 1090 },
            title: intl.get('slod.deliveryWorkbench.model.view.logisticsTask').d('TMS物流项目跟踪'),
            // eslint-disable-next-line jsx-a11y/iframe-has-title
            children: <iframe src={res.logisticsTrackUrl} width="100%" height="100%" />,
          });
        } else {
          notification.error({ message: res?.message || null });
        }
      })
      .finally(() => {
        setLogLoading(false);
      });
  };

  const handleprintList = async () => {
    const printFlag = checkPrintWindow();
    const { packageMethod = '' } = formDs?.current?.toData() || {};
    const lineList = lineDs.selected.map((item) => item.toJSONData());
    const params = {
      headerId,
      campKey: 'p',
      nodeTemplateCode,
      hdKey: ['UNIQUE_LABEL', 'LABEL'].includes(nodeTemplateCode)
        ? isEmpty(lineList)
          ? 'left'
          : 'right'
        : 'left',
      responseType: printFlag ? 'blob' : 'json',
      headers: printFlag ? {} : { 's-print-using-preview': '1' },
      deliveryLineDTOList:
        nodeTemplateCode === 'UNIQUE_LABEL' &&
        packageMethod === 'INDEPENDENT_PACKAGE' &&
        !isEmpty(lineList)
          ? lineList
          : [formDs?.current?.toData()],
    };
    const res = await handleDetailPrint(params);
    if (printFlag) {
      if (res && res.type && res.type.includes('application/json')) {
        const reader = new FileReader();
        reader.readAsText(res, 'utf-8');
        reader.onload = () => {
          const readers = reader.result;
          const parseObj = JSON.parse(readers) || {};
          notification.error({ message: parseObj?.message || null });
        };
      } else if (res) {
        const file = new Blob([res], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const printWindow = window.open(fileURL);
        if (printWindow) printWindow.print();
      }
    } else {
      // 添加如下代码
      const { fileUrl, bucketName, fileToken } = res;
      const url = await getPdfPreviewUrl({ fileUrl, bucketName, fileToken });
      window.open(url);
    }
  };

  // 撤销审批
  const handleRevokeApproval = () => {
    Modal.confirm({
      contentStyle: { width: '550px' },
      title: intl.get('slod.deliveryWorkbench.view.message.help').d('提示'),
      children: (
        <div>
          <span>
            {intl
              .get('slod.deliveryWorkbench.view.message.revokeApprovalMessage')
              .d('是否确认撤销审批？撤销后您仍可在此提交发起审批（仅工作流审批发起人可执行撤销）')}
          </span>
        </div>
      ),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: async () => {
        const res = await handleRevokeApprovalChange({ businessKey });
        if (isString(res)) {
          notification.error({
            message: intl.get('hzero.common.status.mistake').d('错误'),
            description: res,
          });
        } else if (res && !res.failed) {
          notification.success({
            message: intl.get('hzero.common.notification.success').d('操作成功'),
            description: intl
              .get('slod.deliveryWorkbench.view.message.approvalSuccess')
              .d('撤销审批成功'),
          });
          history.push({
            pathname: '/slod/delivery-workbench/list',
          });
        }
      },
    });
  };

  const Buttons = useMemo(
    () =>
      observer(({ dataSet, linesDs }) => {
        const menu = (
          <Menu
            onClick={(key) => historyClick(key)}
            style={{
              maxHeight: '200px',
              minHeight: '10px',
              overflowY: 'auto',
            }}
          >
            {historyList?.map((item) => {
              return (
                <Menu.Item
                  key={`${item.dataVersion},${
                    nodeTemplateCode === 'ASN' ? item.asnHeaderId : item.planHeaderId
                  }`}
                >
                  <a style={{ color: '#1D2129' }}>
                    {`【${intl.get('slod.deliveryWorkbench.model.lookBanben').d('查看历史版本')}${
                      item.dataVersion
                    }】`}
                  </a>
                </Menu.Item>
              );
            })}
          </Menu>
        );
        const template =
          nodeTemplateCode === 'UNIQUE_LABEL'
            ? 'LABEL'.toLowerCase()
            : nodeTemplateCode?.toLowerCase();
        // 计划单暂时不需要打印功能
        const printBtn = nodeTemplateCode !== 'PLAN';
        const getPrintData = () => {
          if (isEmpty(linesDs.selected)) {
            return [dataSet?.current?.toData()].map((item) => {
              if (nodeTemplateCode === 'ASN') {
                return item?.asnHeaderId;
              } else if (nodeTemplateCode === 'PLAN') {
                return item?.planHeaderId;
              } else {
                return {
                  labelHeaderId: item?.labelHeaderId,
                };
              }
            });
          } else {
            if (nodeTemplateCode === 'ASN') return [dataSet?.current?.get('asnHeaderId')];
            if (nodeTemplateCode === 'PLAN') return [dataSet?.current?.get('planHeaderId')];
            const lineList = linesDs.selected.map((item) => item.toJSONData());
            return lineList.map((item) => {
              return {
                labelHeaderId: item?.labelHeaderId,
                labelLineId: item?.labelLineId,
              };
            });
          }
        };
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
        const ChatCmps = (btns) => {
          return (
            <ChatCmp
              type="c7n-pro"
              btnType="button"
              color="#000"
              campKey="p"
              loading={menuLoading}
              id={headerId}
              nodeConfigId={nodeConfigId}
              btnText={btns?.buttonText}
              nodeTemplateCode={nodeTemplateCode}
              icon={!btns?.inMenuItem && 'headset'}
              funcType={btns?.inMenuItem ? 'link' : 'flat'}
              companyId={formDs?.current?.get('companyId')}
            />
          );
        };
        const approvaFlags = dataSet?.getState('approvaFlags');
        const operationFlags = dataSet?.getState('operationFlags');
        const businessKeys = dataSet?.current?.get('businessKey');
        const approvaFlag = approvaFlags?.[businessKeys];
        const operationFlag = operationFlags?.[businessKeys];
        const { taskId, processInstanceId } = approvaFlag || {};
        const preBtns = [
          edit &&
            histHidden && {
              name: 'save',
              child: !changes
                ? intl.get('hzero.common.button.save').d('保存')
                : intl.get('hzero.common.button.submit').d('提交'),
              hidden: sourceFromPub || [1, 2].includes(Number(docFlow)),
              btnProps: {
                color: 'primary',
                icon: !changes ? 'save' : 'check',
                loading: menuLoading,
                disabled: !dataSet?.current?.get('_token'),
                onClick: () => handleSaveList(),
              },
            },
          !changes &&
            histHidden && {
              name: 'off',
              child: (name) => name || intl.get('slod.deliveryWorkbench.model.view.off').d('关闭'),
              hidden: sourceFromPub || [1, 2].includes(Number(docFlow)),
              btnProps: {
                color: '#ffffff',
                icon: 'not_interested',
                funcType: 'flat',
                type: 'c7n-pro',
                loading: menuLoading,
                disabled: !dataSet?.current?.get('_token'),
                onClick: () => handleAllList('off'),
              },
            },
          !edit &&
            !changes &&
            histHidden && {
              name: 'editors',
              child: (name) =>
                name || intl.get('slod.deliveryWorkbench.model.view.editor').d('编辑'),
              hidden: sourceFromPub || [1, 2].includes(Number(docFlow)),
              btnProps: {
                icon: 'mode_edit',
                loading: menuLoading,
                funcType: 'flat',
                type: 'c7n-pro',
                onClick: () => {
                  editPage(true);
                },
                color: '#ffffff',
              },
            },
          nodeTemplateCode === 'PLAN' && {
            name: 'printNew',
            child: (name) => name || intl.get('slod.deliveryWorkbench.model.view.print').d('打印'),
            btnComp: PrintProButton,
            childFor: 'buttonText',
            hidden: sourceFromPub || [1].includes(Number(docFlow)),
            btnProps: {
              type: 'c7n-pro',
              funcType: 'flat',
              buttonProps: {
                funcType: 'flat',
                loading: menuLoading,
              },
              requestUrl: `${SRM_SLOD}/v1/${getCurrentOrganizationId()}/delivery/plan/batch-print-token?campKey=p`,
              method: 'POST',
              data: getPrintData,
              buttonText: intl.get('slod.deliveryWorkbench.model.view.print').d('打印'),
            },
          },
          printBtn &&
            !changes &&
            histHidden && {
              name: 'print',
              child: (name) =>
                name || intl.get('slod.deliveryWorkbench.model.view.print').d('打印'),
              hidden: sourceFromPub || [1, 2].includes(Number(docFlow)),
              // btnComp: PermissionButton,
              btnProps: {
                type: 'c7n-pro',
                icon: 'print',
                loading: menuLoading,
                funcType: 'flat',
                onClick: () => handleprintList(),
              },
            },
          !edit &&
            !changes &&
            histHidden && {
              name: 'recall',
              child: (name) =>
                name || intl.get('slod.deliveryWorkbench.model.view.recall').d('撤回'),
              hidden: sourceFromPub || [1, 2].includes(Number(docFlow)),
              btnProps: {
                icon: 'reply',
                type: 'c7n-pro',
                funcType: 'flat',
                loading: menuLoading,
                disabled: !dataSet?.current?.get('_token'),
                onClick: () => handleAllList('recall'),
              },
            },
          !edit &&
            !changes &&
            histHidden && {
              name: 'approval',
              child: (name) => name || intl.get('hzero.common.button.approval').d('审批'),
              hidden: !(approvaFlags && approvaFlag),
              btnProps: {
                icon: 'authorize',
                type: 'c7n-pro',
                funcType: 'flat',
                loading: menuLoading,
                disabled: !dataSet?.current?.get('_token'),
                onClick: async () => {
                  openApproveModal({
                    modalProps: {
                      closable: true,
                    },
                    taskId,
                    processInstanceId,
                    onSuccess: () => {
                      history.push({
                        pathname: '/slod/delivery-workbench/list',
                      });
                    },
                  });
                },
              },
            },
          !edit &&
            !changes &&
            histHidden && {
              name: 'revokeApproval',
              child: (name) => name || intl.get('hzero.common.button.revokeApproval').d('撤销审批'),
              hidden: !(operationFlags && operationFlag?.REVOKE),
              btnProps: {
                icon: 'reply',
                type: 'c7n-pro',
                funcType: 'flat',
                loading: menuLoading,
                disabled: !dataSet?.current?.get('_token'),
                onClick: handleRevokeApproval,
              },
            },
          edit &&
            !changes &&
            histHidden && {
              name: 'editor',
              child: (name) =>
                name || intl.get('slod.deliveryWorkbench.model.view.cancelEditor').d('取消编辑'),
              hidden: sourceFromPub || [1, 2].includes(Number(docFlow)),
              btnProps: {
                icon: 'cancel',
                funcType: 'flat',
                type: 'c7n-pro',
                loading: menuLoading,
                onClick: () => {
                  editPage(false);
                },
                color: '#ffffff',
              },
            },
          // nodeTemplateCode === 'ASN' &&
          printBtn &&
            !changes &&
            histHidden && {
              name: 'printNew',
              child: (name) =>
                name || intl.get('slod.deliveryWorkbench.model.view.printNews').d('打印（新）'),
              btnComp: PrintProButton,
              childFor: 'buttonText',
              hidden: sourceFromPub || [1].includes(Number(docFlow)), // TODO
              btnProps: {
                type: 'c7n-pro',
                funcType: 'flat',
                buttonProps: {
                  type: 'c7n-pro',
                  funcType: 'flat',
                },
                requestUrl: `${SRM_SLOD}/v1/${getCurrentOrganizationId()}/delivery/${template}/batch-print-token?campKey=p`,
                method: 'POST',
                data: getPrintData,
                buttonText: intl.get('slod.deliveryWorkbench.model.view.printNews').d('打印（新）'),
              },
            },
          !edit &&
            ['PLAN', 'ASN'].includes(nodeTemplateCode) && {
              name: 'history',
              hidden: sourceFromPub || [1, 2].includes(Number(docFlow)),
              // group: true,
              child: (
                <Dropdown overlay={menu}>
                  <Button
                    style={{ paddingLeft: '0px', fontWeight: 400 }}
                    type="c7n-pro"
                    funcType="flat"
                  >
                    {intl.get(`slod.deliveryWorkbench.view.title.seeHistory`).d('查看历史版本')}
                  </Button>
                </Dropdown>
              ),
            },
          histHidden && {
            name: 'exportHistory',
            hidden: [1, 2].includes(Number(docFlow)),
            child: (name) =>
              name || intl.get('slod.deliveryWorkbench.model.common.exportStatus').d('导出记录'),
            btnProps: {
              color: '#ffffff',
              type: 'c7n-pro',
              icon: 'operation_service_request',
              funcType: 'flat',
              loading: menuLoading,
              disabled: !dataSet?.current?.get('_token'),
              onClick: () => exportRender('header', headerId, nodeTemplateCode, undefined, remote),
            },
          },
          {
            name: 'operating',
            child: (name) => name || intl.get('hzero.common.button.operatRecord').d('操作记录'),
            childFor: 'buttonText',
            btnComp: BtnOption,
          },
          histHidden &&
            !changes && {
              name: 'srmOperating',
              hidden: [1, 2].includes(Number(docFlow)),
              childFor: 'buttonText',
              child: (name) =>
                name || intl.get('slod.deliveryWorkbench.model.view.btnText').d('操作记录（本地）'),
              btnComp: BtnOptionBd,
            },
          ['PLAN'].includes(nodeTemplateCode) &&
            !changes &&
            !edit && {
              name: 'alter',
              hidden: sourceFromPub || [1, 2].includes(Number(docFlow)),
              child: (name) =>
                name || intl.get('slod.deliveryWorkbench.model.view.change').d('变更'),
              btnProps: {
                color: '#ffffff',
                icon: 'mode_edit',
                funcType: 'flat',
                type: 'c7n-pro',
                loading: menuLoading,
                disabled: !dataSet?.current?.get('_token'),
                onClick: () => onHandleChange(),
              },
            },
          {
            name: 'onlineChat',
            child: (name) =>
              name || intl.get('sinv.receiptWorkbench.view.title.detail.onlineChat').d('在线沟通'),
            hidden: sourceFromPub || [1, 2].includes(Number(docFlow)),
            childFor: 'buttonText',
            btnComp: ChatCmps,
          },
        ];

        const btns = remote
          ? remote.process('SLOD_ALL_DETAIL_REMOTE_PROCESS_HEADER_BTN', preBtns, {
              nodeTemplateCode,
              dataSet,
              edit,
              sourceFromPub,
              docFlow,
              getPrintData,
            })
          : preBtns;
        return (
          <Fragment>
            {customizeBtnGroup(
              {
                code:
                  !changes &&
                  Number(docFlow) === 0 &&
                  `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.${codeBtn}`,
                pro: true,
              },
              <DynamicButtons
                key={nodeTemplateCode}
                buttons={btns.filter((i) => !i.hidden)}
                maxNum={!changes && 5}
                defaultBtnType="c7n-pro"
                permissions={[
                  {
                    code: ['ASN'].includes(nodeTemplateCode)
                      ? 'srm.logistics.delivery.work.bench.button.detail.printnew'
                      : ['LABEL'].includes(nodeTemplateCode)
                      ? `srm.logistics.delivery.work.bench.button.detail.label.printnew`
                      : ['LABEL'].includes(nodeTemplateCode)
                      ? `srm.logistics.delivery.work.bench.button.detail.printnewplan`
                      : `srm.logistics.delivery.work.bench.button.detail.unique.label.printnew`,
                    name: 'printNew',
                  },
                  {
                    code: ['ASN'].includes(nodeTemplateCode)
                      ? 'srm.logistics.delivery.work.bench.button.detail.print'
                      : ['LABEL'].includes(nodeTemplateCode)
                      ? `srm.logistics.delivery.work.bench.button.detail.label.print`
                      : `srm.logistics.delivery.work.bench.button.detail.unique.label.print`,
                    name: 'print',
                  },
                  {
                    code: ['ASN'].includes(nodeTemplateCode)
                      ? 'srm.logistics.delivery.work.bench.button.detail.approval'
                      : ['LABEL'].includes(nodeTemplateCode)
                      ? `srm.logistics.delivery.work.bench.button.detail.label.approval`
                      : ['UNIQUE_LABEL'].includes(nodeTemplateCode)
                      ? `srm.logistics.delivery.work.bench.button.detail.unique.label.approval`
                      : `srm.logistics.delivery.work.bench.button.detail.plan.approval`,
                    name: 'approval',
                  },
                  {
                    code: ['ASN'].includes(nodeTemplateCode)
                      ? 'srm.logistics.delivery.work.bench.button.detail.revokeapproval'
                      : ['LABEL'].includes(nodeTemplateCode)
                      ? `srm.logistics.delivery.work.bench.button.detail.label.revokeapproval`
                      : ['UNIQUE_LABEL'].includes(nodeTemplateCode)
                      ? `srm.logistics.delivery.work.bench.button.detail.unique.label.revokeapproval`
                      : `srm.logistics.delivery.work.bench.button.detail.plan.revokeapproval`,
                    name: 'revokeApproval',
                  },
                  {
                    code: ['ASN'].includes(nodeTemplateCode)
                      ? 'srm.logistics.delivery.work.bench.button.detail.onlinechat'
                      : ['LABEL'].includes(nodeTemplateCode)
                      ? `srm.logistics.delivery.work.bench.button.detail.label.onlinechat`
                      : ['UNIQUE_LABEL'].includes(nodeTemplateCode)
                      ? `srm.logistics.delivery.work.bench.button.detail.unique.label.onlinechat`
                      : `srm.logistics.delivery.work.bench.button.detail.plan.onlinechat`,
                    name: 'onlineChat',
                  },
                ]}
              />
            )}
          </Fragment>
        );
      }),
    [nodeTemplateCode, edit, changes, histHidden, menuLoading]
  );

  const handleRefresh = () => {
    setLogLoading(true);
    handleRefreshLogistics({ headerId, campKey: 'p' })
      .then((res) => {
        if (res && !res.failed) {
          setLogisticsData({ ...logisticsData, ...res });
          setLogLoading(false);
          notification.success();
        } else {
          notification.error({ message: res?.message || null });
        }
      })
      .finally(() => {
        setLogLoading(false);
      });
  };

  const onBackBtnHandleClick = () => {
    if (!sourceFromPub && Number(docFlow) === 0) {
      if (nodeTemplateCode === 'PLAN') {
        if (change) {
          return '/slod/delivery-workbench/list';
        } else if (!changes) {
          return '/slod/delivery-workbench/list';
        } else {
          return null;
        }
      } else {
        return '/slod/delivery-workbench/list';
      }
    } else {
      return null;
    }
  };

  const basicLogistic = {
    logisticsData,
    logLoading,
    handleRefresh,
    remote,
    toggleModal: (value) => setDisplay(value),
    display,
    handleOpenMap,
    doubleUnitEnabled,
  };

  const basicProps = {
    edit,
    formDs,
    lineDs,
    docFlow,
    headerId,
    lineItemDs,
    nodeConfigId,
    attachmentDs,
    sourceFromPub,
    changeMarkFlag,
    nodeTemplateCode,
    change: changes,
    tplInfo: tplInfo.current || {},
    customizeForm: props.customizeForm,
    customizeTable: props.customizeTable,
    customizeBtnGroup: props.customizeBtnGroup,
    ...basicLogistic,
  };
  const lineItemProps = {
    customizeTable: props.customizeTable,
    lineItemDs,
    nodeTemplateCode,
    edit,
    tabType: true, // 判断当前是否是全部明细（非全部明细没有此字段）
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

  const codeBtn = edit ? `BTN_DETAIL` : `BTN_DETAIL.EDIT`;
  return (
    <Fragment>
      {nodeTemplateCode === 'ASN' && <Affix linkKeys={linkKeys} />}
      <div className="header-style">
        {!change && changes && nodeTemplateCode === 'PLAN' && (
          <div className="back-style">
            <Tooltip
              title={intl.get('hzero.common.button.back').d('返回')}
              placement="bottom"
              getTooltipContainer={(that) => that}
            >
              <Icon type="arrow_back" onClick={onBackBtnClick} className="back-style-icon" />
            </Tooltip>
          </div>
        )}
        <Header
          className={!change && changes && nodeTemplateCode === 'PLAN' && 'header-style-box'}
          title={
            edit && !sourceFromPub && Number(docFlow) === 0
              ? `${intl
                  .get('slod.deliveryWorkbench.model.common.editTitle')
                  .d('编辑')}-${nodeConfigName}`
              : `${intl
                  .get('slod.deliveryWorkbench.model.common.viewTitle')
                  .d('查看')}-${nodeConfigName} `
          }
          backPath={onBackBtnHandleClick()}
          onBack={() => onBack()}
        >
          <Buttons dataSet={formDs} linesDs={lineDs} />
        </Header>
      </div>
      {pageSetup ? (
        <Spin spinning={pageSetup} />
      ) : (
        <Content
          className="customize-wrap"
          wrapperClassName="content-wrap"
          id="delivery-workspace-detail-containe"
        >
          <Spin spinning={false} wrapperClassName={DETAIL_DEFAULT_CLASSNAME}>
            {logisticsData?.logisticsLocusList &&
              logisticsData?.logisticsLocusList.length > 0 &&
              nodeTemplateCode === 'ASN' &&
              !sourceFromPub &&
              !sourceFromPub && <LogisticsRecord {...basicLogistic} />}
            {logisticsData?.logisticsLocusList &&
              logisticsData?.logisticsLocusList.length > 0 &&
              nodeTemplateCode === 'ASN' &&
              !sourceFromPub && (
                <div style={{ width: '100%', height: '8px', backgroundColor: '#f4f5f7' }} />
              )}
            {!logisticsData?.logisticsLocusList?.length &&
              !sourceFromPub &&
              nodeTemplateCode === 'ASN' && (
                <div className="btn-map">
                  {logisticsData?.logisticsTrackUrl && (
                    <Button
                      icon="room"
                      color="primary"
                      funcType="flat"
                      type="c7n-pro"
                      loading={logLoading}
                      onClick={handleOpenMap}
                    >
                      {intl.get('slod.deliveryWorkbench.model.view.logisticsMap').d('物流地图')}
                    </Button>
                  )}
                  <Button
                    icon="autorenew"
                    color="primary"
                    funcType="flat"
                    type="c7n-pro"
                    loading={logLoading}
                    onClick={handleRefresh}
                  >
                    {intl.get('slod.deliveryWorkbench.model.view.logisticsUpdate').d('物流更新')}
                  </Button>
                </div>
              )}
            {customizeCollapse(
              {
                code: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.COLLAPSE_ALL`,
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
                  {edit && alertFlag ? (
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
                {histHidden && (
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
                )}
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
      )}
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
      code: 'SLOD_ALL_DETAIL_REMOTE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
      name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
    },
    {
      process: {
        handleInfoDataUpdate: undefined,
        beforeSubmitFn: undefined,
      },
    }
  )
)(DetailIndex);
