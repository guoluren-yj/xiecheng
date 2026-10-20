/*
 * Change - 订单明细页-订单变更
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Fragment, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { DataSet, Modal } from 'choerodon-ui/pro';
import { Button } from 'components/Permission';
import BigNumber from 'bignumber.js';
import { Spin, Collapse } from 'choerodon-ui';
import { math } from 'choerodon-ui/dataset';
import { compose, isEmpty, isArray } from 'lodash';
import { observer } from 'mobx-react-lite';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import remotes from 'utils/remote';
import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { resetSearchBarCache } from '_components/SearchBarTable/util/cache';

import DynamicButtons from '_components/DynamicButtons';
import AttachmentInfo from '@/routes/components/AttachmentInfo';
import C7nOperationApprove from '@/routes/components/C7nOperationApprove';
import OrderAffix from '@/routes/components/OrderAffix';
import { giftInfoDsConfig, GiftInfo } from '@/routes/components/GiftInfo';
import PaymentTermInfo, { paymentTermInfo } from '@/routes/components/PaymentTermInfo';
import {
  priceUpdateList,
  fetchChangeFields,
  submitChangeOrder,
  fetchNewPriceLibData,
  fetchDefaultLovValue,
  fetchNewPriceLibEnable,
  fetchItemNewPriceLibEnable,
  getConfigField,
  fetchAutoGetCompany,
  addNewChangeSubmitDetail,
  fetchVerifyContract,
} from '@/services/orderWorkspaceService';
import {
  openTermsModal,
  queryCalcRuleConfig,
  handleBudgetVerificationPro,
  validateLineCalculate,
  queryCommonDoubleUomConfig,
  getPaymentPlanConfig,
  getDisplayDocAndDocFlow,
  getRecordData,
  validateDoubleUom,
  associatedPcAndAmountCheck,
  handleOpenFundTermIdDetail,
} from '@/routes/components/utils';
import DetailInfo from './DetailInfo';
import OrganizationInfo from './OrganizationInfo';
import BasicInfo from './BasicInfo';
import { basicInfo, organizationInfo, detailInfo, batchMaintenance } from './store/changeDs';
import remoteConfig from './remote';
import styles from '../index.less';

const organizationId = getCurrentOrganizationId();
const prefix = 'sodr.workspace';
const { Panel } = Collapse;
const defaultActiveKey = [
  'basicInfo',
  'organizationInfo',
  'detailInfo',
  'giftInfo',
  'paymentTermInfo',
];
const Change = (props) => {
  const {
    history,
    match: {
      params: { id },
    },
    location: { state: { source, sourceType, sourceId } = {} },
    custConfig,
    customizeForm,
    customizeTable,
    customizeBtnGroup,
    customizeCollapse,
    remote,
  } = props;
  const { event } = remote;
  // 仅埋点二开部分使用 方便与标准交互
  const remoteRef = useRef({});
  const [loadings, setLoadings] = useState({});
  const [displayDocAndDocFlow, setDisplayDocAndDocFlow] = useState({}); // 单据流与关联单据显示配置
  const [attachment, setAttachment] = useState(true);

  const [purchaserInnerAttachment, setPurchaserInnerAttachment] = useState(true);

  const backPath = useMemo(
    () =>
      source === 'all'
        ? `/sodr/order-workspace/detail/all-orders/${id}`
        : sourceType === 'copy'
        ? `/sodr/order-workspace/detail/all-orders/${sourceId}`
        : '/sodr/order-workspace/list',
    [source, sourceType]
  );
  const basicInfoDs = useMemo(
    () =>
      new DataSet({
        ...remote?.process('getBasicInfoDs', basicInfo({ remote })),
        transport: {
          read: () => {
            return {
              url: `${SRM_SPUC}/v1/${organizationId}/po-header/${id}/change-detail`,
              method: 'GET',
            };
          },
        },
      }),
    []
  );
  const organizationInfoDs = useMemo(() => new DataSet(organizationInfo()), []);
  const detailInfoDs = useMemo(
    () =>
      new DataSet({
        ...remote?.process('getDetailInfoDs', detailInfo({ remote })),
        transport: {
          read: () => {
            return {
              url: `${SRM_SPUC}/v1/${organizationId}/po-line/${id}/change-detail`,
              method: 'GET',
            };
          },
        },
      }),
    []
  );
  const giftInfoDs = useMemo(() => new DataSet(giftInfoDsConfig({ poHeaderId: id })), [id]);
  const paymentTermInfoDs = useMemo(() => new DataSet(paymentTermInfo()), [id]);
  const basicCurrent = basicInfoDs.current;
  const {
    statusCode: orderStatusCode,
    giftFlag,
    ouId,
    companyId,
    oldTermHideFlag,
    fundTermDimension,
  } = basicCurrent.get([
    'statusCode',
    'giftFlag',
    'ouId',
    'companyId',
    'oldTermHideFlag',
    'fundTermDimension',
  ]);
  // 订单状态
  const statusCode = useMemo(() => id && orderStatusCode, [id, orderStatusCode]);
  // 是否展示赠品行
  const hasGift = useMemo(() => {
    return id && giftFlag;
  }, [id, giftFlag]);
  const attachmentConfig = useMemo(
    () => ({
      readOnly: [purchaserInnerAttachment, attachment, 1],
    }),
    [purchaserInnerAttachment, attachment]
  );

  const batchMaintenanceDs = useMemo(() => new DataSet(batchMaintenance()), []);
  // 获取业务规则定义个性化字段是否可修改价格库价格
  const getConfigFields = async () => {
    loading({ getConfigFields: true });
    const res = getResponse(await getConfigField());
    loading({ getConfigFields: false });
    if (res) {
      useSetstate({ newPriceLibFields: res });
    }
  };

  const setChangeFlag = () => {
    basicInfoDs.setState('changeFlag', true);
  };

  // 价格库相关字段处理
  const setPriceLibField = (data, record, entry) => {
    if (data && !isEmpty(data) && (record.get('priceLibraryId') || data.priceLibId)) {
      const {
        uomId,
        uomCode,
        uomName,
        uomCodeAndName,
        currencyCode,
        taxId,
        taxRate,
        netPrice,
        priceLibId,
        taxIncludedPrice,
        unitPriceBatch,
        holdPcHeaderId,
        holdPcLineId,
        contractNum,
        benchmarkPriceType,
        ladderPriceLibId,
        ladderQuotationFlag,
        sourceFromId, // 价格来源单据头id
        sourceFrom, // 价格来源
        sourceFromLnId, // 报价行id
        sourceFromLnNum, // 价格来源单据行号
        sourceFromNum, // 价格来源单据号 | 寻源单号
        defaultPrecision,
        priceToPoMappingFields = [],
        priceToPoMappingResult = {},
        callRecordId, // 取价记录id
        ladderPriceLibList = [],
      } = data;
      const setPriceFields = {
        uomId: uomId
          ? {
              uomId,
              uomName,
              uomCode,
              uomCodeAndName,
            }
          : null,
        currencyCode: currencyCode ? { currencyCode, defaultPrecision } : undefined,
        taxId: {
          taxId,
          taxRate,
        },
        unitPrice: netPrice,
        enteredTaxIncludedPrice: taxIncludedPrice,
        unitPriceBatch,
        priceLibraryId: priceLibId,
        priceTaxId: taxId,
        contractNum,
        originUnitPrice: benchmarkPriceType === 'NET_PRICE' ? netPrice : taxIncludedPrice,
        holdPcHeaderId,
        holdPcLineId,
        benchmarkPriceType,
        ladderPriceLibId,
        ladderQuotationFlag,
        priceId: sourceFromId,
        priceSource: sourceFrom,
        priceSourceNum: sourceFromNum,
        priceSourceLineNum: sourceFromLnNum,
        priceLineId: sourceFromLnId,
        callRecordId, // 取价记录id
      };
      if (detailInfoDs.getState('verifyContract')) {
        // 协议价带出关联采购协议优先级高于手工选则
        setPriceFields.pcSubjectId = {
          pcSubjectId: holdPcLineId,
          pcHeaderId: holdPcHeaderId,
          pcNumAndDisplayLineNum: contractNum,
        };
      }
      // 参考价格弹窗带出
      if (entry === 'referPrice') {
        const quantity = record.get('quantity');
        const ladderPriceRecord = ladderPriceLibList.find(
          (item) =>
            math.gte(new BigNumber(quantity), new BigNumber(item.ladderFrom)) &&
            math.lt(new BigNumber(quantity), new BigNumber(item.ladderTo || Infinity))
        );
        const unitPrice = ladderPriceRecord ? ladderPriceRecord.ladderNetPrice : netPrice;
        const enteredTaxIncludedPrice = ladderPriceRecord
          ? ladderPriceRecord.ladderPrice
          : taxIncludedPrice;
        delete setPriceFields.callRecordId;
        Object.assign(setPriceFields, {
          unitPrice,
          enteredTaxIncludedPrice,
          originUnitPrice: benchmarkPriceType === 'NET_PRICE' ? unitPrice : enteredTaxIncludedPrice,
          referencePriceFlag: 1,
        });
      }
      if (priceToPoMappingFields && isArray(priceToPoMappingFields)) {
        priceToPoMappingFields.forEach((fieldName) => {
          const lineField = detailInfoDs.getField(fieldName);
          if (lineField && lineField.type === 'object') {
            const disabled = lineField.get('disabled');
            if (!disabled) {
              const textField = lineField.get('textField');
              const valueField = lineField.get('valueField');
              setPriceFields[fieldName] = {
                [valueField]: priceToPoMappingResult[fieldName],
                [textField]: priceToPoMappingResult[`${fieldName}Meaning`],
              };
            }
          } else {
            setPriceFields[fieldName] = priceToPoMappingResult[fieldName];
          }
        });
      }
      record.set(
        remote
          ? remote.process('setPriceFields', setPriceFields, { record, data, basicInfoDs })
          : setPriceFields
      );
    }
  };

  /**
   * 原币含税单价获取焦点事件
   * @param {object[]} record - 当前行的数据
   * @param {object[]} dataList - 选中物料带出的数据
   */
  const handleIncludedPriceFcous = (record) => {
    const newPriceLibFlag = basicInfoDs.getState('newPriceLibFlag');
    const poHeaderDetailDTO = basicInfoDs.toJSONData()[0];
    const values = record.toJSONData() || {};
    const { prLineId, ...others } = values;
    const poLineDetailDTOs = [
      {
        ...others,
        poLineId: record.status === 'add' ? -1 : record.get('poLineId'),
      },
    ];
    if (newPriceLibFlag === 1 && values.itemCode && values.freeFlag !== 1) {
      loading({ handleIncludedPriceFcous: true });
      fetchNewPriceLibData({
        poHeaderDetailDTO,
        poLineDetailDTOs,
        changePriceToPoMappingFlag: 1,
      }).then((res) => {
        loading({ handleIncludedPriceFcous: false });
        setPriceLibField(res, record);
      });
    }
  };

  // 引用最新价格
  const handleUpdatePrice = () => {
    const { selected } = detailInfoDs;
    const selectedData = selected.map((i) => i.toJSONData());
    loading({ priceUpdateList: true });
    priceUpdateList({
      poHeaderDetailDTO: {
        ...basicInfoDs.toJSONData()[0],
      },
      poLineDetailDTOs: selectedData,
    })
      .then((res) => {
        if (getResponse(res) && isArray(res)) {
          notification.success();
          res.forEach((i) => {
            const currenrRecord = detailInfoDs.find((record) => {
              const { poLineId, businessKey } = record.get(['poLineId', 'businessKey']);
              return i.poLineId ? poLineId === i.poLineId : businessKey === i.businessKey;
            });
            if (currenrRecord) {
              setPriceLibField(i, currenrRecord);
            }
          });
        }
      })
      .finally(() => {
        loading({ priceUpdateList: false });
      });
  };

  const getValues = useCallback(() => {
    // const orgCurrent = organizationInfoDs.current;
    // const orgData = getRecordData(orgCurrent);
    const paymentTermData = getRecordData(paymentTermInfoDs.current);
    const poHeaderDetailDTO = {
      poWorkbenchFlag: 1,
      ...basicInfoDs.toJSONData()[0],
      // 暂时与之前保持一致 有需要再加
      // ...organizationInfoDs.toJSONData()[0],
      // ...orgData,
      ...paymentTermData,
    };
    const poLineDetailDTOs = detailInfoDs.all.map((i) => {
      return {
        ...i.toJSONData(),
        poLineId: i.status === 'add' ? null : i.get('poLineId'),
      };
    });
    const fieldMap = detailInfoDs.getState('fieldMap');
    const values = {
      poHeaderDetailDTO,
      poLineDetailDTOs,
    };
    if (fieldMap) {
      values.fieldMap = {
        ...fieldMap,
        unitCode: 'SODR.WORKSPACE_CHANGE_DETAIL.BATCHEDIT',
      };
    }
    return values;
  }, [basicInfoDs, organizationInfoDs, detailInfoDs]);

  /**
   * 设置价格
   */
  const setPrice = useCallback(
    (ds) => {
      const { selected } = ds;
      if (isEmpty(selected)) return;
      const val = selected[0].toJSONData();
      const record = detailInfoDs.current;
      const doubleUnitEnabled = detailInfoDs.getState('doubleUnitEnabled');
      if (val && val.priceLibId) {
        const { uomId, uomCode, uomName, uomCodeAndName } = val;
        const uomObj = uomId && { uomId, uomName, uomCode, uomCodeAndName };
        const lineUomId = record.get('uomId')?.uomId;
        if (
          doubleUnitEnabled &&
          !validateDoubleUom({
            remote,
            price: val,
            record,
            lineUomId,
            sodrEnabled: doubleUnitEnabled,
            type: 'c7n',
          })
        ) {
          return false;
        }
        if (!doubleUnitEnabled) {
          record.set({ secondaryUomId: uomObj });
        }
        setPriceLibField(val, record, 'referPrice');
      }
    },
    [remote]
  );

  // 是否通过物料引用新价格库
  const fetchItemNewPriceLib = () => {
    loading({ fetchItemNewPriceLib: true });
    fetchItemNewPriceLibEnable({
      poHeaderId: id,
    }).then((res) => {
      loading({ fetchItemNewPriceLib: false });
      if (getResponse(res)) {
        basicInfoDs.setState({ itemChangePriceFlag: res });
      }
    });
  };

  const useSetstate = (state = {}) => {
    [basicInfoDs, organizationInfoDs, detailInfoDs, batchMaintenanceDs, paymentTermInfoDs].forEach(
      (i) => {
        i.setState(state);
      }
    );
  };

  useEffect(() => {
    resetSearchBarCache('SODR.WORKSPACE_PURCHASEREQUEST.SEARCH', 'order_change_detail');
    useSetstate({
      loading,
      basicInfoDs,
      detailInfoDs,
      organizationInfoDs,
      doubleUnitEnabled: 0,
      changeFlag: false,
      handleIncludedPriceFcous,
      getValues,
    });
    fetchDoubleUom();
    getConfigFields();
    fetchAmountCalc();
    getDisplayDocAndDocFlow(setDisplayDocAndDocFlow);
    getVerifyContract();
    if (id) {
      loading({ all: true });
      fetchNewPriceLib();
      fetchItemNewPriceLib();
      basicInfoDs.query().then((res) => {
        loading({ all: false });
        if (res) {
          const { outsourceOrderFlag, sourceBillTypeCode } = res;
          organizationInfoDs.loadData([res]);
          paymentTermInfoDs.loadData([res]);
          fetchDefaultLineOrg();
          if (res.giftFlag) {
            giftInfoDs.query();
          }
          if (outsourceOrderFlag === 1 && sourceBillTypeCode === 'PURCHASE_ORDER') {
            getDefaultprojectCategory();
          }
        }
      });
      // detailInfoDs.query();
      getChangeFields();
    }
  }, []);

  // 查询业务规则定义双单位配置
  const fetchDoubleUom = async () => {
    loading({ fetchDoubleUom: true });
    const res = await queryCommonDoubleUomConfig();
    useSetstate({ doubleUnitEnabled: Number(res) });
    loading({ fetchDoubleUom: false });
  };

  // 查询业务规则定金额计算配置
  const fetchAmountCalc = async () => {
    loading({ fetchAmountCalc: true });
    const res = await queryCalcRuleConfig();
    useSetstate({ amountCalcRule: res });
    loading({ fetchAmountCalc: false });
  };

  const loading = (state = {}) => {
    setLoadings((preState) => ({ ...preState, ...state }));
  };

  // 是否开启新价格库
  const fetchNewPriceLib = () => {
    loading({ fetchNewPriceLib: true });
    fetchNewPriceLibEnable({
      poHeaderId: id,
    }).then((res) => {
      loading({ fetchNewPriceLib: false });
      if (getResponse(res)) {
        basicInfoDs.setState({ newPriceLibFlag: res });
      }
    });
  };

  const getVerifyContract = async () => {
    const res = getResponse(await fetchVerifyContract());
    if (res) {
      const { controlPc } = res;
      useSetstate({ verifyContract: controlPc });
    }
  };

  const getChangeFields = () => {
    const subStr = (str) => {
      const re = /_(\w)/g;
      return str.replace(re, ($0, $1) => {
        return $1.toUpperCase();
      });
    };
    fetchChangeFields().then((res) => {
      const result = getResponse(res);
      if (result) {
        const canChangeFields = result.filter((item) => item.canModifyFlag === 1);
        const bomChangeFieldsList = [];
        const changeFieldsList = canChangeFields.map((item) => {
          const { fieldName = '', tableName = '' } = item;
          const formatFieldName = subStr(fieldName);
          if (tableName === 'SODR_PO_ITEM_BOM') {
            // 避免bom字段与行字段名重复
            bomChangeFieldsList.push(formatFieldName);
            return null;
          }
          if (tableName === 'SODR_PO_HEADER' && formatFieldName === 'remark') {
            return 'headerRemark';
          } else if (tableName === 'SODR_PO_LINE' && formatFieldName === 'attachmentUuid') {
            return 'lineAttachmentUuid';
          } else {
            return formatFieldName;
          }
        });
        for (const item of changeFieldsList) {
          if (item === 'attachmentUuid') {
            setAttachment(false);
          } else if (item === 'purchaserInnerAttachmentUuid') {
            setPurchaserInnerAttachment(false);
          }
        }
        useSetstate({ changeFieldsList, bomChangeFieldsList });
      }
    });
  };

  const handleSubmit = async () => {
    const validateList = [organizationInfoDs, basicInfoDs, detailInfoDs, paymentTermInfoDs];
    if (!validateLineCalculate({ data: detailInfoDs, type: 'c7n' })) return;
    const basicDsCurrent = basicInfoDs?.current || {};
    const { paymentPlanNum, displayPoNum, termsCode } = basicDsCurrent.get([
      'paymentPlanNum',
      'displayPoNum',
      'termsCode',
    ]);
    const isNotModified =
      !validateList.map((i) => i.dirty).includes(true) && !basicInfoDs.getState('changeFlag');
    if (
      remote.process('handleSubmitNotModified', isNotModified, {
        basicInfoDs,
        organizationInfoDs,
        detailInfoDs,
        remoteRef,
      })
    ) {
      notification.warning({
        message: intl.get(`sodr.workspace.view.message.noModifyData`).d('未修改任何数据'),
      });
      return;
    }
    const status = await Promise.all(validateList.map((i) => i.validate()));
    if (status.findIndex((i) => !i) === -1) {
      const { poHeaderDetailDTO, poLineDetailDTOs, fieldMap } = getValues();
      const data = {
        fieldMap,
        poHeaderId: basicInfoDs?.current?.get('poHeaderId'),
        poHeaderDetailDTO,
        poLineDetailDTOs,
        customizeUnitCode: String([
          'SODR.WORKSPACE_CHANGE_DETAIL.BASICINFO',
          'SODR.WORKSPACE_CHANGE_DETAIL.ORGANIZATIONINFO',
          'SODR.WORKSPACE_CHANGE_DETAIL.DETAILINFO',
          'SODR.WORKSPACE_CHANGE_DETAIL.ATTACHMENTINFO',
          'SODR.WORKSPACE_CHANGE_DETAIL.ATTACHMENTINFO_EXTERNAL',
          'SODR.WORKSPACE_CHANGE_DETAIL.PAYMENTTERMINFO',
        ]),
      };
      const poLineExpVOList =
        data.poLineDetailDTOs &&
        data.poLineDetailDTOs.map((item) => ({
          ...item,
          viewCode: 'CHANGE_VIEW',
        }));
      const param = [
        {
          ...data.poHeaderDetailDTO,
          poLineExpVOList,
        },
      ];
      const startSubmitRes = await event.fireEvent('startSubmit', {
        basicInfoDs,
        detailInfoDs,
        organizationInfoDs,
        paymentTermInfoDs,
        remoteRef,
        budgetVerificationData: param,
        data,
      });
      if (!startSubmitRes) return;
      const associaParams = [
        { ...data.poHeaderDetailDTO, poLineExpVOList: poLineDetailDTOs, fieldMap, saveFlag: 1 },
      ];
      const associatedPcAndAmountCheckRes = await associatedPcAndAmountCheck(
        3,
        remote
          ? remote.process('SODR.WORKSPACE_CHANGE_DETAIL_PROCESS_CHECK_DATA', associaParams, {
              data,
              param,
            })
          : associaParams
      );
      if (!associatedPcAndAmountCheckRes) return;
      const submit = async () => {
        const newData = remote
          ? remote.process('SODR.WORKSPACE_CHANGE_DETAIL_PROCESS_SUBMIT_DATA', data)
          : data;
        const beforSubmitRes = await event.fireEvent('beforSubmit', {
          basicInfoDs,
          detailInfoDs,
          data: newData,
          backPath,
          budgetVerificationData: param,
        });
        if (!beforSubmitRes) return;
        const fundTermIdDetailRes = await handleOpenFundTermIdDetail('change-submit', {
          ds: paymentTermInfoDs,
          body: newData,
        });
        if (!fundTermIdDetailRes) return;
        const { fundPageParam } = fundTermIdDetailRes;
        const res = await submitChangeOrder({ ...newData, fundPageParam });
        const result = getResponse(res);
        if (result) {
          notification.success();
          history.push({
            pathname: backPath,
            state: { _back: -1 },
          });
        } else {
          return false;
        }
      };
      const handleBudget = async () => {
        const res = await handleBudgetVerificationPro(param, submit, {
          loading,
          key: 'submit',
          remote,
          data,
        });
        return !!getResponse(res);
      };
      if (
        paymentPlanNum &&
        (await getPaymentPlanConfig({
          sourceCode: 'ORDER',
          sourceDisplayNum: displayPoNum,
          termNum: termsCode,
        }))
      ) {
        const termsRes = await openTermsModal(
          { type: 'changeSubmit', record: basicDsCurrent },
          data
        );
        if (!termsRes) return;
      }
      const ras = await addNewChangeSubmitDetail(data);
      if (getResponse(ras)) {
        if (getResponse(ras).value) {
          const confirmModalProps = remote.process('getConfirmModalProps', {
            data: ras,
            basicInfoDs,
            type: 'change',
          });
          const modalRes = await Modal.confirm({
            className: styles['batch-submit-modal'],
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            children: (
              <div
                className={styles['submit-tip']}
                // eslint-disable-next-line
                dangerouslySetInnerHTML={{ __html: ras.message }}
              />
            ),
            okText: intl.get('hzero.common.button.sure').d('确定'),
            cancelText: intl.get('hzero.common.button.cancel').d('取消'),
            ...confirmModalProps,
          });
          if (modalRes !== 'ok') return;
        }
        await handleBudget();
      }
    }
  };
  const handleRecord = () => {
    const modal = Modal.open({
      key: Modal.key(),
      title: intl.get(`${prefix}.view.title.operationHistory`).d('操作记录'),
      drawer: true,
      destroyOnClose: true,
      style: { width: 800 },
      children: <C7nOperationApprove poHeaderId={id} modal={modal} />,
      onOk: () => {},
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  // const comfirmHandleRevoke = () => {
  //   const { poHeaderId } = basicInfoDs.toJSONData()[0];
  //   Modal.confirm({
  //     title: intl.get('sodr.common.model.common.confirmRevoke').d('是否确认撤销变更'),
  //     okText: intl.get('sodr.common.button.sure').d('确定'),
  //     cancelText: intl.get('sodr.common.button.cancel').d('取消'),
  //     onOk: () => {
  //       loading({ revoke: true });
  //       handleRevoke({ poHeaderId }).then((res) => {
  //         loading({ revoke: false });
  //         if (!res?.failed) {
  //           history.push({
  //             pathname: backPath,
  //           });
  //           return;
  //         }
  //         notification.error({ message: res.message });
  //       });
  //     },
  //   });
  // };

  // 获取默认项目类别字段
  const getDefaultprojectCategory = () => {
    fetchDefaultLovValue({ lovCode: 'SPUC.PR_LINE_PROJECT_CATEHORY', value: 'L' }).then((res) => {
      if (res && getResponse(res)) {
        const { value, meaning } = res.content[0] || {};
        detailInfoDs.setState({
          defaultProjectCategory: value,
          defaultProjectCategoryMeaning: meaning,
        });
      }
    });
  };

  // 获取默认库存组织信息
  const fetchDefaultLineOrg = async () => {
    const res = await fetchAutoGetCompany({
      ouId,
      companyId,
    });
    if (getResponse(res)) {
      const { organizationId: defaultOrgId, organizationName: defaultOrgName } = res;
      detailInfoDs.setState({
        defaultOrgId,
        defaultOrgName,
      });
    }
  };

  const HeaderBtns = observer(() => {
    const headerBtnLoading =
      loadings.submitDetail ||
      loadings.submit ||
      basicInfoDs.status !== 'ready' ||
      detailInfoDs.status !== 'ready';
    const buttons = [
      {
        name: 'submit',
        type: 'c7n-pro',
        btnComp: Button,
        child: intl.get(`sodr.workspace.view.button.submit`).d('提交'),
        btnProps: {
          wait: THROTTLE_TIME,
          color: 'primary',
          icon: 'check',
          type: 'c7n-pro',
          onClick: async () => {
            basicInfoDs.status = 'submitting';
            await handleSubmit();
            basicInfoDs.status = 'ready';
          },
          loading: headerBtnLoading,
          disabled: !['APPROVED', 'REJECTED', 'PUBLISHED', 'CONFIRMED', 'PART_FEED_BACK'].includes(
            statusCode
          ),
          permissionList: [
            {
              code: 'srm.po-admin.po.order-workspace.ps.button.changedetail.submit',
              type: 'c7n-pro',
              meaning: '订单工作台-变更明细-提交',
            },
          ],
        },
      },
      {
        name: 'operationRecord',
        type: 'c7n-pro',
        btnComp: Button,
        child: intl.get('sodr.workspace.view.button.operationRecord').d('操作记录'),
        btnProps: {
          icon: 'operation_service_request',
          funcType: 'flat',
          type: 'c7n-pro',
          onClick: () => handleRecord(),
          permissionList: [
            {
              code: 'srm.po-admin.po.order-workspace.ps.button.changedetail.record',
              type: 'c7n-pro',
              meaning: '订单工作台-变更明细-操作记录',
            },
          ],
        },
      },
      // basicInfoDs?.toJSONData()[0]?.statusCode === 'REJECTED' &&
      //   basicInfoDs?.toJSONData()[0]?.changeSyncStatus === 'SUCCESS' && {
      //     name: 'revoke',
      //     type: 'c7n-pro',
      //     btnComp: Button,
      //     child: intl.get(`sodr.common.model.common.revoke`).d('撤销变更'),
      //     btnProps: {
      //       icon: 'close',
      //       funcType: 'flat',
      //       type: 'c7n-pro',
      //       onClick: () => comfirmHandleRevoke(),
      //       loading: loadings.revoke,
      //       permissionList: [
      //         {
      //           code: 'srm.po-admin.po.order-workspace.ps.button.changedetail.revoke',
      //           type: 'c7n-pro',
      //           meaning: '订单工作台-变更明细-撤销变更',
      //         },
      //       ],
      //     },
      //   },
    ];
    return customizeBtnGroup(
      { code: 'SODR.WORKSPACE_CHANGE_DETAIL.BUTTONS', pro: true },
      <DynamicButtons buttons={buttons} />
    );
  });
  return (
    <Fragment>
      <OrderAffix />
      <Header
        backPath={backPath}
        title={intl.get('sodr.workspace.view.title.orderDetails').d('订单明细')}
      >
        <HeaderBtns />
      </Header>
      <div
        className={styles['order-workspace-detail-container']}
        id="order-workspace-detail-container"
      >
        <Spin spinning={loadings.all}>
          {customizeCollapse(
            {
              code: 'SODR.WORKSPACE_CHANGE_DETAIL.COLLAPSE',
            },
            remote.process('processCollapse', {
              Component: Collapse,
              props: {
                trigger: 'text-icon',
                ghost: true,
                expandIconPosition: 'text-right',
                defaultActiveKey,
              },
              children: [
                <Panel
                  key="basicInfo"
                  id="order-workSpace-detail-content-basicInfo"
                  header={intl.get('sodr.workspace.view.panel.orderBasicInfo').d('订单基础信息')}
                >
                  <BasicInfo
                    ds={basicInfoDs}
                    custConfig={custConfig}
                    customizeForm={customizeForm}
                    remote={remote}
                  />
                </Panel>,
                <Panel
                  key="organizationInfo"
                  id="order-workSpace-detail-content-organizationInfo"
                  header={intl
                    .get('sodr.workspace.view.panel.organization')
                    .d('交易方及采买组织信息')}
                >
                  <OrganizationInfo
                    ds={organizationInfoDs}
                    customizeForm={customizeForm}
                    remote={remote}
                  />
                </Panel>,
                <Panel
                  key="detailInfo"
                  id="order-workSpace-detail-content-detailInfo"
                  header={intl.get('sodr.workspace.view.panel.detailInfo').d('订单明细信息')}
                  extra={
                    remote
                      ? remote.render('SODR.WORKSPACE_CHANGE_DETAIL_RENDER_PANEL_DETAIL', null, {
                          detailInfoDs,
                          props,
                        })
                      : null
                  }
                >
                  <DetailInfo
                    remote={remote}
                    customizeForm={customizeForm}
                    ds={detailInfoDs}
                    basicInfoDs={basicInfoDs}
                    poHeaderId={id}
                    customizeTable={customizeTable}
                    customizeBtnGroup={customizeBtnGroup}
                    batchMaintenanceDs={batchMaintenanceDs}
                    loadings={loadings}
                    handleIncludedPriceFcous={handleIncludedPriceFcous}
                    handleUpdatePrice={handleUpdatePrice}
                    setChangeFlag={setChangeFlag}
                    displayDocAndDocFlow={displayDocAndDocFlow}
                    getValues={getValues}
                    setPrice={setPrice}
                    fundTermDimension={fundTermDimension}
                  />
                </Panel>,
                <Panel
                  hidden={!hasGift}
                  key="giftInfo"
                  id="order-workSpace-detail-content-giftInfo"
                  header={intl.get('sodr.workspace.view.panel.giftInfo').d('赠品明细信息')}
                >
                  <GiftInfo ds={giftInfoDs} />
                </Panel>,
                <Panel
                  hidden={!oldTermHideFlag}
                  key="paymentTermInfo"
                  id="order-workSpace-detail-content-paymentTermInfo"
                  header={intl
                    .get('sodr.workspace.view.panel.paymentTermInfo')
                    .d('订单付款条款信息')}
                >
                  <PaymentTermInfo
                    ds={paymentTermInfoDs}
                    source="change"
                    customizeForm={customizeForm}
                    customizeCode="SODR.WORKSPACE_CHANGE_DETAIL.PAYMENTTERMINFO"
                    getValues={getValues}
                    setChangeFlag={setChangeFlag}
                  />
                </Panel>,
              ],
              otherProps: {
                id,
                basicInfoDs,
                organizationInfoDs,
                detailInfoDs,
                paymentTermInfoDs,
                remoteRef,
              },
            })
          )}
          <Content className={styles['order-workspace-detail-content']}>
            <AttachmentInfo
              ds={basicInfoDs}
              poHeaderId={id}
              attachmentConfig={attachmentConfig}
              customizeForm={customizeForm}
              type="change"
              customizeCode={[
                'SODR.WORKSPACE_CHANGE_DETAIL.ATTACHMENTINFO',
                'SODR.WORKSPACE_CHANGE_DETAIL.ATTACHMENTINFO_EXTERNAL',
              ]}
              handleChangeAttachment={setChangeFlag}
            />
          </Content>
        </Spin>
      </div>
    </Fragment>
  );
};

export default compose(
  withCustomize({
    unitCode: [
      'SODR.WORKSPACE_CHANGE_DETAIL.BASICINFO',
      'SODR.WORKSPACE_CHANGE_DETAIL.ORGANIZATIONINFO',
      'SODR.WORKSPACE_CHANGE_DETAIL.DETAILINFO',
      'SODR.WORKSPACE_CHANGE_DETAIL.ATTACHMENTINFO',
      'SODR.WORKSPACE_CHANGE_DETAIL.ATTACHMENTINFO_EXTERNAL',
      'SODR.WORKSPACE_CHANGE_DETAIL.BUTTONS',
      'SODR.WORKSPACE_CHANGE_DETAIL.BATCHEDIT',
      'SODR.WORKSPACE_PURCHASEREQUEST.LIST',
      'SODR.WORKSPACE_SOURCINGRESULTS.LIST',
      'SODR.WORKSPACE_PURCHASEAGREEMENT.LIST',
      'SODR.WORKSPACE_CHANGE_DETAIL.LINE_BUTTONS',
      'SODR.WORKSPACE_CHANGE_DETAIL.SEARCH',
      'SODR.WORKSPACE_CHANGE_DETAIL.COLLAPSE',
      'SODR.WORKSPACE_CHANGE_DETAIL.BOM',
      'SODR.WORKSPACE_CHANGE_DETAIL.BATCHADDMODAL',
      'SODR.WORKSPACE_CHANGE_DETAIL.PAYMENTTERMINFO',
    ],
  }),
  formatterCollections({
    code: ['sodr.workspace', 'sodr.common', 'hpfm.customize'],
  }),
  observer,
  remotes(...remoteConfig)
)(Change);
