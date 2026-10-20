/**
 * 条件配置行
 */
import React from 'react';
import { observer } from 'mobx-react-lite';
import { Icon, Popconfirm } from 'choerodon-ui';
import {
  Form,
  TextField,
  Select,
  NumberField,
  Lov,
  DatePicker,
  Switch,
  Table,
} from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import request from 'utils/request';

const SRM_MALLCART = '/smct';
export default function FxConfigList(props) {
  const organizationId = getCurrentOrganizationId();

  const FxConfigListWrapper = observer(
    ({
      dataSet,
      editModalDataSet, // 维度编辑框大ds
      dispatch,
      editEnable,
      isCreate,
      templateId,
      dimensionId,
      conditionType,
      isDefault,
      disabled,
    }) => {
      /* 条件配置-条件为空/非空的操作 */
      const updateCondition = (record) => {
        if (record.status === 'add') {
          record.set('targetType', null);
          record.set('targetValue', null);
        }
      };

      // 组件删除
      const remove = (record) => {
        if (record.get('isNew')) {
          // eslint-disable-next-line no-param-reassign
          record.status = 'add';
        }
        dataSet.remove(record);
        if (dataSet.length === 0) {
          dataSet.create({});
          if(isDefault) {
            editModalDataSet.current.set('defaultCondition', null);
          }
          const conditionList = editModalDataSet.current.get('conditionList');
          const newConditionList = conditionList?.filter(
            (i) => i.conditionHeader?.conditionType !== conditionType
          );
          editModalDataSet.current.set('conditionList', newConditionList);
        }
      };

      // 接口删除条件配置
      const confirm = (record) => {
        dispatch({
          type: 'templateDetailInfo/delteConfigSet',
          payload: {
            conditionLineId: record.get('conditionLineId'),
            templateId,
          },
        }).then((res) => {
          if (res && !res.failed) {
            request(
              organizationId === 0
                ? `${SRM_MALLCART}/v1/dimensions/${dimensionId}`
                : `${SRM_MALLCART}/v1/${organizationId}/dimensions/${dimensionId}`,
              {
                method: 'GET',
              }
            ).then((resp) => {
              if (isDefault) {
                // 默认值类型为公式
                if (editModalDataSet.current.get('proDefaultFlag') === 'FORMULA') {
                  const { conditionLineList = [{}] } = resp.formulaConditionFx || {};
                  editModalDataSet.current.set('formulaConditionFx', resp.formulaConditionFx);
                  dataSet.loadData(conditionLineList);
                } else {
                  const currentData = resp.defaultCondition?.conditionLineList || [{}];
                  editModalDataSet.current.set('defaultCondition', resp.defaultCondition);
                  dataSet.loadData(currentData);
                }
                notification.success();
              } else {
                const currentData = resp.conditionList?.filter(
                  (i) => i.conditionHeader?.conditionType === conditionType
                )?.[0]?.conditionLineList;
                // 更新外面ds，避免删除条件后关闭弹窗再次打开删除数据还在
                editModalDataSet.current.set('conditionList', resp.conditionList);
                dataSet.loadData(currentData);
                notification.success();
                if (dataSet.length === 0) {
                  dataSet.create({});
                }
              }
            });
          }
        });
      };

      return (
        <>
          {dataSet.records.length > 0 &&
            dataSet.records.map((line, key) => {
              const componentType = line?.get('componentType');
              let component = null;
              const prop = {
                style: { width: 150, marginLeft: 8 },
                name: 'targetValue',
              };
              switch (componentType) {
                case 'INPUT':
                  component = <TextField {...prop} />;
                  break;
                case 'INPUT_NUMBER':
                  component = <NumberField {...prop} />;
                  break;
                case 'SELECT':
                  if (
                    dataSet.current?.get('componentType') === 'SELECT' &&
                    dataSet.current?.get('targetType') === 'FIXED'
                  ) {
                    prop.name = 'targetValueSelect';
                  }
                  component = <Select {...prop} />;
                  if (dataSet.current.get('dimensionCode') === 'unitId') {
                    component = <TextField {...prop} />;
                  }
                  break;
                case 'LOV':
                  prop.name = 'targetValueLov';
                  component = <Lov noCache {...prop} />;
                  break;
                case 'DATE_PICKER':
                  component = <DatePicker {...prop} />;
                  break;
                case 'SWITCH':
                  prop.style.width = 50;
                  component = <Switch {...prop} />;
                  break;
                default:
                  component = <TextField {...prop} />;
              }
              return (
                <Form
                  record={line}
                  labelLayout="float"
                  disabled={(!editEnable && !isCreate) || disabled}
                  style={{ marginTop: key >= 1 ? 16 : 0 }}
                >
                  <div className="condition-config" style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 'bold' }}>#{key + 1}</div>
                    <div>
                      <Select name="dimensionId" style={{ width: 150, marginLeft: 8 }} />
                    </div>
                    <div>
                      <Select
                        name="conditionExpression"
                        style={{ width: 150, marginLeft: 8 }}
                        onChange={() => updateCondition(line)}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      {line.get('conditionExpression') !== 'ISNULL' &&
                        line.get('conditionExpression') !== 'NOTNULL' && (
                          <>
                            <div>
                              <Select name="targetType" style={{ width: 150, marginLeft: 8 }} />
                            </div>
                            <div>
                              {line.get('targetType') === 'DIMENSION' ? (
                                <Select name="targetValue" style={{ width: 150, marginLeft: 8 }} />
                              ) : (
                                component
                              )}
                            </div>
                          </>
                        )}
                    </div>
                    {!(!editEnable && !isCreate) && (
                      <div className="icon-bar" style={{ display: 'flex', width: 44, marginLeft: 8 }}>
                        {line.status === 'add' || line.get('isNew') ? (
                          <Icon
                            type="delete"
                            style={{ cursor: 'pointer' }}
                            onClick={() => remove(line)}
                          />
                        ) : (
                          <Popconfirm
                            title={intl.get('small.common.popConfirm.info').d('确定删除选中行?')}
                            onConfirm={() => confirm(line)}
                          >
                            <Icon type="delete" style={{ cursor: 'pointer' }} />
                          </Popconfirm>
                        )}
                        {key + 1 === dataSet.length && (
                          <Icon
                            type="add"
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              dataSet.create({ isNew: 1 });
                            }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </Form>
              );
            })}
        </>
      );
    }
  );

  return <FxConfigListWrapper {...props} />;
};
