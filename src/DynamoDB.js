const { NODE_ENV } = process.env;
const AWS = require('aws-sdk');
const { DYNAMODB_TABLE_NAME } = require('./constants');

class DynamoDB {
  constructor(opts = { region: 'us-east-1' }) {
    this.client = new AWS.DynamoDB.DocumentClient(opts);
  }

  /**
   * Finds all items within the database regardless of category
   * @returns {Promise<DocumentClient.QueryOutput & {$response: Response<DocumentClient.QueryOutput, AWSError>}>}
   */
  async findAllItems() {
    const params = {
      TableName: DYNAMODB_TABLE_NAME,
      FilterExpression: 'begins_with(#sid, :item)',
      ExpressionAttributeNames: {
        '#sid': 'sid',
      },
      ExpressionAttributeValues: {
        ':item': 'item-',
      },
    };
    try {
      NODE_ENV !== 'test' && console.log('[INFO] Attempting to find all items...');
      const response = await this.client.scan(params).promise();
      NODE_ENV !== 'test' && console.log(`[INFO] Successfully found: ${response.Items.length} items.`);
      return response;
    } catch (err) {
      NODE_ENV !== 'test' && console.log('[ERROR] There was an error attempting to retrieve all items: ', err);
      throw new Error('There was an error attempting to retrieve all items.');
    }
  }

  /**
   * Finds all items that belong to a particular category
   * @param categoryId String category id to search for items under
   * @returns {Promise<ItemList>}
   */
  async findAllItemsByCategory(categoryId) {
    if (!categoryId) {
      console.log('[ERROR] Category Id is missing from the request parameters: Category Id = ', categoryId);
      throw new Error(`Category Id is missing from the request parameters: Category Id = ${categoryId}`);
    }

    const params = {
      TableName: DYNAMODB_TABLE_NAME,
      KeyConditionExpression: '#pid = :pid and begins_with(#sid, :sid)',
      ExpressionAttributeNames: {
        '#pid': 'pid',
        '#sid': 'sid',
      },
      ExpressionAttributeValues: {
        ':pid': categoryId,
        ':sid': 'item-',
      },
    };
    try {
      NODE_ENV !== 'test' && console.log('[INFO] Attempting to find all items for category: ', categoryId);
      const response = await this.client.query(params).promise();
      NODE_ENV !== 'test' && console.log(`[INFO] Successfully found: ${response.Items.length} items for category Id: ${categoryId}.`);
      return response;
    } catch (err) {
      NODE_ENV !== 'test' && console.log('[ERROR] There was an error attempting to retrieve all items for given category: ', categoryId, err);
      throw new Error(`There was an error attempting to retrieve all items for given category: ${categoryId}`);
    }
  }

  /**
   * Deletes items in DynamoDB in bulk
   * @param keys Array of strings
   * @returns {Promise<void>}
   */
  async bulkDelete(keys) {
    const params = {
      RequestItems: {
        [DYNAMODB_TABLE_NAME]: [],
      },
    };

    keys.forEach((key) => params.RequestItems[DYNAMODB_TABLE_NAME].push({
      DeleteRequest: {
        Key: {
          pid: key.pid,
          sid: key.sid,
        },
      },
    }));

    NODE_ENV !== 'test' && console.log('[INFO] DynamoDB Bulk Delete params: ', params);

    try {
      NODE_ENV !== 'test' && console.log('[INFO] Attempting to delete all items: ', keys);
      const response = await this.client.batchWrite(params).promise();
      NODE_ENV !== 'test' && console.log(`[INFO] Successfully deleted: ${keys.length} items.`);
      return response;
    } catch (e) {
      NODE_ENV !== 'test' && console.log('[ERROR] There was an error attempting to delete the specified items: ', keys, e);
      throw new Error(`There was an error attempting to delete the specified items: ${keys}`);
    }
  }

  /**
   * Increments or decrements a key within Dynamodb by one
   * @param key Object the pid and sid key in DynamoDB to update
   * @param increment Boolean true if we should increment the value and false otherwise
   * @returns {Promise<void>}
   */
  async update(key, increment = true) {
    const params = {
      TableName: DYNAMODB_TABLE_NAME,
      Key: key,
      UpdateExpression: 'set #quantity = #quantity + :val',
      ExpressionAttributeNames: { '#quantity': 'quantity' },
      ExpressionAttributeValues: {
        ':val': 1,
      },
      ReturnValues: 'UPDATED_NEW',
    };

    if (!increment) params.UpdateExpression = 'set #quantity = #quantity - :val';

    try {
      NODE_ENV !== 'test' && console.log('[INFO] Attempting to update item: ', key);
      const response = await this.client.update(params).promise();
      return response;
    } catch (e) {
      NODE_ENV !== 'test' && console.log('[ERROR] There was an error attempting to update the specified item: ', key, e);
      throw new Error(`There was an error attempting to update the specified item ${key}`);
    }
  }


  /**
   * Returns the underlying DynamoDB document client
   * used to make DDB calls to the table
   * @returns {DocumentClient}
   */
  getClient() {
    return this.client;
  }
}


module.exports = DynamoDB;
