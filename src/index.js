import * as mapMethods from './map';
import * as listMethods from './list';

function freeze(obj) {
  return Object.freeze ? Object.freeze(obj) : obj;
}

function isPlainObject(value) {
  return value && (value.constructor === Object || value.constructor === undefined) && !value._isReactElement;
}

const mapPrototype = {
  __mutatis: true,
  ...mapMethods,
};

function Map() {}
Map.prototype = mapPrototype;

function immutableMap(object) {
  if (object.__mutatis) return object;

  const map = Object.keys(object).reduce((m, key) => {
    m[key] = mutatis(object[key]);
    return m;
  }, new Map());

  Object.defineProperty(map, 'size', {value: Object.keys(object).length});
  return freeze(map);
}

function immutableList(array) {
  if (array.__mutatis) return array;

  const list = array.map(mutatis);

  Object.defineProperties(list, {
    __mutatis: {value: true},
    first: {value: listMethods.first},
    last: {value: listMethods.last},
  });
  return freeze(list);
}

export default function mutatis(object) {
  if (Array.isArray(object)) return immutableList(object);
  if (isPlainObject(object)) return immutableMap(object);
  return object;
}
