/*
 * @Date: 2022-06-10 11:12:39
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import moment from 'moment';
import {
  Table,
  Switch,
  CheckBox,
  Icon,
  Modal,
  DataSet,
  Button,
  Lov,
  Attachment,
  Select,
  TextField,
  Spin,
  Cascader,
} from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import { isEmpty, isFunction, isArray } from 'lodash';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import CommonImport from 'components/Import';
import notification from 'utils/notification';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { Button as PermissionButton } from 'components/Permission';
import { getResponse } from 'utils/utils';

import RegionCascade from '@/routes/components/RegionCascade';
// import { aiApproveResultRender } from '@/routes/components/utils/render';
import { updateLastUploadDate } from '@/services/investigationService';
import {
  commonDealForProps,
  handleRequired,
  handleDisabled,
  useReaction,
  getCommonTableProps,
  getRemoteColumns,
  getRemoteLovProps,
} from '../../utils';
import AptitudeAttachment from './AptitudeAttachment';
import { getAptitudeAttachmentDS } from '../../stores/getAptitudeAttachmentDS';
import { getSupplierClassifyDS } from '../../stores/getSupplierClassifyDS';

import styles from '../../index.less';

const Index = observer(({ dataSet, columns, source, configName, // aiApproveFlag,
  investgHeaderId, organizationId, context, remark, editable, defaultCountry, referenceRangeMessage, _status, tableStyle, investgRemote, reactionFields = {}, onTabValidate = () => {}, defaultBankCompanyName, addPermissionObj = {}, deletePermissionObj = {}, buttonPermissions = {}, getAddBtn, otherRemoteProps = {} }) => { // 其他埋点参数 格式 {type: '' // 来源页面标识, otherProps: {}};
  const [loading, setLoading] = useState(false);

  // 刷新表格数据
  const handleRefresh = useCallback(() => {
    dataSet.setQueryParameter('queryParam', {
      investgHeaderId,
      tenantId: organizationId,
    });
    dataSet.query();
  }, []);

  // 新增供应商分类确认回调
  const onClassifyBeforeSelect = useCallback((records = []) => {
    const addList = records.map(record => {
      const recordData = record.toData();
      return { ...recordData, enabledFlag: 1 };
    });
    // 获取已存在分类的code集合
    const categoryCodeList = (dataSet.toData() || []).map(record => record.categoryCode);
    // 判断勾选的行是否已存在
    const existList = addList.filter(item => categoryCodeList.includes(item.categoryCode));
    if (!isEmpty(existList)) {
      notification.warning({
        message: intl.get('sslm.common.view.message.duplicateClassify').d('不可选择已存在分类'),
      });
      return false;
    }
    addList.forEach(record => {
      dataSet.create(record, 0);
    });
  }, []);

  // 新增供应商分类
  const handleAddClassify = useCallback(() => {
    const supplierClassifyDs = new DataSet(getSupplierClassifyDS({ organizationId }));
    return (
      <Lov
        mode="button"
        name="categoryLov"
        clearButton={false}
        dataSet={supplierClassifyDs}
        tableProps={{
          alwaysShowRowBox: true,
          selectionMode: 'rowbox',
        }}
        onBeforeSelect={onClassifyBeforeSelect}
        modalProps={{
          beforeOpen: () => {
            const lovDs = supplierClassifyDs
              .getField('categoryLov')
              .getOptions(supplierClassifyDs.current);
            if (lovDs) {
              lovDs.unSelectAll();
              lovDs.clearCachedSelected();
            }
          },
        }}
      >
        <Icon type="playlist_add" style={{ fontSize: 14, marginRight: 5, fontWeight: 400 }} />
        {intl.get('hzero.common.button.add').d('新增')}
      </Lov>
    );
  }, []);

  const handleAddClick = useCallback(() => {
    switch (configName) {
      case 'sslmInvestgBankAccount':
        return dataSet.create(
          {
            bankAccountName: defaultBankCompanyName,
          },
          0
        );
      default:
        return dataSet.create({}, 0);
    }
  }, [configName, defaultBankCompanyName]);

  // 获取Table新建按钮
  const getAddButtons = () => {
    if (getAddBtn) {
      return getAddBtn({ dataSet });
    }
    switch (configName) {
      case 'sslmInvestgSupplierCate':
        return handleAddClassify();
      case 'sslmInvestgAddress':
        return (
          <Button
            icon="playlist_add"
            onClick={() => {
              dataSet.create(
                {
                  countryIdLov: defaultCountry,
                  countryCode: defaultCountry?.countryCode,
                  quickIndex: defaultCountry?.quickIndex,
                },
                0
              );
            }}
          >
            {intl.get('hzero.common.button.add').d('新增')}
          </Button>
        );
      case 'sslmInvestgAttachment': {
        const viewFlag = isEmpty(buttonPermissions) ? true : buttonPermissions.addPermission;
        return (
          <PermissionButton
            type="c7n-pro"
            icon="playlist_add"
            style={{ display: viewFlag ? 'inline-block' : 'none' }}
            onClick={() => {
              dataSet.create({}, 0);
            }}
            permissionList={addPermissionObj[configName]}
          >
            {intl.get('hzero.common.button.add').d('新增')}
          </PermissionButton>
        );
      }
      default:
        return (
          <Button
            icon="playlist_add"
            onClick={() => {
              handleAddClick();
            }}
            permissionList={addPermissionObj[configName]}
          >
            {intl.get('hzero.common.button.add').d('新增')}
          </Button>
        );
    }
  };

  // 获取Table删除按钮
  const getDeleteButtons = useCallback(() => {
    const viewFlag = isEmpty(buttonPermissions) ? true : buttonPermissions.deletePermission;
    const disabledDeleteFlag = investgRemote
      ? investgRemote.process('SSLM_INVESTIGATION_TABLE_DELETE_DISABLED_BTN', false, {
          source,
          otherRemoteProps,
          configName,
          dataSet,
        })
      : false;
    switch (configName) {
      case 'sslmInvestgAttachment':
        return (
          <PermissionButton
            type="c7n-pro"
            icon="delete"
            disabled={isEmpty(dataSet.selected) || disabledDeleteFlag}
            style={{ display: viewFlag ? 'inline-block' : 'none' }}
            onClick={() => {
              dataSet
                .delete(dataSet.selected, {
                  title: intl.get('hzero.common.message.confirm.title').d('提示'),
                  children: intl
                    .get('sslm.common.view.message.sureDeleteSelectedRows')
                    .d('确认删除选中行？'),
                })
                .finally(() => onTabValidate(configName));
            }}
            permissionList={deletePermissionObj[configName]}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </PermissionButton>
        );
      default:
        return (
          <PermissionButton
            type="c7n-pro"
            icon="delete"
            disabled={isEmpty(dataSet.selected) || disabledDeleteFlag}
            onClick={() => {
              dataSet
                .delete(dataSet.selected, {
                  title: intl.get('hzero.common.message.confirm.title').d('提示'),
                  children: intl
                    .get('sslm.common.view.message.sureDeleteSelectedRows')
                    .d('确认删除选中行？'),
                })
                .finally(() => onTabValidate(configName));
            }}
            permissionList={deletePermissionObj[configName]}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </PermissionButton>
        );
    }
  }, [configName, onTabValidate]);

  // 获取Table其他按钮
  const getOtherButtons = useCallback(() => {
    switch (configName) {
      case 'sslmInvestgEquipment':
        return [
          <CommonImport
            businessObjectTemplateCode="SSLM.INVESTG_EQUIPMENT_IMPORT"
            prefixPatch={SRM_SSLM}
            refreshButton
            tenantId={organizationId}
            buttonText={intl.get('hzero.common.title.batchImport').d('批量导入')}
            buttonProps={{
              funcType: 'flat',
            }}
            args={{ investgHeaderId, tenantId: organizationId }}
            successCallBack={() => {
              handleRefresh();
            }}
          />,
        ];
      default:
        return [];
    }
  }, [configName]);

  // 处理资质附件
  const handleAptitudeAttachment = useCallback(
    (record, configProps = {}) => {
      const { mandatoryField = '' } = configProps;
      const mandatoryFieldList = (mandatoryField && mandatoryField.split(',')) || [];
      // 附件弹窗必输字段标识
      const requiredFlagMap = {
        dueDateFlag: mandatoryFieldList.includes('expired'),
        fileTypeFlag: mandatoryFieldList.includes('fileType'),
      };
      const { data: { investgProserviceId } = {} } = record;
      const aptitudeAttachmentDs = new DataSet(
        getAptitudeAttachmentDS({
          investgProserviceId,
          editable,
          requiredFlagMap,
          pageSource: source,
        })
      );
      Modal.open({
        drawer: true,
        key: Modal.key(),
        style: { width: 1000 },
        cancelButton: false,
        title: intl.get('hzero.common.upload.text').d('上传附件'),
        okText: intl.get('hzero.common.button.close').d('关闭'),
        children: (
          <AptitudeAttachment
            record={record}
            editable={editable}
            dataSet={aptitudeAttachmentDs}
            investgProserviceId={investgProserviceId}
          />
        ),
        onOk: () => {
          const attachmentList = aptitudeAttachmentDs.toData();
          record.set('attachment', attachmentList);
        },
      });
    },
    [editable, source]
  );

  // 处理Column的editor属性
  const getColumnEditor = useCallback(
    (column, record) => {
      const configProps = commonDealForProps(column, context);
      const { disabled, onChange, extSetMap } = configProps;
      const { componentType } = column;
      if (editable) {
        switch (componentType) {
          case 'Switch':
            return <Switch />;
          case 'Checkbox':
            return (
              <CheckBox
                onChange={() => {
                  if (isFunction(onChange)) {
                    onChange({ extSetMap, record });
                  }
                }}
              />
            );
          case 'Lov': {
            const lovProps = {
              onChange: lovRecord => {
                if (isFunction(onChange)) {
                  onChange({ extSetMap, record, lovRecord, configName });
                }
              },
              tableProps: {
                treeAsync: true,
                alwaysShowRowBox: true,
                onRow: ({ record: curRecord }) => {
                  const nodeProps = {};
                  if (curRecord.get('hasChild') === '0') {
                    nodeProps.isLeaf = true;
                  }
                  return nodeProps;
                },
              },
              onBeforeSelect: curRecord => {
                const { selectable } = curRecord || {};
                return selectable;
              },
            };
            const lovParams = {
              lovProps,
              investgRemote,
              remoteParams: {
                recordProps: {
                  configName,
                  fieldProps: column,
                  record,
                },
                otherRemoteProps,
              },
            };
            const remotelovProps = getRemoteLovProps(lovParams);

            return <Lov {...remotelovProps} />;
          }
          default:
            return !disabled;
        }
      }
    },
    [context, editable, configName]
  );

  // 处理附件信息的附件类型
  const handleAttachmentTypeEditor = useCallback(
    (record, componentType) => {
      if (editable && !(record.get('purchaserFlag') || record.get('companyAttachmentId'))) {
        if (componentType === 'ValueList') {
          return (
            <Select
              onChange={value => {
                const attachmentTypeField = record.getField('attachmentType');
                const attachmentTypeMeaning = attachmentTypeField.getText(value);
                record.set('attachmentTypeMeaning', attachmentTypeMeaning);
              }}
            />
          );
        } else if (componentType === 'Cascader') {
          return (
            <Cascader
              onChange={data => {
                if (data && isArray(data)) {
                  record.set('parentAttachmentType', data[0]);
                  record.set('attachmentType', data[1]);
                } else {
                  record.set('parentAttachmentType', null);
                  record.set('attachmentType', null);
                }
              }}
            />
          );
        } else {
          return <TextField />;
        }
      } else {
        return false;
      }
    },
    [editable]
  );

  const newColumns = columns.map(column => {
    const { fieldCode, componentType, fixedCol, colWidth } = column;
    const lock = fixedCol;
    const configProps = commonDealForProps(column);
    const { isAttachmentUrl } = configProps;
    // 处理其他属性
    const tableProps = getCommonTableProps(column);
    // 处理产品及服务”资质附件“
    if (configName === 'sslmInvestgProservice' && fieldCode === 'attachment' && isAttachmentUrl) {
      return {
        name: fieldCode,
        lock,
        width: colWidth || 150,
        renderer: ({ record }) => {
          return (
            <a onClick={() => handleAptitudeAttachment(record, configProps)}>
              <Icon type={editable ? 'file_upload' : 'attach_file'} style={{ fontSize: 14 }} />
              {editable
                ? intl.get(`hzero.common.upload.text`).d('上传附件')
                : intl.get('hzero.common.upload.viewOnlyText').d('查看附件')}
            </a>
          );
        },
      };
    }
    // 处理地址信息”地区“
    else if (configName === 'sslmInvestgAddress' && fieldCode === 'regionId') {
      return {
        name: fieldCode,
        width: colWidth || 260,
        className: styles['region-td'],
        lock,
        renderer: ({ record }) => {
          // 处理必填编辑
          const required = handleRequired({ record, line: column });
          const disabled = handleDisabled({ record, line: column });
          return (
            <RegionCascade
              record={record}
              required={Boolean(required)}
              editable={editable}
              disabled={disabled}
            />
          );
        },
      };
    }
    // 附件信息 附件类型
    else if (configName === 'sslmInvestgAttachment') {
      switch (fieldCode) {
        case 'attachmentType': {
          return {
            name: ['Cascader'].includes(componentType) ? `${fieldCode}Merge` : fieldCode,
            width: colWidth || 150,
            editor: record =>
              !record.get('previewFlag') && handleAttachmentTypeEditor(record, componentType),
            lock,
            renderer: !['Cascader'].includes(componentType)
              ? ({ record }) => {
                  const { attachmentType, attachmentTypeMeaning } = record.get([
                    'attachmentType',
                    'attachmentTypeMeaning',
                  ]);
                  return attachmentTypeMeaning || attachmentType;
                }
              : null,
          };
        }
        default:
          break;
      }
    }
    // 附件上传带出最后更新日期
    if (['attachmentUuid', 'supplierAttachmentUuid'].includes(fieldCode)) {
      return {
        name: fieldCode,
        width: colWidth || 150,
        lock,
        editor: record => {
          return (
            <Attachment
              crossTenant
              viewMode="popup"
              readOnly={record.get('previewFlag') || !editable}
              className={styles['attachment-wrap']}
              afterUpload={() => {
                // 处理没有生成uuid的情况
                hanldeFileNotUUid(record);
                record.set('expirationDate', null);
                handleLastUploadDate(record, 'ADD');
              }}
              afterDelete={() => {
                // 处理没有生成uuid的情况
                hanldeFileNotUUid(record);
                record.set('expirationDate', null);
                handleLastUploadDate(record, 'DELETE');
              }}
            />
          );
        },
      };
    }
    const name = ['Lov', 'TransferLov'].includes(componentType) ? `${fieldCode}Lov` : fieldCode;
    return {
      name,
      lock,
      width: colWidth || 150,
      editor: record =>
        !record.get('previewFlag') &&
        !record.get('extSourceAccountFlag') &&
        getColumnEditor(column, record),
      ...tableProps,
    };
  });

  // const finallyCol = [
  //   ...newColumns,
  //   aiApproveFlag && {
  //     name: 'aiApproveResult',
  //     renderer: props => aiApproveResultRender({ ...props, configName, documentCode: 'INVESTG' }),
  //   },
  // ].filter(Boolean);

  const getColumns = () => {
    const colProps = {
      configName,
      investgRemote,
      otherRemoteProps,
      columns: newColumns,
    };
    const col = getRemoteColumns(colProps);
    return col;
  };

  // 处理没有生成uuid的情况
  const hanldeFileNotUUid = record => {
    const rowKey = configName === 'sslmInvestgAuth' ? 'investgAuthId' : 'investgAttachmentId';
    const lineId = record.get(rowKey);
    // 获取字段初始值
    const hasUUid = ['sslmInvestgAttachment'].includes(configName)
      ? record.getPristineValue('supplierAttachmentUuid')
      : record.getPristineValue('attachmentUuid');
    const notUUid = !lineId || !hasUUid;
    // 更新最后上传时间
    if (notUUid) {
      record.set('lastUploadDate', moment().format(DEFAULT_DATE_FORMAT));
    }
  };

  // 处理附件/资质信息最后上传日期
  const handleLastUploadDate = useCallback(
    (record = {}, updateType = 'ADD') => {
      const rowKey = configName === 'sslmInvestgAuth' ? 'investgAuthId' : 'investgAttachmentId';
      const currentData = record.toData() || {};
      // 这里取功能表的uuid，当功能表存上uuid的时候才更新行上的相关信息
      // 获取字段初始值
      const hasUUid = ['sslmInvestgAttachment'].includes(configName)
        ? record.getPristineValue('supplierAttachmentUuid')
        : record.getPristineValue('attachmentUuid');
      if (
        !isEmpty(currentData) &&
        currentData[rowKey] &&
        editable &&
        ['sslmInvestgAttachment', 'sslmInvestgAuth'].includes(configName) &&
        hasUUid
      ) {
        setLoading(true);
        updateLastUploadDate({
          ...currentData,
          configName,
          pageSource: source,
          updateType,
        })
          .then(res => {
            if (getResponse(res)) {
              const {
                objectVersionNumber,
                lastUploadDate,
                expirationDate,
                longEffectiveFlag,
              } = res;
              // record.set('objectVersionNumber', objectVersionNumber);
              record.set({
                lastUploadDate,
                objectVersionNumber,
              });
              // 如果是附件页签额外更新其他字段
              if (['sslmInvestgAttachment'].includes(configName)) {
                record.set({
                  // lastUploadDate,
                  expirationDate,
                  longEffectiveFlag,
                });
              }
            }
          })
          .finally(() => setLoading(false));
      }
    },
    [editable, configName]
  );

  useEffect(() => {
    // Map<number, Map<string, [any, any]>>
    const cacheDefaultValues = new Map();
    return useReaction(dataSet, columns, reactionFields, cacheDefaultValues);
  }, [dataSet, columns, reactionFields, editable]);

  // 获取table头按钮
  const getButtons = useCallback(() => {
    const saveBtnFlag = ['write', 'enterpriseInform'].includes(source);
    const remoteSaveBtnFlag = investgRemote
      ? investgRemote.process('SSLM_INVESTIGATION_TABLE_SAVE_BTN', saveBtnFlag, {
          source,
          configName,
        })
      : saveBtnFlag;
    const addBtn = getAddButtons();
    const remoteAddBtn = investgRemote
      ? investgRemote.process('SSLM_INVESTIGATION_TABLE_ADD_BTN', addBtn, {
          source,
          configName,
          ...otherRemoteProps,
        })
      : addBtn;
    if (editable) {
      return [
        remoteAddBtn,
        getDeleteButtons(),
        remoteSaveBtnFlag
          ? [
              'save',
              {
                afterClick: () => onTabValidate(configName),
                onClick: () => {
                  dataSet.submit().then(res => {
                    if (res) {
                      dataSet.query();
                    }
                  });
                },
              },
            ]
          : '',
        !['enterpriseInform'].includes(source) ? getOtherButtons() : '',
      ];
    } else {
      return [];
    }
  }, [editable, source, configName, onTabValidate, addPermissionObj, deletePermissionObj]);

  const buttons = investgRemote
    ? investgRemote.process('SSLM_INVESTIGATION_TABLE_BTNS', getButtons(), {
        source,
        dataSet,
        editable,
        configName,
        defaultBankCompanyName,
        ...otherRemoteProps,
      })
    : getButtons();
  return (
    <Fragment>
      {remark && (
        <Alert
          showIcon
          type="info"
          message={remark}
          style={{ marginBottom: 16, border: 0 }}
          className={styles['investigation-tab-alert-info']}
        />
      )}
      {!isEmpty(referenceRangeMessage) && !editable && (
        <Alert
          showIcon
          type={_status === 'approval' ? 'error' : 'info'}
          style={{ marginBottom: 16, border: 0 }}
          message={
            <Fragment>
              {referenceRangeMessage.map(n => (
                <div>{n}</div>
              ))}
            </Fragment>
          }
          className={
            _status === 'approval'
              ? styles['investigation-tab-alert-error']
              : styles['investigation-tab-alert-info']
          }
        />
      )}
      <Spin spinning={loading}>
        <Table
          dataSet={dataSet}
          columns={getColumns()}
          virtualCell={false}
          style={tableStyle}
          buttons={buttons}
          autoValidationLocate={false}
          selectionMode={editable ? 'rowbox' : 'none'}
        />
      </Spin>
    </Fragment>
  );
});

export default Index;
