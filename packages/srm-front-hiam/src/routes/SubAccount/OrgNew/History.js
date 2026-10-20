/*
 * @Descripttion: 比价单
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2022-03-02 17:44:51
 */

import React from 'react';
import intl from 'utils/intl';
import { Table, DataSet } from 'choerodon-ui/pro';
import { HZERO_IAM } from 'utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import formatterCollections from 'utils/intl/formatterCollections';

const commonPrompt = 'sprm.common.model.common';
const History = function History({ userId, actionType }) {
    const historyDs = new DataSet({
        page: 20,
        autoQuery: true,
        selection: false,
        fields: [
            {
                label: intl.get('entity.roles.operator').d('操作人'),
                name: 'processUserName',
            },
            {
                label: intl.get(`${commonPrompt}.handleDate`).d('操作时间'),
                name: 'processTime',
                type: 'dateTime',
            },
            {
                label: intl.get(`${commonPrompt}.motion`).d('动作'),
                name: 'processTypeMeaning',
            },
            {
                label: intl.get(`${commonPrompt}.dimensionName`).d('维度'),
                name: 'dimensionName',
            },
            {
                label: intl.get(`${commonPrompt}.changeField`).d('修改内容'),
                name: 'changeFieldMeaning',
            },
            {
                label: intl.get(`${commonPrompt}.changeField`).d('修改内容'),
                name: 'dataName',
            },
            {
                label: intl.get(`${commonPrompt}.beforeModify`).d('修改前'),
                name: 'oldValue',
            },
            {
                label: intl.get(`${commonPrompt}.afterModify`).d('修改后'),
                name: 'newValue',
            },
        ],
        transport: {
            read: () => {
                const actionTypeUrl = {
                    authority: `${HZERO_IAM}/v1/${getCurrentOrganizationId()}/users/${userId}/authority/action`,
                    user: `${HZERO_IAM}/hzero/v1/${getCurrentOrganizationId()}/users/${userId}/action`,
                };
                return {
                    url: actionTypeUrl[actionType],
                    method: 'GET',
                };
            },
        },
    });

    const columns = (actionType === 'user') ? [
        { name: 'processUserName' },
        { name: 'processTime' },
        { name: 'processTypeMeaning' },
        { name: 'changeFieldMeaning' },
        { name: 'oldValue' },
        { name: 'newValue' },
    ] : [
        { name: 'processUserName' },
        { name: 'processTime' },
        { name: 'processTypeMeaning' },
        { name: 'dimensionName' },
        { name: 'dataName' },
    ];

    return <Table dataSet={historyDs} columns={columns} />;
};

export default formatterCollections({
    code: ['sprm.common', 'entity.roles'],
})(History);
