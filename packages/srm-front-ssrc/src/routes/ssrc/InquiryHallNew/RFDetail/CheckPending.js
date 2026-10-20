import React, { Fragment, useContext } from 'react';
import { observer } from 'mobx-react';
import intl from 'utils/intl';

import Card from '../rfComponents/Card';
import BasicInfo from './CardManage/CheckPending/BasicInfo';
import Supplier from './CardManage/CheckPending/Supplier';
import Attachment from './CardManage/CheckPending/Attachment';
import ItemLineDetail from './CardManage/CheckPending/ItemLineDetail';
import Store from './store/index';

export default observer(function CheckPending(props) {
  const { doubleUnitFlag, currentStep } = props;
  const {
    commonDs: { createBasicFormDs, ItemLineDetailDs },
    remote,
    routerParams: { sourceCategory, rfHeaderId, setPath },
  } = useContext(Store);

  const itemLineDetailProps = {
    doubleUnitFlag,
  };

  const basicInfoProps = {
    setPath,
    currentStep,
  };

  return (
    <Fragment>
      <Card
        title={intl.get('ssrc.rfDetail.view.card.title.basicInfos').d('基本信息')}
        component={<BasicInfo {...basicInfoProps} />}
      />
      <Card
        title={intl.get('ssrc.rfDetail.view.card.title.supplier').d('供应商')}
        component={<Supplier />}
      />
      {createBasicFormDs?.current?.get('lineItemsFlag') ? (
        <Card
          title={intl.get('ssrc.rfCheck.view.card.title.quotationDetail').d('报价明细')}
          component={<ItemLineDetail {...itemLineDetailProps} />}
        />
      ) : null}
      {remote
        ? remote.render('SSRC_INQUIRY_DETAIL_RF_RENDER_CHECK_PENDING_EXPAND_CARD', null, {
            sourceCategory,
            createBasicFormDs,
            rfHeaderId,
            rfItemLineDs: ItemLineDetailDs,
          })
        : null}
      <Card
        title={intl.get('ssrc.rfDetail.view.card.title.attachmentUuid').d('附件')}
        component={<Attachment />}
      />
    </Fragment>
  );
});
