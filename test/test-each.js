'use strict';

import test from 'ava';
import * as asyncP from '../src/async-promises.js';

test('each', t => {
	var args = [];
	asyncP.each([1, 3, 2], (x) => {
		return new Promise(function(resolve) {
			setTimeout(() => {
				args.push(x);
				resolve();
			}, x * 25);
		});
	})
	.then(() => {
		t.same(args, [1, 2, 3]);
	}, (err) => {
		t.fail(`should not throw an error: ${err}`);
	})
	.then(t.end);
});

test('each empty array', t => {
	t.plan(1);
	asyncP.each([], (x) => {
		t.fail('iterator should not be called');
	})
	.then(() => {
		t.pass('should return a promise or a thenable');
	}, (err) => {
		t.fail(`should not throw an error: ${err}`);
	});
});

test('each empty array, with other property on the array', t => {
	t.plan(1);
	var myArray = [];
	myArray.myProp = 'anything';
	asyncP.each(myArray, (x) => {
		t.fail('iterator should not be called');
	})
	.then(() => {
		t.pass('should return a promise or a thenable');
	}, (err) => {
		t.fail(`should not throw an error: ${err}`);
	});
});

test('each error', t => {
	t.plan(1);
	asyncP.each([1, 2, 3], (x) => {
		return Promise.reject('error');
	})
	.then(() => {
		t.fail('should not be called');
	}, (err) => {
		t.same(err, 'error');
	});
});
