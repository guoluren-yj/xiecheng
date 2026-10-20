import React, { useMemo } from 'react';
import { Tabs, DataSet, Modal } from 'choerodon-ui/pro';
import type { RouteComponentProps } from 'react-router';
import { observer } from 'mobx-react-lite';
import qs from 'qs';
import { flowRight } from 'lodash';

import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { TabsPosition } from 'choerodon-ui/lib/tabs/enum';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { Header, Content } from 'components/Page';
import { reqSignService } from '@/services/ecSignService';
import formatterCollections from 'utils/intl/formatterCollections';

import { ecSigningDS } from '../stores';
import EcIntroduce from './EcIntroduce';
import EcSigning from './EcSigning';
import { EcSignStatus } from '../enum';
import { handleActiveOrStop, handleOperatRecord } from '../func';
import { ButtonRender } from '../renderer';
import './index.less';

const { TabPane } = Tabs;

const Detail: React.FC<RouteComponentProps> = (props) => {
  const {
    match: { params },
    location: { search },
  } = props;
  const { ecPlatformId } = params as {ecPlatformId: string};
  const { activeKey = 'introduce', onlyIntroduceFlag = '0' } = qs.parse(search.substring(1));
  const ecSigningDs = useMemo(() => (new DataSet(ecSigningDS(ecPlatformId))), []);
  const { ecSignStatus, ecSignId, ecPlatformName, ecSignStatusMeaning, ecIntroduction } = ecSigningDs.current?.get(['ecSignStatus', 'ecSignId', 'ecPlatformName', 'ecSignStatusMeaning', 'ecIntroduction']) || {};
  const editFlag = ecSigningDs.getState('editFlag');
  const title = useMemo(() => {
    if (onlyIntroduceFlag === '1'){
      return intl.get('small.ecSign.view.checkEcInfo').d('查看电商介绍');
    }
    if(ecSignStatus === EcSignStatus.UNSIGNED || (ecSignStatus === EcSignStatus.REJECTED && editFlag === 1)) {
      return intl.get('small.ecSign.view.reqSign').d('发起签约');
    } else {
      return intl.get('small.ecSign.button.viewSign').d('查看签约信息');
    }
  }, [ecSignStatus, editFlag]);

  // 发起签约
  const handleReqSign = async () => {
    const flag = await ecSigningDs.validate();
    if(!flag) {
      ecSigningDs.setState('tabKey', 'siging');
      return;
    }
    Modal.confirm({
      title: intl.get('small.common.view.tips').d('提示'),
      children: intl.get('small.ecSign.view.reqSign.confirm').d('申请后，电商将收到您的签约请求，后续会线下联系您沟通合作事宜。是否确认发起签约申请？'),
      onOk: async () => {
        const params = ecSigningDs.current?.toData() || {};
        const res = getResponse(await reqSignService(params));
        if(res) ecSigningDs.query();
      },
    });
  }

  const buttons = [
    {
      text: intl.get('small.ecSign.view.requestSign').d('申请签约'),
      color: ButtonColor.primary,
      icon: "record_test",
      onClick: () => handleReqSign(),
      visable: (EcSignStatus.UNSIGNED === ecSignStatus || (EcSignStatus.REJECTED && ecSigningDs.getState('editFlag') === 1)) && onlyIntroduceFlag !== '1',
    },
    {
      text: intl.get('small.ecSign.button.activating').d('激活'),
      color: ButtonColor.primary,
      icon: "check_circle",
      onClick: () => handleActiveOrStop({activateFlag: 1, ecSignId, callback: () => ecSigningDs.query()}),
      visable: [EcSignStatus.SIGNED, EcSignStatus.TERMINATED].includes(ecSignStatus),
    },
    {
      text: intl.get('small.ecSign.button.stop').d('终止'),
      icon: "not_interested",
      funcType: FuncType.flat,
      onClick: () => handleActiveOrStop({activateFlag: 0, ecSignId, callback: () => ecSigningDs.query()}),
      visable: ecSignStatus === EcSignStatus.ACTIVATED,
    },
    {
      text: intl.get('hzero.common.button.edit').d('编辑'),
      icon: "mode_edit",
      funcType: FuncType.flat,
      onClick: () => ecSigningDs.setState('editFlag', 1),
      visable: ecSignStatus === EcSignStatus.REJECTED && !editFlag,
    },
    {
      text: intl.get('hzero.common.button.operating').d('操作记录'),
      icon: "operation_service_request",
      funcType: FuncType.flat,
      onClick: () => handleOperatRecord({record: ecSigningDs.current}),
      visable: ecSignStatus !== EcSignStatus.UNSIGNED,
    },
  ].filter(n => !!n.visable);

  const introduceProps = {
    ecSignStatus,
    ecSignStatusMeaning,
    ecPlatformName,
    ecIntroduction,
  };

  return (
    <>
      <Header title={title} backPath="/small/ec-sign/list">
        <ButtonRender buttons={buttons} />
      </Header>
      <Content className="ec-sign-detail-content" style={{padding: 0, height: 'inherit'}}>
        {
          onlyIntroduceFlag === '1' ? (<EcIntroduce style={{ padding: '20px' }} {...introduceProps} />) : 
          <Tabs
            tabPosition={TabsPosition.left}
            activeKey={ecSigningDs.getState('tabKey') || activeKey}
            onChange={(key) => ecSigningDs.setState('tabKey', key)}
            className="ec-sign-detail-tabs"
          >
            <TabPane key="introduce" tab={intl.get('small.ecSign.view.ecIntroduce').d('电商介绍')}>
              <EcIntroduce {...introduceProps} />
            </TabPane>
            <TabPane className='siging-tab-pane' key="siging" tab={intl.get('small.ecSign.view.title').d('电商签约')}>
              <EcSigning ecSigningDs={ecSigningDs} />
            </TabPane>
          </Tabs>
        }
      </Content>
    </>
  );
};

export default flowRight([
  formatterCollections({ code: ['small.ecSign', 'small.common'] }),
  observer,
])(Detail);
