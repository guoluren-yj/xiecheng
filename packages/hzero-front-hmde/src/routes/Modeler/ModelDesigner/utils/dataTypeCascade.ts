/**
 * Oracle 数据类型联动
 * @param {*} type
 */
interface IOptionArr {
  key: number | string;
  value: number | string;
}
interface IObj {
  dataSize: {
    min?: number;
    max?: number;
    defaultValue?: number | string | null;
    type: string;
  };
  decimalDigits: {
    min?: number;
    max?: number;
    defaultValue?: number | string | null;
    type: string;
    required: boolean;
  };
  defaultValue: {
    min?: number;
    max?: number;
    style: string;
    type: string;
    defaultValue?: number | string | null;
    optionArr?: IOptionArr[] | [];
  };
}
export function OracleDataTypeCascade(type: string) {
  let obj: IObj = {
    dataSize: {
      max: 255,
      defaultValue: 255,
      type: 'edit', // readOnly
    },
    decimalDigits: {
      defaultValue: 0,
      type: 'edit', // readOnly
      required: false,
    },
    defaultValue: {
      style: 'number', // select //string // float
      type: 'edit', // readOnly
      defaultValue: null,
      optionArr: [],
    },
  };
  switch (type) {
    case 'CHAR':
      obj = {
        dataSize: { min: 1, max: 600, defaultValue: null, type: 'edit' },
        decimalDigits: { defaultValue: 0, type: 'readOnly', required: false },
        defaultValue: { style: 'string', type: 'edit' },
      };
      return obj;
    case 'VARCHAR2':
      obj = {
        dataSize: { min: 1, max: 1200, defaultValue: null, type: 'edit' },
        decimalDigits: { defaultValue: 0, type: 'readOnly', required: false },
        defaultValue: { style: 'string', type: 'edit' },
      };
      return obj;
    case 'CLOB':
      obj = {
        dataSize: { min: 1, max: 4000, defaultValue: 4000, type: 'readOnly' },
        decimalDigits: { defaultValue: 0, type: 'readOnly', required: false },
        defaultValue: { style: 'string', type: 'readOnly' },
      };
      return obj;
    case 'BLOB':
      obj = {
        dataSize: { min: 1, max: 4000, defaultValue: 4000, type: 'readOnly' },
        decimalDigits: { defaultValue: 0, type: 'readOnly', required: false },
        defaultValue: { style: 'string', type: 'readOnly' },
      };
      return obj;
    case 'DATE':
      obj = {
        dataSize: { min: 1, max: 7, defaultValue: null, type: 'readOnly' },
        decimalDigits: { defaultValue: 0, type: 'readOnly', required: false },
        defaultValue: { defaultValue: null, style: 'select', type: 'edit' },
      };
      return obj;
    case 'NUMBER':
      obj = {
        dataSize: { min: 1, max: 38, defaultValue: null, type: 'edit' },
        decimalDigits: { min: -84, max: 127, defaultValue: 0, type: 'edit', required: false },
        defaultValue: { style: 'number', type: 'edit' },
      };
      return obj;
    default:
  }
}

/**
 * MySql 数据类型联动
 * @param {*} type
 */
