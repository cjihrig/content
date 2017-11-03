'use strict';

// Load modules

const Code = require('code');
const Lab = require('lab');
const Content = require('..');


// Declare internals

const internals = {};


// Test shortcuts

const { describe, it } = exports.lab = Lab.script();
const expect = Code.expect;


describe('type()', () => {

    it('parses header', () => {

        const type = Content.type('application/json; some=property; and="another"');
        expect(type.mime).to.equal('application/json');
        expect(type.boundary).to.not.exist();
    });

    it('parses header (only type)', () => {

        const type = Content.type('application/json');
        expect(type.mime).to.equal('application/json');
        expect(type.boundary).to.not.exist();
    });

    it('parses header (boundary)', () => {

        const type = Content.type('application/json; boundary=abcdefghijklm');
        expect(type.mime).to.equal('application/json');
        expect(type.boundary).to.equal('abcdefghijklm');
    });

    it('parses header (quoted boundary)', () => {

        const type = Content.type('application/json; boundary="abcdefghijklm"');
        expect(type.mime).to.equal('application/json');
        expect(type.boundary).to.equal('abcdefghijklm');
    });

    it('handles large number of OWS', () => {

        const now = Date.now();
        expect(() => Content.type(`l/h ; ${new Array(80000).join(' ')}"`)).to.throw();
        expect(Date.now() - now).to.be.below(100);
    });

    it('errors on invalid header', () => {

        expect(() => Content.type('application/json; some')).to.throw();
    });

    it('errors on multipart missing boundary', () => {

        expect(() => Content.type('multipart/form-data')).to.throw();
    });
});

describe('disposition()', () => {

    it('parses header', () => {

        const header = 'form-data; name="file"; filename=file.jpg';

        expect(Content.disposition(header)).to.equal({ name: 'file', filename: 'file.jpg' });
    });

    it('parses header (empty filename)', () => {

        const header = 'form-data; name="file"; filename=""';

        expect(Content.disposition(header)).to.equal({ name: 'file', filename: '' });
    });

    it('parses header (filename with quotes)', () => {

        const header = 'form-data; name="file"; filename="fi\'l\'e.jpg"';

        expect(Content.disposition(header)).to.equal({ name: 'file', filename: 'fi\'l\'e.jpg' });
    });

    it('handles language filename', () => {

        const header = 'form-data; name="file"; filename*=utf-8\'en\'with%20space';

        expect(Content.disposition(header)).to.equal({ name: 'file', filename: 'with space' });
    });

    it('handles large number of OWS', () => {

        const now = Date.now();
        const header = `form-data; x; ${new Array(5000).join(' ')};`;
        expect(() => Content.disposition(header)).to.throw();
        expect(Date.now() - now).to.be.below(100);
    });

    it('errors on invalid language filename', () => {

        const header = 'form-data; name="file"; filename*=steve';
        expect(() => Content.disposition(header)).to.throw('Invalid content-disposition header format includes invalid parameters');
    });

    it('errors on invalid format', () => {

        const header = 'steve';
        expect(() => Content.disposition(header)).to.throw('Invalid content-disposition header format');
    });

    it('errors on missing header', () => {

        expect(() => Content.disposition('')).to.throw('Missing content-disposition header');
    });

    it('errors on missing parameters', () => {

        const header = 'form-data';
        expect(() => Content.disposition(header)).to.throw('Invalid content-disposition header missing parameters');
    });

    it('errors on missing language value', () => {

        const header = 'form-data; name="file"; filename*=';
        expect(() => Content.disposition(header)).to.throw('Invalid content-disposition header format includes invalid parameters');
    });

    it('errors on invalid percent encoded language value', () => {

        const header = 'form-data; name="file"; filename*=utf-8\'en\'with%vxspace';
        expect(() => Content.disposition(header)).to.throw('Invalid content-disposition header format includes invalid parameters');
    });

    it('errors on missing name', () => {

        const header = 'form-data; filename=x';
        expect(() => Content.disposition(header)).to.throw('Invalid content-disposition header missing name parameter');
    });
});
