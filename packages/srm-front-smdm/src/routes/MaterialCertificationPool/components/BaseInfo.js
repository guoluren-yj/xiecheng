import React, { useContext } from 'react';
import intl from 'utils/intl';
import { isFunction } from 'lodash';
import { observer } from 'mobx-react-lite';
import {
  TextField,
  NumberField,
  Select,
  Lov,
  TextArea,
  Form,
  Output,
  Modal,
  DatePicker,
} from 'choerodon-ui/pro';
import { colorRender } from '../List/hook';
import { Store } from '../Detail/storeProvider';

const BaseInfo = function BaseInfo() {
  const {
    unitCode,
    headerDs,
    customizeForm,
    readOnly,
    pubPathFlag,
    renderApproveBaseInfo,
    source,
  } = useContext(Store);

  const renderStrategy = ({ record }) => {
    if (record) {
      return record?.get('strategyName')
        ? `${record.get('strategyName')}【${intl
            .get(`hzero.common.components.dataAudit.version`)
            .d('版本')}${record.get('strategyVersionNumber')}】`
        : null;
    } else {
      return null;
    }
  };

  const renderNodeVersion = ({ record }) => {
    if (record) {
      return record?.get('nodeCodeMeaning')
        ? `${record.get('nodeCodeMeaning')}【${intl
            .get(`hzero.common.components.dataAudit.version`)
            .d('版本')}${record.get('nodeVersionNumber')}】`
        : null;
    } else {
      return null;
    }
  };

  const form = readOnly
    ? customizeForm(
        {
          code: unitCode.split(',')[0],
          __force_record_to_update__: true,
          dataSet: headerDs,
        },
      <Form
        dataSet={headerDs}
        showLines={6}
        columns={3}
        useWidthPercent
        labelLayout="vertical"
        labelAlign="left"
        className="c7n-pro-vertical-form-display"
        useColon={false}
      >
        <Output name="reqHeaderNum" />
        <Output name="createdByName" />
        <Output name="creationDate" />

        <Output name="companyId" />
        <Output name="supplierId" />
        <Output name="categoryId" />

        <Output name="unitId" />
        <Output name="prTypeId" />
        <Output
          name="authReqStatusCode"
          renderer={({ value, text }) => colorRender(value, text, false)}
        />
        <Output name="strategyName" colSpan={3} renderer={renderStrategy} />
        <Output name="nodeVersionNumber" renderer={renderNodeVersion} />

        <Output name="sampleType" />
        <Output name="receivingDepartmentId" />
        <Output name="sampleDeliveryAddress" />
        <Output name="sampleRecipient" />
        <Output name="recipientContactNumber" />

        <Output name="itemAuthReqHeaderMRList" />
        <Output name="remark" colSpan={2} />
        {source === 'certified' && (
        <Output
          name="exportExternalStatusCode"
          renderer={({ value, text }) => colorRender(value, text, false)}
        />
          )}
        {source === 'certified' && <Output name="exportExternalErrorReason" />}
        <Output name="certificationConclusion" />
        <Output name="supplierCategoryId" />
      </Form>
      )
    : customizeForm(
        {
          code: unitCode.split(',')[0],
          __force_record_to_update__: true,
          dataSet: headerDs,
        },
      <Form
        useWidthPercent
        dataSet={headerDs}
        showLines={6}
        columns={3}
        labelLayout="float"
        useColon={false}
      >
        <TextField name="reqHeaderNum" />
        <TextField name="createdByName" />
        <DatePicker name="creationDate" mode="dateTime" />

        <Lov name="companyId" />
        <Lov name="supplierId" />
        <Lov
          name="categoryId"
          tableProps={{
              mode: 'tree',
              onRow: (row) => {
                const handleSelect = ({ dataSet, record: _record }) => {
                  if (dataSet && _record) {
                    dataSet.select(_record);
                  }
                };
                return {
                  onClick: () => handleSelect(row),
                  onDoubleClick: () => {
                    if (row?.record?.selectable) {
                      handleSelect(row);
                      // eslint-disable-next-line no-unused-expressions
                      headerDs?.current?.set({
                        categoryId: row?.record?.toData(),
                      });
                      Modal.destroyAll();
                    }
                  },
                };
              },
              selectionMode: 'rowbox',
              virtual: true,
              style: { maxHeight: '500px' },
            }}
        />

        <Lov name="unitId" />
        <Lov name="prTypeId" />
        <Select name="authReqStatusCode" />

        <TextField name="strategyName" colSpan={3} renderer={renderStrategy} />
        <TextField name="nodeVersionNumber" renderer={renderNodeVersion} />

        <Select name="sampleType" />
        <Lov name="receivingDepartmentId" />
        <TextField name="sampleDeliveryAddress" />
        <TextField name="sampleRecipient" />
        <NumberField name="recipientContactNumber" />

        <Lov name="itemAuthReqHeaderMRList" />
        <TextArea name="remark" colSpan={2} />
        <Select name="certificationConclusion" clearButton={false} />
        <Lov name="supplierCategoryId" />
      </Form>
      );

  const cuxApproveForm =
    pubPathFlag && isFunction(renderApproveBaseInfo)
      ? renderApproveBaseInfo(
          headerDs,
          unitCode.split(',')[0],
          customizeForm,
          colorRender,
          renderStrategy
        )
      : undefined;

  return <>{cuxApproveForm || form}</>;
};

export default observer(BaseInfo);
