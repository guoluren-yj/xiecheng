import { isNil } from 'lodash';

export default (classArr) => classArr.map((className) => !isNil(className)).join(' ');
