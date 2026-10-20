/*
 * @Date: 2023-11-08 09:45:34
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import querystring from 'querystring';
import { compose } from 'lodash';
import { useDataSet, Spin } from 'choerodon-ui/pro';
import React, { useState, useMemo, useEffect } from 'react';

import remotes from 'utils/remote';
import { getResponse } from 'utils/utils';
import { Content } from 'components/Page';
import { AFBasic } from '_components/AFCards';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import { fetchScoreLeft } from '@/services/appraisalScoreService';

import styles from '../index.less';
import { queryName } from '../utils';
import Attachment from '../components/Attachment';
import HeaderBtns from '../Detail/HeaderBtns';
import ScoreInfo from '../components/ScoreInfo';
import { getBasicDs } from '../stores/getBasicDS';
import { getAttachmentDs } from '../stores/getAttachmentDS';
import { getLeftFitlterDs } from '../stores/getScoreInfoDS';

const Index = ({
  remote,
  location,
  customizeTable,
  customizeCommon,
  queryTemplateConfig,
  match: {
    params: { evalHeaderId, evalGranularity },
  },
}) => {
  const isPub = useMemo(() => location.pathname.match('/pub/'), [location]);

  const [leftData, setLeftData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [waitCustomize, setWaitCustomize] = useState(false);

  const leftFitlterDs = useDataSet(() => getLeftFitlterDs(), []);
  const basicDs = useDataSet(() => getBasicDs({ evalHeaderId }), [evalHeaderId]);
  const attachmentDs = useDataSet(() => getAttachmentDs({ evalHeaderId }), [evalHeaderId]);
  const routerParams = useMemo(() => querystring.parse(location.search.substr(1)), [
    location.search,
  ]);
  const { submitUserId, templateCode, templateVersion, stageCode, pageCode } = routerParams;

  // 工作流单据样式表单阶段编码
  const wfParams = {
    cuszTplStageCode: stageCode,
    cuszTplPageCode: pageCode,
    cuszTplTemplateCode: templateCode,
    cuszTplVersion: templateVersion,
  };

  useEffect(() => {
    if (waitCustomize) {
      handleQuery();
    }
  }, [evalHeaderId, waitCustomize, JSON.stringify(wfParams)]);

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

  const handleQuery = () => {
    const queryParams = {
      ...wfParams,
      customizeUnitCode: 'SSLM.SCORING_WORKBENCH.DETAIL_CUSTOM.AF_BASIC',
    };
    basicDs.setQueryParameter('queryParams', queryParams);
    attachmentDs.setQueryParameter('submitUserId', submitUserId);
    leftFitlterDs.setQueryParameter('submitUserId', submitUserId);
    setLoading(true);
    Promise.all([basicDs.query(), attachmentDs.query(), queryScoreLeft()]).finally(() => {
      setLoading(false);
    });
  };

  // 查询左侧数据
  const queryScoreLeft = (params = {}) => {
    const { dimension = 'SU', lineScoreStatus, extraParameter } =
      leftFitlterDs.current?.toJSONData() || {};
    setLoading(true);
    return fetchScoreLeft({
      dimension,
      evalHeaderId,
      submitUserId,
      lineScoreStatus,
      [queryName[dimension]]: extraParameter,
      ...params,
    })
      .then(response => {
        const res = getResponse(response);
        if (res) {
          setLeftData(res);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // AFBasic组件底部按钮渲染
  const contentBottomRender = () => {
    return (
      <HeaderBtns
        evalHeaderId={evalHeaderId}
        isPub={isPub}
        remote={remote}
        submitUserId={submitUserId}
      />
    );
  };

  const getAFBasicFieldsConfig = () => ({
    evalName: {
      render: ({ record }) => {
        const { evalName, evalNum } = record?.get(['evalName', 'evalNum']) || {};
        return `${evalName}—${evalNum}`;
      },
    },
  });

  const wrapperClassName = [styles['score-wrap'], styles['score-approval']].join(' ');

  return waitCustomize ? (
    <Spin spinning={waitCustomize} />
  ) : (
    <Spin spinning={loading}>
      <Content wrapperClassName={wrapperClassName}>
        <div className={styles['score-content']}>
          {customizeCommon(
            {
              code: 'SSLM.SCORING_WORKBENCH.DETAIL_CUSTOM.AF_BASIC',
              processUnitTag: 'AF-BASIC',
            },
            <AFBasic
              dataSet={basicDs}
              titleField="evalName"
              fieldsConfig={getAFBasicFieldsConfig()}
              contentBottomRender={contentBottomRender}
              normalFields={['createdUserName', 'creationDate']}
              tagFields={['evalDimensionMeaning', 'evalCycleMeaning', 'evalTplTypeMeaning']}
            />
          )}
          <ScoreInfo
            readOnlyFlag
            isEdit={false}
            remote={remote}
            basicDs={basicDs}
            leftData={leftData}
            wfParams={wfParams}
            submitUserId={submitUserId}
            evalHeaderId={evalHeaderId}
            leftFitlterDs={leftFitlterDs}
            evalGranularity={evalGranularity}
            customizeTable={customizeTable}
            queryScoreLeft={queryScoreLeft}
            sourceKey="APPROVAL_FORM"
            customizeUnitCode="SSLM.SCORING_WORKBENCH.DETAIL_CUSTOM.SCORE_LIST"
          />
          <Attachment isEdit={false} dataSet={attachmentDs} evalHeaderId={evalHeaderId} />
        </div>
      </Content>
    </Spin>
  );
};

export default compose(
  withCustomize({ isTemplate: true }),
  remotes(
    {
      code: 'SSLM_APPRAISALSCORE_PURCHASER__WOEKFLOW_DETAIL',
      name: 'remote',
    },
    {}
  ),
  formatterCollections({
    code: ['sslm.supplierDocManage', 'sslm.appraisalScore', 'sslm.common'],
  })
)(Index);
