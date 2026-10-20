/*
 * 信息补录
 * @Date: 2024-02-05 15:43:35
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useEffect, forwardRef } from 'react';
import { compose } from 'lodash';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { Index } from '../Detail/index';


const WrapperIndex = compose(
  formatterCollections({
    code: [
      'ssrc.priceAdjustmentWorkBench',
      'spcm.common',
      'spc.advancedPricingRecord',
      'ssrc.priceLibraryNew',
      'ssrc.inquiryHall',
      'ssrc.common',
      'hzero.common',
    ],
  }),
)(Index);

const ModalIndex = forwardRef((props, ref) => {
  return <WrapperIndex {...props} refInstance={ref} />;
});

const SubmitIndex = (props) => {
  const {
    stageCode,
    templateCode,
    templateVersion,
    queryTemplateConfig,
    priceAdjustmentModalRef,
    extraParams,
    ...others
  } = props;

  useEffect(() => {
    const templateInfoPromise = new Promise((resolve) => {
      resolve({
        templateCode,
        templateVersion,
      });
    });
    queryTemplateConfig(templateInfoPromise, {
      stageCode,
      pageCode: 'SUBMIT_SUPPLEMENT',
    });
  }, [templateCode, templateVersion, stageCode]);

  return <ModalIndex {...others} ref={priceAdjustmentModalRef} extraParams={extraParams} />;
};

export default withCustomize({ isTemplate: true })(SubmitIndex);
