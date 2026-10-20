import React, { Fragment, useEffect, useCallback, useContext, useMemo } from 'react';
import { isEmpty } from 'lodash';
import { runInAction } from 'mobx';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { Form, Lov, DataSet, Select } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';

import { Store } from '../../stores';
import { batchEditFormDS } from '../../stores/fillPayPoolDS';
import { FillPayPoolBatchEditCode } from '../../../utils/type';
import DynamicAlert from '../../../../../components/DynamicAlert';

const FillPayPoolBatchEdit = (props) => {
  const { modal, fillPoolDs } = props;
  const { customizeForm, remote } = useContext(Store);
  const formDs = useMemo(() => new DataSet(batchEditFormDS()), []);
  const { selected } = fillPoolDs;

  useEffect(() => {
    if (remote?.event) {
      // 增加埋点 更新税务发票后 可能需要更新结算明细信息里面的字段
      remote.event.fireEvent('handleLoadBatchEditCux', {
        formDs,
        selected,
      });
    }
  }, [selected, formDs, remote]);

  const handleOk = useCallback(async () => {
    const { selected, records } = fillPoolDs;
    const data = formDs.current?.toJSONData() || {};
    const fillRecords = isEmpty(selected) ? records : selected;
    runInAction(() => fillRecords.forEach((record) => record.set(filterNullValueObject(data))));
  }, [
    formDs,
    fillPoolDs,
  ]);

  useEffect(() => {
    if (modal) modal.handleOk(handleOk);
  }, [modal, handleOk]);


  return (
    <Fragment>
      <DynamicAlert
        placement="modal-top"
        message={
          isEmpty(selected)
            ? intl.get('sbsm.common.view.alert.batchAllMaintain').d('针对全部数据进行批量编辑')
            : intl
              .get(`sbsm.common.view.alert.batchAllMaintainData`, { num: selected.length })
              .d(`已勾选{num}条数据进行批量编辑`)
        }
      />
      {customizeForm(
        {
          code: FillPayPoolBatchEditCode,
        },
        <Form columns={1} dataSet={formDs} labelLayout={LabelLayout.float}>
          <Lov name="payTypeLov" />
          <Select name="payForm" />
        </Form>
      )}
    </Fragment>
  );
};

export default FillPayPoolBatchEdit;
