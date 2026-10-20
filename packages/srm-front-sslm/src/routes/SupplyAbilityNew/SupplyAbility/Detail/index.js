/*
 * 供货能力清单详情页
 * @date: 2023/10/19
 * @author: zlh
 * @version: 0.0.1
 * @copyright Copyright (c) 2023, Hand
 */
import React, { useRef, Fragment, useState, useEffect, useMemo, useCallback } from 'react';
import { compose, isEmpty } from 'lodash';
import querystring from 'querystring';
import { Card } from 'choerodon-ui';
import { PRIVATE_BUCKET } from '_utils/config';
import { Button, Spin, useDataSet, DataSet, Modal } from 'choerodon-ui/pro';
import { Button as PermissionButton } from 'components/Permission';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import remote from 'utils/remote';

import { handleSupplierDetail } from '@/routes/components/utils/utils';
import { operationRecordsModal } from '@/routes/components/OperationRecords';
import intl from 'utils/intl';
import {
  queryAbilityDimension,
  saveAll,
  saveBatchLine,
  expandCategory,
  submitLines,
  deleteEnclosureTableData,
  onDraggerUploadRemove,
} from '@/services/supplyAbilityService';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import styles from '@/routes/index.less';
import HeaderInfo from './HeaderInfo';
import CategoryMaterial from './CategoryMaterial';
import AttachmentInfo from './AttachmentInfo';
import ExpandTable from './ExpandTable';
import {
  getBasicsDS,
  getCategoryMaterialDS,
  getAttachmentDS,
  getExpanCompany,
} from '../stores/index';

const organizationId = getCurrentOrganizationId();

const customizeUnitCodeList = [
  'SSLM.SUPPLIER_ABLILITY_MANAGE.DETAIL.BASIC',
  'SSLM.SUPPLIER_ABLILITY_MANAGE.DETAIL.CATEGORY_MATERIALS',
  'SSLM.SUPPLIER_ABLILITY_MANAGE.DETAIL.ATTACHMENT',
];