export function MySqlDataTypeCascade(type: string): any {
  let obj: IObj = {
    dataSize: {
      max: 255,
      defaultValue: 255,
      type: 'edit', // readOnly
    },
    decimalDigits: {
      defaultValue: 0,
      type: 'edit', // readOnly
      required: false,
    },
    defaultValue: {
      style: 'number', // select //string // float
      type: 'edit', // readOnly
      defaultValue: null,
      optionArr: [],
    },
  };
  switch (type) {
    case 'BIT':
      obj = {
        dataSize: { min: 1, max: 64, defaultValue: 1, type: 'readOnly' },
        decimalDigits: { min: 0, defaultValue: 0, type: 'readOnly', required: false },
        defaultValue: {
          style: 'select',
          type: 'edit',
          defaultValue: null,
          optionArr: [
            {
              key: 1,
              value: 1,
            },
            {
              key: 0,
              value: 0,
            },
          ],
        },
      };
      return obj;
    case 'TINYINT':
      obj = {
        dataSize: { min: 1, max: 255, defaultValue: 3, type: 'readOnly' },
        decimalDigits: { min: 0, defaultValue: 0, type: 'readOnly', required: false },
        defaultValue: { style: 'number', type: 'edit', max: 127, min: -128 },
      };
      return obj;
    case 'TINYINT UNSIGNED':
      obj = {
        dataSize: { min: 1, max: 255, defaultValue: 3, type: 'readOnly' },
        decimalDigits: { min: 0, defaultValue: 0, type: 'readOnly', required: false },
        defaultValue: { style: 'number', type: 'edit', max: 255, min: 0 },
      };
      return obj;
    case 'INT':
      obj = {
        dataSize: { min: 1, max: 255, defaultValue: 10, type: 'readOnly' },
        decimalDigits: { min: 0, defaultValue: 0, type: 'readOnly', required: false },
        defaultValue: { style: 'number', type: 'edit', max: 2147483647, min: -2147483648 },
      };
      return obj;
    case 'INT UNSIGNED':
      obj = {
        dataSize: { min: 1, max: 255, defaultValue: 10, type: 'readOnly' },
        decimalDigits: { min: 0, defaultValue: 0, type: 'readOnly', required: false },
        defaultValue: { style: 'number', type: 'edit', max: 4294967295, min: 0 },
      };
      return obj;
    case 'BIGINT':
      obj = {
        dataSize: { min: 1, max: 255, defaultValue: 19, type: 'readOnly' },
        decimalDigits: { min: 0, defaultValue: 0, type: 'readOnly', required: false },
        defaultValue: {
          style: 'number',
          type: 'edit',
          max: 9233372036854775000,
          min: -9233372036854776000,
        },
      };
      return obj;
    case 'BIGINT UNSIGNED':
      obj = {
        dataSize: { min: 1, max: 255, defaultValue: 20, type: 'readOnly' },
        decimalDigits: { min: 0, defaultValue: 0, type: 'readOnly', required: false },
        defaultValue: { style: 'number', type: 'edit', max: 18446744073709551000, min: 0 },
      };
      return obj;
    case 'FLOAT':
      obj = {
        dataSize: { min: 1, max: 255, defaultValue: null, type: 'edit' },
        decimalDigits: { min: 0, defaultValue: 0, type: 'edit', required: true },
        defaultValue: { style: 'float', type: 'edit' },
      };
      return obj;
    case 'FLOAT UNSIGNED':
      obj = {
        dataSize: { min: 1, max: 255, defaultValue: null, type: 'edit' },
        decimalDigits: { min: 0, defaultValue: 0, type: 'edit', required: true },
        defaultValue: { style: 'float', type: 'edit' },
      };
      return obj;
    case 'DOUBLE':
      obj = {
        dataSize: { min: 1, max: 255, defaultValue: null, type: 'edit' },
        decimalDigits: { min: 0, defaultValue: 0, type: 'edit', required: true },
        defaultValue: { style: 'float', type: 'edit' },
      };
      return obj;
    case 'DOUBLE UNSIGNED':
      obj = {
        dataSize: { min: 1, max: 255, defaultValue: null, type: 'edit' },
        decimalDigits: { min: 0, defaultValue: 0, type: 'edit', required: true },
        defaultValue: { style: 'float', type: 'edit' },
      };
      return obj;
    case 'DECIMAL':
      obj = {
        dataSize: { min: 1, max: 65, defaultValue: null, type: 'edit' },
        decimalDigits: { min: 0, defaultValue: 0, type: 'edit', required: true },
        defaultValue: { style: 'float', type: 'edit' },
      };
      return obj;
    case 'DECIMAL UNSIGNED':
      obj = {
        dataSize: { min: 1, max: 65, defaultValue: null, type: 'edit' },
        decimalDigits: { min: 0, defaultValue: 0, type: 'edit', required: true },
        defaultValue: { style: 'float', type: 'edit' },
      };
      return obj;
    case 'LONGBLOB':
      obj = {
        dataSize: { min: 1, max: 2147483647, defaultValue: 2147483647, type: 'readOnly' },
        decimalDigits: { min: 0, defaultValue: 0, type: 'readOnly', required: false },
        defaultValue: { style: 'string', type: 'readOnly' },
      };
      return obj;
    case 'DATETIME':
      obj = {
        dataSize: { min: 1, max: 19, defaultValue: 19, type: 'readOnly' },
        decimalDigits: { min: 0, defaultValue: 0, type: 'readOnly', required: false },
        defaultValue: {
          style: 'select',
          type: 'edit',
          defaultValue: null,
          optionArr: [
            {
              key: 'CURRENT_TIMESTAMP',
              value: 'CURRENT_TIMESTAMP',
            },
          ],
        },
      };
      return obj;
    case 'TIMESTAMP':
      obj = {
        dataSize: { min: 1, max: 19, defaultValue: 19, type: 'readOnly' },
        decimalDigits: { min: 0, defaultValue: 0, type: 'readOnly', required: false },
        defaultValue: {
          style: 'select',
          type: 'edit',
          defaultValue: null,
          optionArr: [
            {
              key: 'CURRENT_TIMESTAMP',
              value: 'CURRENT_TIMESTAMP',
            },
          ],
        },
      };
      return obj;
    case 'DATE':
      obj = {
        dataSize: { min: 1, max: 10, defaultValue: 10, type: 'readOnly' },
        decimalDigits: { min: 0, defaultValue: 0, type: 'readOnly', required: false },
        defaultValue: { defaultValue: null, style: 'string', type: 'readOnly' },
      };
      return obj;
    case 'TIME':
      obj = {
        dataSize: { min: 1, max: 8, defaultValue: null, type: 'readOnly' },
        decimalDigits: { min: 0, defaultValue: 0, type: 'readOnly', required: false },
        defaultValue: { style: 'string', type: 'readOnly' },
      };
      return obj;
    case 'CHAR':
      obj = {
        dataSize: { min: 1, max: 255, defaultValue: null, type: 'edit' },
        decimalDigits: { min: 0, defaultValue: 0, type: 'readOnly', required: false },
        defaultValue: { style: 'string', type: 'edit' },
      };
      return obj;
    case 'VARCHAR':
      obj = {
        dataSize: { min: 1, max: 1200, defaultValue: null, type: 'edit' },
        decimalDigits: { min: 0, defaultValue: 0, type: 'readOnly', required: false },
        defaultValue: { style: 'string', type: 'edit' },
      };
      return obj;
    case 'LONGTEXT':
      obj = {
        dataSize: { min: 1, max: 2147483647, defaultValue: 2147483647, type: 'readOnly' },
        decimalDigits: { min: 0, defaultValue: 0, type: 'readOnly', required: false },
        defaultValue: { style: 'string', type: 'readOnly' },
      };
      return obj;
    default:
  }
}
