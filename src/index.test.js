/**
 * Created by Jaws on 5/8/17.
 */
import {expect} from 'chai';
import jsdom from 'jsdom';
import fs from 'fs';

describe('Our first test', () => {
    "use strict";

    it('should pass', () => {
        expect(true).to.equal(true);
    });
});


describe('index.html', () => {
    "use strict";

    // as getting the elements by tag is async, need to pass a callback (done)
    it('should say hello', (done) => {
        // load the file into memory for use with JSDOM
        const index = fs.readFileSync('./src/index.html', "utf-8");
        jsdom.env(index, function(err, window) {
            const h1 = window.document.getElementsByTagName('h1')[0];
            expect(h1.innerHTML).to.equal("Hello World!");
            done();
            window.close();
        });
    });
});
