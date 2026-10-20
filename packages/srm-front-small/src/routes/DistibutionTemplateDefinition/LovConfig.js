/**
 * 值集配置
 */
import React, { useMemo, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Badge } from 'choerodon-ui';
import { Table, Select, TextField, CheckBox, Form, Output, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import Card from '@/components/Card';

const DeleteButton = observer(({dataSet, onClick = e => e, children}) => (
  <Button
    funcType="flat"
    icon="delete_sweep"
    color="primary"
    disabled={dataSet.selected.length < 1}
    onClick={onClick}
  >
    {children || intl.get('hzero.common.button.batchDelete').d('批量删除')}
  </Button>
));

export default function LovConfig(props) {
  const {
    editEnable,
    isCreate,
    dataSet,
    fieldParamsConfigDS,
    fieldAssociatConfigDS,
    deleteFieldRecord = (e) => e,
  } = props;

  const editFlag = useMemo(() => editEnable || isCreate, [editEnable, isCreate]);

  useEffect(() => {
    fieldParamsConfigDS.selection = editFlag ? 'multiple' : false;
    fieldAssociatConfigDS.selection = editFlag ? 'multiple' : false;
  }, [editFlag]);

  const paraColumns = [
    {
      width: 150,
      name: 'parameterKey',
      editor: editFlag,
    },
    {
      width: 150,
      name: 'parameterType',
      editor: editFlag ? (
        <Select
          onChange={() => {
            fieldParamsConfigDS.current.set('parameterValue', null);
          }}
        />
      ) : (
        false
      ),
    },
    {
      width: 200,
      name: 'parameterValue',
      editor: (record) => {
        if (editFlag) {
          if (['DIMENSION', 'PRODUCT'].includes(record.get('parameterType'))) {
            return <Select />;
          } else {
            return <TextField />;
          }
        } else {
          return false;
        }
      },
    },
  ];
  const assocColumns = [
    {
      width: 150,
      name: 'currentField',
      editor: editFlag ? <Select /> : false,
    },
    {
      width: 150,
      name: 'targetDimension',
      editor: editFlag ? <Select /> : false,
    },
    {
      width: 200,
      name: 'targetField',
      editor: editFlag ? <Select /> : false,
    },
  ];
  const outPutRender = ({ value }) => (
    <Badge color={value ? '#3AB344' : '#f05434'} text={value ? intl.get('hzero.common.status.yes').d('是') : intl.get('hzero.common.status.no').d('否')} />
  );
  return (
    <>
      <Card
        title={intl.get('small.common.view.lovParaConfig').d('值集参数配置')}
        titleStyle={{ fontWeight: 600, marginBottom: 16 }}
      >
        <Table
          dataSet={fieldParamsConfigDS}
          buttons={editFlag ? ['add', <DeleteButton dataSet={fieldParamsConfigDS} onClick={() => deleteFieldRecord(fieldParamsConfigDS.selected, 'lovPara')} />] : []}
          pagination={false}
          columns={paraColumns}
          customizedCode="LOV_CONFIG_PARAMS_TABLE"
        />
      </Card>
      <Card
        title={intl.get('small.common.view.lovAssociatConfig').d('关联字段配置')}
        titleStyle={{ fontWeight: 600, marginBottom: 16 }}
      >
        <Table
          dataSet={fieldAssociatConfigDS}
          buttons={editFlag ? ['add', <DeleteButton dataSet={fieldAssociatConfigDS} onClick={() => deleteFieldRecord(fieldAssociatConfigDS.selected, 'lovAssoc')} />] : []}
          pagination={false}
          columns={assocColumns}
          customizedCode="LOV_CONFIG_ASSOCIAT_TABLE"
        />
      </Card>
      {dataSet?.current?.get('componentType') === 'LOV' && (
        <Card
          title={intl.get('small.common.view.treeSelectconfig').d('其他相关配置')}
          titleStyle={{ fontWeight: 600, marginBottom: 16 }}
        >
          <Form
            labelLayout={editFlag ? 'horizontal' : 'vertical'}
            className="c7n-pro-vertical-form-display"
            dataSet={dataSet}
            columns={2}
          >
            {editFlag ? (
              <>
                <CheckBox disabled={!editFlag} name="treeSelectFlag">
                  {intl.get('small.cartTemplate.field.treeSelectFlag').d('仅选择值集树最末层数据')}
                </CheckBox>
                <CheckBox disabled={!editFlag} name="translateFlag">
                  {intl.get('small.cartTemplate.field.translateFlag').d('值集需要翻译')}
                </CheckBox>
              </>
            ) : (
              <>
                <Output
                  name="treeSelectFlag"
                  renderer={outPutRender}
                  label={intl
                    .get('small.cartTemplate.field.treeSelectFlag')
                    .d('仅选择值集树最末层数据')}
                />
                <Output
                  name="translateFlag"
                  renderer={outPutRender}
                  label={intl.get('small.cartTemplate.field.translateFlag').d('值集需要翻译')}
                />
              </>
            )}
          </Form>
        </Card>
      )}
    </>
  );
}