const Detail = ({
  history,
  customizeBtnGroup,
  customizeTable,
  customizeForm,
  custLoading,
  location,
  match: {
    params: { supplyAbilityId },
  },
  supplyManageDetailRemote,
}) => {
  const routerParams = useMemo(() => querystring.parse(location.search.substr(1)), [location]);
  const { type } = routerParams;
  const isCreat = !supplyAbilityId; // 是否新建页面
  const isEdit = type === 'edit' || isCreat; // 是否编辑页面
  const readOnlyFlag = type === 'view'; // 查看页面时，个性化字段只读

  const [spinning, setSpinning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCompanyDimension, setTsCompanyDimension] = useState(false);
  const [basicsInfos, setBasicsInfo] = useState({});

  const basicsDs = useDataSet(() => getBasicsDS({ supplyAbilityId, isCreat }), []);
  const categoryMaterialDs = useDataSet(
    () =>
      supplyManageDetailRemote.process(
        'SSLM_SUPPLY_ABILITY_MANAGE_DETAIL_CATEGORY_MATERIAL_DS_PROPS',
        getCategoryMaterialDS({ supplyAbilityId, isEdit }),
        { isCreat, isEdit }
      ),
    [supplyAbilityId, isEdit, isCreat]
  );
  const attachmentDs = useDataSet(() => getAttachmentDS({ supplyAbilityId, isEdit }), []);

  const {
    isReviewFlag, // 是否需要评审[提交审批按钮显示标识]
    isGroupManageFlag, // 是否集团级管控[一键拓展按钮显示标识]
  } = basicsInfos;

  const remoteRef = useRef({}); // 存储埋点增加的页签ref

  useEffect(() => {
    setSpinning(true);
    if (supplyAbilityId) {
      refreshAll();
    } else {
      // eslint-disable-next-line no-unused-expressions
      supplyManageDetailRemote?.event?.fireEvent('cuxInitDefaultValue', {
        basicsDs,
        supplyAbilityId,
        isCreat,
      });
    }
    if (supplyManageDetailRemote.event) {
      supplyManageDetailRemote.event.fireEvent('cuxInit', {
        basicsDs,
        supplyAbilityId,
        isCreat,
        isEdit,
        categoryMaterialDs,
      });
    }
    setSpinning(false);
  }, [supplyAbilityId]);

  // 加载全部数据
  const refreshAll = useCallback(async () => {
    setLoading(true);
    // 设置查询参数
    basicsDs.setQueryParameter('queryParam', {
      customizeUnitCode: 'SSLM.SUPPLIER_ABLILITY_MANAGE.DETAIL.BASIC',
    });
    categoryMaterialDs.setQueryParameter('queryParam', {
      customizeUnitCode:
        'SSLM.SUPPLIER_ABLILITY_MANAGE.DETAIL.CATEGORY_MATERIALS,SSLM.SUPPLIER_ABLILITY_MANAGE.DETAIL.CATEGORYS_SEARCH_BAR',
    });
    attachmentDs.setQueryParameter('queryParam', {
      customizeUnitCode: 'SSLM.SUPPLIER_ABLILITY_MANAGE.DETAIL.ATTACHMENT',
    });
    // 查询数据
    await basicsDs.query().then(res => {
      if (!isEmpty(getResponse(res))) {
        const { supplierCompanyId: curSupplierCompanyId } = res;
        setBasicsInfo(res);
        handleAbilityDimension(curSupplierCompanyId);
      }
    });
    await categoryMaterialDs.query();
    await attachmentDs.query();
    setLoading(false);
  }, []);

  // 刷新数据
  const refreshData = useCallback(() => {
    basicsDs.query();
    categoryMaterialDs.query();
    attachmentDs.query();
  }, []);

  // 查询配置中心供货能力清单管控维度
  const handleAbilityDimension = useCallback(supplierCompanyId => {
    const params = {
      supplierCompanyId,
    };
    queryAbilityDimension(params).then(res => {
      if (getResponse(res)) {
        setTsCompanyDimension(res === 'COMPANY');
      }
    });
  }, []);

  // 附件删除
  const deleteAttachmentData = useCallback(dataSet => {
    const selectedDataList = dataSet.selected.map(e => e.toData());
    const creatRecords = selectedDataList.filter(e => !e.attachmentLineId);
    const deleteRecords = selectedDataList.filter(e => e.attachmentLineId);
    const deleteUrls = selectedDataList.map(e => e.attachmentUrl);
    if (!isEmpty(selectedDataList)) {
      if (!isEmpty(creatRecords)) {
        const creatRecordRow = dataSet.selected.filter(e => !e.attachmentLineId);
        // 删除新建附件行
        attachmentDs.remove(creatRecordRow);
      }
      if (!isEmpty(deleteRecords)) {
        const idList = deleteRecords.map(record => record.attachmentLineId);
        const params = {
          idList,
          organizationId,
        };
        deleteEnclosureTableData(params).then(res => {
          const response = getResponse(res);
          if (isEmpty(response)) {
            attachmentDs.query();
            notification.success();
          }
        });
      }
      const deleteParams = {
        organizationId,
        bucketName: PRIVATE_BUCKET,
        directory: 'sslm-supplyAbility',
        urls: deleteUrls,
      };
      onDraggerUploadRemove(deleteParams);
    }
  }, []);

  // 全局保存
  const handleSave = useCallback(async () => {
    const basicsValidateFlag = await basicsDs.validate();
    const categoryValidateFlag = await categoryMaterialDs.validate();
    const attachmentValidateFlag = await attachmentDs.validate();
    return new Promise(async resolve => {
      if (basicsValidateFlag && categoryValidateFlag && attachmentValidateFlag) {
        setLoading(true);
        const basicsInfo = basicsDs.current?.toJSONData() || {};
        const supplyAbilityLines = categoryMaterialDs.toJSONData(); // 获取变更数据;

        const supplyAbilityAttLns = attachmentDs.toJSONData(); // 获取变更数据;

        const newParams = {
          ...basicsInfo,
          supplyAbilityLines,
          supplyAbilityAttLns,
          organizationId,
          optional: true,
          customizeUnitCode: customizeUnitCodeList.join(','),
        };
        const params = await supplyManageDetailRemote.process(
          'SSLM_SUPPLY_ABILITY_MANAGE_DETAIL_SAVE_PARAMS',
          newParams,
          { remoteRef, setLoading }
        );
        if (params) {
          saveAll(params)
            .then(res => {
              if (getResponse(res)) {
                const { supplyAbilityId: id } = res;
                if (isCreat) {
                  history.push({
                    pathname: `/sslm/supplier-ablility-manage/detail/${id}`,
                    search: querystring.stringify({
                      type: 'edit',
                    }),
                  });
                } else {
                  refreshData();
                }
                notification.success();
                categoryMaterialDs.unSelectAll();
                categoryMaterialDs.clearCachedSelected();
                resolve(true);
              } else {
                resolve(false);
              }
            })
            .finally(() => {
              setLoading(false);
            });
        } else {
          resolve(false);
        }
      } else {
        resolve(false);
      }
    });
  }, []);

  // 提交回调
  const handleSubmit = useCallback(async () => {
    const hasCreatStatus = !isEmpty(categoryMaterialDs.selected.filter(i => !i.data.abilityLineId));
    if (hasCreatStatus) {
      notification.warning({
        message: intl
          .get('sslm.supplyAbility.view.message.notification.newDataWarning')
          .d('勾选行有未保存的数据，请保存后再进行操作！'),
      });
      return;
    }
    const basicsValidateFlag = await basicsDs.validate();
    const categoryValidateFlag = await categoryMaterialDs.validate();
    if (basicsValidateFlag && categoryValidateFlag) {
      const supplyAbilityLines = categoryMaterialDs.selected
        .filter(item => item && item.data.abilityLineId)
        .map(item => item.toJSONData()); // 获取变更数据;
      const basicsInfo = basicsDs.current?.toJSONData() || {};
      const params = {
        ...basicsInfo,
        supplyAbilityLines,
        organizationId,
        supplyAbilityId,
        customizeUnitCode: customizeUnitCodeList.join(','),
      };
      if (supplyManageDetailRemote && supplyManageDetailRemote.event) {
        // 默认返回true,当返回false时走二开逻辑不走标准逻辑
        const res = await supplyManageDetailRemote.event.fireEvent('cuxCategorySubmit', {
          params,
          categoryMaterialDs,
          setLoading,
          refreshAll,
        });
        if (!res) {
          return;
        }
      }
      setLoading(true);
      submitLines(params)
        .then(res => {
          const response = getResponse(res);
          if (response) {
            refreshAll();
            notification.success();
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  /**
   * 物料/品类行批量编辑保存
   */
  const handleSaveBatchLine = useCallback(async (lineData = {}) => {
    setLoading(true);
    const headerInfo = basicsDs.current.toData();
    const basicsValidateFlag = await basicsDs.validate();
    const { supplierNameLov, ...other } = headerInfo;
    if (basicsValidateFlag) {
      const headerData = {
        ...other,
        optional: true,
        customizeUnitCode: 'SSLM.SUPPLIER_ABLILITY_MANAGE.DETAIL.CATEGORY_MATERIALS',
      };
      const payload = {
        ...headerData,
        ...lineData,
      };
      saveBatchLine(payload)
        .then(res => {
          if (getResponse(res)) {
            refreshData();
            notification.success();
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // 拓展回调
  const handleExpand = useCallback(async categorySelectedRows => {
    const headerInfo = basicsDs.current.toData() || {};
    const dataSet = new DataSet(getExpanCompany(headerInfo));
    const columns = [
      {
        name: 'companyNum',
        width: 200,
      },
      {
        name: 'companyName',
      },
    ];
    const localList = categorySelectedRows.map(n => n.isLocal).filter(Boolean);
    if (isEmpty(localList)) {
      Modal.open({
        drawer: true,
        closable: true,
        key: Modal.key(),
        style: { width: 742 },
        okText: intl.get('sslm.supplyAbility.view.btn.expand').d('拓展'),
        title: intl.get('sslm.supplyAbility.view.title.expandMsg').d('物料品类拓展至其他公司'),
        children: <ExpandTable columns={columns} dataSet={dataSet} />,
        onOk: async () => {
          const companySelectedRows = dataSet.toJSONData();
          if (isEmpty(companySelectedRows)) {
            notification.warning({
              message: intl
                .get('sslm.supplyAbility.view.message.atLeastOne')
                .d('请至少勾选一行公司！'),
            });
            return false;
          } else {
            setLoading(true);
            /** 处理入参字段
             *  1、库存组织多选值集传参数，入参需要字符
             */
            const supplyAbilityExpandLines = categorySelectedRows.map(record => {
              const { inventoryOrganizationId, ...other } = record;
              const curInventoryOrganizationId = !isEmpty(inventoryOrganizationId)
                ? inventoryOrganizationId.map(n => n.organizationId).join(',')
                : null;
              return { ...other, inventoryOrganizationId: curInventoryOrganizationId };
            });
            const params = {
              ...headerInfo,
              companyIds: companySelectedRows.map(n => n.companyId),
              supplyAbilityExpandLines,
            };
            await expandCategory(params)
              .then(res => {
                if (getResponse(res)) {
                  notification.success();
                  if (res[0] && res[0].supplyAbilityExpandId) {
                    // 跳转拓展申请单页面
                    history.push({
                      pathname: `/sslm/supplier-ablility-manage/expand-detail/${res[0].supplyAbilityExpandId}`,
                      search: querystring.stringify({
                        type: 'edit',
                      }),
                    });
                  }
                }
              })
              .finally(() => {
                setLoading(false);
              });
          }
        },
      });
    } else {
      notification.warning({
        message: intl
          .get('sslm.supplyAbility.view.expand.checkError')
          .d('勾选行内存在未保存的供货能力，请保存后再进行拓展'),
      });
    }
  }, []);

  // 操作记录
  const handleOperatRecord = useCallback(() => {
    operationRecordsModal({
      documentType: 'SUPPLY_ABILITY_MANAGE',
      documentId: supplyAbilityId,
    });
  }, [supplyAbilityId]);

  const title = isCreat
    ? intl.get(`sslm.supplyAbility.view.message.title.createDetail`).d('新建供货能力清单')
    : isEdit
    ? intl.get(`sslm.supplyAbility.view.message.title.editDetail`).d('编辑供货能力清单')
    : intl.get(`sslm.supplyAbility.view.message.title.viewDetail`).d('查看供货能力清单');

  return (
    <Fragment>
      <Header title={title} backPath="/sslm/supplier-ablility-manage/list">
        {customizeBtnGroup(
          {
            code: 'SSLM.SUPPLIER_ABLILITY_MANAGE.DETAIL.HEADER_BTN',
          },
          [
            isEdit && (
              <PermissionButton
                icon="save"
                data-name="save"
                type="c7n-pro"
                color="primary"
                loading={loading}
                onClick={handleSave}
                wait={200}
                waitType="debounce"
                permissionList={[
                  {
                    code: 'srm.partner.suplier-ability.supply-ability-manage.button.detail.save',
                    type: 'button',
                    meaning: '保存',
                  },
                ]}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </PermissionButton>
            ),
            !isCreat && (
              <PermissionButton
                icon="find_in_page"
                funcType="flat"
                type="c7n-pro"
                data-name="supplierInfo"
                loading={loading}
                onClick={() => handleSupplierDetail(basicsDs.current.toData())}
                permissionList={[
                  {
                    code: 'srm.partner.suplier-ability.supply-ability-manage.button.detail.360Info',
                    type: 'button',
                    meaning: '查看供应商360信息',
                  },
                ]}
              >
                {intl.get('sslm.supplierReview.view.button.supplierInfo').d('查看供应商360信息')}
              </PermissionButton>
            ),
            !isCreat && (
              <Button
                data-name="operation"
                funcType="flat"
                type="c7n-pro"
                icon="operation_service_request"
                loading={loading}
                onClick={handleOperatRecord}
              >
                {intl.get(`sslm.supplyAbility.view.message.operationRecord`).d('操作记录')}
              </Button>
            ),
          ].filter(Boolean)
        )}
      </Header>
      <Content style={{ padding: 0, margin: 0, backgroundColor: 'rgba(0,0,0,0)' }}>
        <Spin spinning={spinning || loading}>
          <div className={styles['card-wrap']} style={{ marginBottom: 8 }}>
            <Content>
              <Card id="baseInfo" bordered={false}>
                <div className={styles['card-title']}>
                  {intl.get('sslm.supplyAbility.view.message.basicInfo').d('基础信息')}
                </div>
                <HeaderInfo
                  dataSet={basicsDs}
                  readOnlyFlag={readOnlyFlag}
                  customizeForm={customizeForm}
                  custLoading={custLoading}
                  customizeUnitCode="SSLM.SUPPLIER_ABLILITY_MANAGE.DETAIL.BASIC"
                  isCreat={isCreat}
                  isEdit={isEdit}
                />
              </Card>
            </Content>
            {supplyManageDetailRemote.process(
              'SSLM_SUPPLY_ABILITY_MANAGE_DETAIL_EXTRA_NODE',
              null,
              { isEdit, isCreat, basicsDs, remoteRef }
            )}
            <Content>
              <Card id="baseInfo" bordered={false}>
                <div className={styles['card-title']}>
                  {intl
                    .get('sslm.supplyAbility.view.message.categoryMaterialTable')
                    .d('推荐物料/品类')}
                </div>
                <CategoryMaterial
                  readOnlyFlag={readOnlyFlag}
                  supplyAbilityId={supplyAbilityId}
                  dataSet={categoryMaterialDs}
                  customizeTable={customizeTable}
                  remote={supplyManageDetailRemote}
                  customizeUnitCode="SSLM.SUPPLIER_ABLILITY_MANAGE.DETAIL.CATEGORY_MATERIALS"
                  customizeSearchCode="SSLM.SUPPLIER_ABLILITY_MANAGE.DETAIL.CATEGORYS_SEARCH_BAR"
                  customizeBtnGroupCode="SSLM.SUPPLIER_ABLILITY_MANAGE.DETAIL.CATEGORY_BTN"
                  isCompanyDimension={isCompanyDimension}
                  customizeForm={customizeForm}
                  customizeBtnGroup={customizeBtnGroup}
                  custLoading={custLoading}
                  isEdit={isEdit}
                  isCreat={isCreat}
                  isReviewFlag={isReviewFlag} // 是否需要评审
                  isGroupManageFlag={isGroupManageFlag} // 是否集团级管控
                  optional // optional：true｜只更新头状态 false｜更新所有字段
                  onExpand={handleExpand}
                  handleSaveBatchLine={handleSaveBatchLine}
                  handleSubmit={handleSubmit}
                  refreshData={refreshData}
                  refreshAll={refreshAll}
                  handleSave={handleSave}
                  showApproveProgress
                  detailRemote={supplyManageDetailRemote}
                />
              </Card>
            </Content>
            <Content>
              <Card id="baseInfo" bordered={false}>
                <div className={styles['card-title']}>
                  {intl.get('hzero.common.upload.modal.title').d('附件')}
                </div>
                <AttachmentInfo
                  dataSet={attachmentDs}
                  readOnlyFlag={readOnlyFlag}
                  customizeTable={customizeTable}
                  customizeUnitCode="SSLM.SUPPLIER_ABLILITY_MANAGE.DETAIL.ATTACHMENT"
                  custLoading={custLoading}
                  isEdit={isEdit}
                  deleteAttachmentData={deleteAttachmentData}
                  setLoading={setLoading}
                />
              </Card>
            </Content>
          </div>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.supplyAbility', 'sslm.common', 'sslm.supplierReview', 'sslm.supplierDetail'],
  }),
  remote(
    {
      code: 'SSLM_SUPPLY_ABILITY_MANAGE_DETAIL', // 对应二开模块暴露的Expose的编码
      name: 'supplyManageDetailRemote', // 默认 'remote'， 如有属性冲突可以改此属性
    },
    {
      events: {
        cuxCategoryDelete: () => {}, // 推荐物料/品类删除二开
        cuxCategorySubmit: () => {}, // 推荐物料/品类提交评审二开
        cuxInit: () => {}, // 二开增加初始化
      },
    }
  ),
  WithCustomize({
    unitCode: [
      'SSLM.SUPPLIER_ABLILITY_MANAGE.DETAIL.BASIC', // 供货能力清单基础信息
      'SSLM.SUPPLIER_ABLILITY_MANAGE.DETAIL.CATEGORY_MATERIALS', // 供货能力清单推荐物料/品类信息
      'SSLM.SUPPLIER_ABLILITY_MANAGE.DETAIL.CATEGORYS_SEARCH_BAR', // 供货能力清单推荐物料/品类-筛选器
      'SSLM.SUPPLIER_ABLILITY_MANAGE.DETAIL.CATEGORY_BTN', // 供货能力清单推荐物料/品类-按钮组
      'SSLM.SUPPLIER_ABLILITY_MANAGE.DETAIL.ATTACHMENT', // 供货能力清单附件信息
      'SSLM.SUPPLIER_ABLILITY_MANAGE.DETAIL.HEADER_BTN', // 头按钮组
      'SSLM.SUPPLIER_ABLILITY_MANAGE.DETAIL.CATEGORY_MATERIALS_BATCH_EDIT_FORM', // 批量编辑表单
    ],
  })
)(Detail);
