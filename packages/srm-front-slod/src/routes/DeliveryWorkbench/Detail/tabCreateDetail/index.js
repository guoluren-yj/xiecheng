import React, { Fragment, useState, useMemo, useEffect, useCallback, useLayoutEffect } from 'react';
import { DataSet, Spin, Dropdown, Button, Icon, Menu, Modal } from 'choerodon-ui/pro';
import { Collapse, Alert } from 'choerodon-ui';
import classnames from 'classnames';
import { compose, isNil, isEmpty } from 'lodash';

import qs from 'querystring';
import intl from 'utils/intl';
import { SRM_SLOD } from '_utils/config';
import { Header } from 'components/Page';
import { getResponse } from 'utils/utils';
import request from 'hzero-front/lib/utils/request';
// import DynamicButtons from '_components/DynamicButtons';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import cuxRemote from 'hzero-front/lib/utils/remote';
import { useDoubleUomConfig } from '@/routes/components/utils';
import asnLineItemDs from '../../commonDs/asnLineItemDs';
import AsnLineItemTable from '../../commonDs/asnLineItemTable';
import { detailCustomizeUnitCodes } from '../../globalFunction';
import { lineSelectedCancelSelected } from '../../components/utils';
import CombineTabComponent from '@/routes/components/Combine/combineTabComponent';
import CompositeComposite, { numText } from '@/utils/utils';

import {
  handleSave,
  handleSubmit,
  handleDelete,
  handleLineDel,
  destroyChange,
  handLineBuilder,
  combineTabQuery,
} from '@/services/DeliveryWorkbenchServices';
import Affix from '@/components/AffixDetail';
import { fetchConfigSheet } from '@/services/commonService';
import { headerInfoDataSet } from './store/headerInfoDS';
import { lineListDataSet } from './store/lineListDS';
import {
  HeaderInfo,
  AsnHeaderShipmentsInfo,
  AsnHeaderReceivingInfo,
  AttachmentList,
} from './datailHeaderInfo';
import LineList from './detailLineList';
import UniqueLineList from '../../components/uniqueModule/uniqueLineList';

import styles from '../index.less';

const { Panel } = Collapse;

const STAGE_CODE = 'SUBMIT';

