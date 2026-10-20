/* eslint-disable eqeqeq */
/* eslint-disable no-param-reassign */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import FilterBar from 'srm-front-boot/lib/components/FilterBarTable/FilterBar';
import { Table, Button, Modal, DataSet } from 'choerodon-ui/pro';
import notification from 'utils/notification';
import {
  fetchEnabled,
  fetchDisabled,
  fetFieldsList,
  fetchSaveRule,
  fetchVisibleRoleList,
  fetchCategoryDetail,
  // fetProcessDetail,
} from '@/services/checkRuleService';

import { RuleFormDS, VisibleRoleListDS } from '../stores/checkRuleDS';
// import RuleForm from './RuleForm';
import HighlightRuleForm from './HighlightRuleForm';

import styles from './index.less';

const { Column } = Table;

let alertFieldsList = [];

export default observer(function RuleTableComp({
  rulesListDS,
  categoryId,
  categoryCode,
  documentCode,
  // documentId,
}) {
  const ruleFormDS = useMemo(() => new DataSet({ ...RuleFormDS(), forceValidate: true }), []);
  const visibleRoleListDS = useMemo(() => new DataSet(VisibleRoleListDS()), []);
  const highlightRuleFormRef = useRef(null); // 添加 ref 用于访问 HighlightRuleForm 的方法

  const [roleList, setRoleList] = useState([]);
  // const [showSelectedFlag, setShowSelectedFlag] = useState(false);

  useEffect(() => {
    // fetProcessDetail({
    //   documentId,
    // }).then(res => {
    //   if (getResponse(res)) {
    //     console.log(' 111 === : ', res);
    //   }
    // });
    fetchVisibleRoleList().then((res) => {
      if (getResponse(res)) {
        const dataList = res?.content ?? [];
        setRoleList([...dataList]);
      }
    });
    return () => {
      alertFieldsList = [];
    };
  }, []);

  useEffect(() => {
    if (documentCode) {
      handleInitFialds(documentCode);
    }
  }, [documentCode]);

  /**
   * 去除文本中的 fieldPrefix 部分
   * @param {string} text - 原始文本
   * @returns {string} 处理后的文本
   */
  const removeFieldPrefix = (text) => {
    // 不再移除 prefix，以保留 fieldPrefix_fieldCode 供高亮匹配使用，避免同名字段歧义
    return text;
  };

  const formatQueryList = (list, alertFields) => {
    if (list && list.length && alertFields && alertFields.length) {
      // 处理规则数据，去除 ruleScope 和 ruleDetail 中的 fieldPrefix
      rulesListDS.forEach((record, index) => {
        const item = list[index];
        if (item) {
          // 处理 ruleScope
          if (item.ruleScope) {
            const processedRuleScope = removeFieldPrefix(item.ruleScope);
            record.set('ruleScope', processedRuleScope);
          }

          // 处理 ruleDetail
          if (item.ruleDetail) {
            const processedRuleDetail = removeFieldPrefix(item.ruleDetail);
            record.set('ruleDetail', processedRuleDetail);
          }
        }

        record.status = 'sync';
      });
    }
  };

  const handleInitFialds = async (docCode) => {
    const res = await fetFieldsList({
      documentCode: docCode,
    });

    if (getResponse(res)) {
      const fields = res?.content ?? [];

      const formatFields = fields.map((item) => ({
        ...item,
        label: item?.fieldCode,
        value: item?.fieldName,
      }));

      alertFieldsList = [...formatFields];
      if (rulesListDS?.length) {
        const list = rulesListDS?.toData();
        formatQueryList(list, formatFields);
      }
    }
  };

  /**
   * 获取处理后的规则内容（将高亮变量替换为 fieldCode）
   * @returns {Object} 包含规则详情和规则范围的处理后内容
   */
  const getProcessedRuleContent = () => {
    if (!highlightRuleFormRef.current) {
      return {
        ruleDetail: '',
        ruleScope: '',
      };
    }

    return {
      ruleDetail: highlightRuleFormRef.current.getRuleDetailWithFieldCodes(),
      ruleScope: highlightRuleFormRef.current.getRuleScopeWithFieldCodes(),
    };
  };

  /**
   * 根据文本的字段编码，替换为字段名称
   * @param {*} text 文本
   * @returns
   */
  const getNameDetailByCode = (text) => {
    if (!text || !alertFieldsList || alertFieldsList.length === 0) {
      return text;
    }

    let result = text;

    // 遍历字段列表，优先替换带有 prefix 的完整字段编码，然后替换纯字段编码
    const sortedVariables = [...alertFieldsList].sort((a, b) => {
      const aFull =
        a.fieldPrefix && a.fieldCode ? `${a.fieldPrefix}_${a.fieldCode}` : a.fieldCode || '';
      const bFull =
        b.fieldPrefix && b.fieldCode ? `${b.fieldPrefix}_${b.fieldCode}` : b.fieldCode || '';
      return bFull.length - aFull.length;
    });

    sortedVariables.forEach((field) => {
      const { fieldName, fieldCode, fieldPrefix } = field;
      if (fieldName && fieldCode) {
        if (fieldPrefix) {
          const fullCode = `${fieldPrefix}_${fieldCode}`;
          const regexFull = new RegExp(fullCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
          result = result.replace(regexFull, fieldName);
        }
        // 使用全局替换，将所有匹配的字段编码替换为字段名称
        const regex = new RegExp(fieldCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        result = result.replace(regex, fieldName);
      }
    });

    return result;
  };

  const handleCreateRule = async (item) => {
    let modal = null;

    if (item) {
      const obj = item?.toData() ?? {};

      const tenantList = [];
      const { roleId } = obj || {};
      const idList = roleId?.split(',')?.map((rcd) => Number(rcd)) ?? [];

      if (roleList?.length && idList?.length) {
        roleList.forEach((rcd) => {
          if (idList.includes(Number(rcd.id))) {
            tenantList.push({
              roleId: Number(rcd.id),
              roleCode: rcd.roleCode,
              roleName: rcd.roleName,
            });
          }
        });
      }

      // 编辑规则时，需要将字段编码替换为字段名称
      const ruleDetailStr = getNameDetailByCode(obj?.ruleDetail);
      const ruleScopeStr = getNameDetailByCode(obj?.ruleScope);

      ruleFormDS.loadData([{ ...obj, ruleDetailStr, ruleScopeStr }]);
      visibleRoleListDS.loadData(tenantList ?? []);
    } else {
      // 查询详情 获取 roleId
      const detailRes = await fetchCategoryDetail({
        categoryId,
      });
      let roleId = '';
      if (getResponse(detailRes)) {
        roleId = detailRes?.roleId ?? '';
      }

      const idList = roleId?.split(',')?.map((rcd) => Number(rcd)) ?? [];
      const tenantList = [];

      if (roleList?.length && idList?.length) {
        roleList.forEach((rcd) => {
          if (idList.includes(Number(rcd.id))) {
            tenantList.push({
              roleId: Number(rcd.id),
              roleCode: rcd.roleCode,
              roleName: rcd.roleName,
            });
          }
        });
      }

      ruleFormDS.loadData([]);
      ruleFormDS.create(
        {
          tenantId: getCurrentOrganizationId(),
          categoryId,
          categoryCode,
          documentCode,
          referFileFlag: 1,
        },
        0
      );
      visibleRoleListDS.loadData(tenantList ?? []);
    }

    const handleCloseModal = () => {
      if (modal) {
        ruleFormDS.loadData([]);
        ruleFormDS.reset();
        visibleRoleListDS.loadData([]);
        visibleRoleListDS.reset();
        modal.close();
      }
    };

    const handleCreate = async () => {
      const isValid = await ruleFormDS.validate();
      const isRowValid = await visibleRoleListDS.validate();

      if (isValid && isRowValid) {
        const categoryCodeStr = ruleFormDS?.current?.get('categoryCode') ?? '';
        if (!categoryCodeStr) {
          return;
        }

        const { ruleDetail, ruleScope } = getProcessedRuleContent();

        if (!ruleScope) {
          notification.error({
            message: intl
              .get('smbl.checkRules.view.title.ruleScopeNotNull')
              .d('规则适用范围不能为空'),
          });
          return;
        }
        if (ruleFormDS?.current) {
          ruleFormDS.current.set('ruleDetail', ruleDetail);
          ruleFormDS.current.set('ruleScope', ruleScope);
        }

        const formData = ruleFormDS?.current?.toData() ?? {};
        const tenantList = visibleRoleListDS?.toData() ?? [];

        const roleId = tenantList.map((rcd) => rcd.roleId).join(',');

        // 如果高亮范围列表为空，将 formData.referFileFlag 设为null
        const highlightRanges = highlightRuleFormRef.current?.getHighlightRanges?.() || [];
        if (highlightRanges.length > 0) {
          formData.referFileFlag = null;
        }

        const res = await fetchSaveRule({ ...formData, roleId });
        if (getResponse(res)) {
          handleCloseModal();
          rulesListDS.query();
        }
      }
    };

    modal = Modal.open({
      title: item
        ? intl.get('smbl.checkRules.view.title.editRule').d('编辑规则')
        : intl.get('smbl.checkRules.view.title.createRule').d('新建规则'),
      children: (
        <HighlightRuleForm
          ref={highlightRuleFormRef}
          dataSet={ruleFormDS}
          visibleRoleListDS={visibleRoleListDS}
          processVariables={alertFieldsList}
        />
      ),
      closable: true,
      drawer: true,
      mask: true,
      fullScreen: true,
      style: { width: '800px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleCreate}>
            {intl.get(`hzero.common.button.ok`).d('确定')}
          </Button>
          <Button onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>
        </div>
      ),
    });
  };

  const buttons = () => {
    return [
      <Button key="add" icon="playlist_add" funcType="flat" onClick={() => handleCreateRule('')}>
        {intl.get('hzero.common.button.create').d('新增')}
      </Button>,
      <Button
        key="batchEnabled"
        icon="check_circle_outline-o"
        funcType="flat"
        disabled={
          !(
            rulesListDS.selected.length &&
            rulesListDS.selected.filter((record) => record.get('enableFlag') == 0).length ===
              rulesListDS.selected.length
          )
        }
        onClick={() => handlleBatchEnabled('1')}
      >
        {intl.get('smbl.checkRules.button.batchEnabled').d('批量启用')}
      </Button>,
      <Button
        key="batchDisabled"
        icon="not_interested"
        funcType="flat"
        disabled={
          !(
            rulesListDS.selected.length &&
            rulesListDS.selected.filter((record) => record.get('enableFlag') == 1).length ===
              rulesListDS.selected.length
          )
        }
        onClick={() => handlleBatchEnabled('0')}
      >
        {intl.get('smbl.checkRules.button.batchDisabled').d('批量禁用')}
      </Button>,
    ];
  };

  /**
   * 批量启用/禁用规则
   */
  const handlleBatchEnabled = (flag) => {
    const selectedList = rulesListDS.selected.map((record) => record.toData());

    if (selectedList?.length === 0) {
      notification.error({
        message: intl.get('smbl.checkRules.view.title.selectRule').d('请选择规则'),
      });
      return;
    }

    if (flag === '1') {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: (
          <div>
            {intl
              .get('smbl.checkRules.view.title.confirmBatchEnabled')
              .d('确认批量启用选中规则吗？')}
          </div>
        ),
      }).then((button) => {
        if (button === 'ok') {
          const filterList = selectedList.filter((record) => record.enableFlag == 0);
          fetchEnabled(filterList).then((res) => {
            if (getResponse(res)) {
              rulesListDS.query();
            }
          });
        }
      });
    } else {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: (
          <div>
            {intl
              .get('smbl.checkRules.view.title.confirmBatchDisabled')
              .d('确认批量禁用选中规则吗？')}
          </div>
        ),
      }).then((button) => {
        if (button === 'ok') {
          const filterList = selectedList.filter((record) => record.enableFlag == 1);
          fetchDisabled(filterList).then((res) => {
            if (getResponse(res)) {
              rulesListDS.query();
            }
          });
        }
      });
    }
  };

  const handlleEnabled = (record, flag) => {
    const obj = record?.toData() ?? {};
    if (!obj.ruleId) return;
    if (flag === '1') {
      // 启用
      fetchEnabled([{ ...obj }]).then((res) => {
        if (getResponse(res)) {
          rulesListDS.query();
        }
      });
    } else {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: (
          <div>
            {intl.get('smbl.checkRules.view.title.confirmBatchDisabled').d('确认禁用选中规则吗？')}
          </div>
        ),
      }).then((button) => {
        if (button === 'ok') {
          fetchDisabled([{ ...obj }]).then((res) => {
            if (getResponse(res)) {
              rulesListDS.query();
            }
          });
        }
      });
    }
  };

  const renderText = (text) => {
    if (!text) {
      return '-';
    }

    // 创建高亮处理函数，只高亮匹配到的 fieldPrefix_fieldCode
    const createHighlightedText = (content, variables) => {
      if (!content || !variables || variables.length === 0) {
        return content;
      }

      // 转义HTML特殊字符并去除换行符
      let highlightedText = content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, ' ') // 将换行符替换为空格
        .replace(/\r/g, ' ') // 将回车符替换为空格
        .replace(/\s+/g, ' ') // 将多个连续空格替换为单个空格
        .trim(); // 去除首尾空格

      // 创建 fieldPrefix_fieldCode 到 fieldName 的映射
      const fieldCodeToNameMap = {};
      const sortedVariables = [...variables]
        .filter((v) => v.fieldPrefix && v.fieldCode)
        .sort((a, b) => {
          const aFull = `${a.fieldPrefix}_${a.fieldCode}`;
          const bFull = `${b.fieldPrefix}_${b.fieldCode}`;
          return bFull.length - aFull.length;
        });

      sortedVariables.forEach((v) => {
        const fullCode = `${v.fieldPrefix}_${v.fieldCode}`;
        if (v.fieldName) {
          fieldCodeToNameMap[fullCode] = v.fieldName;
        }
      });

      // 创建变量正则表达式，仅匹配 fieldPrefix_fieldCode
      const variablePatterns = sortedVariables
        .map((v) => `${v.fieldPrefix}_${v.fieldCode}`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .filter((pattern) => pattern); // 过滤掉空的模式

      if (variablePatterns.length > 0) {
        const pattern = `(${variablePatterns.join('|')})`;
        const variableRegex = new RegExp(pattern, 'g');

        // 应用高亮样式，将匹配到的 fieldPrefix_fieldCode 替换为 fieldName
        highlightedText = highlightedText.replace(variableRegex, (match) => {
          const fieldName = fieldCodeToNameMap[match] || match;
          return `<span style="color: #1890ff; font-weight: 600;">${fieldName}</span>`;
        });
      }

      return highlightedText;
    };

    const highlightedContent = createHighlightedText(text, alertFieldsList);

    return (
      <>
        <div
          dangerouslySetInnerHTML={{ __html: highlightedContent }}
          style={{
            display: 'flex',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '150px',
            height: '28px',
          }}
        />
      </>
    );
  };

  const handleFilterQueryAll = ({ dataSet, params }) => {
    const list = dataSet?.toData() ?? [];
    const param = { ...list[0] };

    const obj = { ...param, ...params, documentCode, categoryCode };

    if (!obj?.documentCode) {
      return false;
    }

    rulesListDS.queryParameter = {
      ...obj,
      sort: obj?.sort ? obj?.sort?.split(':').join(',') : '',
    };
    rulesListDS.query();
  };

  return (
    <>
      <FilterBar
        dataSet={[rulesListDS]}
        cacheState
        cacheKey="SMBL.CHECK_RULES_LIST_CACHE"
        checkDataSetStatus={false}
        defaultSortedField="creationDate"
        defaultSortedOrder="desc"
        collpaseble
        defaultCollpase
        tableButtons={buttons()}
        sortFieldName="sort"
        onQuery={handleFilterQueryAll}
        fields={[
          {
            name: 'keyword',
            type: 'string',
            label: intl.get(`smbl.checkRules.model.ruleNameOrCode`).d('规则名称或编码'),
            merge: true,
            display: false,
          },
          {
            name: 'ruleControlStrategy',
            type: 'string',
            label: intl.get(`smbl.checkRules.model.ruleIntensity`).d('规则强度'),
            lock: true,
            lookupCode: 'SMBL.CHECK_RULES_STRATEGY',
          },
          {
            name: 'ruleTarget',
            type: 'string',
            label: intl.get(`smbl.checkRules.model.ruleTarget`).d('规则目标'),
            lock: true,
            lookupCode: 'SMBL.CHECK_RULES_TARGET',
          },
          {
            name: 'enableFlag',
            type: 'string',
            label: intl.get(`smbl.checkRules.model.status`).d('状态'),
            lock: true,
            lookupCode: 'HPFM.ENABLED_FLAG',
          },
          {
            name: 'ruleCode',
            type: 'string',
            label: intl.get(`smbl.checkRules.model.ruleCode`).d('规则编码'),
            sortFlag: true,
          },
          {
            name: 'ruleName',
            type: 'string',
            label: intl.get(`smbl.checkRules.model.ruleName`).d('规则名称'),
            sortFlag: true,
          },
          {
            name: 'creationDate',
            type: 'dateTime',
            label: intl.get(`smbl.checkRules.model.createTime`).d('创建时间'),
            sortFlag: true,
          },
        ]}
      />
      <div className={styles['rule-table-container']} style={{ height: 'calc(100vh - 288px)' }}>
        <Table
          dataSet={rulesListDS}
          queryBar="none"
          border={false}
          autoHeight={{ type: 'maxHeight', diff: 40 }}
          // buttons={buttons()}
        >
          <Column
            name="enableFlag"
            renderer={({ record }) =>
              record.get('enableFlag') === '1' ? (
                <span className={styles['enable-flag']} style={{ color: 'green' }}>
                  {intl.get('hzero.common.button.enable').d('启用')}
                </span>
              ) : (
                <span className={styles['disable-flag']} style={{ color: 'red' }}>
                  {intl.get('hzero.common.button.disable').d('禁用')}
                </span>
              )
            }
          />
          <Column name="ruleCode" />
          <Column name="ruleName" width={200} />
          <Column name="ruleControlStrategy" width={200} />
          <Column name="ruleTarget" width={200} />
          <Column
            name="ruleScope"
            width={200}
            tooltip="overflow"
            renderer={({ text }) => renderText(text)}
          />
          <Column
            name="ruleDetail"
            width={200}
            tooltip="overflow"
            renderer={({ text }) => renderText(text)}
          />
          <Column
            name="operation"
            header={intl.get('hzero.common.title.operator').d('操作')}
            renderer={({ record }) => {
              const enableFlag = record?.get('enableFlag') ?? '';
              return (
                <>
                  <a style={{ marginRight: '8px' }} onClick={() => handleCreateRule(record)}>
                    {intl.get('hzero.common.button.edit').d('编辑')}
                  </a>
                  {enableFlag === '0' ? (
                    <a onClick={() => handlleEnabled(record, '1')}>
                      {intl.get('hzero.common.button.enable').d('启用')}
                    </a>
                  ) : (
                    <a onClick={() => handlleEnabled(record, '0')}>
                      {intl.get('hzero.common.button.disable').d('禁用')}
                    </a>
                  )}
                </>
              );
            }}
          />
        </Table>
      </div>
    </>
  );
});
