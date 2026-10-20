/**
 * 自定义表达式
 */
import React from 'react';
import { observer } from 'mobx-react-lite';
import { Icon, Popconfirm } from 'choerodon-ui';
import { Form, TextField } from 'choerodon-ui/pro';

import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { deleteDefaultDimLine } from '@/services/templateDetail';
import DefaultComponent from './DefaultComponent';

import styles from './index.less';

export default function DimCustomizeForm(props) {
  const DimCustomizeFromWrapper = observer(prop => {
    const { customizeDS, disabled, columns, ds, dataSet, templateId, ...other } = prop;

    const handleRemove = ({ record }) => {
      if (record.get('isNew')) {
        // eslint-disable-next-line no-param-reassign
        record.status = 'add';
      }
      ds.remove(record);
      if (ds.length === 0) {
        ds.create({
          ...record.toData(),
          conditionExpression: '',
          targetValue: '',
          targetValueLov: {},
        });
      }
    };

    const handleDelete = async ({ record }) => {
      const res = await getResponse(
        deleteDefaultDimLine({
          templateId,
          dimDefaultConditionId: record.toData().dimDefaultConditionId,
        })
      );
      if (res) {
        const lovCode = dataSet.current.get('lovCode');
        const viewInfo = window.smallCartLovViewInfoCache[lovCode] || {};
        if (dataSet.current.get('proDefaultFlag') === 'FORMULA') {
          const { formulaConditionFx = {} } = res || {};
          dataSet.current.set('formulaConditionFx', res.formulaConditionFx);
          ds.loadData(formulaConditionFx.dimFormulaConditionList || []);
        } else {
          dataSet.current.set('defaultCondition', res.defaultCondition);
          ds.loadData(
            res.defaultCondition?.dimDefaultConditionList?.map(dim => {
              return {
                ...dim,
                componentType: dataSet.current.get('componentType'),
                lovCode: dataSet.current.get('lovCode'),
                defaultValue_LOV: {
                  [viewInfo.valueField]: dim.value,
                  [viewInfo.displayField]: dim.valueName,
                },
                defaultValue_component: dim.value,
              };
            })
          );
        }
        if (ds.length === 0) {
          ds.create({
            componentType: dataSet.current.get('componentType'),
            lovCode: dataSet.current.get('lovCode'),
          });
        }
      }
    };

    return (
      <>
        {customizeDS.map((record, index) => {
          return (
            <div style={{ marginTop: index > 0 ? 16 : 0, display: 'flex', position: 'relative' }}>
              <Form
                record={record}
                labelLayout="float"
                // disabled={!editEnable && !isCreate}
                columns={columns}
                disabled={disabled}
                className={styles["dim-customize-form"]}
              >
                <TextField colSpan={3} name="conditionExpression" />
                {prop.isDefault && (
                  <DefaultComponent
                    record={record} // fx的行数据
                    ds={dataSet}
                    disabled={disabled}
                    index={index}
                    templateId={templateId}
                    {...other}
                  />
                )}
              </Form>
              {prop.isDefault && !disabled && (
                <div className="icon-bar" style={{ position: 'absolute', top: 6, right: -42 }}>
                  {record.status === 'add' || record.get('isNew') ? (
                    <Icon
                      type="delete"
                      onClick={() => handleRemove({ record })}
                      style={{ cursor: 'pointer' }}
                    />
                  ) : (
                    <Popconfirm
                      title={intl.get('small.common.popConfirm.info').d('确定删除选中行?')}
                      onConfirm={async () => handleDelete({ record })}
                    >
                      <Icon type="delete" style={{ cursor: 'pointer' }} />
                    </Popconfirm>
                  )}
                  {index + 1 === ds.length && (
                    <Icon
                      type="add"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        ds.create({
                          componentType: dataSet.current.get('componentType'),
                          lovCode: dataSet.current.get('lovCode'),
                          isNew: 1,
                        });
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </>
    );
  });

  return <DimCustomizeFromWrapper {...props} />;
}
