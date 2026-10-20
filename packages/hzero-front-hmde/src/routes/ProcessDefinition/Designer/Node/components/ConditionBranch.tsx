import React, { useMemo, useState, useEffect } from 'react';
import { Collapse } from 'choerodon-ui';
import { DataSet, Form, TextField, IntlField, Button } from 'choerodon-ui/pro';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { LabelAlign } from 'choerodon-ui/pro/lib/form/enum';

import ImgIcon from '@/utils/ImgIcon';
import uuid from 'uuid/v4';

import ConditionBranchAssign from './ConditionBranchAssign';

import styles from '../index.less';

const { Panel } = Collapse;

const ConditionBranch = (props) => {
  const {
    formValidate,
    parentDataSet,
    curRecord,
    inputParameterData,
    inputParameterOriginData,
    branchIndex,
    expressionList,
    setExpressionList,
    deleteBranch,
    nodeArr,
    graph,
    versionDisabled,
    viewType,
  } = props;
  console.log('file: ConditionBranch.tsx ~ line 21 ~ ConditionBranch ~ curRecord', curRecord);
  console.log('file: ConditionBranch.tsx ~ line 21 ~ ConditionBranch ~ branchIndex', branchIndex);
  // 刚进来，默认为1
  if (!curRecord.conditionRelation) {
    curRecord.conditionRelation = '1';
  }
  const [conditions, setConditions] = useState<any[]>([]);
  const ds = useMemo(() => {
    const dsObj = new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'branchName',
          type: FieldType.intl,
          label: '名称',
          required: true,
          maxLength: 30,
          defaultValue: curRecord?.branchName,
        },
        {
          name: 'branchCode',
          type: FieldType.string,
          label: '标识',
          required: true,
          maxLength: 50,
          pattern: '^[a-zA-Z0-9][a-zA-Z0-9-_./]*$',
          defaultValue: curRecord?.branchCode,
        },
        {
          name: 'conditionRelation',
          type: FieldType.string,
          label: '条件关系',
          defaultValue: curRecord?.conditionRelation,
        },
        {
          name: 'conditions',
          type: FieldType.object,
          defaultValue: [{}],
        },
        {
          name: 'branchId',
          type: FieldType.string,
          defaultValue: curRecord?.branchId,
        },
      ],
      data: [],
      events: {
        // update: ({ dataSet, record, name, value, oldValue }) => {
        // },
      },
    });
    (dsObj as any).childrenDs = new Map();
    return dsObj;
  }, [curRecord?.branchId]);

  useEffect(() => {
    parentDataSet.childrenDs.set(branchIndex, ds);
    setConditions(
      curRecord.conditions.map((item) => {
        item._id = uuid(); // eslint-disable-line
        return item;
      })
    );
    return () => {
      parentDataSet.childrenDs.delete(branchIndex);
      formValidate.remove('validate', fn);
    };
  }, []);

  const fn = (resolve, reject) => {
    ds.validate().then((r) => {
      if (r) {
        resolve();
      } else {
        reject();
      }
    });
  };
  useEffect(() => {
    formValidate.remove('validate', fn);
    formValidate.listen('validate', fn);
  }, []);
  // 新增条件
  const addCondtion = () => {
    setConditions([
      ...conditions,
      {
        _id: uuid(),
      },
    ]);
    const conditionRelation = ds?.current?.get('conditionRelation');
    if (ds.current) {
      if (conditionRelation) {
        ds.current.set('conditionRelation', `${conditionRelation} AND ${conditions.length + 1}`);
      } else {
        ds.current.set('conditionRelation', `1`);
      }
    }
  };

  // 删除条件
  const deleteCondition = (index) => {
    const array = JSON.parse(JSON.stringify(conditions));
    array.splice(index, 1);
    setConditions(array);
    if (ds.current) {
      const conditionRelation: number[] = [];
      array.forEach((item, idx) => {
        conditionRelation.push(idx + 1);
      });
      ds.current.set('conditionRelation', conditionRelation.join(' AND '));
    }
  };

  return (
    <Collapse bordered={false} defaultActiveKey={['1']} trigger="icon">
      <Panel
        header={curRecord.branchName}
        key="1"
        extra={
          versionDisabled === false || viewType === 'detail' ? (
            <span style={{ position: 'absolute', bottom: '35%', right: '10px', cursor: 'pointer' }}>
              <ImgIcon
                name="B16-delet@1x.svg"
                size={16}
                style={{ marginTop: '16px' }}
                onClick={() => {
                  // eslint-disable-next-line no-unused-expressions
                  ds?.deleteAll(false);
                  deleteBranch(curRecord?.branchId);
                }}
              />
            </span>
          ) : null
        }
      >
        <div>
          <Form
            dataSet={ds}
            labelAlign={LabelAlign.left}
            disabled={versionDisabled || viewType !== 'detail'}
          >
            <IntlField name="branchName" />
            <TextField name="branchCode" />
          </Form>
          <div className={styles['add-condion-item']}>
            <div>条件</div>
            <Button
              disabled={versionDisabled || viewType !== 'detail'}
              style={{ border: 'none' }}
              onClick={() => addCondtion()}
            >
              +&nbsp;新增条件
            </Button>
          </div>
          {conditions.map((item, index) => (
            <div className={styles['field-area']} key={item._id}>
              <div>{index + 1}</div>
              <ConditionBranchAssign
                versionDisabled={versionDisabled}
                viewType={viewType}
                curRecord={item}
                nodeArr={nodeArr}
                graph={graph}
                parentDataSet={ds}
                formValidate={formValidate}
                inputParameterData={inputParameterData}
                inputParameterOriginData={inputParameterOriginData}
                expressionList={expressionList}
                setExpressionList={setExpressionList}
                index={index}
              />
              {!versionDisabled && viewType === 'detail' && (
                <ImgIcon
                  name="B16-delet@1x.svg"
                  size={16}
                  style={{ marginTop: '16px' }}
                  onClick={() => {
                    deleteCondition(index);
                  }}
                />
              )}
            </div>
          ))}
          <Form
            dataSet={ds}
            labelAlign={LabelAlign.left}
            disabled={versionDisabled || viewType !== 'detail'}
          >
            <TextField name="conditionRelation" />
          </Form>
        </div>
      </Panel>
    </Collapse>
  );
};

export default ConditionBranch;
