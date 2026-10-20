/*
 * @Date: 2023-08-31 09:39:06
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import querystring from 'querystring';
import { head, compose, isFunction } from 'lodash';
import { useDataSet, Spin, Modal, DataSet } from 'choerodon-ui/pro';
import React, { useEffect, useMemo, useState, useCallback } from 'react';

import intl from 'utils/intl';
import { Content } from 'components/Page';
import { AFBasic } from '_components/AFCards';
import notification from 'utils/notification';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { TopSection, SecondSection } from '_components/Section';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import ResultAlert from '@/routes/components/AiApprove/ResultAlert';
import {
  batchExtractDataSetData,
  batchInitDataSetByPlainData,
  batchSetDataSetByPlainData,
} from '_utils/workflow';

import commonStyles from '@/routes/index.less';
import { saveApplication } from '@/services/lifeCycleManageService';
import { getTooltipShow, renderStatus } from '@/routes/components/utils';
import { ReactComponent as DegradedIcon } from '@/assets/360Query/degraded.svg';
import { ReactComponent as UpgradeIcon } from '@/assets/360Query/upgrade.svg';
import { queryRelTableConfig } from '@/routes/components/DynamicTable/utils/service';
import { ReactComponent as IntelligentReviewIcon } from '@/assets/common/intelligentReview.svg';

import styles from './index.less';
import { Context } from '../Context';
import OtherInfo from './OtherInfo';
import HeaderBtns from './HeaderBtns';
import Attachment from './Attachment';
import Supplement from './Supplement';
import EnterpriseInfo from './EnterpriseInfo';
import LifeCycleTimeline from './LifeCycleTimeline';
import { getBaseInfoDS } from '../Documents/stores/getBaseInfoDS';
import { getSupplierAbilityDS } from '../Documents/stores/getSupplierAbilityDS';
import { getSupplierClassifyDS } from '../Documents/stores/getSupplierClassifyDS';
import { getPurchaseHeaderDS, getPurchaseLineDS } from '../Documents/stores/getPurchaseInfoDS';

const tenantId = getCurrentOrganizationId();
// 保存所需的个性化单元
const saveUnitCode = [
  'SSLM.LIFE_CYCLE.DOCUMENT_CUSTOM.STATUS',
  'SSLM.LIFE_CYCLE.DOCUMENT_CUSTOM.ATT_INFO',
  'SSLM.LIFE_CYCLE.DOCUMENT_CUSTOM.BASICS',
  'SSLM.LIFE_CYCLE.DOCUMENT_CUSTOM.OTHERS',
  'SSLM.LIFE_CYCLE.DOCUMENT_CUSTOM.PURCHASE_INFO',
  'SSLM.LIFE_CYCLE.DOCUMENT_CUSTOM.PURCHASE_LINE',
  'SSLM.LIFE_CYCLE.DOCUMENT_CUSTOM.SUPPLIER_ABILITY',
  'SSLM.LIFE_CYCLE.DOCUMENT_CUSTOM.SUPPLIER_CLASSIFY',
];

const Index = ({
  onLoad,
  dispatch,
  location,
  custLoading,
  customizeForm,
  customizeTable,
  customizeCommon,
  customizeBtnGroup,
  customizeTabPane,
  queryTemplateConfig,
  getHocInstance = () => {},
}) => {
  const [headerInfo, setHeaderInfo] = useState({});
  const [allLoading, setAllLoading] = useState(false);
  const [relTableList, setRelTableList] = useState([]);

  const routerParams = useMemo(() => querystring.parse(location.search.substr(1)), [
    location.search,
  ]);
  const {
    requisitionId,
    documentType,
    templateCode,
    templateVersion,
    stageCode,
    sourceType,
  } = routerParams;

  const baseInfoDs = useDataSet(() => getBaseInfoDS(), []);
  const purchaseLineDs = useDataSet(() => getPurchaseLineDS(), []);
  const purchaseHeaderDs = useDataSet(() => getPurchaseHeaderDS(), []);
  const supplierClassifyDs = useDataSet(() => getSupplierClassifyDS(), []);
  const supplierAbilityDs = useDataSet(() => getSupplierAbilityDS(), []);

  purchaseHeaderDs.bind(baseInfoDs, 'lifeCycleChangeSync');
  purchaseLineDs.bind(baseInfoDs, 'lifeCycleChangeSyncPfs');
  supplierAbilityDs.bind(baseInfoDs, 'lifeCycleChangeSupplyRecs');
  supplierClassifyDs.bind(baseInfoDs, 'lifeCycleChangeCtgAlterLines');

  const { aiApproveStatus, aiApproveDTOList } = headerInfo;
  const isNormal = documentType === 'NORMAL'; // 升降级申请单
  const pageCode = useMemo(
    () => (isNormal ? 'PROMOTION_DEMOTION_APPROVAL_DETAILS' : 'SPECIAL_APPROVAL_DETAILS'),
    [isNormal]
  );
  const supplementPageCode = useMemo(
    () => (isNormal ? 'PROMOTION_DEGRADATION_DEFAULT_SUPPLEMENT' : 'SPECIAL_DEFAULT_SUPPLEMENT'),
    [isNormal]
  );
  // 工作流单据样式表单阶段编码
  const wfParams = {
    cuszTplStageCode: stageCode,
    cuszTplPageCode: pageCode,
    cuszTplTemplateCode: templateCode,
    cuszTplVersion: templateVersion,
  };

  useEffect(() => {
    // 查询配置表
    queryRelTableConfig('sslm_life_cycle_manage').then(res => {
      setRelTableList(res);
    });
  }, []);

  useEffect(() => {
    handleQuery();
  }, [requisitionId]);

  useEffect(() => {
    const templateInfoPromise = new Promise(resolve => {
      resolve({
        templateCode,
        templateVersion,
      });
    });
    queryTemplateConfig(templateInfoPromise, {
      stageCode,
      pageCode,
    });
  }, [templateCode, templateVersion, stageCode, pageCode]);

  // 获取保存参数
  const getSaveParams = () => {
    const { lifeCycleChangeSync = [], ...others } = baseInfoDs.current.toJSONData() || {};

    const payload = {
      ...others,
      tenantId,
      wfParams,
      customizeUnitCode: saveUnitCode.join(','),
      lifeCycleChangeSync: head(lifeCycleChangeSync),
    };
    return payload;
  };

  const workflowSubmit = approveResult => {
    return new Promise(async (resolve, reject) => {
      if (approveResult === 'Approved') {
        const payload = getSaveParams();
        setAllLoading(true);
        saveApplication(payload)
          .then(response => {
            const res = getResponse(response);
            if (res) {
              resolve(res);
            } else {
              reject();
            }
          })
          .finally(() => {
            setAllLoading(false);
          });
      } else {
        resolve();
      }
    });
  };

  // 工作流审批通过调功能端保存
  useEffect(() => {
    if (isFunction(onLoad)) {
      onLoad({
        submit: workflowSubmit,
      });
    }
  }, [onLoad]);

  // 刷新数据
  const handleQuery = useCallback(() => {
    setAllLoading(true);
    baseInfoDs.setQueryParameter('queryParmas', {
      requisitionId,
      ...wfParams,
      customizeUnitCode: [
        'SSLM.LIFE_CYCLE.DOCUMENT_CUSTOM.BASICS',
        'SSLM.LIFE_CYCLE.DOCUMENT_CUSTOM.EXTRA',
        'SSLM.LIFE_CYCLE.DOCUMENT_CUSTOM.OTHERS',
        'SSLM.LIFE_CYCLE.DOCUMENT_CUSTOM.STATUS',
        'SSLM.LIFE_CYCLE.DOCUMENT_CUSTOM.ATT_INFO',
      ].join(),
    });
    supplierAbilityDs.setQueryParameter(
      'customizeUnitCode',
      'SSLM.LIFE_CYCLE.DOCUMENT_CUSTOM.SUPPLIER_ABILITY'
    );
    supplierClassifyDs.setQueryParameter(
      'customizeUnitCode',
      'SSLM.LIFE_CYCLE.DOCUMENT_CUSTOM.SUPPLIER_CLASSIFY'
    );
    purchaseHeaderDs.setQueryParameter(
      'customizeUnitCode',
      'SSLM.LIFE_CYCLE.DOCUMENT_CUSTOM.PURCHASE_INFO'
    );
    purchaseLineDs.setQueryParameter(
      'customizeUnitCode',
      'SSLM.LIFE_CYCLE.DOCUMENT_CUSTOM.PURCHASE_LINE'
    );
    baseInfoDs
      .query()
      .then(res => {
        if (res) {
          setHeaderInfo(res);
        }
      })
      .finally(() => {
        setAllLoading(false);
      });
  }, [requisitionId]);

  // 信息补录弹框
  const handleSupplement = async () => {
    const supplementBaseInfoDs = new DataSet(baseInfoDs.props);
    const supplementAbilityDs = new DataSet(supplierAbilityDs.props);
    const supplementClassifyDs = new DataSet(supplierClassifyDs.props);
    const supplementPurHeaderDs = new DataSet(purchaseHeaderDs.props);
    const supplementPurLineDs = new DataSet(purchaseLineDs.props);
    // 提取当前页面ds的数据
    const externalFromData = await batchExtractDataSetData([
      baseInfoDs,
      supplierAbilityDs,
      supplierClassifyDs,
      purchaseHeaderDs,
      purchaseLineDs,
    ]);
    // 用提取的数据初始化内部表单ds，并返回初始化前后record.id的对应关系
    const mappings = batchInitDataSetByPlainData(externalFromData, [
      supplementBaseInfoDs,
      supplementAbilityDs,
      supplementClassifyDs,
      supplementPurHeaderDs,
      supplementPurLineDs,
    ]);
    // 将初始化后的record.id与当前页面ds中record的对应关系转成map结构
    const initMappings = [new Map(), new Map(), new Map(), new Map(), new Map()];
    mappings.forEach((mapping, mappingIndex) => {
      mapping.forEach(([fromRecordId, targetRecordId]) => {
        initMappings[mappingIndex].set(targetRecordId, fromRecordId);
      });
    });
    Modal.open({
      drawer: true,
      key: Modal.key(),
      style: { width: 1090 },
      className: commonStyles['modal-tab'],
      title: intl.get('sslm.common.model.field.infoSupplement').d('信息补录'),
      children: (
        <Supplement
          stageCode={stageCode}
          templateCode={templateCode}
          pageCode={supplementPageCode}
          requisitionId={requisitionId}
          templateVersion={templateVersion}
          supplementBaseInfoDs={supplementBaseInfoDs}
          supplementAbilityDs={supplementAbilityDs}
          supplementClassifyDs={supplementClassifyDs}
          supplementPurHeaderDs={supplementPurHeaderDs}
          supplementPurLineDs={supplementPurLineDs}
        />
      ),
      onOk: async () => {
        const validatorFlag = await Promise.all([
          supplementBaseInfoDs.validate(),
          supplementAbilityDs.validate(),
          supplementClassifyDs.validate(),
          supplementPurHeaderDs.validate(),
          supplementPurLineDs.validate(),
        ]);
        if (!validatorFlag.includes(false)) {
          // 提取内部表单ds的数据
          const fromData = await batchExtractDataSetData([
            supplementBaseInfoDs,
            supplementAbilityDs,
            supplementClassifyDs,
            supplementPurHeaderDs,
            supplementPurLineDs,
          ]);
          // 将所提取数据中的来源recordId按照记录的对应关系，替换成当前页面ds的recordId，并过滤掉对应关系不存在的数据
          const dataList = [];
          fromData.forEach((item, index) => {
            const mappingData = item.data
              .filter(r => initMappings[index].has(r[0]))
              .map(r => [initMappings[index].get(r[0]), r[1]]);
            dataList.push({ data: mappingData });
          });
          // 使用替换后的提取数据设置当前页面ds
          batchSetDataSetByPlainData(dataList, [
            [baseInfoDs],
            [supplierAbilityDs],
            [supplierClassifyDs],
            [purchaseHeaderDs],
            [purchaseLineDs],
          ]);
        } else {
          notification.warning({
            message: intl
              .get('sslm.common.view.message.requiredMsg')
              .d('请检查是否有必填项未填写！'),
          });
          return false;
        }
      },
    });
  };

  // AFBasic组件右侧区域渲染
  const contentRemainRender = () => {
    return (
      <div className={styles['stage-desc-wrap']}>
        <div className="stage-desc">{getTooltipShow(headerInfo.fromStageDescription, 18, 120)}</div>
        {headerInfo.gradeType === 'DEGRADE' ? <DegradedIcon /> : <UpgradeIcon />}
        <div className="stage-desc">{getTooltipShow(headerInfo.toStageDescription, 18, 120)}</div>
      </div>
    );
  };

  // AFBasic组件底部按钮渲染
  const contentBottomRender = () => {
    return (
      <HeaderBtns
        workflowFlag
        loading={allLoading}
        headerInfo={headerInfo}
        sourceType={sourceType}
        record={baseInfoDs.current}
        onSupplement={handleSupplement}
        customizeBtnGroup={customizeBtnGroup}
      />
    );
  };

  const getAFBasicFieldsConfig = () => {
    return {
      documentNumber: {
        render: ({ record }) => {
          const { supplierCompanyName, documentNumber } = record.get([
            'supplierCompanyName',
            'documentNumber',
          ]);
          const type = isNormal
            ? intl
                .get('sslm.lifeCycleManage.model.title.promotionDemotionApprove')
                .d('生命周期升降级申请审批')
            : intl.get('sslm.lifeCycleManage.model.title.specialApprove').d('生命周期特批申请审批');
          return `【${supplierCompanyName}】${type}—${documentNumber}`;
        },
      },
      aiApproveStatusMeaning: {
        render: params => {
          return aiApproveStatus ? (
            <span className={styles['ai-approve-status']}>
              {renderStatus({ ...params, IconComp: IntelligentReviewIcon })}
            </span>
          ) : (
            '-'
          );
        },
      },
    };
  };

  const dsObj = {
    statusInfo: baseInfoDs,
    otherInfo: baseInfoDs,
    supplierAbility: supplierAbilityDs,
    supplierClassify: supplierClassifyDs,
    purchaseInfo: { purchaseHeaderDs, purchaseLineDs },
  };

  const contextValue = {
    dsObj,
    dispatch,
    baseInfoDs,
    custLoading,
    relTableList,
    requisitionId,
    customizeForm,
    customizeTable,
    customizeTabPane,
    ...headerInfo,
  };

  const tagFields = aiApproveStatus ? ['aiApproveStatusMeaning'] : [];

  return (
    <Spin spinning={allLoading}>
      <Content wrapperClassName={styles['life-cycle-approval-wrap']}>
        <ResultAlert params={aiApproveDTOList} aiApproveStatus={aiApproveStatus} />
        <div className={styles['life-cycle-approval-extra']}>
          {customizeCommon(
            {
              code: 'SSLM.LIFE_CYCLE.DOCUMENT_CUSTOM.BASICS',
              processUnitTag: 'AF-BASIC',
            },
            <AFBasic
              dataSet={baseInfoDs}
              tagFields={tagFields}
              titleField="documentNumber"
              normalFields={['realName', 'creationDate']}
              contentRemainWidth="300px"
              contentBottomRender={contentBottomRender}
              contentRemainRender={contentRemainRender}
              fieldsConfig={getAFBasicFieldsConfig()}
            />
          )}
        </div>
        <Context.Provider value={contextValue}>
          <TopSection code="SSLM.LIFE_CYCLE.DOCUMENT_CUSTOM.CARD" getHocInstance={getHocInstance}>
            <SecondSection code="remark">
              <OtherInfo />
            </SecondSection>
            <SecondSection code="lifeCycleTimeline">
              <LifeCycleTimeline />
            </SecondSection>
            <SecondSection code="enterpriseInfo">
              <EnterpriseInfo />
            </SecondSection>
            <SecondSection code="attachment">
              <Attachment />
            </SecondSection>
          </TopSection>
        </Context.Provider>
      </Content>
    </Spin>
  );
};

export default compose(
  withCustomize({ isTemplate: true }),
  formatterCollections({
    code: [
      'sslm.common',
      'sslm.workbench',
      'spfm.importErp',
      'smbl.checkRules',
      'sslm.supplyAbility',
      'sslm.supplierInform',
      'sslm.lifeCycleManage',
      'sslm.commonApplication',
      'sslm.supplierLifeManage',
      'sslm.supplierLifePolicyConfig',
    ],
  })
)(Index);
