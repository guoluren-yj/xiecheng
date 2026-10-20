/* eslint-disable no-unused-expressions */
/**
 * Table - 页面列表 - table
 * @date: 2019-12-22
 * @author: wz
 * @version: 4.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { useMemo, useState, useEffect, useContext } from 'react';
import { Button, Icon } from 'choerodon-ui/pro';
import { Tooltip } from 'choerodon-ui';
import { Form, Input, Radio, Select } from 'hzero-ui';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { FormComponentProps, WrappedFormUtils } from 'hzero-ui/lib/form/Form';
import uuidv4 from 'uuid/v4';
import { observer } from 'mobx-react-lite';
import { isTenantRoleLevel } from 'utils/utils';
import notification from 'utils/notification';

import Lov from '@/components/LowcodeLov/HzeroLov';
import { queryRelationService, editLogicModelsService } from '@/services/modelListService';
import _store from '@/routes/Modeler/ModelDesigner/stores';

import styles from './index.less';
import { IModelManagerStore } from '../../../stores/index';
import isFailureResponse from '@/utils/isFailureResponse';
import { IHandleMenuQueryList } from '../../../ListView';

interface IListViewParams extends FormComponentProps {
  form: WrappedFormUtils;
  handleMenuQueryList: IHandleMenuQueryList['handleMenuQueryList'];
  modelDetailRef: any;
  modelDetail: any;
  relationAttribute: any;
  perHidden: boolean;
}

const { TextArea } = Input;
const { Option } = Select;
const ListView = Form.create()(
  ({
    form,
    handleMenuQueryList,
    modelDetailRef,
    // modelFormEditRef,
    modelDetail,
    relationAttribute,
    perHidden,
  }: IListViewParams): any => {
    const {
      ref: { modelFormEditRef, modelRelationShipFormRef },
      storeData: { resourceUponRoleHierarchy, modelType },
    }: IModelManagerStore = useContext<IModelManagerStore>(_store as any).store;

    const [correlationField, setCorrelationField] = useState<any[]>([]);
    const [initialValue, setInitialValue] = useState<model.relation.BaseModelRelation>(
      {} as model.relation.BaseModelRelation
    );
    // 获取初始数据
    useEffect(() => {
      queryRelationEdit();
      setInitialValue({} as model.relation.BaseModelRelation);
      setCorrelationField([]);
    }, [relationAttribute]);
    const queryRelationEdit = async () => {
      const relId: string | number = relationAttribute.toData().id;
      const res: model.relation.BaseModelRelation = await queryRelationService({
        query: { relId },
      });
      if (res) {
        const { relationFields = [] } = res;
        setInitialValue(res); // 默认值添加
        form.setFieldsValue({
          relationType: res.relationType,
          name: res.name,
          masterLogicModelCode: res.masterLogicModelCode,
          description: res.description,
        });
        // 循环添加每条关系
        setCorrelationField(
          relationFields.map((item) => ({
            mModel: {
              name: `mModel-${uuidv4()}`,
              selectValue: item.masterModelFieldCode,
            },
            cModel: {
              name: `cModel-${uuidv4()}`,
              selectValue: item.relationModelFieldCode,
            },
          }))
        );
      }
    };
    const resetRelationEdit = async (): Promise<void> => {
      const relId = relationAttribute.toData().id;
      const res: model.relation.BaseModelRelation = await queryRelationService({
        query: { relId },
      });
      if (res) {
        form.setFieldsValue({
          description: res.description,
        }); // 设置初始值
        modelFormEditRef?.current?.detailFormReset?.(); // 表单刷新
      }
    };
    const { getFieldDecorator } = form;

    /**
     * 用户选完剩下的下拉框的数据
     * @returns {{cModelSelectArr: *, mModelSelectArr: *}}
     */
    const getNoSelectData = () => {
      const formData = form.getFieldsValue();
      const mModelKeys = Object.keys(formData).filter((key) => key.includes('mModel-'));
      const cModelKeys = Object.keys(formData).filter((key) => key.includes('cModel-'));
      const mModelSelectArr = mModelSelect.map((item) => {
        let isHiddren = false;
        if (mModelKeys.map((key) => formData[key]).includes(item.code.toString())) {
          // 用户已经选了
          isHiddren = true;
        }
        return {
          ...item,
          isHiddren,
        };
      });
      const cModelSelectArr = cModelSelect.map((item) => {
        let isHiddren = false;
        if (cModelKeys.map((key) => formData[key]).includes(item.code.toString())) {
          // 用户已经选了
          isHiddren = true;
        }
        return {
          ...item,
          isHiddren,
        };
      });
      return { mModelSelectArr, cModelSelectArr };
    };
    /**
     * 获取用户选择的数据
     * @returns {{cModelDataArr: *, mModelDataArr: *}}
     */
    const getSelectData = () => {
      const formData = form.getFieldsValue();
      const mModelKeys = Object.keys(formData).filter((key) => key.includes('mModel-'));
      const cModelKeys = Object.keys(formData).filter((key) => key.includes('cModel-'));
      const mModelDataArr = mModelKeys.map((key) => ({ [key]: formData[key] }));
      const cModelDataArr = cModelKeys.map((key) => ({ [key]: formData[key] }));
      return { mModelDataArr, cModelDataArr };
    };
    /**
     * 获取form数据
     * @returns {{cModelDataArr: *, mModelDataArr: *}}
     */
    const getformData = () => {
      const { mModelDataArr, cModelDataArr } = getSelectData();
      const formData: any = form.getFieldsValue();
      const relationFields = mModelDataArr.map((objItem, i) => ({
        masterModelFieldCode: Object.keys(objItem).map((key) => objItem[key])[0],
        relationModelFieldCode: Object.keys(cModelDataArr[i]).map(
          (key) => cModelDataArr[i][key]
        )[0],
      }));
      const {
        relationType,
        name,
        masterLogicModelCode,
        relationLogicModelCode,
        description,
      } = formData;
      return {
        relationType,
        name,
        masterLogicModelCode,
        relationLogicModelCode,
        description,
        relationFields,
      };
    };
    /**
     * 提交数据
     */
    const handleSubmit = async (): Promise<void> => {
      const val = await new Promise((resolve) => {
        form.validateFields(async (error) => {
          resolve(error);
        });
      });
      const _data = getformData();
      if (!val) {
        const relId: string | number = relationAttribute.toData().id;
        const res = await editLogicModelsService({
          query: { id: modelDetail.id, relId },
          body: { ...initialValue, ..._data, relationFields: [] },
        });
        if (!isFailureResponse(res)) {
          queryRelationEdit();
          handleMenuQueryList();
          await modelDetailRef?.current?.listModelRelationDataSetReset?.();
          modelDetailRef?.current?.relationAttributeReset?.();
          // modelRelation.close();
          modelRelationShipFormRef?.current?.modelRelationQuery?.();
        } else {
          notification.error({
            message: '警告',
            description: res.message,
          });
        }
      } else {
        notification.error({ message: '错误', description: '校验未通过' });
      }
    };

    // 下拉框
    const [mModelSelect] = useState<any[]>([]);
    const [cModelSelect] = useState<any[]>([]);

    const { mModelSelectArr, cModelSelectArr } = useMemo(() => getNoSelectData(), [
      form,
      mModelSelect,
      cModelSelect,
    ]);

    return (
      <div className={`${styles['global-c7n-relation']} ${styles.input} ${styles.form}`}>
        <Form className={styles['relation-form']}>
          <div className={styles['form-top']}>
            <Form.Item label="关系类型" className={styles['top-left']}>
              {getFieldDecorator('relationType', {
                initialValue: initialValue.relationType,
                rules: [
                  {
                    required: true,
                    message: '请填写该字段',
                  },
                ],
              })(
                <Radio.Group disabled>
                  <Radio value="ONE_TO_ONE">一对一</Radio>
                  <Radio value="ONE_TO_MANY">一对多</Radio>
                </Radio.Group>
              )}
            </Form.Item>
            <Form.Item label="关系名称" className={styles['top-left']}>
              {getFieldDecorator('name', {
                initialValue: initialValue.name,
                rules: [
                  {
                    required: true,
                    message: '请填写该字段',
                  },
                ],
              })(<Input disabled={relationAttribute.get('tenantId') !== modelDetail.tenantId} />)}
            </Form.Item>
          </div>
          <Form.Item label="当前模型">
            {getFieldDecorator('masterLogicModelCode', {
              initialValue: modelDetail.code,
              rules: [
                {
                  required: true,
                  message: '请填写该字段',
                },
              ],
            })(<Lov disabled textValue={modelDetail.name} />)}
          </Form.Item>
          <Form.Item label="关联模型">
            {getFieldDecorator('relationLogicModelCode', {
              initialValue: initialValue.relationLogicModelCode,
              rules: [
                {
                  required: true,
                  message: '请填写该字段',
                },
              ],
            })(
              <Lov
                disabled
                code={isTenantRoleLevel() ? 'HMDE.LOGIC_MODEL.ID' : 'HMDE.LOGIC_MODEL.ID.SITE'}
                textValue={initialValue.relationLogicModelName}
                lovOptions={{
                  valueField: 'code',
                  displayField: 'name',
                }}
              />
            )}
          </Form.Item>
          {correlationField.map((corFieldItem, i) => (
            <div key={corFieldItem.mModel.name} className={styles['relation-field-item']}>
              <div>
                <Form.Item label="字段名称" key={corFieldItem.mModel.name}>
                  <Tooltip title={initialValue.relationFields[i]?.masterModelFieldName}>
                    {getFieldDecorator(corFieldItem.mModel.name, {
                      initialValue: initialValue.relationFields[i]
                        ? initialValue.relationFields[i].masterModelFieldName
                        : '',
                      rules: [
                        {
                          required: true,
                          message: '请填写该字段',
                        },
                      ],
                    })(
                      <Select disabled>
                        {mModelSelectArr.map((item) => (
                          <Option disabled={item.isHiddren} key={item.code}>
                            {item.displayName}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </Tooltip>
                </Form.Item>
              </div>
              <span className={styles['relation-field-unit']}>
                <Icon type="relate" />
              </span>
              <div>
                <Form.Item label="关联字段" key={corFieldItem.cModel.name}>
                  <Tooltip title={initialValue.relationFields[i].relationModelFieldName}>
                    {getFieldDecorator(corFieldItem.cModel.name, {
                      initialValue: initialValue.relationFields[i].relationModelFieldName,
                      rules: [
                        {
                          required: true,
                          message: '请填写该字段',
                        },
                      ],
                    })(
                      <Select disabled>
                        {cModelSelectArr.map((item) => (
                          <Option disabled={item.isHiddren} key={item.code}>
                            {item.displayName}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </Tooltip>
                </Form.Item>
              </div>
              {/* <span onClick={() => delCorrelationField(corFieldItem.mModel.name)}>X</span> */}
            </div>
          ))}
          {/* <a onClick={addCorrelationField}>添加字段</a> */}
          <Form.Item label="关系描述">
            {getFieldDecorator('description', {
              initialValue: initialValue.description,
            })(<TextArea disabled={relationAttribute.get('tenantId') !== modelDetail.tenantId} />)}
          </Form.Item>
          <div className={styles['relation-edit-button']}>
            <Button
              color={ButtonColor.dark}
              onClick={() => {
                resetRelationEdit();
                // setCorrelationField([]);
              }}
              disabled={
                (isTenantRoleLevel() || resourceUponRoleHierarchy === 'tenant') &&
                modelType === 'PLATFORM_SHARED'
              }
            >
              <Icon
                type="refresh"
                style={{
                  marginRight: '8px',
                  verticalAlign: 'sub',
                }}
              />
              重置
            </Button>
            {((isTenantRoleLevel() || resourceUponRoleHierarchy === 'tenant') &&
              modelType === 'PLATFORM_SHARED') ||
              relationAttribute.get('tenantId') !== modelDetail.tenantId || (
                <Button
                  hidden={perHidden}
                  color={'primary' as ButtonColor}
                  onClick={handleSubmit}
                  style={{ float: 'right' }}
                >
                  <Icon
                    type="save"
                    style={{
                      marginRight: '8px',
                      verticalAlign: 'sub',
                    }}
                  />
                  保存
                </Button>
              )}
          </div>
        </Form>
      </div>
    );
  }
);

export default observer((props: any, ref: any) => <ListView {...props} ref={ref} />);
