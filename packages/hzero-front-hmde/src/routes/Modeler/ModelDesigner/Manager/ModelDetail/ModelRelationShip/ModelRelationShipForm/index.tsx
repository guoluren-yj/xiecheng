/* eslint-disable arrow-body-style */
/**
 * Table - 页面列表 - table
 * @date: 2019-12-22
 * @author: wz
 * @version: 4.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, {
  useMemo,
  useImperativeHandle,
  useState,
  useEffect,
  forwardRef,
  useRef,
} from 'react';
import { Icon } from 'choerodon-ui';
import { Form, Input, Radio, Select } from 'hzero-ui';
// import Lov from 'components/Lov';
import Lov from '@/components/LowcodeLov/HzeroLov';
import { HZERO_HMDE } from '@/utils/config';
import uuidv4 from 'uuid/v4';
import { lowcodeOrganizationURL, getDraftFlag } from '@/utils/common';
import { isTenantRoleLevel } from 'utils/utils';
import { modelObjectsSelectService } from '@/services/modelListService';
import notification from 'utils/notification';
import LovPro from './Lov';
import styles from './index.less';
import isFailureResponse from '@/utils/isFailureResponse';
import ImgIcon from '@/utils/ImgIcon';

const { TextArea } = Input;
const { Option } = Select;
interface IModelDetail {
  appId: number | string | null;
  id: number | string | null;
  code: number | string | null;
  name: string | null;
}
interface IIndex {
  form: any;
  modelDetail: IModelDetail;
  selectedTenantId?: string;
  modelType: string;
  resourceUponRoleHierarchy: string;
}
const ListView = Form.create({})(
  forwardRef(
    (
      { form, modelDetail, selectedTenantId, modelType, resourceUponRoleHierarchy }: IIndex,
      ref
    ) => {
      const relationModelTenantIdRef = useRef();

      useImperativeHandle(ref, () => ({
        getformData,
        handleValidate,
        // relationModelTenantId: relationModelTenantIdRef.current,
      }));
      // const { storeData: { modelDetail } } = useContext(_store); // eslint-disable-line
      const { getFieldDecorator } = form;
      const [selectRelation, setSelectRelation] = useState<string>('');
      /**
       * 添加一个字段关系
       */
      const addCorrelationField = () => {
        const template = {
          mModel: {
            name: `mModel-${uuidv4()}`,
            selectValue: '',
          },
          cModel: {
            name: `cModel-${uuidv4()}`,
            selectValue: '',
          },
        };
        setSelectRelation(template.mModel.name);
        setCorrelationField([...correlationField, template]);
      };
      /**
       * 删除一个字段关系
       */
      const delCorrelationField = (node) => {
        form.setFieldsValue({
          [node.mModel.name]: '',
          [node.cModel.name]: '',
        });
        const index = correlationField.findIndex((item) => item.mModel.name === node.mModel.name);
        const _correlationField = [...correlationField];
        _correlationField.splice(index, 1);
        setCorrelationField(_correlationField);
        getNoSelectData();
        handleFieldRelationship();
      };

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
          if (mModelKeys.map((key) => formData[key]).includes(item?.code?.toString())) {
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
        const formData = form.getFieldsValue();
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
      // 下拉框
      const [mModelSelect, setMModelSelect] = useState<model.LogicModel[]>([]);
      const [cModelSelect, setCModelSelect] = useState<model.LogicModel[]>([]);
      const [correlationField, setCorrelationField] = useState<any[]>([]);
      const { mModelSelectArr, cModelSelectArr } = useMemo(() => {
        return getNoSelectData();
      }, [form, mModelSelect, cModelSelect, correlationField]);
      // 获取住字段的下拉狂数据
      useEffect(() => {
        (async () => {
          const res = await modelObjectsSelectService({
            query: {
              id: modelDetail.id,
            },
          });
          if (!isFailureResponse(res)) {
            setMModelSelect(res);
          }
        })();
      }, [modelDetail.id]);
      // 获取关联字段的下拉框数据
      const relatedModelLovChange = async (data = {} as any) => {
        if (data.id) {
          const res = await modelObjectsSelectService({
            query: {
              id: data.id,
            },
          });
          if (res && Array.isArray(res)) {
            setCModelSelect(res);
            // 清空下拉框数据
            const formData = form.getFieldsValue();
            const cModelKeys = Object.keys(formData).filter((key) => key.includes('cModel-'));
            let upCSelectData = {};
            cModelKeys.forEach((key) => {
              upCSelectData = { ...upCSelectData, [key]: '' };
            });
            form.setFieldsValue(upCSelectData);
          } else if (res.failed) {
            notification.error({
              message: '警告',
              description: res.message,
            });
          }
        }
      };
      // 默认添加一个关系数据
      useMemo(() => {
        addCorrelationField();
      }, []);

      const handleFieldRelationship = () => {
        setTimeout(() => {
          const data = form.getFieldsValue();
          const mCodeArr = Object.keys(data)
            .filter((key) => key.includes('mModel-') && data[key])
            .map((key) => data[key]);
          const cCodeArr = Object.keys(data)
            .filter((key) => key.includes('cModel-') && data[key])
            .map((key) => data[key]);
          const mNameArr = mCodeArr.map((_code) => {
            return (mModelSelectArr?.find?.((obj) => obj?.code === _code) as any)?.displayName;
          });
          const cNameArr = cCodeArr.map((_code) => {
            return (cModelSelectArr?.find?.((obj) => obj?.code === _code) as any)?.displayName;
          });
          // 生成字体
          const strArr = mNameArr.map((item, i) => {
            if (cNameArr[i]) {
              return `${item}-${cNameArr[i]}`;
            }
            return `${item}-**`;
          }, '');
          const str = `这是${strArr.join('与')}的关联模型。`;
          form.setFieldsValue({
            description: str,
          });
        }, 100);
      };
      // 提交
      const handleValidate = () => {
        let _err = false;
        form.validateFields((error) => {
          if (!error) {
            _err = true;
          }
        });
        return _err;
      };
      return (
        <Form className={`${styles['relation-ship-form']} ${styles.input}`}>
          <div className={styles['relation-top']}>
            <Form.Item label="关系类型" className={styles['relation-top-left']}>
              {getFieldDecorator('relationType', {
                initialValue: 'ONE_TO_ONE',
                rules: [
                  {
                    required: true,
                    message: '请填写该字段',
                  },
                ],
              })(
                <Radio.Group>
                  <Radio value="ONE_TO_ONE">一对一</Radio>
                  <Radio value="ONE_TO_MANY">一对多</Radio>
                </Radio.Group>
              )}
            </Form.Item>
            <Form.Item label="关系名称" className={styles['relation-top-right']}>
              {getFieldDecorator('name', {
                initialValue: '',
                rules: [
                  {
                    required: true,
                    message: '请填写关系名称',
                  },
                ],
              })(<Input />)}
            </Form.Item>
          </div>
          <div className={styles['relation-body']}>
            <div className={styles['relation-body-left']}>
              <h4>当前模型</h4>
              <Form.Item label="当前模型">
                {getFieldDecorator('masterLogicModelCode', {
                  initialValue: modelDetail.code || '',
                  rules: [
                    {
                      required: true,
                      message: '请选择当前模型',
                    },
                  ],
                })(
                  <Lov
                    disabled
                    allowClear={false}
                    textValue={modelDetail.name}
                    // lovOptions={{
                    //   valueField: 'basicsEventCode',
                    //   displayField: 'basicsEventName',
                    // }}
                  />
                )}
              </Form.Item>
            </div>
            <div className={styles['relation-body-right']}>
              <h4>关联模型</h4>
              <Form.Item label="关联模型">
                {getFieldDecorator('relationLogicModelCode', {
                  rules: [
                    {
                      required: true,
                      message: '请选择关联模型',
                    },
                  ],
                })(
                  <LovPro
                    onOk={relatedModelLovChange}
                    queryUrlPro={`${lowcodeOrganizationURL({
                      route: HZERO_HMDE,
                    })}/logic-models/page?draft-flag=${getDraftFlag()}&dataSourceType=TABLE${
                      resourceUponRoleHierarchy === 'platform'
                        ? `&modelTypeList=PREDEFINE,${modelType}`
                        : ''
                    }`}
                    code={isTenantRoleLevel() ? `HMDE.LOGIC_MODEL.ID` : `HMDE.LOGIC_MODEL.ID.SITE`}
                    // textValue={implementData}
                    originTenantId={selectedTenantId} // {constructPlatformRoleQueryString(selectedTenantId)}
                    lovOptions={{
                      valueField: 'code',
                      displayField: 'name',
                    }}
                    onChange={(...args) => {
                      relationModelTenantIdRef.current = args[1].tenantId;
                    }}
                  />
                )}
              </Form.Item>
            </div>
            <span className={styles['relation-one-on']}>
              <span>
                <i>1</i>
                <i>{form.getFieldsValue().relationType !== 'ONE_TO_ONE' ? 'N' : '1'}</i>
              </span>
            </span>
          </div>
          <div className={styles['relation-field']}>
            {correlationField.map((corFieldItem, corrIndex) => {
              return (
                <div
                  key={corFieldItem.mModel.name}
                  className={
                    selectRelation === corFieldItem.mModel.name &&
                    correlationField.length !== 0 &&
                    correlationField.length !== 1
                      ? `${styles['relation-field-item']} ${styles['relation-field-item-select']}`
                      : `${styles['relation-field-item']}`
                  }
                  onClick={() =>
                    corrIndex === 0 ? () => {} : setSelectRelation(corFieldItem.mModel.name)
                  }
                >
                  <Form.Item label="字段显示名称" key={corFieldItem.mModel.name}>
                    {getFieldDecorator(corFieldItem.mModel.name, {
                      initialValue: '',
                      rules: [
                        {
                          required: true,
                          message: '请选择字段显示名称',
                        },
                      ],
                    })(
                      <Select
                        onChange={handleFieldRelationship}
                        filterOption={(input, option) =>
                          (option?.props?.children as any)
                            ?.toLowerCase()
                            ?.indexOf(input?.toLowerCase()) >= 0
                        }
                        showSearch
                      >
                        {mModelSelectArr.map((item: any) => (
                          <Option disabled={item.isHiddren} key={item.code}>
                            {item.displayName}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                  <span className={styles['relation-field-unit']}>
                    <Icon type="relate" />
                  </span>
                  <Form.Item label="关联字段显示名称" key={corFieldItem.cModel.name}>
                    {getFieldDecorator(corFieldItem.cModel.name, {
                      initialValue: '',
                      rules: [
                        {
                          required: true,
                          message: '请选择关联字段显示名称',
                        },
                      ],
                    })(
                      <Select
                        filterOption={(input, option) =>
                          (option?.props?.children as any)
                            ?.toLowerCase()
                            ?.indexOf(input?.toLowerCase()) >= 0
                        }
                        showSearch
                        onChange={handleFieldRelationship}
                      >
                        {cModelSelectArr.map((item: any) => (
                          <Option disabled={item.isHiddren} key={item.code}>
                            {item.displayName}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                  {selectRelation === corFieldItem.mModel.name &&
                    correlationField.length !== 0 &&
                    correlationField.length !== 1 && (
                      <span
                        onClick={() => delCorrelationField(corFieldItem)}
                        className={styles['relation-field-item-del']}
                      >
                        {/* <Icon type="delete" /> */}
                        <ImgIcon name="delete-210618.svg" size={16} />
                      </span>
                    )}
                </div>
              );
            })}
            <a onClick={addCorrelationField} style={{ display: 'inline-block', marginTop: '10px' }}>
              添加字段
            </a>
          </div>
          <Form.Item className={styles['label-no-line-height']} label="关系描述">
            {getFieldDecorator('description', {
              initialValue: '',
            })(<TextArea />)}
          </Form.Item>
        </Form>
      );
    }
  )
);

// function constructPlatformRoleQueryString(selectedTenantId: number|string|undefined){
//   if(typeof selectedTenantId !== 'number' && typeof selectedTenantId !== 'string'){
//     return ''
//   }
//   return `&tenantId=${selectedTenantId}`
// }

export default ListView;
