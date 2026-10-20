/*
 * @Date: 2025-08-27 10:57:58
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import { Spin } from 'choerodon-ui';
import querystring from 'querystring';
import { compose, isFunction } from 'lodash';
import { DataSet, useDataSet, Modal } from 'choerodon-ui/pro';
import React, { useState, useEffect, useMemo, Fragment } from 'react';

import intl from 'utils/intl';
import { Content } from 'components/Page';
import { getResponse } from 'utils/utils';
import { AFBasic } from '_components/AFCards';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  batchExtractDataSetData,
  batchInitDataSetByPlainData,
  batchSetDataSetByPlainData,
} from '_utils/workflow';

import { saveAll } from '@/services/supplyAbilityDocService';
import Remark from './Remark';
import styles from '../../index.less';
import HeaderBtns from './HeaderBtns';
import Supplement from './Supplement';
import { getHeaderDs } from '../Detail/stores/getHeaderDS';
import AttachmentInfo from '../../components/AttachmentInfo';
import CategoryMaterial from '../../components/CategoryMaterial';
import { getCategoryMaterialDs } from '../Detail/stores/getCategoryMaterialDS';

// 保存所需的个性化单元
const saveUnitCode = [
  'SUPPLY_ABILITY_DOC.PURCHASER_DETAIL_CUSTOM.AF_BASIC',
  'SUPPLY_ABILITY_DOC.PURCHASER_DETAIL_CUSTOM.CATEGORYS_LIST',
];

const Index = ({
  onLoad,
  location,
  custLoading,
  customizeTable,
  customizeCommon,
  customizeBtnGroup,
  queryTemplateConfig,
  match: {
    params: { abilityReqId },
  },
}) => {
  const routerParams = useMemo(() => querystring.parse(location.search.substr(1)), [
    location.search,
  ]);
  const { templateCode, templateVersion, stageCode } = routerParams;
  const pageCode = 'DETAIL';

  const basicDs = useDataSet(() => getHeaderDs(), []);
  const categoryMaterialDs = useDataSet(() => getCategoryMaterialDs(), []);

  const [loading, setLoading] = useState(false);
  const [headerInfo, setHeaderInfo] = useState({});
  const [waitCustomize, setWaitCustomize] = useState(false);

  // 工作流单据样式表单阶段编码
  const wfParams = {
    cuszTplStageCode: stageCode,
    cuszTplPageCode: pageCode,
    cuszTplTemplateCode: templateCode,
    cuszTplVersion: templateVersion,
  };

  const handleQuery = () => {
    basicDs.setQueryParameter('queryParam', {
      abilityReqId,
      customizeUnitCode: 'SUPPLY_ABILITY_DOC.PURCHASER_DETAIL_CUSTOM.AF_BASIC',
      ...wfParams,
    });
    categoryMaterialDs.setQueryParameter('queryParam', {
      abilityReqId,
      customizeUnitCode: [
        'SUPPLY_ABILITY_DOC.PURCHASER_DETAIL_CUSTOM.CATEGORYS_LIST',
        'SUPPLY_ABILITY_DOC.PURCHASER_DETAIL_CUSTOM.CATEGORYS_SEARCH_BAR',
      ].join(),
      editPageFlag: 0,
      wfParams,
    });
    setLoading(true);
    basicDs
      .query()
      .then(res => {
        if (res) {
          const { usePurchaseItemFlag = 1, initiateCamp = '0' } = res;
          const purchaserFlag = !Number(initiateCamp) ? true : !!Number(usePurchaseItemFlag);
          categoryMaterialDs.setState('purchaserFlag', purchaserFlag);
          setHeaderInfo(res);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 获取保存参数
  const getSaveParams = () => {
    const basicsInfo = basicDs.current?.toJSONData() || {};
    const supplyAbilityLines = categoryMaterialDs.toJSONData(); // 获取变更数据;
    const payload = {
      ...basicsInfo,
      wfParams,
      customizeUnitCode: saveUnitCode.join(','),
      supplyAbilityChangeLineList: supplyAbilityLines,
    };
    return payload;
  };

  const workflowSubmit = approveResult => {
    return new Promise(async (resolve, reject) => {
      if (approveResult === 'Approved') {
        const payload = getSaveParams();
        setLoading(true);
        saveAll(payload)
          .then(response => {
            const res = getResponse(response);
            if (res) {
              resolve(res);
            } else {
              reject();
            }
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        resolve();
      }
    });
  };

  useEffect(() => {
    setWaitCustomize(true);
    const templateInfoPromise = new Promise(resolve => {
      resolve({
        templateCode,
        templateVersion,
      });
    });
    queryTemplateConfig(templateInfoPromise, {
      stageCode,
      pageCode,
    }).then(() => {
      setWaitCustomize(false);
    });
  }, [templateCode, templateVersion, stageCode, pageCode]);

  useEffect(() => {
    if (waitCustomize) {
      handleQuery();
    }
  }, [waitCustomize, abilityReqId]);

  // 工作流审批通过调功能端保存
  useEffect(() => {
    if (isFunction(onLoad)) {
      onLoad({
        submit: workflowSubmit,
      });
    }
  }, [onLoad]);

  const getAFBasicFieldsConfig = () => ({
    titleMerge: {
      render: ({ record }) => {
        const { supplierCompanyName, abilityReqNum } =
          record?.get(['supplierCompanyName', 'abilityReqNum']) || {};
        return `${supplierCompanyName}—${abilityReqNum}`;
      },
    },
  });

  // AFBasic组件底部按钮渲染
  const contentBottomRender = () => {
    return (
      <HeaderBtns
        loading={loading}
        headerInfo={headerInfo}
        abilityReqId={abilityReqId}
        customizeBtnGroup={customizeBtnGroup}
        onSupplement={handleSupplement}
      />
    );
  };

  // 信息补录弹框
  const handleSupplement = async () => {
    const supplementBasicDs = new DataSet(basicDs.props);
    const supplementCategoryMaterialDs = new DataSet(categoryMaterialDs.props);
    const purchaserFlag = categoryMaterialDs.getState('purchaserFlag');
    supplementCategoryMaterialDs.setState('purchaserFlag', purchaserFlag);
    // 提取当前页面ds的数据
    const externalFromData = await batchExtractDataSetData([basicDs, categoryMaterialDs]);
    // 用提取的数据初始化内部表单ds，并返回初始化前后record.id的对应关系
    const mappings = batchInitDataSetByPlainData(externalFromData, [
      supplementBasicDs,
      supplementCategoryMaterialDs,
    ]);
    // 将初始化后的record.id与当前页面ds中record的对应关系转成map结构
    const initMappings = [new Map(), new Map()];
    mappings.forEach((mapping, mappingIndex) => {
      mapping.forEach(([fromRecordId, targetRecordId]) => {
        initMappings[mappingIndex].set(targetRecordId, fromRecordId);
      });
    });
    Modal.open({
      drawer: true,
      key: Modal.key(),
      style: { width: 1090 },
      bodyStyle: { padding: 0 },
      title: intl.get('sslm.common.model.field.infoSupplement').d('信息补录'),
      children: (
        <Supplement
          stageCode={stageCode}
          pageCode="SUPPLEMENT"
          headerInfo={headerInfo}
          custLoading={custLoading}
          templateCode={templateCode}
          customizeTable={customizeTable}
          templateVersion={templateVersion}
          supplementBasicDs={supplementBasicDs}
          queryTemplateConfig={queryTemplateConfig}
          supplementCategoryMaterialDs={supplementCategoryMaterialDs}
        />
      ),
      onOk: async () => {
        const validatorFlag =
          (await supplementBasicDs.validate()) && (await supplementCategoryMaterialDs.validate());
        if (validatorFlag) {
          // 提取内部表单ds的数据
          const fromData = await batchExtractDataSetData([
            supplementBasicDs,
            supplementCategoryMaterialDs,
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
          batchSetDataSetByPlainData(dataList, [[basicDs], [categoryMaterialDs]]);
        } else {
          return false;
        }
      },
    });
  };

  return (
    <Fragment>
      {waitCustomize ? (
        <Spin spinning={waitCustomize} />
      ) : (
        <Spin spinning={loading}>
          <div className={styles['af-wrap']}>
            {customizeCommon(
              {
                code: 'SUPPLY_ABILITY_DOC.PURCHASER_DETAIL_CUSTOM.AF_BASIC',
                processUnitTag: 'AF-BASIC',
              },
              <AFBasic
                dataSet={basicDs}
                titleField="titleMerge"
                custLoading={custLoading}
                fieldsConfig={getAFBasicFieldsConfig()}
                contentBottomRender={contentBottomRender}
                normalFields={['createdUserName', 'creationDate', 'companyId', 'companyIds']}
                tagFields={['initiateCampMeaning']}
              />
            )}
          </div>
          <Content
            wrapperStyle={{ background: '#f4f5f7' }}
            wrapperClassName={styles['supply-ability-doc-detail-content']}
          >
            <div className="card-content-wrap">
              <Remark dataSet={basicDs} />
              <CategoryMaterial
                isEdit={false}
                pageSource="purchaser"
                headerInfo={headerInfo}
                custLoading={custLoading}
                dataSet={categoryMaterialDs}
                customizeTable={customizeTable}
                customizeUnitCode="SUPPLY_ABILITY_DOC.PURCHASER_DETAIL_CUSTOM.CATEGORYS_LIST"
                customizeSearchCode="SUPPLY_ABILITY_DOC.PURCHASER_DETAIL_CUSTOM.CATEGORYS_SEARCH_BAR"
                reqAttUnitCode="SUPPLY_ABILITY_DOC.PURCHASER_DETAIL_CUSTOM.CATEGORYS_LINE_ATT"
                masterAttUnitCode="SUPPLY_ABILITY_DOC.PURCHASER_DETAIL_CUSTOM.CATEGORYS_LINE_MASTER_ATT"
              />
              <AttachmentInfo dataSet={basicDs} isEdit={false} />
            </div>
          </Content>
        </Spin>
      )}
    </Fragment>
  );
};

export default compose(
  withCustomize({ isTemplate: true }),
  formatterCollections({
    code: ['sslm.common', 'sslm.supplyAbilityDoc', 'sslm.supplyAbility'],
  })
)(Index);
