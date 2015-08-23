# Mutatis

A lightweight immutability library.

> Mutatis mutandis is a Medieval Latin phrase meaning “the necessary changes having been made” or “once the necessary changes have been made”.

Like [immutable](https://facebook.github.io/immutable-js/), but compatible with standard JS data structures.

Like [seamless-immutable](https://github.com/rtfeldman/seamless-immutable), but with the nice mutability helpers.

Like the [React Immutability helpers](https://facebook.github.io/react/docs/update.html), but without the weird MongoDB-inspired syntax.

## Usage

```js
import mutatis from 'mutatis';

const x = mutatis({a: 12, b: [23, 56]});
mutatis.size; // 2
mutatis.a = 78; // Throws

const y = x.set('c', {d: {e: 'string'});
// {a: 12, b: [23, 56], c: {d: {e: 'string'}}};

const z = y
  .setIn(['c', 'd', 'f'], 'another string')
  .update('b', l => l.concat(78));
// {a: 12, b: [23, 56, 78], c: {d: {e: 'string', f: 'another string'}}};

const a = mutatis([12, 34]);
a.push(56); // Throws
```
