import React from 'react';
import { Button, Icon, DataSet, Modal, Form, Lov, TextField, Password, Select } from 'choerodon-ui/pro';
import { withRouter } from 'react-router-dom';
import type { RouteComponentProps } from 'react-router';

import { Record } from 'choerodon-ui/dataset';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import OverflowTip from '@/components/OverflowTip';
import { ecClientActiveService } from '@/services/ecSignService';

import { EcSignStatus } from './enum';
import { ButtonRender, TagRenderer } from './renderer';
import { handleActiveOrStop, handleEcIntroduction } from './func';
import { ecClintDS } from './stores';
import './index.less';

interface IEcCardProps {
  dataSet: DataSet,
  record: Record,
}

const EcCard: React.FC<IEcCardProps & RouteComponentProps> = ({dataSet, record, history}) => {
  const {
    ecSignId,
    ecSignStatus,
    ecSignStatusMeaning,
    ecPlatformName,
    ecPlatformId,
    ecIntroduction,
    fileUrl,
    offlineActiveFlag,
    ecPlatformTenantId,
    onlineSign
  } = record.get([
    'ecSignId',
    'ecSignStatus',
    'ecSignStatusMeaning',
    'ecPlatformName',
    'ecPlatformId',
    'ecIntroduction',
    'fileUrl',
    'offlineActiveFlag',
    'ecPlatformTenantId',
    'onlineSign'
  ]) || {};

  // 去签约
  const handleGoSignDetail = (activeKey = 'introduce', onlyIntroduceFlag = 0) => {
    history.push({
      pathname: `/small/ec-sign/detail/${ecPlatformId}`,
      search: `?activeKey=${activeKey}&onlyIntroduceFlag=${onlyIntroduceFlag}`,
    });
  };

  /**
   * 维护电商账号弹窗
   */
  const openEcClientModal = () => {
    const formDs = new DataSet(ecClintDS());
    formDs.loadData([{
      ecPlatformId,
      ecPlatformName,
      ecPlatformTenantId,
    }]);
    const modal = Modal.open({
      drawer: true,
      key: 'ec-client-modal',
      style: { width: 380 },
      title: intl.get('small.ecSign.button.createEcClient').d('维护电商账号'),
      children: (
        <Form dataSet={formDs} columns={1} labelLayout={LabelLayout.float}>
          <TextField name="ecPlatformName" disabled />
          <Lov name="companyLov" />
          <TextField name="ecCompanyName" disabled />
          <Select name="dataType" />
          <TextField name="userName" />
          <Password name="userPassword" />
          <TextField name="accessKeyId" />
          <Password name="accessKeySecret" />
        </Form>
      ),
      okText: intl.get('small.ecSign.button.goActive').d('激活'),
      onOk: async () => {
        const flag = await formDs.validate();
        if(flag) {
          Modal.confirm({
            title: intl.get('small.common.view.tips').d('提示'),
            children: intl
              .get('small.ecSign.view.activeConfirm')
              .d('激活后，需求人员可通过该电商进行采购，是否确认激活电商？'),
            onOk: async () => {
              const params = {
                ...(formDs.current?.toJSONData()),
                ecSignId,
                ecPlatformId,
              };
              const res = getResponse(await ecClientActiveService(params))
              if(res) {
                modal.close();
                dataSet.query();
              }
            },
          });
        };
        return false;
      },
    });
  };

  const buttons = [
    {
      visable: ecSignStatus === EcSignStatus.UNSIGNED && onlineSign === 1,
      text: intl.get('small.ecSign.button.goSign').d('去签约'),
      color: ButtonColor.primary,
      onClick: () => handleGoSignDetail('siging'),
    },
    {
      visable: ecSignStatus !== EcSignStatus.UNSIGNED,
      text: intl.get('small.ecSign.button.viewSign').d('查看签约信息'),
      onClick: () => handleGoSignDetail('siging'),
    },
    {
      visable: ecSignStatus === EcSignStatus.SIGNED || ecSignStatus === EcSignStatus.TERMINATED,
      text: intl.get('small.ecSign.button.goActive').d('激活'),
      color: ButtonColor.primary,
      onClick: () => handleActiveOrStop({activateFlag: 1, ecSignId, callback: () => dataSet.query()}),
    },
    {
      visable: ecSignStatus === EcSignStatus.ACTIVATED,
      text: intl.get('small.ecSign.button.terminate').d('终止'),
      color: ButtonColor.primary,
      onClick: () => handleActiveOrStop({activateFlag: 0, ecSignId, callback: () => dataSet.query()})
    },
    {
      visable: offlineActiveFlag || (ecSignStatus === EcSignStatus.UNSIGNED && onlineSign !== 1),
      text: intl.get('small.ecSign.button.createEcClient').d('维护电商账号'),
      color: ButtonColor.primary,
      onClick: () => openEcClientModal(),
    },
  ].filter(n => !!n.visable);

  return (
    <div className="ec-card-wrapper">
      <div className="ec-card-img-wrapper">
        <img className="ec-card-img" src={fileUrl} />
      </div>
      <div className="ec-card-name-wrapper">
        <OverflowTip className="ec-card-name" lineHeight={24}>{ecPlatformName}</OverflowTip>
        <TagRenderer status={ecSignStatus} ecSignStatusMeaning={ecSignStatusMeaning} />
      </div>
      <div className="ec-card-des-wrapper">
      <div className="ec-card-des">
        <Button
          className='view-more'
          funcType={FuncType.link}
          color={ButtonColor.primary}
          onClick={() => handleGoSignDetail('introduce', Number(onlineSign !== 1))}
        >
          {intl.get('small.ecSign.button.viewMore').d('了解更多')}
          <Icon type='keyboard_arrow_right' />
        </Button>
        {handleEcIntroduction(ecIntroduction)}
      </div>
      </div>
      <div className="ec-card-button-wrapper">
        <ButtonRender buttons={buttons} />
      </div>
    </div>
  );
};

export default withRouter(EcCard);