const TabCreate = (props) => {
  const {
    remote,
    location: { search },
    history,
    doubleUnitEnabled,
    customizeCollapse,
  } = props;
  const {
    nodeTemplateCode = null,
    nodeConfigId = null,
    from,
    cacheKey,
    headerId: publicId,
  } = qs.parse(search.substr(1));
  const lineId = {
    LABEL: 'labelLineId',
    PLAN: 'planLineId',
    ASN: 'asnLineId',
    UNIQUE_LABEL: 'labelLineId',
  };
  const { cuxHanscncImportandExportBtns } = remote?.props?.process || {};
  const _code = (['UNIQUE_LABEL'].includes(nodeTemplateCode)
    ? 'LABEL'
    : nodeTemplateCode
  )?.toLowerCase();
  const _headerId = `${_code}HeaderId`;

  const _object = {
    nodeTemplateType: nodeTemplateCode,
    id: lineId[nodeTemplateCode],
    unitLineCode: detailCustomizeUnitCodes(nodeTemplateCode, ['line']),
    doubleUnitEnabled,
  };
  // tableLineRef: 清除行查询条件的回调函数
  const tableLineRef = React.useRef();
  const labelLineRef = React.useRef({});
  const [tabCombine, setTabList] = useState([]);
  const [headerId, setGather] = useState(null);
  const [subVisible, setSubVisible] = useState(true);
  const [delVisible, setDelVisible] = useState(true);
  const [menuLoading, useMenuLoading] = useState(false); // 菜单加载loading
  const [waitCustomize, setWaitCustomize] = useState(false);
  const [nodeConfigName, setNodeConfigName] = useState('...');
  const [alertFlag, setAlertFlag] = useState(false); // 提示是否显示
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
        })
      ),
    [headerId]
  );
  const lineDs = useMemo(
    () =>
      new DataSet(
        remote
          ? remote.process(
              'SLOD_PRDETAIL_REMOTE_PROCESS_LINE_DS',
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
  const tplInfo = useMemo(() => ({ current: null }), []);
  const [cuzeDom, setOpen] = useState(false);
  lineDs.setState({ doubleUnitEnabled });
  const otherCustCode = detailCustomizeUnitCodes(nodeTemplateCode, ['header', 'line', 'unique']);
  const asnCustCode = detailCustomizeUnitCodes(nodeTemplateCode, [
    'header',
    'shipment',
    'receiving',
    'line',
    'line-item',
    'batch',
    'attachment',
  ]);

  const receiptsCod = ['UNIQUE_LABEL'].includes(nodeTemplateCode) ? 'LABEL' : nodeTemplateCode;
  // 页面loading
  const loadingFlag = (type) => {
    useMenuLoading(type); // loading
  };

  useEffect(() => {
    lineDs.setQueryParameter('params', {
      headerId,
      campKey: 'p',
      nodeConfigId,
      nodeTemplateCode,
    });
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
          deliveryHeaderId: headerId || publicId,
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
  }, [nodeTemplateCode]);

  useLayoutEffect(() => {
    getlist();
  }, [tplInfo.current]);

  const getlist = async () => {
    try {
      const res = await combineTabQuery({ nodeTemplateCode, nodeConfigId, cacheKey, campKey: 'p' });
      if (getResponse(res)) {
        if (res && res?.length > 0) {
          const id = (Array.isArray(res) && res.length && res[0][_headerId]) || null;
          setTabList(res);
          setGather(id);
        } else {
          destroyEvent();
          history.push({
            pathname: `/slod/delivery-workbench/list`,
          });
        }
      }
    } catch (e) {
      throw e;
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchConfig();
      if (!isNil(headerId) && !isEmpty(tplInfo?.current)) handleQuery(headerId);
      if (tableLineRef?.current) {
        // eslint-disable-next-line no-unused-expressions
        tableLineRef?.current?.onResetLineChange();
      }
      // eslint-disable-next-line no-unused-expressions
      lineDs?.queryDataSet?.current?.set({
        itemCodeOrName: null,
      });
    }, 400);
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

  const handleQuery = useCallback(
    (_id) => {
      lineDs.setState({ batchData: {} });
      lineDs.setState({ fieldMapValues: undefined });
      setWaitCustomize(true);
      try {
        loadingFlag(true);
        formDs.setQueryParameter('params', {
          headerId: _id || headerId,
          campKey: 'p',
          nodeConfigId,
          nodeTemplateCode,
        });
        lineDs.setQueryParameter('params', {
          headerId: _id || headerId,
          campKey: 'p',
          nodeConfigId,
          nodeTemplateCode,
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
            console.log('header');
            if (res) {
              if (res.expressNum || res.logisticsCompanyCode) {
                setAlertFlag(true);
              } else {
                setAlertFlag(false);
              }
              setNodeConfigName(res.nodeConfigName);
            }
          });
          lineDs.query().then(() => {
            console.log('line');
          });
          lineItemDs.query().then(() => {
            console.log('items');
          });
        } else {
          formDs.query().then((res) => {
            if (res) {
              setNodeConfigName(res.nodeConfigName);
            }
          });
          lineDs.query();
        }
      } catch (e) {
        throw e;
      } finally {
        setWaitCustomize(false);
        lineDs.clearCachedSelected();
        lineDs.unSelectAll();
        setTimeout(() => loadingFlag(false), 500);
      }
    },
    [headerId, tplInfo?.current]
  );

  const queryChangeBack = (tabId) => {
    setGather(tabId);
    // handleQuery(tabId);
  };

  // useEffect(() => {
  //   if (!isNil(headerId) && !isEmpty(tplInfo?.current)) handleQuery(headerId);
  // }, []);

  // 销毁tab缓存数据
  const destroyEvent = () => {
    destroyChange({ nodeTemplateCode, nodeConfigId, cacheKey, campKey: 'p' });
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
          data: { ...basicData, asnItemLineList: lineItemDs?.toJSONData() },
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

  // 保存
  const handleSaveList = async (_, sign = null, subData) => {
    const onFlag = await Promise.all([
      formDs.validate(),
      lineDs.validate(),
      nodeTemplateCode === 'UNIQUE_LABEL' ? labelLineRef?.current?.lableLineDs?.validate() : true,
    ]);
    const params = onHandleWrapperAcquisitionData();
    const flag = onFlag.every((item) => item === true);
    const validateFlag = await (remote
      ? remote.process('SLOD_PRDETAIL_REMOTE_PROCESS_ALL_SUBMIT_VALIDATE', true, {
          flag,
          formDs,
          lineDs,
          lableLineDs: labelLineRef?.current?.lableLineDs,
          nodeTemplateCode,
          sign,
        })
      : true);
    if (!validateFlag) return;
    if (flag && formDs?.current?.get('_token')) {
      try {
        loadingFlag(true);
        const res = await handleSave(params);
        if (getResponse(res)) {
          if (sign !== 'submit') {
            notification.success();
            loadingFlag(false);
            if (tableLineRef?.current) {
              // eslint-disable-next-line no-unused-expressions
              tableLineRef?.current?.onResetLineChange();
            }
            handleQuery();
            if (nodeTemplateCode === 'UNIQUE_LABEL' && labelLineRef?.current) {
              // eslint-disable-next-line no-unused-expressions
              labelLineRef?.current?.lableLineDs?.query();
            }
          } else {
            return await handleSubmit(subData);
          }
        } else {
          loadingFlag(false);
        }
      } catch (e) {
        throw e;
      }
    }
  };

  const subVisibleChange = (flag) => {
    const visible = !flag;
    setSubVisible(visible);
  };

  const delVisibleChange = (flag) => {
    const visible = !flag;
    setDelVisible(visible);
  };

  const resultCallback = (res) => {
    if (getResponse(res)) {
      notification.success();
      destroyEvent();
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
  };

  const operationChangeComposite = useCallback(
    async (_keys, componentType) => {
      if (!formDs?.current?.get('_token')) {
        return;
      }
      if (_keys.key === 'all') {
        const data = [];
        tabCombine.forEach((item) => {
          if (item[_headerId] === formDs?.current?.get(_headerId)) {
            const _obj = {
              ...item,
              objectVersionNumber: formDs?.current?.get('objectVersionNumber'),
            };
            data.push(_obj);
          } else {
            data.push(item);
          }
        });
        const params = {
          tplInfo,
          unitCode: nodeTemplateCode === 'ASN' ? asnCustCode : otherCustCode,
          campKey: 'p',
          nodeConfigId,
          nodeTemplateCode,
          operationType: 'tabulation',
          deliveryLineDTOList: data,
          headerInfo: data,
          // headerInfo: {...tabCombine, objectVersionNumber: formDs?.current?.get('_token')},
        };
        if (componentType !== 'delete') {
          try {
            loadingFlag(true);
            const res = await handleSaveList({}, 'submit', params);
            resultCallback(res);
          } catch (e) {
            throw e;
          } finally {
            loadingFlag(false);
          }
        }
        if (componentType === 'delete') {
          Modal.confirm({
            contentStyle: { width: '550px' },
            title: intl.get('slod.deliveryWorkbench.view.message.help').d('提示'),
            children: (
              <div>
                <p>
                  {intl.get('slod.deliveryWorkbench.view.message.sureDelete').d('确定要删除数据?')}
                </p>
              </div>
            ),
            okText: intl.get('hzero.common.button.sure').d('确定'),
            cancelText: intl.get('hzero.common.button.cancel').d('取消'),
            onOk: async () => {
              const res = await handleDelete(params);
              resultCallback(res);
            },
          });
        }
      }
      if (_keys.key === 'instantly') {
        const headerInfo = formDs?.toData();
        const paramsDel = { headerInfo, nodeTemplateCode, nodeConfigId, campKey: 'p' };
        const params = onHandleWrapperAcquisitionData();
        const code = numText(receiptsCod);
        const text = formDs?.current?.get(code);
        if (componentType === 'delete') {
          Modal.confirm({
            contentStyle: { width: '550px' },
            title: intl.get('slod.deliveryWorkbench.view.message.help').d('提示'),
            children: (
              <div>
                <span>
                  {intl.get('slod.deliveryWorkbench.view.message.deliveryDelete').d(`确认删除`)}
                </span>
                <span>{`${headerInfo[0].nodeConfigName}${text}`}</span>
                <span> ？</span>
              </div>
            ),
            okText: intl.get('hzero.common.button.sure').d('确定'),
            cancelText: intl.get('hzero.common.button.cancel').d('取消'),
            onOk: async () => {
              try {
                loadingFlag(true);
                const res = await handleDelete(paramsDel);
                if (getResponse(res)) {
                  notification.success();
                  if (tabCombine?.length > 1) getlist();
                  if (tabCombine?.length <= 1) {
                    notification.success();
                    destroyEvent();
                    history.push({
                      pathname: `/slod/delivery-workbench/list`,
                    });
                  }
                }
              } catch (e) {
                throw e;
              } finally {
                loadingFlag(false);
              }
            },
          });
        }
        if (componentType === 'submit') {
          try {
            const headerFlag = await formDs.validate();
            const lineFlag = await lineDs.validate();
            const flag =
              nodeTemplateCode && nodeTemplateCode === 'ASN'
                ? headerFlag && lineFlag
                : headerFlag && lineFlag;
            const validateFlag = await (remote
              ? remote.process('SLOD_PRDETAIL_REMOTE_PROCESS_SUBMIT_VALIDATE', true, {
                  flag,
                  formDs,
                  lineDs,
                  nodeTemplateCode,
                })
              : true);
            if (!validateFlag) return;
            if (flag && formDs?.current?.get('_token')) {
              loadingFlag(true);
              const res = await handleSubmit(params);
              if (getResponse(res)) {
                notification.success();
                if (tabCombine?.length > 1) getlist();
                if (tabCombine?.length <= 1) {
                  notification.success();
                  destroyEvent();
                  history.push({
                    pathname: `/slod/delivery-workbench/list`,
                  });
                }
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
      }
    },
    [headerId, tabCombine, formDs, lineDs]
  );

  const compositeChange = async (_arr, componentType) => {
    if (!formDs?.current?.get('_token')) {
      return;
    }
    const ids = [];
    const data = [];
    _arr.forEach((item) => {
      ids.push(item.value);
    });
    tabCombine.forEach((item) => {
      if (ids.includes(item[_headerId])) {
        data.push({ ...item });
      }
    });
    const params = {
      tplInfo,
      unitCode: nodeTemplateCode === 'ASN' ? asnCustCode : otherCustCode,
      nodeConfigId,
      campKey: 'p',
      nodeTemplateCode,
      operationType: 'tabulation',
      deliveryLineDTOList: data,
      asnItemLineList: lineItemDs?.toJSONData(),
      headerInfo: data,
    };
    loadingFlag(true);
    try {
      let res;
      switch (componentType) {
        case 'submit':
          res = await handleSaveList({}, 'submit', params);
          break;
        case 'delete':
          res = await handleDelete(params);
          break;
        default:
          res = await handleSaveList({}, 'submit', params);
          break;
      }
      if (getResponse(res)) {
        if (data?.length === tabCombine?.length) {
          notification.success();
          destroyEvent();
          history.push({
            pathname: `/slod/delivery-workbench/list`,
          });
        } else {
          notification.success();
          getlist();
        }
      } else {
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
          formDs.query(undefined, undefined, true).then((rec) => {
            const data = tabCombine?.map((n) => {
              if (rec[_headerId] === n[_headerId]) {
                return {
                  ...n,
                  ...rec,
                };
              } else {
                return n;
              }
            });
            setTabList(data);
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

  const loadingDs = (_ds, flag) => {
    // eslint-disable-next-line no-param-reassign
    _ds.status = !!flag === true ? 'submitting' : 'ready';
  };

  // 勾选唯一标签
  const lineBuilder = async (select, dataSet) => {
    const headerInfo = formDs?.current?.toData();
    const lineList = select.map((item) => item.toJSONData());
    const addFlag = lineList.every((i) => i[lineId[nodeTemplateCode]] !== null);
    Promise.all(select.map((i) => i.validate(true))).then(async (status) => {
      loadingDs(dataSet, false);
      if (status.findIndex((sta) => !sta) === -1) {
        loadingDs(dataSet, true);
        const params = {
          ...headerInfo,
          nodeTemplateCode,
          nodeConfigId,
          campKey: 'p',
          labelLineVOList: lineList,
        };
        if (addFlag) {
          const res = await handLineBuilder(params, tplInfo?.current);
          if (getResponse(res)) {
            lineDs.setState({ fieldMapValues: undefined });
            lineDs.setState({ batchData: {} });
            lineDs.clearCachedSelected();
            lineDs.unSelectAll();
            formDs.query().then((rec) => {
              const data = tabCombine?.map((n) => {
                if (rec[_headerId] === n[_headerId]) {
                  return {
                    ...n,
                    ...rec,
                  };
                } else {
                  return n;
                }
              });
              setTabList(data);
            });
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
    destroyEvent();
  };

  const basicProps = {
    formDs,
    lineDs,
    remote,
    headerId,
    lineItemDs,
    nodeConfigId,
    nodeTemplateCode,
    tplInfo: tplInfo.current || {},
    customizeForm: props?.customizeForm,
    customizeTable: props?.customizeTable,
    customizeBtnGroup: props.customizeBtnGroup,
    lineDelete,
    lineBuilder,
    loadingFlag,
    handleSaveList,
    doubleUnitEnabled,
  };

  const lineItemProps = {
    customizeTable: props.customizeTable,
    lineItemDs,
    nodeTemplateCode,
  };

  const uniqueProps = {
    lineDs,
    headerId,
    campKey: 'p',
    modalType: true,
    tplInfo: tplInfo.current || {},
    customizeTable: props.customizeTable,
  };

  const tabProps = {
    data: tabCombine,
    typeId: _headerId,
    instantlyId: headerId,
    nodeTitle: nodeConfigName,
    showName: { companyName: 'companyName', supplierName: 'supplierCompanyName' },
    receiptsCod,
    queryChangeBack,
  };

  const subSourceContent = useMemo(
    () => (
      <Menu onClick={(key) => operationChangeComposite(key, 'submit')}>
        <Menu.Item key="instantly">
          {intl.get('sinv.receiptWorkbench.view.title.detail.submitInstantly').d('提交当前单据')}
        </Menu.Item>
        <Menu.Item key="all">
          {intl.get('sinv.receiptWorkbench.view.title.detail.submitAll').d('提交所有单据')}
        </Menu.Item>
        <Menu.Item>
          <CompositeComposite
            data={tabCombine}
            title={intl
              .get('sinv.receiptWorkbench.view.title.detail.submitPortion')
              .d('提交部分单据')}
            btnTitle={intl.get('hzero.common.button.submit').d('提交')}
            compositeChange={(a, b) => {
              compositeChange(a, b);
            }}
            componentType="submit"
            multipurposeId={_headerId}
            receiptsCod={receiptsCod}
          />
        </Menu.Item>
      </Menu>
    ),
    [tabCombine, headerId]
  );

  const delSourceContent = useMemo(
    () => (
      <Menu onClick={(key) => operationChangeComposite(key, 'delete')}>
        <Menu.Item key="instantly">
          {intl.get('sinv.receiptWorkbench.view.title.detail.deleteInstantly').d('删除当前单据')}
        </Menu.Item>
        <Menu.Item key="all">
          {intl.get('sinv.receiptWorkbench.view.title.detail.deleteAll').d('删除所有单据')}
        </Menu.Item>
        <Menu.Item key="one">
          <CompositeComposite
            data={tabCombine}
            nodeTitle={nodeConfigName}
            title={intl
              .get('sinv.receiptWorkbench.view.title.detail.deletePortion')
              .d('删除部分单据')}
            btnTitle={intl.get(`hzero.common.button.delete`).d('删除')}
            compositeChange={compositeChange}
            componentType="delete"
            multipurposeId={_headerId}
            receiptsCod={receiptsCod}
          />
        </Menu.Item>
      </Menu>
    ),
    [tabCombine, headerId, nodeConfigName]
  );

  const linkKeys = useMemo(
    () => [
      'basicInfo',
      'receipShipment',
      'receipReceiving',
      'list',
      'asnLineItemTable',
      'receipAttachment',
      'uniqueLineList',
      'asnLineItemTable',
    ],
    []
  );

  return (
    <Fragment>
      {nodeTemplateCode === 'ASN' && <Affix linkKeys={linkKeys} />}
      <Header
        title={`${intl.get('hzero.common.model.create').d('新建')}-${nodeConfigName}`}
        backPath="/slod/delivery-workbench/list"
        onBack={() => onBack()}
      >
        {/* <DynamicButtons buttons={headerBtns()} /> */}
        <Dropdown
          onVisibleChange={(flag) => subVisibleChange(flag)}
          overlay={subSourceContent}
          trigger="hover"
          visible={subVisible}
          hidden={subVisible}
        >
          <Button
            icon="check"
            color="primary"
            style={{ border: 'none', color: '#FFF' }}
            loading={menuLoading || false}
            // className={styles['primary-unique-btn']}
          >
            {intl.get('hzero.common.button.submit').d('提交')} <Icon type="expand_more" />
          </Button>
        </Dropdown>
        <Button
          icon="save"
          type="c7n-pro"
          funcType="flat" // hover
          loading={menuLoading || false}
          onClick={handleSaveList}
          style={{ border: 'none' }}
        >
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
        <Dropdown
          onVisibleChange={(flag) => delVisibleChange(flag)}
          overlay={delSourceContent}
          visible={delVisible}
          hidden={delVisible}
          trigger="hover"
        >
          <Button icon="delete" style={{ border: 'none' }} loading={menuLoading || false}>
            {intl.get(`hzero.common.button.delete`).d('删除')} <Icon type="expand_more" />
          </Button>
        </Dropdown>
        {typeof cuxHanscncImportandExportBtns === 'function' &&
          nodeTemplateCode === 'ASN' &&
          cuxHanscncImportandExportBtns({ formDs, lineDs, lineItemDs, campKey: 'p' })}
      </Header>
      <div
        className={classnames(styles['slod-new-detail-content'])}
        style={{ overflowY: 'auto', padding: '0px', margin: '0px' }}
        id="delivery-workspace-detail-containe"
      >
        <div className={styles.fa}>
          <div className={styles.son}>
            <Spin
              spinning={waitCustomize || menuLoading}
              wrapperClassName={DETAIL_DEFAULT_CLASSNAME}
            >
              <CombineTabComponent {...tabProps} />
              <div id="detcontent" className={styles['det-content']}>
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
                      header={intl
                        .get(`slod.deliveryWorkbench.view.title.uniqueLine`)
                        .d('唯一标签行')}
                    >
                      <UniqueLineList ref={labelLineRef} {...uniqueProps} />
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
              </div>
            </Spin>
          </div>
        </div>
      </div>
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
      code: 'SLOD_PRDETAIL_REMOTE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
      name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
    },
    {
      process: {
        cuxHanscncImportandExportBtns: undefined,
      },
    }
  )
)(TabCreate);
