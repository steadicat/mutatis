import mutatis from '../src/index';
import expect from 'expect';

describe('mutate()', () => {

  it('should wrap once and only once', () => {
    const a = mutatis({x: {}});
    expect(a.__immutable).toBe(true);
    const b = mutatis(a);
    expect(a).toBe(b);
    expect(a.x).toBe(b.x);
  });

  it('should throw when trying to mutate shallow', () => {
    const a = mutatis({y: {z: [1, 2, 3]}});
    expect(() => a.x = true).toThrow();
  });

  xit('should throw when trying to mutate deep', () => {
    const a = mutatis({y: {z: [1, 2, 3]}});
    expect(() => a.y.x = true).toThrow();
    expect(() => a.y.z.push(4)).toThrow();
  });

});

describe('get()', () => {
  it('should get a simple key', () => {
    const a = mutatis({x: {y: 123}});
    const b = a.get('x');
    expect(b.__immutable).toBe(true);
    expect(b.y).toBe(a.x.y);
  });
  it('should get a dotted key with default', () => {
    const a = mutatis({x: {y: 123}});
    expect(a.get('x', 1).y).toBe(123);
    expect(a.get('x.y', 12)).toBe(123);
    expect(a.get('x.z', 12)).toBe(12);
  });
});

describe('getIn()', () => {
  it('should get a key path with default', () => {
    const a = mutatis({x: {y: 123}});
    expect(a.getIn(['x']).y).toBe(123);
    expect(a.getIn(['x', 'y'], 12)).toBe(123);
    expect(a.getIn(['x', 'z'], 12)).toBe(12);
  });
});

describe('set()', () => {
  it('should set a simple key', () => {
    const a = mutatis({});
    const b = a.set('x', 3);
    expect(b.__immutable).toBe(true);
    expect(a.x).toNotExist();
    expect(b.x).toBe(3);
  });

  it('should set a dotted key', () => {
    const a = mutatis({x: {y: 12}});
    const b = a.set('x.y', 3);
    expect(b.__immutable).toBe(true);
    expect(b.x).toExist();
    expect(b.x.y).toBe(3);
  });
});

describe('setIn()', () => {
  it('should set a key path', () => {
    const a = mutatis({});
    const b = a.setIn(['x', 'y'], 3);
    expect(b.__immutable).toBe(true);
    expect(a.x).toNotExist();
    expect(b.x).toExist();
    expect(b.x.y).toBe(3);
  });
});

describe('setDefault()', () => {
  it('should set a dotted key if not set', () => {
    const a = mutatis({});
    const b = a.setDefault('x.y', 3);
    expect(b.__immutable).toBe(true);
    expect(a.x).toNotExist();
    expect(b.x).toExist();
    expect(b.x.y).toBe(3);
  });
  it('should not set a dotted key if set', () => {
    const a = mutatis({x: {y: 2}});
    const b = a.setDefault('x.y', 3);
    expect(b.__immutable).toBe(true);
    expect(b.x.y).toBe(2);
  });
});

describe('setDefaultIn()', () => {
  it('should set a key path if not set', () => {
    const a = mutatis({});
    const b = a.setDefaultIn(['x', 'y'], 3);
    expect(b.__immutable).toBe(true);
    expect(a.x).toNotExist();
    expect(b.x).toExist();
    expect(b.x.y).toBe(3);
  });
  it('should not set a key path if set', () => {
    const a = mutatis({x: {y: 2}});
    const b = a.setDefaultIn(['x', 'y'], 3);
    expect(b.__immutable).toBe(true);
    expect(b.x.y).toBe(2);
  });
});

describe('updateIn()', () => {
  it('should update a key path if not set', () => {
    const a = mutatis({x: {y: 2}, z: {}});
    const b = a.updateIn(['x', 'z'], v => 4);
    expect(b.z).toBe(a.z);
    expect(b.x.z).toBe(4);
  });
  it('should update a key path if set', () => {
    const a = mutatis({x: {y: 2}, z: {}});
    const b = a.updateIn(['x', 'y'], v => v * 2);
    expect(b.z).toBe(a.z);
    expect(b.x.y).toBe(4);
  });
  it('should update a key path with default if not set', () => {
    const a = mutatis({x: {y: 2}, z: {}});
    const b = a.updateIn(['x', 'z'], 12, v => v * 2);
    expect(b.z).toBe(a.z);
    expect(b.x.z).toBe(24);
  });
  it('should update a key path with default if set', () => {
    const a = mutatis({x: {y: 2}, z: {}});
    const b = a.updateIn(['x', 'y'], 24, v => v * 2);
    expect(b.z).toBe(a.z);
    expect(b.x.y).toBe(4);
  });
});

describe('mergeDeep()', () => {
  it('should merge deep', () => {
    const a = mutatis({x: {y: {z: 1}}});
    const b = a.mergeDeep({x: {y: {a: 2, z: 3}}});
    expect(b.x.y.a).toBe(2);
    expect(b.x.y.z).toBe(3);
  });
});

describe('sortBy()', () => {
  it('should sort using the provided function', () => {
    const a = mutatis({a: {score: 3}, b: {score: 2}});
    const b = a.sortBy(x => x.score);
    expect(Object.keys(b)).toEqual(['b', 'a']);
    expect(b.values()[0]).toEqual({score: 2});
    expect(b.values()[1]).toEqual({score: 3});
  });
});

describe('map()', () => {
  it('should map', () => {
    const a = mutatis({a: 3, b: 5, c: 1, d: 2});
    const b = a.map(x => x * 2);
    expect(b.__immutable).toBe(true);
    expect(b.size).toBe(4);
    expect(b.first()).toBe(6);
    expect(b.entries()).toEqual([['a', 6], ['b', 10], ['c', 2], ['d', 4]]);
  });
});

describe('reduce()', () => {
  it('should reduce', () => {
    const a = mutatis({a: 3, b: 5, c: 1, d: 2});
    const b = a.reduce((a, b) => a + b, 0);
    expect(b).toBe(11);
  });
});

describe('filter()', () => {
  it('should filter', () => {
    const a = mutatis({a: 3, b: 5, c: 1, d: 2});
    const b = a.filter(x => x >= 3);
    expect(b.__immutable).toBe(true);
    expect(b.size).toBe(2);
    expect(b.first()).toBe(3);
    expect(b.entries()).toEqual([['a', 3], ['b', 5]]);
  });
});
