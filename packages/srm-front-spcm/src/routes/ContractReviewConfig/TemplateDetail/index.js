/*
 * Index - 单据详情
 * @Date: 2025-03-10 10:19:06
 * @Author: CDJ
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment, useState, useEffect, useMemo } from 'react';
import { compose } from 'lodash';
import querystring from 'querystring';
import { routerRedux } from 'dva/router';

import { useDataSet, Spin } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { Header, Content } from 'components/Page';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import {
  updateReviewTemplate,
  publishReviewTemplate,
} from '@/services/contractReviewConfigService';

import HeaderInfo from './components/HeaderInfo';
import TemplateLineInfo from './components/TemplateLineInfo';
import HeaderBtn from './components/HeaderBtn';
import { getHeaderDs } from './stores/getHeaderDS';
import { getReviewRuleDs } from './stores/getReviewRuleDS';
import { getBackPath, getUnitCodes, getHeaderTitle } from './utils/utils';

import styles from './styles.less';

const Index = ({
  dispatch,
  custLoading,
  customizeForm,
  customizeTable,
  match: {
    params: { reviewTemplateId, status },
  },
  location,
}) => {
  const routerParams = useMemo(() => querystring.parse(location.search.substr(1)), [
    location.search,
  ]);

  const { sourceKey = '', sourceReviewTemplateId = '' } = routerParams || {};

  const isEdit = useMemo(() => status === 'edit', [status]);
  const [loading, setLoading] = useState(false);

  const headerDs = useDataSet(() => getHeaderDs({ reviewTemplateId }), [reviewTemplateId]);
  const reviewRuleDs = useDataSet(() => getReviewRuleDs({ reviewTemplateId }), [reviewTemplateId]);

  const { versionNumber } = headerDs.current?.get(['versionNumber']) || {};

  useEffect(() => {
    refreshAll();
  }, [reviewTemplateId]);

  const refreshAll = () => {
    setLoading(true);
    return Promise.all([headerDs.query(), reviewRuleDs.query()]).finally(() => setLoading(false));
  };

  // 保存
  const handleSave = async () => {
    const headerValidateFlag = await headerDs.validate();
    const lineValidateFlag = await reviewRuleDs.validate();
    if (headerValidateFlag && lineValidateFlag) {
      setLoading(true);
      const headerData = headerDs.current?.toJSONData() || {};
      const lineData = reviewRuleDs.toJSONData();
      const payload = {
        data: {
          ...headerData,
          checkTemplateLineList: lineData,
        },
        customizeUnitCode: getUnitCodes.detailCodes,
      };
      return updateReviewTemplate(payload)
        .then(async (res) => {
          if (getResponse(res)) {
            notification.success();
            await refreshAll();
          }
        })
        .finally(() => setLoading(false));
    }
  };

  // 发布
  const handlePublish = async () => {
    const headerValidateFlag = await headerDs.validate();
    const lineValidateFlag = await reviewRuleDs.validate();
    if (headerValidateFlag && lineValidateFlag) {
      setLoading(true);
      const headerData = headerDs.current?.toJSONData() || {};
      const lineData = reviewRuleDs.toJSONData();
      const payload = {
        data: {
          ...headerData,
          checkTemplateLineList: lineData,
        },
        customizeUnitCode: getUnitCodes.detailCodes,
      };
      return publishReviewTemplate(payload)
        .then(async (res) => {
          if (getResponse(res)) {
            notification.success();
            goToDetail();
          }
        })
        .finally(() => setLoading(false));
    }
  };

  // 跳转
  const goToDetail = () => {
    dispatch(
      routerRedux.push({
        pathname: '/spcm/contract-review-config/list',
      })
    );
  };

  return (
    <Fragment>
      <Header
        backPath={getBackPath({ sourceKey, sourceReviewTemplateId })}
        title={getHeaderTitle({ isEdit, sourceKey, versionNumber })}
      >
        <HeaderBtn
          handlePublish={handlePublish}
          handleSave={handleSave}
          loading={loading}
          isEdit={isEdit}
          dispatch={dispatch}
          sourceKey={sourceKey}
          headerDs={headerDs}
          sourceReviewTemplateId={sourceReviewTemplateId}
        />
      </Header>
      <Content wrapperClassName={styles['spcm-contract-review-config-detail']}>
        <Spin spinning={loading}>
          <div className="all-content-wrap">
            <HeaderInfo
              dataSet={headerDs}
              custLoading={custLoading}
              customizeForm={customizeForm}
              isEdit={isEdit}
              formCode={getUnitCodes.headerCode}
            />
            <TemplateLineInfo
              dataSet={reviewRuleDs}
              isEdit={isEdit}
              customizeTable={customizeTable}
              customizeForm={customizeForm}
              tableCode={getUnitCodes.lineCode}
              reviewTemplateId={reviewTemplateId}
            />
          </div>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['spcm.common', 'spcm.contractReview'],
  }),
  withCustomize({
    unitCode: [
      'SPCM_CONTRACT_REVIEW_CONFIG_DETAIL.TEMPLATE_HEADER',
      'SPCM_CONTRACT_REVIEW_CONFIG_DETAIL.TEMPLATE_LINE',
      'SPCM_CONTRACT_REVIEW_CONFIG_DETAIL.TEMPLATE_EDIT_LINE',
      'SPCM_CONTRACT_REVIEW_CONFIG_DETAIL.REF_POINT_LIST',
    ],
  })
)(Index);
