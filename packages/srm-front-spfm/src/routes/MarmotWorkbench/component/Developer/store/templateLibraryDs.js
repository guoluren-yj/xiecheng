import intl from 'utils/intl';
import { SRM_ADAPTOR } from '_utils/config';
import crypto from 'crypto-js';

export default function getTemplateLibraryDs() {
  // content脚本内容的key名与ds内部的content重名导致无法用submit提交后拿到最新的record，前端更换key名
  const changeKeyProps = {
    // axios在添加transformRequest之后会默认变成formData格式，需要再设置为RequestPayload
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    transformResponse: (resp) => {
      try {
        const result = JSON.parse(resp);
        if (result) {
          const { content, ...otherKey } = result;
          return { scriptContent: content, ...otherKey };
        } else {
          return null;
        }
      } catch (error) {
        return null;
      }
    },
    transformRequest: (resp) => {
      try {
        const { scriptContent, ...otherKey } = resp;
        return JSON.stringify({ content: scriptContent, ...otherKey });
      } catch (error) {
        return null;
      }
    },
  };
  return {
    autoQuery: true,
    selection: false,
    pageSize: 10,
    queryFields: [
      {
        name: 'description',
        type: 'string',
        label: intl.get('spfm.templateLibrary.model.templateLibrary.description').d('案例名'),
      },
      {
        name: 'type',
        type: 'string',
        lookupCode: 'SADA_MARMOT_TEMPLATE_TYPE',
        label: intl.get('spfm.templateLibrary.model.templateLibrary.type').d('类型'),
      },
    ],
    fields: [
      {
        name: 'id',
        type: 'string',
        label: 'id',
      },
      {
        name: 'code',
        type: 'string',
        label: intl.get('spfm.templateLibrary.model.templateLibrary.code').d('唯一编码'),
        required: true,
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('spfm.templateLibrary.model.templateLibrary.description').d('案例名'),
        required: true,
      },
      {
        name: 'contributor',
        type: 'string',
        label: intl.get('spfm.templateLibrary.model.templateLibrary.contributor').d('贡献者'),
      },
      {
        name: 'type',
        type: 'string',
        lookupCode: 'SADA_MARMOT_TEMPLATE_TYPE',
        required: true,
        defaultValue: '0',
        label: intl.get('spfm.templateLibrary.model.templateLibrary.type').d('类型'),
      },
      {
        name: 'star',
        type: 'string',
        label: intl.get('spfm.templateLibrary.model.templateLibrary.star').d('收藏数'),
      },
      {
        name: 'scriptContent',
        type: 'string',
        label: intl.get('spfm.templateLibrary.model.templateLibrary.content').d('脚本内容'),
        transformResponse: (value) => {
          return value ? crypto.enc.Base64.stringify(crypto.enc.Utf16.parse(value)) : value; // 加密
        },
        transformRequest: (value) => {
          return value ? crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(value)) : value; // 解密
        },
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get(`hzero.common.table.column.option`).d('操作'),
      },
    ],
    transport: {
      read({ data, params: { page, pagesize } }) {
        return {
          url: `${SRM_ADAPTOR}/v1/script-templates`,
          method: 'get',
          data: { ...data, page, pagesize },
          transformResponse: (resp) => {
            try {
              const result = JSON.parse(resp);
              if (result && result.content) {
                const contents = result.content.map((item) => {
                  const { content, ...otherKey } = item;
                  return { scriptContent: content, ...otherKey };
                });
                return { ...result, content: contents };
              } else {
                return null;
              }
            } catch (error) {
              return null;
            }
          },
        };
      },
      create: ({ data }) => {
        return {
          url: `${SRM_ADAPTOR}/v1/script-templates`,
          method: 'post',
          data: data[0],
          ...changeKeyProps,
        };
      },
      update: ({ data }) => {
        return {
          url: `${SRM_ADAPTOR}/v1/script-templates`,
          method: 'post',
          data: data[0],
          ...changeKeyProps,
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${SRM_ADAPTOR}/v1/script-templates`,
          method: 'delete',
          data: data[0],
        };
      },
    },
  };
}
