require('dotenv').config();

process.env.NODE_ENV = 'test';

const { expect } = require('chai');
const { describe, it } = require('mocha');
const AWS = require('aws-sdk-mock');
const DynamoDB = require('../src/DynamoDB');

describe('DynamoDB Tests', () => {

    afterEach(() => {
        AWS.restore();
    });

    it('Finds all items for a given category', async () => {
        AWS.mock('DynamoDB.DocumentClient', 'query', (params, callback) => {
            callback(null, { Items: [{ name: 'Milk'}, { name: 'Eggs' }] });
        });

        const items = await new DynamoDB().findAllItems("category-abc123");
        expect(items).to.be.an('object').that.deep.equals({ Items: [ { name: 'Milk' }, { name: 'Eggs' } ] });
    });

    it('Throws an error when category id is not passed', async () => {
        try {
            await new DynamoDB().findAllItems();
        } catch(e) {
            expect(e.message).to.be.a('string').that.equals('Category Id is missing from the request parameters: Category Id = undefined');
        }
    });

    it('Throws an error when something fails with DynamoDB and the network', async () => {
        AWS.mock('DynamoDB.DocumentClient', 'query', (params, callback) => {
            callback('There was an error attempting to retrieve all items for given category: category-abc123', null);
        });

        try {
            await new DynamoDB().findAllItems("category-abc123");
        } catch(err) {
            expect(err.message).to.be.a('string').that.equals('There was an error attempting to retrieve all items for given category: category-abc123');
        }
    });

    it('Returns an empty object when no items could be found for the given category', async () => {
        AWS.mock('DynamoDB.DocumentClient', 'query', (params, callback) => {
            callback(null,{});
        });
        const items = await new DynamoDB().findAllItems("category-abc123");
        expect(items).to.be.a('object');
        expect(Object.keys(items).length).to.be.a('number').that.equals(0);
    });

    it('Deletes an item/category successfully', async () => {
        AWS.mock('DynamoDB.DocumentClient', 'batchWrite', (params, callback) => {
            callback(null,{ UnprocessedItems: {} });
        });
        const items = await new DynamoDB().bulkDelete([{ pid: 'foo', sid: 'bar' }]);
        expect(items).to.be.a('object');
        expect(items.UnprocessedItems).to.be.a('object');
    });

    it('Catches an error when something fails with DynamoDB and the network while deleting items', async () => {
        AWS.mock('DynamoDB.DocumentClient', 'batchWrite', (params, callback) => {
            callback('There was an error attempting to delete the specified items:', null);
        });

        try {
            await new DynamoDB().bulkDelete([]);
        } catch(err) {
            expect(err.message).to.be.a('string').that.equals('There was an error attempting to delete the specified items: ');
        }
    });
});