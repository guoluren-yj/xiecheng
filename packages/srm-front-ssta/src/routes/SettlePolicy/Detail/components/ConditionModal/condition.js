import React, { useEffect, useMemo, useCallback, Fragment } from 'react';
import intl from 'utils/intl';
import { Card, Tooltip, Icon } from 'choerodon-ui';
import { Form, Select, Lov, TextField, DataSet, CheckBox, SelectBox, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { conditionDS, customizeConditionCombinationDS } from '@/stores/SettleStrategyDS';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import { saveCondition } from '@/services/settleStrategyServices';
import { getResponse } from 'utils/utils';
import { ReactComponent as EmptyIcon } from '@/assets/empty.svg';
import DynamicAlert from '@/routes/Components/DynamicAlert';

import styles from './index.less';
import ConditionRuleViewerList from '@/components/ConditionRule/ViewerList';
import EditorForm from '@/routes/Components/EditorForm';

const { Option } = SelectBox;

const ConditionConfig = observer((props) => {
  const {
    conditionSelectDs,
    conditionInfo,
    recordCondition,
    configType,
    editFlag,
    modal,
    activeKey,
    settleConfigId,
    idField,
    parentConfigType,
    tableDs,
  } = props;

  const customizeConditionCombinationDs = useMemo(
    () => new DataSet(customizeConditionCombinationDS(recordCondition, configType, activeKey)),
    [customizeConditionCombinationDS, recordCondition, activeKey]
  );
  const conditionDs = useMemo(() => new DataSet(conditionDS(conditionSelectDs)), []);
  const enableCondFlag = customizeConditionCombinationDs.current?.get('enableCondFlag');

  useEffect(() => {
    if (!conditionInfo) {
      conditionDs.loadData([]);
      conditionDs.create({});
      customizeConditionCombinationDs.loadData([]);
      customizeConditionCombinationDs.create({
        enableCondFlag: recordCondition?.get('enableCondFlag'),
      });
    } else {
      const {
        conditionCombination,
        priority,
        description,
        conditionName,
        conditionJson,
        resultValue,
      } = conditionInfo || {};
      const lines = parseJson(conditionJson);
      const { conditionType, conditionLines, customizeConditionCombination } = lines;
      const resVal = parseJson(resultValue);
      conditionDs.loadData(conditionLines || []);
      customizeConditionCombinationDs.loadData([
        {
          conditionCombination,
          priority,
          description,
          conditionName,
          enableCondFlag: recordCondition?.get('enableCondFlag'),
          conditionType,
          customizeConditionCombination,
          ...resVal,
        },
      ]);
    }
  }, [
    conditionDs,
    customizeConditionCombinationDs,
    conditionInfo,
    parseJson,
  ]);

  useEffect(() => {
    customizeConditionCombinationDs.addEventListener('update', handleUpdateCollaborative);
    return () => {
      customizeConditionCombinationDs.removeEventListener('update', handleUpdateCollaborative);
    };
  }, [customizeConditionCombinationDs]);

  // 更新销售方可见
  const handleUpdateCollaborative = ({ record }) => {
    const typeCode = recordCondition?.get('typeCode');
    const { collaborativeModeCode } = record.get(['collaborativeModeCode']) || {};
    if (collaborativeModeCode === 'DOUBLE') {
      record.set('supplierViewFlag', 1);
    }
    if (!(typeCode === 'CONFIRM' && collaborativeModeCode === 'DOUBLE')) {
      record.set('founderCampCode', 'UNLIMIT');
    }
  };

  useEffect(() => {
    if (modal && editFlag) {
      modal.handleOk(handleOk);
    }
  }, [modal, editFlag]);

  // 解析JSON
  const parseJson = useCallback((str) => {
    let obj = {};
    try {
      obj = JSON.parse(str);
    } catch (e) {
      obj = {};
    }
    return obj;
  }, []);

  const isCollaborativeMode = useMemo(() => {
    return configType === 'collaborativeMode';
  }, [configType]);

  const handleOk = useCallback(async () => {
    const {
      conditionCombination,
      priority,
      description,
      conditionName,
      collaborativeModeCode,
      supplierViewFlag,
      founderCampCode,
      approvedMethodCode,
      enableCondFlag,
      conditionType,
    } =
      customizeConditionCombinationDs.current?.get([
        'conditionCombination',
        'priority',
        'description',
        'conditionName',
        'collaborativeModeCode',
        'supplierViewFlag',
        'founderCampCode',
        'approvedMethodCode',
        'enableCondFlag',
        'conditionType',
      ]) || {};
    // 如果没配置过且不启用 点确定直接关闭不调接口
    if (!conditionInfo && enableCondFlag === 0) {
      return true;
    }
    const validRes = await customizeConditionCombinationDs.validate();
    const validLineRes = await conditionDs.validate();
    if ((!validRes || !validLineRes) && enableCondFlag === 1) {
      return false;
    }

    const conditionLines = conditionDs.toData();
    const conditionCombinationTrim = conditionCombination?.replace(/\s+/g, '');
    const conditionJson = JSON.stringify({
      conditionType,
      conditionLines,
      customizeConditionCombination: conditionCombinationTrim,
    });
    const data = {
      ...conditionInfo,
      settleConfigId,
      documentType: activeKey.toUpperCase(),
      parentConfigType: parentConfigType[`${activeKey}_${idField}`],
      parentConfigId: recordCondition?.get(idField),
      conditionCombination: conditionCombinationTrim,
      conditionId: conditionInfo?.conditionId,
      conditionJson,
      priority,
      description,
      conditionName,
      enableCondFlag,
      resultValue: JSON.stringify(
        isCollaborativeMode
          ? { collaborativeModeCode, supplierViewFlag, founderCampCode }
          : { approvedMethodCode }
      ),
    };
    const res = getResponse(await saveCondition(data));
    if (!res) return false;
    modal.close();
    if (tableDs) {
      tableDs.query(undefined, undefined, true);
    }
    // configConditionListDs.query();
  }, [
    customizeConditionCombinationDs,
    tableDs,
    customizeConditionCombinationDs,
    conditionDs,
    conditionInfo,
  ]);

  const getFieldValue = useCallback(() => {
    const conditionType = customizeConditionCombinationDs?.current?.get('conditionType');
    const conditionCombination = customizeConditionCombinationDs?.current?.get('conditionCombination');
    if (conditionType === 'OR' || conditionType === 'AND') {
      const effectiveCondition = conditionDs?.records?.filter(
        record => record.status !== 'delete'
      ) || [];
      if (effectiveCondition.length === 0) {
        return '';
      } else if (effectiveCondition.length === 1) {
        return '1';
      } else {
        return effectiveCondition
          .map((_, index) => index + 1)
          .join(` ${conditionType} `);
      }
    } else {
      return conditionCombination;
    }
  }, [conditionDs, customizeConditionCombinationDs]);


  if (customizeConditionCombinationDs && customizeConditionCombinationDs.current) {
    customizeConditionCombinationDs.current.set('conditionCombination', getFieldValue());
  }

  const changeRightValueComponent = useCallback((record, value) => {
    record.setState({
      value,
    });
  }, []);

  const changeFieldComponent = useCallback(
    (record, value) => {
      const selectRecord = conditionSelectDs?.find((v) => v?.get('fieldNum') === value);
      const { lovCode, componentType } = selectRecord?.get(['lovCode', 'componentType']) || {};
      record.set({
        lovCode,
        componentType,
      });
    },
    [conditionSelectDs]
  );

  const renderRightValue = useCallback(
    (record) => {
      if (!record.get('operator') || ['EXISTS', 'NOT_EXISTS'].includes(record.get('operator'))) {
        return <TextField disabled colSpan={6} />;
      } else {
        const basicConfig = {
          disabled:
            !record.get('leftValue') ||
            !record.get('operator') ||
            ['EXISTS', 'NOT_EXISTS'].includes(record.get('operator')) ||
            !editFlag,
          name: 'rightValue',
          clearButton: false,
          colSpan: 6,
        };

        if (record.get('componentType') === 'LOV') {
          return <Lov {...basicConfig} />;
        }

        if (record.get('componentType') === 'SELECT') {
          return <Select {...basicConfig} />;
        }

        return <TextField {...basicConfig} />;
      }
    },
    [editFlag]
  );

  const tips = useMemo(() => {
    return isCollaborativeMode
      ? intl
          .get(`ssta.settleStrategy.view.settleStrategy.collaborativeCondition`)
          .d(
            '协同模式列表中设置默认协同模式。当启用条件配置时，则按条件配置中设置的返回规则执行协同模式，若条件未匹配到，则按协同模式列表中的设置执行默认协同模式'
          )
      : intl
          .get(`ssta.settleStrategy.view.settleStrategy.approveCondition`)
          .d(
            '审批方式列表中设置默认审批方式。当启用条件配置时，则按条件配置中设置的返回规则执行审批方式，若条件未匹配到，则按审批方式列表中的设置执行默认审批方式'
          );
  }, [isCollaborativeMode]);

  const backRuleEditorColumns = useMemo(() => {
    return isCollaborativeMode
      ? [
          { name: 'collaborativeModeCode', editor: Select },
          {
            name: 'supplierViewFlag',
            editor: Select,
            renderer: ({ text }) => (recordCondition?.get('typeCode') !== 'CANCEL' ? text : null),
          },
        ]
      : [{ name: 'approvedMethodCode', editor: Select }];
  }, [recordCondition, isCollaborativeMode]);

  const createCondition = useCallback(() => {
    conditionDs.create({});
  }, [conditionDs]);

  const deleteRightValue = useCallback((record) => {
    conditionDs.delete(record);
  }, [conditionDs]);

  const getConditionRule = useCallback(() => {
    if (editFlag) {
      return (
        <div>
          <Form
            dataSet={customizeConditionCombinationDs}
            columns={2}
            labelLayout="float"
            className="rules-definition-editor-header"
          >
            <SelectBox
              // label={intl.get('ssta.settleStrategy.model.settleStrategy.conditionType').d('策略逻辑')}
              name="conditionType"
              colSpan={2}
              style={{ marginBottom: 16 }}
            >
              {/* <Option value="TRUE">
                {intl.get('ssta.settleStrategy.model.settleStrategy.true').d('无条件限制')}
              </Option> */}
              <Option value="OR">
                {intl.get('ssta.settleStrategy.model.settleStrategy.or').d('满足任一条件')}
              </Option>
              <Option value="AND">
                {intl.get('ssta.settleStrategy.model.settleStrategy.and').d('满足所有条件')}
              </Option>
              <Option value="CUSTOMIZE">
                {intl.get('ssta.settleStrategy.model.settleStrategy.customize').d('自定义组合规则')}
              </Option>
            </SelectBox>
          </Form>
          <div className='rules-definition-editor-wrapper'>
            {
              conditionDs &&
              conditionDs.length > 0 &&
              conditionDs.map((record) => {
                if (record.status !== 'delete') {
                  return (
                    <div key={record.index} className={styles['condition-editor-form-wrapper']}>
                      <Form columns={20} record={record} labelLayout="float">
                        <div colSpan={1}>#{record.index + 1}</div>
                        <Select
                          name="leftValue"
                          onChange={(value) => changeFieldComponent(record, value)}
                          colSpan={6}
                        />
                        <Select
                          name="operator"
                          disabled={!record.get('leftValue')}
                          colSpan={6}
                          onChange={(value) => changeRightValueComponent(record, value)}
                          optionsFilter={(options) => {
                            if (record.get('componentType') === 'TEXT') {
                              return !['IN', 'NOT_IN'].includes(options?.data?.value);
                            } else {
                              return true;
                            }
                          }}
                        />
                        {renderRightValue(record)}
                        <Button
                          icon="delete"
                          colSpan={1}
                          shape="circle"
                          funcType="flat"
                          onClick={() => {
                            deleteRightValue(record);
                          }}
                        />
                      </Form>
                    </div>
                  );
                } else {
                  return null;
                }
              })
            }
            <Form dataSet={customizeConditionCombinationDs} labelLayout="float" columns={20}>
              <div colSpan={1} />
              <Tooltip
                title={intl.get('ssta.settleStrategy.view.card.button.add').d('新建条件规则')}
                colSpan={18}
              >
                <a
                  className="rules-definition-control-point"
                  onClick={createCondition}
                  colSpan={18}
                >
                  <Icon type="control_point" />
                </a>
              </Tooltip>
              {conditionDs && conditionDs.records && conditionDs.records.length > 0 && (
              <>
                {/* 这两个div用来进行跨行布局 */}
                <div colSpan={1} />
                <div colSpan={1} />
                <TextField
                  name="conditionCombination"
                  colSpan={18}
                  help={intl
                    .get('ssta.settleStrategy.view.message.title.tips3')
                    .d('使用条件编号及AND、OR编写运算规则。示例(1 OR 2) AND 3')}
                  disabled={customizeConditionCombinationDs.current?.get('conditionType') !== 'CUSTOMIZE'}
                />
              </>
            )}
            </Form>
          </div>
        </div>
      );
    } else {
      const title = {
        'OR': intl.get('ssta.settleStrategy.model.settleStrategy.or').d('满足任一条件'),
        'AND': intl.get('ssta.settleStrategy.model.settleStrategy.and').d('满足所有条件'),
        'CUSTOMIZE': intl.get('ssta.settleStrategy.model.settleStrategy.customize').d('自定义组合规则'),
      };
      const { conditionCombination, conditionType } = customizeConditionCombinationDs?.current?.get(['conditionCombination', 'conditionType']) || {};
      return (
        <ConditionRuleViewerList
          dataSet={conditionDs}
          fieldsConfig={{
            origin: { alias: 'leftValue' },
            relation: { alias: 'operator' },
            target: { alias: 'rightValue' },
          }}
          conditionCombination={conditionCombination}
          conditionTitle={title[conditionType]}
        />
      );
    }
  }, [editFlag, conditionDs, renderRightValue, changeFieldComponent, changeRightValueComponent, deleteRightValue, createCondition, customizeConditionCombinationDs]);

  return (
    <Fragment>
      <DynamicAlert placement="modal-top" message={tips} />
      {editFlag && (
        <CheckBox
          name="enableCondFlag"
          dataSet={customizeConditionCombinationDs}
          style={{ marginBottom: 16 }}
        >
          {customizeConditionCombinationDs?.getField('enableCondFlag')?.get('label')}
        </CheckBox>
      )}
      {Number(enableCondFlag) === 1 ? (
        <div className={styles['rules-definition-editor']}>
          <Card
            title={intl.get('ssta.settleStrategy.model.common.conditionRule').d('条件规则')}
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
          >
            {getConditionRule()}
          </Card>
          <Card
            title={intl.get('ssta.settleStrategy.model.common.backRule').d('返回规则')}
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
          >
            <EditorForm
              columns={3}
              editorFlag={editFlag}
              editorColumns={backRuleEditorColumns}
              dataSet={customizeConditionCombinationDs}
            />
          </Card>
        </div>
      ) : (
        <div className={styles['fx-condition-empty']}>
          <div className="empty_img">
            <EmptyIcon />
          </div>
          <div className="empty_text">
            {intl.get('ssta.settleStrategy.model.common.emptyConfig').d('暂无配置')}
          </div>
        </div>
      )}
    </Fragment>
  );
});

export default ConditionConfig;
