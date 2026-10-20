import React, { useEffect } from 'react';
import { Modal, Button, Table, DataSet } from 'choerodon-ui/pro';
import { Popconfirm } from 'choerodon-ui';
import { isArray } from 'lodash';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import ParameterForm from './ParameterForm';
import { getServiceExpressionForm } from './serviceStoreDs';

let uid = Date.now();
const modalKey = Modal.key();
function ExpressionParameter(props = {}) {
  const {
    categoryId,
    // documentId,
    formDocumentId,
    isPredefined,
    serviceExpressionTableDs,
    parameterList = [],
    serviceExpressionFormDs,
  } = props;

  useEffect(() => {
    serviceExpressionFormDs.getField('parameterValueObj').setLovPara('categoryId', categoryId);
    serviceExpressionFormDs.getField('parameterValueObj').setLovPara('documentId', formDocumentId);
    serviceExpressionFormDs.getField('rightParameterValueObj').setLovPara('categoryId', categoryId);
    serviceExpressionFormDs
      .getField('rightParameterValueObj')
      .setLovPara('documentId', formDocumentId);
    if (isArray(parameterList)) {
      serviceExpressionTableDs.loadData(parameterList);
    }
  }, [categoryId, formDocumentId, parameterList]);

  const createUid = () => {
    return `spz_${(uid++).toString(36)}`;
  };

  const editServiceExpression = (record) => {
    let recordData = {};
    if (record) {
      recordData = record.toData();
    }
    const newRecord = serviceExpressionFormDs.create(recordData, 0);
    Modal.open({
      key: modalKey,
      title: intl.get('hwfp.serviceDefinition.view.title.editParams').d('编辑参数'),
      children: <ParameterForm record={newRecord} />,
      drawer: true,
      style: {
        width: '380px',
      },
      onOk: async () => {
        const res = await serviceExpressionFormDs.validate();
        if (res) {
          const parameterCreateId = newRecord.get('parameterCreateId');
          if (!parameterCreateId) {
            newRecord.set('parameterCreateId', createUid());
          }
          if (newRecord.get('parameterId') && record) {
            const dataList = serviceExpressionTableDs
              .toData()
              .filter((item) => item.parameterId !== newRecord.get('parameterId'));
            serviceExpressionTableDs.loadData(dataList);
          } else if (parameterCreateId && record) {
            const dataList = serviceExpressionTableDs
              .toData()
              .filter((item) => item.parameterCreateId !== parameterCreateId);
            serviceExpressionTableDs.loadData(dataList);
          }
          serviceExpressionTableDs.appendData([newRecord.toData()]);
        } else {
          return false;
        }
      },
      onClose: () => {
        serviceExpressionFormDs.reset(newRecord);
      },
    });
  };

  const deleteRecord = (record) => {
    if (record) {
      const { parameterId, parameterCreateId } = record.get(['parameterId', 'parameterCreateId']);
      if (parameterId) {
        const dataList = serviceExpressionTableDs
          .toData()
          .filter((item) => item.parameterId !== parameterId);
        serviceExpressionTableDs.loadData(dataList);
      } else if (parameterCreateId) {
        const dataList = serviceExpressionTableDs
          .toData()
          .filter((item) => item.parameterCreateId !== parameterCreateId);
        serviceExpressionTableDs.loadData(dataList);
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
      width: 120,
    },
    {
      name: 'parameterValue',
      width: 200,
    },
    {
      name: 'parameterDescription',
      width: 220,
    },
    {
      name: 'parameterSourceMeaning',
      width: 150,
    },
    {
      name: 'operator',
      width: 120,
    },
    {
      name: 'rightParameterValue',
      width: 200,
    },
    {
      name: 'rightParameterDescription',
      minWidth: 220,
    },
    {
      name: 'rightParameterSourceMeaning',
      width: 150,
    },
    ...optionColumn,
  ];

  const buttons = isPredefined
    ? []
    : [
      <Button onClick={() => editServiceExpression()} icon="playlist_add">
        {intl
            .get('hwfp.serviceDefinition.action.button.addExpressionParameter')
            .d('新增表达式参数')}
      </Button>,
      ];

  return (
    <>
      <div className="service-definition-title">
        <span>{intl.get('hzero.common.model.param').d('参数')}</span>
      </div>
      <Table dataSet={serviceExpressionTableDs} columns={columns} buttons={buttons} />
    </>
  );
}

export default formatterCollections({
  code: ['hzero.common'],
})(
  withProps(
    () => {
      const serviceExpressionFormDs = new DataSet(getServiceExpressionForm());
      return {
        serviceExpressionFormDs,
      };
    },
    { cacheState: true }
  )(ExpressionParameter)
);
