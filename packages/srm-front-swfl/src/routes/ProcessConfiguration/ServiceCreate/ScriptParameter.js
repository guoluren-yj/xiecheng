import React, { useEffect } from 'react';
import { Modal, Button, Table, DataSet, Form, TextField, Select, Lov } from 'choerodon-ui/pro';
import { Popconfirm } from 'choerodon-ui';
import { isArray } from 'lodash';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import { getServiceScriptTable } from './serviceStoreDs';

let uid = Date.now();
const modalKey = Modal.key();

const EditForm = observer(({ record, flag }) => {
  const handleChangeType = () => {
    if (record) {
      record.set('parameterValue', undefined);
    }
  };

  return (
    <Form record={record} labelLayout="float">
      <TextField name="parameterName" />
      <TextField name="parameterDescription" />
      <Select name="scriptParameterType" onChange={handleChangeType}>
        <Select.Option value="CONSTANT">
          {intl.get('hwfp.serviceDefinition.model.scriptParam.constant').d('固定值')}
        </Select.Option>
        {flag && (
          <Select.Option value="DYNAMIC">
            {intl.get('hwfp.serviceDefinition.model.scriptParam.dynamic').d('动态参数')}
          </Select.Option>
        )}
      </Select>
      {record.get('scriptParameterType') === 'DYNAMIC' ? (
        <Lov name="parameterValue" />
      ) : (
        <TextField name="parameterValue" />
      )}
    </Form>
  );
});

function ScriptParameter(props = {}) {
  const {
    serviceScriptTableDs,
    parameterList = [],
    serviceScriptFormDs,
    isPredefined,
    serviceConfigFormDs,
  } = props;

  useEffect(() => {
    if (isArray(parameterList)) {
      serviceScriptTableDs.loadData(parameterList);
    }
  }, [parameterList]);

  const createUid = () => {
    return `spz_${(uid++).toString(36)}`;
  };

  const editServiceExpression = (record) => {
    let recordData = {};
    if (record) {
      recordData = record.toData();
    }
    const { serviceType, serviceMode } = serviceConfigFormDs.current
      ? serviceConfigFormDs.current.get(['serviceType', 'serviceMode'])
      : {};
    recordData.scriptParameterType = recordData.scriptParameterType || 'CONSTANT';
    const newRecord = serviceScriptFormDs.create(recordData, 0);
    const flag =
      serviceType === 'APPROVAL_CANDIDATE_RULE' &&
      serviceMode === 'SCRIPT' &&
      serviceScriptTableDs.filter(
        (i) =>
          i.get('scriptParameterType') === 'DYNAMIC' &&
          i.get('parameterName') !== recordData.parameterName
      ).length === 0;
    Modal.open({
      key: modalKey,
      title: intl.get('hwfp.serviceDefinition.view.title.editParams').d('编辑参数'),
      children: <EditForm record={newRecord} flag={flag} />,
      drawer: true,
      style: {
        width: '380px',
      },
      onOk: async () => {
        const res = await serviceScriptFormDs.validate();
        if (res) {
          const parameterCreateId = newRecord.get('parameterCreateId');
          if (!parameterCreateId) {
            newRecord.set('parameterCreateId', createUid());
            newRecord.set('parameterSource', 'CONSTANT');
          }
          if (newRecord.get('parameterId') && record) {
            const dataList = serviceScriptTableDs
              .toData()
              .filter((item) => item.parameterId !== newRecord.get('parameterId'));
            serviceScriptTableDs.loadData(dataList);
          } else if (parameterCreateId && record) {
            const dataList = serviceScriptTableDs
              .toData()
              .filter((item) => item.parameterCreateId !== parameterCreateId);
            serviceScriptTableDs.loadData(dataList);
          }
          serviceScriptTableDs.appendData([newRecord.toData()]);
        } else {
          return false;
        }
      },
      onClose: () => {
        serviceScriptFormDs.reset(newRecord);
      },
    });
  };

  const deleteRecord = (record) => {
    if (record) {
      const { parameterId, parameterCreateId } = record.get(['parameterId', 'parameterCreateId']);
      if (parameterId) {
        const dataList = serviceScriptTableDs
          .toData()
          .filter((item) => item.parameterId !== parameterId);
        serviceScriptTableDs.loadData(dataList);
      } else if (parameterCreateId) {
        const dataList = serviceScriptTableDs
          .toData()
          .filter((item) => item.parameterCreateId !== parameterCreateId);
        serviceScriptTableDs.loadData(dataList);
      }
    }
  };

  const optionColumn = isPredefined
    ? []
    : [
        {
          name: 'option',
          lock: 'right',
          width: 120,
          renderer: ({ record }) => (
            <span className="action-link">
              <a onClick={() => editServiceExpression(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              <Popconfirm
                placement="topRight"
                title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录？')}
                onConfirm={() => deleteRecord(record)}
              >
                <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
              </Popconfirm>
            </span>
          ),
        },
      ];

  const columns = [
    {
      name: 'parameterName',
      width: 200,
    },
    {
      name: 'parameterDescription',
      minWidth: 200,
    },
    {
      name: 'scriptParameterType',
      minWidth: 200,
      renderer: ({ value }) => {
        return value === 'DYNAMIC'
          ? intl.get('hwfp.serviceDefinition.model.scriptParam.dynamic').d('动态参数')
          : intl.get('hwfp.serviceDefinition.model.scriptParam.constant').d('固定值');
      },
    },
    {
      name: 'parameterValue',
      width: 200,
    },
    ...optionColumn,
  ];

  const buttons = isPredefined
    ? []
    : [
      <Button icon="playlist_add" onClick={() => editServiceExpression()}>
        {intl
            .get('hwfp.serviceDefinition.action.button.addScriptParameter')
            .d('新增独立脚本参数')}
      </Button>,
      ];

  return (
    <>
      <div className="service-definition-title">
        <span>{intl.get('hwfp.serviceDefinition.view.title.parameter').d('参数')}</span>
      </div>
      <Table dataSet={serviceScriptTableDs} columns={columns} buttons={buttons} />
    </>
  );
}

export default formatterCollections({
  code: ['hzero.common'],
})(
  withProps(
    () => {
      const serviceScriptFormDs = new DataSet(getServiceScriptTable());
      return {
        serviceScriptFormDs,
      };
    },
    { cacheState: true }
  )(ScriptParameter)
);
