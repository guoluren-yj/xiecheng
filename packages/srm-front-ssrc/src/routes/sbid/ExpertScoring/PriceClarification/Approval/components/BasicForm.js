import React, { useContext } from 'react';
import { Form, Output } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { noop } from 'lodash';
import querystring from 'querystring';

import { filterNullValueObject } from 'utils/utils';
// import notification from 'utils/notification';

import { StoreContext } from '../store/StoreProvider';

const BasicForm = () => {
  const {
    history,
    bidFlag = false,
    commonDs: { basicFormDs },
    customizeForm = noop,
    getCustomizeUnitCode = noop,
  } = useContext(StoreContext);

  // 寻源单号跳转
  const handleSourceNum = (record) => {
    const { sourceHeaderId, sourceCategory, secondarySourceCategory } = record?.get([
      'sourceHeaderId',
      'sourceCategory',
      'secondarySourceCategory',
    ]);
    const pathname =
      secondarySourceCategory !== 'NEW_BID' ? '/ssrc/new-inquiry-hall' : '/ssrc/new-bid-hall';
    const search = querystring.stringify(
      filterNullValueObject({
        rfxHeaderId: sourceHeaderId,
        sourceCategory,
        permissionFilterFlag: 1,
      })
    );
    history.push({
      pathname: `${pathname}/rfx-detail/${sourceHeaderId}`,
      search,
    });
  };

  return (
    <React.Fragment>
      {customizeForm(
        {
          code: getCustomizeUnitCode('basicInfo'),
          dataSet: basicFormDs,
        },
        <Form
          dataSet={basicFormDs}
          columns={3}
          labelLayout="vertical"
          className="c7n-pro-vertical-form-display"
          useWidthPercent
        >
          <Output
            name="sourceNum"
            renderer={({ value, record }) => {
              const pathname = !bidFlag ? '/ssrc/new-inquiry-hall' : '/ssrc/new-bid-hall';
              const tabKey =
                window.dvaApp?._store
                  ?.getState?.()
                  ?.global?.menuLeafNode?.find?.((i) => i.path === pathname)?.path || null;
              return tabKey ? <a onClick={() => handleSourceNum(record)}>{value}</a> : value;
            }}
          />
          <Output name="sourceTitle" />
          <Output name="initiationAndAllSupplierCount" />
          <Output name="companyName" />
          <Output name="replyEndDate" />
          <Output name="submittedDate" />
          <Output name="replyRequirement" />
          <Output name="initiationReason" />
        </Form>
      )}
    </React.Fragment>
  );
};

export default observer(BasicForm);
