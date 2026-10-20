import React, { Fragment, useEffect, useMemo, useCallback } from 'react';
import { DataSet, Form, TextArea } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { ResizeType } from 'choerodon-ui/pro/lib/text-area/enum';

import intl from 'utils/intl';

import { fillListInfoDS } from '../stores/listDS';

interface FillHeadInfoProps {
  modal?: any;
  action: 'back';
  okCallback: (filledHeadData: Record<string, any>) => void;
}

const FillListInfo = (props: FillHeadInfoProps) => {

  const { modal, action, okCallback } = props;
  const fillListInfoDs = useMemo(() => new DataSet(fillListInfoDS()), []);

  const handleOk = useCallback(async () => {
    const res = await fillListInfoDs.validate();
    if(!res) return false;
    if(okCallback) return okCallback(fillListInfoDs.current?.toData() || {});
  }, [okCallback, fillListInfoDs]);

  useEffect(() => {
    if (modal) {
      const titleMap = {
        back: intl.get('sbsm.paymentPool.model.paymentPool.backReason').d('退回原因'),
      };
      modal.handleOk(handleOk);
      modal.update({ title: titleMap[action] });
    };
  }, [modal, action, handleOk]);

  return (
    <Fragment>
      <Form
        columns={1}
        dataSet={fillListInfoDs}
        labelLayout={LabelLayout.float}
      >
        <TextArea name="backReason" resize={ResizeType.vertical} />
      </Form>
    </Fragment>
  );

};

export default FillListInfo;
