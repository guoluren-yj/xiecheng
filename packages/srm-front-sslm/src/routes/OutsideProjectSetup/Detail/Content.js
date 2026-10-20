/*
 * @Description: 外部寻源-Content
 * @Date: 2025-05-21 16:12:54
 * @Author: zuoxiangyu <xiangyu.zuo@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2025, Hand
 */
import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import { Alert } from 'choerodon-ui';
import { Spin } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';

import HeaderBtns from './HeaderBtns';
import { getTitle, Component } from './utils';
import { StoreContext } from './DetailProvider';

import './index.less';

const Contents = () => {
  const {
    status,
    editor,
    columns,
    loading,
    showBtn,
    reqStatus,
    responseRef,
    lineDataSet,
    configLoading,
    extSourceReqId,
    customizeForm,
  } = useContext(StoreContext);

  return configLoading ? (
    <Spin spinning />
  ) : (
    <>
      <Header title={getTitle()[status]} backPath="/sslm/oueside-project-setup/list">
        <HeaderBtns />
      </Header>
      <Content className="invite-certification-detail">
        <Spin spinning={loading}>
          {!extSourceReqId && !showBtn && (
            <Alert
              showIcon
              type="info"
              className="form-alert"
              style={{ margin: '0 8px' }}
              message={intl
                .get('sslm.outsideProjectSetup.view.message.funcCreateTips')
                .d(
                  '外部寻源用于开发新的非标零部件供应商，单据提交后将发布至第三方平台（海智在线），由第三方平台供应商回复需求。您可将符合要求的供应商纳入候选，并在后续建立合作关系。外部寻源需先申请后使用，如有需求，请联系甄云客户成功经理'
                )}
            />
          )}
          <Component
            editor={editor}
            columns={columns}
            reqStatus={reqStatus}
            lineDataSet={lineDataSet}
            responseRef={responseRef}
            customizeForm={customizeForm}
            extSourceReqId={extSourceReqId}
          />
        </Spin>
      </Content>
    </>
  );
};

export default observer(Contents);
