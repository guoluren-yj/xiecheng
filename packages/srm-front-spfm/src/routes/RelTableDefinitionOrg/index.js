/**
 * 配置表定义 - 租户级
 * index.js
 * @date: 2020-07-15
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useState } from 'react';
import { message } from 'choerodon-ui';
import {
  Table,
  DataSet,
  Button,
  Modal,
  CodeArea,
  Upload,
  Dropdown,
  Menu,
  Form,
  // TextField,
  IntlField,
  Lov,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { omit } from 'lodash';
import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { getResponse, getAccessToken } from 'utils/utils';
import { API_HOST } from 'utils/config';
import intl from 'utils/intl';

import JSONFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSONFormatter';
// 引入 json lint
// 处理 codemirror 的SSR问题， 如无需SSR，请用import代替require;
import 'codemirror/mode/javascript/javascript';
import 'choerodon-ui/pro/lib/code-area/lint/json';
import { Header, Content } from 'components/Page';
import { Button as PermissionButton } from 'components/Permission';
import { downloadFileByAxios } from 'services/api';
import {
  savaRelTableDefinitionOrgData,
  updateRelTableDefinitionOrgData,
  deleteRelTableDefinitionOrgData,
  checkRelTableDefinitionCreatable,
  createRelTableMenu,
} from '@/services/relTableDefinitionService';
import getRelTableDefinitionDs from './store/tableDefinitionDs';
import getTableEditFormDs from './store/tableEditFormDs';
import getTableDefineJsonDs from './store/tableDefineJsonDs';
import getMenuDs from './store/menuDs';
import TableEditModal from './TableEditModal';
import styles from './index.less';

const editModalKey = Modal.key();
const detailModalKey = Modal.key();
const { Item } = Menu;
const options = { mode: { name: 'javascript', json: true } };

function RelTableDefinition(props = {}) {
  const { relTableDefinitionDs, tableEditFormDs, tableDefineJsonDs, menuDs } = props.valueDs;
  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  /**
   * 操作成功后调用表格数据查询和 form 重置
   */
  const successAction = () => {
    notification.success();
    const { currentPage } = relTableDefinitionDs;
    relTableDefinitionDs.query(currentPage);
  };

  /**
   * 保存和更新
   * @param {Function} resolve
   * @param {Function} reject
   */
  const saveRelTableDefinitionData = async (resolve, reject) => {
    const formValidaterResult = await tableEditFormDs.validate();
    const tableValidaterResult = await tableDefineJsonDs.validate();
    if (!formValidaterResult || !tableValidaterResult) {
      reject(intl.get('hzero.common.validation.format').d('数据格式校验不通过	'));
      return false;
    }
    const relTableDefinitionData = tableEditFormDs.toData()[0] || {};
    const tableDefineJsonData = tableDefineJsonDs.toData() || [];
    const mappingJson = {};
    if (relTableDefinitionData.id) {
      const valueStore = []; // type === value 的存储
      const hasNumberLongValueStore = []; // type === longvalue 并且有 number 的存储
      const noNumberLongValuesStore = []; // type === longvalue 没有 number 的存储
      tableDefineJsonData.forEach((data) => {
        if (data.labelType === 'longvalue') {
          if (typeof data.number === 'number') {
            hasNumberLongValueStore[data.number] = data;
          } else {
            noNumberLongValuesStore.push(data);
          }
        } else {
          valueStore.push(data);
        }
      });
      // longvalue cux时只有0 - 20 tenant时只有 0 - 50
      // const longValueLength = relTableDefinitionData.dataSource === 'cux' ? 21 : 51;
      const longValueLength = 51;
      for (let i = 0, j = 0; i < longValueLength && j < longValueLength; i++) {
        // 如果第j个数据为undefined，说明没有number的数组已经全部赋值完，剩下的不用处理，跳出循环
        if (noNumberLongValuesStore[j] === undefined) {
          break;
        }
        if (!hasNumberLongValueStore[i]) {
          hasNumberLongValueStore[i] = noNumberLongValuesStore[j];
          hasNumberLongValueStore[i].number = i;
          j++;
        }
      }
      [...valueStore, ...hasNumberLongValueStore.filter(Boolean)].forEach((data) => {
        // mappingJson[`longvalue${index}`] = omit(data, ['lov', 'lookup']);
        mappingJson[
          data.labelType + (typeof data.number === 'number' ? data.number : '')
        ] = omit(data, ['lov', 'lookup']);
      });
      updateRelTableDefinitionOrgData({
        ...relTableDefinitionData,
        mappingJson: JSON.stringify(mappingJson),
      })
        .then((res) => {
          if (getResponse(res)) {
            successAction();
            resolve();
          } else {
            resolve(false);
          }
        })
        .catch((err) => reject(err));
    } else {
      tableDefineJsonData.forEach((data, index) => {
        mappingJson[`longvalue${index}`] = omit(data, ['lov', 'lookup']);
      });
      // 租户新增表定义时加indexStatus
      savaRelTableDefinitionOrgData({
        ...{ ...relTableDefinitionData, indexStatus: 2 },
        mappingJson: JSON.stringify(mappingJson),
      })
        .then((res) => {
          if (getResponse(res)) {
            successAction();
            resolve();
          } else {
            resolve(false);
          }
        })
        .catch((err) => reject(err));
    }
  };

  /**
   * 删除 元数据 行数据
   * @param {Object} record
   */
  const onDeleteRelTableDefinitionData = (record) => {
    const tableName = record.get('tableName') || '';
    const confirmTitle = (
      <>
        <span style={{ fontWeight: '400' }}>
          {intl.get('spfm.configServer.view.message.ifClean').d('确认删除')}
        </span>
        <span>&nbsp;&nbsp;{tableName}?</span>
      </>
    );
    Modal.confirm({
      title: confirmTitle,
      onOk: () => {
        const deleteData = record.data;
        deleteRelTableDefinitionOrgData(deleteData).then((res) => {
          if (getResponse(res)) {
            successAction();
          }
        });
      },
    });
  };

  /**
   * 打开 Form 编辑 modal
   * @param {String} isCopyFlag 是否是复制标志
   * @param {String} title 弹框标题
   * @param {Boolean} isEditFlag 是否是编辑标志
   * @param {Object} record 行数据
   */
  const showEditModal = (isCopyFlag = false, title = '', isEditFlag = false, record) => {
    if (record) {
      if (!isCopyFlag) {
        tableEditFormDs.create(record.data);
        tableEditFormDs.current.status = 'update';
      } else {
        tableEditFormDs.create({});
      }
      const mappingJson = record.data.mappingJson && JSON.parse(record.data.mappingJson);
      const jsonList = Object.entries(mappingJson).map(([key, value]) => {
        return {
          labelType: key.includes('longvalue') ? 'longvalue' : 'value',
          number: parseInt(key.split('value')[1], 10),
          ...value,
        };
      });
      jsonList.forEach((li) => {
        tableDefineJsonDs.create(li);
      });
    } else {
      tableEditFormDs.create({});
    }
    Modal.open({
      key: editModalKey,
      title,
      children: (
        <TableEditModal
          dataSet={tableEditFormDs}
          tableDefineJsonDs={tableDefineJsonDs}
          isEditFlag={isEditFlag}
          saveData={saveRelTableDefinitionData}
        />
      ),
      onOk: () => new Promise((resolve, reject) => saveRelTableDefinitionData(resolve, reject)),
      onClose: () => {
        tableEditFormDs.loadData([]);
        tableDefineJsonDs.loadData([]);
      },
      drawer: true,
      destroyOnClose: true,
      style: { width: 1200 },
    });
  };

  /**
   * 展示 json 数据
   * @param {String} title 弹框标题
   * @param {String} value 弹框数据
   */
  const showJsonDetail = (title = '', value = '') => {
    Modal.open({
      key: detailModalKey,
      title,
      children: (
        <CodeArea
          disabled
          defaultValue={value}
          options={options}
          formatter={JSONFormatter}
          style={{ height: 500 }}
        />
      ),
      footer: null,
      closable: true,
      movable: false,
      destroyOnClose: true,
      style: { width: 800 },
    });
  };

  const createMenu = (record) => {
    const cRecord = menuDs.create({});
    cRecord.set('tableCode', record.get('tableCode'));
    Modal.open({
      key: detailModalKey,
      title: intl.get('spfm.relTableDefinition.view.modal.title.createMenu').d('生成菜单'),
      drawer: true,
      children: (
        <Form record={cRecord}>
          <IntlField name="menuName" />
          <Lov name="parentObject" />
        </Form>
      ),
      onOk: async () => {
        const resp = await cRecord.validate();
        const recordData = cRecord.toData();
        const { _tls = {} } = recordData || {};
        // 菜单名字使用name接收
        recordData._tls = {
          ..._tls,
          name: _tls.menuName,
        };
        if (resp) {
          return createRelTableMenu(omit(recordData, ['parentObject'])).then((res) => {
            if (getResponse(res)) {
              notification.success();
            }
          });
        } else {
          return false;
        }
      },
      onClose: () => {
        menuDs.remove(cRecord);
      },
    });
  };

  const checkCreatable = (title = '', isEditFlag = false) => {
    checkRelTableDefinitionCreatable()
      .then((res) => {
        if (getResponse(res)) {
          showEditModal(false, title, isEditFlag);
        }
      })
      .catch((err) => notification.error(err));
  };

  const columns = [
    {
      name: 'tableCode',
      width: 250,
    },
    {
      name: 'tableName',
      width: 200,
    },
    {
      name: 'description',
      width: 300,
    },
    {
      name: 'mappingJson',
      renderer: ({ value }) => (
        <a
          onClick={() =>
            showJsonDetail(
              intl
                .get('spfm.relTableDefinition.model.relTableDefinition.mappingJson')
                .d('表定义JSON数据'),
              value
            )
          }
        >
          {value}
        </a>
      ),
    },
    {
      name: 'action',
      width: 160,
      lock: 'right',
      renderer: ({ record }) => (
        <span className="action-link">
          <a
            onClick={() => {
              showEditModal(
                false,
                intl.get('spfm.relTableDefinition.view.modal.title.edit').d('编辑配置表定义'),
                !record.get('editable'),
                record
              );
            }}
          >
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
          <a onClick={() => onDeleteRelTableDefinitionData(record)}>
            {intl.get('hzero.common.button.delete').d('删除')}
          </a>
          <Dropdown
            overlay={
              <Menu>
                <Item>
                  <a
                    onClick={() => {
                      showEditModal(
                        true,
                        intl.get('hzero.common.button.copy').d('复制'),
                        false,
                        record
                      );
                    }}
                  >
                    {intl.get('hzero.common.button.copy').d('复制')}
                  </a>
                </Item>
                <Item>
                  <a onClick={() => createMenu(record)}>
                    {intl.get('spfm.relTableDefinition.view.modal.title.createMenu').d('生成菜单')}
                  </a>
                </Item>
              </Menu>
            }
          >
            <a>{intl.get('hzero.common.button.more').d('更多')}</a>
          </Dropdown>
        </span>
      ),
    },
  ];

  const exportDate = () => {
    if (relTableDefinitionDs.selected.length > 0) {
      setExportLoading(true);
      const idArr = relTableDefinitionDs.selected.map((item) => item.get('id'));
      const api = `/sada/v1/marmot-site-api/REL_EXP`;
      downloadFileByAxios({
        requestUrl: api,
        queryData: { defIds: idArr },
        method: 'POST',
      }).finally(() => {
        setExportLoading(false);
      });
    }
  };

  const ExportBtn = observer(() => {
    return (
      <Button
        onClick={exportDate}
        loading={exportLoading}
        disabled={
          relTableDefinitionDs && relTableDefinitionDs.selected
            ? relTableDefinitionDs.selected.length === 0
            : true
        }
        icon="export"
        tooltip="none"
        style={{ letterSpacing: 0, marginRight: 0 }}
      >
        {intl.get('hzero.common.export').d('导出')}
      </Button>
    );
  });

  return (
    <React.Fragment>
      <Header title={intl.get('spfm.relTableDefinition.view.header.title').d('配置表定义')}>
        <Button
          color="primary"
          onClick={() => {
            checkCreatable(
              intl.get('spfm.relTableDefinition.view.modal.title.create').d('新建配置表定义'),
              false
            );
          }}
        >
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
        <PermissionButton
          style={{ border: 'none', paddingLeft: 0, paddingRight: 0 }}
          loading={false}
          permissionList={[
            {
              code: `srm.bg.business-rule.org.rel.table.definition.button.export`,
              type: 'button',
            },
          ]}
        >
          <ExportBtn />
        </PermissionButton>
        <PermissionButton
          style={{ border: 'none', paddingLeft: 0, paddingRight: 0 }}
          permissionList={[
            {
              code: `srm.bg.business-rule.org.rel.table.definition.button.import`,
              type: 'button',
            },
          ]}
        >
          <Button
            className={styles['action-button-import-noIcon']}
            tooltip="none"
            loading={importLoading}
            icon="archive"
          >
            <Upload
              headers={{ Authorization: `bearer ${getAccessToken()}` }}
              beforeUpload={() => {
                setImportLoading(true);
              }}
              name="excel"
              action={`${API_HOST}/sada/v1/rel-table-definitions/import`}
              accept={['.xls', '.xlsx']}
              showPreviewImage={false}
              showUploadBtn={false}
              showUploadList={false}
              onUploadSuccess={(res) => {
                // 上传成功之后返回true 不成功返回的是JSON
                if (res === 'true') {
                  message.success(
                    intl.get('spfm.relTableDefinition.import.status.success').d('导入成功')
                  );
                } else {
                  try {
                    const data = JSON.parse(res);
                    if (data.failed) {
                      message.error(data.message);
                    }
                  } catch (error) {
                    throw error;
                  }
                }
                setImportLoading(false);
                const { currentPage } = relTableDefinitionDs;
                relTableDefinitionDs.query(currentPage);
              }}
              onUploadError={() => {
                message.error(
                  intl.get('spfm.relTableDefinition.import.status.error').d('导入失败')
                );
                setImportLoading(false);
              }}
            />
            {intl.get('hzero.common.button.importdata').d('导入')}
          </Button>
        </PermissionButton>
      </Header>
      <Content>
        <Table dataSet={relTableDefinitionDs} columns={columns} />
      </Content>
    </React.Fragment>
  );
}

export default formatterCollections({
  code: [
    'spfm.relTableDefinition',
    'hzero.common',
    'spfm.event',
    'spfm.configServer',
    'entity.tenant',
  ],
})(
  withProps(
    () => {
      const relTableDefinitionDs = new DataSet(getRelTableDefinitionDs()); // 配置表定义表格 ds
      const tableEditFormDs = new DataSet(getTableEditFormDs()); // 配置表定义 from ds
      const tableDefineJsonDs = new DataSet(getTableDefineJsonDs()); // 配置表维护表字段json的ds
      const menuDs = new DataSet(getMenuDs());
      const valueDs = {
        relTableDefinitionDs,
        tableEditFormDs,
        tableDefineJsonDs,
        menuDs,
      };
      return { valueDs };
    },
    { cacheState: true }
  )(RelTableDefinition)
);
