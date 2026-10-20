import React, { useEffect, useState } from 'react';
import { Modal, Button, Table, DataSet, Form, Select, TextField } from 'choerodon-ui/pro';
import { isArray, isEmpty } from 'lodash';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import notification from 'utils/notification';
import { fetchVariable, syncParam } from '../processConfigurationService';
import { getServiceParamsTable } from './serviceStoreDs';

const modalKey = Modal.key();
function ParamsDrawer(props = {}) {
  const {
    isCreate,
    isSiteFlag,
    isPredefined,
    serviceParamsTableDs,
    parameterList = [],
    serviceParamsFormDs,
    serviceConfigFormDs,
  } = props;

  useEffect(() => {
    if (isArray(parameterList)) {
      serviceParamsTableDs.loadData(parameterList);
    }
  }, [parameterList]);

  const editServiceExpression = (record) => {
    let recordData = {};
    if (record) {
      recordData = record.toData();
    }
    const newRecord = serviceParamsFormDs.create(recordData, 0);
    Modal.open({
      key: modalKey,
      title: intl.get('hwfp.serviceDefinition.view.title.editParams').d('编辑参数'),
      children: <ParamsDrawerForm record={newRecord} serviceConfigFormDs={serviceConfigFormDs} />,
      drawer: true,
      style: {
        width: '380px',
      },
      onOk: async () => {
        const res = await serviceParamsFormDs.validate();
        if (res) {
          const parameterId = record.get('parameterId');
          if (parameterId) {
            const dataList = serviceParamsTableDs
              .toData()
              .filter((item) => item.parameterId !== parameterId);
            serviceParamsTableDs.loadData(dataList);
          }
          serviceParamsTableDs.appendData([newRecord.toData()]);
        } else {
          return false;
        }
      },
      onClose: () => {
        serviceParamsFormDs.reset(newRecord);
      },
    });
  };

  const synchronizedVariable = () => {
    syncParam().then((res) => {
      if (res) {
        notification.success();
        if (!isEmpty(res)) {
          let newParameterList = [];
          if (!isEmpty(parameterList)) {
            newParameterList = parameterList
              .filter((i) => !res.some((r) => r.parameterId === i.parameterId))
              .concat(
                res.map((item) => {
                  const { parameterId, ...other } = item;
                  return {
                    ...other,
                    interfaceParameterId: parameterId,
                  };
                })
              );
          }
          serviceParamsTableDs.loadData(newParameterList);
        }
      }
    });
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
      name: 'interfaceParameterTypeMeaning',
      minWidth: 200,
    },
    {
      name: 'defaultValue',
      width: 200,
    },
    {
      name: 'parameterSourceMeaning',
      width: 200,
    },
    {
      name: 'parameterValue',
      minWidth: 200,
    },
    {
      name: 'description',
      width: 200,
    },
    ...optionColumn,
  ];

  const buttons = [
    <Button
      disabled={!isSiteFlag ? isPredefined && !isCreate : false}
      onClick={() => synchronizedVariable()}
      icon="replay"
    >
      {intl.get('hwfp.serviceDefinition.view.button.syncParam').d('同步变量')}
    </Button>,
  ];

  return (
    <>
      <div className="service-definition-title">
        <span>{intl.get('hzero.common.model.param').d('参数')}</span>
      </div>
      <Table dataSet={serviceParamsTableDs} columns={columns} buttons={buttons} />
    </>
  );
}

export default formatterCollections({
  code: ['hzero.common'],
})(
  withProps(
    () => {
      const serviceParamsFormDs = new DataSet(getServiceParamsTable());
      return {
        serviceParamsFormDs,
      };
    },
    { cacheState: true }
  )(ParamsDrawer)
);

const ParamsDrawerForm = (props) => {
  const { record, serviceConfigFormDs } = props;
  const [showSelect, setShowSelect] = useState(false);
  const [variableList, setVariableList] = useState([]);

  const changeParameterSourceMeaning = (item) => {
    if (item && item.value === 'VARIABLE') {
      fetchVariableList();
      setShowSelect(true);
    } else {
      setShowSelect(false);
    }
  };

  const fetchVariableList = () => {
    if (serviceConfigFormDs.current) {
      const { categoryId, documentId } = serviceConfigFormDs.current.get([
        'categoryId',
        'documentId',
      ]);
      fetchVariable({ categoryId, documentId }).then((res) => {
        if (isArray(res)) {
          setVariableList(res);
        }
      });
    }
  };

  useEffect(() => {
    if (record) {
      if (record.get('parameterSource') === 'VARIABLE') {
        fetchVariableList();
        setShowSelect(true);
      } else {
        setShowSelect(false);
      }
    } else {
      setShowSelect(false);
    }
  }, [record]);

  return (
    <Form record={record} labelLayout="float">
      <TextField name="parameterName" />
      <Select name="interfaceParameterTypeMeaning" />
      <TextField name="defaultValue" />
      <Select name="parameterSourceMeaningObj" onChange={changeParameterSourceMeaning} />
      {showSelect ? (
        <Select name="parameterValue">
          {variableList.map((item) => (
            <Select.Option value={item.variableName} key={item.variableName}>
              {item.description}
            </Select.Option>
          ))}
        </Select>
      ) : (
        <TextField name="parameterValue" />
      )}
      <TextField name="description" />
    </Form>
  );
};
