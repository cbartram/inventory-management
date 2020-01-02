require('dotenv').config();

process.env.NODE_ENV = 'test';
process.env.PORT = 5000;

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
        .get('/api/v1')
        .end((err, res) => {
          res.body.should.be.a('object');
          res.should.have.status(200);
          done();
        });
    });
  });
});
