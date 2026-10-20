import React, { useEffect } from 'react';
import { compose } from 'lodash';
import { DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import intl from 'utils/intl';
import withProps from 'utils/withProps';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';

import { DetailDS } from './detailDS';
import { PriceSourceType } from '../enum';
import styles from '../index.less';
import {
  CalcDetail,
  SourcePrice,
} from '../modal';

const AdvancedPricingRecordForm = observer((props) => {
  const {
    detailDs,
    match: { params },
  } = props;

  const { recordNum, isAdjust: urlIsAdjust = false } = params;
  const isAdjust = urlIsAdjust;

  useEffect(() => {
    init();
  }, [recordNum]);


  const init = () => {
    if (!isAdjust) {
      detailDs.setQueryParameter('recordNum', recordNum);
      detailDs.query();
    }
  };

  const renderContent = () => {
    let content = <></>;
    if (!isAdjust) {
      const record = detailDs?.current;
      if (!record) return content;
      const { recordId, recordLineId } = record.get(['recordId', 'recordLineId']);
      if (!recordId && !recordLineId) return content;
      const lineRecord = new DataSet().create({ recordLineId });
      const { priceSourceType } = record.get(['priceSourceType']);
      content = priceSourceType === PriceSourceType.FORMULA_PRICE ? <CalcDetail record={lineRecord} /> : <SourcePrice record={record} />;
    } else {
      const lineRecord = new DataSet().create({ recordLineId: recordNum });
      content = <CalcDetail record={lineRecord} isAdjust />;
    }
    return (
      <>
        <Content className={classNames(styles['action-content-wide'])}>
          {content}
        </Content>
      </>
    );
  };

  return (
    <React.Fragment>
      <Header title={intl.get(`spc.advancedPricingRecord.model.calcDetail`).d('计算明细')} />
      {renderContent()}
    </React.Fragment>
  );
});

export default compose(
  formatterCollections({
    code: [
      'entity.roles',
      'hzero.c7nProUI',
      'hzero.common',
      'ssrc.common',
      'ssrc.inquiryHall',
      'ssrc.priceAdjustmentWorkBench',
      'spc.bomDimConfig',
      'spc.bomViewWorkbench',
      'spc.formulaManage',
      'spc.advancedPricingRecord',
    ],
  }),
  withProps(
    () => {
      const detailDs = new DataSet(DetailDS());
      return {
        detailDs,
      };
    },
    { cacheState: true }
  )
)(AdvancedPricingRecordForm);
