import React from 'react';
import { Button, Icon, Tooltip, DataSet } from 'choerodon-ui/pro';
import { withRouter } from 'react-router-dom';
import type { RouteComponentProps } from 'react-router';

import { Record } from 'choerodon-ui/dataset';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import OverflowTip from '@/components/OverflowTip';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { handleEcIntroduction } from '@/routes/EcSign/func';
import { checkInService } from '@/services/ecSignService';

import './index.less';

interface IEcCardProps extends RouteComponentProps {
  dataSet: DataSet,
  record: Record,
}

const EcCard: React.FC<IEcCardProps> = ({record, history}) => {
  const { ecPlatformName, ecPlatformId, ecIntroduction, fileUrl } = record.get(['ecPlatformName', 'ecPlatformId', 'ecIntroduction', 'fileUrl']) || {};

  // 去签约
  const handleGoSignDetail = () => {
    history.push(`/small/my-ec-sign/detail/${ecPlatformId}`);
  };

  const handleGoShop = async () => {
    const { BASE_PATH } = (window as any).$$env;
    const params = {
      ...record.toData(),
      returnUrl: `${window.location.origin}${BASE_PATH}s2-mall/oms/order-line/list`,
    };
    const res = getResponse(await checkInService(params));
    if(res) window.open(res?.checkInUrl, '_blank');
  }

  return (
    <div className="ec-card-wrapper">
      <div className="ec-card-img-wrapper">
        <img className="ec-card-img" src={fileUrl} />
      </div>
      <div className="ec-card-name-wrapper">
      <OverflowTip className="ec-card-name" lineHeight={24}>{ecPlatformName}</OverflowTip>
      </div>
      <div className="ec-card-des-wrapper">
      <div className="ec-card-des">
        <Button
          className='view-more'
          funcType={FuncType.link}
          color={ButtonColor.primary}
          onClick={() => handleGoSignDetail()}
        >
          {intl.get('small.ecSign.button.viewMore').d('了解更多')}
          <Icon type='keyboard_arrow_right' />
        </Button>
        {handleEcIntroduction(ecIntroduction)}
      </div>
      </div>
      <div className="ec-card-button-wrapper">
        <Button onClick={() => handleGoShop()}>
          {intl.get('small.ecSign.button.goShop').d('去采购')}
        </Button>
      </div>
    </div>
  );
};

export default withRouter(EcCard);
