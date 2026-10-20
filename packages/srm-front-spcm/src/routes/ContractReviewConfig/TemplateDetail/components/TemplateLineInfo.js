/*
 * ReviewTemplateLine - 基础信息
 * @Date: 2025-03-10 10:19:06
 * @Author: CDJ
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useCallback } from 'react';
import { isEmpty } from 'lodash';

import { Table, Modal, DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { getResponse } from 'utils/utils';

import { dsDeleteData } from '@/utils/util';
import { saveReviewTemplateLineInfo } from '@/services/contractReviewConfigService';

import ReviewRuleForm from './ReviewRuleForm';
import ReferenceReviewPoint from './ReferenceReviewPoint';
import { getReviewRuleDs } from '../stores/getReviewRuleDS';
import { getReferencePointDs } from '../stores/getReferencePointDS';
import { getReviewPointModalTitle } from '../../utils';
import { getUnitCodes } from '../utils/utils';

const TemplateLine = ({
  dataSet,
  isEdit = false,
  customizeTable,
  customizeForm,
  tableCode = '',
  reviewTemplateId,
}) => {
  const getButtons = useCallback(() => {
    return isEdit
      ? [
          [
            'add',
            {
              onClick: () => {
                createReviewRule();
              },
            },
          ],
          [
            'delete',
            {
              onClick: () => dsDeleteData({ dataSet }),
            },
          ],
        ]
      : [];
  }, [isEdit, dataSet, reviewTemplateId]);

  // 新建审查规则
  const createReviewRule = () => {
    const referencePointDs = new DataSet(getReferencePointDs());
    Modal.open({
      title: intl.get('spcm.contractReview.view.title.addReviewPoint').d('添加审查点'),
      drawer: true,
      destroyOnClose: true,
      children: <ReferenceReviewPoint dataSet={referencePointDs} customizeTable={customizeTable} />,
      style: {
        width: 1090,
      },
      onOk: async () => {
        const validateFlag = await referencePointDs.validate();
        if (validateFlag) {
          const selectedData = referencePointDs.toJSONData();
          if (!isEmpty(selectedData)) {
            const payload = {
              data: selectedData.map((i) => ({ ...i, reviewTemplateId })),
              customizeUnitCode: getUnitCodes.lineCode,
            };
            // 保存数据
            const res = await saveReviewTemplateLineInfo(payload);
            if (getResponse(res)) {
              dataSet.query();
              return true;
            }
            return false;
          }
          return true;
        } else {
          return false;
        }
      },
    });
  };

  // 审查规则行弹窗
  const openReviewRuleModal = (record) => {
    const pointModalDs = new DataSet(getReviewRuleDs());
    const currentData = (record && record.toData()) || {};
    pointModalDs.create({
      ...currentData,
    });
    Modal.open({
      title: getReviewPointModalTitle(),
      drawer: true,
      destroyOnClose: true,
      children: (
        <ReviewRuleForm
          dataSet={pointModalDs}
          isEdit={isEdit}
          customizeForm={customizeForm}
          formCode={getUnitCodes.lineModalCode}
        />
      ),
      style: {
        width: 380,
      },
      onOk: async () => {
        const validateFlag = await pointModalDs.validate();
        if (validateFlag) {
          const formData = pointModalDs.current?.toData() || {};
          // 保存
          const payload = {
            data: [
              {
                ...formData,
                reviewTemplateId,
              },
            ],
            customizeUnitCode: getUnitCodes.lineModalCode,
          };
          // 保存数据
          const res = await saveReviewTemplateLineInfo(payload);
          if (getResponse(res)) {
            dataSet.query();
            return true;
          }
          return false;
        } else {
          return false;
        }
      },
    });
  };

  const columns = [
    {
      name: 'reviewCode',
      width: 180,
    },
    {
      name: 'reviewPointId',
      width: 180,
    },
    {
      name: 'routeName',
      width: 180,
    },
    {
      name: 'routeUrl',
      width: 180,
    },
    {
      name: 'riskType',
    },
    {
      name: 'riskLevel',
    },
    {
      name: 'validationType',
    },
    {
      name: 'ignoreReasonFlag',
      width: 140,
      renderer: ({ value }) => {
        return yesOrNoRender(value || 0);
      },
    },
    {
      name: 'riskDescription',
      width: 180,
    },
    {
      name: 'resolution',
      width: 180,
    },
    {
      name: 'ruleDescription',
      width: 180,
    },
    {
      name: 'ruleSource',
    },
    // {
    //   name: 'copyReviewCode',
    // },
    {
      name: 'customCopyFlag',
      width: 140,
    },
    {
      name: 'reviewType',
      width: 160,
    },
    {
      name: 'action',
      width: 120,
      hidden: !isEdit,
      renderer: ({ record }) => {
        return (
          <a onClick={() => openReviewRuleModal(record)}>
            {intl.get('hzero.common.view.title.edit').d('编辑')}
          </a>
        );
      },
    },
  ].filter((i) => !i.hidden);

  return (
    <div className="card-content-wrap">
      <div className="card-content">
        <div className="card-content-title">
          {intl.get('spcm.contractReview.view.title.reviewRule').d('审查规则')}
        </div>
        {customizeTable(
          {
            code: tableCode,
            readOnly: !isEdit,
          },
          <Table
            dataSet={dataSet}
            columns={columns}
            buttons={getButtons()}
            style={{ maxHeight: 518 }}
            selectionMode={isEdit ? 'rowbox' : 'none'}
          />
        )}
      </div>
    </div>
  );
};

export default TemplateLine;
