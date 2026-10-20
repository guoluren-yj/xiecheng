import React, { useContext } from 'react';
import intl from 'utils/intl';
import { isFunction } from 'lodash';
import {
  TextField,
  NumberField,
  DatePicker,
  Select,
  Lov,
  TextArea,
  Form,
  Output,
  Modal,
} from 'choerodon-ui/pro';
import { colorRender } from '../List/hook';
import { Store } from '../Detail/storeProvider';

const BaseInfo = function BaseInfo() {
  const {
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
          code: 'SMDM_ITEM_FEEDBACK_DETAIL.BASEINFO',
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
        <Output name="feeHeaderNum" />
        <Output name="createdByName" />
        <Output name="creationDate" />

        <Output name="companyId" />
        <Output name="supplierId" />
        <Output name="categoryId" />

        <Output name="unitId" />
        <Output name="prTypeId" />
        <Output
          name="authFeeStatusCode"
          renderer={({ value, text }) => colorRender(value, text, false)}
        />

        <Output name="strategyName" colSpan={3} renderer={renderStrategy} />
        <Output name="nodeVersionNumber" renderer={renderNodeVersion} />

        <Output name="sampleType" />
        <Output name="receivingDepartmentId" />
        <Output name="sampleDeliveryAddress" />
        <Output name="sampleRecipient" />
        <Output name="recipientContactNumber" />

        <Output name="reqRemark" colSpan={2} disabled />
        <Output name="remark" colSpan={2} />
        {source === 'feedback' && (
        <Output
          name="exportExternalStatusCode"
          renderer={({ value, text }) => colorRender(value, text, false)}
        />
          )}
        {source === 'feedback' && <Output name="exportExternalErrorReason" />}
        <Output name="certificationConclusion" />
        {/* <Output name="supplierCategoryId" /> */}
      </Form>
      )
    : customizeForm(
        {
          code: 'SMDM_ITEM_FEEDBACK_DETAIL.BASEINFO',
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
        <TextField name="feeHeaderNum" />
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
        <Select name="authFeeStatusCode" />

        <TextField name="strategyName" colSpan={3} renderer={renderStrategy} />
        <TextField name="nodeVersionNumber" renderer={renderNodeVersion} />

        <Select name="sampleType" />
        <Lov name="receivingDepartmentId" />
        <TextField name="sampleDeliveryAddress" />
        <TextField name="sampleRecipient" />
        <NumberField name="recipientContactNumber" />

        <TextArea name="reqRemark" colSpan={2} disabled />
        <TextArea name="remark" colSpan={2} />
        <Select name="certificationConclusion" disabled />
        {/* <Lov name="supplierCategoryId" disabled /> */}
      </Form>
      );

  const cuxApproveForm =
    pubPathFlag && isFunction(renderApproveBaseInfo)
      ? renderApproveBaseInfo(
          headerDs,
          'SMDM_ITEM_FEEDBACK_DETAIL.BASEINFO',
          customizeForm,
          colorRender,
          renderStrategy
        )
      : undefined;

  return <>{cuxApproveForm || form}</>;
};

export default BaseInfo;
