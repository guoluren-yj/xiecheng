import React, { useEffect, useState, useCallback } from 'react';
import { Form, Spin } from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';
import { observer } from 'mobx-react-lite';
import { isEmpty, isArray } from 'lodash';
import intl from 'utils/intl';
import FormField from '@/routes/components/FormField';
import { checkClassify } from '@/services/commonService';

const InvitationInfo = observer(
  ({
    type = '',
    dataSet,
    isEdit,
    remote,
    otherInfoDs,
    pubEditFlag,
    customizeForm,
    custLoading,
    purchaseSelectedRows,
    companyBaseInfo: { companyName, companyId } = {},
    filterCompanyLovFlag = false,
    customizeUnitCode,
  }) => {
    const currentRecord = dataSet?.current;
    const isShow = +currentRecord?.get('autoPartnerFlag') !== 1;
    const isInvitation = +currentRecord?.get('investigateFlag') !== 1;
    const isSupplierFlag = currentRecord?.get('investigateWrite') === 'SUPPLIER';
    const [proxyDsCreate, setProxyDsCreate] = useState({});

    // 供应商分类，确认前的回调
    const handleCategoryBeforeSelect = useCallback(records => {
      if (!isEmpty(records)) {
        const supplierCategoryIdList = [];
        if (isArray(records)) {
          records.forEach(item => {
            const supplierCategoryId = item.get('categoryId');
            supplierCategoryIdList.push(supplierCategoryId);
          });
        } else {
          const supplierCategoryId = records.get('categoryId');
          supplierCategoryIdList.push(supplierCategoryId);
        }
        return checkClassify({ supplierCategoryIdList }).then(response => {
          const res = getResponse(response);
          if (res) {
            return true;
          } else {
            return false;
          }
        });
      }
    }, []);

    // 准入品类变更触发
    const handleItemCategoryChange = value => {
      if (value && value.length > 0) {
        const newPurchaseAgentIds = [];
        value.forEach(({ purchaseAgentIds, purchaseAgentName, purchaseAgentCode }) => {
          if (purchaseAgentIds) {
            newPurchaseAgentIds.push({
              purchaseAgentId: purchaseAgentIds,
              purchaseAgentName,
              purchaseAgentCode,
            });
          }
        });
        // 有主采购员，带出主采购员
        if (!isEmpty(newPurchaseAgentIds)) {
          dataSet.current.set('purchaseAgentIds', newPurchaseAgentIds);
        } else {
          // 品类有值，并且没有主采购员，带出默认采购员
          dataSet.current.set('purchaseAgentIds', purchaseSelectedRows);
        }
      } else {
        // 清空品类，带出默认采购员
        dataSet.current.set('purchaseAgentIds', purchaseSelectedRows);
      }
    };

    useEffect(() => {
      // 工作流-信息补录不处理
      if (type !== 'APPROVAL_SUPPLEMENT') {
        dataSet
          .query()
          .then(res => {
            const result = getResponse(res);
            if (!isEmpty(result)) {
              setProxyDsCreate({
                createNow: true,
                createData: {
                  supplierCompanyName: companyName,
                  ...result,
                },
              });
            } else {
              setProxyDsCreate({
                createNow: true,
                createData: {
                  supplierCompanyName: companyName,
                },
              });
            }
          })
          .finally(() => {
            // 设置ds额外参数
            if (filterCompanyLovFlag) {
              dataSet.setState('partnerCompanyId', companyId);
            }
          });
      }
    }, [dataSet, type]);

    useEffect(() => {
      // 编辑页面带出采购员
      if (!isEmpty(purchaseSelectedRows) && isEdit) {
        if (isEmpty(currentRecord?.get('purchaseAgentIds'))) {
          // eslint-disable-next-line no-unused-expressions
          currentRecord?.set('purchaseAgentIds', purchaseSelectedRows);
        }
      }
    }, [purchaseSelectedRows, currentRecord, isEdit]);

    useEffect(() => {
      if (remote && remote.event) {
        remote.event.fireEvent('cuxHandleInvitInit', {
          dataSet,
          otherInfoDs,
        });
      }
    }, [dataSet.current]);

    const categoryTableProps = {
      treeAsync: true,
      onRow: ({ record }) => {
        const nodeProps = {};
        if (record.get('hasChild') === '0') {
          nodeProps.isLeaf = true;
        }
        return nodeProps;
      },
    };
    const remoteCategoryTableProps = remote
      ? remote.process(
          'SSLM_SUPPLIER_ENTRY_DETAIL_INVITATION_INFO_CATEGORY_TABLE_PROPS',
          categoryTableProps,
          { dataSet }
        )
      : categoryTableProps;

    const fields = [
      {
        name: 'supplierCompanyName',
      },
      {
        name: 'levelTypeFlag',
        hidden: isShow,
        componentType: 'SELECT',
      },
      {
        name: 'companyObj',
        componentType: 'LOV',
      },
      {
        name: 'stageId',
        hidden: isShow,
        componentType: 'SELECT',
      },
      {
        name: 'investigateFlag',
        hidden: isShow,
        componentType: 'SELECT',
        disabled: type === 'APPROVAL_SUPPLEMENT',
        onChange: value => {
          if (+value === 0) {
            dataSet.current.set({
              investigateType: null,
              investigateTemplateObj: null,
              investigateRemark: null,
              investigateWrite: null,
            });
          }
        },
      },
      {
        name: 'investigateWrite',
        hidden: isShow || isInvitation,
        componentType: 'SELECT',
        disabled: type === 'APPROVAL_SUPPLEMENT',
      },
      {
        name: 'mergerInvestigateFlag',
        help: intl
          .get('sslm.supplierEntryDetail.model.invitationInfo.mergeSurveyFormsInfo')
          .d(
            '选择是，如果您维护了多个邀约合作公司，供应商只需填写一份调查表，信息会自动共享至选择的多个邀约合作公司。否则，供应商需要针对每个公司分别填写调查表'
          ),
        showHelp: 'tooltip',
        hidden: !isSupplierFlag,
        componentType: 'SELECT',
        disabled: type === 'APPROVAL_SUPPLEMENT',
      },
      {
        name: 'investigateType',
        hidden: isShow || isInvitation,
        componentType: 'SELECT',
        disabled: type === 'APPROVAL_SUPPLEMENT',
      },
      {
        name: 'investigateTemplateObj',
        hidden: isShow || isInvitation,
        componentType: 'LOV',
        disabled: type === 'APPROVAL_SUPPLEMENT',
      },
      {
        name: 'categoryIds',
        hidden: isShow,
        componentType: 'LOV',
        searchFieldInPopup: true,
        onOption: ({ record: optionRecord }) => {
          return {
            disabled: !optionRecord.get('checkFlag'),
          };
        },
        tableProps: {
          selectionMode: 'rowbox',
          treeAsync: true,
          alwaysShowRowBox: true,
          onRow: ({ record }) => {
            const nodeProps = { disabled: false };
            if (+record.get('hasChild') === 0) {
              nodeProps.isLeaf = true;
            }
            return nodeProps;
          },
        },
        onBeforeSelect: handleCategoryBeforeSelect,
      },
      {
        name: 'itemCategoryIds',
        hidden: isShow,
        componentType: 'LOV',
        searchFieldInPopup: true,
        onOption: ({ record: optionRecord }) => {
          return {
            disabled: optionRecord.get('checkFlag') === false,
          };
        },
        tableProps: remoteCategoryTableProps,
        onChange: handleItemCategoryChange,
      },
      {
        name: 'purchaseAgentIds',
        hidden: isShow,
        componentType: 'LOV',
      },
      {
        name: 'investigateRemark',
        colSpan: 2,
        newLine: true,
        hidden: isShow || isInvitation,
        resize: 'both',
        componentType: 'TEXTAREA',
      },
      {
        name: 'remark',
        colSpan: 2,
        resize: 'both',
        newLine: true,
        componentType: 'TEXTAREA',
      },
    ];

    return (
      <Spin dataSet={dataSet}>
        {customizeForm(
          {
            code: customizeUnitCode,
            enableCreate: false,
            labelLayout: isEdit ? 'float' : 'vertical',
            readOnly: !(isEdit || pubEditFlag),
            enableReLoad: false,
            __force_record_to_update__: true,
            proxyDsCreate,
          },
          <Form
            columns={3}
            dataSet={dataSet}
            custLoading={custLoading}
            labelLayout={isEdit ? 'float' : 'vertical'}
            className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
            useWidthPercent={!['history', 'APPROVAL_SUPPLEMENT'].includes(type)}
          >
            {fields.map(field => (
              <FormField isEdit={isEdit} {...field} />
            ))}
          </Form>
        )}
      </Spin>
    );
  }
);
export default InvitationInfo;
