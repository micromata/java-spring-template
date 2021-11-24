const filter = module.exports;
const _ = require('lodash');

function defineType(prop, propName) {
    if (prop.type() === 'object') {
        return _.upperFirst(_.camelCase(prop.uid()));
    } else if (prop.type() === 'array') {
        if (prop.items().type() === 'object') {
            return 'List<' + _.upperFirst(_.camelCase(prop.items().uid())) + '>';
        } else if (prop.items().format()) {
            return 'List<' + toClass(toJavaType(prop.items().format())) + '>';
        } else {
            return 'List<' + toClass(toJavaType(prop.items().type())) + '>';
        }
    } else if (prop.enum() && (prop.type() === 'string' || prop.type() === 'integer')) {
            return _.upperFirst(_.camelCase(propName)) + 'Enum';
    } else if (prop.anyOf() || prop.oneOf()) {
        let propType = 'OneOf';
        let hasPrimitive = false;
        [].concat(prop.anyOf(), prop.oneOf()).filter(obj => obj != null).forEach(obj => {
            hasPrimitive |= obj.type() !== 'object';
            propType += _.upperFirst(_.camelCase(obj.uid()));
        });
        if (hasPrimitive) {
            propType = 'Object';
        }
        return propType;
    } else if (prop.allOf()) {
        let propType = 'AllOf';
        prop.allOf().forEach(obj => {
            propType += _.upperFirst(_.camelCase(obj.uid()));
        });
        return propType;
    } else {
        if (prop.format()) {
            return toJavaType(prop.format());
        } else {
            return toJavaType(prop.type());
        }
    }
}
filter.defineType = defineType;

function toClass(couldBePrimitive) {
    switch(couldBePrimitive) {
        case 'int':
            return 'Integer';
        case 'long':
            return 'Long';
        case 'boolean':
            return 'Boolean';
        case 'float':
            return 'Float';
        case 'double':
            return 'Double';
        default:
            return couldBePrimitive;
    }
}
filter.toClass = toClass;

function toJavaType(str){
  switch(str) {
    case 'integer':
    case 'int32':
      return 'Integer';
    case 'long':
    case 'int64':
      return 'Long';
    case 'boolean':
      return 'Boolean';
    case 'date':
      return 'java.time.LocalDate';
    case 'time':
      return 'java.time.OffsetTime';
    case 'dateTime':
    case 'date-time':
      return 'java.time.OffsetDateTime';
    case 'string':
    case 'password':
    case 'byte':
    case 'email':  
      return 'String';
    case 'float':
      return 'Float';
    case 'double':
      return 'Double';
    case 'binary':
      return 'Byte[]';
    case 'uuid':
      return 'java.util.UUID';  
    default:
      return 'Object';
  }
}
filter.toJavaType = toJavaType;

function isDefined(obj) {
  return typeof obj !== 'undefined'
}
filter.isDefined = isDefined;

function isProtocol(api, protocol){
  return JSON.stringify(api.json()).includes('"protocol":"' + protocol + '"');
};
filter.isProtocol = isProtocol;

function isObjectType(schemas){
  var res = [];
  for (let obj of schemas) {
    if (obj._json['type'] === 'object' && !obj._json['x-parser-schema-id'].startsWith('<')) {
      res.push(obj);
    }
  }
  return res;
};
filter.isObjectType = isObjectType;

function examplesToString(ex){
  let retStr = "";
  ex.forEach(example => {
    if (retStr !== "") {retStr += ", "}
    if (typeof example == "object") {
      try {
        retStr += JSON.stringify(example);
      } catch (ignore) {
        retStr += example;
      }
    } else {
      retStr += example;
    }
  });
  return retStr;
};
filter.examplesToString = examplesToString;

function splitByLines(str){
  if (str) {
    return str.split(/\r?\n|\r/).filter((s) => s !== "");
  } else {
    return "";
  }
};
filter.splitByLines = splitByLines;

function isRequired(name, list){
  return list && list.includes(name);
};
filter.isRequired = isRequired;

function schemeExists(collection, scheme){
  return _.some(collection, {'scheme': scheme});
};
filter.schemeExists = schemeExists;

function createEnum(val){
  let result;
  let withoutNonWordChars = val.replace(/[^A-Z^a-z^0-9]/g, "_");
  if ((new RegExp('^[^A-Z^a-z]', 'i')).test(withoutNonWordChars)) {
    result = '_' + withoutNonWordChars;
  } else {
    result = withoutNonWordChars;
  }
  return result;
};
filter.createEnum = createEnum;

function addBackSlashToPattern(val) {  
  let result = val.replace(/\\/g, "\\\\");
  return result;
}
filter.addBackSlashToPattern = addBackSlashToPattern;


/**
 * Collects all porperties of the schemaObj and the inherited allOf
 * @param {Schema} schemaObj 
 */
 function collectProperties(schemaObj) {
  let res = schemaObj.properties();
  // collect all allOf sub porperties
  if(schemaObj.allOf() !== null) {
    schemaObj.allOf().forEach(allOfItem => {
      res = Object.assign(res, allOfItem.properties());
    });
  }

  return res;
}
filter.collectProperties = collectProperties;

/**
 * Checks if the given schema is a class which has subclasses
 * @param {Schema} schema 
 * @returns 
 */
function hasSubClasses(schema) {  
  return schema._json['x-java-sub-classes'] !== undefined;
}
filter.hasSubClasses = hasSubClasses

/**
 * Checks if the schema has java implementation information and if so returns the implements string
 * @param {Schema} schema the schema of the current class to generate
 * @returns the string for the implements information
 */
function getImplementsClass(schema) {
  if(schema._json['x-java-impl-information']) {
    return 'implements '+schema._json['x-java-impl-information'].implClass;
  }

  return '';
}
filter.getImplementsClass = getImplementsClass;

/**
 * checks if the given prop is a discriminator value and returns if so
 * @param {Schema} schema the schema of where the property is in
 * @param {string} propertyName the name of the current property
 * @returns 
 */
function getDiscriminatorValue(schema, propertyName) {
  if(!schema._json['x-java-impl-information']) {
    return '';  
  }

  if(schema._json['x-java-impl-information'].discriminatorField !== propertyName) {
    return '';
  }

  return ' = "'+schema.uid()+'"';  
}
filter.getDiscriminatorValue = getDiscriminatorValue;
