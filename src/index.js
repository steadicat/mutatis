let warned = false;
function warn() {
  if (warned) return;
  warned = true;
  console.warn('map(), reduce(), filter() on maps might be removed in the future. Convert to an array first using keys(), values(), or entries().');
}

function freeze(obj) {
  return Object.freeze ? Object.freeze(obj) : obj;
}

function defined(val) {
  return (val !== null) && (val !== undefined);
}

function set(key, value) {
  return setIn.call(this, key.split('.'), value);
}

function setIn(keyPath, value) {
  if (keyPath.length === 1) return immutable(Object.assign({}, this, {[keyPath[0]]: value}));
  return setIn.call(this, [keyPath[0]], setIn.call(this[keyPath[0]] || {}, keyPath.slice(1), value));
}

function setDefault(key, defaultValue) {
  return setDefaultIn.call(this, key.split('.'), defaultValue);
}

function setDefaultIn(keyPath, defaultValue) {
  return setIn.call(this, keyPath, getIn.call(this, keyPath, defaultValue));
}

function get(key, value) {
  return getIn.call(this, key.split('.'), value);
}

function getIn(keyPath, defaultValue) {
  if (this === undefined) return defaultValue;
  if (keyPath.length === 1) return defined(this[keyPath[0]]) ? immutable(this[keyPath[0]]) : defaultValue;
  return getIn.call(this[keyPath[0]], keyPath.slice(1), defaultValue);
}

function update(key, defaultValue, mutator) {
  return updateIn.call(this, key.split('.'), defaultValue, mutator);
}

function updateIn(keyPath, defaultValue, mutator) {
  if (!mutator) {
    mutator = defaultValue;
    defaultValue = undefined;
  }
  return setIn.call(this, keyPath, mutator(getIn.call(this, keyPath, defaultValue)));
}

function remove(key) {
  return removeIn.call(this, key.split('.'));
}

function removeIn(keyPath) {
  if (keyPath.length === 1) {
    const res = Object.assign({}, this);
    delete res[keyPath[0]];
    return immutable(res);
  }
  return setIn.call(this, [keyPath[0]], removeIn.call(this[keyPath[0]], keyPath.slice(1)));
}

function map(f) {
  warn();
  return immutable(Object.keys(this).map((key, i) =>
    [key, f(immutable(this[key]), key, i)]
  ).reduce((obj, [key, val]) => {
    obj[key] = val;
    return obj;
  }, {}));
}

function reduce(f, initialValue) {
  warn();
  return immutable(Object.keys(this).reduce((value, key) => {
    return f(value, this[key], key);
  }, initialValue));
}

function filter(f) {
  warn();
  return immutable(Object.keys(this).map((key, i) =>
    [key, f(immutable(this[key]), key, i)]
  ).reduce((obj, [key, test]) => {
    if (test) obj[key] = this[key];
    return obj;
  }, {}));
}

function forEach(f) {
  Object.keys(this).forEach((key, i) =>
    f(immutable(this[key]), key, i)
  );
}

function mergeDeep(other) {
  if (!Object.isObject(this)) return other;
  if (!Object.isObject(other)) return other;
  return immutable(Object.keys(other).reduce((obj, key) => {
    obj[key] = mergeDeep.call(obj[key], other[key]);
    return obj;
  }, Object.assign({}, this)));
}

function keys() {
  return Object.keys(this);
}

function values() {
  return Object.keys(this).map(k => this[k]);
}

function entries() {
  return Object.keys(this).map(k => [k, this[k]]);
}

function sortBy(f) {
  const sorted = Object.keys(this).map(key => {
    return [f(this[key], key), key, this[key]];
  });
  return immutable(sorted.sort((a, b) => {
    return a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0;
  }).reduce((obj, [sorter, key, value]) => {
    obj[key] = value;
    return obj;
  }, {}));
}

function first() {
  return immutable(this[Object.keys(this)[0]]);
}

function arrayFirst() {
  return immutable(this[0]) ;
}

const mapPrototype = {
  __immutable: true,
  get,
  getIn,
  set,
  setIn,
  setDefault,
  setDefaultIn,
  update,
  updateIn,
  remove,
  removeIn,
  map,
  reduce,
  filter,
  forEach,
  mergeDeep,
  keys,
  values,
  entries,
  sortBy,
  first,
};

function Map() {}
Map.prototype = mapPrototype;

function immutableMap(object) {
  if (object.__immutable) return object;
  if (object.prototype !== undefined) return object;

  const map = Object.keys(object).reduce((m, key) => {
    m[key] = object[key];
    return m;
  }, new Map());

  Object.defineProperty(map, 'size', {value: Object.keys(object).length});
  return freeze(map);
}

function immutableArray(array) {
  if (array.__immutable) return array;

  const list = array.map(immutable);

  Object.defineProperties(list, {
    __immutable: {value: true},
    first: {value: arrayFirst},
  });
  return freeze(list);
}

export default function immutable(object) {
  if (Array.isArray(object)) return immutableArray(object);
  if (Object.isObject(object)) return immutableMap(object);
  return object;
}
