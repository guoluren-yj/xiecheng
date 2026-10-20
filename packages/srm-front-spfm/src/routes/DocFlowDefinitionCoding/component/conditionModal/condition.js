import React, { useEffect } from 'react';
import intl from 'utils/intl';
import { Popconfirm, Tooltip, List, Row, Col } from 'choerodon-ui';
import { Form, Button, Select, Lov, TextField, Icon, Output } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import editorsArr from '../../../../assets/editorsArr.svg';
import styles from './index.less';

const ConditionConfig = observer(
  ({ condition, conditionDs, customizeConditionCombinationDs, disabled, editors }) => {
    useEffect(() => {
      if (condition.conditionLines && condition.conditionLines.length) {
        conditionDs.loadData(condition.conditionLines);
        customizeConditionCombinationDs.loadData([
          {
            conditionCombination: condition.customizeConditionCombination,
          },
        ]);
      } else {
        conditionDs.loadData([]);
        if(editors) conditionDs.create({});
        customizeConditionCombinationDs.loadData([]);
        if(editors) customizeConditionCombinationDs.create({});
        setCustomizeConditionCombination();
      }
    }, []);

    const LovCmp = editors ? Lov : Output;
    const SelCmp = editors ? Select : Output;
    const TextCmp = editors ? TextField : Output;

    const getFieldValue = () => {
      const effectiveCondition = conditionDs.records.filter((record) => record.status !== 'delete');
      const conditionCombination = customizeConditionCombinationDs.current.get(
        'conditionCombination'
      );
      if (effectiveCondition.length === 0) {
        return '';
      } else if (effectiveCondition.length === 1) {
        return '1';
      } else {
        if (conditionCombination && conditionCombination.includes(effectiveCondition.length)) {
          return conditionCombination;
        }
        return `${conditionCombination} AND ${effectiveCondition.length}`;
      }
    };

    const setCustomizeConditionCombination = () => {
      if (customizeConditionCombinationDs && customizeConditionCombinationDs.current) {
        customizeConditionCombinationDs.current.set('conditionCombination', getFieldValue());
      }
    };

    const changeRightValueComponent = (record, value) => {
      record.setState({
        value,
      });
    };

    const deleteRightValue = (record) => {
      conditionDs.remove(record);
      if (conditionDs?.records?.length === 0) {
        // eslint-disable-next-line no-unused-expressions
        customizeConditionCombinationDs.getField('conditionCombination')?.set('required', false);
      }
      setCustomizeConditionCombination();
    };

    const renderRightValue = (record) => {
      // if (!record.get('operator') || ['EXISTS', 'NOT_EXISTS'].includes(record.get('operator'))) {
      //   return <div colSpan={6} />;
      // } else {
      const basicConfig = {
        colSpan: 13,
        disabled:
          !record.get('leftValue') ||
          !record.get('operator') ||
          ['EXISTS', 'NOT_EXISTS'].includes(record.get('operator')) ||
          disabled,
        name: 'rightValue',
        clearButton: false,
      };

      if (record.get('leftValue')?.type === 'LOV') {
        return <LovCmp {...basicConfig} />;
      }

      if (record.get('leftValue')?.type === 'SINGLE_SELECT') {
        return <SelCmp {...basicConfig} />;
      }

      return <TextCmp {...basicConfig} />;
      // }
    };

    const createCondition = () => {
      conditionDs.create({});
      if (conditionDs?.records?.length) {
        // eslint-disable-next-line no-unused-expressions
        customizeConditionCombinationDs.getField('conditionCombination')?.set('required', true);
      }
      setCustomizeConditionCombination();
    };

    return (
      <div className={styles['fx-condition-editor']}>
        <div className="fx-condition-editor-wrapper" />
        <div style={{width: '100%'}}>
          {conditionDs && editors&&
            conditionDs.records &&
            conditionDs.records.length > 0 &&
            conditionDs.records.map((record) => {
              if (record.status !== 'delete') {
                return (
                  <div className="fx-editor-form">
                    <Form record={record} labelLayout="float" columns={48}>
                      <div colSpan={2} className="fx-index">
                        #{record.index + 1}
                      </div>
                      <LovCmp name="leftValue" colSpan={13} disabled={disabled} />
                      <SelCmp
                        name="operator"
                        colSpan={13}
                        disabled={!record.get('leftValue') || disabled}
                        onChange={(value) => changeRightValueComponent(record, value)}
                      />
                      {renderRightValue(record)}
                      {editors && (
                        <div colSpan={7}>
                        {!disabled && (
                          <Popconfirm
                            title={intl
                              .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
                              .d('确认删除选中行？')}
                            onConfirm={() => deleteRightValue(record)}
                          >
                            <Button
                              className="action-btn"
                              icon="delete"
                              shape="circle"
                              funcType="flat"
                              clearButton={false}
                            />
                          </Popconfirm>
                        )}
                      </div>
                      )}
                    </Form>
                  </div>
                );
              } else {
                return null;
              }
            })}
          {!editors && (conditionDs?.toData() || []).length > 0 && (
            <>
              <div style={{marginBottom: 8}}>
              {intl.get('sslm.investDefOrg.model.select.customize').d('自定义组合规则')}
            </div>
            <List
                size="small"
                bordered
                dataSource={conditionDs?.toData()}
                renderItem={(item, index) => {
                  const { leftValueMeaning, operator, rightValueMeaning } = item;
                  return (
                    <List.Item>
                      <Row>
                        <Col span={1}>#{index + 1}</Col>
                        <Col span={5}>{leftValueMeaning}</Col>
                        <Col span={3} className={styles['view-conditions-modal-body-operator']}>
                          {operator}
                        </Col>
                        <Col span={15}>{rightValueMeaning}</Col>
                      </Row>
                    </List.Item>
                  );
                } }
                footer={<div>
                  {intl.get('sslm.investDefOrg.model.select.customize').d('自定义组合规则')}：
                  <span>{condition.customizeConditionCombination || '-'}</span>
                </div>}
              />
            </>
          )}
          {!editors && (conditionDs?.toData() || []).length <=0 &&(
            <div className={styles['view-conditions-modal-body-title']}>
              <div style={{textAlign: 'center'}}>
                <img style={{lineHeight: 40}} src={editorsArr} alt='' />
                <div style={{color: '#868d9c'}}>{intl.get('sslm.common.model.select.true').d('无条件限制')}</div>
              </div>
            </div>
          )}
        </div>
        {editors&&(
          <div className="fx-condition-editor-icon">
          <Tooltip
            title={intl.get('spfm.rulesDefinition.view.card.button.add').d('新建条件规则')}
            colSpan={18}
          >
            <a className="rules-definition-control-point" onClick={createCondition} colSpan={18}>
              <Icon type="control_point" />
            </a>
          </Tooltip>
        </div>
        )}
        {editors &&(
          <div className="fx-condition-editor-wrapper">
          <div className="rule-editor-form">
            <Form dataSet={customizeConditionCombinationDs} labelLayout="float" columns={20}>
              <TextCmp colSpan={20} name="conditionCombination" disabled={disabled} />
            </Form>
          </div>
        </div>
        )}
      </div>
    );
  }
);

export default ConditionConfig;
