import React, { Fragment, useEffect, useMemo, useCallback } from 'react';
import { DataSet, Form, TextArea } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { ResizeType } from 'choerodon-ui/pro/lib/text-area/enum';

import intl from 'utils/intl';

import fillHeadInfoDS from '../stores/fillHeadInfoDS';
import { FillHeadCustCodeMap } from '../../utils/type';

interface FillHeadInfoProps {
  modal?: any;
  action: 'cancel' |'reverse';
  customizeForm: Function;
  okCallback: (filledHeadData: Record<string, any>) => void;
}

const FillHeadInfo = (props: FillHeadInfoProps) => {

  const { modal, action, customizeForm, okCallback } = props;
  const fillHeadInfoDs = useMemo(() => new DataSet(fillHeadInfoDS()), []);

  const handleOk = useCallback(async () => {
    const res = await fillHeadInfoDs.validate();
    if(!res) return false;
    if(okCallback) return okCallback(fillHeadInfoDs.current?.toData() || {});
  }, [okCallback, fillHeadInfoDs]);

  useEffect(() => {
    if (modal) {
      const titleMap = {
        cancel: intl.get('sbsm.common.view.title.cancelInfo').d('取消信息'),
        reverse: intl.get('sbsm.common.view.title.reserveInfo').d('冲销信息'),
      };
      modal.handleOk(handleOk);
      modal.update({ title: titleMap[action] });
    };
  }, [modal, action, handleOk]);

  return (
    <Fragment>
      {customizeForm({
        code: FillHeadCustCodeMap[action],
      }, (
        <Form
          columns={1}
          dataSet={fillHeadInfoDs}
          labelLayout={LabelLayout.float}
        >
          {action === 'cancel' && <TextArea name="cancelReason" resize={ResizeType.vertical} />}
          {action === 'reverse' && <TextArea name="reverseReason" resize={ResizeType.vertical} />}
        </Form>
      )
      )}
    </Fragment>
  );

};

export default FillHeadInfo;