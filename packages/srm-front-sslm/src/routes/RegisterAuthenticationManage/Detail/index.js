/*
 * Detail - 注册策略历史记录
 * @date: 2024/04/22 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { compose } from 'lodash';
import React from 'react';
import { Icon, Button, Dropdown } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import VersionDetail from '@/routes/RegisterPolicyConfig/components/VersionDetailModal';
import HistoryVersion from '@/routes/RegisterPolicyConfig/components/HistoryVersion';

const Index = ({
  match: {
    params: { assignId, strategyCfBasicId, tenantId },
  },
  dispatch,
}) => {
  const getBtnComp = () => {
    const record = {
      assignId,
      tenantId,
      strategyCfBasicId,
    };
    return (
      <Dropdown
        overlay={
          <HistoryVersion
            record={record}
            showSubMenuFlag={false}
            filterData
            dispatch={dispatch}
            isPlatform
          />
        }
      >
        <Button icon="schedule" funcType="flat">
          <span>{intl.get('hzero.common.button.historyVersion').d('历史版本')}</span>
          <Icon type="expand_more" style={{ fontSize: 16, marginTop: -2, marginRight: 0 }} />
        </Button>
      </Dropdown>
    );
  };

  const headerComponentProps = {
    showHeader: true,
    backPath: '/sslm/register-authentication-manage/list',
    btnComp: getBtnComp(),
  };

  return (
    <React.Fragment>
      <VersionDetail
        assignId={assignId}
        strategyCfBasicId={strategyCfBasicId}
        tenantId={tenantId}
        headerComponentProps={headerComponentProps}
        isPlatform
      />
    </React.Fragment>
  );
};

export default compose(
  formatterCollections({
    code: [
      'sslm.common',
      'sslm.registerPolicy',
      'spfm.enterpriseCertification',
      'sslm.investDefOrg',
      'spfm.investigationDefinition',
      'spfm.rulesDefinition',
    ],
  })
)(Index);
