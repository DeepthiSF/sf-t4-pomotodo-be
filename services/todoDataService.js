// Calling .config() will allow dotenv to pull environment variables from our .env file...
require('dotenv').config();
// const AWS = require('aws-sdk');
// ...made available from process.env
const TableName = process.env.TABLE_NAME;
// You'll need to call dynamoClient methods to envoke CRUD operations on the DynamoDB table
const dynamoClient = require('../db');
// uuid, useful for generating unique ids
const uuid = require("uuid");

module.exports = class TodoDataService {
  static async addTodo(todo) {
    const id = uuid.v4();
    todo.id = id;

    const params = {
      TableName, // "tododata"
    };

    try {
      // Check the "tododata" table for existing a tododata item 
      //let existingTodoData = documentClient.scan(params, function(err, date){
      //   if (err) console.log(err);
      //   else console.log(data);
      // });  
      //var documentClient = new AWS.DynamoDB.DocumentClient();

      // let existingTodoData = await dynamoClient.scan(params).promise()
      // .then((data)=>{
      //   if (err) console.log(err);
      //   else console.log(data);
      // });

      let existingTodoData = await dynamoClient.scan(params).promise()
        .then((data) => {
          console.log("Here", data)
          return data;
        })
        .catch((error) => {
          console.log(error)
        });

        //console.log("Here", existingTodoData)

      // no tododata exists yet
      if (existingTodoData.Items.length === 0) {
        const newTodoData = {
          id: "0",
          order: [],
          todos: {}
        };

        // Here 'tododataId' is the main id of the whole tododata item which in this case is '0'
       // newTodoData.id = "0";
        newTodoData.order.push(id);
        newTodoData.todos[id] = todo;

        // Add a new tododata placeholder item to the "tododata" table
        const params = {
          TableName,
          Item: newTodoData,
        }

        // Now add the new todo data to the deepthi-tododdata table in aws dynamo db
        await dynamoClient.put(params).promise()
          // .then((data) => {
          //   console.log(data);
            
          // })
          // .catch((error) => {
          //   console.log(error)
          // });
        // ...

        // We can use 'scan' or 'get' to get the items from the db
        // 'Scan' returns Items and 'get' returns item
        // The below method is using 'scan'
        existingTodoData = await dynamoClient.scan({ TableName }).promise()
          .then((data) => {
            return data.Items[0];
          })
          .catch((error) => {
            console.log(error)
          });
        // Return the newly created tododata item
        return existingTodoData;

         // The below method is using 'get'. 
        //  return await dynamoClient.get({ 
        //      TableName,
        //      Key: {
        //       id: "0"
        //      }
        //   }).promise()
        //   .then((data) => {
        //     console.log("Latest data:", data.Item);
        //     return data.Item;
        //   }).catch((error) => {
        //     console.log(error)
        //   });  

      } else { // a tododata item already exist
        existingTodoData = existingTodoData.Items[0];
        existingTodoData.order.push(id);
        existingTodoData.todos[id] = todo;

        // Replace the existing tododata item with the new one, created in the above three lines
        const params = {
          TableName,
          Item: existingTodoData,
        }

        // Now add the new todo data to the deepthi-tododdata table in aws dynamo db
        await dynamoClient.put(params).promise()
          // .then((data) => {
          //   console.log(data);
          // })
          // .catch((error) => {
          //   console.log(error)
          // });
        // ...

        existingTodoData = await dynamoClient.scan({ TableName }).promise()
          .then((data) => {
            // console.log(data.Items[0]);
            // console.log(data.Items[0].order.length)
            return data.Items[0];
          })
          .catch((error) => {
            console.log(error)
          });
        // Return the newly created tododata item
        return existingTodoData;

      }
    } catch (error) {
        console.error(error);
      return error;
    }

  }

  static async getTodos() {
    try {
      // const params = {
      //   TableName,
      //   Key: {
      //     id: "0"
      //   }
      // }
      return await dynamoClient.scan({ TableName }).promise()
          .then((data) => {
            return data.Items[0];
          })
          .catch((error) => {
            console.log(error)
          });

      // Check the "tododata" table for the tododata item, and return it
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  static async updateOrder(options) {
    try {
      const params = {
        TableName,
        Key: {
          id: "0"
        },
        // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.html
        
        // Setting a name to the current attribute that u want to update. In this case we want to update the 'order'
        ExpressionAttributeNames: {
          "#oldOrder": "order"
        }, 
         // Setting an attribute name for the new order value (options.order) with which we want to update the current attribute 'order'   
        ExpressionAttributeValues: {
          ":newOrder": options.order
        },
        // Update the current attribute with the new attribute value
        UpdateExpression: "set #oldOrder = :newOrder"
      }

      await dynamoClient.update(params).promise();

      // Update the tododata item
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  static async updateTodo(id, options) {
    try {
      let params = {
        TableName,
        Key: {
          id: "0"
        }
        
      }

      // Check the "tododata" table for the tododata item, and set it to "existingTodo"
      // let existingTodo = ...

      for (let key in options) {
        existingTodo.todos[id][key] = options[key];
      }

      params = {
        TableName,
        Item: {
          ...existingTodo
        }
      }

      // Replace the existing tododata item with the updated one
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  static async deleteTodo(id) {
    try {
      let params = {
        TableName,
        Key: {
          id: "0"
        }
      }

      // Check the "tododata" table for the tododata item, and set it to "existingTodo"
      // let existingTodo = ...

      existingTodo.order = existingTodo.order.filter((orderId) => {
        return orderId !== id
      });

      delete existingTodo.todos[id];

      params = {
        TableName,
        Item: {
          ...existingTodo
        }
      }

      // Replace the existing tododata item with the updated one
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  static async deleteCompletedTodos() {
    try {
      let params = {
        TableName,
        Key: {
          id: "0"
        }
      }

      let existingTodo = await dynamoClient.scan(params).promise().then((data) => {
        return data.Items[0];
      });

      existingTodo.order = existingTodo.order.filter((orderId) => {
        return !existingTodo.todos[orderId].completed;
      });
      for (let id in existingTodo.todos) {
        if (existingTodo.todos[id].completed) {
          delete existingTodo.todos[id];
        }
      }

      params = {
        TableName,
        Item: {
          ...existingTodo
        }
      }

      await dynamoClient.put(params).promise();
    } catch (error) {
      console.error(error);
      return error;
    }
  }
};
