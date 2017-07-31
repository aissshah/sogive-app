import _ from 'lodash';
import {assert} from 'sjtest';
import {isa} from '../DataClass';

/** impact utils */
const MonetaryAmount = {};
export default MonetaryAmount;

// duck type: needs currency & value
MonetaryAmount.isa = (obj) => isa(obj, 'MonetaryAmount') || (obj.currency && _.isNumber(obj.value));
MonetaryAmount.assIsa = (obj) => assert(MonetaryAmount.isa(obj));

MonetaryAmount.make = (base = {}) => {
	let ma = {};
	Object.assign(ma, base);
	ma['@type'] = 'MonetaryAmount';
	return ma;
};
