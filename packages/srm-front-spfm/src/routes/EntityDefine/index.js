/**
 * index.js
 * 结构定义
 * @date: 2020-08-10
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { Table, DataSet, Modal, Button, CodeArea } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import withProps from 'utils/withProps';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import {
  savaEntityDefineData,
  updateEntityDefineData,
  deleteEntityDefineData,
  queryEntityDefineData,
  importFullEntityDefineData,
} from '@/services/entityDefineService';
import { SRM_ADAPTOR } from '_utils/config';
import JSONFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSONFormatter';
import { debounce } from 'lodash';
import { downloadFile } from 'services/api';
import EditModal from './EditModal';
import { getEntityDs, getEntityRecordDs, getEntityFieldsDs } from './store/entityDs';
import { isJSON } from './util';

const modalKey = Modal.key();

const jsonOptions = { mode: { name: 'javascript', json: true } };

function EntityDefine(props = {}) {
  const { entityDs, entityRecordDs, entityFieldsDs } = props.valueDs;

  /**
   * 操作成功后调用表格数据查询和 form 重置
   */
  const successAction = () => {
    notification.success();
    entityDs.query();
    // entityRecordDs.reset();
  };

  const saveEntityDefineData = async (resolve, reject) => {
    const recordData = entityRecordDs.toData()[0] || {};
    let saveData = {
      ...recordData,
    };
    if (recordData.fieldSource !== 'INTERFACE') {
      const FieldsData = entityFieldsDs.toData();
      // 临时解决值集ignore:always 无效问题
      // eslint-disable-next-line no-param-reassign
      FieldsData.forEach(item => delete item.lov);
      saveData = {
        ...saveData,
        definitionJson: JSON.stringify(FieldsData),
        adaptorEntityFields: FieldsData.map(item => ({
          ...item,
          structureId: entityFieldsDs.queryParameter?.structureId ?? undefined,
        })),
      };
      // 必填校验
      let flag = false;
      const promiseArr = [];
      entityFieldsDs.forEach(rec => {
        promiseArr.push(
          rec.validate(true).then(res => {
            if (!res) flag = true;
            return rec.getValidationErrors();
          })
        );
      });
      const result = await Promise.all(promiseArr);
      if (flag) {
        // 报错提示：结构定义字段【字段名称】的【XX】字段为必输，请输入后保存。
        const errorMsg =
          result?.map((item, index) => {
            // 拿到每个数组项里的字段
            const fieldArr = [
              ...new Set(
                (
                  item?.map(i => {
                    const errorObj = i?.errors[0] ?? {};
                    const label = errorObj?.injectionOptions?.label ?? '';
                    const name = errorObj?.validationProps?.name ?? '';
                    // 处理多语言的报错
                    if ((name?.indexOf('_tls') ?? 0) !== -1) {
                      // 切割该字段
                      const fName =
                        // eslint-disable-next-line no-useless-escape
                        /_tls\.(?<fieldName>[^\.]+)\..*/.exec(name)?.groups?.fieldName ?? '';
                      // 找到字段的中文名
                      const labelName = entityFieldsDs?.getField(fName)?.get('label') ?? '';
                      return `${labelName}${intl.get('hzero.common.title.intl').d('多语言')}`;
                    }
                    return label;
                  }) ?? []
                )?.filter(arr => !!arr) ?? []
              ),
            ];
            const fieldCode = [
              ...new Set(
                (
                  item?.map(i => {
                    // eslint-disable-next-line no-unused-expressions
                    i?.errors[0]?.validationProps?.name ?? '';
                    const errorObj = i?.errors[0] ?? {};
                    const name = errorObj?.validationProps?.name ?? '';
                    // 处理多语言的报错
                    if ((name?.indexOf('_tls') ?? 0) !== -1) {
                      // 切割该字段
                      const fName =
                        // eslint-disable-next-line no-useless-escape
                        /_tls\.(?<fieldName>[^\.]+)\..*/.exec(name)?.groups?.fieldName ?? '';
                      // 找到字段的中文名
                      const labelName = entityFieldsDs?.getField(fName)?.get('label') ?? '';
                      return `${labelName}${intl.get('hzero.common.title.intl').d('多语言')}`;
                    }
                    return name;
                  }) ?? []
                )?.filter(arr => !!arr) ?? []
              ),
            ];
            const name = entityFieldsDs.get(index).get('description');
            return { fieldArr, fieldCode, name };
          }) ?? [];
        // 检查出错的字段是否有name
        if (errorMsg.some(item => (item?.fieldCode ?? []).indexOf('description') !== -1)) {
          notification.warning({
            message: intl.get('spfm.entityDefine.notification.nameRequired').d('字段名称必输'),
          });
          resolve(false);
          return;
        }
        // 检查出错的字段是否有code
        if (errorMsg.some(item => (item?.fieldCode ?? []).indexOf('name') !== -1)) {
          notification.warning({
            message: intl.get('spfm.entityDefine.notification.codeRequired').d('字段编码必输'),
          });
          resolve(false);
          return;
        }
        // 检查出错的字段是否是关联表编码 和关联表字段编码
        if (errorMsg.some(item => (item?.fieldCode ?? []).indexOf('tableCode') !== -1)) {
          notification.warning({
            message: intl
              .get('spfm.entityDefine.notification.tableCodeRequired')
              .d('【关联表字段编码】字段非空时，【关联表编码】字段不允许为空'),
          });
          resolve(false);
          return;
        }
        if (errorMsg.some(item => (item?.fieldCode ?? []).indexOf('tableFieldCode') !== -1)) {
          notification.warning({
            message: intl
              .get('spfm.entityDefine.notification.tableFieldCodeRequired')
              .d('【关联表编码】字段非空时，【关联表字段编码】字段不允许为空'),
          });
          resolve(false);
          return;
        }
        const intlMsg = (
          (
            errorMsg?.map(item => {
              if ((item?.fieldCode ?? []).length === 0) return '';
              return intl.get('spfm.entityDefine.notification.field.template', {
                name: item?.name ?? '',
                fieldStr: item?.fieldArr?.join(',') ?? '',
              });
            }) ?? []
          )?.filter(str => !!str) ?? []
        )?.join(',');
        if (intlMsg) {
          notification.warning({
            message: `${intlMsg}${intl
              .get('spfm.entityDefine.notification.edit.required')
              .d('为必输，请输入后保存')}`,
          });
        }
        resolve(false);
        return;
      }
    }
    entityRecordDs.validate().then(response => {
      if (response) {
        if (recordData.id) {
          updateEntityDefineData(saveData)
            .then(res => {
              if (getResponse(res)) {
                successAction();
                // 成功保存后调用接口刷新页面
                queryEntityDefineData({
                  structureCode: entityRecordDs?.current?.get('entityCode'),
                }).then(data => {
                  entityRecordDs.loadData([data]);
                  entityFieldsDs.setQueryParameter('structureId', data?.id ?? '');
                  entityFieldsDs.query();
                });
              }
              resolve(true);
            })
            .catch(err => reject(err));
        } else {
          savaEntityDefineData(saveData)
            .then(res => {
              if (getResponse(res)) {
                successAction();
                // 成功保存后调用接口刷新页面
                queryEntityDefineData({
                  structureCode: entityRecordDs?.current?.get('entityCode'),
                }).then(data => {
                  entityRecordDs.loadData([data]);
                  entityFieldsDs.setQueryParameter('structureId', data?.id ?? '');
                  entityFieldsDs.query();
                });
              }
              resolve(true);
            })
            .catch(err => reject(err));
        }
      } else {
        resolve(false);
      }
    });
  };

  const resetModal = () => {
    entityRecordDs.loadData([]);
    entityFieldsDs.loadData([]);
    entityFieldsDs.setQueryParameter('structureId', '');
    entityFieldsDs.queryDataSet.loadData([]);
  };

  const showEditModal = (title = '', isEditFlag = false, record, readOnly = false) => {
    resetModal();
    if (record) {
      entityRecordDs.loadData([
        {
          ...record.data,
          fieldSource: (record.data && record.data.fieldSource) || 'CONFIGURATION',
        },
      ]);
      entityFieldsDs.setQueryParameter('structureId', record?.data?.id ?? '');
      entityFieldsDs.query();
    }
    const footOption = readOnly
      ? {
          footer: null,
        }
      : {
          onOk: () => new Promise((resolve, reject) => saveEntityDefineData(resolve, reject)),
        };
    Modal.open({
      key: modalKey,
      title,
      children: (
        <EditModal
          dataSet={entityRecordDs}
          tableDs={entityFieldsDs}
          isEditFlag={isEditFlag}
          readOnly={readOnly}
        />
      ),
      drawer: !readOnly,
      closable: true,
      destroyOnClose: true,
      style: { width: 1000 },
      okText: intl.get('hzero.common.button.save').d('保存'),
      cancelText: intl.get('hzero.common.view.button.back').d('返回'),
      onClose: resetModal,
      onCancel: resetModal,
      ...footOption,
    });
  };

  const importEntityDs = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'importEntity',
        type: 'string',
      },
    ],
  });

  /**
   * 设置导入字段数据
   * @param {Function} resolve
   * @param {Function} reject
   */
  const setImportEntity = (resolve, reject) => {
    const { importEntity } = importEntityDs.current.toJSONData();
    if (isJSON(importEntity)) {
      importFullEntityDefineData(JSON.parse(importEntity)).then(res => {
        if (getResponse(res)) {
          successAction();
          resolve();
        } else {
          resolve(false);
        }
      });
    } else {
      reject('not json');
    }
  };

  const importEntity = () => {
    Modal.open({
      key: modalKey,
      title: intl.get('spfm.entityDefine.view.modal.title.import').d('结构定义导入'),
      children: (
        <CodeArea
          dataSet={importEntityDs}
          name="importEntity"
          options={jsonOptions}
          format={JSONFormatter}
          style={{ height: 600 }}
        />
      ),
      // onOk: () => setImportEntity(),
      onOk: () => new Promise((resolve, reject) => setImportEntity(resolve, reject)),
      onClose: () => {
        importEntityDs.reset();
      },
      closable: true,
      okCancel: true,
      destroyOnClose: true,
      style: { width: 800 },
    });
  };

  const onExport = debounce(id => {
    const api = `${SRM_ADAPTOR}/v1/adaptor-entity-structures/export/${id}`;
    downloadFile({ requestUrl: api });
  });

  const onDelete = record => {
    Modal.confirm({
      title: intl.get('spfm.configServer.view.message.ifClean').d('确认删除？'),
      onOk: () => {
        const deleteData = record.data;
        deleteEntityDefineData(deleteData).then(res => {
          if (getResponse(res)) {
            successAction();
          }
        });
      },
    });
  };

  const columns = [
    {
      name: 'entityCode',
      width: 250,
    },
    {
      name: 'entityName',
      width: 200,
    },
    {
      name: 'description',
    },
    {
      name: 'action',
      width: 300,
      renderer: ({ record }) => (
        <span className="action-link">
          <a onClick={() => onExport(record.data.id)}>
            {intl.get('hzero.common.export').d('导出')}
          </a>
          {/* <a
            onClick={() =>
              showEditModal(
                intl.get('spfm.entityDefine.view.modal.title.preview').d('查看字段配置'),
                true,
                record,
                true
              )
            }
          >
            {intl.get('spfm.entityDefine.view.modal.title.preview').d('查看字段配置')}
          </a> */}
          <a
            onClick={() =>
              showEditModal(
                intl.get('spfm.entityDefine.view.modal.title.edit').d('编辑结构定义'),
                true,
                record
              )
            }
          >
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
          <a onClick={() => onDelete(record)}>{intl.get('hzero.common.button.delete').d('删除')}</a>
        </span>
      ),
    },
  ];
  return (
    <React.Fragment>
      <Header title={intl.get('spfm.entityDefine.view.head.title').d('结构定义')}>
        <Button
          color="primary"
          onClick={() => {
            showEditModal(
              intl.get('spfm.entityDefine.view.modal.title.create').d('新建结构定义'),
              false
            );
          }}
        >
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
        <Button
          // color="primary"
          onClick={() => {
            importEntity(
              intl.get('spfm.entityDefine.view.modal.title.import').d('结构定义导入'),
              false
            );
          }}
        >
          {intl.get('hzero.common.button.import').d('导入')}
        </Button>
      </Header>
      <Content>
        <Table dataSet={entityDs} columns={columns} />
      </Content>
    </React.Fragment>
  );
}

export default formatterCollections({
  code: ['spfm.entityDefine', 'hzero.common', 'spfm.configServer', 'entity.tenant', 'spfm.event'],
})(
  withProps(
    () => {
      const entityDs = new DataSet(getEntityDs());
      const entityRecordDs = new DataSet(getEntityRecordDs());
      const entityFieldsDs = new DataSet(getEntityFieldsDs());
      const valueDs = {
        entityDs,
        entityRecordDs,
        entityFieldsDs,
      };
      return { valueDs };
    },
    { cacheState: true }
  )(EntityDefine)
);
