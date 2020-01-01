require('dotenv').config();

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const { describe, it } = require('mocha');

const should = chai.should();
chai.use(chaiHttp);

const server = require('../index');

describe('API Tests', () => {
  describe('GET /', () => {
    it('Successfully retrieves API meta-data', (done) => {
      chai.request(server)
        .get('/')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          done();
        });
    });
  });
});
