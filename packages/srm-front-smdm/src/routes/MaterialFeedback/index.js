/* eslint-disable no-shadow */
import React, { Fragment, useState, memo, useEffect } from 'react';

import { Tabs } from 'choerodon-ui';
import { DataSet } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';

import { connect } from 'dva';
import queryString from 'querystring';
import { routerRedux } from 'dva/router';
import { compose } from 'lodash';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getResponse, filterNullValueObject } from 'utils/utils';
import { fetchCount } from '@/services/materialFeedbackService';
import { pendingFeedbackListDS, feedbackListDS, allWholeListDS, lineListDS } from './stores/listDs';
import Feedback from './List/Feedback';
import PendingBack from './List/PendingBack';
import AllList from './List/AllList';

const { TabPane } = Tabs;
// 设置smdm国际化前缀 - common - model
const commonPrompt = 'smdm.common.model.common';

const Index = ({
  materialFeedback,
  pendingFeedbackListDs,
  feedbackListDs,
  allWholeListDs,
  pendingLineListDs,
  feedbackLineListDs,
  allLineListDs,
  customizeTable,
  dispatch,
  location,
}) => {
  const params = queryString.parse(location.search.substr(1)) || {};
  const { urlType } = params;
  const [currentTab, setCurrentTab] = useState(
    urlType || materialFeedback.tabType || 'pendingFeedBack'
  );
  const [allType, setAllType] = useState(materialFeedback.allType || 'whole');
  const [pendingType, setPendingType] = useState(materialFeedback.pendingType || 'whole');
  const [feedBackType, setFeedBackType] = useState(materialFeedback.feedBackType || 'whole');
  const [countObj, setCountObj] = useState({});

  // 跳转明细界面
  const handleJumpDetail = (record) => {
    const { itemAuthFeeHeaderId, authFeeStatusCode, nodeCode } = record?.toData();
    const type = [
      'WAIT_FEEDBACK',
      'AUTHENTICATION_REJECTED',
      'PREAPPROVAL_REJECTED',
      'SAMPLE_DELIVERY_WAIT_FEEDBACK',
    ].includes(authFeeStatusCode)
      ? 'edit'
      : 'read';
    const source = ![
      'WAIT_FEEDBACK',
      'AUTHENTICATION_REJECTED',
      'PREAPPROVAL_REJECTED',
      'SAMPLE_DELIVERY_WAIT_FEEDBACK',
    ].includes(authFeeStatusCode)
      ? 'feedback'
      : null;
    const search = {
      node: nodeCode,
      source,
    };
    dispatch(
      routerRedux.push({
        pathname: `/smdm/material-certification-feedback/${type}/${itemAuthFeeHeaderId}`,
        search: queryString.stringify(filterNullValueObject(search)),
      })
    );
  };

  const updateType = (type, sourceType) => {
    if (sourceType === 'allType') {
      setAllType(type);
    } else if (sourceType === 'pendingType') {
      setPendingType(type);
    } else {
      setFeedBackType(type);
    }
    dispatch({
      type: 'materialFeedback/updateState',
      payload: { [sourceType]: type },
    });
  };

  const getCurrentDs = (currentType) => {
    let currentDs = pendingFeedbackListDs || {};
    switch (currentType || currentTab) {
      case 'pendingFeedBack':
        currentDs = pendingFeedbackListDs;
        break;
      case 'feedback':
        currentDs = feedbackListDs;
        break;
      case 'all':
        currentDs = allType === 'whole' ? allWholeListDs : allLineListDs;
        break;
      default:
        currentDs = pendingFeedbackListDs;
        break;
    }
    return currentDs;
  };

  const getTabCount = () => {
    fetchCount().then((res) => {
      if (getResponse(res)) {
        setCountObj(res);
      }
    });
  };

  useEffect(() => {
    getTabCount();
  }, []);

  useEffect(() => {
    const currentDs = getCurrentDs(currentTab) || {};
    if (currentDs.getState('initFlag')) {
      currentDs.query(currentDs.currentPage, {}, true);
      getTabCount();
    }
  }, [currentTab, allType]);

  return (
    <Fragment>
      <Header
        title={intl.get(`${commonPrompt}.itemAuthFeedbackWorkbench`).d('物料认证反馈工作台')}
      />
      <Content>
        <Tabs
          defaultActiveKey={currentTab}
          activeKey={currentTab}
          onChange={(value) => {
            setCurrentTab(value);
            dispatch({
              type: 'materialFeedback/updateState',
              payload: { tabType: value },
            });
          }}
        >
          <TabPane
            tab={<>{intl.get(`${commonPrompt}.pendingFeedBack`).d('待反馈')}</>}
            key="pendingFeedBack"
            count={countObj.WAIT_FEEDBACK}
          >
            <PendingBack
              type={pendingType}
              wholeListDs={pendingFeedbackListDs}
              lineListDs={pendingLineListDs}
              customizeTable={customizeTable}
              updateType={updateType}
              handleJumpDetail={handleJumpDetail}
            />
          </TabPane>
          <TabPane
            tab={<>{intl.get(`${commonPrompt}.feedBack`).d('已反馈')}</>}
            key="feedBack"
            count={countObj.FEEDBACK}
          >
            <Feedback
              type={feedBackType}
              wholeListDs={feedbackListDs}
              lineListDs={feedbackLineListDs}
              customizeTable={customizeTable}
              updateType={updateType}
              handleJumpDetail={handleJumpDetail}
            />
          </TabPane>
          <TabPane
            tab={<>{intl.get(`${commonPrompt}.all`).d('全部')}</>}
            key="all"
            count={countObj.ALL}
          >
            <AllList
              type={allType}
              wholeListDs={allWholeListDs}
              lineListDs={allLineListDs}
              customizeTable={customizeTable}
              updateType={updateType}
              handleJumpDetail={handleJumpDetail}
            />
          </TabPane>
        </Tabs>
      </Content>
    </Fragment>
  );
};

export default compose(
  connect(({ materialFeedback }) => ({
    materialFeedback,
  })),
  formatterCollections({
    code: ['smdm.common'],
  }),
  withCustomize({
    unitCode: [
      'SMDM_ITEM_FEEDBACK.LIST',
      'SMDM_ITEM_PENDING_FEEDBACK.LIST',
      'SMDM_ITEM_FEEDBACK_ALL.LIST',
      'SMDM_ITEM_FEEDBACK_ALL.LINE_LIST',
      'SMDM_ITEM_FEEDBACK.LINE_LIST',
      'SMDM_ITEM_PENDING_FEEDBACK.LINE_LIST',
    ],
  }),
  withProps(
    () => {
      const pendingFeedbackListDs = new DataSet(pendingFeedbackListDS());
      const feedbackListDs = new DataSet(feedbackListDS());
      const allWholeListDs = new DataSet(allWholeListDS());
      const pendingLineListDs = new DataSet(lineListDS('pending'));
      const feedbackLineListDs = new DataSet(lineListDS('feeback'));
      const allLineListDs = new DataSet(lineListDS('all'));

      return {
        pendingFeedbackListDs,
        feedbackListDs,
        allWholeListDs,

        pendingLineListDs,
        feedbackLineListDs,
        allLineListDs,
      };
    },
    { cacheState: true }
  )
)(memo(Index));
