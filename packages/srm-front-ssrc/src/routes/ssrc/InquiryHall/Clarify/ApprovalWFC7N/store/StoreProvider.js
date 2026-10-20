import React, { createContext, useMemo, useEffect, useCallback, useState } from 'react';
import { useDataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { isArray, noop, isEmpty } from 'lodash';
import querystring from 'querystring';

import { filterCustomizeCodes } from '@/utils/utils';
import { INQUIRY } from '@/utils/globalVariable';

import { headerDS, relatedQuestionDS } from './storeDS';

const StoreContext = createContext({});

function StoreProvider(props = {}) {
  const {
    match: { params } = {},
    location,
    children,
    sourceKey = INQUIRY,
    queryTemplateConfig = noop,
    queryUnitConfig = noop,
    onFormLoaded = noop,
  } = props;

  const { clarifyId } = params || {};

  const organizationId = useMemo(() => getCurrentOrganizationId(), []);

  const [pageLoading, setPageLoading] = useState(false); // 页面加载loading

  const routerParams = useMemo(() => querystring.parse(location?.search?.substr(1)), [
    location?.search,
  ]);
  // templateCode=NEW&templateVersion=1&stageCode=INQUIRY_CHECK&pageCode=DEFAULT 审批表单路由上带的信息
  const templateInfo = useMemo(() => {
    return {
      cuszTplTemplateCode: routerParams?.templateCode,
      cuszTplVersion: routerParams?.templateVersion,
      cuszTplStageCode: routerParams?.stageCode,
      cuszTplPageCode: routerParams?.pageCode,
    };
  }, [routerParams]);

  // 获取个性化编码
  const getCustomizeUnitCode = (codeName) => {
    if (!codeName || isEmpty(codeName)) return null;

    // 个性化编码集合
    const codeMap = new Map([
      ['titleAfCard', `SSRC.${sourceKey}_HALL.CLARIFY_APPROVAL.TITLE_AF_CARD`], // 审批表单组件-基础卡片-标题卡片
      ['basicInfoCard', `SSRC.${sourceKey}_HALL.CLARIFY_APPROVAL.BASIC_INFO_CARD`], // 基础信息-标题卡片
      ['textCard', `SSRC.${sourceKey}_HALL.CLARIFY_APPROVAL.TEXT_CARD`], // 澄清函正文-标题卡片
      ['relatedQuestionCard', `SSRC.${sourceKey}_HALL.CLARIFY_APPROVAL.RELATED_QUESTION_CARD`], // 关联问题-标题卡片
      ['afCardButtons', `SSRC.${sourceKey}_HALL.CLARIFY_APPROVAL.AF_CARD_BUTTONS`], // 审批表单组件-按钮组（头部按钮组）
      ['afCard', `SSRC.${sourceKey}_HALL.CLARIFY_APPROVAL.AF_CARD`], // 审批表单组件-基础卡片
      ['basicInfoForm', `SSRC.${sourceKey}_HALL.CLARIFY_APPROVAL.BASIC_INFO_FORM`], // 基础信息-表单
      ['relatedTable', `SSRC.${sourceKey}_HALL.CLARIFY_APPROVAL.RELATED_QUESTION_TABLE`], // 关联问题表格-表格
    ]);
    return filterCustomizeCodes(codeMap, codeName);
  };

  // 初始化ds
  const headerDs = useDataSet(
    () =>
      headerDS({
        clarifyId,
        customizeUnitCode: getCustomizeUnitCode(['afCard', 'basicInfoForm']),
      }),
    [clarifyId]
  );
  const relatedQuestionDs = useDataSet(
    () =>
      relatedQuestionDS({
        clarifyId,
        customizeUnitCode: getCustomizeUnitCode('relatedTable'),
        headerDs,
      }),
    [clarifyId]
  );

  useEffect(() => {
    initFetchService();
  }, []);

  // 设置ds参数
  const setDsStateOrParameter = ({ ds, name, value, type }) => {
    if (ds && isArray(ds)) {
      ds.forEach((_ds) => {
        if (type === 'state') {
          _ds.setState(name, value);
        }
        _ds.setQueryParameter(name, value);
      });
    } else if (ds) {
      if (type === 'state') {
        ds.setState(name, value);
      }
      ds.setQueryParameter(name, value);
    }
  };

  // 查询页面数据
  const fetchPageData = useCallback(async () => {
    try {
      setPageLoading(true);
      await headerDs?.query().then((res) => {
        if (res && !res.failed) {
          setDsStateOrParameter({
            ds: relatedQuestionDs,
            name: 'sourceId',
            value: res.sourceId,
          });
          setDsStateOrParameter({
            ds: relatedQuestionDs,
            name: 'sourceType',
            value: res.sourceType,
          });
        }
      });
      await relatedQuestionDs.query();
      onFormLoaded(true); // 审批按钮可点击
      setPageLoading(false);
    } catch (e) {
      setPageLoading(false);
      throw e;
    }
  }, [headerDs, relatedQuestionDs, setPageLoading]);

  // 定制样式发布审批初始化查询
  const initFetchService = async () => {
    setDsStateOrParameter({
      ds: [headerDs, relatedQuestionDs],
      name: 'templateInfo',
      value: templateInfo,
      type: 'query',
    });
    const queryParams = new Promise((resolve) => {
      resolve({
        templateCode: templateInfo?.cuszTplTemplateCode,
        templateVersion: templateInfo?.cuszTplVersion,
      });
    });
    if (
      templateInfo?.cuszTplTemplateCode &&
      templateInfo?.cuszTplVersion &&
      templateInfo?.cuszTplStageCode &&
      templateInfo?.cuszTplPageCode
    ) {
      try {
        await queryTemplateConfig(queryParams, {
          // 阶段编码，页面编码
          stageCode: templateInfo?.cuszTplStageCode,
          pageCode: templateInfo?.cuszTplPageCode,
        });
      } catch (e) {
        throw e;
      }
    } else {
      const unitCode = getCustomizeUnitCode([
        'titleAfCard',
        'basicInfoCard',
        'textCard',
        'relatedQuestionCard',
        'afCardButtons',
        'afCard',
        'basicInfoForm',
        'relatedTable',
      ]).split(',');
      try {
        await queryUnitConfig(undefined, undefined, unitCode);
      } catch (e) {
        throw e;
      }
    }
    fetchPageData();
  };

  // 公共数据存储
  const storeData = useMemo(
    () => ({
      commonDs: {
        headerDs,
        relatedQuestionDs,
      },
      organizationId,
      clarifyId,
      routerParams,
      pageLoading,
      getCustomizeUnitCode,
    }),
    [
      headerDs,
      relatedQuestionDs,
      organizationId,
      clarifyId,
      routerParams,
      pageLoading,
      getCustomizeUnitCode,
    ]
  );

  const value = {
    ...(props || {}),
    ...storeData,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export default StoreProvider;

export { StoreContext };
