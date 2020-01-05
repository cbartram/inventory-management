require('dotenv').config();

process.env.NODE_ENV = 'test';
process.env.PORT = 5000;

const chai = require('chai');
const chaiHttp = require('chai-http');
const { describe, it } = require('mocha');
const AWS = require('aws-sdk-mock');

const should = chai.should();
chai.use(chaiHttp);

let server = require('../index');

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

    describe('Item Tests', () => {
        afterEach(() => AWS.restore('DynamoDB.DocumentClient'));

        it('Successfully gets all items for a category', (done) => {
            AWS.mock('DynamoDB.DocumentClient', 'query', (params, callback) => {
                callback(null, { Items: [{ name: 'Milk'}, { name: 'Egs' }] });
            });

            chai.request(server)
                .get('/api/v1/item/category-abc123')
                .end((err, res) => {
                    res.body.should.be.a('array');
                    res.body.should.have.length(2);
                    res.should.have.status(200);
                    done();
                });
        });

        it('Catches an error when DynamoDB fails to find items for a category', (done) => {
            AWS.mock('DynamoDB.DocumentClient', 'query', (params, callback) => {
                callback('Sort key must be specified', null);
            });

            chai.request(server)
                .get('/api/v1/item/category-abc123')
                .end((err, res) => {
                    res.body.should.be.a('object');
                    res.body.error.should.equal(true);
                    res.should.have.status(500);
                    done();
                });
        });

        it('Should successfully create a new item for a given category', (done) => {
            AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
                callback(null, { quantity: 1, name: 'Foo', pid: 'category-abc123', sid: 'item-abc321' });
            });

            chai.request(server)
                .post('/api/v1/item/create')
                .send({ category: 'category-abc123', name: 'Foo', quantity: 1 })
                .end((err, res) => {
                    res.body.should.be.a('object');
                    res.body.name.should.equal("Foo");
                    res.body.pid.should.equal("category-abc123");
                    res.body.quantity.should.equal(1);
                    res.should.have.status(200);
                    done();
                });
        });
    });

    describe('Category Tests', () => {
        afterEach(() => AWS.restore('DynamoDB.DocumentClient'));

        it('Successfully gets all categories', (done) => {
            AWS.mock('DynamoDB.DocumentClient', 'query', (params, callback) => {
                callback(null, { Items: [{ name: 'Groceries'}, { name: 'Pet Food' }] });
            });

            chai.request(server)
                .get('/api/v1/category/')
                .end((err, res) => {
                    res.body.should.be.a('array');
                    res.body.should.have.length(2);
                    res.should.have.status(200);
                    done();
                });
        });

        it('Catches an error when DynamoDB cannot retrieve all categories', (done) => {
            AWS.mock('DynamoDB.DocumentClient', 'query', (params, callback) => {
                callback({ message: 'connect EHOSTUNREACH 169.254.169.254:80 cannot read credentials in config'}, null);
            });

            chai.request(server)
                .get('/api/v1/category/')
                .end((err, res) => {
                    res.body.should.be.a('object');
                    res.body.message.should.be.a('string');
                    res.body.message.should.equal('connect EHOSTUNREACH 169.254.169.254:80 cannot read credentials in config');
                    res.should.have.status(500);
                    done();
                });
        });

        it('Successfully creates a new category in DynamoDB', (done) => {
            AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
                callback(null, {});
            });

            chai.request(server)
                .post('/api/v1/category/create')
                .send({ name: 'FOO' })
                .end((err, res) => {
                    res.body.should.be.a('object');
                    res.body.name.should.be.a('string');
                    res.body.name.should.equal('FOO');
                    res.should.have.status(200);
                    done();
                });
        });

        it('Throws an error when name is not present in the request body', (done) => {
            AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
                callback(null, {});
            });

            chai.request(server)
                .post('/api/v1/category/create')
                .end((err, res) => {
                    res.body.should.be.a('object');
                    res.body.error.should.be.a('boolean');
                    res.body.message.should.equal('Required body parameter missing: name');
                    res.should.have.status(200);
                    done();
                });
        });

        it('Catches an error when creating a new category when DynamoDB cannot PUT', (done) => {
            AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
                callback({ message: 'connect EHOSTUNREACH 169.254.169.254:80 cannot read credentials in config'}, null);
            });

            chai.request(server)
                .post('/api/v1/category/create')
                .send({ name: 'FOO' })
                .end((err, res) => {
                    res.body.should.be.a('object');
                    res.body.message.should.be.a('string');
                    res.body.message.should.equal('connect EHOSTUNREACH 169.254.169.254:80 cannot read credentials in config');
                    res.should.have.status(500);
                    done();
                });
        });
    });
});
