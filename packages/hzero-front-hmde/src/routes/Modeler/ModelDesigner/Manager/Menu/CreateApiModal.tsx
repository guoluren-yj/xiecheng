/**
 * 新增应用
 */
import React, { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import { DataSet, Form, TextField, TextArea, Select, Tooltip, Radio } from 'choerodon-ui/pro';
import notification from 'utils/notification';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import Record from 'choerodon-ui/pro/lib/data-set/Record';

import ImgIcon from '@/utils/ImgIcon';
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL, searchMatcher } from '@/utils/common';
import { servicesListService } from '@/services/modelListService';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import isFailureResponse from '@/utils/isFailureResponse';

import styles from './index.less';

const { Option } = Select;
const CreateApiModal = forwardRef((compProps: any, ref) => {
  const { resourceUponRoleHierarchy } = compProps;

  const [editor, setEditor] = useState(false);
  const [servicesList, setServicesList] = useState<any>([]); // 可选服务 fixme

  // 初始化
  const init = async () => {
    const res = await servicesListService();
    if (!isFailureResponse(res)) {
      setServicesList(res);
    } else {
      notification.error({ message: '错误', description: res.message });
    }
  };
  useEffect(() => {
    init();
  }, []);

  // 共享模式ds
  const assignPatternDs = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            name: 'assignPattern',
            defaultValue: 'BLOCK_LIST',
          },
        ],
      }),
    []
  );
  const formDs: DataSet = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        transport: {
          submit: ({ data }) => {
            const assignPattern = assignPatternDs?.current?.get('assignPattern');
            return {
              url: `${lowcodeOrganizationURL({
                route: HZERO_HMDE,
              })}/logic-models/based-on-api`,
              method: 'post',
              data: {
                ...data[0],
                assignPattern: data?.[0]?.type === 'PLATFORM_SHARED' ? assignPattern : null,
              },
            };
          },
        },
        fields: [
          {
            name: 'refServiceCode',
            type: FieldType.string,
            label: 'API逻辑模型所属服务',
            required: true,
          },
          {
            name: 'name',
            type: FieldType.string,
            label: 'API逻辑模型名称',
            required: true,
            validator: async (value) => {
              if (!value) {
                return 'API逻辑模型名称不能为空';
              }
            },
          },
          {
            name: 'type',
            type: FieldType.string,
            label: 'API模型类型',
            required: true,
          },
          {
            name: 'code',
            type: FieldType.string,
            label: '模型编码',
            required: true,
            validator: async (value, nu, record: Record) => {
              const patternA = /^[a-zA-Z0-9][a-zA-Z0-9-_./]*$/g;
              // 校验方法
              if (record.get('code')) {
                if (!patternA.test(value)) {
                  return '模型编码只能由大小写英文字母、数字、"_"、"."组成';
                }
                if (!value) {
                  return '模型编码不能为空';
                }
                // TODO 是否需要增加编码重复校验
                // const flag = (modelList || []).some(
                //   (i) => i.code === value && i.type !== 'PLATFORM_SHARED'
                // );
                // if (flag) {
                //   return '已存在相同模型编码';
                // }
              }
            },
          },
          {
            name: 'description',
            type: FieldType.string,
            label: 'API逻辑模型描述',
            maxLength: 120,
            required: false,
          },
          {
            name: 'dataSourceType',
            type: FieldType.string,
            defaultValue: 'API',
          },
        ],
        events: {
          update: ({ name, value }) => {
            if (name === 'type') {
              if (value === 'PLATFORM_SHARED') {
                setEditor(true);
              } else {
                setEditor(false);
              }
            }
          },
        },
      } as DataSetProps),
    [assignPatternDs]
  );

  useImperativeHandle(ref, () => ({
    saveCreateApi: async () => {
      const val = await formDs?.current?.validate();
      if (val) {
        const res = await formDs.submit();
        if (isFailureResponse(res)) {
          notification.error({ message: '错误', description: res.message });
          return false;
        }
        return res;
      }
      return false;
    },
    formRest() {
      formDs.reset();
    },
  }));

  return (
    <div className={`${styles['create-application-contain']}`} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <Form
          dataSet={formDs}
          labelLayout={LabelLayout.vertical}
          columns={1}
          className={`${styles.input} ${styles['form-style']}`}
        >
          <Select
            searchable
            clearButton={false}
            searchMatcher={searchMatcher}
            name="refServiceCode"
          >
            {(servicesList || []).map((item) => (
              <Option key={item.serviceCode} value={item.serviceCode}>
                {item.serviceCode}
              </Option>
            ))}
          </Select>
          <TextField name="name" placeholder="请输入API模型名称" />
          <Select name="type">
            {!isTenantRoleLevel() && resourceUponRoleHierarchy === 'platform' && (
              <Option value="PLATFORM_SHARED">平台共享模型</Option>
            )}
            {!isTenantRoleLevel() && resourceUponRoleHierarchy === 'platform' && (
              <Option value="PLATFORM">平台自定义模型</Option>
            )}
            {(resourceUponRoleHierarchy === 'tenant' || isTenantRoleLevel()) && (
              <Option value="TENANT">租户自定义模型</Option>
            )}
          </Select>
          <TextField name="code" />
          <TextArea
            rowSpan={2}
            colSpan={4}
            placeholder="请输入API逻辑模型描述信息"
            name="description"
            // style={{ height: 130, lineHeight: 1.5 }}
          />
        </Form>
        {editor && (
          <div className={styles['assign-wrapper']}>
            <div className={styles['form-label']}>
              <i>*</i>默认共享模式
              <Tooltip
                title="授权租户的默认共享模式，如需调整可在【模型授权租户】菜单下编辑。白名单模式选择的租户允许查看当前模型，黑名单模式仅限制选择的租户查看当前模型。"
                placement="top"
              >
                <ImgIcon name="help.svg" size={14} style={{ margin: '0px 2px', marginBottom: 2 }} />
                ：
              </Tooltip>
            </div>
            <Radio dataSet={assignPatternDs} name="assignPattern" value="ALLOW_LIST">
              白名单模式
            </Radio>
            <Radio dataSet={assignPatternDs} name="assignPattern" value="BLOCK_LIST">
              黑名单模式
            </Radio>
          </div>
        )}
      </div>
    </div>
  );
});
export default CreateApiModal;
