const assert = require('chai').assert;

const paint = require('../app/scripts/paint.spec');

const elt = paint.elt;
const cp = paint.createPaint

describe('App', () => {
    it('The app succesfully started', () => {
        console.log('Test case was launched');
    });
    it('The elt is function', () => {
        assert.isFunction(elt, 'Elt must be a function');
    });
    // it('The function elt return a DOM-node', () => {
    //     const nodesName = ['div', 'input', 'a'];
    //     nodesName.forEach( item => {
    //         assert.equal(elt(item).tagName.toLowerCase(), item.toLowerCase(), 'The elt should return specific DOM-node');
    //     })
    // })
    it('cp is function', () => {
        assert.isFunction(cp, 'cp should be function');
    })
});