import React, { useMemo, useEffect, useCallback, useState } from 'react';
import { Row, Col, Icon } from 'choerodon-ui';
import { DataSet, Form, Table, TextField, TextArea, Select, Lov, Spin, Modal, Switch, Tooltip } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { SelectionMode, TableMode, TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import { ShowHelp } from 'choerodon-ui/pro/lib/field/enum';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import intl from 'hzero-front/lib/utils/intl';

import { getResponse } from 'hzero-front/lib/utils/utils';

import { queryInputDs, queryOutputDs, queryEditInputDs, queryEditOutputDs, getDataConversionDetail } from '@/services/interfaceDefinitionService';
import CreateUid from '@/utils/getUuid';

import RuleModal from './StrRightTable/RuleModal';

import styles from './index.less';

interface DataConversionModalProps {
  dataFormDs: DataSet,
  dataConversionDs: DataSet,
  dataScriptDs: DataSet,
  dataInputDs: DataSet,
  dataOutputDs: DataSet,
  data: any,
  editFlag: boolean,
}

const DataConversionModal: React.FC<DataConversionModalProps> = ({ dataFormDs, dataConversionDs, dataScriptDs, dataInputDs, dataOutputDs, data, editFlag }) => {
  const [state, setState] = useState({
    convertTypeValue: data.convertType ? data.convertType : '',
    spinFlag: false,
    fieldCodeFlag: data.targetFieldId,
  });

  useEffect(() => {
    const {
      convertType,
      openInterfaceConvertId,
    } = data;
    // 编辑的情况下，显示表格数据
    if (convertType && openInterfaceConvertId) {
      setState(preState => ({
        ...preState,
        spinFlag: true,
      }));
      getDataConversionDetail(convertType, openInterfaceConvertId).then(res => {
        const result = getResponse(res);
        if (result) {
          const {
            sourceCategory,
            sourceValue,
            sourceRemark,
            lineParamName,
            lineStructure,
            conditionConvertList = [],
          } = result;
          if (dataFormDs.current) {
            dataFormDs.current.set({ ...result, openInterfaceConvertId });
          }
          if (convertType === 'MODULE') {
            getModuleTable(openInterfaceConvertId);
          } else if (convertType === 'SOURCE') {
            dataConversionDs.loadData([{
              sourceCategory,
              sourceValue,
              sourceRemark,
              lineParamName,
              lineStructure,
            }]);
          } else if (convertType === 'CONDITION') {
            dataScriptDs.loadData(conditionConvertList);
          }
        }
      }).finally(() => {
        setState(preState => ({
          ...preState,
          spinFlag: false,
        }));
      });
    }
  }, [dataFormDs, dataConversionDs, dataScriptDs]);

  const handleSourceCategory = useCallback(() => {
    if (dataConversionDs.current) {
      dataConversionDs.current.set({ sourceValueObj: '', sourceValue: '', lineParamName: '', lineStructure: '' });
    }
  }, [dataConversionDs]);

  const dataConversionColumns = useMemo(
    (): ColumnProps[] => [
      {
        name: 'sourceCategory',
        editor: <Select onChange={handleSourceCategory} />,
      },
      {
        name: 'sourceValueObj',
        header: (
          <span>
            {intl.get('hitf.common.dataTransform.sourceValue').d('默认值')}
            <Tooltip
              title={() => {
                return (
                  <span>
                    {intl.get('hitf.common.dataTransform.sourceValue.tip1').d('转换类型 = 值时')}
                    <br />
                    {intl.get('hitf.common.dataTransform.sourceValue.tip2').d('当外部入参为空时，取默认值配置；当外部入参非空时，取外部传入值。')}
                  </span>
                );
              }}
            >
              <Icon
                type='help'
                style={{
                  cursor: 'pointer',
                  color: '#a5a5a5',
                  fontSize: '16px',
                  marginLeft: '5px',
                }}
              />
            </Tooltip>
          </span>
        ),
        editor: (record) => record.get('sourceCategory') === 'SOURCE_FIELD' ? (
          // dataFormDs.current?.get('targetFieldLov') ? (
          <Lov
            tableProps={
                {
                  mode: TableMode.tree,
                  defaultRowExpanded: true,
                  selectionMode: SelectionMode.dblclick,
                }
              }
            onBeforeSelect={(records)=>{
                // @ts-ignore
                return records.get('interfaceParamLineId') || false;
              }}
          />
          // ) : false
        ) : record.get('sourceCategory') === 'VALUE' ? <TextField /> : false,
      },
      {
        name: 'lineStructure',
        editor: false,
      },
      {
        name: 'sourceRemark',
        editor: true,
      },
    ],
    [dataFormDs]
  );

  const columns = useMemo(
    (): ColumnProps[] => [
      {
        name: 'enabledFlag',
        editor: <Switch />,
      },
      {
        name: 'fieldCode',
      },
      {
        name: 'fieldDesc',
      },
      {
        name: 'fieldType',
      },
      {
        name: 'targetFieldLov',
        editor: <Lov
          tableProps={
            {
              mode: TableMode.tree,
              defaultRowExpanded: true,
              selectionMode: SelectionMode.dblclick,
            }
          }
          onBeforeSelect={(records)=>{
            // @ts-ignore
            return records.get('interfaceParamLineId') || false;
          }}
        />,
      },
      {
        name: 'structure',
        editor: false,
      },
      {
        name: 'remark',
        editor: false,
      },
      {
        name: 'paramType',
        editor: false,
      },
    ],
    []
  );

  // 条件规则
  const openModal = useCallback((record) => {
    const recordData = record.toData();
    const ruleModalProps = {
      recordObj: recordData,
      record,
      defaultSelectId: dataFormDs.current?.get('interfaceParamHeaderId'),
    };
    Modal.open({
      title: intl.get('hitf.common.view.card.conditionEngine').d('条件引擎'),
      closable: true,
      maskClosable: true,
      destroyOnClose: true,
      drawer: true,
      style: { width: '742px' },
      children: <RuleModal {...ruleModalProps} />,
      footer: false,
    });
  }, [dataScriptDs, dataFormDs]);

  const conditionColumns = useMemo(
    (): ColumnProps[] => [
      {
        name: 'targetValue',
        editor: true,
      },
      {
        name: 'remark',
        editor: true,
      },
      {
        name: 'conditionCode',
        renderer: ({ record }) => {
          const code = record?.get('conditionCode');
          return code ? (
            <span className={styles['link-span']} onClick={() => openModal(record)}>
              {intl.get('hzero.common.conditionRule').d('条件规则')}
            </span>
          ) : null;
        },
      },
      {
        name: 'key',
      },
    ],
    []
  );

  // 选择数据映射类型
  const handleChangeType = useCallback((value) => {
    setState(preState => ({
      ...preState,
      convertTypeValue: value,
    }));
    if (value === 'SOURCE') {
      dataConversionDs.loadData([{
        sourceCategory: '',
        sourceValue: '',
        sourceRemark: '',
      }]);
    }
    if (!value && dataFormDs.current) {
      dataFormDs.current.set('targetFieldLov', {});
    }
  }, [dataFormDs, dataConversionDs]);

  // 编辑详情页时获取组件表格值
  const getModuleTable = useCallback((moduleHeaderId) => {
    queryEditInputDs(moduleHeaderId).then(res => {
      const result = getResponse(res);
      if (result) {
        result.forEach(item => {
          dataInputDs.create(item);
        });
      }
    });
    queryEditOutputDs(moduleHeaderId).then(res => {
      const result = getResponse(res);
      if (result) {
        result.forEach(item => {
          dataOutputDs.create(item);
        });
      }
    });
  }, [dataInputDs, dataOutputDs]);

  // 修改lov时获取组件表格值
  const handleModuleTable = useCallback((moduleHeaderId) => {
    queryInputDs(moduleHeaderId).then(res => {
      const result = getResponse(res);
      if (result) {
        result.forEach(item => {
          dataInputDs.create(item);
        });
      }
    });
    queryOutputDs(moduleHeaderId).then(res => {
      const result = getResponse(res);
      if (result) {
        result.forEach(item => {
          dataOutputDs.create(item);
        });
      }
    });
  }, [dataInputDs, dataOutputDs]);

  const handleLovChange = useCallback((value) => {
    dataInputDs.forEach(record => {
      dataInputDs.remove(record, true);
    });
    dataOutputDs.forEach(record => {
      dataOutputDs.remove(record, true);
    });
    if (value) {
      const {
        moduleCode = '',
        moduleName = '',
        moduleDesc = '',
        moduleHeaderId = '',
      } = value;
      if (dataFormDs.current) {
        dataFormDs.current.set({
          moduleCode,
          moduleName,
          moduleDesc,
          moduleHeaderId,
        });
      }
      handleModuleTable(moduleHeaderId);
    } else if (dataFormDs.current) {
      dataFormDs.current.set({
        moduleCode: '',
        moduleName: '',
        moduleDesc: '',
      });
    }
  }, [dataFormDs, dataInputDs, dataOutputDs]);

  // 修改字段编码
  const handleFieldCodeChange = useCallback((value) => {
    setState(preState => ({
      ...preState,
      fieldCodeFlag: Boolean(value),
    }));
    if (dataFormDs.current) {
      const type = dataFormDs.current.get('convertType');
      if (type === 'CONDITION') {
        // 条件
        const field: any = dataScriptDs.getField('targetFieldLov');
        field.setLovPara('interfaceParamHeaderId', value ? value.interfaceParamHeaderId : null);
        if (dataScriptDs.current) {
          // 字段编码的interfaceParamHeaderId改变，则表格数据中的来源值清空
          dataScriptDs.current.set('targetFieldLov', null);
          dataScriptDs.forEach((item: any) => {
            const { interfaceParamHeaderId } = item.get('targetFieldLov');
            if (interfaceParamHeaderId !== value.interfaceParamHeaderId || !value) {
              item.set('targetFieldLov', null);
            }
          });
        }
      }
    }
  }, [dataFormDs, dataConversionDs, dataScriptDs]);

  const formRender = useMemo(() => {
    return (
      <Form dataSet={dataFormDs} labelLayout={LabelLayout.float}>
        <Row gutter={16}>
          <Col span={12} className={styles['form-col']}>
            <Select name="convertType" onChange={handleChangeType} />
          </Col>
          <Col span={12} className={styles['form-col']}>
            <Select name="enableFlag" />
          </Col>
        </Row>
        {state.convertTypeValue && state.convertTypeValue !== 'MODULE' && (
          <Row gutter={16}>
            <Col span={12} className={styles['form-col']}>
              <Lov
                name="targetFieldLov"
                tableProps={
                  {
                    mode: TableMode.tree,
                    defaultRowExpanded: true,
                    selectionMode: SelectionMode.dblclick,
                  }
                }
                onBeforeSelect={(record)=>{
                  // @ts-ignore
                  return record.get('interfaceParamLineId') || false;
                }}
                onChange={handleFieldCodeChange}
                onClear={() => handleFieldCodeChange(null)}
              />
            </Col>
            <Col span={12} className={styles['form-col']}>
              <TextField name="formStructure" disabled />
            </Col>
          </Row>
        )}
        {state.convertTypeValue === 'MODULE' && (
          <Row gutter={16}>
            <Col span={12} className={styles['form-col']}>
              <Lov name="moduleLov" onChange={handleLovChange} disabled={editFlag} />
            </Col>
            <Col span={12} className={styles['form-col']}>
              <TextField name="moduleName" />
            </Col>
          </Row>
        )}
        {state.convertTypeValue === 'MODULE' && (
          <Row gutter={16}>
            <Col span={12} className={styles['form-col']}>
              <TextField name="moduleDesc" />
            </Col>
            <Col span={12} className={styles['form-col']}>
              <Select
                name="checkFlag"
                help={intl.get('dataConversion.component.check.flag').d('开启校验后，出参如查询空值则报错')}
                showHelp={ShowHelp.tooltip}
              />
            </Col>
          </Row>
        )}
        <Row gutter={16}>
          <Col span={24} className={styles['form-col']}>
            <TextArea name="remark" />
          </Col>
        </Row>
      </Form>
    );
  }, [dataFormDs, state.convertTypeValue]);

  // 增加条件类型表格数据
  const handleAdd = useCallback(() => {
    const uuid = CreateUid();
    dataScriptDs.create({ conditionCode: `conditionLineCode${uuid}` }, 0);
  }, [dataScriptDs]);

  // 删除条件类型表格数据
  const handleAfterDelete = useCallback(() => {
    const {
      convertType,
      openInterfaceConvertId,
    } = data;
    // 删除后重新查询弹窗内数据
    if (convertType && openInterfaceConvertId) {
      setState(preState => ({
        ...preState,
        spinFlag: true,
      }));
      getDataConversionDetail(convertType, openInterfaceConvertId).then(res => {
        const result = getResponse(res);
        if (result) {
          const {
            conditionConvertList = [],
          } = result;
          if (dataFormDs.current) {
            dataFormDs.current.set({ ...result, openInterfaceConvertId });
          }
          dataScriptDs.loadData(conditionConvertList);
        }
      }).finally(() => {
        setState(preState => ({
          ...preState,
          spinFlag: false,
        }));
      });
    }
  }, [dataFormDs, dataScriptDs]);

  const handleDelete = useCallback(() => {
    dataScriptDs.delete(dataScriptDs.selected, {
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('hzero.common.view.delete_selected_row_confirm').d('确认删除选中行？'),
    });
  }, [dataScriptDs]);

  return (
    <Spin spinning={state.spinFlag}>
      <div className={styles['modal-card']}>
        <div className={styles.header}>
          <span className={styles['header-border']} />
          <span>{intl.get('hzero.common.view.title.baseInfo').d('基本信息')}</span>
        </div>
        {formRender}
      </div>
      {state.convertTypeValue === 'SOURCE' && (
        <div className={styles['modal-card']}>
          <div className={styles.header}>
            <span className={styles['header-border']} />
            <span>{intl.get('hitf.common.data.conversion.detail').d('公式转换明细')}</span>
          </div>
          <Table
            dataSet={dataConversionDs}
            columns={dataConversionColumns}
            selectionMode={SelectionMode.none}
          />
        </div>
      )}
      {state.convertTypeValue === 'CONDITION' && (
        <div className={styles['modal-card']}>
          <div className={styles.header}>
            <span className={styles['header-border']} />
            <span>{intl.get('hzero.common.condition').d('条件')}</span>
          </div>
          <Table
            dataSet={dataScriptDs}
            columns={conditionColumns}
            buttons={[
              [TableButtonType.add, { disabled: !state.fieldCodeFlag, onClick: handleAdd }],
              [TableButtonType.delete, { onClick: handleDelete, afterClick: handleAfterDelete }],
            ]}
          />
        </div>
      )}
      {state.convertTypeValue === 'MODULE' && (
        <>
          <div className={styles['modal-card']}>
            <div className={styles.header}>
              <span className={styles['header-border']} />
              <span>{intl.get('hitf.common.rule.enter').d('入参')}</span>
            </div>
            <Table
              dataSet={dataInputDs}
              columns={columns}
              selectionMode={SelectionMode.none}
            />
          </div>
          <div className={styles['modal-card']}>
            <div className={styles.header}>
              <span className={styles['header-border']} />
              <span>{intl.get('hitf.common.rule.out').d('出参')}</span>
            </div>
            <Table
              dataSet={dataOutputDs}
              columns={columns}
              selectionMode={SelectionMode.none}
            />
          </div>
        </>
      )}
    </Spin>
  );
};

export default React.memo(formatterCollections({
  code: ['hzero.common', 'hitf.common', 'hitf.application', 'dataConversion.component'],
})(DataConversionModal));
