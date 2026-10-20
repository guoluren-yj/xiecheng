import React, { Fragment, useEffect, useCallback, useMemo, useContext } from 'react';
import { isEmpty } from 'lodash';
import { runInAction } from 'mobx';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { Form, DataSet, Select } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';

import { Store } from '../../stores';
import { batchEditDS } from '../../stores/initiatePayDS';
import { InitiatePayCodeMap } from '../../../utils/type';
import DynamicAlert from '../../../../../components/DynamicAlert';

interface BatchEditProps {
  modal?: any;
  topListDs: DataSet;
  custCodeName: 'PaperBatch' | 'OfflineBatch' | 'OnlineBatch';
};

const BatchEdit = (props: BatchEditProps) => {
  const { customizeForm } = useContext(Store);
  const { modal, topListDs, custCodeName } = props;
  const formDs = useMemo(() => new DataSet(batchEditDS()), []);
  const { selected } = topListDs;

  const handleOk = useCallback(async () => {
    const { selected, records } = topListDs;
    const data = formDs.current?.toJSONData() || {};
    const fillRecords = isEmpty(selected) ? records : selected;
    runInAction(() => fillRecords.forEach((record) => record.set(filterNullValueObject(data))));
  }, [
    formDs,
    topListDs,
  ]);

  useEffect(() => {
    if (modal) modal.handleOk(handleOk);
  }, [modal, handleOk]);

  const payStatusOptionsFilter = useCallback((record) => ['PAY_SUCCESS', 'PAY_CANCEL'].includes(record.get('value')), []);

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
        { code: InitiatePayCodeMap[custCodeName] },
        <Form columns={1} dataSet={formDs} labelLayout={LabelLayout.float}>
          <Select name="payStatus" optionsFilter={payStatusOptionsFilter} />
        </Form>
      )}
    </Fragment>
  );
};

export default BatchEdit;
