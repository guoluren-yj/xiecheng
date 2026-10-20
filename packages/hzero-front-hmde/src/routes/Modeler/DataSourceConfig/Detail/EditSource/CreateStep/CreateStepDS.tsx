import React from 'react';
import { Tooltip } from 'choerodon-ui/pro';
import uuidv4 from 'uuid/v4';

import ImgIcon from '@/utils/ImgIcon';
import { HZERO_HMDE } from '@/utils/config';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import Record from 'choerodon-ui/pro/lib/data-set/Record';

import { lowcodeOrganizationURL } from '@/utils/common';
import { EModelType } from '@/globalData/modelManager';
import { isTenantRoleLevel } from 'utils/utils';

interface IProps {
  dataObjectDetailType: string;
  dataObj: model.data.DataSourceTreeVO;
  platformHidden: boolean;
}
export default function ({ dataObjectDetailType, dataObj, platformHidden }: IProps) {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'dataObjectOwnerType',
        type: 'string',
        label: '数据对象类型',
        required: true,
        defaultValue: platformHidden ? EModelType.TENANT : EModelType.PLATFORM_SHARED,
      },
      {
        name: 'dataObjectCode',
        type: 'string',
        label: '数据对象编码',
        required: true,
        defaultValue: uuidv4().toString().replace(/-/g, ''),
      },
      {
        name: 'dataObjectName',
        type: 'string',
        required: true,
        label: '数据对象名称',
        validator: (value, _, record: Record) => {
          // 校验方法
          if (record.get('dataObjectName')) {
            if (record.get('dataObjectName').toString().length > 60) {
              return '数据对象名称长度应小于等于60。';
            }
            if (
              dataObjectDetailType === 'create' && // 新建时才会去校验是否重复
              dataObj &&
              (dataObj.content || []).some(
                (item) => item.dataObjectName.toLowerCase() === value.toLowerCase()
              )
            ) {
              return '已存在相同数据对象名称';
            }
          }
        },
      },
      {
        name: 'masterModel',
        type: 'object',
        label: '选择主模型',
        required: dataObjectDetailType !== 'inherit',
        lovCode: isTenantRoleLevel() ? 'HMDE.LOGIC_MODEL.ID' : 'HMDE.LOGIC_MODEL.ID.SITE',
        dynamicProps: {
          lovQueryAxiosConfig: ({ record }) => {
            const modelTypeList = [record.get('dataObjectOwnerType')];
            if (record.get('dataObjectOwnerType') === EModelType.TENANT) {
              modelTypeList.push(EModelType.PLATFORM_SHARED);
            }
            return (_, __, { params }) => ({
              url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/logic-models/page`,
              method: 'GET',
              params: {
                ...params,
                dataSourceType: 'TABLE',
                excludePredefineModel: true,
                modelTypeList: modelTypeList.join(','),
              },
            });
          },
          // lovQueryAxiosConfig: function lovQueryAxiosConfig() {
          //   return {
          //     url: `${lowcodeOrganizationURL({
          //       route: HZERO_HMDE,
          //     })}/logic-models/page?dataSourceType=TABLE&excludePredefineModel=true`,
          //     method: 'GET',
          //   };
          // },
        },
      },
      {
        name: 'logicModelName',
        type: 'string',
        label: '选择主模型',
        required: dataObjectDetailType !== 'inherit',
        bind: 'masterModel.name',
      },
      {
        name: 'logicModelId',
        type: 'string',
        bind: 'masterModel.id',
      },
      {
        name: 'extendsParentName',
        type: 'string',
        label: '继承自对象',
        required: dataObjectDetailType === 'inherit',
      },
      // {
      //   name: 'modelObjectTenantId',
      //   type: 'string',
      //   bind: 'masterModel.tenantId',
      // },
      {
        name: 'assignPattern',
        label: (
          <React.Fragment>
            <span>默认共享模式</span>
            <Tooltip
              title="授权租户的默认共享模式，如需调整可在【数据对象授权租户】菜单下编辑。白名单模式选择的租户允许查看当前数据对象，黑名单模式仅限制选择的租户查看当前数据对象。"
              placement="top"
            >
              <ImgIcon name="help.svg" size={14} style={{ margin: '0px 2px', marginBottom: 2 }} />
            </Tooltip>
          </React.Fragment>
        ),
        required: true,
        defaultValue: 'BLOCK_LIST',
      },
    ],
    events: {
      update: ({ name, record }) => {
        if (name === 'dataObjectOwnerType') {
          record.set('masterModel', undefined);
        }
      },
    },
  } as DataSetProps;
}
