import React, { useEffect } from 'react';
import { Form, DatePicker, Lov, Icon, useDataSet } from 'choerodon-ui/pro';
import { isEmpty, omit, noop } from 'lodash';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';

import { handleFormDSFieldsValue } from '@/routes/components/Widget/Forms/handleFormDSFieldsValue';

import { batchMaintainItemDS } from '../store/itemLineDS';
import { batchUpdateLines } from '../utils/utils';

export default observer(function BatchMaintainItemForm(props) {
  const { modal, itemLineDs, customizeForm = noop, clearProperties = noop } = props;

  const batchMaintainItemDs = useDataSet(() => batchMaintainItemDS(), []);

  useEffect(() => {
    return () => {
      clearProperties(function clearCache() {
        this.cache[`SSRC.QUICK_INQUIRY.EDIT.BATCH_ITEM_FORM`] = {};
        this.cache[`SSRC.QUICK_INQUIRY.EDIT.BATCH_ITEM_FORM`].computeRes = {};
      }, []);
    };
  }, []);

  modal.handleOk(async () => {
    let selectedItems = itemLineDs?.selected || [];
    let allBatchEditFlag = 0;
    if (isEmpty(selectedItems)) {
      selectedItems = itemLineDs;
      allBatchEditFlag = 1;
    }
    const currentData = handleFormDSFieldsValue({
      ds: batchMaintainItemDs,
    });
    const data = omit(batchMaintainItemDs?.current?.toData(), '__dirty');

    // 存储值 供itemLineDs.load和大保存时使用
    if (itemLineDs && itemLineDs.setState) {
      itemLineDs.setState('batchMainItemsData', {
        batchBodyItem: currentData,
        batchBodyItemData: data,
        allBatchEditFlag,
      });
    }

    batchUpdateLines({
      // 更新值
      batchBodyItem: currentData,
      itemLineDS: itemLineDs,
      allBatchEditFlag,
    });
    if (itemLineDs) {
      itemLineDs.unSelectAll();
      itemLineDs.clearCachedSelected();
    }
  });

  return (
    <div>
      <div
        style={{
          margin: '-20px -20px 10px',
          background: 'rgb(230, 242, 253)',
          padding: '10px 24px',
          fontSize: '13px',
          color: 'rgb(48, 145, 242)',
          marginBottom: '20px',
        }}
      >
        <Icon type="icon icon-help" />
        &nbsp;&nbsp;
        {isEmpty(itemLineDs?.selected || [])
          ? intl
              .get('ssrc.quickInquiry.model.quickInquiry.batchAllPageDataToEdit')
              .d('针对全部数据进行批量编辑')
          : intl
              .get('ssrc.quickInquiry.model.quickInquiry.batchCheckDataToEdit', {
                length: itemLineDs?.selected?.length,
              })
              .d(`已勾选{length}条数据进行批量编辑`)}
      </div>
      {customizeForm(
        {
          code: `SSRC.QUICK_INQUIRY.EDIT.BATCH_ITEM_FORM`,
          dataSet: batchMaintainItemDs,
        },
        <Form dataSet={batchMaintainItemDs} columns={1} labelLayout="float">
          <Lov name="taxId" />
          <DatePicker name="validDateFrom" />
          <DatePicker name="validDateTo" />
        </Form>
      )}
    </div>
  );
});
