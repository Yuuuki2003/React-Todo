const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const docClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'todos';

exports.handler = async (event) => {
  const method = event.httpMethod;
  const path = event.path;
  const user =
    event.requestContext?.authorizer?.claims?.sub || // REST API
    event.requestContext?.authorizer?.jwt?.claims?.sub; // HTTP API

  if (!method || !path || !user) {
    console.error('Invalid request context:', JSON.stringify(event));
    return response(400, { error: 'Invalid request context' });
  }

  try {
    if (method === 'GET' && path === '/todos') {
      const data = await docClient
        .query({
          TableName: TABLE_NAME,
          KeyConditionExpression: '#u = :u',
          ExpressionAttributeNames: {
            '#u': 'user',
          },
          ExpressionAttributeValues: {
            ':u': user,
          },
        })
        .promise();

      return response(200, data.Items);
    }

    if (method === 'POST' && path === '/todos') {
      const { title } = JSON.parse(event.body);
      const newItem = {
        user,
        id: Date.now().toString(),
        title,
        completed: false,
      };

      await docClient
        .put({
          TableName: TABLE_NAME,
          Item: newItem,
        })
        .promise();

      return response(200, newItem);
    }

    if (method === 'PUT' && path.match(/^\/todos\/\w+$/)) {
      const id = path.split('/')[2];
      const { completed } = JSON.parse(event.body);

      await docClient
        .update({
          TableName: TABLE_NAME,
          Key: { user, id },
          UpdateExpression: 'set completed = :c',
          ExpressionAttributeValues: {
            ':c': completed,
          },
        })
        .promise();

      return response(200, { id, completed });
    }

    if (method === 'DELETE' && path.match(/^\/todos\/\w+$/)) {
      const id = path.split('/')[2];

      await docClient
        .delete({
          TableName: TABLE_NAME,
          Key: { user, id },
        })
        .promise();

      return response(200, { id });
    }

    return response(400, { error: 'Unsupported operation' });
  } catch (err) {
    console.error('DynamoDB Error:', err);
    return response(500, { error: err.message });
  }
};

const response = (statusCode, body) => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
  },
  body: JSON.stringify(body),
});
